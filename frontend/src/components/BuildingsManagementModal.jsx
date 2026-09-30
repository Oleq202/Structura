import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
	colors,
	font,
	spacing,
	radius,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import BuildingModal from "./BuildingModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Modal, Button } from "./ui";
import useToast from "../hooks/useToast";
import {
	IconBuilding,
	IconPlus,
	IconSearch,
	IconEdit,
	IconTrash,
	IconMapPin,
} from "./icons";

function compareBuildings(a, b) {
	const addrA = `${a.street_address || ""} ${a.city || ""} ${a.district || ""}`.trim();
	const addrB = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.trim();
	return addrA.localeCompare(addrB, undefined, { sensitivity: "base" });
}

function BuildingListItem({ building, onEdit, onDelete, t }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: `${spacing[3]} ${spacing[3]}`,
				borderRadius: radius.md,
				background: colors.pageBg,
				border: `1px solid ${colors.borderSubtle}`,
				gap: spacing[2],
			}}
		>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontWeight: font.weight.semibold,
						color: colors.textHeading,
						fontSize: font.size.base,
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
						marginTop: "2px",
					}}
				>
					<IconMapPin size="xs" style={{ color: colors.primary, flexShrink: 0 }} />
					<span>{[building.district, building.city].filter(Boolean).join(", ")}</span>
				</div>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
				<button
					type="button"
					onClick={() => onEdit(building)}
					title={t.edit || "Edytuj"}
					aria-label={`${t.edit || "Edytuj"} ${building.street_address}`}
					style={{
						background: colors.cardBg,
						border: `1px solid ${colors.borderDefault}`,
						borderRadius: radius.md,
						color: colors.textHeading,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						minWidth: "44px",
						minHeight: "44px",
						cursor: "pointer",
						transition: "background 0.15s, border-color 0.15s",
					}}
				>
					<IconEdit size="sm" />
				</button>
				<button
					type="button"
					onClick={() => onDelete(building)}
					title={t.delete || "Usuń"}
					aria-label={`${t.delete || "Usuń"} ${building.street_address}`}
					style={{
						background: "#fef2f2",
						border: "1px solid #fca5a5",
						borderRadius: radius.md,
						color: "#991b1b",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						minWidth: "44px",
						minHeight: "44px",
						cursor: "pointer",
						transition: "background 0.15s, border-color 0.15s",
					}}
				>
					<IconTrash size="sm" />
				</button>
			</div>
		</div>
	);
}

function BuildingListContent({ loading, buildings, onEdit, onDelete, t }) {
	if (loading) {
		return (
			<div
				style={{
					padding: `${spacing[8]} 0`,
					textAlign: "center",
					color: colors.textSecondary,
					fontSize: font.size.sm,
				}}
			>
				{t.loading || "Ładowanie..."}
			</div>
		);
	}

	if (buildings.length === 0) {
		return (
			<div
				style={{
					padding: `${spacing[8]} 0`,
					textAlign: "center",
					color: colors.textSecondary,
					fontSize: font.size.sm,
				}}
			>
				{t.noResults || "Nie znaleziono budynków"}
			</div>
		);
	}

	return buildings.map((building) => (
		<BuildingListItem
			key={building.id}
			building={building}
			onEdit={onEdit}
			onDelete={onDelete}
			t={t}
		/>
	));
}

function useBuildingsManagement(language, toast) {
	const [buildings, setBuildings] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingBuilding, setEditingBuilding] = useState(null);
	const [buildingToDelete, setBuildingToDelete] = useState(null);
	const [isDeletingBuilding, setIsDeletingBuilding] = useState(false);
	const [loading, setLoading] = useState(true);

	const refreshBuildings = useCallback(() => {
		api.getBuildings()
			.then((data) => setBuildings(data || []))
			.catch(console.error);
	}, []);

	useEffect(() => {
		let isMounted = true;
		api.getBuildings()
			.then((data) => {
				if (isMounted) setBuildings(data || []);
			})
			.catch(console.error)
			.finally(() => {
				if (isMounted) setLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	const handleConfirmDelete = async () => {
		if (!buildingToDelete) return;
		try {
			setIsDeletingBuilding(true);
			await api.deleteBuilding(buildingToDelete.id);
			setBuildings((prev) => prev.filter((b) => b.id !== buildingToDelete.id));
			setBuildingToDelete(null);
			toast.success(language === "pl" ? "Budynek został usunięty" : "Building deleted");
		} catch (err) {
			console.error("Error deleting building", err);
			toast.error(language === "pl" ? "Nie udało się usunąć budynku" : "Failed to delete building");
		} finally {
			setIsDeletingBuilding(false);
		}
	};

	const filteredBuildings = useMemo(() => {
		const search = searchQuery.toLowerCase();
		return buildings
			.filter((b) => {
				const address = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.toLowerCase();
				return address.includes(search);
			})
			.sort(compareBuildings);
	}, [buildings, searchQuery]);

	return {
		buildings,
		loading,
		searchQuery,
		setSearchQuery,
		editingBuilding,
		setEditingBuilding,
		buildingToDelete,
		setBuildingToDelete,
		isDeletingBuilding,
		handleConfirmDelete,
		refreshBuildings,
		filteredBuildings,
	};
}

function getBuildingDeleteName(building) {
	if (!building) return "";
	return (
		[building.street_address, building.district, building.city]
			.filter(Boolean)
			.join(", ") || building.street_address
	);
}

function BuildingsSearchBar({ searchQuery, onSearchChange, onAdd, t }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: spacing[2],
				marginBottom: spacing[3],
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
						pointerEvents: "none",
					}}
				>
					<IconSearch size="sm" />
				</span>
				<input
					type="text"
					placeholder={t.searchBuildings || "Szukaj budynków..."}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{
						width: "100%",
						minHeight: "44px",
						padding: `0 ${spacing[2]} 0 ${spacing[8]}`,
						fontSize: font.size.md,
						fontFamily: font.family.sans,
						color: colors.textBody,
						background: colors.pageBg,
						border: `1px solid ${colors.borderDefault}`,
						borderRadius: radius.md,
						boxSizing: "border-box",
						outline: "none",
					}}
				/>
			</div>

			<Button
				variant="primary"
				size="md"
				onClick={onAdd}
				style={{ flexShrink: 0 }}
			>
				<IconPlus size="sm" />
				<span>{t.addBuildingButton || "Dodaj budynek"}</span>
			</Button>
		</div>
	);
}

