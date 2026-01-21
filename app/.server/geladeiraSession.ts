import { createCookieSessionStorage, redirect } from "react-router";

type SessionData = {
	userId?: string;
};

const sessionSecret =
	process.env.SESSION_SECRET ??
	process.env.GELADEIRA_SESSION_SECRET ??
	"dev-session-secret";

export const geladeiraSessionStorage = createCookieSessionStorage<SessionData>({
	cookie: {
		name: "taqui_geladeira",
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secrets: [sessionSecret],
		secure: process.env.GELADEIRA_COOKIE_SECURE === "true",
	},
});

export async function getGeladeiraSession(request: Request) {
	const cookie = request.headers.get("Cookie");
	return geladeiraSessionStorage.getSession(cookie);
}

export async function requireGeladeiraUserId(request: Request) {
	const session = await getGeladeiraSession(request);
	const userId = session.get("userId");
	if (typeof userId !== "string" || userId.length === 0) {
		const url = new URL(request.url);
		const returnTo = `${url.pathname}${url.search}`;
		throw redirect(`/geladeira/login?redirectTo=${encodeURIComponent(returnTo)}`);
	}
	return userId;
}

export async function commitGeladeiraSession(session: Awaited<ReturnType<typeof getGeladeiraSession>>) {
	return geladeiraSessionStorage.commitSession(session);
}

export async function destroyGeladeiraSession(session: Awaited<ReturnType<typeof getGeladeiraSession>>) {
	return geladeiraSessionStorage.destroySession(session);
}
