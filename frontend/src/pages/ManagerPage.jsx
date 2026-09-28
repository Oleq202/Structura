import { useState, useEffect, useReducer, useMemo } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	components,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import Task from "../components/Task";
import TaskModal from "../components/TaskModal";
import WorkspaceFilterModal from "../components/WorkspaceFilterModal";

const ICONS = {
	plus: (
		<svg
			width="14"
			height="14"
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
	filter: (
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
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</svg>
	),
	building: (
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
};

const filterTabsContainerStyle = {
	display: "flex",
	gap: spacing[2],
	overflowX: "auto",
	paddingBottom: spacing[1],
	scrollbarWidth: "none",
	msOverflowStyle: "none",
	width: "100%",
	boxSizing: "border-box",
};

const getFilterTabStyle = (isActive) => ({
	...components.tab,
	background: isActive ? colors.primary : colors.cardBg,
	color: isActive ? "#ffffff" : colors.textSecondary,
	borderColor: isActive ? colors.primary : colors.borderSubtle,
	fontWeight: isActive ? font.weight.big : font.weight.medium,
	padding: `${spacing[2]} ${spacing[4]}`,
	borderRadius: radius.full,
	fontSize: font.size.sm,
	whiteSpace: "nowrap",
	cursor: "pointer",
	minHeight: "44px",
	minWidth: "44px",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	boxSizing: "border-box",
	transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
});

const initialState = {
	tasks: [],
	buildings: [],
	contractors: [],
	isCreateTaskOpen: false,
	activeFilter: "all",
	editingTask: null,
	expandedTaskId: null,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_TASKS":
			return { ...state, tasks: action.payload };
		case "SET_BUILDINGS":
			return { ...state, buildings: action.payload };
		case "SET_CONTRACTORS":
			return { ...state, contractors: action.payload };
		case "SET_CREATE_TASK_OPEN":
			return { ...state, isCreateTaskOpen: action.payload };
		case "TOGGLE_CREATE_TASK":
			return { ...state, isCreateTaskOpen: !state.isCreateTaskOpen };
		case "SET_ACTIVE_FILTER":
			return { ...state, activeFilter: action.payload };
		case "SET_EDITING_TASK":
			return { ...state, editingTask: action.payload };
		case "TOGGLE_TASK_EXPANDED":
			return {
				...state,
				expandedTaskId:
					state.expandedTaskId === action.payload ? null : action.payload,
			};
		case "OPTIMISTIC_TASK_STATUS":
			return {
				...state,
				tasks: state.tasks.map((task) =>
					task.id === action.payload.taskId
						? {
								...task,
								status: action.payload.status,
								updated_at: new Date().toISOString(),
							}
						: task
				),
			};
		default:
			return state;
	}
}

function compareTasks(a, b) {
	const timeA = a.created_at ? new Date(a.created_at).getTime() : (a.id || 0);
	const timeB = b.created_at ? new Date(b.created_at).getTime() : (b.id || 0);
	return timeB - timeA;
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

function useManagerData(currentUser) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [selectedBuildingIds, setSelectedBuildingIds] = useState(() => {
		if (currentUser?.id) {
			try {
				const cached = localStorage.getItem(
					`structura_workspace_${currentUser.id}`
				);
				if (cached !== null) {
					return JSON.parse(cached);
				}
			} catch (e) {
				console.warn("Failed to read workspace cache", e);
			}
		}
		return null;
	});

	const loadTasks = () => {
		api.getTasks().then((data) => {
			dispatch({ type: "SET_TASKS", payload: [...data].sort(compareTasks) });
		});
	};

	useEffect(() => {
		loadTasks();
		api.getBuildings().then((data) => {
			dispatch({ type: "SET_BUILDINGS", payload: [...data].sort(compareBuildings) });
		});
		api.getUsers().then((users) => {
			dispatch({
				type: "SET_CONTRACTORS",
				payload: users
					.filter((u) => u.role === "contractor")
					.sort(compareContractors),
			});
		});

		if (currentUser?.role !== "contractor") {
			api.getUserPreferences()
				.then((prefs) => {
					if (prefs && Array.isArray(prefs.selected_building_ids) && prefs.selected_building_ids.length > 0) {
						setSelectedBuildingIds(prefs.selected_building_ids);
						if (currentUser?.id) {
							try {
								localStorage.setItem(
									`structura_workspace_${currentUser.id}`,
									JSON.stringify(prefs.selected_building_ids)
								);
							} catch (e) {
								console.warn("Failed to update workspace cache", e);
							}
						}
					}
				})
				.catch((err) => {
					console.error("Failed to fetch preferences:", err);
				});
		}
	}, [currentUser]);

	return { state, dispatch, loadTasks, selectedBuildingIds, setSelectedBuildingIds };
}

function ManagerFilterBar({
	activeFilter,
	onSelectFilter,
	pendingCount,
	completedCount,
	totalCount,
	isWorkspaceFiltered,
	isNoBuildingsSelected,
	selectedBuildingCount,
	totalBuildingCount,
	showWorkspaceButton,
	onOpenWorkspaceModal,
	t,
}) {
	return (
		<div style={filterTabsContainerStyle}>
			<button
				type="button"
				style={getFilterTabStyle(activeFilter === "all")}
				onClick={() => onSelectFilter("all")}
			>
				{t.all} ({totalCount})
			</button>
			<button
				type="button"
				style={getFilterTabStyle(activeFilter === "pending")}
				onClick={() => onSelectFilter("pending")}
			>
				{t.pending} ({pendingCount})
			</button>
			<button
				type="button"
				style={getFilterTabStyle(activeFilter === "completed")}
				onClick={() => onSelectFilter("completed")}
			>
				{t.completed} ({completedCount})
			</button>

			{showWorkspaceButton && (
				<button
					type="button"
					onClick={onOpenWorkspaceModal}
					style={{
						...getFilterTabStyle(isWorkspaceFiltered || isNoBuildingsSelected),
						display: "flex",
						alignItems: "center",
						gap: spacing[1],
						background:
							isWorkspaceFiltered || isNoBuildingsSelected
								? `${colors.primary}18`
								: colors.cardBg,
						color:
							isWorkspaceFiltered || isNoBuildingsSelected
								? colors.primary
								: colors.textSecondary,
						borderColor:
							isWorkspaceFiltered || isNoBuildingsSelected
								? colors.primary
								: colors.borderSubtle,
					}}
				>
					{ICONS.building}
					<span>
						{isNoBuildingsSelected
							? (t.noBuildingsSelected || "0 budynków")
							: isWorkspaceFiltered
								? `${selectedBuildingCount}/${totalBuildingCount}`
								: (t.allBuildings || "Wszystkie budynki")}
					</span>
				</button>
			)}
		</div>
	);
}

function TaskGroupHeader({ label, count, color, bg, border }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				padding: "4px 0",
				marginTop: "4px",
				marginBottom: "2px",
			}}
		>
			<span
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.big,
					color: colors.textHeading,
					letterSpacing: font.letterSpacing.wide,
					textTransform: "uppercase",
				}}
			>
				{label}
			</span>
			<span
				style={{
					padding: "2px 8px",
					borderRadius: radius.full,
					fontSize: "11px",
					fontWeight: font.weight.big,
					background: bg,
					border: `1px solid ${border}`,
					color: color,
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
				}}
			>
				<span
					style={{
						width: "6px",
						height: "6px",
						borderRadius: radius.full,
						background: color,
					}}
				/>
				{count}
			</span>
			<div
				style={{
					flex: 1,
					height: "1px",
					background: colors.borderSubtle,
				}}
			/>
		</div>
	);
}

