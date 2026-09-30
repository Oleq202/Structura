/**
 * Bottombar — Mobile-only bottom navigation for Structura.
 *
 * Renders at < 1024px viewport width.
 * Uses centralized icon library (no inline SVGs).
 * Safe-area inset aware for notched devices.
 * 44px min touch targets.
 */
import { Link, useLocation } from "react-router-dom";
import { colors, font, spacing, radius } from "../theme";
import { translations } from "../i18n";
import { IconTasks, IconList, IconSettings } from "./icons";

const bottombarStyle = {
	background: colors.shellBg,
	borderTop: `1px solid ${colors.shellBorder}`,
	paddingTop: spacing[2],
	paddingBottom: `calc(${spacing[2]} + env(safe-area-inset-bottom, 0px))`,
	paddingLeft: `max(${spacing[4]}, env(safe-area-inset-left, 0px))`,
	paddingRight: `max(${spacing[4]}, env(safe-area-inset-right, 0px))`,
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	flexShrink: 0,
	zIndex: 2000,
	boxSizing: "border-box",
};

const innerStyle = {
	maxWidth: "600px",
	width: "100%",
	display: "flex",
	justifyContent: "space-around",
	alignItems: "center",
};

function linkStyle(isActive) {
	return {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		minWidth: "44px",
		minHeight: "44px",
		gap: "4px",
		textDecoration: "none",
		fontFamily: font.family.sans,
		fontSize: font.size.xs,
		fontWeight: isActive ? font.weight.bold : font.weight.medium,
		letterSpacing: font.letterSpacing.wide,
		padding: `${spacing[1]} ${spacing[3]}`,
		borderRadius: radius.md,
		color: isActive ? "#ffffff" : colors.shellTextMuted,
		background: isActive ? colors.shellSurface : "transparent",
		transition: "color 0.15s ease, background 0.15s ease",
		boxSizing: "border-box",
	};
}

const ICONS = {
	tasks: IconTasks,
	logs: IconList,
	settings: IconSettings,
};

export default function Bottombar({ language = "pl", currentUser }) {
	const t = translations[language] || translations.pl;
	const pathname = useLocation().pathname;

	const links = [
		{ key: "tasks", to: "/", labelKey: "tasks" },
		...(currentUser?.role === "admin"
			? [{ key: "logs", to: "/logs", labelKey: "logs" }]
			: []),
		{ key: "settings", to: "/settings", labelKey: "settings" },
	];

	function isActive(key) {
		if (key === "tasks") return pathname === "/";
		if (key === "logs") return pathname === "/logs";
		if (key === "settings") return pathname === "/settings";
		return false;
	}

	return (
		<nav style={bottombarStyle} aria-label="Main navigation">
			<div style={innerStyle}>
				{links.map(({ key, to, labelKey }) => {
					const active = isActive(key);
					const IconComponent = ICONS[key];
					return (
						<Link
							key={key}
							to={to}
							style={linkStyle(active)}
							onPointerEnter={(e) => {
								if (!active) {
									e.currentTarget.style.color = "#ffffff";
									e.currentTarget.style.background = colors.shellSurface;
								}
							}}
							onPointerLeave={(e) => {
								if (!active) {
									e.currentTarget.style.color = colors.shellTextMuted;
									e.currentTarget.style.background = "transparent";
								}
							}}
						>
							<IconComponent size="lg" />
							<span>{t[labelKey]}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
