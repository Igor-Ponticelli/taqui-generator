import { redirect, type MetaFunction } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { GeladeiraShopPage } from "../features/geladeira/GeladeiraShopPage";
import { loadGeladeiraConfig } from "../.server/geladeiraConfig";
import { listItemsByFridge, upsertFridges } from "../.server/geladeiraDb";
import { getPixQrCacheKeyForUser, hasPixQrForUser } from "../.server/geladeiraPixQr";
import {
	destroyGeladeiraSession,
	getGeladeiraSession,
} from "../.server/geladeiraSession";
import { getItemById, withdrawOne } from "../.server/geladeiraDb";

export const meta: MetaFunction = () => [
	{ title: "Táqui Tua Geladeira" },
	{
		name: "description",
		content: "Controle de itens da geladeira: shop, pix e administração.",
	},
];

export async function loader({ request }: LoaderFunctionArgs) {
	const config = loadGeladeiraConfig();
	upsertFridges(config.fridges);

	const url = new URL(request.url);
	const fridgeParam = url.searchParams.get("fridge");
	const selectedFridgeId =
		(fridgeParam && config.fridges.some((fridge) => fridge.id === fridgeParam)
			? fridgeParam
			: config.fridges[0]?.id) ?? "principal";

	const userMap = new Map(
		config.users.map((user) => [
			user.id,
			{
				id: user.id,
				displayName: user.displayName,
				pixKey: user.pixKey,
				hasPixQr: hasPixQrForUser(user.id),
				pixQrVersion: getPixQrCacheKeyForUser(user.id),
			},
		]),
	);

	const session = await getGeladeiraSession(request);
	const userId = session.get("userId");
	const sessionUser =
		typeof userId === "string" ? (userMap.get(userId) ?? null) : null;

	const items = listItemsByFridge(selectedFridgeId).map((item) => {
		const owner = userMap.get(item.ownerId);
		return {
			id: item.id,
			name: item.name,
			quantity: item.quantity,
			forSale: item.forSale,
			priceCents: item.priceCents,
			ownerId: item.ownerId,
			ownerName: owner?.displayName ?? item.ownerId,
			ownerPixKey: owner?.pixKey ?? "",
			ownerHasPixQr: owner?.hasPixQr ?? false,
			ownerPixQrVersion: owner?.pixQrVersion ?? null,
			hasImage: Boolean(item.imagePath),
		};
	});

	return {
		fridges: config.fridges,
		selectedFridgeId,
		items,
		user: sessionUser
			? { id: sessionUser.id, displayName: sessionUser.displayName }
			: null,
	};
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "logout") {
		const session = await getGeladeiraSession(request);
		return redirect("/geladeira", {
			headers: { "Set-Cookie": await destroyGeladeiraSession(session) },
		});
	}

	if (intent !== "withdraw") {
		return { ok: false, error: "Ação inválida." } as const;
	}

	const itemId = formData.get("itemId");
	if (typeof itemId !== "string" || itemId.length === 0) {
		return { ok: false, error: "Item inválido." } as const;
	}

	const confirmed = formData.get("confirmed");
	const current = getItemById(itemId);
	if (!current) return { ok: false, error: "Item não encontrado." } as const;

	if (current.forSale && confirmed !== "true") {
		return {
			ok: false,
			error: "Esse item está à venda. Abra o pagamento e confirme a retirada.",
		} as const;
	}

	const result = withdrawOne(itemId);
	if (!result.ok) return { ok: false, error: result.error } as const;

	return {
		ok: true,
		kind: "withdraw",
		itemId,
		message: result.item.forSale
			? "Retirada registrada. Agora é com seu Pix."
			: "Retirado. Vai com Deus e com fome.",
	} as const;
}

export default function GeladeiraIndexRoute() {
	return <GeladeiraShopPage />;
}
