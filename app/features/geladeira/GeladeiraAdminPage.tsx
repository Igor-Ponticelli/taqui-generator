import { useEffect, useState } from "react";
import {
	CaretDownIcon,
	CameraIcon,
	CopyIcon,
	MoneyIcon,
	NotePencilIcon,
	PlusIcon,
	QrCodeIcon,
	SignOutIcon,
	StorefrontIcon,
	TrashIcon,
	UserIcon,
	PencilIcon,
} from "@phosphor-icons/react";
import { Form, Link, useActionData, useLoaderData, useSearchParams } from "react-router";
import { PageShell } from "../../components/PageShell";
import { taquiToastPresets, useToast } from "../../components/Toast";
import { GeladeiraEditModal } from "./GeladeiraEditModal";

type AdminItem = {
	id: string;
	name: string;
	quantity: number;
	forSale: boolean;
	priceCents: number | null;
	hasImage: boolean;
};

type LoaderData = {
	user: {
		id: string;
		displayName: string;
		pixKey: string;
		hasPixQr: boolean;
		pixQrVersion: string | null;
	};
	fridges: Array<{ id: string; name: string }>;
	selectedFridgeId: string;
	items: AdminItem[];
};

type ActionData =
	| { ok: true; message: string }
	| { ok: false; error: string };

type EditingItem = {
  id: string
  name: string
  quantity: number
  forSale: boolean
  priceCents: number | null
} | null

