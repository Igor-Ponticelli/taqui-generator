import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { findGeladeiraUserByUsername } from "../.server/geladeiraConfig";
import {
	commitGeladeiraSession,
	getGeladeiraSession,
} from "../.server/geladeiraSession";
import { GeladeiraLoginPage } from "../features/geladeira/GeladeiraLoginPage";

export const meta: MetaFunction = () => [{ title: "Táqui Tua Geladeira - Login" }];

function safeRedirect(to: string | null | undefined, fallback: string) {
	if (!to) return fallback;
	if (!to.startsWith("/")) return fallback;
	return to;
}

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getGeladeiraSession(request);
	const userId = session.get("userId");
	if (typeof userId === "string" && userId.length > 0) {
		const url = new URL(request.url);
		const redirectTo = safeRedirect(url.searchParams.get("redirectTo"), "/geladeira/admin");
		return redirect(redirectTo);
	}
	return null;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const username = formData.get("username");
	const password = formData.get("password");
	const redirectTo = safeRedirect(formData.get("redirectTo")?.toString(), "/geladeira/admin");

	if (typeof username !== "string" || typeof password !== "string") {
		return { ok: false, error: "Preenche usuário e senha." } as const;
	}

	const user = findGeladeiraUserByUsername(username);
	if (!user || user.password !== password) {
		return { ok: false, error: "Usuário ou senha inválidos." } as const;
	}

	const session = await getGeladeiraSession(request);
	session.set("userId", user.id);

	return redirect(redirectTo, {
		headers: { "Set-Cookie": await commitGeladeiraSession(session) },
	});
}

export default function GeladeiraLoginRoute() {
	return <GeladeiraLoginPage />;
}
