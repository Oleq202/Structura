import { useState, useEffect } from "react";
import Task from "../components/Task";
import Navbar from "../components/Navbar";
import CreateTask from "../components/CreateTask";
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

export default function ManagerPage({
	currentUser,
	language = "pl",
}) {
	const [activeFilter, setActiveFilter] =
		useState("all");
	const [isCreateTaskOpen, setCreateTaskOpen] =
		useState(false);
	const [expandedTaskId, setExpandedTaskId] =
		useState(null);
	const [tasks, setTasks] = useState([]);
	const [buildings, setBuildings] = useState(
		[]
	);
	const [contractors, setContractors] =
		useState([]);
	const openCreateTask = () =>
		setCreateTaskOpen(true);
	const closeCreateTask = () =>
		setCreateTaskOpen(false);
	const toggleCreateTask = () =>
		setCreateTaskOpen((v) => !v);
	const toggleTaskExpanded = (taskId) => {
		setExpandedTaskId((prev) =>
			prev === taskId ? null : taskId
		);
	};

	const refreshTasks = () => {
		api.getTasks()
			.then(setTasks)
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
					setTasks(tasks);
					setBuildings(buildings);
					setContractors(contractors);
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

	const handleReassign = async (taskId) => {
		console.log("Reassign task:", taskId);
	};

	const getFilteredTasks = () => {
		switch (activeFilter) {
			case "pending":
				return tasks.filter(
					(t) => t.status === "pending"
				);
			case "completed":
				return tasks.filter(
					(t) =>
						t.status === "completed"
				);
			default:
				if (
					![
						"all",
						"pending",
						"completed",
					].includes(activeFilter)
				) {
					return tasks.filter(
						(t) =>
							t.building_id ===
							parseInt(activeFilter)
					);
				}
				return tasks;
		}
	};

	const groupTasksByBuilding = (
		tasksToGroup
	) => {
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

		return Object.values(groups).sort(
			(a, b) => {
				const aAddress = a.building
					? `${a.building.street_address}, ${a.building.district || ""}, ${a.building.city}`
					: "";
				const bAddress = b.building
					? `${b.building.street_address}, ${b.building.district || ""}, ${b.building.city}`
					: "";
				return aAddress.localeCompare(
					bAddress
				);
			}
		);
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
				activeFilter={activeFilter}
				onFilterChange={setActiveFilter}
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
				{activeFilter === "all" ? (
					<>
						{(() => {
							const pendingTasks =
								tasks.filter(
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
																	expandedTaskId ===
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
								tasks.filter(
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
																	expandedTaskId ===
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
													expandedTaskId ===
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
				style={{
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
				}}
				onMouseEnter={(e) =>
					(e.currentTarget.style.background =
						colors.primaryHover)
				}
				onMouseLeave={(e) =>
					(e.currentTarget.style.background =
						colors.primary)
				}
				onClick={toggleCreateTask}
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
			{isCreateTaskOpen && (
				<CreateTask
					buildings={buildings}
					contractors={contractors}
					currentUser={currentUser}
					onClose={closeCreateTask}
					onTaskCreated={refreshTasks}
					language={language}
				/>
			)}
		</div>
	);
}
