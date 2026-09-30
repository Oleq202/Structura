import { useState, useEffect, useReducer, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
	status as statusTokens,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import Task from "../components/Task";
import TaskModal from "../components/TaskModal";
import WorkspaceFilterModal from "../components/WorkspaceFilterModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Skeleton from "../components/ui/Skeleton";
import useToast from "../hooks/useToast";
import {
	IconPlus,
	IconBuilding,
	IconClock,
	IconChevronDown,
	IconCheck,
} from "../components/icons";

const filterTabsContainerStyle = {
	display: "flex",
	alignItems: "center",
	gap: spacing[2],
	overflowX: "auto",
	whiteSpace: "nowrap",
	flexWrap: "nowrap",
	paddingBottom: spacing[1],
	scrollbarWidth: "none",
	msOverflowStyle: "none",
	flex: 1,
	minWidth: 0,
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
	flexShrink: 0,
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
	loadingTasks: true,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_LOADING_TASKS":
			return { ...state, loadingTasks: action.payload };
		case "SET_TASKS":
			return { ...state, tasks: action.payload, loadingTasks: false };
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
	const [completedDays, setCompletedDays] = useState(14);
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

	const loadTasks = useCallback((days = completedDays) => {
		dispatch({ type: "SET_LOADING_TASKS", payload: true });
		api.getTasks({ completed_days: days })
			.then((data) => {
				dispatch({ type: "SET_TASKS", payload: [...data].sort(compareTasks) });
			})
			.catch((err) => {
				console.error("Failed to load tasks:", err);
				dispatch({ type: "SET_LOADING_TASKS", payload: false });
			});
	}, [completedDays]);

	const handleCompletedDaysChange = (days) => {
		setCompletedDays(days);
		loadTasks(days);
	};

	useEffect(() => {
		loadTasks(completedDays);
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
	}, [currentUser, completedDays, loadTasks]);

	return {
		state,
		dispatch,
		loadTasks,
		completedDays,
		setCompletedDays: handleCompletedDaysChange,
		selectedBuildingIds,
		setSelectedBuildingIds,
	};
}

function WorkspaceFilterButton({
	isWorkspaceFiltered,
	isNoBuildingsSelected,
	selectedBuildingCount,
	totalBuildingCount,
	onOpenWorkspaceModal,
	t,
}) {
	const isActive = isWorkspaceFiltered || isNoBuildingsSelected;
	const label = isNoBuildingsSelected
		? t.noBuildingsSelected || "0 budynków"
		: isWorkspaceFiltered
			? `${selectedBuildingCount}/${totalBuildingCount}`
			: t.allBuildings || "Wszystkie budynki";

	return (
		<button
			type="button"
			onClick={onOpenWorkspaceModal}
			style={{
				...getFilterTabStyle(isActive),
				display: "flex",
				alignItems: "center",
				gap: spacing[1],
				background: isActive ? `${colors.primary}18` : colors.cardBg,
				color: isActive ? colors.primary : colors.textSecondary,
				borderColor: isActive ? colors.primary : colors.borderSubtle,
			}}
		>
			<IconBuilding size="sm" />
			<span>{label}</span>
		</button>
	);
}

function TimeRangeOptionItem({ option, isSelected, onSelect }) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<button
			type="button"
			onClick={() => onSelect(option.value)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				width: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "8px 12px",
				borderRadius: radius.md,
				fontSize: font.size.sm,
				fontWeight: isSelected ? font.weight.semibold : font.weight.medium,
				color: isSelected ? colors.primary : colors.textHeading,
				backgroundColor: isSelected
					? `${colors.primary}12`
					: isHovered
						? colors.pageBg
						: "transparent",
				border: "none",
				cursor: "pointer",
				transition: "background-color 0.12s ease, color 0.12s ease",
				boxSizing: "border-box",
				textAlign: "left",
			}}
		>
			<span>{option.label}</span>
			{isSelected && (
				<span style={{ color: colors.primary, display: "flex", alignItems: "center" }}>
					<IconCheck size="sm" />
				</span>
			)}
		</button>
	);
}

