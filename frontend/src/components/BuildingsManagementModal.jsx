import { useState, useEffect } from "react";
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

export default function BuildingsManagementModal({
	onClose,
	language,
}) {
	const t = translations[language];
	const [buildings, setBuildings] = useState(
		[]
	);
	const [editingBuilding, setEditingBuilding] =
		useState(null);

	useEffect(() => {
		api.getBuildings()
			.then(setBuildings)
			.catch(console.error);
	}, []);

	const handleEdit = (building) => {
		setEditingBuilding(building);
	};

	const handleDelete = async (buildingId) => {
		if (confirm(t.deleteBuildingConfirm)) {
			await api.deleteBuilding(buildingId);
			setBuildings(
				buildings.filter(
					(b) => b.id !== buildingId
				)
			);
		}
	};

	const handleBuildingSaved = async (
		savedBuilding
	) => {
		if (editingBuilding?.id) {
			const updated =
				await api.updateBuilding(
					savedBuilding.id,
					savedBuilding
				);
			setBuildings(
				buildings.map((b) =>
					b.id === updated.id
						? updated
						: b
				)
			);
		} else {
			const created =
				await api.createBuilding(
					savedBuilding
				);
			setBuildings([...buildings, created]);
		}
		setEditingBuilding(null);
	};

	return (
		<>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					width: "100vw",
					height: "100vh",
					background:
						"rgba(0, 0, 0, 0.4)",
					backdropFilter: "blur(6px)",
					WebkitBackdropFilter:
						"blur(6px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: `0 ${spacing[4]}`,
					boxSizing: "border-box",
					zIndex: 100,
				}}
				onClick={() => onClose?.()}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						e.preventDefault();
						onClose?.();
					}
				}}
			>
				<div
					style={{
						width: "100%",
						maxWidth: "550px",
						maxHeight: "90vh",
						overflowY: "auto",
						background: colors.cardBg,
						borderRadius: radius.xl,
						border: `0.5px solid ${colors.cardBorder}`,
						padding: spacing[8],
						boxShadow: shadow.modal,
						boxSizing: "border-box",
						position: "relative",
					}}
					onClick={(e) =>
						e.stopPropagation()
					}
				>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onClose?.();
						}}
						style={{
							position: "absolute",
							top: spacing[4],
							right: spacing[4],
							background:
								"transparent",
							border: "none",
							color: colors.textSecondary,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent:
								"center",
							padding: spacing[1],
						}}
						aria-label={t.close}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
						>
							<line
								x1="18"
								y1="6"
								x2="6"
								y2="18"
							></line>
							<line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							></line>
						</svg>
					</button>

					<h1
						style={{
							fontSize:
								font.size["2xl"],
							fontWeight:
								font.weight
									.medium,
							color: colors.textHeading,
							marginBottom:
								spacing[6],
							marginTop: 0,
							letterSpacing:
								font.letterSpacing
									.tight,
							lineHeight:
								font.lineHeight
									.tight,
						}}
					>
						{t.addBuilding}
					</h1>

					<button
						type="button"
						onClick={() =>
							setEditingBuilding({})
						}
						style={{
							...components.primaryButton,
							width: "100%",
							padding: `${spacing[3]} ${spacing[4]}`,
							borderRadius:
								radius.lg,
							fontSize:
								font.size.base,
							fontFamily:
								font.family.sans,
							fontWeight:
								font.weight
									.medium,
							letterSpacing:
								font.letterSpacing
									.wide,
							cursor: "pointer",
							boxSizing:
								"border-box",
							marginBottom:
								spacing[6],
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background =
								colors.primaryHover)
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background =
								colors.primary)
						}
						aria-label={
							t.addBuildingButton
						}
					>
						{t.addBuildingButton}
					</button>

					<div
						style={{
							display: "flex",
							flexDirection:
								"column",
							gap: spacing[3],
							maxHeight: "60vh",
							overflowY: "auto",
							paddingRight:
								spacing[2],
						}}
					>
						{buildings.map(
							(building) => (
								<div
									key={
										building.id
									}
									style={{
										display:
											"flex",
										justifyContent:
											"space-between",
										alignItems:
											"center",
										padding: `${spacing[3]} ${spacing[4]}`,
										background:
											colors.pageBg,
										borderRadius:
											radius.lg,
										border: `0.5px solid ${colors.cardBorder}`,
										gap: spacing[4],
									}}
								>
									<div
										style={{
											display:
												"flex",
											flexDirection:
												"column",
											gap: spacing[1],
										}}
									>
										<span
											style={{
												fontSize:
													font
														.size
														.base,
												fontWeight:
													font
														.weight
														.medium,
												color: colors.textHeading,
											}}
										>
											{
												building.street_address
											}
										</span>
										<span
											style={{
												fontSize:
													font
														.size
														.sm,
												color: colors.textSecondary,
											}}
										>
											{building.district
												? `${building.district}, `
												: ""}
											{
												building.city
											}
										</span>
									</div>
									<div
										style={{
											display:
												"flex",
											gap: spacing[2],
											flexShrink: 0,
										}}
									>
										<button
											type="button"
											onClick={() =>
												handleEdit(
													building
												)
											}
											style={{
												background:
													"transparent",
												border: `1px solid ${colors.borderDefault}`,
												color: colors.textBody,
												padding: `${spacing[1]} ${spacing[2]}`,
												borderRadius:
													radius.md,
												fontSize:
													font
														.size
														.xs,
												fontFamily:
													font
														.family
														.sans,
												fontWeight:
													font
														.weight
														.medium,
												cursor: "pointer",
												transition:
													"border-color 0.15s, color 0.15s",
												whiteSpace:
													"nowrap",
											}}
											onMouseEnter={(
												e
											) => {
												e.currentTarget.style.borderColor =
													colors.borderStrong;
												e.currentTarget.style.color =
													colors.textHeading;
											}}
											onMouseLeave={(
												e
											) => {
												e.currentTarget.style.borderColor =
													colors.borderDefault;
												e.currentTarget.style.color =
													colors.textBody;
											}}
											aria-label={
												t.edit
											}
										>
											{
												t.edit
											}
										</button>
										<button
											type="button"
											onClick={() =>
												handleDelete(
													building.id
												)
											}
											style={{
												background:
													"transparent",
												border: `1px solid ${status.danger.border}`,
												color: status
													.danger
													.text,
												padding: `${spacing[1]} ${spacing[2]}`,
												borderRadius:
													radius.md,
												fontSize:
													font
														.size
														.xs,
												fontFamily:
													font
														.family
														.sans,
												fontWeight:
													font
														.weight
														.medium,
												cursor: "pointer",
												transition:
													"background 0.15s",
												whiteSpace:
													"nowrap",
											}}
											onMouseEnter={(
												e
											) => {
												e.currentTarget.style.background =
													status.danger.bg;
											}}
											onMouseLeave={(
												e
											) => {
												e.currentTarget.style.background =
													"transparent";
											}}
											aria-label={
												t.delete
											}
										>
											{
												t.delete
											}
										</button>
									</div>
								</div>
							)
						)}
					</div>
				</div>
			</div>

			{editingBuilding !== null && (
				<BuildingModal
					building={
						editingBuilding.id
							? editingBuilding
							: null
					}
					onClose={() =>
						setEditingBuilding(null)
					}
					onSave={handleBuildingSaved}
					language={language}
				/>
			)}
		</>
	);
}
