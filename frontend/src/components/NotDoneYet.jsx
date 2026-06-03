import { colors, radius, shadow, spacing, font } from "../theme";

const labelStyle = {
    fontSize: font.size.sm,
    fontFamily: font.family.sans,
    color: colors.textSecondary,
    marginBottom: spacing[1],
    display: "block",
};

export default function NotDoneYet({ text }) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: `0 ${spacing[4]}`,
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "360px",
                    background: colors.cardBg,
                    borderRadius: radius.xl,
                    border: `0.5px solid ${colors.cardBorder}`,
                    padding: spacing[8],
                    boxShadow: shadow.modal,
                    boxSizing: "border-box",
                    position: "relative",
                }}
            >
                <h2
                    style={{
                        fontSize: font.size.lg,
                        fontWeight: font.weight.medium,
                        color: colors.textHeading,
                        letterSpacing: font.letterSpacing.tight,
                        lineHeight: font.lineHeight.tight,
                        marginBottom: spacing[3],
                    }}
                >
                    {text} is under construction!
                </h2>
                <p style={labelStyle}>
                    We're working hard to bring you this feature. Stay tuned!
                </p>
            </div>
        </div>
    );
}
