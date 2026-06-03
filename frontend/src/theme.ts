export const navy = {
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
} as const;

export const blue = {
    50: "#e0f0fd",
    100: "#b3d9fa",
    200: "#7bbef5",
    300: "#4db3ff",
    400: "#2e8de4",
    500: "#1a6ec0",
    600: "#1560a8",
    700: "#0e4d8a",
    800: "#0a3a6b",
    900: "#062849",
} as const;

export const neutral = {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f0f4f8",
    200: "#dce6f2",
    300: "#b0c4d8",
    400: "#7a96b0",
    500: "#5a7a9a",
    600: "#3a5068",
    700: "#213545",
    800: "#0f2030",
    900: "#080f18",
} as const;

export const status = {
    urgent: {
        bg: "#fff0e6",
        border: "#f0a06a",
        text: "#a34200",
    },
    inProgress: {
        bg: "#e0ecfa",
        border: "#85b7eb",
        text: "#0e4d8a",
    },
    done: {
        bg: "#eaf3de",
        border: "#97c459",
        text: "#2d5e10",
    },
    new: {
        bg: "#f4f7fb",
        border: "#b0c4d8",
        text: "#3a5068",
    },
    danger: {
        bg: "#fcebeb",
        border: "#f09595",
        text: "#791f1f",
    },
    warning: {
        bg: "#faeeda",
        border: "#ef9f27",
        text: "#633806",
    },
    success: {
        bg: "#eaf3de",
        border: "#97c459",
        text: "#27500a",
    },
    info: {
        bg: "#e0ecfa",
        border: "#85b7eb",
        text: "#0c447c",
    },
} as const;

export const colors = {
    shellLight: navy[400],
    shell: navy[500],
    shellDeep: navy[600],
    deepNavy: navy[700],
    shellText: "#ffffff",
    shellTextMuted: "#a8d4f5",

    pageBg: neutral[50],
    cardBg: neutral[0],
    cardBorder: neutral[200],

    primary: blue[400],
    primaryHover: blue[500],
    primaryText: "#ffffff",

    textHeading: neutral[800],
    textBody: neutral[700],
    textSecondary: neutral[500],
    textMuted: neutral[300],
    textDisabled: neutral[300],

    borderSubtle: neutral[200],
    borderDefault: neutral[300],
    borderStrong: neutral[400],

    avatarBg: navy[500],
    avatarText: blue[200],
} as const;

export const font = {
    family: {
        sans: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    size: {
        xs: "11px",
        sm: "12px",
        base: "14px",
        md: "15px",
        lg: "17px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "30px",
    },
    weight: {
        regular: 400,
        medium: 500,
        big: 600,
        bold: 700,
    },
    lineHeight: {
        tight: 1.3,
        normal: 1.6,
        loose: 1.8,
    },
    letterSpacing: {
        tight: "-0.01em",
        normal: "0em",
        wide: "0.04em",
        caps: "0.08em",
    },
} as const;

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
} as const;

export const radius = {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
} as const;

export const shadow = {
    none: "none",
    card: "0 1px 3px rgba(9, 21, 42, 0.08)",
    modal: "0 8px 32px rgba(9, 21, 42, 0.16)",
    focus: `0 0 0 3px ${blue[200]}`,
} as const;

export const components = {
    topBar: {
        background: colors.shellLight,
        borderBottom: `1px solid ${colors.shellDeep}`,
        padding: `${spacing[2]} ${spacing[1]} ${spacing[3]}`,
        // borderRadius: radius.lg,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexShrink: 0,
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
    },

    filterStrip: {
        background: colors.shellDeep,
        padding: `${spacing[2]} ${spacing[4]}`,
        display: "flex",
        gap: spacing[2],
    },

    bottomNav: {
        background: colors.shell,
        borderTop: `1px solid ${colors.shellDeep}`,
        padding: `${spacing[2]} ${spacing[1]} ${spacing[3]}`,
        // borderRadius: radius.lg,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexShrink: 0,
    },

    card: {
        background: colors.cardBg,
        border: `0.5px solid ${colors.cardBorder}`,
        borderRadius: radius.lg,
        padding: `${spacing[3]}`,
        boxShadow: shadow.card,
    },

    primaryButton: {
        background: colors.primary,
        color: colors.primaryText,
        borderRadius: radius.md,
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: font.size.base,
        fontWeight: font.weight.medium,
        border: "none",
        cursor: "pointer",
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
    },

    input: {
        background: colors.cardBg,
        border: `0.5px solid ${colors.borderDefault}`,
        borderRadius: radius.md,
        padding: `${spacing[2]} ${spacing[3]}`,
        fontSize: font.size.base,
        color: colors.textBody,
        outline: "none",
        width: "100%",
    },

    sectionLabel: {
        fontSize: font.size.xs,
        fontWeight: font.weight.medium,
        color: colors.textSecondary,
        textTransform: "uppercase" as const,
        letterSpacing: font.letterSpacing.caps,
    },

    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: radius.full,
        background: colors.avatarBg,
        color: colors.avatarText,
        fontSize: font.size.xs,
        fontWeight: font.weight.medium,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
} as const;

export type StatusKey = keyof typeof status;

export function badgeStyle(key: StatusKey): React.CSSProperties {
    const s = status[key];
    return {
        background: s.bg,
        color: s.text,
        border: `0.5px solid ${s.border}`,
        borderRadius: radius.sm,
        fontSize: font.size.xs,
        fontWeight: font.weight.medium,
        padding: `2px ${spacing[2]}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
    };
}

export const cssVars = `
  :root {
    --color-shell:           ${colors.shell};
    --color-shell-deep:      ${colors.shellDeep};
    --color-shell-text:      ${colors.shellText};
    --color-shell-muted:     ${colors.shellTextMuted};

    --color-page-bg:         ${colors.pageBg};
    --color-card-bg:         ${colors.cardBg};
    --color-card-border:     ${colors.cardBorder};

    --color-primary:         ${colors.primary};
    --color-primary-hover:   ${colors.primaryHover};
    --color-primary-text:    ${colors.primaryText};

    --color-text-heading:    ${colors.textHeading};
    --color-text-body:       ${colors.textBody};
    --color-text-secondary:  ${colors.textSecondary};
    --color-text-muted:      ${colors.textMuted};

    --color-border-subtle:   ${colors.borderSubtle};
    --color-border-default:  ${colors.borderDefault};
    --color-border-strong:   ${colors.borderStrong};

    --font-sans:             ${font.family.sans};
    --font-mono:             ${font.family.mono};

    --radius-sm:  ${radius.sm};
    --radius-md:  ${radius.md};
    --radius-lg:  ${radius.lg};
    --radius-xl:  ${radius.xl};
    --radius-full:${radius.full};

    --shadow-card: ${shadow.card};
    --shadow-modal:${shadow.modal};
    --shadow-focus:${shadow.focus};
  }
`;
