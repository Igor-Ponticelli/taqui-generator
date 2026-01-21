import {
	ClockCountdownIcon,
	ConfettiIcon,
	FlaskIcon,
	HashStraightIcon,
	GlobeIcon,
	LinkSimpleIcon,
	PasswordIcon,
	StickerIcon,
	WhatsappLogoIcon,
	TicketIcon,
	ArrowsClockwiseIcon,
	TextAaIcon,
	SnowflakeIcon,
} from "@phosphor-icons/react";
import type { MetaFunction } from "react-router";
import { PageShell } from "../../components/PageShell";

type HubCardProps = {
	title: string;
	description: string;
	href: string;
	badge?: string;
	icon:
	| "sticker"
	| "globe"
	| "link"
	| "Password"
	| "clock"
	| "whatsapp"
	| "ticket"
	| "hash"
	| "roleta"
	| "textao"
	| "geladeira";
};

type HubStatProps = {
	label: string;
	value: string;
	detail: string;
};

const hubCards: HubCardProps[] = [
	{
		title: "Táqui Teu Contexto",
		description:
			"Faltou contexto? Calma, tenho um guardado aqui bem no meu bolso. Gere o meme, troque a legenda e encerre a discussão com aquele toque de classe.",
		href: "/generator",
		badge: "Disponível",
		icon: "sticker",
	},
	{
		title: "Táqui Meu IP",
		description:
			"Táqui o endereço que a CIA e o Google já conhecem. Descubra qual é o seu IP público e gere uma imagem pra provar que você existe na rede.",
		href: "/ip",
		badge: "Novo",
		icon: "globe",
	},
	{
		title: "Táqui Teu Link",
		description:
			"Ninguém merece ler um textão de link. Encurta isso aí, deixa bonitinho e clicávél. Seu vizinho agradece.",
		href: "/link",
		badge: "Beta",
		icon: "link",
	},
	{
		title: "Táqui Tua Senha",
		description:
			"Sua senha é '123456' ou a data do seu aniversário, né? Senti daqui. Gere uma senha blindada que nem você vai decorar.",
		href: "/pass",
		badge: "Beta",
		icon: "Password",
	},
	{
		title: "Táqui o Zap",
		description:
			"Abre direto o papo no WhatsApp Web: cola o número com DDI e DDD, escreve a mensagem e já entra na conversa.",
		href: "/whatsapp",
		badge: "Beta",
		icon: "whatsapp",
	},
	{
		title: "Táqui a Loteria",
		description:
			"Tá com preguiça de escolher número? Eu escolho por você. Ajusta a quantidade e deixa o destino fazer o resto.",
		href: "/loto",
		badge: "Novo",
		icon: "ticket",
	},
	{
		title: "Táqui o Hash",
		description:
			"UUID quentinho, SHA de vários sabores e até um carimbo visual pra diferenciar seu payload.",
		href: "/hash",
		badge: "Novo",
		icon: "hash",
	},
	{
		title: "Táqui Tua Roleta",
		description:
			"Gira a roda, edita a lista e deixa o algoritmo decidir por você. Sem julgamentos.",
		href: "/roleta",
		badge: "Novo",
		icon: "roleta",
	},
	{
		title: "Táqui Teu Textão",
		description:
			"Descubra se você escreveu um tweet ou a Bíblia 2. A gente conta cada letra, palavra e linha desse teu drama antes de você passar vergonha.",
		href: "/textao",
		badge: "Novo",
		icon: "textao",
	},
	{
		title: "Táqui Tua Geladeira",
		description:
			"Controle itens por pessoa, marque o que tá à venda e retire pelo shop com Pix e QR code.",
		href: "/geladeira",
		badge: "Beta",
		icon: "geladeira",
	},
];

export const hubMeta: MetaFunction = () => {
	return [
		{ title: "Táqui Hub" },
		{
			name: "description",
			content: "Centralize o acesso às páginas do projeto Táqui.",
		},
	];
};

export function HubPage() {
	return (
		<PageShell containerClassName="max-w-[1200px] gap-12">
			<div className="grid w-full gap-4 md:grid-cols-2">
				{hubCards.map((card) => (
					<HubCard key={card.href} {...card} />
				))}
			</div>
		</PageShell>
	);
}

function HubCard({ title, description, href, badge, icon }: HubCardProps) {
	const badgeConfig = getHubBadgeConfig(badge);

	return (
		<a
			href={href}
			className="flex min-h-[150px] w-full gap-6 rounded-lg border-2 border-black bg-white p-4 text-left text-black no-underline shadow-[2px_2px_0_#000000] transition-transform duration-200 hover:-translate-x-[1px] hover:-translate-y-[1px] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50 md:min-h-[152px] md:p-6"
		>
			<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFF129] shadow-[2px_2px_0_#000000] md:h-24 md:w-24">
				<HubCardIcon kind={icon} />
			</div>

			<div className="flex min-w-0 flex-1 flex-col justify-center gap-3.5 font-mono">
				<div className="flex items-start justify-between gap-3">
					<h2 className="text-base font-bold leading-6 md:text-2xl md:leading-9">
						{title}
					</h2>

					{badgeConfig && (
						<span
							className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black px-2 py-1 text-[10px] font-semibold leading-4 shadow-[2px_2px_0_#000000]"
							style={{ background: badgeConfig.background }}
						>
							<badgeConfig.Icon className="h-4 w-4" weight="bold" />
							{badgeConfig.label}
						</span>
					)}
				</div>

				<p className="text-xs leading-5 text-black/90 md:text-sm md:leading-[22px]">
					{description}
				</p>
			</div>
		</a>
	);
}

function HubCardIcon({ kind }: { kind: HubCardProps["icon"] }) {
	const className = "h-10 w-10 text-black md:h-14 md:w-14";

	switch (kind) {
		case "sticker":
			return <StickerIcon className={className} />;
		case "globe":
			return <GlobeIcon className={className} />;
		case "link":
			return <LinkSimpleIcon className={className} />;
		case "Password":
			return <PasswordIcon className={className} />;
		case "clock":
			return <ClockCountdownIcon className={className} />;
		case "whatsapp":
			return <WhatsappLogoIcon className={className} />;
		case "ticket":
			return <TicketIcon className={className} />;
		case "hash":
			return <HashStraightIcon className={className} />;
		case "roleta":
			return <ArrowsClockwiseIcon className={className} />;
		case "textao":
			return <TextAaIcon className={className} />;
		case "geladeira":
			return <SnowflakeIcon className={className} />;
		default:
			return null;
	}
}

function getHubBadgeConfig(badge?: string) {
	if (!badge || badge === "Disponível") return null;

	if (badge === "Novo") {
		return { label: badge, background: "#FFF129", Icon: ConfettiIcon };
	}

	if (badge === "Beta") {
		return { label: badge, background: "#47B8FF", Icon: FlaskIcon };
	}

	return null;
}
