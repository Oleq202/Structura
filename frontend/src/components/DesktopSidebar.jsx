/**
 * DesktopSidebar — Persistent desktop navigation sidebar for Structura.
 *
 * Renders at ≥ 1024px viewport. Contains:
 * - Logo & app name
 * - Navigation links with active indicators
 * - User profile chip with role badge
 * - Language switcher
 * - Logout button
 *
 * 240px fixed width, navy shell palette, safe-area aware.
 */
import { Link, useLocation } from "react-router-dom";
import { colors, font, spacing, radius } from "../theme";
import { translations } from "../i18n";
import {
	IconTasks,
	IconList,
	IconSettings,
	IconLogout,
	IconGlobe,
} from "./icons";

// ── Sidebar Shell ─────────────────────────────────────

const sidebarStyle = {
	width: "260px",
	minWidth: "260px",
	height: "100%",
	background: colors.shellBg,
	borderRight: `1px solid ${colors.shellBorder}`,
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	flexShrink: 0,
	zIndex: 100,
};

const logoSectionStyle = {
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
	padding: `${spacing[5]} ${spacing[5]} ${spacing[4]}`,
	flexShrink: 0,
};

const logoImgStyle = {
	width: "36px",
	height: "36px",
};

const logoTextStyle = {
	fontFamily: font.family.sans,
	fontSize: font.size.xl,
	fontWeight: font.weight.bold,
	color: colors.shellText,
	letterSpacing: font.letterSpacing.tight,
};

// ── Nav Section ───────────────────────────────────────

const navSectionStyle = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	gap: "2px",
	padding: `0 ${spacing[3]}`,
	overflowY: "auto",
};

const sectionLabelStyle = {
	fontSize: font.size.xs,
	fontWeight: font.weight.semibold,
	color: colors.shellTextMuted,
	textTransform: "uppercase",
	letterSpacing: font.letterSpacing.caps,
	padding: `${spacing[4]} ${spacing[3]} ${spacing[2]}`,
	margin: 0,
};

function navLinkStyle(isActive) {
	return {
		display: "flex",
		alignItems: "center",
		gap: spacing[3],
		padding: `${spacing[2]} ${spacing[3]}`,
		borderRadius: radius.md,
		textDecoration: "none",
		fontFamily: font.family.sans,
		fontSize: font.size.base,
		fontWeight: isActive ? font.weight.semibold : font.weight.medium,
		color: isActive ? "#ffffff" : colors.shellTextMuted,
		background: isActive ? colors.shellSurface : "transparent",
		transition: "background 0.15s ease, color 0.15s ease",
		minHeight: "40px",
		boxSizing: "border-box",
		cursor: "pointer",
		border: "none",
		width: "100%",
		textAlign: "left",
	};
}

// ── Footer Section ────────────────────────────────────

const footerStyle = {
	flexShrink: 0,
	borderTop: `1px solid ${colors.shellBorder}`,
	padding: spacing[4],
	display: "flex",
	flexDirection: "column",
	gap: spacing[3],
};

const profileChipStyle = {
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
	padding: `${spacing[2]} ${spacing[3]}`,
	borderRadius: radius.md,
	background: colors.shellSurface,
	border: `1px solid ${colors.shellBorder}`,
};

const avatarStyle = {
	width: "34px",
	height: "34px",
	borderRadius: radius.full,
	background: `linear-gradient(135deg, ${colors.shellAccent}, ${colors.primary})`,
	color: "#fff",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: font.size.xs,
	fontWeight: font.weight.bold,
	flexShrink: 0,
};

const roleBadgeStyle = {
	fontSize: "10px",
	fontWeight: font.weight.bold,
	textTransform: "uppercase",
	letterSpacing: font.letterSpacing.caps,
	color: colors.shellAccent,
	lineHeight: 1,
};

