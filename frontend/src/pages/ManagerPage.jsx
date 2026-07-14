import {
	useState,
	useEffect,
	useReducer,
} from "react";
import Task from "../components/Task";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
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
				isTaskModalOpen:
					!state.isTaskModalOpen,
			};
		case "TOGGLE_TASK_EXPANDED":
			return {
				...state,
				expandedTaskId:
					state.expandedTaskId ===
					action.payload
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

	const getFilteredTasks = () => {
		switch (state.activeFilter) {
			case "pending":
				return state.tasks.filter(
					(t) => t.status === "pending"
				);
			case "completed":
				return state.tasks.filter(
					(t) =>
						t.status === "completed"
				);
			default:
				if (
					![
						"all",
						"pending",
						"completed",
					].includes(state.activeFilter)
				) {
					return state.tasks.filter(
						(t) =>
							t.building_id ===
							parseInt(
								state.activeFilter
							)
					);
				}
				return state.tasks;
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
		])
			.then(
				([
					tasks,
					buildings,
					contractors,
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
				}
			)
			.catch(console.error);
	}, []);

	const handleMarkCompleted = async (
		taskId
	) => {
		try {
			await api.updateTask(taskId, {
				status: "completed",
			});
			refreshTasks();
		} catch (err) {
			console.error(
				"Error marking task as completed",
				err
			);
		}
	};

	const handleRevertCompleted = async (
		taskId
	) => {
		try {
			await api.updateTask(taskId, {
				status: "pending",
			});
			refreshTasks();
		} catch (err) {
			console.error(
				"Error reverting task completion",
				err
			);
		}
	};

	const handleDeleteTask = async (taskId) => {
		if (
			!window.confirm(t.deleteTaskConfirm)
		) {
			return;
		}
		try {
			await api.deleteTask(taskId);
			refreshTasks();
		} catch (err) {
			console.error(
				"Error deleting task",
				err
			);
		}
	};

	const [editingTask, setEditingTask] =
		useState(null);

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
					gap: "24px",
					padding: "16px",
					alignItems: "center",
				}}
			>
				{state.activeFilter === "all" ? (
					<>
						{(() => {
							const pendingTasks =
								state.tasks.filter(
									(t) =>
										t.status ===
										"pending"
								);
							const pendingGroups =
								groupTasksByBuilding(
									pendingTasks
								);
							return pendingGroups.length >
								0 ? (
								<>
									<h2
										style={{
											fontSize:
												font
													.size
													.lg,
											fontWeight:
												font
													.weight
													.medium,
											color: colors.textHeading,
											margin: 0,
											width: "100%",
											maxWidth:
												"420px",
										}}
									>
										{
											translations[
												language
											]
												.pendingTasks
										}
									</h2>
									{pendingGroups.map(
										(
											group
										) => (
											<div
												key={
													group
														.building
														?.id ||
													group
														.tasks[0]
														?.building_id
												}
												style={{
													width: "100%",
													maxWidth:
														"420px",
												}}
											>
												<div
													style={{
														fontSize:
															font
																.size
																.sm,
														color: colors.textSecondary,
														marginBottom:
															spacing[3],
														fontWeight:
															font
																.weight
																.medium,
													}}
												>
													{
														group
															.building
															?.street_address
													}

													,{" "}
													{
														group
															.building
															?.district
													}

													,{" "}
													{
														group
															.building
															?.city
													}
												</div>
												<div
													style={{
														display:
															"flex",
														flexDirection:
															"column",
														gap: spacing[3],
													}}
												>
													{group.tasks.map(
														(
															task
														) => (
															<Task
																key={
																	task.id
																}
																initialData={
																	task
																}
																expanded={
																	state.expandedTaskId ===
																	task.id
																}
																onToggle={() =>
																	toggleTaskExpanded(
																		task.id
																	)
																}
																onMarkCompleted={() =>
																	handleMarkCompleted(
																		task.id
																	)
																}
																onReassign={() =>
																	handleReassign(
																		task.id
																	)
																}
																onEdit={() =>
																	openTaskEditor(
																		task
																	)
																}
																onRevertCompleted={() =>
																	handleRevertCompleted(
																		task.id
																	)
																}
																onDeleteTask={() =>
																	handleDeleteTask(
																		task.id
																	)
																}
																language={
																	language
																}
															/>
														)
													)}
												</div>
											</div>
										)
									)}
								</>
							) : null;
						})()}
						{(() => {
							const completedTasks =
								state.tasks.filter(
									(t) =>
										t.status ===
										"completed"
								);
							const completedGroups =
								groupTasksByBuilding(
									completedTasks
								);
							return completedGroups.length >
								0 ? (
								<>
									<h2
										style={{
											fontSize:
												font
													.size
													.lg,
											fontWeight:
												font
													.weight
													.medium,
											color: colors.textHeading,
											margin: 0,
											width: "100%",
											maxWidth:
												"420px",
										}}
									>
										{
											translations[
												language
											]
												.completedTasks
										}
									</h2>
									{completedGroups.map(
										(
											group
										) => (
											<div
												key={
													group
														.building
														?.id ||
													group
														.tasks[0]
														?.building_id
												}
												style={{
													width: "100%",
													maxWidth:
														"420px",
												}}
											>
												<div
													style={{
														fontSize:
															font
																.size
																.sm,
														color: colors.textSecondary,
														marginBottom:
															spacing[3],
														fontWeight:
															font
																.weight
																.medium,
													}}
												>
													{
														group
															.building
															?.street_address
													}

													,{" "}
													{
														group
															.building
															?.district
													}

													,{" "}
													{
														group
															.building
															?.city
													}
												</div>
												<div
													style={{
														display:
															"flex",
														flexDirection:
															"column",
														gap: spacing[3],
													}}
												>
													{group.tasks.map(
														(
															task
														) => (
															<Task
																key={
																	task.id
																}
																initialData={
																	task
																}
																expanded={
																	state.expandedTaskId ===
																	task.id
																}
																onToggle={() =>
																	toggleTaskExpanded(
																		task.id
																	)
																}
																onMarkCompleted={() =>
																	handleMarkCompleted(
																		task.id
																	)
																}
																onReassign={() =>
																	handleReassign(
																		task.id
																	)
																}
																onEdit={() =>
																	openTaskEditor(
																		task
																	)
																}
																onRevertCompleted={() =>
																	handleRevertCompleted(
																		task.id
																	)
																}
																onDeleteTask={() =>
																	handleDeleteTask(
																		task.id
																	)
																}
																language={
																	language
																}
															/>
														)
													)}
												</div>
											</div>
										)
									)}
								</>
							) : null;
						})()}
					</>
				) : (
					<>
						{groupTasksByBuilding(
							filteredTasks
						).map((group) => (
							<div
								key={
									group.building
										?.id ||
									group.tasks[0]
										?.building_id
								}
								style={{
									width: "100%",
									maxWidth:
										"420px",
								}}
							>
								<div
									style={{
										fontSize:
											font
												.size
												.sm,
										color: colors.textSecondary,
										marginBottom:
											spacing[3],
										fontWeight:
											font
												.weight
												.medium,
									}}
								>
									{
										group
											.building
											?.street_address
									}
									,{" "}
									{
										group
											.building
											?.district
									}
									,{" "}
									{
										group
											.building
											?.city
									}
								</div>
								<div
									style={{
										display:
											"flex",
										flexDirection:
											"column",
										gap: spacing[3],
									}}
								>
									{group.tasks.map(
										(
											task
										) => (
											<Task
												key={
													task.id
												}
												initialData={
													task
												}
												expanded={
													state.expandedTaskId ===
													task.id
												}
												onToggle={() =>
													toggleTaskExpanded(
														task.id
													)
												}
												onMarkCompleted={() =>
													handleMarkCompleted(
														task.id
													)
												}
												onReassign={() =>
													handleReassign(
														task.id
													)
												}
												onEdit={() =>
													openTaskEditor(
														task
													)
												}
												onRevertCompleted={() =>
													handleRevertCompleted(
														task.id
													)
												}
												onDeleteTask={() =>
													handleDeleteTask(
														task.id
													)
												}
												language={
													language
												}
											/>
										)
									)}
								</div>
							</div>
						))}
					</>
				)}
			</div>
			<button
				type="button"
				style={floatingButtonStyle}
				onMouseEnter={(e) =>
					(e.currentTarget.style.background =
						colors.primaryHover)
				}
				onMouseLeave={(e) =>
					(e.currentTarget.style.background =
						colors.primary)
				}
				onClick={toggleTaskModal}
				aria-label={t.createNewTask}
			>
				<svg
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<line
						x1="12"
						y1="5"
						x2="12"
						y2="19"
					/>
					<line
						x1="5"
						y1="12"
						x2="19"
						y2="12"
					/>
				</svg>
			</button>
			{(state.isTaskModalOpen ||
				editingTask) && (
				<TaskModal
					buildings={state.buildings}
					contractors={
						state.contractors
					}
					currentUser={currentUser}
					onClose={() => {
						closeTaskModal();
						closeTaskEditor();
					}}
					onTaskCreated={() => {
						refreshTasks();
						closeTaskEditor();
					}}
					task={editingTask}
					language={language}
				/>
			)}
		</div>
	);
}
