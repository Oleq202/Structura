import { useRef, useEffect, useEffectEvent, useReducer, useMemo } from "react";
import { createPortal } from "react-dom";
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
import * as api from "../services/api";

const ICONS = {
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
			width="16"
			height="16"
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
	search: (
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
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
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
	check: (
		<svg
			width="8"
			height="8"
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
			width="11"
			height="11"
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

const EMPTY_BUILDINGS = [];
const EMPTY_CONTRACTORS = [];

const createInitialState = (task) => ({
	task: {
		title: task?.title || "",
		description: task?.description || "",
		building_id: task?.building_id ? String(task.building_id) : "",
		assigned_to: task?.assigned_to ? String(task.assigned_to) : "",
	},
	buildingSearch: "",
	contractorSearch: "",
	loading: false,
	titleError: "",
	buildingIdError: "",
	assignedToError: "",
});

function reducer(state, action) {
	switch (action.type) {
		case "SET_TASK":
			return {
				...state,
				task: {
					...state.task,
					...action.payload,
				},
			};
		case "SET_BUILDING_SEARCH":
			return {
				...state,
				buildingSearch: action.payload,
			};
		case "SET_CONTRACTOR_SEARCH":
			return {
				...state,
				contractorSearch: action.payload,
			};
		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};
		case "SET_TITLE_ERROR":
			return {
				...state,
				titleError: action.payload,
			};
		case "SET_BUILDING_ID_ERROR":
			return {
				...state,
				buildingIdError: action.payload,
			};
		case "SET_ASSIGNED_TO_ERROR":
			return {
				...state,
				assignedToError: action.payload,
			};
		case "CLEAR_ERRORS":
			return {
				...state,
				titleError: "",
				buildingIdError: "",
				assignedToError: "",
			};
		default:
			return state;
	}
}

function TaskModalHeader({ isEdit, t, onClose }) {
	return (
		<div
			style={{
				padding: `${spacing[3]} ${spacing[4]}`,
				background: colors.shellDeep,
				color: colors.shellText,
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				flexShrink: 0,
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
				<div
					style={{
						width: "28px",
						height: "28px",
						borderRadius: radius.md,
						background: "rgba(255,255,255,0.12)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: colors.primary,
					}}
				>
					{isEdit ? ICONS.edit : ICONS.plus}
				</div>
				<h3
					style={{
						margin: 0,
						fontSize: font.size.sm,
						fontWeight: font.weight.big,
						color: "#ffffff",
						letterSpacing: font.letterSpacing.wide,
					}}
				>
					{isEdit ? t.editTask : t.newTask}
				</h3>
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

function compareBuildings(a, b) {
	const addrA = `${a.street_address || ""} ${a.city || ""} ${a.district || ""}`.trim();
	const addrB = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.trim();
	return addrA.localeCompare(addrB, undefined, { sensitivity: "base" });
}

function compareContractors(a, b) {
	const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.login || "";
	const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.login || "";
	return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
}

function BuildingPicker({
	buildings,
	selectedBuildingIds = null,
	search,
	onSearchChange,
	selectedId,
	onSelect,
	error,
	t,
}) {
	const isSearching = search.trim().length > 0;
	const filtered = useMemo(() => {
		let list = buildings;
		if (!isSearching && Array.isArray(selectedBuildingIds) && selectedBuildingIds.length > 0) {
			const idSet = new Set(selectedBuildingIds.map(Number));
			list = buildings.filter((b) => idSet.has(Number(b.id)) || String(b.id) === String(selectedId));
		} else if (isSearching) {
			const q = search.toLowerCase().trim();
			list = buildings.filter((b) =>
				b.city.toLowerCase().includes(q) ||
				b.district?.toLowerCase().includes(q) ||
				b.street_address.toLowerCase().includes(q)
			);
		}
		return [...list].sort(compareBuildings);
	}, [buildings, isSearching, selectedBuildingIds, search, selectedId]);

	return (
		<div>
			<span
				style={{
					fontSize: font.size.xs,
					fontWeight: font.weight.big,
					color: colors.textSecondary,
					marginBottom: "2px",
					display: "block",
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.wide,
				}}
			>
				{t.building}
			</span>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "3px",
					border: error ? `1px solid ${status.danger.border}` : `1px solid ${colors.borderSubtle}`,
					borderRadius: radius.md,
					padding: "4px",
					background: colors.cardBg,
				}}
			>
				<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
					<span
						style={{
							position: "absolute",
							left: "6px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
						}}
					>
						{ICONS.search}
					</span>
					<input
						type="text"
						placeholder={t.searchBuilding || "Szukaj budynku..."}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							...components.input,
							paddingLeft: "22px",
							paddingTop: "2px",
							paddingBottom: "2px",
							fontSize: "11px",
							borderRadius: radius.sm,
							width: "100%",
							boxSizing: "border-box",
							height: "24px",
						}}
					/>
				</div>
				<div
					style={{
						maxHeight: "90px",
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: "2px",
					}}
				>
					{filtered.length > 0 ? (
						filtered.map((b) => {
							const isChecked = selectedId === String(b.id);
							return (
								<button
									key={b.id}
									type="button"
									role="radio"
									aria-checked={isChecked}
									onClick={() => onSelect(String(b.id))}
									style={{
										display: "flex",
										alignItems: "center",
										minHeight: "44px",
										gap: "6px",
										padding: "4px 6px",
										borderRadius: radius.sm,
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
											width: "14px",
											height: "14px",
											borderRadius: radius.full,
											border: `1.5px solid ${isChecked ? colors.primary : colors.borderDefault}`,
											background: isChecked ? colors.primary : colors.cardBg,
											color: "#ffffff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
											fontSize: "8px",
										}}
									>
										{isChecked && ICONS.check}
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: font.weight.big,
												color: colors.textHeading,
												fontSize: "12px",
												lineHeight: 1.25,
												wordBreak: "break-word",
											}}
										>
											{b.street_address}
										</div>
										<div
											style={{
												fontSize: "10px",
												color: colors.textSecondary,
												display: "flex",
												alignItems: "center",
												gap: "2px",
											}}
										>
											{ICONS.mapPin}
											<span>{[b.district, b.city].filter(Boolean).join(", ")}</span>
										</div>
									</div>
								</button>
							);
						})
					) : (
						<div
							style={{
								padding: "6px",
								fontSize: "10px",
								color: colors.textSecondary,
								textAlign: "center",
							}}
						>
							{t.noResults || "Brak wyników"}
						</div>
					)}
				</div>
			</div>
			{error && (
				<p style={{ fontSize: "10px", color: status.danger.text, margin: "2px 0 0 0" }}>
					{error}
				</p>
			)}
		</div>
	);
}

