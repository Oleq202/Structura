import { useState, useEffect, useRef } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
	status,
} from "../theme";
import { translations } from "../i18n";
import BuildingModal from "./BuildingModal";
import * as api from "../services/api";

const ICONS = {
	buildings: (
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
	plus: (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	),
	edit: (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
	),
	trash: (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</svg>
	),
	mapPin: (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	),
};

export default function BuildingsManagementModal({
	onClose,
	language = "pl",
}) {
	const t = translations[language];
	const [buildings, setBuildings] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingBuilding, setEditingBuilding] = useState(null);
	const bodyRef = useRef(null);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		api.getBuildings()
			.then(setBuildings)
			.catch(console.error);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && !editingBuilding) {
				onClose?.();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, editingBuilding]);

	const handleEdit = (building) => {
		setEditingBuilding(building);
	};

	const handleDelete = async (buildingId) => {
		if (confirm(t.deleteBuildingConfirm)) {
			await api.deleteBuilding(buildingId);
			setBuildings(buildings.filter((b) => b.id !== buildingId));
		}
	};

	const handleBuildingSaved = async (savedBuilding) => {
		try {
			if (editingBuilding?.id) {
				const updated = await api.updateBuilding(savedBuilding.id, savedBuilding);
				setBuildings(buildings.map((b) => (b.id === updated.id ? updated : b)));
			} else {
				const created = await api.createBuilding(savedBuilding);
				setBuildings([...buildings, created]);
			}
		} catch (err) {
			console.error("Error saving building", err);
		}
		setEditingBuilding(null);
	};

	const filteredBuildings = buildings.filter((b) => {
		const search = searchQuery.toLowerCase();
		const address = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.toLowerCase();
		return address.includes(search);
	});

	return (
		<>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "rgba(9, 21, 42, 0.65)",
					backdropFilter: "blur(6px)",
					WebkitBackdropFilter: "blur(6px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 2500,
					padding: spacing[4],
				}}
				onClick={() => onClose?.()}
			>
				<div
					style={{
						background: colors.cardBg,
						borderRadius: radius.xl,
						boxShadow: shadow.modal,
						border: `1px solid ${colors.borderSubtle}`,
						width: "100%",
						maxWidth: "580px",
						maxHeight: "85vh",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
						boxSizing: "border-box",
						fontFamily: font.family.sans,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<div
						style={{
							padding: `${spacing[4]} ${spacing[5]}`,
							background: colors.shellDeep,
							color: colors.shellText,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexShrink: 0,
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
								{ICONS.buildings}
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
									{t.manageBuildings || t.buildings || "Buildings"}
								</h3>
								<p
									style={{
										margin: "2px 0 0 0",
										fontSize: font.size.xs,
										color: colors.shellTextMuted,
									}}
								>
									{buildings.length} {t.allBuildingsCount || (language === "pl" ? "budynków" : "buildings")}
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
							aria-label={t.close || "Close"}
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
							alignItems: "center",
							gap: spacing[3],
						}}
					>
						<div
							style={{
								position: "relative",
								display: "flex",
								alignItems: "center",
								flex: 1,
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
									width: "100%",
									boxSizing: "border-box",
								}}
							/>
						</div>
						<button
							type="button"
							onClick={() => setEditingBuilding({})}
							style={{
								...components.primaryButton,
								display: "flex",
								alignItems: "center",
								gap: spacing[2],
								padding: `${spacing[2]} ${spacing[4]}`,
								fontSize: font.size.sm,
								borderRadius: radius.md,
								whiteSpace: "nowrap",
							}}
						>
							{ICONS.plus}
							<span>{t.addBuildingButton || "Add Building"}</span>
						</button>
					</div>

					<div
						ref={bodyRef}
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
								{t.noResults || "No buildings found"}
							</div>
						) : (
							filteredBuildings.map((building) => (
								<div
									key={building.id}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "8px 12px",
										borderRadius: radius.md,
										background: colors.pageBg,
										border: `1px solid ${colors.borderSubtle}`,
										gap: spacing[3],
									}}
								>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: font.weight.big,
												color: colors.textHeading,
												fontSize: "13px",
												lineHeight: 1.3,
												wordBreak: "break-word",
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
												marginTop: "3px",
											}}
										>
											{ICONS.mapPin}
											<span>{[building.district, building.city].filter(Boolean).join(", ")}</span>
										</div>
									</div>

									<div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
										<button
											type="button"
											onClick={() => handleEdit(building)}
											style={{
												...components.ghostButton,
												display: "flex",
												alignItems: "center",
												gap: "4px",
												padding: "4px 8px",
												fontSize: "11px",
												borderRadius: radius.sm,
											}}
										>
											{ICONS.edit}
											<span>{t.edit || "Edit"}</span>
										</button>
										<button
											type="button"
											onClick={() => handleDelete(building.id)}
											style={{
												background: "transparent",
												border: `1px solid ${status.danger.border}`,
												color: status.danger.text,
												display: "flex",
												alignItems: "center",
												gap: "4px",
												padding: "4px 8px",
												fontSize: "11px",
												borderRadius: radius.sm,
												cursor: "pointer",
												transition: "background 0.15s",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.background = status.danger.bg)
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.background = "transparent")
											}
										>
											{ICONS.trash}
											<span>{t.delete || "Delete"}</span>
										</button>
									</div>
								</div>
							))
						)}
					</div>

					<div
						style={{
							padding: `${spacing[3]} ${spacing[5]}`,
							background: colors.pageBg,
							borderTop: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							justifyContent: "flex-end",
							flexShrink: 0,
						}}
					>
						<button
							type="button"
							onClick={onClose}
							style={{
								...components.ghostButton,
								padding: `${spacing[2]} ${spacing[5]}`,
								fontSize: font.size.sm,
							}}
						>
							{t.close || (language === "pl" ? "Zamknij" : "Close")}
						</button>
					</div>
				</div>
			</div>

			{editingBuilding && (
				<BuildingModal
					building={editingBuilding.id ? editingBuilding : null}
					onClose={() => setEditingBuilding(null)}
					onSave={handleBuildingSaved}
					language={language}
				/>
			)}
		</>
	);
}
