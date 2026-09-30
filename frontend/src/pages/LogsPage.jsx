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
import DateRangePicker from "../components/DateRangePicker";

import {
	IconSearch,
	IconFilter,
	IconTasks,
	IconBuilding,
	IconUser,
	IconKey,
	IconClose,
} from "../components/icons";

const EMPTY_USERS = [];
const EMPTY_BUILDINGS = [];

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
	const [buildings, setBuildings] = useState([]);

	useEffect(() => {
		if (currentUser?.role !== "admin") return;

		api.getUsers()
			.then((data) => setUsers([...data].sort(compareUsers)))
			.catch((err) => console.error("Failed to fetch users:", err));

		api.getBuildings()
			.then((data) => setBuildings(data))
			.catch((err) => console.error("Failed to fetch buildings:", err));
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

	return { logs, loading, users, buildings };
}

function LogsCategoryBar({
	categories,
	currentCategory,
	onSelectCategory,
	searchQuery,
	onSearchChange,
	startDate,
	endDate,
	onDateRangeChange,
	showAdvanced,
	onToggleAdvanced,
	hasFilters,
	onReset,
	language,
	t,
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					overflowX: "auto",
					paddingBottom: "4px",
					scrollbarWidth: "none",
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
								padding: "8px 16px",
								fontSize: "13px",
								minHeight: "40px",
								boxSizing: "border-box",
								borderRadius: radius.full,
								border: `1.5px solid ${isSelected ? colors.primary : colors.borderSubtle}`,
								background: isSelected ? colors.primary : colors.cardBg,
								color: isSelected ? "#ffffff" : colors.textSecondary,
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px",
								cursor: "pointer",
								whiteSpace: "nowrap",
								fontWeight: isSelected ? font.weight.big : font.weight.medium,
								transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease",
							}}
							onMouseDown={(e) => {
								e.currentTarget.style.transform = "scale(0.96)";
							}}
							onMouseUp={(e) => {
								e.currentTarget.style.transform = "scale(1)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "scale(1)";
							}}
						>
							{cat.icon}
							<span>{cat.label}</span>
						</button>
					);
				})}
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
				<div
					style={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						flex: 1,
						minWidth: "180px",
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
						<IconSearch size="xs" />
					</span>
					<input
						type="text"
						placeholder={t.searchLogs || "Szukaj w akcjach..."}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							...components.input,
							paddingLeft: "30px",
							fontSize: "13px",
							borderRadius: radius.md,
							width: "100%",
							boxSizing: "border-box",
							height: "42px",
						}}
					/>
				</div>

				<DateRangePicker
					startDate={startDate}
					endDate={endDate}
					onChange={onDateRangeChange}
					language={language}
					height="42px"
				/>

				{hasFilters && (
					<button
						type="button"
						onClick={onReset}
						style={{
							...components.ghostButton,
							padding: "6px 12px",
							fontSize: "12px",
							minHeight: "42px",
							boxSizing: "border-box",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "4px",
							borderRadius: radius.md,
							color: colors.primary,
							border: `1px solid ${colors.borderSubtle}`,
							cursor: "pointer",
							whiteSpace: "nowrap",
						}}
					>
						<IconClose size="xs" />
						<span>{t.clearFilters || "Wyczyść"}</span>
					</button>
				)}
				<button
					type="button"
					onClick={onToggleAdvanced}
					style={{
						...components.ghostButton,
						padding: "6px 12px",
						fontSize: "12px",
						minHeight: "42px",
						minWidth: "44px",
						boxSizing: "border-box",
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "6px",
						borderRadius: radius.md,
						background: showAdvanced ? `${colors.primary}12` : "transparent",
						color: showAdvanced ? colors.primary : colors.textSecondary,
						border: `1px solid ${showAdvanced ? colors.primary : colors.borderSubtle}`,
						transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease",
					}}
					onMouseDown={(e) => {
						e.currentTarget.style.transform = "scale(0.95)";
					}}
					onMouseUp={(e) => {
						e.currentTarget.style.transform = "scale(1)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.transform = "scale(1)";
					}}
				>
					<span
						style={{
							display: "inline-flex",
							alignItems: "center",
							transform: showAdvanced ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s ease",
						}}
					>
						<IconFilter size="xs" />
					</span>
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
				borderRadius: radius.md,
				padding: "10px 12px",
				border: `1px solid ${colors.borderSubtle}`,
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "10px",
			}}
		>
			<div>
				<label
					htmlFor="logs-filter-user"
					style={{ fontSize: "11px", fontWeight: font.weight.medium, color: colors.textSecondary, display: "block", marginBottom: "4px" }}
				>
					{t.user || "Użytkownik"}
				</label>
				<select
					id="logs-filter-user"
					value={filters.userId}
					onChange={(e) => onFilterChange("userId", e.target.value)}
					style={{
						...components.input,
						fontSize: "12px",
						padding: "4px 8px",
						height: "34px",
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
					style={{ fontSize: "11px", fontWeight: font.weight.medium, color: colors.textSecondary, display: "block", marginBottom: "4px" }}
				>
					{t.operationType || "Typ operacji"}
				</label>
				<select
					id="logs-filter-operation"
					value={filters.operationType}
					onChange={(e) => onFilterChange("operationType", e.target.value)}
					style={{
						...components.input,
						fontSize: "12px",
						padding: "4px 8px",
						height: "34px",
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
		</div>
	);
}

function LogsList({
	logs,
	loading,
	users = EMPTY_USERS,
	buildings = EMPTY_BUILDINGS,
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
					buildings={buildings}
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

	const { logs, loading, users, buildings } = useActivityLogs(currentUser, filters);

	const handleFilterChange = (field, value) => {
		if (typeof field === "object") {
			setFilters((prev) => ({
				...prev,
				...field,
			}));
		} else {
			setFilters((prev) => ({
				...prev,
				[field]: value,
			}));
		}
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
		{ id: "task", label: t.tasksOnly || "Zadania", icon: <IconTasks size="xs" /> },
		{ id: "building", label: t.buildingsOnly || "Budynki", icon: <IconBuilding size="xs" /> },
		{ id: "user", label: t.usersOnly || "Użytkownicy", icon: <IconUser size="xs" /> },
		{ id: "auth", label: t.authOnly || "Logowania", icon: <IconKey size="xs" /> },
	], [t]);

	const currentCategory = filters.operationType === "login_success" ? "auth" : filters.entityType;

	if (currentUser?.role !== "admin") {
		return <Navigate to="/" replace />;
	}

	return (
		<div
			style={{
				padding: "16px 16px",
				maxWidth: "1200px",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				gap: "12px",
				boxSizing: "border-box",
			}}
		>
			<LogsCategoryBar
				categories={CATEGORIES}
				currentCategory={currentCategory}
				onSelectCategory={handleCategorySelect}
				searchQuery={filters.search}
				onSearchChange={(search) => handleFilterChange("search", search)}
				startDate={filters.startDate}
				endDate={filters.endDate}
				onDateRangeChange={(startDate, endDate) => handleFilterChange({ startDate, endDate })}
				showAdvanced={showAdvancedFilters}
				onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
				hasFilters={hasActiveFilters}
				onReset={handleResetFilters}
				language={language}
				t={t}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateRows: showAdvancedFilters ? "1fr" : "0fr",
					transition: "grid-template-rows 0.25s ease",
				}}
			>
				<div style={{ overflow: "hidden" }}>
					<LogsAdvancedPanel
						filters={filters}
						onFilterChange={handleFilterChange}
						users={users}
						t={t}
					/>
				</div>
			</div>

			<LogsList
				logs={logs}
				loading={loading}
				users={users}
				buildings={buildings}
				expandedLogId={expandedLogId}
				onToggleLog={(id) => setExpandedLogId(expandedLogId === id ? null : id)}
				language={language}
				t={t}
			/>
		</div>
	);
}
