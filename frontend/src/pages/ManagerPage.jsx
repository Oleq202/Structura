import {
	useState,
	useEffect,
	useReducer,
} from "react";
import Task from "../components/Task";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import WorkspaceFilterModal from "../components/WorkspaceFilterModal";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
	badgeStyle,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";

const ICONS = {
	building: (
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
	sliders: (
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
			<line x1="4" y1="21" x2="4" y2="14" />
			<line x1="4" y1="10" x2="4" y2="3" />
			<line x1="12" y1="21" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12" y2="3" />
			<line x1="20" y1="21" x2="20" y2="16" />
			<line x1="20" y1="12" x2="20" y2="3" />
			<line x1="1" y1="14" x2="7" y2="14" />
			<line x1="9" y1="8" x2="15" y2="8" />
			<line x1="17" y1="16" x2="23" y2="16" />
		</svg>
	),
	empty: (
		<svg
			width="40"
			height="40"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
			<line x1="9" y1="14" x2="15" y2="14" />
		</svg>
	),
};

const groupTasksByBuilding = (tasksToGroup) => {
	const groups = {};
	tasksToGroup.forEach((task) => {
		const buildingId = task.building_id;
		if (!groups[buildingId]) {
			groups[buildingId] = {
				building: task.building,
				tasks: [],
			};
		}
		groups[buildingId].tasks.push(task);
	});

	return Object.values(groups).sort((a, b) => {
		const aAddress = a.building
			? `${a.building.street_address}, ${a.building.district || ""}, ${a.building.city}`
			: "";
		const bAddress = b.building
			? `${b.building.street_address}, ${b.building.district || ""}, ${b.building.city}`
			: "";
		return aAddress.localeCompare(bAddress);
	});
};

const handleReassign = async (taskId) => {
	console.log("Reassign task:", taskId);
};

const floatingButtonStyle = {
	...components.primaryButton,
	position: "fixed",
	bottom: spacing[24],
	right: spacing[4],
	padding: `${spacing[1]} ${spacing[1]}`,
	borderRadius: radius.full,
	fontFamily: font.family.sans,
	boxSizing: "border-box",
	zIndex: 200,
	width: "64px",
	height: "64px",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

const initialState = {
	activeFilter: "all",
	isTaskModalOpen: false,
	expandedTaskId: null,
	tasks: [],
	buildings: [],
	contractors: [],
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_ACTIVE_FILTER":
			return {
				...state,
				activeFilter: action.payload,
			};
		case "SET_CREATE_TASK_OPEN":
			return {
				...state,
				isTaskModalOpen: action.payload,
			};
		case "SET_EXPANDED_TASK_ID":
			return {
				...state,
				expandedTaskId: action.payload,
			};
		case "SET_TASKS":
			return {
				...state,
				tasks: action.payload,
			};
		case "SET_BUILDINGS":
			return {
				...state,
				buildings: action.payload,
			};
		case "SET_CONTRACTORS":
			return {
				...state,
				contractors: action.payload,
			};
		case "TOGGLE_CREATE_TASK":
			return {
				...state,
				isTaskModalOpen: !state.isTaskModalOpen,
			};
		case "TOGGLE_TASK_EXPANDED":
			return {
				...state,
				expandedTaskId:
					state.expandedTaskId === action.payload
						? null
						: action.payload,
			};
		default:
			return state;
	}
}

export default function ManagerPage({
	currentUser,
	language = "pl",
}) {
	const t = translations[language];
	const [state, dispatch] = useReducer(
		reducer,
		initialState
	);
	const [selectedBuildingIds, setSelectedBuildingIds] = useState([]);
	const [isWorkspaceModalOpen, setWorkspaceModalOpen] = useState(false);

	const openTaskModal = () =>
		dispatch({
			type: "SET_CREATE_TASK_OPEN",
			payload: true,
		});
	const closeTaskModal = () =>
		dispatch({
			type: "SET_CREATE_TASK_OPEN",
			payload: false,
		});
	const toggleTaskModal = () =>
		dispatch({ type: "TOGGLE_CREATE_TASK" });
	const toggleTaskExpanded = (taskId) =>
		dispatch({
			type: "TOGGLE_TASK_EXPANDED",
			payload: taskId,
		});

	const handleSaveWorkspace = (newBuildingIds) => {
		setSelectedBuildingIds(newBuildingIds);
		api.updateUserPreferences({
			selected_building_ids: newBuildingIds,
		}).catch((err) =>
			console.error("Failed to save workspace preferences:", err)
		);
	};

	const isNoBuildingsSelected =
		currentUser?.role !== "contractor" &&
		selectedBuildingIds !== null &&
		Array.isArray(selectedBuildingIds) &&
		selectedBuildingIds.length === 0 &&
		state.buildings.length > 0;

	const isWorkspaceFiltered =
		currentUser?.role !== "contractor" &&
		selectedBuildingIds !== null &&
		Array.isArray(selectedBuildingIds) &&
		selectedBuildingIds.length > 0 &&
		selectedBuildingIds.length < state.buildings.length;

	const getFilteredTasks = () => {
		if (isNoBuildingsSelected) {
			return [];
		}

		let currentTasks = state.tasks;

		if (isWorkspaceFiltered) {
			currentTasks = currentTasks.filter((t) =>
				selectedBuildingIds.includes(t.building_id)
			);
		}

		switch (state.activeFilter) {
			case "pending":
				return currentTasks.filter(
					(t) => t.status === "pending"
				);
			case "completed":
				return currentTasks.filter(
					(t) => t.status === "completed"
				);
			case "all":
				return currentTasks;
			default:
				if (
					![
						"all",
						"pending",
						"completed",
					].includes(state.activeFilter)
				) {
					return currentTasks.filter(
						(t) =>
							t.building_id ===
							parseInt(state.activeFilter)
					);
				}
				return currentTasks;
		}
	};

	const refreshTasks = () => {
		api.getTasks()
			.then((tasks) =>
				dispatch({
					type: "SET_TASKS",
					payload: tasks,
				})
			)
			.catch(console.error);
	};

	useEffect(() => {
		Promise.all([
			api.getTasks(),
			api.getBuildings(),
			api.getContractors(),
			api.getUserPreferences().catch(() => null),
		])
			.then(
				([
					tasks,
					buildings,
					contractors,
					prefs,
				]) => {
					dispatch({
						type: "SET_TASKS",
						payload: tasks,
					});
					dispatch({
						type: "SET_BUILDINGS",
						payload: buildings,
					});
					dispatch({
						type: "SET_CONTRACTORS",
						payload: contractors,
					});
					if (
						prefs &&
						Array.isArray(prefs.selected_building_ids)
					) {
						setSelectedBuildingIds(prefs.selected_building_ids);
					} else {
						setSelectedBuildingIds(null);
					}
				}
			)
			.catch(console.error);
	}, []);

	const handleMarkCompleted = async (taskId) => {
		try {
			if (currentUser.role === "contractor") {
				await api.updateTaskStatus(taskId, "completed");
			} else {
				await api.updateTask(taskId, {
					status: "completed",
					created_by: currentUser.id,
				});
			}
			refreshTasks();
		} catch (err) {
			console.error("Error marking task as completed", err);
		}
	};

	const handleRevertCompleted = async (taskId) => {
		try {
			if (currentUser.role === "contractor") {
				await api.updateTaskStatus(taskId, "pending");
			} else {
				await api.updateTask(taskId, {
					status: "pending",
					created_by: currentUser.id,
				});
			}
			refreshTasks();
		} catch (err) {
			console.error("Error reverting task completion", err);
		}
	};

	const handleDeleteTask = async (taskId) => {
		if (!window.confirm(t.deleteTaskConfirm)) {
			return;
		}
		try {
			await api.deleteTask(taskId);
			refreshTasks();
		} catch (err) {
			console.error("Error deleting task", err);
		}
	};

	const [editingTask, setEditingTask] = useState(null);

	const openTaskEditor = (task) => {
		setEditingTask(task);
	};

	const closeTaskEditor = () => {
		setEditingTask(null);
	};

	const filteredTasks = getFilteredTasks();
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				background: colors.pageBg,
				fontFamily: font.family.sans,
				boxSizing: "border-box",
				minHeight: "100%",
			}}
		>
			<Navbar
				activeFilter={state.activeFilter}
				onFilterChange={(filter) =>
					dispatch({
						type: "SET_ACTIVE_FILTER",
						payload: filter,
					})
				}
				language={language}
			/>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: spacing[4],
					padding: `${spacing[3]} ${spacing[4]}`,
					alignItems: "center",
					width: "100%",
					maxWidth: "600px",
					margin: "0 auto",
					boxSizing: "border-box",
				}}
			>
				{currentUser?.role !== "contractor" && state.buildings.length > 0 && (
					<div
						style={{
							width: "100%",
							maxWidth: "420px",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: `${spacing[2]} ${spacing[3]}`,
							background: colors.cardBg,
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.lg,
							boxShadow: shadow.card,
							boxSizing: "border-box",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: spacing[2],
								color: colors.textSecondary,
								fontSize: font.size.sm,
							}}
						>
							<span style={{ color: colors.primary, display: "flex", alignItems: "center" }}>
								{ICONS.building}
							</span>
							<span style={{ fontWeight: font.weight.medium, color: colors.textHeading }}>
								{isNoBuildingsSelected
									? t.noBuildingsSelected || "No buildings selected"
									: !isWorkspaceFiltered
										? t.allBuildings || "All Buildings"
										: `${selectedBuildingIds.length} / ${state.buildings.length} ${t.buildingsCount || "buildings"}`}
							</span>
						</div>

						<button
							type="button"
							onClick={() => setWorkspaceModalOpen(true)}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								background: (isWorkspaceFiltered || isNoBuildingsSelected) ? `${colors.primary}15` : colors.pageBg,
								border: `1px solid ${(isWorkspaceFiltered || isNoBuildingsSelected) ? colors.primary : colors.borderDefault}`,
								color: colors.primary,
								fontWeight: font.weight.big,
								cursor: "pointer",
								fontSize: font.size.xs,
								padding: `5px 10px`,
								borderRadius: radius.md,
								transition: "all 0.15s ease",
							}}
						>
							{ICONS.sliders}
							<span>{t.workspaceFilter || "Filter"}</span>
						</button>
					</div>
				)}

				{state.activeFilter === "all" ? (
					<>
						{(() => {
							const pendingTasks = filteredTasks.filter(
								(t) => t.status === "pending"
							);
							const pendingGroups = groupTasksByBuilding(pendingTasks);

							const completedTasks = filteredTasks.filter(
								(t) => t.status === "completed"
							);
							const completedGroups = groupTasksByBuilding(completedTasks);

							if (pendingGroups.length === 0 && completedGroups.length === 0) {
								if (isNoBuildingsSelected) {
									return (
										<div
											style={{
												width: "100%",
												maxWidth: "420px",
												textAlign: "center",
												padding: `${spacing[8]} ${spacing[5]}`,
												color: colors.textSecondary,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: spacing[3],
												background: colors.cardBg,
												borderRadius: radius.xl,
												border: `1px dashed ${colors.borderDefault}`,
												boxSizing: "border-box",
												marginTop: spacing[2],
											}}
										>
											<div
												style={{
													width: "44px",
													height: "44px",
													borderRadius: radius.full,
													background: `${colors.primary}15`,
													color: colors.primary,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												{ICONS.building}
											</div>
											<div>
												<h3
													style={{
														margin: `0 0 ${spacing[1]} 0`,
														fontSize: font.size.md,
														fontWeight: font.weight.big,
														color: colors.textHeading,
													}}
												>
													{t.noBuildingsSelected || "No buildings selected"}
												</h3>
												<p style={{ margin: 0, fontSize: font.size.sm, color: colors.textSecondary }}>
													{t.selectBuildingsPrompt || "Select buildings in the workspace filter to view tasks."}
												</p>
											</div>
											<button
												type="button"
												onClick={() => setWorkspaceModalOpen(true)}
												style={{
													...components.primaryButton,
													padding: `${spacing[2]} ${spacing[4]}`,
													fontSize: font.size.sm,
													marginTop: spacing[1],
												}}
											>
												{t.workspaceFilter || "Customize Workspace"}
											</button>
										</div>
									);
								}

								return (
									<div
										style={{
											width: "100%",
											maxWidth: "420px",
											textAlign: "center",
											padding: `${spacing[8]} ${spacing[4]}`,
											color: colors.textSecondary,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											gap: spacing[2],
										}}
									>
										<div style={{ color: colors.textMuted }}>{ICONS.empty}</div>
										<p style={{ margin: 0, fontSize: font.size.sm }}>
											{isWorkspaceFiltered
												? t.noResults || "No tasks match your selected buildings."
												: t.noResults || "No tasks found."}
										</p>
									</div>
								);
							}

							return (
								<>
									{pendingGroups.length > 0 && (
										<>
											<h2
												style={{
													fontSize: font.size.lg,
													fontWeight: font.weight.big,
													color: colors.textHeading,
													margin: `${spacing[2]} 0 0 0`,
													width: "100%",
													maxWidth: "420px",
												}}
											>
												{translations[language].pendingTasks}
											</h2>
											{pendingGroups.map((group) => (
												<div
													key={
														group.building?.id ||
														group.tasks[0]?.building_id
													}
													style={{
														width: "100%",
														maxWidth: "420px",
													}}
												>
													<div
														style={{
															fontSize: font.size.sm,
															color: colors.textSecondary,
															marginBottom: spacing[2],
															fontWeight: font.weight.medium,
														}}
													>
														{group.building?.street_address}
														{group.building?.district ? `, ${group.building.district}` : ""}
														{group.building?.city ? `, ${group.building.city}` : ""}
													</div>
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: spacing[3],
														}}
													>
														{group.tasks.map((task) => (
															<Task
																key={task.id}
																initialData={task}
																expanded={
																	state.expandedTaskId === task.id
																}
																onToggle={() =>
																	toggleTaskExpanded(task.id)
																}
																onMarkCompleted={() =>
																	handleMarkCompleted(task.id)
																}
																onReassign={() =>
																	handleReassign(task.id)
																}
																onEdit={() =>
																	openTaskEditor(task)
																}
																onRevertCompleted={() =>
																	handleRevertCompleted(task.id)
																}
																onDeleteTask={() =>
																	handleDeleteTask(task.id)
																}
																language={language}
																userRole={currentUser.role}
															/>
														))}
													</div>
												</div>
											))}
										</>
									)}

									{completedGroups.length > 0 && (
										<>
											<h2
												style={{
													fontSize: font.size.lg,
													fontWeight: font.weight.big,
													color: colors.textHeading,
													margin: `${spacing[4]} 0 0 0`,
													width: "100%",
													maxWidth: "420px",
												}}
											>
												{translations[language].completedTasks}
											</h2>
											{completedGroups.map((group) => (
												<div
													key={
														group.building?.id ||
														group.tasks[0]?.building_id
													}
													style={{
														width: "100%",
														maxWidth: "420px",
													}}
												>
													<div
														style={{
															fontSize: font.size.sm,
															color: colors.textSecondary,
															marginBottom: spacing[2],
															fontWeight: font.weight.medium,
														}}
													>
														{group.building?.street_address}
														{group.building?.district ? `, ${group.building.district}` : ""}
														{group.building?.city ? `, ${group.building.city}` : ""}
													</div>
													<div
														style={{
															display: "flex",
															flexDirection: "column",
															gap: spacing[3],
														}}
													>
														{group.tasks.map((task) => (
															<Task
																key={task.id}
																initialData={task}
																expanded={
																	state.expandedTaskId === task.id
																}
																onToggle={() =>
																	toggleTaskExpanded(task.id)
																}
																onMarkCompleted={() =>
																	handleMarkCompleted(task.id)
																}
																onReassign={() =>
																	handleReassign(task.id)
																}
																onEdit={() =>
																	openTaskEditor(task)
																}
																onRevertCompleted={() =>
																	handleRevertCompleted(task.id)
																}
																onDeleteTask={() =>
																	handleDeleteTask(task.id)
																}
																language={language}
																userRole={currentUser.role}
															/>
														))}
													</div>
												</div>
											))}
										</>
									)}
								</>
							);
						})()}
					</>
				) : (
					<>
						{(() => {
							const groups = groupTasksByBuilding(filteredTasks);
							if (groups.length === 0) {
								if (isNoBuildingsSelected) {
									return (
										<div
											style={{
												width: "100%",
												maxWidth: "420px",
												textAlign: "center",
												padding: `${spacing[8]} ${spacing[5]}`,
												color: colors.textSecondary,
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												gap: spacing[3],
												background: colors.cardBg,
												borderRadius: radius.xl,
												border: `1px dashed ${colors.borderDefault}`,
												boxSizing: "border-box",
												marginTop: spacing[2],
											}}
										>
											<div
												style={{
													width: "44px",
													height: "44px",
													borderRadius: radius.full,
													background: `${colors.primary}15`,
													color: colors.primary,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												{ICONS.building}
											</div>
											<div>
												<h3
													style={{
														margin: `0 0 ${spacing[1]} 0`,
														fontSize: font.size.md,
														fontWeight: font.weight.big,
														color: colors.textHeading,
													}}
												>
													{t.noBuildingsSelected || "No buildings selected"}
												</h3>
												<p style={{ margin: 0, fontSize: font.size.sm, color: colors.textSecondary }}>
													{t.selectBuildingsPrompt || "Select buildings in the workspace filter to view tasks."}
												</p>
											</div>
											<button
												type="button"
												onClick={() => setWorkspaceModalOpen(true)}
												style={{
													...components.primaryButton,
													padding: `${spacing[2]} ${spacing[4]}`,
													fontSize: font.size.sm,
													marginTop: spacing[1],
												}}
											>
												{t.workspaceFilter || "Customize Workspace"}
											</button>
										</div>
									);
								}

								return (
									<div
										style={{
											width: "100%",
											maxWidth: "420px",
											textAlign: "center",
											padding: `${spacing[8]} ${spacing[4]}`,
											color: colors.textSecondary,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											gap: spacing[2],
										}}
									>
										<div style={{ color: colors.textMuted }}>{ICONS.empty}</div>
										<p style={{ margin: 0, fontSize: font.size.sm }}>
											{isWorkspaceFiltered
												? t.noResults || "No tasks match your selected buildings."
												: t.noResults || "No tasks found."}
										</p>
									</div>
								);
							}

							return groups.map((group) => (
								<div
									key={
										group.building?.id ||
										group.tasks[0]?.building_id
									}
									style={{
										width: "100%",
										maxWidth: "420px",
									}}
								>
									<div
										style={{
											fontSize: font.size.sm,
											color: colors.textSecondary,
											marginBottom: spacing[2],
											fontWeight: font.weight.medium,
										}}
									>
										{group.building?.street_address}
										{group.building?.district ? `, ${group.building.district}` : ""}
										{group.building?.city ? `, ${group.building.city}` : ""}
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: spacing[3],
										}}
									>
										{group.tasks.map((task) => (
											<Task
												key={task.id}
												initialData={task}
												expanded={
													state.expandedTaskId === task.id
												}
												onToggle={() =>
													toggleTaskExpanded(task.id)
												}
												onMarkCompleted={() =>
													handleMarkCompleted(task.id)
												}
												onReassign={() =>
													handleReassign(task.id)
												}
												onEdit={() =>
													openTaskEditor(task)
												}
												onRevertCompleted={() =>
													handleRevertCompleted(task.id)
												}
												onDeleteTask={() =>
													handleDeleteTask(task.id)
												}
												language={language}
												userRole={currentUser.role}
											/>
										))}
									</div>
								</div>
							));
						})()}
					</>
				)}
			</div>

			{currentUser?.role !== "contractor" && (
				<button
					type="button"
					onClick={toggleTaskModal}
					style={floatingButtonStyle}
				>
					<svg
						width="32"
						height="32"
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
				</button>
			)}

			{state.isTaskModalOpen && (
				<TaskModal
					isOpen={state.isTaskModalOpen}
					onClose={closeTaskModal}
					onSubmit={refreshTasks}
					buildings={state.buildings}
					contractors={state.contractors}
					currentUser={currentUser}
					language={language}
				/>
			)}

			{editingTask && (
				<TaskModal
					isOpen={true}
					onClose={closeTaskEditor}
					onSubmit={refreshTasks}
					buildings={state.buildings}
					contractors={state.contractors}
					currentUser={currentUser}
					task={editingTask}
					language={language}
				/>
			)}

			{isWorkspaceModalOpen && (
				<WorkspaceFilterModal
					buildings={state.buildings}
					selectedBuildingIds={selectedBuildingIds}
					onSave={handleSaveWorkspace}
					onClose={() => setWorkspaceModalOpen(false)}
					language={language}
				/>
			)}
		</div>
	);
}
