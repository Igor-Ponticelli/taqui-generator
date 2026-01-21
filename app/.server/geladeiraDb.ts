import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";

export type GeladeiraItem = {
	id: string;
	fridgeId: string;
	ownerId: string;
	name: string;
	quantity: number;
	forSale: boolean;
	priceCents: number | null;
	imagePath: string | null;
	createdAt: number;
	updatedAt: number;
};

export type GeladeiraEvent = {
	id: number;
	kind: "withdraw" | "sale";
	fridgeId: string;
	itemId: string;
	ownerId: string;
	priceCents: number | null;
	createdAt: number;
};

let db: Database | null = null;

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

function getDbPath() {
	return (
		process.env.GELADEIRA_DB_PATH ??
		process.env.FRIDGE_DB_PATH ??
		"./data/geladeira/geladeira.db"
	);
}

export function getGeladeiraDb() {
	if (db) return db;
	const path = getDbPath();
	ensureDir(dirname(path));
	db = new Database(path);

	db.run(`
		CREATE TABLE IF NOT EXISTS fridges (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL
		);
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS items (
			id TEXT PRIMARY KEY,
			fridgeId TEXT NOT NULL,
			ownerId TEXT NOT NULL,
			name TEXT NOT NULL,
			quantity INTEGER NOT NULL,
			forSale INTEGER NOT NULL DEFAULT 0,
			priceCents INTEGER,
			imagePath TEXT,
			createdAt INTEGER NOT NULL,
			updatedAt INTEGER NOT NULL
		);
	`);

	db.run(`
		CREATE TABLE IF NOT EXISTS events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			kind TEXT NOT NULL,
			fridgeId TEXT NOT NULL,
			itemId TEXT NOT NULL,
			ownerId TEXT NOT NULL,
			priceCents INTEGER,
			createdAt INTEGER NOT NULL
		);
	`);

	db.run("CREATE INDEX IF NOT EXISTS idx_items_fridge ON items (fridgeId);");
	db.run("CREATE INDEX IF NOT EXISTS idx_items_owner ON items (ownerId);");
	db.run("CREATE INDEX IF NOT EXISTS idx_events_owner ON events (ownerId);");
	db.run("CREATE INDEX IF NOT EXISTS idx_events_fridge ON events (fridgeId);");

	return db;
}

export function upsertFridges(fridges: Array<{ id: string; name: string }>) {
	const db = getGeladeiraDb();
	const stmt = db.prepare("INSERT OR REPLACE INTO fridges (id, name) VALUES (?, ?)");
	const tx = db.transaction((rows: Array<{ id: string; name: string }>) => {
		rows.forEach((row) => stmt.run(row.id, row.name));
	});
	tx(fridges);
}

export function listFridges(): Array<{ id: string; name: string }> {
	const db = getGeladeiraDb();
	return db.query("SELECT id, name FROM fridges ORDER BY name").all() as Array<{
		id: string;
		name: string;
	}>;
}

export function listItemsByFridge(fridgeId: string): GeladeiraItem[] {
	const db = getGeladeiraDb();
	return db
		.query(
			`SELECT id, fridgeId, ownerId, name, quantity, forSale, priceCents, imagePath, createdAt, updatedAt
			 FROM items
			 WHERE fridgeId = ? AND quantity > 0
			 ORDER BY updatedAt DESC`,
		)
		.all(fridgeId)
		.map((row: any) => ({
			...row,
			forSale: Boolean(row.forSale),
			priceCents: row.priceCents == null ? null : Number(row.priceCents),
			quantity: Number(row.quantity),
			createdAt: Number(row.createdAt),
			updatedAt: Number(row.updatedAt),
		})) as GeladeiraItem[];
}

export function listItemsByOwner(fridgeId: string, ownerId: string): GeladeiraItem[] {
	const db = getGeladeiraDb();
	return db
		.query(
			`SELECT id, fridgeId, ownerId, name, quantity, forSale, priceCents, imagePath, createdAt, updatedAt
			 FROM items
			 WHERE fridgeId = ? AND ownerId = ?
			 ORDER BY updatedAt DESC`,
		)
		.all(fridgeId, ownerId)
		.map((row: any) => ({
			...row,
			forSale: Boolean(row.forSale),
			priceCents: row.priceCents == null ? null : Number(row.priceCents),
			quantity: Number(row.quantity),
			createdAt: Number(row.createdAt),
			updatedAt: Number(row.updatedAt),
		})) as GeladeiraItem[];
}