function formatMoney(priceCents: number) {
	return (priceCents / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export function GeladeiraAdminPage() {
	const data = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData | undefined;
	const toast = useToast();
	const [searchParams, setSearchParams] = useSearchParams();

	const [newForSale, setNewForSale] = useState(false);
	const [editingItem, setEditingItem] = useState<EditingItem>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)

	useEffect(() => {
		if (!actionData) return;
		if (actionData.ok) {
			setEditingItem(null)
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: actionData.message,
			});
			return;
		}
		toast({
			...taquiToastPresets.error,
			title: "DEU RUIM!",
			message: actionData.error,
		});
	}, [actionData, toast]);

	const setFridge = (fridgeId: string) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("fridge", fridgeId);
				return next;
			},
			{ replace: true },
		);
	};

	const copyPixKey = async () => {
		try {
			await navigator.clipboard.writeText(data.user.pixKey);
			toast({
				...taquiToastPresets.success,
				title: "TÁQUI!",
				message: "Chave Pix copiada.",
			});
		} catch {
			toast({
				...taquiToastPresets.error,
				title: "DEU RUIM!",
				message: "Não foi possível copiar a chave.",
			});
		}
	};

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-175 rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								<UserIcon className="h-7 w-7 text-black" weight="bold" />
							</div>
							<div className="flex flex-col">
								<p className="text-2xl font-bold leading-8">Admin</p>
								<p className="text-sm leading-5 text-black/70">
									{data.user.displayName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Link
								to="/geladeira/stats"
								className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
							>
								<NotePencilIcon className="h-5 w-5" weight="bold" />
								Stats
							</Link>
							<Link
								to="/geladeira"
								className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
							>
								<StorefrontIcon className="h-5 w-5" weight="bold" />
								Shop
							</Link>
							<Form method="post">
								<input type="hidden" name="intent" value="logout" />
								<button
									type="submit"
									className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
								>
									<SignOutIcon className="h-5 w-5" weight="bold" />
									Sair
								</button>
							</Form>
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
						<label className="text-lg font-bold" htmlFor="admin-fridge-select">
							Geladeira
						</label>
						<div className="relative flex h-12 w-full items-center gap-2 rounded-lg border-2 border-black bg-[#47B8FF] px-4 font-bold text-black shadow-[2px_2px_0_#000000] sm:flex-1">
							<StorefrontIcon className="h-5 w-5 shrink-0" weight="bold" />
							<select
								id="admin-fridge-select"
								value={data.selectedFridgeId}
								onChange={(event) => setFridge(event.target.value)}
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

				<div className="w-full max-w-175 rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xl font-bold leading-7">Seu Pix</p>
							<p className="text-sm leading-5 text-black/70">
								Esse QR aparece quando alguém retira um item à venda.
							</p>
						</div>
						<button
							type="button"
							onClick={() => void copyPixKey()}
							className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
						>
							<CopyIcon className="h-5 w-5" weight="bold" />
							Copiar
						</button>
					</div>

					<p className="mt-4 break-all rounded-lg border-2 border-black bg-[#47B8FF] p-3 font-bold shadow-[2px_2px_0_#000000]">
						{data.user.pixKey}
					</p>

					<div className="mt-4 rounded-lg border-2 border-black bg-white p-4 shadow-[2px_2px_0_#000000]">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-sm font-bold text-black/70">QR do banco (upload)</p>
							{data.user.hasPixQr && (
								<Form method="post">
									<input type="hidden" name="intent" value="pixQrDelete" />
									<button
										type="submit"
										className="flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
									>
										<TrashIcon className="h-5 w-5" weight="bold" />
										Remover
									</button>
								</Form>
							)}
						</div>

						{data.user.hasPixQr ? (
							<div className="mt-3 flex items-center justify-center rounded-lg border-2 border-black bg-white p-3">
								<img
									src={`/api/geladeira/qr/${data.user.id}?v=${encodeURIComponent(
										data.user.pixQrVersion ?? "0",
									)}`}
									alt="QR Code Pix"
									className="h-55 w-55 object-contain"
								/>
							</div>
						) : (
							<p className="mt-3 text-sm text-black/70">
								Sem QR cadastrado ainda. Se preferir, a pessoa paga só copiando a chave.
							</p>
						)}

						<Form
							method="post"
							encType="multipart/form-data"
							className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
						>
							<input type="hidden" name="intent" value="pixQrUpload" />
							<label className="flex h-14 w-full items-center gap-3 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] sm:flex-1">
								<CameraIcon className="h-5 w-5" weight="bold" />
								<input
									name="pixQr"
									type="file"
									accept="image/*"
									className="w-full text-sm font-bold"
								/>
							</label>
							<button
								type="submit"
								className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] px-4 text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px sm:w-auto"
							>
								<PlusIcon className="h-6 w-6" weight="bold" />
								Enviar QR
							</button>
						</Form>
					</div>
				</div>

				<div className="w-full max-w-175 rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<p className="text-xl font-bold leading-7">Adicionar item</p>
					<Form method="post" encType="multipart/form-data" className="mt-4 flex flex-col gap-4">
						<input type="hidden" name="intent" value="add" />
						<input type="hidden" name="fridgeId" value={data.selectedFridgeId} />

						<label className="flex flex-col gap-2">
							<span className="text-sm font-bold">Nome</span>
							<input
								name="name"
								type="text"
								placeholder="Ex: Coca 2L"
								className="h-14 w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
							/>
						</label>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="flex flex-col gap-2">
								<span className="text-sm font-bold">Quantidade</span>
								<input
									name="quantity"
									type="number"
									min={1}
									defaultValue={1}
									className="h-14 w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								/>
							</label>

							<label className="flex flex-col gap-2">
								<span className="text-sm font-bold">Foto (opcional)</span>
								<div className="flex h-14 items-center gap-3 rounded-lg border-2 border-black bg-white px-4 shadow-[2px_2px_0_#000000]">
									<CameraIcon className="h-5 w-5" weight="bold" />
									<input
										name="image"
										type="file"
										accept="image/*"
										className="w-full text-sm"
									/>
								</div>
							</label>
						</div>

						<label className="flex items-center justify-between gap-3 rounded-lg border-2 border-black bg-white px-4 py-3 shadow-[2px_2px_0_#000000]">
							<div className="flex items-center gap-3">
								<MoneyIcon className="h-5 w-5" weight="bold" />
								<span className="font-bold">Está à venda?</span>
							</div>
							<input
								name="forSale"
								type="checkbox"
								checked={newForSale}
								onChange={(event) => setNewForSale(event.target.checked)}
								className="h-5 w-5"
							/>
						</label>

						{newForSale && (
							<label className="flex flex-col gap-2">
								<span className="text-sm font-bold">Preço (R$)</span>
								<input
									name="price"
									type="number"
									min={0}
									step={0.01}
									placeholder="Ex: 5.00"
									className="h-14 w-full rounded-lg border-2 border-black bg-white px-4 text-lg font-bold shadow-[2px_2px_0_#000000] focus:outline-none"
								/>
							</label>
						)}

						<button
							type="submit"
							className="flex h-14 w-full items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#FFF129] text-lg font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px"
						>
							<PlusIcon className="h-6 w-6" weight="bold" />
							Adicionar
						</button>
					</Form>
				</div>

				<div className="w-full max-w-175 overflow-hidden rounded-lg border-2 border-black bg-white font-mono text-black shadow-[4px_4px_0_#000000]">
					<div className="flex items-center justify-between border-b-2 border-black px-4 py-3 sm:px-6">
						<p className="text-xl font-bold leading-7">Seus itens</p>
						<p className="text-sm text-black/70">{data.items.length}</p>
					</div>

					{data.items.length === 0 ? (
						<div className="p-6 text-center text-black/70">
							Sem itens ainda. Começa adicionando ali em cima.
						</div>
					) : (
						<>
							<ul className="flex flex-col">
								{data.items.map((item) => (
									<li
										key={item.id}
										className="flex flex-col gap-4 border-b-2 border-black px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:justify-between sm:flex-wrap"
									>
										<div className="flex items-center gap-4">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_#000000]">
												{item.hasImage ? (
													<img
														src={`/api/geladeira/item-image/${item.id}`}
														alt={item.name}
														className="h-full w-full object-cover"
														loading="lazy"
													/>
												) : (
													<QrCodeIcon className="h-7 w-7 text-black/70" />
												)}
											</div>
											<div>
												<p className="text-left truncate text-lg font-bold leading-7">{item.name}</p>
												<p className="text-left text-sm leading-5 text-black/70">
													{item.forSale && item.priceCents != null
														? `À venda: ${formatMoney(item.priceCents)}`
														: "Não está à venda"}
												</p>
												<p className="text-left text-sm leading-5 text-black/70">Qtd: {item.quantity}</p>
											</div>
										</div>
										<div className="flex flex-row gap-3 justify-end">
											<button
												type="button"
												className="inline-flex items-center justify-center rounded-lg border-2 border-black bg-[#FFF129] p-3 shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px w-12 h-12"
												onClick={() =>{
													setEditingItem({
														id: item.id,
														name: item.name,
														quantity: item.quantity,
														forSale: item.forSale,
														priceCents: item.priceCents,
													})
													setIsEditModalOpen(true)
												}}
											>
												<PencilIcon className="h-5 w-5" weight="bold" />
											</button>
											<Form method="post" className="sm:ml-auto">
												<input type="hidden" name="intent" value="delete" />
												<input type="hidden" name="itemId" value={item.id} />
													<button
														type="submit"
														className="inline-flex items-center justify-center rounded-lg border-2 border-black bg-white p-3 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-px hover:-translate-y-px w-12 h-12"
													>
													<TrashIcon className="h-5 w-5" weight="bold" />
												</button>
											</Form>
										</div>
									</li>
								))}
							</ul>
							<GeladeiraEditModal
								open={isEditModalOpen}
								fridgeId={data.selectedFridgeId}
								item={editingItem}
								onClose={() => setIsEditModalOpen(false)}
							/>
						</>
					)}
				</div>
			</div>
		</PageShell>
	);
}