const footerBtnStyle = {
	display: "flex",
	alignItems: "center",
	gap: spacing[2],
	background: "transparent",
	border: "none",
	color: colors.shellTextMuted,
	fontFamily: font.family.sans,
	fontSize: font.size.sm,
	fontWeight: font.weight.medium,
	padding: `${spacing[2]} ${spacing[3]}`,
	borderRadius: radius.md,
	cursor: "pointer",
	transition: "color 0.15s ease, background 0.15s ease",
	width: "100%",
	textAlign: "left",
	minHeight: "36px",
	boxSizing: "border-box",
};

// ── Component ─────────────────────────────────────────

export default function DesktopSidebar({
	language = "pl",
	currentUser,
	onLanguageChange,
	onLogout,
}) {
	const t = translations[language] || translations.pl;
	const location = useLocation();
	const pathname = location.pathname;

	const initials = currentUser?.login
		? currentUser.login.substring(0, 2).toUpperCase()
		: "??";

	const links = [
		{
			key: "tasks",
			to: "/",
			icon: <IconTasks size="md" />,
			label: t.tasks || "Tasks",
		},
		...(currentUser?.role === "admin"
			? [
				{
					key: "logs",
					to: "/logs",
					icon: <IconList size="md" />,
					label: t.logs || "Logs",
				},
			]
			: []),
		{
			key: "settings",
			to: "/settings",
			icon: <IconSettings size="md" />,
			label: t.settings || "Settings",
		},
	];

	function isActive(to) {
		if (to === "/") return pathname === "/";
		return pathname.startsWith(to);
	}

	return (
		<aside style={sidebarStyle}>
			{/* Logo */}
			<div style={logoSectionStyle}>
				<img src="/favicon.png" alt="Structura logo" style={logoImgStyle} />
				<span style={logoTextStyle}>Structura</span>
			</div>

			{/* Nav Links */}
			<nav style={navSectionStyle}>
				<p style={sectionLabelStyle}>Menu</p>
				{links.map((link) => {
					const active = isActive(link.to);
					return (
						<Link
							key={link.key}
							to={link.to}
							style={navLinkStyle(active)}
							onPointerEnter={(e) => {
								if (!active) {
									e.currentTarget.style.background = colors.shellSurface;
									e.currentTarget.style.color = "#ffffff";
								}
							}}
							onPointerLeave={(e) => {
								if (!active) {
									e.currentTarget.style.background = "transparent";
									e.currentTarget.style.color = colors.shellTextMuted;
								}
							}}
						>
							{link.icon}
							{link.label}
						</Link>
					);
				})}
			</nav>

			{/* Footer: Profile + Actions */}
			<div style={footerStyle}>
				{/* User Profile Chip */}
				<div style={profileChipStyle}>
					<div style={avatarStyle}>{initials}</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								fontSize: font.size.sm,
								fontWeight: font.weight.semibold,
								color: colors.shellText,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
							}}
						>
							{currentUser?.login || "—"}
						</div>
						<div style={roleBadgeStyle}>{currentUser?.role || "—"}</div>
					</div>
				</div>

				{/* Language Toggle */}
				<button
					type="button"
					onClick={onLanguageChange}
					style={footerBtnStyle}
					onPointerEnter={(e) => {
						e.currentTarget.style.color = colors.shellText;
						e.currentTarget.style.background = colors.shellSurface;
					}}
					onPointerLeave={(e) => {
						e.currentTarget.style.color = colors.shellTextMuted;
						e.currentTarget.style.background = "transparent";
					}}
				>
					<IconGlobe size="sm" />
					{language === "pl" ? "Polski (PL)" : "English (EN)"}
				</button>

				{/* Logout */}
				<button
					type="button"
					onClick={onLogout}
					style={{ ...footerBtnStyle, color: "#f87171" }}
					onPointerEnter={(e) => {
						e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
						e.currentTarget.style.color = "#fca5a5";
					}}
					onPointerLeave={(e) => {
						e.currentTarget.style.background = "transparent";
						e.currentTarget.style.color = "#f87171";
					}}
				>
					<IconLogout size="sm" />
					{t.logout || "Log out"}
				</button>
			</div>
		</aside>
	);
}
