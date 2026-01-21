import { readFileSync } from "node:fs";

export type GeladeiraConfig = {
	fridges: Array<{ id: string; name: string }>;
	users: Array<{
		id: string;
		displayName: string;
		username: string;
		password: string;
		pixKey: string;
		fridgeIds: string[];
	}>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function expectString(value: unknown, field: string) {
	if (typeof value !== "string") throw new Error(`Campo "${field}" inválido.`);
	return value;
}

function expectStringArray(value: unknown, field: string) {
	if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
		throw new Error(`Campo "${field}" inválido.`);
	}
	return value as string[];
}

let cachedConfig: GeladeiraConfig | null = null;

export function loadGeladeiraConfig(): GeladeiraConfig {
	const shouldCache = process.env.NODE_ENV === "production";
	if (shouldCache && cachedConfig) return cachedConfig;

	const configPath =
		process.env.GELADEIRA_CONFIG_PATH ??
		process.env.FRIDGE_CONFIG_PATH ??
		"./config/geladeira.json";

	let raw: string;
	try {
		raw = readFileSync(configPath, "utf8");
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			raw = readFileSync("./config/geladeira.example.json", "utf8");
		} else {
			throw new Error(
				`Config da geladeira não encontrada em "${configPath}". Crie o arquivo (base: config/geladeira.example.json) e configure GELADEIRA_CONFIG_PATH.`,
			);
		}
	}

	const parsed = JSON.parse(raw) as unknown;
	if (!isRecord(parsed)) throw new Error("Config da geladeira inválida.");

	const fridgesRaw = parsed.fridges;
	const usersRaw = parsed.users;
	if (!Array.isArray(fridgesRaw) || !Array.isArray(usersRaw)) {
		throw new Error('Config da geladeira precisa ter "fridges" e "users".');
	}

	const fridges = fridgesRaw.map((entry, index) => {
		if (!isRecord(entry)) throw new Error(`Fridge[${index}] inválida.`);
		return {
			id: expectString(entry.id, `fridges[${index}].id`),
			name: expectString(entry.name, `fridges[${index}].name`),
		};
	});

	const users = usersRaw.map((entry, index) => {
		if (!isRecord(entry)) throw new Error(`User[${index}] inválido.`);
		return {
			id: expectString(entry.id, `users[${index}].id`),
			displayName: expectString(entry.displayName, `users[${index}].displayName`),
			username: expectString(entry.username, `users[${index}].username`),
			password: expectString(entry.password, `users[${index}].password`),
			pixKey: expectString(entry.pixKey, `users[${index}].pixKey`),
			fridgeIds: expectStringArray(entry.fridgeIds, `users[${index}].fridgeIds`),
		};
	});

	if (fridges.length === 0) throw new Error("Config da geladeira sem fridges.");
	if (users.length === 0) throw new Error("Config da geladeira sem users.");

	const fridgeIdSet = new Set(fridges.map((fridge) => fridge.id));
	const normalizedUsers = users.map((user) => {
		const validFridgeIds = user.fridgeIds.filter((id) => fridgeIdSet.has(id));

		if (validFridgeIds.length === 0) {
			if (process.env.NODE_ENV !== "production") {
				console.warn(
					`[geladeira] Usuário "${user.id}" sem fridges válidas (fridgeIds: ${JSON.stringify(
						user.fridgeIds,
					)}). Em dev, liberando acesso a todas: ${JSON.stringify(
						fridges.map((fridge) => fridge.id),
					)}.`,
				);
				return { ...user, fridgeIds: fridges.map((fridge) => fridge.id) };
			}
			throw new Error(
				`Usuário "${user.id}" não tem acesso a nenhuma geladeira válida. Verifique "users[].fridgeIds" e "fridges[].id".`,
			);
		}

		if (validFridgeIds.length !== user.fridgeIds.length) {
			const invalid = user.fridgeIds.filter((id) => !fridgeIdSet.has(id));
			if (process.env.NODE_ENV !== "production") {
				console.warn(
					`[geladeira] Usuário "${user.id}" com fridgeIds inválidas ignoradas: ${JSON.stringify(
						invalid,
					)}.`,
				);
			} else {
				throw new Error(
					`Usuário "${user.id}" tem fridgeIds inválidas: ${JSON.stringify(invalid)}.`,
				);
			}
		}

		return { ...user, fridgeIds: validFridgeIds };
	});

	const config = { fridges, users: normalizedUsers };
	if (shouldCache) cachedConfig = config;
	return config;
}

export function findGeladeiraUserByUsername(username: string) {
	const config = loadGeladeiraConfig();
	const normalized = username.trim().toLowerCase();
	return config.users.find((user) => user.username.toLowerCase() === normalized) ?? null;
}

export function findGeladeiraUserById(userId: string) {
	const config = loadGeladeiraConfig();
	return config.users.find((user) => user.id === userId) ?? null;
}
