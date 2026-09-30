/**
 * AppHeader — Mobile/tablet top header for Structura.
 *
 * Shows at < 1024px. Hidden on desktop (sidebar takes over).
 * Includes: Logo, App Name, User greeting + role badge, language toggle.
 */
import { colors, font, spacing, radius } from "../theme";
import { IconGlobe } from "./icons";

const headerContainerStyle = {
	background: colors.shellBg,
	minHeight: "56px",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	paddingTop: "env(safe-area-inset-top, 0px)",
	paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
	paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
	boxSizing: "border-box",
	flexShrink: 0,
	zIndex: 100,
	borderBottom: `1px solid ${colors.shellBorder}`,
};

const headerInnerStyle = {
	maxWidth: "840px",
	width: "100%",
	height: "56px",
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
};

const logoStyle = {
	width: "32px",
	height: "32px",
	flexShrink: 0,
};

const titleStyle = {
	fontFamily: font.family.sans,
	fontSize: font.size.lg,
	fontWeight: font.weight.bold,
	color: colors.shellText,
	letterSpacing: font.letterSpacing.tight,
};

const spacerStyle = {
	flex: 1,
};

const roleChipStyle = {
	fontSize: "10px",
	fontWeight: font.weight.bold,
	textTransform: "uppercase",
	letterSpacing: font.letterSpacing.caps,
	color: colors.shellAccent,
	background: colors.shellSurface,
	border: `1px solid ${colors.shellBorder}`,
	borderRadius: radius.full,
	padding: `2px ${spacing[2]}`,
	lineHeight: 1.4,
};

const langBtnStyle = {
	background: "transparent",
	border: `1px solid ${colors.shellBorder}`,
	borderRadius: radius.md,
	padding: `${spacing[1]} ${spacing[2]}`,
	minHeight: "36px",
	minWidth: "36px",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: spacing[1],
	color: colors.shellTextMuted,
	fontFamily: font.family.sans,
	fontSize: font.size.xs,
	fontWeight: font.weight.bold,
	cursor: "pointer",
	transition: "border-color 0.15s ease, color 0.15s ease",
	boxSizing: "border-box",
	flexShrink: 0,
};

export default function AppHeader({
	currentUser,
	language = "pl",
	onLanguageChange,
}) {
	return (
		<header style={headerContainerStyle}>
			<div style={headerInnerStyle}>
				<img src="/favicon.png" alt="Structura logo" style={logoStyle} />
				<span style={titleStyle}>Structura</span>

				<div style={spacerStyle} />

				{/* Role Chip */}
				{currentUser?.role && (
					<span style={roleChipStyle}>{currentUser.role}</span>
				)}

				{/* Language Toggle */}
				{onLanguageChange && (
					<button
						type="button"
						onClick={onLanguageChange}
						style={langBtnStyle}
						aria-label="Toggle language"
						onPointerEnter={(e) => {
							e.currentTarget.style.borderColor = colors.shellTextMuted;
							e.currentTarget.style.color = colors.shellText;
						}}
						onPointerLeave={(e) => {
							e.currentTarget.style.borderColor = colors.shellBorder;
							e.currentTarget.style.color = colors.shellTextMuted;
						}}
					>
						<IconGlobe size="sm" />
						{language === "pl" ? "PL" : "EN"}
					</button>
				)}
			</div>
		</header>
	);
}
