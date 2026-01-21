import { existsSync, mkdirSync, statSync } from "node:fs";
import { unlink, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const allowedUserId = /^[a-zA-Z0-9_-]+$/;

export type PixQrFile = {
	path: string;
	contentType: string;
};

function ensureDir(path: string) {
	mkdirSync(path, { recursive: true });
}

export function getPixQrDir() {
	return process.env.GELADEIRA_PIX_QR_DIR ?? "./data/geladeira/pix-qrcodes";
}

function getLegacyGeneratedQrDir() {
	return process.env.GELADEIRA_QR_DIR ?? "./data/geladeira/qrcodes";
}

export function assertSafeUserId(userId: string) {
	if (!allowedUserId.test(userId)) {
		throw new Error("userId inválido.");
	}
}

function extForFile(file: File): { ext: string; contentType: string } | null {
	const type = file.type.toLowerCase();
	if (type === "image/png") return { ext: "png", contentType: "image/png" };
	if (type === "image/jpeg") return { ext: "jpg", contentType: "image/jpeg" };
	if (type === "image/webp") return { ext: "webp", contentType: "image/webp" };
	return null;
}

function contentTypeForExt(ext: string) {
	if (ext === "png") return "image/png";
	if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
	if (ext === "webp") return "image/webp";
	return "application/octet-stream";
}

export function findPixQrForUser(userId: string): PixQrFile | null {
	assertSafeUserId(userId);

	const dir = getPixQrDir();
	const candidates = ["png", "jpg", "jpeg", "webp"].map((ext) => ({
		path: join(dir, `${userId}.${ext}`),
		ext,
	}));

	for (const candidate of candidates) {
		if (existsSync(candidate.path)) {
			return { path: candidate.path, contentType: contentTypeForExt(candidate.ext) };
		}
	}

	return null;
}

export function hasPixQrForUser(userId: string) {
	return findPixQrForUser(userId) != null;
}

export function getPixQrCacheKeyForUser(userId: string) {
	const file = findPixQrForUser(userId);
	if (!file) return null;
	try {
		const stat = statSync(file.path);
		return `${stat.mtimeMs}-${stat.size}`;
	} catch {
		return null;
	}
}

async function cleanupLegacyGeneratedQr(userId: string) {
	const legacyPath = join(getLegacyGeneratedQrDir(), `${userId}.png`);
	if (!existsSync(legacyPath)) return;
	try {
		await unlink(legacyPath);
	} catch {
		// ignore
	}
}

export async function deletePixQrForUser(userId: string) {
	assertSafeUserId(userId);
	const existing = findPixQrForUser(userId);
	if (!existing) return;
	try {
		await unlink(existing.path);
	} catch {
		// ignore
	}
	await cleanupLegacyGeneratedQr(userId);
}

export async function savePixQrForUser(userId: string, file: File): Promise<PixQrFile> {
	assertSafeUserId(userId);
	const info = extForFile(file);
	if (!info) throw new Error("Formato inválido. Envie PNG, JPG ou WEBP.");

	const dir = getPixQrDir();
	ensureDir(dir);

	// Remove previous versions.
	await Promise.all(
		["png", "jpg", "jpeg", "webp"].map(async (ext) => {
			const path = join(dir, `${userId}.${ext}`);
			if (!existsSync(path)) return;
			try {
				await unlink(path);
			} catch {
				// ignore
			}
		}),
	);

	const path = join(dir, `${userId}.${info.ext}`);
	ensureDir(dirname(path));
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path, buffer);
	await cleanupLegacyGeneratedQr(userId);
	return { path, contentType: info.contentType };
}

export async function readPixQrBytes(file: PixQrFile) {
	const buffer = await readFile(file.path);
	return new Uint8Array(buffer);
}
