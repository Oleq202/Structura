import { colors, font, spacing, radius, shadow, components } from "../theme";

export default function Navbar({
    activeFilter = "all",
    onFilterChange = () => {},
    buildings = [],
}) {
    const staticFilters = [
        { key: "all", label: "All" },
        { key: "done", label: "Done" },
    ];

    const filters = [...staticFilters, ...buildings];

    return (
        <nav style={{ ...components.topBar }}>
            {filters.map(({ key, label }) => {
                const isActive = activeFilter === key;
                const isBuilding = !["all", "done"].includes(key);

                return (
                    <button
                        key={key}
                        onClick={() => onFilterChange(key)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: spacing[1],
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            border: isActive
                                ? "none"
                                : `1px solid ${colors.shellTextMuted}`,
                            cursor: "pointer",
                            fontFamily: font.family.sans,
                            fontSize: font.size.s,
                            fontWeight: isActive
                                ? font.weight.big
                                : font.weight.medium,
                            letterSpacing: font.letterSpacing.wide,
                            borderRadius: radius.full,
                            padding: `${spacing[2]} ${spacing[4]}`,
                            transition:
                                "background 0.15s, color 0.15s, box-shadow 0.15s",
                            background: isActive
                                ? colors.primary
                                : "transparent",
                            color: isActive
                                ? colors.primaryText
                                : colors.shellTextMuted,

                            boxShadow: isActive ? shadow.card : "none",
                            outline: "none",
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background =
                                    "rgba(255,255,255,0.14)";
                                e.currentTarget.style.color = colors.shellText;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.background =
                                    "rgba(255,255,255,0.08)";
                                e.currentTarget.style.color =
                                    colors.shellTextMuted;
                            }
                        }}
                    >
                        {isBuilding && (
                            <span
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: radius.full,
                                    background: isActive
                                        ? colors.primaryText
                                        : colors.shellTextMuted,
                                    display: "inline-block",
                                    flexShrink: 0,
                                    transition: "background 0.15s",
                                }}
                            />
                        )}
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}