function TimeRangeSelector({ completedDays, onCompletedDaysChange, t }) {
	const [isOpen, setIsOpen] = useState(false);
	const [coords, setCoords] = useState(null);
	const buttonRef = useRef(null);
	const menuRef = useRef(null);

	const options = useMemo(
		() => [
			{ value: 14, label: t.timeRange2Weeks || "Ostatnie 2 tyg." },
			{ value: 30, label: t.timeRangeMonth || "Ostatnie 30 dni" },
			{ value: 90, label: t.timeRangeQuarter || "Ostatnie 90 dni" },
			{ value: 0, label: t.timeRangeAll || "Wszystkie" },
		],
		[t]
	);

	const currentOption = options.find((opt) => opt.value === completedDays) || options[0];

	const updateCoords = useCallback(() => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			setCoords({
				top: rect.bottom + 6,
				left: Math.max(8, Math.min(rect.left, window.innerWidth - 190)),
			});
		}
	}, []);

	const handleToggle = () => {
		if (!isOpen) {
			updateCoords();
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		updateCoords();

		const handleClickOutside = (event) => {
			if (
				buttonRef.current &&
				!buttonRef.current.contains(event.target) &&
				menuRef.current &&
				!menuRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		const handleScrollOrResize = () => {
			updateCoords();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
		};
	}, [isOpen, updateCoords]);

	return (
		<div style={{ position: "relative", flexShrink: 0 }}>
			<button
				ref={buttonRef}
				type="button"
				onClick={handleToggle}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-label={t.timeRangeLabel || "Zakres czasu"}
				style={{
					...getFilterTabStyle(isOpen),
					display: "inline-flex",
					alignItems: "center",
					gap: "8px",
					padding: `0 ${spacing[3]}`,
					height: "44px",
					borderRadius: radius.full,
					backgroundColor: isOpen ? `${colors.primary}12` : colors.cardBg,
					borderColor: isOpen ? colors.primary : colors.borderSubtle,
					color: isOpen ? colors.primary : colors.textPrimary,
					boxSizing: "border-box",
					cursor: "pointer",
					transition: "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
					boxShadow: isOpen ? `0 0 0 2px ${colors.primary}20` : "none",
				}}
			>
				<span style={{ color: isOpen ? colors.primary : colors.textSecondary, display: "flex", alignItems: "center" }}>
					<IconClock size="sm" />
				</span>
				<span style={{ fontSize: font.size.xs, fontWeight: font.weight.medium, color: colors.textSecondary }}>
					{t.timeRange}:
				</span>
				<span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: isOpen ? colors.primary : colors.textHeading }}>
					{currentOption.label}
				</span>
				<span
					style={{
						color: isOpen ? colors.primary : colors.textSecondary,
						display: "flex",
						alignItems: "center",
						transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
					}}
				>
					<IconChevronDown size="xs" />
				</span>
			</button>

			{isOpen && coords && createPortal(
				<div
					ref={menuRef}
					role="listbox"
					aria-label={t.timeRangeLabel || "Zakres czasu"}
					style={{
						position: "fixed",
						top: `${coords.top}px`,
						left: `${coords.left}px`,
						backgroundColor: colors.cardBg,
						border: `1px solid ${colors.borderSubtle}`,
						borderRadius: radius.lg,
						boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.1)",
						padding: "6px",
						minWidth: "180px",
						zIndex: 9999,
						display: "flex",
						flexDirection: "column",
						gap: "2px",
						animation: "popIn 0.15s ease-out",
					}}
				>
					{options.map((option) => (
						<TimeRangeOptionItem
							key={option.value}
							option={option}
							isSelected={completedDays === option.value}
							onSelect={(val) => {
								onCompletedDaysChange(val);
								setIsOpen(false);
							}}
						/>
					))}
				</div>,
				document.body
			)}
		</div>
	);
}

