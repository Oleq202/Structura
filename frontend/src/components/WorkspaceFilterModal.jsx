import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
} from "../theme";
import { translations } from "../i18n";

const ICONS = {
	building: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01" />
			<path d="M16 6h.01" />
			<path d="M12 6h.01" />
			<path d="M12 10h.01" />
			<path d="M12 14h.01" />
			<path d="M16 10h.01" />
			<path d="M16 14h.01" />
			<path d="M8 10h.01" />
			<path d="M8 14h.01" />
		</svg>
	),
	search: (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	),
	close: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	check: (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	),
	mapPin: (
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
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	),
};

export default function WorkspaceFilterModal({
	buildings = [],
	selectedBuildingIds = null,
	onSave,
	onClose,
	language = "pl",
}) {
	const t = translations[language];
	const [tempSelectedIds, setTempSelectedIds] = useState(
		new Set(
			Array.isArray(selectedBuildingIds)
				? selectedBuildingIds
				: buildings.map((b) => b.id)
		)
	);
	const [searchQuery, setSearchQuery] = useState("");
	const scrollRef = useRef(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = 0;
		}
	}, []);

	const filteredBuildings = buildings.filter((b) => {
		const searchLower = searchQuery.toLowerCase();
		const address = `${b.street_address} ${b.district || ""} ${b.city}`.toLowerCase();
		return address.includes(searchLower);
	});

	const handleToggleBuilding = (id) => {
		const next = new Set(tempSelectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		setTempSelectedIds(next);
	};

	const handleSelectAll = () => {
		setTempSelectedIds(new Set(buildings.map((b) => b.id)));
	};

	const handleClearAll = () => {
		setTempSelectedIds(new Set());
	};

	const handleSave = () => {
		const result = Array.from(tempSelectedIds);
		onSave(result);
		onClose();
	};

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(9, 21, 42, 0.65)",
				backdropFilter: "blur(6px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 2500,
				padding: spacing[4],
			}}
		>
			<div
				style={{
					background: colors.cardBg,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "500px",
					maxHeight: "85vh",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
				}}
			>
				<div
					style={{
						padding: `${spacing[4]} ${spacing[5]}`,
						background: colors.shellDeep,
						color: colors.shellText,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
						<div
							style={{
								width: "36px",
								height: "36px",
								borderRadius: radius.md,
								background: "rgba(255,255,255,0.12)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: colors.primary,
							}}
						>
							{ICONS.building}
						</div>
						<div>
							<h3
								style={{
									margin: 0,
									fontSize: font.size.md,
									fontWeight: font.weight.big,
									color: "#ffffff",
								}}
							>
								{t.workspaceFilter || "Customize Workspace"}
							</h3>
							<p
								style={{
									margin: "2px 0 0 0",
									fontSize: font.size.xs,
									color: colors.shellTextMuted,
								}}
							>
								{t.showingBuildings || "Showing"}{" "}
								<strong style={{ color: "#ffffff" }}>{tempSelectedIds.size}</strong>{" "}
								{t.ofBuildings || "of"} {buildings.length} {t.buildingsCount || "buildings"}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "rgba(255,255,255,0.08)",
							border: "none",
							borderRadius: radius.full,
							width: "32px",
							height: "32px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							color: colors.shellTextMuted,
							transition: "background 0.15s, color 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.2)";
							e.currentTarget.style.color = "#ffffff";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.08)";
							e.currentTarget.style.color = colors.shellTextMuted;
						}}
					>
						{ICONS.close}
					</button>
				</div>

				<div
					style={{
						padding: `${spacing[3]} ${spacing[5]}`,
						background: colors.pageBg,
						borderBottom: `1px solid ${colors.borderSubtle}`,
						display: "flex",
						flexDirection: "column",
						gap: spacing[2],
					}}
				>
					<div
						style={{
							position: "relative",
							display: "flex",
							alignItems: "center",
						}}
					>
						<span
							style={{
								position: "absolute",
								left: spacing[3],
								color: colors.textSecondary,
								display: "flex",
								alignItems: "center",
							}}
						>
							{ICONS.search}
						</span>
						<input
							type="text"
							placeholder={t.searchBuildings || "Search buildings..."}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							style={{
								...components.input,
								paddingLeft: spacing[8],
								fontSize: font.size.sm,
								borderRadius: radius.md,
							}}
						/>
					</div>

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: `0 ${spacing[1]}`,
						}}
					>
						<button
							type="button"
							onClick={handleSelectAll}
							style={{
								background: "none",
								border: "none",
								color: colors.primary,
								fontSize: font.size.xs,
								fontWeight: font.weight.big,
								cursor: "pointer",
								padding: `${spacing[1]} 0`,
							}}
						>
							{t.selectAll || "Select All"}
						</button>
						<button
							type="button"
							onClick={handleClearAll}
							style={{
								background: "none",
								border: "none",
								color: colors.textSecondary,
								fontSize: font.size.xs,
								fontWeight: font.weight.medium,
								cursor: "pointer",
								padding: `${spacing[1]} 0`,
							}}
						>
							{t.clearAll || "Clear"}
						</button>
					</div>
				</div>

				<div
					ref={scrollRef}
					style={{
						padding: `${spacing[3]} ${spacing[5]}`,
						overflowY: "auto",
						flex: 1,
						display: "flex",
						flexDirection: "column",
						gap: spacing[2],
						background: colors.cardBg,
					}}
				>
					{filteredBuildings.length === 0 ? (
						<div
							style={{
								padding: `${spacing[8]} 0`,
								textAlign: "center",
								color: colors.textSecondary,
								fontSize: font.size.sm,
							}}
						>
							{t.noResults || "No buildings match your search"}
						</div>
					) : (
						filteredBuildings.map((building) => {
							const isChecked = tempSelectedIds.has(building.id);
							return (
								<div
									key={building.id}
									onClick={() => handleToggleBuilding(building.id)}
									style={{
										display: "flex",
										alignItems: "center",
										gap: spacing[3],
										padding: `${spacing[2]} ${spacing[3]}`,
										borderRadius: radius.md,
										background: isChecked ? `${colors.primary}12` : colors.pageBg,
										border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
										cursor: "pointer",
										transition: "border 0.15s, background 0.15s",
									}}
								>
									<div
										style={{
											width: "20px",
											height: "20px",
											borderRadius: radius.sm,
											border: `1.5px solid ${isChecked ? colors.primary : colors.borderDefault}`,
											background: isChecked ? colors.primary : colors.cardBg,
											color: "#ffffff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
											transition: "all 0.15s ease",
										}}
									>
										{isChecked && ICONS.check}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: font.weight.big,
												color: colors.textHeading,
												fontSize: font.size.sm,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{building.street_address}
										</div>
										<div
											style={{
												fontSize: font.size.xs,
												color: colors.textSecondary,
												display: "flex",
												alignItems: "center",
												gap: "4px",
												marginTop: "2px",
											}}
										>
											{ICONS.mapPin}
											<span>{[building.district, building.city].filter(Boolean).join(", ")}</span>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>

				<div
					style={{
						padding: `${spacing[3]} ${spacing[5]}`,
						background: colors.pageBg,
						borderTop: `1px solid ${colors.borderSubtle}`,
						display: "flex",
						justifyContent: "flex-end",
						gap: spacing[2],
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{
							...components.ghostButton,
							padding: `${spacing[2]} ${spacing[4]}`,
							fontSize: font.size.sm,
						}}
					>
						{t.cancel || "Cancel"}
					</button>
					<button
						type="button"
						onClick={handleSave}
						style={{
							...components.primaryButton,
							padding: `${spacing[2]} ${spacing[5]}`,
							fontSize: font.size.sm,
						}}
					>
						{t.update || "Apply"}
					</button>
				</div>
			</div>
		</div>
	);
}