function ManagerTaskList({
	tasks,
	expandedTaskId,
	updatingTaskIds,
	onToggleExpanded,
	onEditTask,
	onMarkCompleted,
	onRevertCompleted,
	onDeleteTask,
	isNoBuildingsSelected,
	onOpenWorkspaceModal,
	language,
	userRole,
	t,
}) {
	if (isNoBuildingsSelected) {
		return (
			<div
				style={{
					width: "100%",
					boxSizing: "border-box",
					textAlign: "center",
					padding: `${spacing[8]} ${spacing[4]}`,
					background: colors.cardBg,
					borderRadius: radius.xl,
					border: `1px solid ${colors.borderSubtle}`,
				}}
			>
				<p style={{ color: colors.textSecondary, margin: `0 0 ${spacing[3]} 0` }}>
					{t.noBuildingsSelectedMessage || "Nie wybrano żadnych budynków w filtrze obszaru roboczego."}
				</p>
				<button
					type="button"
					onClick={onOpenWorkspaceModal}
					style={{
						...components.ghostButton,
						color: colors.primary,
						borderColor: colors.primary,
						minHeight: "44px",
						minWidth: "44px",
					}}
				>
					{t.configureWorkspace || "Skonfiguruj obszar roboczy"}
				</button>
			</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<div
				style={{
					width: "100%",
					boxSizing: "border-box",
					textAlign: "center",
					padding: `${spacing[8]} 0`,
					color: colors.textSecondary,
					fontSize: font.size.sm,
				}}
			>
				{t.noTasks}
			</div>
		);
	}

	const pendingTasks = tasks.filter((t) => t.status === "pending");
	const completedTasks = tasks.filter((t) => t.status === "completed");

	return (
		<div style={{ width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: spacing[3] }}>
			{pendingTasks.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
					<TaskGroupHeader
						label={t.pending || "Oczekujące"}
						count={pendingTasks.length}
						color="#92400e"
						bg="#fef3c7"
						border="#fde68a"
					/>
					{pendingTasks.map((task) => (
						<Task
							key={task.id}
							initialData={task}
							expanded={expandedTaskId === task.id}
							onToggle={() => onToggleExpanded(task.id)}
							onEdit={() => onEditTask(task)}
							onMarkCompleted={() => onMarkCompleted(task.id)}
							onRevertCompleted={() => onRevertCompleted(task.id)}
							onDeleteTask={() => onDeleteTask(task.id)}
							isUpdating={updatingTaskIds?.has(task.id)}
							language={language}
							userRole={userRole}
						/>
					))}
				</div>
			)}

			{completedTasks.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: spacing[3], marginTop: pendingTasks.length > 0 ? spacing[2] : 0 }}>
					<TaskGroupHeader
						label={t.completed || "Ukończone"}
						count={completedTasks.length}
						color="#27500a"
						bg="#eaf3de"
						border="#97c459"
					/>
					{completedTasks.map((task) => (
						<Task
							key={task.id}
							initialData={task}
							expanded={expandedTaskId === task.id}
							onToggle={() => onToggleExpanded(task.id)}
							onEdit={() => onEditTask(task)}
							onMarkCompleted={() => onMarkCompleted(task.id)}
							onRevertCompleted={() => onRevertCompleted(task.id)}
							onDeleteTask={() => onDeleteTask(task.id)}
							isUpdating={updatingTaskIds?.has(task.id)}
							language={language}
							userRole={userRole}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function useFilteredTasks(tasks, buildings, activeFilter, currentUser, selectedBuildingIds) {
	const isNoBuildingsSelected =
		currentUser?.role !== "contractor" &&
		selectedBuildingIds !== null &&
		Array.isArray(selectedBuildingIds) &&
		selectedBuildingIds.length === 0 &&
		buildings.length > 0;

	const isWorkspaceFiltered =
		currentUser?.role !== "contractor" &&
		selectedBuildingIds !== null &&
		Array.isArray(selectedBuildingIds) &&
		selectedBuildingIds.length > 0 &&
		selectedBuildingIds.length < buildings.length;

	const selectedBuildingIdSet = useMemo(() => {
		if (Array.isArray(selectedBuildingIds)) {
			return new Set(selectedBuildingIds.map(Number));
		}
		return null;
	}, [selectedBuildingIds]);

	const filteredTasks = useMemo(() => {
		if (isNoBuildingsSelected) {
			return [];
		}

		let currentTasks = tasks;

		if (isWorkspaceFiltered && selectedBuildingIdSet) {
			currentTasks = currentTasks.filter((t) =>
				selectedBuildingIdSet.has(Number(t.building_id))
			);
		}

		let result;
		switch (activeFilter) {
			case "pending":
				result = currentTasks.filter((t) => t.status === "pending");
				break;
			case "completed":
				result = currentTasks.filter((t) => t.status === "completed");
				break;
			case "all":
				result = currentTasks;
				break;
			default:
				result = currentTasks.filter(
					(t) => t.building_id === parseInt(activeFilter)
				);
				break;
		}
		return [...result].sort(compareTasks);
	}, [
		tasks,
		activeFilter,
		isNoBuildingsSelected,
		isWorkspaceFiltered,
		selectedBuildingIdSet,
	]);

	const counts = useMemo(() => {
		let currentTasks = tasks;
		if (isWorkspaceFiltered && selectedBuildingIdSet) {
			currentTasks = currentTasks.filter((t) =>
				selectedBuildingIdSet.has(t.building_id)
			);
		}
		return {
			pending: currentTasks.filter((t) => t.status === "pending").length,
			completed: currentTasks.filter((t) => t.status === "completed").length,
			total: currentTasks.length,
		};
	}, [tasks, isWorkspaceFiltered, selectedBuildingIdSet]);

	return {
		filteredTasks,
		counts,
		isNoBuildingsSelected,
		isWorkspaceFiltered,
	};
}

function CreateTaskButton({ onClick, t }) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				...components.primaryButton,
				position: "fixed",
				bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
				right: "max(24px, calc((100vw - 840px) / 2 + 20px))",
				width: "56px",
				height: "56px",
				borderRadius: radius.full,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: "0 6px 20px rgba(46, 141, 228, 0.45)",
				zIndex: 1000,
				cursor: "pointer",
				border: "none",
				transition: "transform 0.15s ease, background-color 0.15s ease",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = colors.primaryHover;
				e.currentTarget.style.transform = "scale(1.06)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = colors.primary;
				e.currentTarget.style.transform = "scale(1)";
			}}
			onMouseDown={(e) => {
				e.currentTarget.style.transform = "scale(0.94)";
			}}
			onMouseUp={(e) => {
				e.currentTarget.style.transform = "scale(1.06)";
			}}
			aria-label={t.createNewTask || t.createTask || "Utwórz zadanie"}
			title={t.createNewTask || t.createTask || "Utwórz zadanie"}
		>
			<svg
				width="26"
				height="26"
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
	);
}

