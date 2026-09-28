import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import {
	colors,
	font,
	radius,
	components,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import LogEntry from "../components/LogEntry";

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
	filter: (
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
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
			<polyline points="9 11 12 14 22 4" />
			<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
			<path d="M21 2l-2 2m-1.5 1.5L14 9a5 5 0 1 0-4 4l9.5-9.5z" />
		</svg>
	),
	x: (
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
};

const ROLE_ORDER = { admin: 1, manager: 2, contractor: 3 };

function compareUsers(a, b) {
	const roleA = ROLE_ORDER[a.role] ?? 99;
	const roleB = ROLE_ORDER[b.role] ?? 99;
	if (roleA !== roleB) {
		return roleA - roleB;
	}
	const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.login || "";
	const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.login || "";
	return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
}

function useActivityLogs(currentUser, filters) {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);

	useEffect(() => {
		if (currentUser?.role !== "admin") return;

		api.getUsers()
			.then((data) => setUsers([...data].sort(compareUsers)))
			.catch((err) => console.error("Failed to fetch users:", err));
	}, [currentUser]);

	useEffect(() => {
		if (currentUser?.role !== "admin") return;

		let isMounted = true;
		const timer = setTimeout(async () => {
			try {
				setLoading(true);
				const data = await api.getActivityLogs({
					userId: filters.userId || undefined,
					entityType: filters.entityType || undefined,
					operationType: filters.operationType || undefined,
					search: filters.search || undefined,
					startDate: filters.startDate || undefined,
					endDate: filters.endDate || undefined,
					limit: 100,
				});
				if (isMounted) {
					setLogs(data);
				}
			} catch (err) {
				console.error("Failed to fetch logs:", err);
			} finally {
				if (isMounted) setLoading(false);
			}
		}, 200);

		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [currentUser, filters]);

	return { logs, loading, users };
}

function LogsHeader({ count, hasFilters, onReset, t }) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "2px 0",
			}}
		>
			<div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
				<h1
					style={{
						fontSize: "15px",
						fontWeight: font.weight.big,
						color: colors.textHeading,
						margin: 0,
					}}
				>
					{t.logs || "Dziennik Aktywności"}
				</h1>
				<span style={{ fontSize: "11px", color: colors.textSecondary }}>
					({count})
				</span>
			</div>
			{hasFilters && (
				<button
					type="button"
					onClick={onReset}
					style={{
						background: "transparent",
						border: "none",
						color: colors.primary,
						fontSize: "12px",
						cursor: "pointer",
						padding: "4px 8px",
						minHeight: "44px",
						minWidth: "44px",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						boxSizing: "border-box",
						gap: "4px",
					}}
				>
					{ICONS.x}
					<span>{t.clearFilters || "Wyczyść filtry"}</span>
				</button>
			)}
		</div>
	);
}

function LogsCategoryBar({
	categories,
	currentCategory,
	onSelectCategory,
	searchQuery,
	onSearchChange,
	showAdvanced,
	onToggleAdvanced,
	t,
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					overflowX: "auto",
					paddingBottom: "4px",
				}}
			>
				{categories.map((cat) => {
					const isSelected = currentCategory === cat.id;
					return (
						<button
							key={cat.id}
							type="button"
							onClick={() => onSelectCategory(cat.id)}
							style={{
								padding: "6px 12px",
								fontSize: "12px",
								minHeight: "44px",
								minWidth: "44px",
								boxSizing: "border-box",
								borderRadius: radius.full,
								border: `1px solid ${isSelected ? colors.primary : colors.borderSubtle}`,
								background: isSelected ? colors.primary : colors.cardBg,
								color: isSelected ? "#ffffff" : colors.textSecondary,
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								cursor: "pointer",
								whiteSpace: "nowrap",
								fontWeight: isSelected ? font.weight.big : font.weight.medium,
							}}
						>
							{cat.icon}
							<span>{cat.label}</span>
						</button>
					);
				})}
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
				<div
					style={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						flex: 1,
					}}
				>
					<span
						style={{
							position: "absolute",
							left: "8px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
						}}
					>
						{ICONS.search}
					</span>
					<input
						type="text"
						placeholder={t.searchLogs || "Szukaj w akcjach..."}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							...components.input,
							paddingLeft: "26px",
							paddingTop: "4px",
							paddingBottom: "4px",
							fontSize: "12px",
							borderRadius: radius.sm,
							width: "100%",
							boxSizing: "border-box",
							height: "44px",
						}}
					/>
				</div>
				<button
					type="button"
					onClick={onToggleAdvanced}
					style={{
						...components.ghostButton,
						padding: "6px 12px",
						fontSize: "12px",
						minHeight: "44px",
						minWidth: "44px",
						boxSizing: "border-box",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "6px",
						borderRadius: radius.sm,
						background: showAdvanced ? `${colors.primary}12` : "transparent",
						color: showAdvanced ? colors.primary : colors.textSecondary,
					}}
				>
					{ICONS.filter}
					<span>{t.filters || "Więcej"}</span>
				</button>
			</div>
		</div>
	);
}

