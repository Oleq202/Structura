import {
	colors,
	radius,
	shadow,
	spacing,
	font,
} from "../theme";
import { translations } from "../i18n";

const ICONS = {
	construction: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
		</svg>
	),
};

export default function NotDoneYet({ text, language = "pl" }) {
	const t = translations[language];
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: spacing[8],
				minHeight: "50vh",
			}}
		>
			<div
				style={{
					background: colors.cardBg,
					borderRadius: radius.xl,
					border: `1px solid ${colors.borderSubtle}`,
					boxShadow: shadow.card,
					padding: spacing[8],
					maxWidth: "400px",
					textAlign: "center",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: spacing[3],
				}}
			>
				<div
					style={{
						width: "52px",
						height: "52px",
						borderRadius: radius.full,
						background: `${colors.primary}15`,
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: spacing[2],
					}}
				>
					{ICONS.construction}
				</div>
				<h2
					style={{
						margin: 0,
						fontSize: font.size.lg,
						fontWeight: font.weight.big,
						color: colors.textHeading,
					}}
				>
					{text} {t.underConstruction}
				</h2>
				<p
					style={{
						margin: 0,
						fontSize: font.size.sm,
						color: colors.textSecondary,
						lineHeight: font.lineHeight.normal,
					}}
				>
					{t.workingHard}
				</p>
			</div>
		</div>
	);
}