export default function ManagerPage({
	currentUser,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const [isWorkspaceModalOpen, setWorkspaceModalOpen] = useState(false);
	const [updatingTaskIds, setUpdatingTaskIds] = useState(() => new Set());

	const {
		state,
		dispatch,
		loadTasks,
		selectedBuildingIds,
		setSelectedBuildingIds,
	} = useManagerData(currentUser);

	const {
		filteredTasks,
		counts,
		isNoBuildingsSelected,
		isWorkspaceFiltered,
	} = useFilteredTasks(
		state.tasks,
		state.buildings,
		state.activeFilter,
		currentUser,
		selectedBuildingIds
	);

	const handleSaveWorkspace = (newBuildingIds) => {
		setSelectedBuildingIds(newBuildingIds);
		if (currentUser?.id) {
			try {
				localStorage.setItem(
					`structura_workspace_${currentUser.id}`,
					JSON.stringify(newBuildingIds)
				);
			} catch (e) {
				console.warn("Failed to update workspace cache", e);
			}
		}
		api.updateUserPreferences({
			selected_building_ids: newBuildingIds || [],
		}).catch((err) =>
			console.error("Failed to save workspace preferences:", err)
		);
	};

	const handleMarkCompleted = async (taskId) => {
		setUpdatingTaskIds((prev) => new Set(prev).add(taskId));
		dispatch({
			type: "OPTIMISTIC_TASK_STATUS",
			payload: { taskId, status: "completed" },
		});
		try {
			await api.updateTaskStatus(taskId, "completed");
			loadTasks();
		} catch (err) {
			console.error("Failed to mark task completed", err);
			loadTasks();
		} finally {
			setUpdatingTaskIds((prev) => {
				const next = new Set(prev);
				next.delete(taskId);
				return next;
			});
		}
	};

	const handleRevertCompleted = async (taskId) => {
		setUpdatingTaskIds((prev) => new Set(prev).add(taskId));
		dispatch({
			type: "OPTIMISTIC_TASK_STATUS",
			payload: { taskId, status: "pending" },
		});
		try {
			await api.updateTaskStatus(taskId, "pending");
			loadTasks();
		} catch (err) {
			console.error("Failed to revert task", err);
			loadTasks();
		} finally {
			setUpdatingTaskIds((prev) => {
				const next = new Set(prev);
				next.delete(taskId);
				return next;
			});
		}
	};

	const handleDeleteTask = async (taskId) => {
		if (confirm(t.deleteTaskConfirm)) {
			try {
				await api.deleteTask(taskId);
				loadTasks();
			} catch (err) {
				console.error("Failed to delete task", err);
			}
		}
	};

	return (
		<div
			style={{
				padding: `${spacing[4]} ${spacing[4]}`,
				maxWidth: "840px",
				width: "100%",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: spacing[3],
				boxSizing: "border-box",
			}}
		>
			<ManagerFilterBar
				activeFilter={state.activeFilter}
				onSelectFilter={(filter) =>
					dispatch({ type: "SET_ACTIVE_FILTER", payload: filter })
				}
				pendingCount={counts.pending}
				completedCount={counts.completed}
				totalCount={counts.total}
				isWorkspaceFiltered={isWorkspaceFiltered}
				isNoBuildingsSelected={isNoBuildingsSelected}
				selectedBuildingCount={selectedBuildingIds === null ? state.buildings.length : (selectedBuildingIds?.length || 0)}
				totalBuildingCount={state.buildings.length}
				showWorkspaceButton={currentUser?.role !== "contractor"}
				onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
				t={t}
			/>

			<ManagerTaskList
				tasks={filteredTasks}
				expandedTaskId={state.expandedTaskId}
				updatingTaskIds={updatingTaskIds}
				onToggleExpanded={(id) =>
					dispatch({ type: "TOGGLE_TASK_EXPANDED", payload: id })
				}
				onEditTask={(task) =>
					dispatch({ type: "SET_EDITING_TASK", payload: task })
				}
				onMarkCompleted={handleMarkCompleted}
				onRevertCompleted={handleRevertCompleted}
				onDeleteTask={handleDeleteTask}
				isNoBuildingsSelected={isNoBuildingsSelected}
				onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
				language={language}
				userRole={currentUser?.role}
				t={t}
			/>

			{state.isCreateTaskOpen && (
				<TaskModal
					isOpen={state.isCreateTaskOpen}
					buildings={state.buildings}
					selectedBuildingIds={selectedBuildingIds}
					contractors={state.contractors}
					currentUser={currentUser}
					onClose={() =>
						dispatch({ type: "SET_CREATE_TASK_OPEN", payload: false })
					}
					onTaskCreated={loadTasks}
					language={language}
				/>
			)}

			{state.editingTask && (
				<TaskModal
					isOpen={!!state.editingTask}
					task={state.editingTask}
					buildings={state.buildings}
					selectedBuildingIds={selectedBuildingIds}
					contractors={state.contractors}
					currentUser={currentUser}
					onClose={() =>
						dispatch({ type: "SET_EDITING_TASK", payload: null })
					}
					onTaskCreated={loadTasks}
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

			{currentUser?.role !== "contractor" && (
				<CreateTaskButton
					onClick={() =>
						dispatch({ type: "SET_CREATE_TASK_OPEN", payload: true })
					}
					t={t}
				/>
			)}
		</div>
	);
}
