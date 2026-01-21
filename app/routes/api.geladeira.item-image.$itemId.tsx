import { readFile } from "node:fs/promises";
import type { LoaderFunctionArgs } from "react-router";
import { getItemById } from "../.server/geladeiraDb";

function contentTypeFromPath(path: string) {
	const lower = path.toLowerCase();
	if (lower.endsWith(".png")) return "image/png";
	if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
	if (lower.endsWith(".webp")) return "image/webp";
	return "application/octet-stream";
}

export async function loader({ params }: LoaderFunctionArgs) {
	const itemId = params.itemId;
	if (!itemId) return new Response("Missing itemId", { status: 400 });

	const item = getItemById(itemId);
	if (!item?.imagePath) return new Response("Not found", { status: 404 });

	try {
		const bytes = await readFile(item.imagePath);
		return new Response(new Uint8Array(bytes), {
			headers: {
				"Content-Type": contentTypeFromPath(item.imagePath),
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch {
		return new Response("Not found", { status: 404 });
	}
}
