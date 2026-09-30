const navy = {
	50: "#e8f0f8",
	100: "#c2d5eb",
	200: "#8fb3d4",
	300: "#5a8fbc",
	400: "#2e6fa3",
	500: "#1a3a5c",
	600: "#163150",
	700: "#122844",
	800: "#0e1f38",
	900: "#09152a",
};

const blue = {
	50: "#e0f0fd",
	100: "#b3d9fa",
	200: "#7bbef5",
	300: "#4db3ff",
	400: "#2e8de4",
	500: "#1d70b8",
	600: "#155894",
	700: "#0e4373",
	800: "#0a3a6b",
	900: "#062849",
};

export const palette = {
	navy,
	blue,
	slate: {
		50: "#f8fafc",
		100: "#f1f5f9",
		200: "#e2e8f0",
		300: "#cbd5e1",
		400: "#94a3b8",
		500: "#64748b",
		600: "#475569",
		700: "#334155",
		800: "#1e293b",
		900: "#0f172a",
	},
	neutral: {
		0: "#ffffff",
		50: "#f8fafc",
		100: "#f1f5f9",
		200: "#e2e8f0",
		300: "#cbd5e1",
		400: "#94a3b8",
		500: "#64748b",
		600: "#475569",
		700: "#334155",
		800: "#1e293b",
		900: "#0f172a",
	},
};

export const status = {
	pending: {
		bg: "#fffbeb",
		border: "#fcd34d",
		text: "#92400e",
		solid: "#d97706",
		dot: "#d97706",
	},
	completed: {
		bg: "#f0fdf4",
		border: "#86efac",
		text: "#166534",
		solid: "#16a34a",
		dot: "#16a34a",
	},
	urgent: {
		bg: "#fff7ed",
		border: "#fdba74",
		text: "#9a3412",
		solid: "#ea580c",
		dot: "#ea580c",
	},
	inProgress: {
		bg: "#eff6ff",
		border: "#93c5fd",
		text: "#1e40af",
		solid: "#2563eb",
		dot: "#2563eb",
	},
	done: {
		bg: "#f0fdf4",
		border: "#86efac",
		text: "#166534",
		solid: "#16a34a",
		dot: "#16a34a",
	},
	new: {
		bg: "#f8fafc",
		border: "#cbd5e1",
		text: "#334155",
		solid: "#64748b",
		dot: "#64748b",
	},
	danger: {
		bg: "#fef2f2",
		border: "#fca5a5",
		text: "#991b1b",
		solid: "#dc2626",
		dot: "#dc2626",
	},
	warning: {
		bg: "#fffbeb",
		border: "#fcd34d",
		text: "#92400e",
		solid: "#d97706",
		dot: "#d97706",
	},
	success: {
		bg: "#f0fdf4",
		border: "#86efac",
		text: "#166534",
		solid: "#16a34a",
		dot: "#16a34a",
	},
	info: {
		bg: "#eff6ff",
		border: "#93c5fd",
		text: "#1e40af",
		solid: "#2563eb",
		dot: "#2563eb",
	},
};

export const colors = {
	// Shell & Brand
	shellLight: navy[400],
	shell: navy[500],
	shellDeep: navy[600],
	deepNavy: navy[700],
	shellBg: "#0f1f38",
	shellSurface: "#162d4e",
	shellBorder: "#203e68",
	shellText: "#ffffff",
	shellTextMuted: "#94b8db",
	shellAccent: "#2e8de4",

	// Core App Surfaces
	pageBg: "#f1f5f9",
	cardBg: "#ffffff",
	cardBorder: "#cbd5e1",
	cardBorderHover: "#94a3b8",

	// Interactive & Primary Brand
	primary: "#1d70b8",
	primaryHover: "#155894",
	primaryActive: "#0e4373",
	primaryLight: "#e8f2fc",
	primaryText: "#ffffff",

	// Typography & Content
	textPrimary: "#0f172a",
	textHeading: "#0f172a",
	textBody: "#1e293b",
	textSecondary: "#475569",
	textMuted: "#64748b",
	textDisabled: "#94a3b8",

	// Borders
	borderSubtle: "#e2e8f0",
	borderDefault: "#cbd5e1",
	borderStrong: "#94a3b8",

	// Avatars
	avatarBg: navy[500],
	avatarText: blue[200],

	// Legacy status aliases
	success: "#16a34a",
	warning: "#d97706",
	danger: "#dc2626",
	info: "#2563eb",
};

export const font = {
	family: {
		sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
		mono: "'JetBrains Mono', 'Fira Code', monospace",
	},
	size: {
		xs: "12px",
		s: "13px", // Alias to prevent undefined token bugs
		sm: "13px",
		base: "15px",
		md: "16px",
		lg: "18px",
		xl: "20px",
		"2xl": "24px",
		"3xl": "30px",
	},
	weight: {
		regular: 400,
		medium: 500,
		big: 600, // Kept for full backward compatibility
		semibold: 600,
		bold: 700,
	},
	lineHeight: {
		tight: 1.25,
		normal: 1.5,
		loose: 1.75,
	},
	letterSpacing: {
		tight: "-0.015em",
		normal: "0em",
		wide: "0.025em",
		caps: "0.06em",
	},
};

