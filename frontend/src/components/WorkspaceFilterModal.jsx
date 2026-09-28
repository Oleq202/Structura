import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
	filter: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</svg>
	),
	search: (
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
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
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
	close: (
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
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
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	),
};

function FilterModalHeader({ selectedCount, totalCount, language, t, onClose }) {
	return (
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
					{ICONS.filter}
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
						{t.workspaceFilterTitle || "Workspace Buildings"}
					</h3>
					<p
						style={{
							margin: "2px 0 0 0",
							fontSize: font.size.xs,
							color: colors.shellTextMuted,
						}}
					>
						{selectedCount} / {totalCount} {t.buildingsSelectedCount || (language === "pl" ? "wybranych" : "selected")}
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
					width: "44px",
					height: "44px",
					minWidth: "44px",
					minHeight: "44px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					color: colors.shellTextMuted,
					transition: "background 0.15s, color 0.15s",
					boxSizing: "border-box",
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
	);
}

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
						width: "100%",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ display: "flex", gap: spacing[2] }}>
				<button
					type="button"
					onClick={onSelectAll}
					style={{
						...components.ghostButton,
						minHeight: "44px",
						minWidth: "44px",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						boxSizing: "border-box",
						padding: `4px ${spacing[3]}`,
						fontSize: font.size.xs,
						borderRadius: radius.sm,
					}}
				>
					{t.selectAll || "Select All"}
				</button>
				<button
					type="button"
					onClick={onClearAll}
					style={{
						...components.ghostButton,
						minHeight: "44px",
						minWidth: "44px",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						boxSizing: "border-box",
						padding: `4px ${spacing[3]}`,
						fontSize: font.size.xs,
						borderRadius: radius.sm,
					}}
				>
					{t.clearAll || "Clear All"}
				</button>
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
				minHeight: "44px",
				gap: spacing[3],
				padding: `${spacing[2]} ${spacing[3]}`,
				borderRadius: radius.md,
				background: isChecked ? `${colors.primary}12` : colors.pageBg,
				border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
				cursor: "pointer",
				width: "100%",
				textAlign: "left",
				boxSizing: "border-box",
				transition: "border-color 0.15s, background-color 0.15s",
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
					transition: "background-color 0.15s ease, border-color 0.15s ease",
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
	const t = translations[language];
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

	return createPortal(
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				height: "100%",
				minHeight: "100dvh",
				maxHeight: "100dvh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 99999,
				padding: "calc(12px + env(safe-area-inset-top, 0px)) 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px",
				boxSizing: "border-box",
			}}
		>
			<button
				type="button"
				aria-label={t.close || "Zamknij"}
				tabIndex={-1}
				onClick={() => onClose?.()}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "rgba(9, 21, 42, 0.65)",
					backdropFilter: "blur(6px)",
					WebkitBackdropFilter: "blur(6px)",
					border: "none",
					padding: 0,
					margin: 0,
					cursor: "default",
					width: "100%",
					height: "100%",
				}}
			/>
			<div
				style={{
					position: "relative",
					zIndex: 1,
					background: colors.cardBg,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "520px",
					maxHeight: "calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
				}}
			>
				<FilterModalHeader
					selectedCount={tempSelectedIds.size}
					totalCount={buildings.length}
					language={language}
					t={t}
					onClose={onClose}
				/>

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
							minHeight: "44px",
							minWidth: "44px",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							boxSizing: "border-box",
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
							minHeight: "44px",
							minWidth: "44px",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							boxSizing: "border-box",
							padding: `${spacing[2]} ${spacing[5]}`,
							fontSize: font.size.sm,
						}}
					>
						{t.update || "Apply"}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
