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

const modalOverlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	width: "100vw",
	height: "100vh",
	background: "rgba(0, 0, 0, 0.4)",
	backdropFilter: "blur(6px)",
	WebkitBackdropFilter: "blur(6px)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: `0 ${spacing[4]}`,
	boxSizing: "border-box",
	zIndex: 10000,
};

const modalContentStyle = {
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
};

const closeButtonStyle = {
	position: "absolute",
	top: spacing[4],
	right: spacing[4],
	background: "transparent",
	border: "none",
	color: colors.textSecondary,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: spacing[1],
};

const headingStyle = {
	fontSize: font.size["2xl"],
	fontWeight: font.weight.medium,
	color: colors.textHeading,
	marginBottom: spacing[6],
	marginTop: 0,
	letterSpacing: font.letterSpacing.tight,
	lineHeight: font.lineHeight.tight,
};

const buttonGroupStyle = {
	display: "flex",
	gap: spacing[3],
	marginTop: spacing[2],
};

const cancelButtonStyle = {
	flex: 1,
	background: "transparent",
	border: `1px solid ${colors.borderDefault}`,
	color: colors.textBody,
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	boxSizing: "border-box",
};

const buildingListStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[3],
	marginTop: spacing[4],
};

const buildingItemStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: `${spacing[3]} ${spacing[4]}`,
	background: colors.cardBg,
	border: `0.5px solid ${colors.cardBorder}`,
	borderRadius: radius.lg,
	transition:
		"border-color 0.15s, background 0.15s",
};

const buildingInfoStyle = {
	flex: 1,
};

const buildingAddressStyle = {
	fontSize: font.size.base,
	fontWeight: font.weight.medium,
	color: colors.textBody,
	marginBottom: spacing[1],
};

const buildingLocationStyle = {
	fontSize: font.size.sm,
	color: colors.textSecondary,
};

const actionButtonsStyle = {
	display: "flex",
	gap: spacing[2],
	flexShrink: 0,
};

const editButtonStyle = {
	background: "transparent",
	border: `1px solid ${colors.borderDefault}`,
	color: colors.textBody,
	padding: `${spacing[1]} ${spacing[2]}`,
	borderRadius: radius.md,
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	transition: "border-color 0.15s, color 0.15s",
	whiteSpace: "nowrap",
};

const deleteButtonStyle = {
	background: "transparent",
	border: `1px solid ${status.danger.border}`,
	color: status.danger.text,
	padding: `${spacing[1]} ${spacing[2]}`,
	borderRadius: radius.md,
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	transition: "background 0.15s",
	whiteSpace: "nowrap",
};

const iconButtonStyle = {
	background: "transparent",
	border: "none",
	color: colors.textSecondary,
	cursor: "pointer",
	padding: spacing[2],
	borderRadius: radius.sm,
	transition: "color 0.15s, background 0.15s",
};

const emptyStateStyle = {
	textAlign: "center",
	padding: spacing[8],
	color: colors.textSecondary,
};

const addBuildingButtonStyle = {
	...components.primaryButton,
	width: "100%",
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: "pointer",
	boxSizing: "border-box",
	marginBottom: spacing[6],
};

const buildingsContainerStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[3],
	maxHeight: "60vh",
	overflowY: "auto",
	paddingRight: spacing[1],
};

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
				style={modalOverlayStyle}
				onClick={() => onClose?.()}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						e.preventDefault();
						onClose?.();
					}
				}}
				role="presentation"
			>
				<div
					style={modalContentStyle}
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
						style={closeButtonStyle}
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

					<h1 style={headingStyle}>
						{t.addBuilding}
					</h1>

					<button
						type="button"
						onClick={() =>
							setEditingBuilding({})
						}
						style={
							addBuildingButtonStyle
						}
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
						style={
							buildingsContainerStyle
						}
					>
						{buildings.map(
							(building) => (
								<div
									key={
										building.id
									}
									style={
										buildingItemStyle
									}
								>
									<div
										style={
											buildingInfoStyle
										}
									>
										<span
											style={
												buildingAddressStyle
											}
										>
											{
												building.street_address
											}
										</span>{" "}
										<span
											style={
												buildingLocationStyle
											}
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
										style={
											actionButtonsStyle
										}
									>
										<button
											type="button"
											onClick={() =>
												handleEdit(
													building
												)
											}
											style={
												editButtonStyle
											}
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
											style={
												deleteButtonStyle
											}
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