function ContractorPicker({
	contractors,
	search,
	onSearchChange,
	selectedId,
	onSelect,
	error,
	t,
}) {
	const filtered = contractors
		.filter((c) => {
			const q = search.toLowerCase();
			return (
				c.first_name.toLowerCase().includes(q) ||
				c.last_name.toLowerCase().includes(q)
			);
		})
		.sort(compareContractors);

	return (
		<div>
			<span
				style={{
					fontSize: font.size.xs,
					fontWeight: font.weight.big,
					color: colors.textSecondary,
					marginBottom: "2px",
					display: "block",
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.wide,
				}}
			>
				{t.contractor}
			</span>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "3px",
					border: error ? `1px solid ${status.danger.border}` : `1px solid ${colors.borderSubtle}`,
					borderRadius: radius.md,
					padding: "4px",
					background: colors.cardBg,
				}}
			>
				<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
					<span
						style={{
							position: "absolute",
							left: "6px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
						}}
					>
						{ICONS.search}
					</span>
					<input
						type="text"
						placeholder={t.searchContractor || "Szukaj wykonawcy..."}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							...components.input,
							paddingLeft: "22px",
							paddingTop: "2px",
							paddingBottom: "2px",
							fontSize: "11px",
							borderRadius: radius.sm,
							width: "100%",
							boxSizing: "border-box",
							height: "24px",
						}}
					/>
				</div>
				<div
					style={{
						maxHeight: "90px",
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						gap: "2px",
					}}
				>
					{filtered.length > 0 ? (
						filtered.map((c) => {
							const isChecked = selectedId === String(c.id);
							const initials =
								[c.first_name, c.last_name]
									.filter(Boolean)
									.map((n) => n[0].toUpperCase())
									.join("") || "?";

							return (
								<button
									key={c.id}
									type="button"
									role="radio"
									aria-checked={isChecked}
									onClick={() => onSelect(String(c.id))}
									style={{
										display: "flex",
										alignItems: "center",
										minHeight: "44px",
										gap: "6px",
										padding: "4px 6px",
										borderRadius: radius.sm,
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
											width: "14px",
											height: "14px",
											borderRadius: radius.full,
											border: `1.5px solid ${isChecked ? colors.primary : colors.borderDefault}`,
											background: isChecked ? colors.primary : colors.cardBg,
											color: "#ffffff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
											fontSize: "8px",
										}}
									>
										{isChecked && ICONS.check}
									</div>
									<div
										style={{
											...components.avatar,
											width: "22px",
											height: "22px",
											fontSize: "9px",
											flexShrink: 0,
										}}
									>
										{initials}
									</div>
									<div
										style={{
											fontWeight: font.weight.big,
											color: colors.textHeading,
											fontSize: "12px",
											lineHeight: 1.25,
											wordBreak: "break-word",
											flex: 1,
											minWidth: 0,
										}}
									>
										{c.first_name} {c.last_name}
									</div>
								</button>
							);
						})
					) : (
						<div
							style={{
								padding: "6px",
								fontSize: "10px",
								color: colors.textSecondary,
								textAlign: "center",
							}}
						>
							{t.noResults || "Brak wyników"}
						</div>
					)}
				</div>
			</div>
			{error && (
				<p style={{ fontSize: "10px", color: status.danger.text, margin: "2px 0 0 0" }}>
					{error}
				</p>
			)}
		</div>
	);
}