function ManagerFilterBar({
	activeFilter,
	onSelectFilter,
	pendingCount,
	completedCount,
	totalCount,
	completedDays,
	onCompletedDaysChange,
	isWorkspaceFiltered,
	isNoBuildingsSelected,
	selectedBuildingCount,
	totalBuildingCount,
	showWorkspaceButton,
	onOpenWorkspaceModal,
	canCreateTask,
	onOpenCreateTask,
	t,
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: spacing[3],
				width: "100%",
			}}
		>
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
					<WorkspaceFilterButton
						isWorkspaceFiltered={isWorkspaceFiltered}
						isNoBuildingsSelected={isNoBuildingsSelected}
						selectedBuildingCount={selectedBuildingCount}
						totalBuildingCount={totalBuildingCount}
						onOpenWorkspaceModal={onOpenWorkspaceModal}
						t={t}
					/>
				)}

				<TimeRangeSelector
					completedDays={completedDays}
					onCompletedDaysChange={onCompletedDaysChange}
					t={t}
				/>
			</div>

			{canCreateTask && (
				<button
					type="button"
					className="desktop-create-task-btn"
					onClick={onOpenCreateTask}
					style={{
						...components.primaryButton,
						padding: `${spacing[2]} ${spacing[4]}`,
						borderRadius: radius.md,
						fontSize: font.size.sm,
						fontWeight: font.weight.semibold,
						display: "inline-flex",
						alignItems: "center",
						gap: spacing[2],
						minHeight: "40px",
						whiteSpace: "nowrap",
						flexShrink: 0,
						cursor: "pointer",
						boxShadow: shadow.sm,
					}}
				>
					<IconPlus size="sm" style={{ strokeWidth: 2.5 }} />
					<span>{t.createNewTask || "Nowe zadanie"}</span>
				</button>
			)}
		</div>
	);
}

function TaskGroupHeader({ label, count, groupStatus = "pending" }) {
	const s = statusTokens[groupStatus] || statusTokens.pending;
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "10px",
				padding: "4px 0",
				marginTop: "4px",
				marginBottom: "2px",
			}}
		>
			<span
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.semibold,
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
					fontSize: font.size.xs,
					fontWeight: font.weight.semibold,
					fontVariantNumeric: "tabular-nums",
					background: s.bg,
					border: `1px solid ${s.border}`,
					color: s.text,
					display: "inline-flex",
					alignItems: "center",
					gap: "5px",
				}}
			>
				<span
					style={{
						width: "6px",
						height: "6px",
						borderRadius: radius.full,
						background: s.solid || s.text,
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
	loading,
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
	if (loading && tasks.length === 0) {
		return (
			<div
				style={{
					width: "100%",
					boxSizing: "border-box",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
					gap: spacing[3],
					paddingBottom: "110px",
				}}
			>
				<Skeleton.Card height="130px" />
				<Skeleton.Card height="130px" />
				<Skeleton.Card height="130px" />
				<Skeleton.Card height="130px" />
			</div>
		);
	}

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
		<div
			style={{
				width: "100%",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
				paddingBottom: "110px",
			}}
		>
			{pendingTasks.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: spacing[3] }}>
					<TaskGroupHeader
						label={t.pending || "Oczekujące"}
						count={pendingTasks.length}
						groupStatus="pending"
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
							gap: spacing[3],
							alignItems: "start",
						}}
					>
						{pendingTasks.map((task) => (
							<Task
								key={task.id}
								initialData={task}
								expanded={expandedTaskId === task.id}
								onToggle={() => onToggleExpanded(task.id)}
								onEdit={() => onEditTask(task)}
								onMarkCompleted={() => onMarkCompleted(task.id)}
								onRevertCompleted={() => onRevertCompleted(task.id)}
								onDeleteTask={() => onDeleteTask(task)}
								isUpdating={updatingTaskIds?.has(task.id)}
								language={language}
								userRole={userRole}
							/>
						))}
					</div>
				</div>
			)}

			{completedTasks.length > 0 && (
				<div style={{ display: "flex", flexDirection: "column", gap: spacing[3], marginTop: pendingTasks.length > 0 ? spacing[2] : 0 }}>
					<TaskGroupHeader
						label={t.completed || "Ukończone"}
						count={completedTasks.length}
						groupStatus="completed"
					/>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
							gap: spacing[3],
							alignItems: "start",
						}}
					>
						{completedTasks.map((task) => (
							<Task
								key={task.id}
								initialData={task}
								expanded={expandedTaskId === task.id}
								onToggle={() => onToggleExpanded(task.id)}
								onEdit={() => onEditTask(task)}
								onMarkCompleted={() => onMarkCompleted(task.id)}
								onRevertCompleted={() => onRevertCompleted(task.id)}
								onDeleteTask={() => onDeleteTask(task)}
								isUpdating={updatingTaskIds?.has(task.id)}
								language={language}
								userRole={userRole}
							/>
						))}
					</div>
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
			className="mobile-fab-btn"
			onClick={onClick}
			style={{
				...components.primaryButton,
				position: "fixed",
				bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
				right: "max(24px, calc((100vw - 1200px) / 2 + 20px))",
				width: "56px",
				height: "56px",
				borderRadius: radius.full,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: "0 6px 20px rgba(29, 112, 184, 0.45)",
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
			<IconPlus size="lg" style={{ strokeWidth: 2.5 }} />
		</button>
	);
}

