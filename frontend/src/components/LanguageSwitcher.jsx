import { colors, font, spacing, radius } from "../theme";

export default function LanguageSwitcher({ language, onLanguageChange }) {
    return (
        <button
            onClick={onLanguageChange}
            style={{
                background: "transparent",
                border: `1px solid ${colors.borderSubtle}`,
                borderRadius: radius.md,
                padding: `${spacing[1]} ${spacing[3]}`,
                fontSize: font.size.sm,
                fontFamily: font.family.sans,
                fontWeight: font.weight.medium,
                color: colors.textSecondary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: spacing[2],
                transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderDefault;
                e.currentTarget.style.color = colors.textBody;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.borderSubtle;
                e.currentTarget.style.color = colors.textSecondary;
            }}
        >
            <span
                style={{
                    fontSize: font.size.sm,
                    fontWeight: font.weight.bold,
                }}
            >
                {language === "pl" ? "PL" : "EN"}
            </span>
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M4 12h16M12 4v16" />
            </svg>
        </button>
    );
}