function TaskFormFields({
	state,
	dispatch,
	bodyRef,
	titleInputRef,
	buildings,
	selectedBuildingIds = null,
	contractors,
	t,
}) {
	return (
		<div
			ref={bodyRef}
			style={{
				padding: `${spacing[3]} ${spacing[4]}`,
				overflowY: "auto",
				flex: 1,
				display: "flex",
				flexDirection: "column",
				gap: spacing[3],
				background: colors.cardBg,
			}}
		>
			<div>
				<label
					htmlFor="task-title"
					style={{
						fontSize: font.size.xs,
						fontWeight: font.weight.big,
						color: colors.textSecondary,
						marginBottom: "2px",
						display: "block",
						textTransform: "uppercase",
						letterSpacing: font.letterSpacing.wide,
					}}
				>
					{t.title}
				</label>
				<input
					id="task-title"
					ref={titleInputRef}
					type="text"
					value={state.task.title}
					onChange={(e) =>
						dispatch({
							type: "SET_TASK",
							payload: { title: e.target.value },
						})
					}
					placeholder={t.taskTitlePlaceholder}
					style={{
						...components.input,
						width: "100%",
						boxSizing: "border-box",
						fontSize: font.size.sm,
						borderRadius: radius.sm,
						padding: "6px 8px",
						border: state.titleError
							? `1px solid ${status.danger.border}`
							: `1px solid ${colors.borderDefault}`,
						background: state.titleError
							? status.danger.bg
							: colors.cardBg,
					}}
				/>
				{state.titleError && (
					<p style={{ fontSize: "10px", color: status.danger.text, margin: "2px 0 0 0" }}>
						{state.titleError}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="task-description"
					style={{
						fontSize: font.size.xs,
						fontWeight: font.weight.big,
						color: colors.textSecondary,
						marginBottom: "2px",
						display: "block",
						textTransform: "uppercase",
						letterSpacing: font.letterSpacing.wide,
					}}
				>
					{t.description}
				</label>
				<textarea
					id="task-description"
					value={state.task.description}
					onChange={(e) =>
						dispatch({
							type: "SET_TASK",
							payload: { description: e.target.value },
						})
					}
					placeholder={t.taskDescPlaceholder}
					rows={2}
					style={{
						...components.input,
						width: "100%",
						boxSizing: "border-box",
						fontSize: font.size.sm,
						borderRadius: radius.sm,
						resize: "none",
						padding: "6px 8px",
					}}
				/>
			</div>

			<BuildingPicker
				buildings={buildings}
				selectedBuildingIds={selectedBuildingIds}
				search={state.buildingSearch}
				onSearchChange={(buildingSearch) =>
					dispatch({
						type: "SET_BUILDING_SEARCH",
						payload: buildingSearch,
					})
				}
				selectedId={state.task.building_id}
				onSelect={(building_id) =>
					dispatch({
						type: "SET_TASK",
						payload: { building_id },
					})
				}
				error={state.buildingIdError}
				t={t}
			/>

			<ContractorPicker
				contractors={contractors}
				search={state.contractorSearch}
				onSearchChange={(contractorSearch) =>
					dispatch({
						type: "SET_CONTRACTOR_SEARCH",
						payload: contractorSearch,
					})
				}
				selectedId={state.task.assigned_to}
				onSelect={(assigned_to) =>
					dispatch({
						type: "SET_TASK",
						payload: { assigned_to },
					})
				}
				error={state.assignedToError}
				t={t}
			/>
		</div>
	);
}

function TaskModalFooter({ isEdit, loading, onClose, t }) {
	return (
		<div
			style={{
				padding: `${spacing[3]} ${spacing[4]}`,
				background: colors.pageBg,
				borderTop: `1px solid ${colors.borderSubtle}`,
				display: "flex",
				justifyContent: "flex-end",
				gap: spacing[2],
				flexShrink: 0,
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
				{t.cancel}
			</button>
			<button
				type="submit"
				disabled={loading}
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
					opacity: loading ? 0.6 : 1,
					cursor: loading ? "not-allowed" : "pointer",
				}}
			>
				{loading
					? t.saving
					: isEdit
						? t.update
						: t.create}
			</button>
		</div>
	);
}

export default function TaskModal({
	isOpen = true,
	buildings = EMPTY_BUILDINGS,
	selectedBuildingIds = null,
	contractors = EMPTY_CONTRACTORS,
	currentUser,
	onClose,
	onTaskCreated,
	onSubmit,
	task = null,
	language = "pl",
}) {
	const t = translations[language];
	const isEdit = !!task?.id;
	const bodyRef = useRef(null);
	const titleInputRef = useRef(null);
	const [state, dispatch] = useReducer(
		reducer,
		task,
		createInitialState
	);

	useEffect(() => {
		if (isOpen && bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		if (isOpen && titleInputRef.current) {
			titleInputRef.current.focus();
		}
	}, [isOpen, task]);

	const handleKeyDownEvent = useEffectEvent((e) => {
		if (e.key === "Escape") {
			onClose?.();
		}
	});

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e) => {
			handleKeyDownEvent(e);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch({ type: "CLEAR_ERRORS" });

		let hasError = false;
		if (!state.task.title.trim()) {
			dispatch({
				type: "SET_TITLE_ERROR",
				payload: t.required,
			});
			hasError = true;
		}

		if (!state.task.building_id) {
			dispatch({
				type: "SET_BUILDING_ID_ERROR",
				payload: t.required,
			});
			hasError = true;
		}

		if (!state.task.assigned_to) {
			dispatch({
				type: "SET_ASSIGNED_TO_ERROR",
				payload: t.required,
			});
			hasError = true;
		}

		if (hasError) return;

		dispatch({
			type: "SET_LOADING",
			payload: true,
		});

		try {
			const payload = {
				title: state.task.title.trim(),
				description: state.task.description.trim(),
				building_id: parseInt(state.task.building_id),
				created_by: currentUser?.id,
				assigned_to: parseInt(state.task.assigned_to),
			};
			if (isEdit) {
				await api.updateTask(task.id, payload);
			} else {
				await api.createTask(payload);
			}
			if (onTaskCreated) onTaskCreated();
			if (onSubmit) onSubmit();
			if (onClose) onClose();
		} catch (err) {
			console.error(
				isEdit ? "Error updating task" : "Error creating task",
				err
			);
		} finally {
			dispatch({
				type: "SET_LOADING",
				payload: false,
			});
		}
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
					borderRadius: radius.lg,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "440px",
					maxHeight: "calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
				}}
			>
				<TaskModalHeader
					isEdit={isEdit}
					t={t}
					onClose={onClose}
				/>

				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						overflow: "hidden",
						margin: 0,
					}}
				>
					<TaskFormFields
						state={state}
						dispatch={dispatch}
						bodyRef={bodyRef}
						titleInputRef={titleInputRef}
						buildings={buildings}
						selectedBuildingIds={selectedBuildingIds}
						contractors={contractors}
						t={t}
					/>

					<TaskModalFooter
						isEdit={isEdit}
						loading={state.loading}
						onClose={onClose}
						t={t}
					/>
				</form>
			</div>
		</div>,
		document.body
	);
}