export function getItemById(itemId: string): GeladeiraItem | null {
	const db = getGeladeiraDb();
	const row = db
		.query(
			`SELECT id, fridgeId, ownerId, name, quantity, forSale, priceCents, imagePath, createdAt, updatedAt
			 FROM items WHERE id = ?`,
		)
		.get(itemId) as any;
	if (!row) return null;
	return {
		...row,
		forSale: Boolean(row.forSale),
		priceCents: row.priceCents == null ? null : Number(row.priceCents),
		quantity: Number(row.quantity),
		createdAt: Number(row.createdAt),
		updatedAt: Number(row.updatedAt),
	} as GeladeiraItem;
}

export function insertItem(item: Omit<GeladeiraItem, "createdAt" | "updatedAt">) {
	const db = getGeladeiraDb();
	const now = Date.now();
	db.run(
		`INSERT INTO items (id, fridgeId, ownerId, name, quantity, forSale, priceCents, imagePath, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			item.id,
			item.fridgeId,
			item.ownerId,
			item.name,
			item.quantity,
			item.forSale ? 1 : 0,
			item.priceCents,
			item.imagePath,
			now,
			now,
		],
	);
}

export function updateItem(item: Pick<GeladeiraItem, "id" | "ownerId" | "name" | "quantity" | "forSale" | "priceCents" | "imagePath">) {
	const db = getGeladeiraDb();
	const now = Date.now();
	db.run(
		`UPDATE items
		 SET name = ?, quantity = ?, forSale = ?, priceCents = ?, imagePath = ?, updatedAt = ?
		 WHERE id = ? AND ownerId = ?`,
		[
			item.name,
			item.quantity,
			item.forSale ? 1 : 0,
			item.priceCents,
			item.imagePath,
			now,
			item.id,
			item.ownerId,
		],
	);
}

export function deleteItem(itemId: string, ownerId: string) {
	const db = getGeladeiraDb();
	db.run("DELETE FROM items WHERE id = ? AND ownerId = ?", [itemId, ownerId]);
}

export function withdrawOne(itemId: string): { ok: true; item: GeladeiraItem } | { ok: false; error: string } {
	const db = getGeladeiraDb();
	const item = getItemById(itemId);
	if (!item) return { ok: false, error: "Item não encontrado." };
	if (item.quantity <= 0) return { ok: false, error: "Esse item já acabou." };

	const nextQty = item.quantity - 1;
	const now = Date.now();
	db.run("UPDATE items SET quantity = ?, updatedAt = ? WHERE id = ?", [nextQty, now, itemId]);

	const kind: GeladeiraEvent["kind"] = item.forSale ? "sale" : "withdraw";
	db.run(
		`INSERT INTO events (kind, fridgeId, itemId, ownerId, priceCents, createdAt)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		[kind, item.fridgeId, item.id, item.ownerId, item.forSale ? item.priceCents : null, now],
	);

	return { ok: true, item: { ...item, quantity: nextQty, updatedAt: now } };
}

export function getStatsForOwner(ownerId: string) {
	const db = getGeladeiraDb();
	const rows = db
		.query(
			`SELECT kind, COUNT(*) as count, COALESCE(SUM(priceCents), 0) as sum
			 FROM events
			 WHERE ownerId = ?
			 GROUP BY kind`,
		)
		.all(ownerId) as Array<{ kind: string; count: number; sum: number }>;

	let withdrawCount = 0;
	let saleCount = 0;
	let saleSumCents = 0;

	rows.forEach((row) => {
		if (row.kind === "withdraw") withdrawCount = Number(row.count);
		if (row.kind === "sale") {
			saleCount = Number(row.count);
			saleSumCents = Number(row.sum);
		}
	});

	return { withdrawCount, saleCount, saleSumCents };
}