function BuildingSubModals({
	editingBuilding,
	onCloseEditing,
	onBuildingSaved,
	buildingToDelete,
	onCloseDelete,
	onConfirmDelete,
	isDeletingBuilding,
	language,
	t,
}) {
	const deleteItemName = getBuildingDeleteName(buildingToDelete);

	return (
		<>
			{editingBuilding && (
				<BuildingModal
					isOpen={!!editingBuilding}
					building={editingBuilding.id ? editingBuilding : null}
					onClose={onCloseEditing}
					onBuildingCreated={onBuildingSaved}
					language={language}
				/>
			)}

			{buildingToDelete && (
				<DeleteConfirmModal
					isOpen={!!buildingToDelete}
					onClose={onCloseDelete}
					onConfirm={onConfirmDelete}
					isDeleting={isDeletingBuilding}
					title={t.deleteBuildingConfirmTitle || "Usunięcie budynku"}
					message={t.deleteBuildingModalMsg || t.deleteBuildingConfirm}
					itemName={deleteItemName}
					itemType={t.building || "Budynek"}
					language={language}
				/>
			)}
		</>
	);
}

export default function BuildingsManagementModal({
	isOpen = true,
	onClose,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const { toast } = useToast();
	const listRef = useRef(null);

	const {
		buildings,
		loading,
		searchQuery,
		setSearchQuery,
		editingBuilding,
		setEditingBuilding,
		buildingToDelete,
		setBuildingToDelete,
		isDeletingBuilding,
		handleConfirmDelete,
		refreshBuildings,
		filteredBuildings,
	} = useBuildingsManagement(language, toast);

	if (!isOpen) return null;

	const modalTitle = (
		<div style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
			<span>{t.buildings || "Budynki"}</span>
			<span
				style={{
					padding: "2px 8px",
					borderRadius: radius.full,
					fontSize: font.size.xs,
					fontWeight: font.weight.semibold,
					background: colors.primaryLight,
					color: colors.primary,
				}}
			>
				{buildings.length}
			</span>
		</div>
	);

	const modalFooter = (
		<Button variant="secondary" size="md" onClick={onClose}>
			{t.close || (language === "pl" ? "Zamknij" : "Close")}
		</Button>
	);

	const isMainModalOpen = !editingBuilding && !buildingToDelete;

	return (
		<>
			<Modal
				isOpen={isMainModalOpen}
				onClose={onClose}
				title={modalTitle}
				icon={
					<div
						style={{
							width: "36px",
							height: "36px",
							borderRadius: radius.md,
							background: colors.primaryLight,
							color: colors.primary,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<IconBuilding size="md" />
					</div>
				}
				footer={modalFooter}
				maxWidth="580px"
			>
				<BuildingsSearchBar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onAdd={() => setEditingBuilding({})}
					t={t}
				/>

				<div
					ref={listRef}
					style={{
						maxHeight: "380px",
						overflowY: "auto",
						WebkitOverflowScrolling: "touch",
						display: "flex",
						flexDirection: "column",
						gap: spacing[2],
						paddingRight: spacing[1],
					}}
				>
					<BuildingListContent
						loading={loading}
						buildings={filteredBuildings}
						onEdit={setEditingBuilding}
						onDelete={setBuildingToDelete}
						t={t}
					/>
				</div>
			</Modal>

			<BuildingSubModals
				editingBuilding={editingBuilding}
				onCloseEditing={() => setEditingBuilding(null)}
				onBuildingSaved={() => {
					setEditingBuilding(null);
					refreshBuildings();
					toast.success(language === "pl" ? "Budynek został zapisany" : "Building saved");
				}}
				buildingToDelete={buildingToDelete}
				onCloseDelete={() => setBuildingToDelete(null)}
				onConfirmDelete={handleConfirmDelete}
				isDeletingBuilding={isDeletingBuilding}
				language={language}
				t={t}
			/>
		</>
	);
}
