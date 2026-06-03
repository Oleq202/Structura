import { colors, font, spacing } from "../theme";

export default function AppHeader() {
    return (
        <div
            style={{
                background: colors.shell,
                height: "52px",
                display: "flex",
                alignItems: "center",
                gap: spacing[3],
                padding: `0 ${spacing[4]}`,
                boxSizing: "border-box",
                flexShrink: 0,
            }}
        >
            <img
                src="/favicon.png"
                alt="Structura logo"
                style={{
                    width: "36px",
                    height: "36px",
                    alignSelf: "center",
                    marginTop: "-4px",
                }}
            />
            <span
                style={{
                    fontFamily: font.family.sans,
                    fontSize: font.size.xl,
                    fontWeight: font.weight.bold,
                    color: colors.shellText,
                    letterSpacing: font.letterSpacing.tight,
                    lineHeight: "52px",
                }}
            >
                Structura
            </span>
        </div>
    );
}
