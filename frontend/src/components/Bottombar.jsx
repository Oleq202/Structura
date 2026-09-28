import {
	colors,
	font,
	spacing,
	radius,
	components,
} from "../theme";
import {
	Link,
	useLocation,
} from "react-router-dom";
import { translations } from "../i18n";

const NAV_ICONS = {
	tasks: (
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
			<path d="M9 11l3 3L22 4" />
			<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
		</svg>
	),
	settings: (
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
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
		</svg>
	),
	logs: (
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
			<line x1="8" y1="6" x2="21" y2="6" />
			<line
				x1="8"
				y1="12"
				x2="21"
				y2="12"
			/>
			<line
				x1="8"
				y1="18"
				x2="21"
				y2="18"
			/>
			<line
				x1="3"
				y1="6"
				x2="3.01"
				y2="6"
			/>
			<line
				x1="3"
				y1="12"
				x2="3.01"
				y2="12"
			/>
			<line
				x1="3"
				y1="18"
				x2="3.01"
				y2="18"
			/>
		</svg>
	),
};

const bottombarStyle = {
	background: colors.shell,
	borderTop: `1px solid ${colors.shellDeep}`,
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

const bottombarInnerStyle = {
	maxWidth: "600px",
	width: "100%",
	display: "flex",
	justifyContent: "space-around",
	alignItems: "center",
};

const navLinkBaseStyle = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	minWidth: "44px",
	minHeight: "44px",
	boxSizing: "border-box",
	gap: "4px",
	textDecoration: "none",
	fontFamily: font.family.sans,
	fontSize: font.size.s,
	fontWeight: font.weight.big,
	letterSpacing: font.letterSpacing.wide,
	padding: `${spacing[1]} ${spacing[3]}`,
	borderRadius: radius.md,
	transition: "color 0.15s, background 0.15s",
	position: "relative",
};

export default function Bottombar({
	language = "pl",
	currentUser,
}) {
	const t = translations[language] || translations.pl;
	const pathname = useLocation().pathname;

	const links = [
		{ key: "tasks", to: "/", labelKey: "tasks" },
		...(currentUser?.role === "admin"
			? [{ key: "logs", to: "/logs", labelKey: "logs" }]
			: []),
		{
			key: "settings",
			to: "/settings",
			labelKey: "settings",
		},
	];

	const activeKey =
		pathname === "/"
			? "tasks"
			: pathname === "/logs"
				? "logs"
				: pathname === "/settings"
					? "settings"
					: "tasks";

	return (
		<nav style={bottombarStyle}>
			<div style={bottombarInnerStyle}>
				{links.map(
					({ key, to, labelKey }) => {
						const isActive =
							activeKey === key;
						return (
							<Link
								key={key}
								to={to}
								style={{
									...navLinkBaseStyle,
									color: isActive
										? colors.shellDeep
										: colors.shellTextMuted,
									background:
										isActive
											? colors.pageBg
											: "transparent",
								}}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.color =
											colors.shellText;
										e.currentTarget.style.fontWeight =
											font.weight.bold;
										e.currentTarget.querySelector(
											"span"
										).style.opacity =
											1;
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.color =
											colors.shellTextMuted;
										e.currentTarget.style.fontWeight =
											font.weight.medium;
										e.currentTarget.querySelector(
											"span"
										).style.opacity =
											0.6;
									}
								}}
							>
								<span
									style={{
										opacity:
											isActive
												? 1
												: 0.6,
										transition:
											"opacity 0.15s",
									}}
								>
									{NAV_ICONS[key]}
								</span>
								{t[labelKey]}
							</Link>
						);
					}
				)}
			</div>
		</nav>
	);
}
