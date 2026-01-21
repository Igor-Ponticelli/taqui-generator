import { useEffect, useState } from "react";
import {
	CaretDownIcon,
	CopyIcon,
	CreditCardIcon,
	HouseIcon,
	LockOpenIcon,
	QrCodeIcon,
	ShoppingCartIcon,
	SignOutIcon,
	StorefrontIcon,
	TagIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Form, Link, useActionData, useLoaderData, useSearchParams } from "react-router";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";

type GeladeiraShopItem = {
	id: string;
	name: string;
	quantity: number;
	forSale: boolean;
	priceCents: number | null;
	ownerId: string;
	ownerName: string;
	ownerPixKey: string;
	ownerHasPixQr: boolean;
	ownerPixQrVersion: string | null;
	hasImage: boolean;
};

type LoaderData = {
	fridges: Array<{ id: string; name: string }>;
	selectedFridgeId: string;
	items: GeladeiraShopItem[];
	user: { id: string; displayName: string } | null;
};

type ActionData =
	| { ok: true; kind: "withdraw"; itemId: string; message: string }
	| { ok: false; error: string };

function formatMoney(priceCents: number) {
	return (priceCents / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function GeladeiraShopPage() {
	const data = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData | undefined;
	const toast = useToast();
	const [searchParams, setSearchParams] = useSearchParams();

	const [selectedItem, setSelectedItem] = useState<GeladeiraShopItem | null>(null);
	const [showPayment, setShowPayment] = useState(false);

	const handleSelectFridge = (fridgeId: string) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("fridge", fridgeId);
				return next;
			},
			{ replace: true },
		);
	};

	const withdraw = (item: GeladeiraShopItem) => {
		if (item.forSale) {
			setSelectedItem(item);
			setShowPayment(true);
			return;
		}
		setSelectedItem(item);
		setShowPayment(false);
	};

	const copyPixKey = async () => {
		if (!selectedItem) return;
		try {
			await navigator.clipboard.writeText(selectedItem.ownerPixKey);
		} catch {
			// ignore
		}
	};

	useEffect(() => {
		if (!actionData) return;
		if ("ok" in actionData && actionData.ok) {
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: actionData.message,
			});
			setSelectedItem(null);
			setShowPayment(false);
			return;
		}

		if (actionData && "ok" in actionData && !actionData.ok) {
			toast({
				...taquiToastPresets.error,
				title: "DEU RUIM!",
				message: actionData.error,
			});
		}
	}, [actionData, toast]);

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-[700px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								<StorefrontIcon className="h-7 w-7 text-black" weight="bold" />
							</div>
							<div className="flex flex-col">
								<p className="text-2xl font-bold leading-8">Geladeira</p>
								<p className="text-sm leading-5 text-black/70">
									{data.user ? `Logado como ${data.user.displayName}` : "Você não está logado"}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							{data.user ? (
								<>
									<Link
										to="/geladeira/admin"
										className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
									>
										<UserIcon className="h-5 w-5" weight="bold" />
										Administrar
									</Link>
									<Form method="post">
										<input type="hidden" name="intent" value="logout" />
										<button
											type="submit"
											className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
										>
											<SignOutIcon className="h-5 w-5" weight="bold" />
											Sair
										</button>
									</Form>
								</>
							) : (
								<Link
									to={`/geladeira/admin?fridge=${encodeURIComponent(data.selectedFridgeId)}`}
									className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<LockOpenIcon className="h-5 w-5" weight="bold" />
									Entrar
								</Link>
							)}
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
						<label className="text-lg font-bold" htmlFor="fridge-select">
							Escolher geladeira
						</label>
						<div className="relative flex h-12 w-full items-center gap-2 rounded-lg border-2 border-black bg-[#47B8FF] px-4 font-bold text-black shadow-[2px_2px_0_#000000] sm:flex-1">
							<HouseIcon className="h-5 w-5 shrink-0" weight="bold" />
							<select
								id="fridge-select"
								value={data.selectedFridgeId}
								onChange={(event) => handleSelectFridge(event.target.value)}
								className="h-full w-full flex-1 appearance-none bg-transparent pr-8 text-lg font-bold text-black focus:outline-none cursor-pointer"
							>
								{data.fridges.map((fridge) => (
									<option key={fridge.id} value={fridge.id}>
										{fridge.name}
									</option>
								))}
							</select>
							<CaretDownIcon
								className="pointer-events-none absolute right-3 h-5 w-5"
								weight="bold"
							/>
						</div>
					</div>
				</div>

				<div className="w-full max-w-[700px] overflow-hidden rounded-lg border-2 border-black bg-white font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
						<p className="text-xl font-bold leading-7">Itens</p>
						<div className="flex items-center gap-2 text-sm text-black/70">
							<ShoppingCartIcon className="h-5 w-5" />
							{data.items.length}
						</div>
					</div>

					{data.items.length === 0 ? (
						<div className="p-6 text-center text-black/70">
							Nada aqui ainda. Volta mais tarde ou cobra o povo.
						</div>
					) : (
						<div className="flex flex-col">
							{data.items.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-4 border-b-2 border-black px-4 py-4 sm:px-6"
								>
									<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000000]">
										{item.hasImage ? (
											<img
												src={`/api/geladeira/item-image/${item.id}`}
												alt={item.name}
												className="h-full w-full object-cover"
												loading="lazy"
											/>
										) : (
											<TagIcon className="h-7 w-7 text-black/70" />
										)}
									</div>

									<div className="min-w-0 flex-1">
										<p className="truncate text-lg font-bold leading-7">{item.name}</p>
										<p className="text-sm leading-5 text-black/70">
											Dono: <span className="font-semibold">{item.ownerName}</span> • Qty:{" "}
											<span className="font-semibold">{item.quantity}</span>
										</p>
										{item.forSale && item.priceCents != null && (
											<p className="mt-1 inline-flex items-center gap-2 rounded-full border border-black bg-[#FFF129] px-3 py-1 text-sm font-bold shadow-[2px_2px_0_#000000]">
												<CreditCardIcon className="h-4 w-4" weight="bold" />
												{formatMoney(item.priceCents)}
											</p>
										)}
									</div>

									{item.forSale ? (
										<button
											type="button"
											onClick={() => {
												withdraw(item);
											}}
											className="flex h-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
										>
											Retirar
										</button>
									) : (
										<Form method="post" className="shrink-0">
											<input type="hidden" name="intent" value="withdraw" />
											<input type="hidden" name="itemId" value={item.id} />
											<button
												type="submit"
												className="flex h-11 items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
											>
												Retirar
											</button>
										</Form>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{selectedItem && showPayment && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
					<div className="w-full max-w-[700px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[6px_6px_0_#000000] sm:p-6">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-2xl font-bold leading-8">Item à venda</p>
								<p className="mt-1 text-sm leading-5 text-black/70">
									{selectedItem.name} • {selectedItem.ownerName}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setSelectedItem(null)}
								className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								aria-label="Fechar"
							>
								×
							</button>
						</div>

						<div
							className={`mt-6 grid gap-6 ${selectedItem.ownerHasPixQr ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}
						>
							{selectedItem.ownerHasPixQr && (
								<div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000000]">
									<p className="text-lg font-bold leading-7">Pix (QR do banco)</p>
									<div className="mt-3 flex items-center justify-center rounded-lg border-2 border-black bg-white p-3">
										<img
											src={`/api/geladeira/qr/${selectedItem.ownerId}?v=${encodeURIComponent(
												selectedItem.ownerPixQrVersion ?? "0",
											)}`}
											alt="QR Code Pix"
											className="h-[220px] w-[220px] object-contain"
										/>
									</div>
									<p className="mt-3 text-sm text-black/70">
										Escaneia e paga. Depois confirma a retirada.
									</p>
								</div>
							)}

							<div className="rounded-lg border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000000]">
								<p className="text-lg font-bold leading-7">Chave Pix</p>
										<p className="mt-2 break-all rounded-lg border-2 border-black bg-[#47B8FF] p-3 font-bold shadow-[2px_2px_0_#000000]">
											{selectedItem.ownerPixKey}
										</p>
										<button
											type="button"
											onClick={() => void copyPixKey()}
									className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
								>
									<CopyIcon className="h-5 w-5" weight="bold" />
									Copiar chave
								</button>

								<div className="mt-6 flex items-center gap-2 text-black/70">
									<QrCodeIcon className="h-5 w-5" />
									<p className="text-sm">
										{selectedItem.ownerHasPixQr
											? "O QR e a chave vêm do dono do item."
											: "Sem QR cadastrado. Paga copiando a chave."}
									</p>
								</div>
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={() => setSelectedItem(null)}
								className="flex h-11 w-full items-center justify-center rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] sm:w-auto"
							>
								Cancelar
							</button>
							<Form method="post">
								<input type="hidden" name="intent" value="withdraw" />
								<input type="hidden" name="itemId" value={selectedItem.id} />
								<input type="hidden" name="confirmed" value="true" />
								<button
									type="submit"
									className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] sm:w-auto"
								>
									<QrCodeIcon className="h-5 w-5" weight="bold" />
									Confirmar retirada
								</button>
							</Form>
						</div>
					</div>
				</div>
			)}
		</PageShell>
	);
}