function LogsAdvancedPanel({ filters, onFilterChange, users, t }) {
	return (
		<div
			style={{
				background: colors.cardBg,
				borderRadius: radius.sm,
				padding: "8px 10px",
				border: `1px solid ${colors.borderSubtle}`,
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "6px",
			}}
		>
			<div>
				<label
					htmlFor="logs-filter-user"
					style={{ fontSize: "10px", color: colors.textSecondary, display: "block", marginBottom: "2px" }}
				>
					{t.user || "Użytkownik"}
				</label>
				<select
					id="logs-filter-user"
					value={filters.userId}
					onChange={(e) => onFilterChange("userId", e.target.value)}
					style={{
						...components.input,
						fontSize: "11px",
						padding: "2px 4px",
						height: "24px",
						borderRadius: radius.sm,
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					<option value="">{t.allUsers || "Wszyscy użytkownicy"}</option>
					{users.map((u) => (
						<option key={u.id} value={u.id}>
							{[u.first_name, u.last_name].filter(Boolean).join(" ") || u.login}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="logs-filter-operation"
					style={{ fontSize: "10px", color: colors.textSecondary, display: "block", marginBottom: "2px" }}
				>
					{t.operationType || "Typ operacji"}
				</label>
				<select
					id="logs-filter-operation"
					value={filters.operationType}
					onChange={(e) => onFilterChange("operationType", e.target.value)}
					style={{
						...components.input,
						fontSize: "11px",
						padding: "2px 4px",
						height: "24px",
						borderRadius: radius.sm,
						width: "100%",
						boxSizing: "border-box",
					}}
				>
					<option value="">{t.allOperations || "Wszystkie operacje"}</option>
					<option value="create">{t.op_create || "Utworzenie"}</option>
					<option value="update">{t.op_update || "Edycja"}</option>
					<option value="delete">{t.op_delete || "Usunięcie"}</option>
					<option value="status_change">{t.op_status_change || "Zmiana statusu"}</option>
					<option value="login_success">{t.op_login_success || "Logowanie udane"}</option>
					<option value="login_failed">{t.op_login_failed || "Logowanie nieudane"}</option>
				</select>
			</div>

			<div>
				<label
					htmlFor="logs-filter-start-date"
					style={{ fontSize: "10px", color: colors.textSecondary, display: "block", marginBottom: "2px" }}
				>
					{t.startDate || "Od daty"}
				</label>
				<input
					id="logs-filter-start-date"
					type="date"
					value={filters.startDate}
					onChange={(e) => onFilterChange("startDate", e.target.value)}
					style={{
						...components.input,
						fontSize: "11px",
						padding: "2px 4px",
						height: "24px",
						borderRadius: radius.sm,
						width: "100%",
						boxSizing: "border-box",
					}}
				/>
			</div>

			<div>
				<label
					htmlFor="logs-filter-end-date"
					style={{ fontSize: "10px", color: colors.textSecondary, display: "block", marginBottom: "2px" }}
				>
					{t.endDate || "Do daty"}
				</label>
				<input
					id="logs-filter-end-date"
					type="date"
					value={filters.endDate}
					onChange={(e) => onFilterChange("endDate", e.target.value)}
					style={{
						...components.input,
						fontSize: "11px",
						padding: "2px 4px",
						height: "24px",
						borderRadius: radius.sm,
						width: "100%",
						boxSizing: "border-box",
					}}
				/>
			</div>
		</div>
	);
}

function LogsList({
	logs,
	loading,
	users,
	expandedLogId,
	onToggleLog,
	language,
	t,
}) {
	if (loading) {
		return (
			<div style={{ padding: "32px 0", textAlign: "center", color: colors.textSecondary, fontSize: "12px" }}>
				{t.loading || "Ładowanie..."}
			</div>
		);
	}

	if (logs.length === 0) {
		return (
			<div style={{ padding: "32px 0", textAlign: "center", color: colors.textSecondary, fontSize: "12px" }}>
				{t.noLogs || "Brak wpisów w dzienniku"}
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			{logs.map((log) => (
				<LogEntry
					key={log.id}
					initialData={log}
					language={language}
					users={users}
					expanded={expandedLogId === log.id}
					onToggle={() => onToggleLog(log.id)}
				/>
			))}
		</div>
	);
}

export default function LogsPage({
	language = "pl",
	currentUser,
}) {
	const t = translations[language] || translations.pl;
	const [filters, setFilters] = useState({
		userId: "",
		entityType: "",
		operationType: "",
		search: "",
		startDate: "",
		endDate: "",
	});
	const [expandedLogId, setExpandedLogId] = useState(null);
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

	const { logs, loading, users } = useActivityLogs(currentUser, filters);

	const handleFilterChange = (field, value) => {
		setFilters((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleCategorySelect = (entityType) => {
		if (entityType === "auth") {
			setFilters((prev) => ({
				...prev,
				entityType: "",
				operationType: "login_success",
			}));
		} else {
			setFilters((prev) => ({
				...prev,
				entityType,
				operationType: prev.operationType === "login_success" ? "" : prev.operationType,
			}));
		}
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

	const currentCategory = filters.operationType === "login_success" ? "auth" : filters.entityType;

	if (currentUser?.role !== "admin") {
		return <Navigate to="/" replace />;
	}

	return (
		<div
			style={{
				padding: "12px 16px",
				maxWidth: "840px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				boxSizing: "border-box",
			}}
		>
			<LogsHeader
				count={logs.length}
				hasFilters={hasActiveFilters}
				onReset={handleResetFilters}
				t={t}
			/>

			<LogsCategoryBar
				categories={CATEGORIES}
				currentCategory={currentCategory}
				onSelectCategory={handleCategorySelect}
				searchQuery={filters.search}
				onSearchChange={(search) => handleFilterChange("search", search)}
				showAdvanced={showAdvancedFilters}
				onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
				t={t}
			/>

			{showAdvancedFilters && (
				<LogsAdvancedPanel
					filters={filters}
					onFilterChange={handleFilterChange}
					users={users}
					t={t}
				/>
			)}

			<LogsList
				logs={logs}
				loading={loading}
				users={users}
				expandedLogId={expandedLogId}
				onToggleLog={(id) => setExpandedLogId(expandedLogId === id ? null : id)}
				language={language}
				t={t}
			/>
		</div>
	);
}
