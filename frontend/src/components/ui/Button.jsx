/**
 * Button — Primary UI primitive for Structura.
 *
 * Variants: primary | secondary | ghost | danger
 * Sizes:    sm | md | lg
 *
 * All styling comes from theme.js tokens. Hover/active states use
 * CSS-in-JS with onPointerDown/Up to avoid hover-sticking on mobile.
 */
import { colors, font, spacing, radius } from "../../theme";
import { IconSpinner } from "../icons";

const baseStyle = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	gap: spacing[2],
	border: "none",
	cursor: "pointer",
	fontFamily: font.family.sans,
	fontWeight: font.weight.semibold,
	borderRadius: radius.md,
	boxSizing: "border-box",
	textDecoration: "none",
	whiteSpace: "nowrap",
	transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease",
	outline: "none",
	position: "relative",
	WebkitTapHighlightColor: "transparent",
};

const sizeStyles = {
	sm: {
		minHeight: "36px",
		minWidth: "36px",
		padding: `${spacing[1]} ${spacing[3]}`,
		fontSize: font.size.sm,
	},
	md: {
		minHeight: "44px",
		minWidth: "44px",
		padding: `${spacing[2]} ${spacing[4]}`,
		fontSize: font.size.base,
	},
	lg: {
		minHeight: "48px",
		minWidth: "48px",
		padding: `${spacing[3]} ${spacing[5]}`,
		fontSize: font.size.base,
	},
};

const variantStyles = {
	primary: {
		background: colors.primary,
		color: colors.primaryText,
		hoverBg: colors.primaryHover,
		activeBg: colors.primaryActive,
	},
	secondary: {
		background: colors.cardBg,
		color: colors.textHeading,
		border: `1px solid ${colors.borderDefault}`,
		hoverBg: colors.pageBg,
		hoverBorder: colors.borderStrong,
		activeBg: colors.borderSubtle,
	},
	ghost: {
		background: "transparent",
		color: colors.primary,
		border: `1px solid ${colors.primary}`,
		hoverBg: colors.primaryLight,
		activeBg: colors.primaryLight,
	},
	danger: {
		background: "#fef2f2",
		color: "#991b1b",
		border: "1px solid #fca5a5",
		hoverBg: "#fee2e2",
		hoverBorder: "#f87171",
		activeBg: "#fecaca",
	},
};

export default function Button({
	children,
	variant = "primary",
	size = "md",
	loading = false,
	disabled = false,
	fullWidth = false,
	style: customStyle,
	...props
}) {
	const v = variantStyles[variant] || variantStyles.primary;
	const s = sizeStyles[size] || sizeStyles.md;

	const isDisabled = disabled || loading;

	const computedStyle = {
		...baseStyle,
		...s,
		background: v.background,
		color: v.color,
		...(v.border ? { border: v.border } : {}),
		...(fullWidth ? { width: "100%" } : {}),
		...(isDisabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
		...customStyle,
	};

	const handlePointerEnter = (e) => {
		if (isDisabled) return;
		e.currentTarget.style.background = v.hoverBg || v.background;
		if (v.hoverBorder) e.currentTarget.style.borderColor = v.hoverBorder;
	};

	const handlePointerLeave = (e) => {
		if (isDisabled) return;
		e.currentTarget.style.background = v.background;
		if (v.border) e.currentTarget.style.borderColor = v.border.split(" ").pop();
		e.currentTarget.style.transform = "scale(1)";
	};

	const handlePointerDown = (e) => {
		if (isDisabled) return;
		e.currentTarget.style.transform = "scale(0.97)";
		if (v.activeBg) e.currentTarget.style.background = v.activeBg;
	};

	const handlePointerUp = (e) => {
		if (isDisabled) return;
		e.currentTarget.style.transform = "scale(1)";
		e.currentTarget.style.background = v.hoverBg || v.background;
	};

	return (
		<button
			type="button"
			disabled={isDisabled}
			style={computedStyle}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			{...props}
		>
			{loading && <IconSpinner size="sm" />}
			{children}
		</button>
	);
}
