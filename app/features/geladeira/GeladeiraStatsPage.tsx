import { ChartLineUpIcon, StorefrontIcon, UserIcon } from "@phosphor-icons/react";
import { Link, useLoaderData } from "react-router";
import { PageShell } from "../../components/PageShell";

type LoaderData = {
	user: { id: string; displayName: string };
	withdrawCount: number;
	saleCount: number;
	saleSumCents: number;
};

function formatMoney(priceCents: number) {
	return (priceCents / 100).toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col items-start gap-2 rounded-lg border-2 border-black bg-white p-6 font-mono text-black shadow-[4px_4px_0_#000000]">
			<p className="text-sm font-bold text-black/70">{label}</p>
			<p className="text-3xl font-bold">{value}</p>
		</div>
	);
}

export function GeladeiraStatsPage() {
	const data = useLoaderData() as LoaderData;

	return (
		<PageShell showLogo containerClassName="max-w-[1200px] gap-12">
			<div className="flex w-full flex-col items-center gap-6">
				<div className="w-full max-w-[700px] rounded-lg border-2 border-black bg-white p-4 font-mono text-black shadow-[4px_4px_0_#000000] sm:p-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000]">
								<ChartLineUpIcon className="h-7 w-7 text-black" weight="bold" />
							</div>
							<div>
								<p className="text-2xl font-bold leading-8">Stats</p>
								<p className="text-sm leading-5 text-black/70">
									<UserIcon className="inline h-4 w-4" /> {data.user.displayName}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Link
								to="/geladeira/admin"
								className="flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-4 font-bold shadow-[2px_2px_0_#000000] transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px]"
							>
								<StorefrontIcon className="h-5 w-5" weight="bold" />
								Admin
							</Link>
						</div>
					</div>
				</div>

				<div className="grid w-full max-w-[700px] grid-cols-1 gap-6 sm:grid-cols-3">
					<StatCard label="Retiradas" value={data.withdrawCount.toString()} />
					<StatCard label="Vendas" value={data.saleCount.toString()} />
					<StatCard label="Total (R$)" value={formatMoney(data.saleSumCents)} />
				</div>
			</div>
		</PageShell>
	);
}

