import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { findGeladeiraUserById } from "../.server/geladeiraConfig";
import { getStatsForOwner } from "../.server/geladeiraDb";
import { requireGeladeiraUserId } from "../.server/geladeiraSession";
import { GeladeiraStatsPage } from "../features/geladeira/GeladeiraStatsPage";

export const meta: MetaFunction = () => [{ title: "Táqui Tua Geladeira - Stats" }];

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireGeladeiraUserId(request);
	const user = findGeladeiraUserById(userId);
	if (!user) {
		return {
			user: { id: userId, displayName: userId },
			withdrawCount: 0,
			saleCount: 0,
			saleSumCents: 0,
		};
	}
	const stats = getStatsForOwner(user.id);
	return {
		user: { id: user.id, displayName: user.displayName },
		...stats,
	};
}

export default function GeladeiraStatsRoute() {
	return <GeladeiraStatsPage />;
}

