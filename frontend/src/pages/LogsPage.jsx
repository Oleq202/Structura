import { useState, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	components,
} from "../theme";
import { translations } from "../i18n";
import LogEntry from "../components/LogEntry";
import * as api from "../services/api";

export default function LogsPage({
	language = "pl",
	currentUser,
}) {
	const t = translations[language];
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [expandedLogId, setExpandedLogId] =
		useState(null);
	const [filters, setFilters] = useState({
		userId: "",
		startDate: "",
		endDate: "",
	});
	const [users, setUsers] = useState([]);

	useEffect(() => {
		// Check if user is admin
		if (currentUser?.role !== "admin") {
			setLoading(false);
			return;
		}

		// Fetch users for filter dropdown
		const fetchUsers = async () => {
			try {
				const usersData =
					await api.getUsers();
				setUsers(usersData);
			} catch (err) {
				console.error(
					"Failed to fetch users:",
					err
				);
			}
		};

		// Fetch logs
		const fetchLogs = async () => {
			try {
				const logsData =
					await api.getActivityLogs({
						userId:
							filters.userId ||
							undefined,
						startDate:
							filters.startDate ||
							undefined,
						endDate:
							filters.endDate ||
							undefined,
					});
				setLogs(logsData);
			} catch (err) {
				console.error(
					"Failed to fetch logs:",
					err
				);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
		fetchLogs();
	}, [currentUser, filters]);

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleResetFilters = () => {
		setFilters({
			userId: "",
			startDate: "",
			endDate: "",
		});
	};

	const toggleLogExpansion = (logId) => {
		setExpandedLogId((prev) =>
			prev === logId ? null : logId
		);
	};

	// Admin-only access check
	if (currentUser?.role !== "admin") {
		return (
			<div
				style={{
					padding: spacing[8],
					textAlign: "center",
				}}
			>
				<h1
					style={{
						fontSize:
							font.size["2xl"],
						fontWeight:
							font.weight.medium,
						color: colors.textHeading,
						marginBottom: spacing[4],
					}}
				>
					{t.logs}
				</h1>
				<p
					style={{
						fontSize: font.size.base,
						color: colors.textSecondary,
					}}
				>
					{t.settingsAccessLimited ||
						"Access is limited to administrators."}
				</p>
			</div>
		);
	}

	if (loading) {
		return (
			<div
				style={{
					padding: spacing[8],
					textAlign: "center",
				}}
			>
				<p
					style={{
						fontSize: font.size.base,
						color: colors.textSecondary,
					}}
				>
					{t.loading || "Loading..."}
				</p>
			</div>
		);
	}

	return (
		<div
			style={{
				padding: `${spacing[6]} ${spacing[8]}`,
				maxWidth: "1200px",
				margin: "0 auto",
			}}
		>
			<h1
				style={{
					fontSize: font.size["2xl"],
					fontWeight:
						font.weight.medium,
					color: colors.textHeading,
					marginBottom: spacing[6],
				}}
			>
				{t.logs}
			</h1>

			{/* Filters */}
			<div
				style={{
					background: colors.cardBg,
					border: `0.5px solid ${colors.cardBorder}`,
					borderRadius: radius.xl,
					padding: spacing[6],
					marginBottom: spacing[6],
					display: "flex",
					flexWrap: "wrap",
					gap: spacing[4],
					alignItems: "flex-end",
				}}
			>
				<div
					style={{
						flex: 1,
						minWidth: "200px",
					}}
				>
					<label
						style={{
							fontSize:
								font.size.sm,
							color: colors.textSecondary,
							marginBottom:
								spacing[2],
							display: "block",
						}}
					>
						{t.filterByUser ||
							"Filter by user"}
					</label>
					<select
						style={{
							...components.input,
							width: "100%",
							boxSizing:
								"border-box",
						}}
						value={filters.userId}
						onChange={(e) =>
							handleFilterChange(
								"userId",
								e.target.value
							)
						}
					>
						<option value="">
							{t.allUsers ||
								"All users"}
						</option>
						{users.map((user) => (
							<option
								key={user.id}
								value={user.id}
							>
								{user.first_name}{" "}
								{user.last_name}
							</option>
						))}
					</select>
				</div>

				<div
					style={{
						flex: 1,
						minWidth: "200px",
					}}
				>
					<label
						style={{
							fontSize:
								font.size.sm,
							color: colors.textSecondary,
							marginBottom:
								spacing[2],
							display: "block",
						}}
					>
						{t.startDate ||
							"Start date"}
					</label>
					<input
						type="date"
						style={{
							...components.input,
							width: "100%",
							boxSizing:
								"border-box",
						}}
						value={filters.startDate}
						onChange={(e) =>
							handleFilterChange(
								"startDate",
								e.target.value
							)
						}
					/>
				</div>

				<div
					style={{
						flex: 1,
						minWidth: "200px",
					}}
				>
					<label
						style={{
							fontSize:
								font.size.sm,
							color: colors.textSecondary,
							marginBottom:
								spacing[2],
							display: "block",
						}}
					>
						{t.endDate || "End date"}
					</label>
					<input
						type="date"
						style={{
							...components.input,
							width: "100%",
							boxSizing:
								"border-box",
						}}
						value={filters.endDate}
						onChange={(e) =>
							handleFilterChange(
								"endDate",
								e.target.value
							)
						}
					/>
				</div>

				<div
					style={{
						display: "flex",
						gap: spacing[3],
					}}
				>
					<button
						onClick={
							handleResetFilters
						}
						style={{
							...components.ghostButton,
							padding: `${spacing[3]} ${spacing[4]}`,
							borderRadius:
								radius.lg,
						}}
					>
						{t.resetFilters ||
							"Reset filters"}
					</button>
				</div>
			</div>

			{/* Logs list */}
			{logs.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: spacing[8],
						color: colors.textSecondary,
					}}
				>
					{t.noLogs || "No logs found"}
				</div>
			) : (
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fill, minmax(400px, 1fr))",
						gap: spacing[4],
					}}
				>
					{logs.map((log) => (
						<LogEntry
							key={log.id}
							initialData={log}
							expanded={
								expandedLogId ===
								log.id
							}
							onToggle={() =>
								toggleLogExpansion(
									log.id
								)
							}
							language={language}
						/>
					))}
				</div>
			)}
		</div>
	);
}
