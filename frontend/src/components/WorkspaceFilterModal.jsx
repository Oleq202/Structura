import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
} from "../theme";
import { translations } from "../i18n";
import { Modal, Button } from "./ui";
import {
	IconFilter,
	IconSearch,
	IconCheck,
	IconMapPin,
} from "./icons";

function FilterSearchBar({
	searchQuery,
	setSearchQuery,
	onSelectAll,
	onClearAll,
	t,
}) {
	return (
		<div
			style={{
				padding: `${spacing[3]} 0`,
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
						pointerEvents: "none",
					}}
				>
					<IconSearch size="sm" />
				</span>
				<input
					type="text"
					placeholder={t.searchBuildings || "Szukaj budynków..."}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{
						width: "100%",
						minHeight: "44px",
						padding: `0 ${spacing[3]} 0 ${spacing[8]}`,
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

			<div style={{ display: "flex", gap: spacing[2] }}>
				<Button
					variant="secondary"
					size="sm"
					onClick={onSelectAll}
				>
					{t.selectAll || "Zaznacz wszystkie"}
				</Button>
				<Button
					variant="secondary"
					size="sm"
					onClick={onClearAll}
				>
					{t.clearAll || "Wyczyść"}
				</Button>
			</div>
		</div>
	);
}

function BuildingFilterItem({ building, isChecked, onToggle }) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={isChecked}
			onClick={() => onToggle(building.id)}
			style={{
				display: "flex",
				alignItems: "center",
				minHeight: "48px",
				gap: spacing[3],
				padding: `${spacing[2]} ${spacing[3]}`,
				borderRadius: radius.md,
				background: isChecked ? `${colors.primary}12` : colors.cardBg,
				border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
				cursor: "pointer",
				width: "100%",
				textAlign: "left",
				boxSizing: "border-box",
				transition: "border-color 0.15s ease, background-color 0.15s ease",
			}}
		>
			<div
				style={{
					width: "22px",
					height: "22px",
					borderRadius: radius.sm,
					border: `1.5px solid ${isChecked ? colors.primary : colors.borderStrong}`,
					background: isChecked ? colors.primary : colors.cardBg,
					color: "#ffffff",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					transition: "background-color 0.15s ease, border-color 0.15s ease",
				}}
			>
				{isChecked && <IconCheck size="xs" />}
			</div>

			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontWeight: font.weight.semibold,
						color: colors.textHeading,
						fontSize: font.size.base,
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
					<IconMapPin size="xs" style={{ color: colors.primary }} />
					<span>{[building.district, building.city].filter(Boolean).join(", ")}</span>
				</div>
			</div>
		</button>
	);
}

function compareBuildings(a, b) {
	const addrA = `${a.street_address || ""} ${a.city || ""} ${a.district || ""}`.trim();
	const addrB = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.trim();
	return addrA.localeCompare(addrB, undefined, { sensitivity: "base" });
}

export default function WorkspaceFilterModal({
	buildings = [],
	selectedBuildingIds = null,
	onSave,
	onClose,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const [tempSelectedIds, setTempSelectedIds] = useState(
		() =>
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

	const filteredBuildings = buildings
		.filter((b) => {
			const searchLower = searchQuery.toLowerCase();
			const address = `${b.street_address} ${b.district || ""} ${b.city}`.toLowerCase();
			return address.includes(searchLower);
		})
		.sort(compareBuildings);

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
		if (tempSelectedIds.size === buildings.length) {
			onSave?.(null);
		} else {
			onSave?.(Array.from(tempSelectedIds));
		}
		onClose?.();
	};

	const modalTitle = (
		<div>
			<div style={{ fontSize: font.size.lg, fontWeight: font.weight.semibold }}>
				{t.workspaceFilterTitle || "Budynki obszaru roboczego"}
			</div>
			<div style={{ fontSize: font.size.xs, color: colors.textSecondary, fontWeight: font.weight.regular, marginTop: "2px" }}>
				{tempSelectedIds.size} / {buildings.length} {t.buildingsSelectedCount || (language === "pl" ? "wybranych" : "selected")}
			</div>
		</div>
	);

	const modalFooter = (
		<>
			<Button variant="secondary" size="md" onClick={onClose}>
				{t.cancel || "Anuluj"}
			</Button>
			<Button variant="primary" size="md" onClick={handleSave}>
				{t.update || "Zastosuj"}
			</Button>
		</>
	);

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={modalTitle}
			icon={<IconFilter size="md" style={{ color: colors.primary }} />}
			footer={modalFooter}
			maxWidth="520px"
		>
			<FilterSearchBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onSelectAll={handleSelectAll}
				onClearAll={handleClearAll}
				t={t}
			/>

			<div
				ref={scrollRef}
				style={{
					maxHeight: "360px",
					overflowY: "auto",
					WebkitOverflowScrolling: "touch",
					display: "flex",
					flexDirection: "column",
					gap: spacing[2],
					paddingRight: spacing[1],
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
						{t.noResults || "Brak budynków pasujących do wyszukiwania"}
					</div>
				) : (
					filteredBuildings.map((building) => (
						<BuildingFilterItem
							key={building.id}
							building={building}
							isChecked={tempSelectedIds.has(building.id)}
							onToggle={handleToggleBuilding}
						/>
					))
				)}
			</div>
		</Modal>
	);
}
