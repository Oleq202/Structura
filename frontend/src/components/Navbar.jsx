import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
} from "../theme";
import { translations } from "../i18n";

const EMPTY_BUILDINGS = [];

const staticFilters = [
	{ key: "all", labelKey: "all" },
	{ key: "pending", labelKey: "pending" },
	{
		key: "completed",
		labelKey: "completed",
	},
];

const navbarStyle = {
	...components.topBar,
};

const filterButtonBaseStyle = {
	display: "inline-flex",
	alignItems: "center",
	gap: spacing[1],
	whiteSpace: "nowrap",
	flexShrink: 0,
	cursor: "pointer",
	fontFamily: font.family.sans,
	fontSize: font.size.s,
	letterSpacing: font.letterSpacing.wide,
	borderRadius: radius.full,
	padding: `${spacing[2]} ${spacing[4]}`,
	transition:
		"background 0.15s, color 0.15s, box-shadow 0.15s",
	outline: "none",
};

export default function Navbar({
	activeFilter = "all",
	onFilterChange = () => {},
	buildings = EMPTY_BUILDINGS,
	language = "pl",
}) {
	const t = translations[language];
	const filters = [
		...staticFilters,
		...buildings,
	];
	return (
		<nav style={navbarStyle}>
			{filters.map(
				({ key, label, labelKey }) => {
					const isActive =
						activeFilter === key;
					const isBuilding = ![
						"all",
						"pending",
						"completed",
					].includes(key);
					const displayLabel = labelKey
						? t[labelKey]
						: label;

					return (
						<button
							type="button"
							key={key}
							onClick={() =>
								onFilterChange(
									key
								)
							}
							style={{
								...filterButtonBaseStyle,
								border: isActive
									? "none"
									: `1px solid ${colors.shellTextMuted}`,
								fontWeight:
									isActive
										? font
												.weight
												.big
										: font
												.weight
												.medium,
								background:
									isActive
										? colors.primary
										: "transparent",
								color: isActive
									? colors.primaryText
									: colors.shellTextMuted,
								boxShadow:
									isActive
										? shadow.card
										: "none",
							}}
							onMouseEnter={(e) => {
								if (!isActive) {
									e.currentTarget.style.background =
										"rgba(255,255,255,0.14)";
									e.currentTarget.style.color =
										colors.shellText;
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
										borderRadius:
											radius.full,
										background:
											isActive
												? colors.primaryText
												: colors.shellTextMuted,
										display:
											"inline-block",
										flexShrink: 0,
										transition:
											"background 0.15s",
									}}
								/>
							)}
							{displayLabel}
						</button>
					);
				}
			)}
		</nav>
	);
}