export const spacing = {
	0: "0px",
	1: "4px",
	2: "8px",
	3: "12px",
	4: "16px",
	5: "20px",
	6: "24px",
	8: "32px",
	10: "40px",
	12: "48px",
	16: "64px",
	24: "96px",
	32: "128px",
};

export const radius = {
	xs: "4px",
	sm: "6px",
	md: "8px",
	lg: "12px",
	xl: "16px",
	"2xl": "20px",
	full: "9999px",
};

export const shadow = {
	none: "none",
	sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
	card: "0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)",
	cardHover: "0 6px 16px -2px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.06)",
	modal: "0 20px 25px -5px rgba(15, 23, 42, 0.2), 0 8px 10px -6px rgba(15, 23, 42, 0.15)",
	popover: "0 10px 15px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.08)",
	focus: "0 0 0 3px rgba(29, 112, 184, 0.35)",
	focusError: "0 0 0 3px rgba(220, 38, 38, 0.3)",
};

export const components = {
	topBar: {
		background: colors.shellBg,
		borderBottom: `1px solid ${colors.shellBorder}`,
		padding: `${spacing[2]} ${spacing[4]}`,
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		flexShrink: 0,
		position: "sticky",
		top: 0,
		zIndex: 10,
	},

	filterStrip: {
		background: colors.shellSurface,
		padding: `${spacing[2]} ${spacing[4]}`,
		display: "flex",
		gap: spacing[2],
	},

	bottomNav: {
		background: colors.shellBg,
		borderTop: `1px solid ${colors.shellBorder}`,
		paddingTop: spacing[2],
		paddingBottom: `calc(${spacing[2]} + env(safe-area-inset-bottom, 0px))`,
		paddingLeft: `max(${spacing[4]}, env(safe-area-inset-left, 0px))`,
		paddingRight: `max(${spacing[4]}, env(safe-area-inset-right, 0px))`,
		display: "flex",
		justifyContent: "space-around",
		alignItems: "center",
		flexShrink: 0,
	},

	card: {
		background: colors.cardBg,
		border: `1px solid ${colors.cardBorder}`,
		borderRadius: radius.lg,
		padding: spacing[4],
		boxShadow: shadow.card,
		transition: "border-color 0.15s ease, box-shadow 0.15s ease",
	},

	primaryButton: {
		background: colors.primary,
		color: colors.primaryText,
		borderRadius: radius.md,
		padding: `${spacing[2]} ${spacing[4]}`,
		fontSize: font.size.base,
		fontWeight: font.weight.semibold,
		border: "none",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		minHeight: "44px",
		boxSizing: "border-box",
		transition: "background-color 0.15s ease, transform 0.1s ease",
	},

	ghostButton: {
		background: "transparent",
		color: colors.primary,
		border: `1px solid ${colors.primary}`,
		borderRadius: radius.md,
		padding: `${spacing[2]} ${spacing[4]}`,
		fontSize: font.size.base,
		fontWeight: font.weight.medium,
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[2],
		minHeight: "44px",
		boxSizing: "border-box",
		transition: "background-color 0.15s ease, color 0.15s ease",
	},

	input: {
		background: colors.cardBg,
		border: `1px solid ${colors.borderDefault}`,
		borderRadius: radius.md,
		padding: `${spacing[2]} ${spacing[3]}`,
		fontSize: font.size.md, // 16px to prevent iOS Safari auto-zoom
		color: colors.textBody,
		outline: "none",
		width: "100%",
		minHeight: "44px",
		boxSizing: "border-box",
		fontFamily: font.family.sans,
		transition: "border-color 0.15s ease, box-shadow 0.15s ease",
	},

	sectionLabel: {
		fontSize: font.size.xs,
		fontWeight: font.weight.semibold,
		color: colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: font.letterSpacing.caps,
	},

	avatar: {
		width: "36px",
		height: "36px",
		borderRadius: radius.full,
		background: colors.shellSurface,
		color: colors.shellText,
		border: `1px solid ${colors.shellBorder}`,
		fontSize: font.size.xs,
		fontWeight: font.weight.semibold,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},

	tab: {
		minHeight: "44px",
		minWidth: "44px",
		padding: `${spacing[2]} ${spacing[4]}`,
		borderRadius: radius.full,
		fontSize: font.size.sm,
		fontFamily: font.family.sans,
		fontWeight: font.weight.medium,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
		border: `1px solid ${colors.borderSubtle}`,
		boxSizing: "border-box",
		transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
	},
};

export function badgeStyle(key) {
	const s = status[key] || status.info;
	return {
		background: s.bg,
		color: s.text,
		border: `1px solid ${s.border}`,
		borderRadius: radius.full,
		fontSize: font.size.xs,
		fontWeight: font.weight.semibold,
		padding: `3px ${spacing[2]}`,
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
	};
}