export default function ManagerPage({
	currentUser,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const { toast } = useToast();
	const [isWorkspaceModalOpen, setWorkspaceModalOpen] = useState(false);
	const [updatingTaskIds, setUpdatingTaskIds] = useState(() => new Set());

	const {
		state,
		dispatch,
		loadTasks,
		completedDays,
		setCompletedDays,
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
			toast.success(t.taskMarkedCompleted || "Zadanie oznaczone jako ukończone");
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
			toast.info(t.taskReverted || "Przywrócono status zadania");
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

	const [taskToDelete, setTaskToDelete] = useState(null);
	const [isDeletingTask, setIsDeletingTask] = useState(false);

	const handleDeleteTask = (task) => {
		setTaskToDelete(task);
	};

	const handleConfirmDeleteTask = async () => {
		if (!taskToDelete) return;
		try {
			setIsDeletingTask(true);
			await api.deleteTask(taskToDelete.id);
			setTaskToDelete(null);
			toast.success(t.taskDeletedSuccess || "Zadanie zostało usunięte");
			loadTasks();
		} catch (err) {
			console.error("Failed to delete task", err);
		} finally {
			setIsDeletingTask(false);
		}
	};

	return (
		<div
			style={{
				padding: `${spacing[4]} ${spacing[4]}`,
				maxWidth: "1200px",
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
				completedDays={completedDays}
				onCompletedDaysChange={setCompletedDays}
				isWorkspaceFiltered={isWorkspaceFiltered}
				isNoBuildingsSelected={isNoBuildingsSelected}
				selectedBuildingCount={selectedBuildingIds === null ? state.buildings.length : (selectedBuildingIds?.length || 0)}
				totalBuildingCount={state.buildings.length}
				showWorkspaceButton={currentUser?.role !== "contractor"}
				onOpenWorkspaceModal={() => setWorkspaceModalOpen(true)}
				canCreateTask={currentUser?.role !== "contractor"}
				onOpenCreateTask={() =>
					dispatch({ type: "SET_CREATE_TASK_OPEN", payload: true })
				}
				t={t}
			/>

			<ManagerTaskList
				tasks={filteredTasks}
				loading={state.loadingTasks}
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
					onTaskCreated={() => {
						loadTasks();
						toast.success(t.taskCreatedSuccess || "Zadanie zostało utworzone");
					}}
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
					onTaskCreated={() => {
						loadTasks();
						toast.success(t.taskUpdatedSuccess || "Zadanie zostało zaktualizowane");
					}}
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

			{taskToDelete && (
				<DeleteConfirmModal
					isOpen={!!taskToDelete}
					onClose={() => setTaskToDelete(null)}
					onConfirm={handleConfirmDeleteTask}
					isDeleting={isDeletingTask}
					title={t.deleteTaskConfirmTitle || "Usunięcie zadania"}
					message={t.deleteTaskModalMsg || t.deleteTaskConfirm}
					itemName={taskToDelete.title}
					itemType={t.entityTask || "Zadanie"}
					language={language}
				/>
			)}
		</div>
	);
}
