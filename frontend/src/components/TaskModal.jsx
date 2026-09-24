import {
	useRef,
	useEffect,
	useReducer,
} from "react";
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

const EMPTY_BUILDINGS = [];
const EMPTY_CONTRACTORS = [];

const ICONS = {
	task: (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
			<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
			<path d="M9 14l2 2 4-4" />
		</svg>
	),
	search: (
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
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	),
	close: (
		<svg
			width="15"
			height="15"
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
			width="10"
			height="10"
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
	building: (
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
	user: (
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
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	),
};

const createInitialState = (task = null) => ({
	task: {
		title: task?.title || "",
		description: task?.description || "",
		building_id: task?.building_id ? String(task.building_id) : "",
		assigned_to: task?.assigned_to ? String(task.assigned_to) : "",
	},
	loading: false,
	titleError: "",
	descriptionError: "",
	buildingIdError: "",
	assignedToError: "",
	buildingSearch: "",
	contractorSearch: "",
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
		case "SET_DESCRIPTION_ERROR":
			return {
				...state,
				descriptionError: action.payload,
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
		case "CLEAR_ERRORS":
			return {
				...state,
				titleError: "",
				descriptionError: "",
				buildingIdError: "",
				assignedToError: "",
			};
		default:
			return state;
	}
}

export default function TaskModal({
	isOpen = true,
	buildings = EMPTY_BUILDINGS,
	contractors = EMPTY_CONTRACTORS,
	currentUser,
	onClose,
	onTaskCreated,
	onSubmit,
	task = null,
	language = "pl",
}) {
	if (!isOpen) return null;

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
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		if (titleInputRef.current) {
			titleInputRef.current.focus();
		}
	}, [isOpen, task]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose?.();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const filteredBuildings = buildings.filter((building) => {
		const search = state.buildingSearch.toLowerCase();
		return (
			building.city.toLowerCase().includes(search) ||
			building.district?.toLowerCase().includes(search) ||
			building.street_address.toLowerCase().includes(search)
		);
	});

	const filteredContractors = contractors.filter((contractor) => {
		const search = state.contractorSearch.toLowerCase();
		return (
			contractor.first_name.toLowerCase().includes(search) ||
			contractor.last_name.toLowerCase().includes(search)
		);
	});

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
				WebkitBackdropFilter: "blur(6px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 2500,
				padding: spacing[2],
			}}
			onClick={() => onClose?.()}
		>
			<div
				style={{
					background: colors.cardBg,
					borderRadius: radius.lg,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "540px",
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
						padding: `6px 12px`,
						background: colors.shellDeep,
						color: colors.shellText,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexShrink: 0,
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
						<div
							style={{
								width: "24px",
								height: "24px",
								borderRadius: radius.sm,
								background: "rgba(255,255,255,0.12)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: colors.primary,
							}}
						>
							{ICONS.task}
						</div>
						<div>
							<h3
								style={{
									margin: 0,
									fontSize: "13px",
									fontWeight: font.weight.big,
									color: "#ffffff",
									lineHeight: 1.2,
								}}
							>
								{isEdit ? t.editTask : t.createNewTask}
							</h3>
							<p
								style={{
									margin: 0,
									fontSize: "10px",
									color: colors.shellTextMuted,
									lineHeight: 1.2,
								}}
							>
								{isEdit
									? (task.building_address || t.tasks)
									: (t.createTask || "Fill in task details")}
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
							width: "24px",
							height: "24px",
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
					<div
						ref={bodyRef}
						style={{
							padding: "8px 12px",
							overflowY: "auto",
							flex: 1,
							display: "flex",
							flexDirection: "column",
							gap: "6px",
							background: colors.cardBg,
						}}
					>
						<div>
							<label
								style={{
									fontSize: "10px",
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
								ref={titleInputRef}
								type="text"
								value={state.task.title}
								onChange={(e) =>
									dispatch({
										type: "SET_TASK",
										payload: { title: e.target.value },
									})
								}
								placeholder={t.enterTaskTitle}
								style={{
									...components.input,
									width: "100%",
									boxSizing: "border-box",
									fontSize: "12px",
									padding: "4px 8px",
									borderRadius: radius.sm,
									border: state.titleError
										? `1px solid ${status.danger.border}`
										: `1px solid ${colors.borderDefault}`,
									background: state.titleError
										? status.danger.bg
										: colors.cardBg,
								}}
							/>
							{state.titleError && (
								<p
									style={{
										fontSize: "10px",
										color: status.danger.text,
										margin: "2px 0 0 0",
									}}
								>
									{state.titleError}
								</p>
							)}
						</div>

						<div>
							<label
								style={{
									fontSize: "10px",
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
								rows={2}
								value={state.task.description}
								onChange={(e) =>
									dispatch({
										type: "SET_TASK",
										payload: { description: e.target.value },
									})
								}
								placeholder={t.enterTaskDescription}
								style={{
									...components.input,
									width: "100%",
									boxSizing: "border-box",
									fontSize: "12px",
									padding: "5px 8px",
									borderRadius: radius.sm,
									resize: "vertical",
									minHeight: "52px",
									fontFamily: font.family.sans,
								}}
							/>
						</div>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "8px",
								flex: 1,
								minHeight: 0,
							}}
						>
							<div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "2px",
									}}
								>
									<label
										style={{
											fontSize: "10px",
											fontWeight: font.weight.big,
											color: colors.textSecondary,
											textTransform: "uppercase",
											letterSpacing: font.letterSpacing.wide,
										}}
									>
										{t.building}
									</label>
									{state.task.building_id && (
										<span
											style={{
												fontSize: "10px",
												color: colors.primary,
												fontWeight: font.weight.medium,
											}}
										>
											{t.selectBuilding || "Selected"}
										</span>
									)}
								</div>
								<div
									style={{
										position: "relative",
										display: "flex",
										alignItems: "center",
										marginBottom: "4px",
									}}
								>
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
										placeholder={t.searchBuildings || "Search..."}
										value={state.buildingSearch}
										onChange={(e) =>
											dispatch({
												type: "SET_BUILDING_SEARCH",
												payload: e.target.value,
											})
										}
										style={{
											...components.input,
											width: "100%",
											boxSizing: "border-box",
											paddingLeft: "24px",
											paddingTop: "3px",
											paddingBottom: "3px",
											fontSize: "11px",
											borderRadius: radius.sm,
										}}
									/>
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "2px",
										maxHeight: "180px",
										minHeight: "110px",
										overflowY: "auto",
										paddingRight: "2px",
									}}
								>
									{filteredBuildings.length > 0 ? (
										filteredBuildings.map((b) => {
											const isChecked = state.task.building_id === String(b.id);
											return (
												<div
													key={b.id}
													onClick={() =>
														dispatch({
															type: "SET_TASK",
															payload: { building_id: String(b.id) },
														})
													}
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														padding: "4px 6px",
														borderRadius: radius.sm,
														background: isChecked ? `${colors.primary}12` : colors.pageBg,
														border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
														cursor: "pointer",
														transition: "border 0.15s, background 0.15s",
													}}
												>
													<div
														style={{
															width: "12px",
															height: "12px",
															borderRadius: radius.full,
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
																fontSize: "11px",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
															}}
														>
															{b.street_address}
														</div>
														<div
															style={{
																fontSize: "9px",
																color: colors.textSecondary,
																display: "flex",
																alignItems: "center",
																gap: "2px",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
															}}
														>
															{ICONS.building}
															<span>{[b.district, b.city].filter(Boolean).join(", ")}</span>
														</div>
													</div>
												</div>
											);
										})
									) : (
										<div
											style={{
												fontSize: "10px",
												color: colors.textSecondary,
												padding: "4px",
												textAlign: "center",
											}}
										>
											{t.noResults}
										</div>
									)}
								</div>
								{state.buildingIdError && (
									<p
										style={{
											fontSize: "10px",
											color: status.danger.text,
											margin: "2px 0 0 0",
										}}
									>
										{state.buildingIdError}
									</p>
								)}
							</div>

							<div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "2px",
									}}
								>
									<label
										style={{
											fontSize: "10px",
											fontWeight: font.weight.big,
											color: colors.textSecondary,
											textTransform: "uppercase",
											letterSpacing: font.letterSpacing.wide,
										}}
									>
										{t.contractor}
									</label>
									{state.task.assigned_to && (
										<span
											style={{
												fontSize: "10px",
												color: colors.primary,
												fontWeight: font.weight.medium,
											}}
										>
											{t.selectContractor || "Selected"}
										</span>
									)}
								</div>
								<div
									style={{
										position: "relative",
										display: "flex",
										alignItems: "center",
										marginBottom: "4px",
									}}
								>
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
										placeholder={t.searchContractors || "Search..."}
										value={state.contractorSearch}
										onChange={(e) =>
											dispatch({
												type: "SET_CONTRACTOR_SEARCH",
												payload: e.target.value,
											})
										}
										style={{
											...components.input,
											width: "100%",
											boxSizing: "border-box",
											paddingLeft: "24px",
											paddingTop: "3px",
											paddingBottom: "3px",
											fontSize: "11px",
											borderRadius: radius.sm,
										}}
									/>
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "2px",
										maxHeight: "180px",
										minHeight: "110px",
										overflowY: "auto",
										paddingRight: "2px",
									}}
								>
									{filteredContractors.length > 0 ? (
										filteredContractors.map((c) => {
											const isChecked = state.task.assigned_to === String(c.id);
											return (
												<div
													key={c.id}
													onClick={() =>
														dispatch({
															type: "SET_TASK",
															payload: { assigned_to: String(c.id) },
														})
													}
													style={{
														display: "flex",
														alignItems: "center",
														gap: "6px",
														padding: "4px 6px",
														borderRadius: radius.sm,
														background: isChecked ? `${colors.primary}12` : colors.pageBg,
														border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
														cursor: "pointer",
														transition: "border 0.15s, background 0.15s",
													}}
												>
													<div
														style={{
															width: "12px",
															height: "12px",
															borderRadius: radius.full,
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
																fontSize: "11px",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
															}}
														>
															{c.first_name} {c.last_name}
														</div>
														<div
															style={{
																fontSize: "9px",
																color: colors.textSecondary,
																display: "flex",
																alignItems: "center",
																gap: "2px",
																whiteSpace: "nowrap",
																overflow: "hidden",
																textOverflow: "ellipsis",
															}}
														>
															{ICONS.user}
															<span>{c.login || t.contractor}</span>
														</div>
													</div>
												</div>
											);
										})
									) : (
										<div
											style={{
												fontSize: "10px",
												color: colors.textSecondary,
												padding: "4px",
												textAlign: "center",
											}}
										>
											{t.noResults}
										</div>
									)}
								</div>
								{state.assignedToError && (
									<p
										style={{
											fontSize: "10px",
											color: status.danger.text,
											margin: "2px 0 0 0",
										}}
									>
										{state.assignedToError}
									</p>
								)}
							</div>
						</div>
					</div>

					<div
						style={{
							padding: `6px 12px`,
							background: colors.pageBg,
							borderTop: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							justifyContent: "flex-end",
							gap: "6px",
							flexShrink: 0,
						}}
					>
						<button
							type="button"
							onClick={onClose}
							style={{
								...components.ghostButton,
								padding: "4px 10px",
								fontSize: "11px",
							}}
						>
							{t.cancel}
						</button>
						<button
							type="submit"
							disabled={state.loading}
							style={{
								...components.primaryButton,
								padding: "4px 14px",
								fontSize: "11px",
								opacity: state.loading ? 0.6 : 1,
								cursor: state.loading ? "not-allowed" : "pointer",
							}}
						>
							{state.loading
								? isEdit
									? t.saving
									: t.creating
								: isEdit
									? t.update
									: t.createTask}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
