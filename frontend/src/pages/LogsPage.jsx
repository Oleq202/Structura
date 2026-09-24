import { useState, useEffect, useMemo } from "react";
import {
	colors,
	font,
	radius,
	shadow,
	components,
	spacing,
} from "../theme";
import { translations } from "../i18n";
import LogEntry from "../components/LogEntry";
import * as api from "../services/api";

const ICONS = {
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
	task: (
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
			<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
			<rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
			<path d="M9 14l2 2 4-4" />
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
	key: (
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
			<circle cx="8" cy="15" r="4" />
			<path d="M10.85 12.15L19 4" />
			<path d="M18 5l2 2" />
			<path d="M15 8l2 2" />
		</svg>
	),
	close: (
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
};

export default function LogsPage({
	language = "pl",
	currentUser,
}) {
	const t = translations[language] || translations.pl;
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		userId: "",
		entityType: "",
		operationType: "",
		search: "",
		startDate: "",
		endDate: "",
	});
	const [users, setUsers] = useState([]);
	const [expandedLogId, setExpandedLogId] = useState(null);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	useEffect(() => {
		if (currentUser?.role !== "admin") {
			setLoading(false);
			return;
		}

		const fetchUsers = async () => {
			try {
				const usersData = await api.getUsers();
				setUsers(usersData);
			} catch (err) {
				console.error("Failed to fetch users:", err);
			}
		};

		fetchUsers();
	}, [currentUser]);

	useEffect(() => {
		if (currentUser?.role !== "admin") return;

		const fetchLogs = async () => {
			try {
				setLoading(true);
				const logsData = await api.getActivityLogs({
					userId: filters.userId || undefined,
					entityType: filters.entityType || undefined,
					operationType: filters.operationType || undefined,
					search: filters.search || undefined,
					startDate: filters.startDate || undefined,
					endDate: filters.endDate || undefined,
					limit: 100,
				});
				setLogs(logsData);
			} catch (err) {
				console.error("Failed to fetch logs:", err);
			} finally {
				setLoading(false);
			}
		};

		const debounceTimer = setTimeout(() => {
			fetchLogs();
		}, 200);

		return () => clearTimeout(debounceTimer);
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
			entityType: "",
			operationType: "",
			search: "",
			startDate: "",
			endDate: "",
		});
	};

	const hasActiveFilters = Boolean(
		filters.userId ||
		filters.entityType ||
		filters.operationType ||
		filters.search ||
		filters.startDate ||
		filters.endDate
	);

	const CATEGORIES = useMemo(() => [
		{ id: "", label: t.allTypes || "Wszystkie", icon: null },
		{ id: "task", label: t.tasksOnly || "Zadania", icon: ICONS.task },
		{ id: "building", label: t.buildingsOnly || "Budynki", icon: ICONS.building },
		{ id: "user", label: t.usersOnly || "Użytkownicy", icon: ICONS.user },
		{ id: "auth", label: t.authOnly || "Logowania", icon: ICONS.key },
	], [t]);

	if (currentUser?.role !== "admin") {
		return (
			<div
				style={{
					padding: "32px 16px",
					textAlign: "center",
				}}
			>
				<h2
					style={{
						fontSize: "14px",
						fontWeight: font.weight.big,
						color: colors.textHeading,
						marginBottom: "8px",
					}}
				>
					{t.logs}
				</h2>
				<p
					style={{
						fontSize: "12px",
						color: colors.textSecondary,
					}}
				>
					{t.settingsAccessLimited || "Access is limited to administrators."}
				</p>
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "8px 12px",
				maxWidth: "480px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				boxSizing: "border-box",
			}}
		>
			{/* Page Header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "2px 0",
				}}
			>
				<h2
					style={{
						fontSize: "13px",
						fontWeight: font.weight.big,
						color: colors.textHeading,
						margin: 0,
					}}
				>
					{t.logs}
				</h2>
				<span
					style={{
						fontSize: "11px",
						color: colors.textSecondary,
						fontWeight: font.weight.medium,
						background: colors.cardBg,
						padding: "2px 8px",
						borderRadius: radius.full,
						border: `1px solid ${colors.borderSubtle}`,
					}}
				>
					{loading ? t.loading : `${logs.length} ${t.logsCount || ""}`}
				</span>
			</div>

			{/* Quick Category Tabs (Task / Building / User / Auth) */}
			<div
				style={{
					display: "flex",
					gap: "4px",
					overflowX: "auto",
					paddingBottom: "2px",
					scrollbarWidth: "none",
				}}
			>
				{CATEGORIES.map((cat) => {
					const isActive = filters.entityType === cat.id;
					return (
						<button
							key={cat.id}
							type="button"
							onClick={() => handleFilterChange("entityType", cat.id)}
							style={{
								padding: "4px 10px",
								fontSize: "11px",
								fontFamily: font.family.sans,
								fontWeight: isActive ? font.weight.big : font.weight.medium,
								borderRadius: radius.full,
								border: isActive
									? `1px solid ${colors.primary}`
									: `1px solid ${colors.borderDefault}`,
								background: isActive ? colors.primary : colors.cardBg,
								color: isActive ? colors.primaryText : colors.textBody,
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "4px",
								whiteSpace: "nowrap",
								transition: "all 0.15s ease",
								boxShadow: isActive ? shadow.card : "none",
							}}
						>
							{cat.icon}
							<span>{cat.label}</span>
						</button>
					);
				})}
			</div>

			{/* Main Search and Filter Card */}
			<div
				style={{
					background: colors.cardBg,
					border: `1px solid ${colors.borderSubtle}`,
					borderRadius: radius.md,
					padding: "8px 10px",
					boxShadow: shadow.card,
					display: "flex",
					flexDirection: "column",
					gap: "6px",
				}}
			>
				{/* Search Input Bar */}
				<div
					style={{
						position: "relative",
						display: "flex",
						alignItems: "center",
					}}
				>
					<div
						style={{
							position: "absolute",
							left: "8px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
							pointerEvents: "none",
						}}
					>
						{ICONS.search}
					</div>
					<input
						type="text"
						value={filters.search}
						onChange={(e) => handleFilterChange("search", e.target.value)}
						placeholder={t.searchLogs || "Szukaj w akcjach, zadaniach, użytkownikach..."}
						style={{
							...components.input,
							paddingLeft: "28px",
							paddingRight: filters.search ? "26px" : "8px",
							fontSize: "11px",
							paddingTop: "5px",
							paddingBottom: "5px",
							borderRadius: radius.sm,
							background: colors.pageBg,
						}}
					/>
					{filters.search && (
						<button
							type="button"
							onClick={() => handleFilterChange("search", "")}
							style={{
								position: "absolute",
								right: "6px",
								background: "transparent",
								border: "none",
								color: colors.textSecondary,
								cursor: "pointer",
								padding: "2px",
								display: "flex",
								alignItems: "center",
							}}
						>
							{ICONS.close}
						</button>
					)}
				</div>

				{/* Secondary Filters: User & Operation Type */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "6px",
					}}
				>
					<div>
						<select
							style={{
								...components.input,
								width: "100%",
								boxSizing: "border-box",
								fontSize: "11px",
								padding: "4px 6px",
								borderRadius: radius.sm,
								background: colors.pageBg,
							}}
							value={filters.userId}
							onChange={(e) => handleFilterChange("userId", e.target.value)}
						>
							<option value="">{t.allUsers || "Wszyscy użytkownicy"}</option>
							{users.map((user) => (
								<option key={user.id} value={user.id}>
									{user.first_name} {user.last_name} ({user.login})
								</option>
							))}
						</select>
					</div>

					<div>
						<select
							style={{
								...components.input,
								width: "100%",
								boxSizing: "border-box",
								fontSize: "11px",
								padding: "4px 6px",
								borderRadius: radius.sm,
								background: colors.pageBg,
							}}
							value={filters.operationType}
							onChange={(e) => handleFilterChange("operationType", e.target.value)}
						>
							<option value="">{t.allOperations || "Wszystkie operacje"}</option>
							<option value="status_change">{t.op_status_change || "Zmiana statusu"}</option>
							<option value="create">{t.op_create || "Utworzenie"}</option>
							<option value="update">{t.op_update || "Edycja"}</option>
							<option value="delete">{t.op_delete || "Usunięcie"}</option>
							<option value="login_success">{t.op_login_success || "Logowanie"}</option>
							<option value="login_failed">{t.op_login_failed || "Błąd logowania"}</option>
						</select>
					</div>
				</div>

				{/* Optional Date Range Row */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "6px",
					}}
				>
					<div>
						<input
							type="date"
							style={{
								...components.input,
								width: "100%",
								boxSizing: "border-box",
								fontSize: "11px",
								padding: "4px 6px",
								borderRadius: radius.sm,
								background: colors.pageBg,
							}}
							value={filters.startDate}
							onChange={(e) => handleFilterChange("startDate", e.target.value)}
							placeholder={t.startDate || "Data od"}
						/>
					</div>

					<div>
						<input
							type="date"
							style={{
								...components.input,
								width: "100%",
								boxSizing: "border-box",
								fontSize: "11px",
								padding: "4px 6px",
								borderRadius: radius.sm,
								background: colors.pageBg,
							}}
							value={filters.endDate}
							onChange={(e) => handleFilterChange("endDate", e.target.value)}
							placeholder={t.endDate || "Data do"}
						/>
					</div>
				</div>

				{/* Active Filter Bar / Reset */}
				{hasActiveFilters && (
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							paddingTop: "2px",
							borderTop: `1px solid ${colors.borderSubtle}`,
						}}
					>
						<span style={{ fontSize: "10px", color: colors.primary, fontWeight: font.weight.medium }}>
							{t.showingFilteredLogs || "Wyniki filtrowania"}: {logs.length}
						</span>
						<button
							type="button"
							onClick={handleResetFilters}
							style={{
								...components.ghostButton,
								padding: "2px 8px",
								fontSize: "10px",
								borderRadius: radius.sm,
								display: "flex",
								alignItems: "center",
								gap: "3px",
							}}
						>
							{ICONS.close}
							{t.resetFilters || "Resetuj filtry"}
						</button>
					</div>
				)}
			</div>

			{/* Logs Stream */}
			{loading && logs.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "24px 12px",
						color: colors.textSecondary,
						fontSize: "11px",
						background: colors.cardBg,
						borderRadius: radius.md,
						border: `1px dashed ${colors.borderDefault}`,
					}}
				>
					{t.loading || "Ładowanie..."}
				</div>
			) : logs.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "24px 12px",
						color: colors.textSecondary,
						fontSize: "11px",
						background: colors.cardBg,
						borderRadius: radius.md,
						border: `1px dashed ${colors.borderDefault}`,
					}}
				>
					{t.noLogs || "Brak logów"}
				</div>
			) : (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "4px",
					}}
				>
					{logs.map((log) => (
						<LogEntry
							key={log.id}
							initialData={log}
							language={language}
							users={users}
							expanded={expandedLogId === log.id}
							onToggle={() => setExpandedLogId((prev) => (prev === log.id ? null : log.id))}
						/>
					))}
				</div>
			)}
		</div>
	);
}
