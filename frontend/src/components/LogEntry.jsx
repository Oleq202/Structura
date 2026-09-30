import { useState, useMemo } from "react";
import {
	colors,
	font,
	radius,
	shadow,
	components,
} from "../theme";
import { translations } from "../i18n";
import { Badge } from "./ui";
import { IconChevronDown } from "./icons";

const OPERATION_STATUS = {
	create: "completed",
	update: "pending",
	delete: "danger",
	status_change: "info",
	login_success: "info",
	login_failed: "danger",
};

const OPERATION_COLORS = {
	create: colors.success,
	update: colors.warning,
	delete: colors.danger,
	status_change: colors.info,
	login_success: colors.primary,
	login_failed: colors.danger,
};

const EMPTY_USERS = [];
const EMPTY_BUILDINGS = [];

function buildUsersMap(users) {
	const map = {};
	if (!users) return map;
	for (const u of users) {
		const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.login;
		map[u.id] = name;
		map[String(u.id)] = name;
	}
	return map;
}

function buildBuildingsMap(buildings) {
	const map = {};
	if (!buildings) return map;
	for (const b of buildings) {
		const addr = [b.street_address, b.district, b.city].filter(Boolean).join(", ") || b.street_address;
		map[b.id] = addr;
		map[String(b.id)] = addr;
	}
	return map;
}

function getLogBuildingAddress(log, buildingsMap) {
	return (
		log.building_street_address ||
		log.task?.building?.street_address ||
		buildingsMap[log.changes_json?.building_id?.new] ||
		buildingsMap[log.changes_json?.building?.new] ||
		buildingsMap[log.changes_json?.building_id?.old] ||
		buildingsMap[log.changes_json?.building?.old] ||
		null
	);
}

function Avatar({ first_name, last_name, login }) {
	const initials =
		[first_name, last_name]
			.filter(Boolean)
			.map((name) => name[0].toUpperCase())
			.join("") ||
		(login ? login.substring(0, 2).toUpperCase() : "?");
	return (
		<div
			style={{
				...components.avatar,
				width: "18px",
				height: "18px",
				fontSize: "9px",
				flexShrink: 0,
			}}
		>
			{initials}
		</div>
	);
}

function UserPerson({ user, log, t }) {
	const targetUser = user || (log.user_login ? {
		first_name: log.user_first_name,
		last_name: log.user_last_name,
		login: log.user_login,
	} : null);

	if (!targetUser) {
		return null;
	}

	const displayName = [targetUser.first_name, targetUser.last_name].filter(Boolean).join(" ") || targetUser.login || t.unknown;

	return (
		<div
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				fontSize: "11px",
				color: colors.textSecondary,
				fontWeight: font.weight.medium,
				flexShrink: 0,
			}}
		>
			<span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
				{displayName}
			</span>
			<Avatar
				first_name={targetUser.first_name}
				last_name={targetUser.last_name}
				login={targetUser.login}
			/>
		</div>
	);
}

function formatTimestamp(iso, language) {
	if (!iso) return "";
	const locale = language === "pl" ? "pl-PL" : "en-US";
	return new Date(iso).toLocaleString(locale, {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatLogAction(log, t, language, buildingsMap, _usersMap) {
	const action = log.action || "";
	const isPl = language === "pl";

	if (log.operation_type === "login_success") {
		const match = action.match(/User '([^']+)' successfully logged in/i);
		if (match) {
			return isPl ? `Użytkownik '${match[1]}' zalogował się pomyślnie` : `User '${match[1]}' logged in successfully`;
		}
		return isPl ? "Zalogowano pomyślnie" : "Logged in successfully";
	}

	if (log.operation_type === "login_failed") {
		const match = action.match(/Failed login attempt for '([^']+)'/i);
		if (match) {
			return isPl ? `Nieudana próba logowania dla '${match[1]}'` : `Failed login attempt for '${match[1]}'`;
		}
		return isPl ? "Nieudane logowanie" : "Failed login";
	}

	const userCreateMatch = action.match(/Created user '([^']+)'(?: \(([^)]+)\))?(?: with role '([^']+)')?/i);
	if (userCreateMatch) {
		const [, username, name, role] = userCreateMatch;
		const displayName = name ? `${name} (@${username})` : `'${username}'`;
		const roleName = role ? (t[role] || role) : "";
		return isPl
			? `Utworzono użytkownika ${displayName}${roleName ? ` z rolą ${roleName}` : ""}`
			: `Created user ${displayName}${roleName ? ` with role ${roleName}` : ""}`;
	}

	const userUpdateMatch = action.match(/Updated user '([^']+)'(?: \(([^)]+)\))?/i);
	if (userUpdateMatch) {
		const [, username, name] = userUpdateMatch;
		const displayName = name ? `${name} (@${username})` : `'${username}'`;
		return isPl ? `Zaktualizowano użytkownika ${displayName}` : `Updated user ${displayName}`;
	}

	const userDeleteMatch = action.match(/Deleted user '([^']+)'(?: \(([^)]+)\))?/i);
	if (userDeleteMatch) {
		const [, username, name] = userDeleteMatch;
		const displayName = name ? `${name} (@${username})` : `'${username}'`;
		return isPl ? `Usunięto użytkownika ${displayName}` : `Deleted user ${displayName}`;
	}

	const bCreateMatch = action.match(/Created building at ([^,]+),\s*(.+)/i);
	if (bCreateMatch) {
		return isPl ? `Utworzono budynek: ${bCreateMatch[1]}, ${bCreateMatch[2]}` : `Created building: ${bCreateMatch[1]}, ${bCreateMatch[2]}`;
	}

	// Updated building at {addr} (#{id}) or Updated building #{id} ({addr})
	const bUpdateAtMatch = action.match(/Updated building at (.+?)(?:\s*\(#\d+\))?$/i);
	if (bUpdateAtMatch) {
		return isPl ? `Zaktualizowano budynek: ${bUpdateAtMatch[1]}` : `Updated building: ${bUpdateAtMatch[1]}`;
	}
	const bUpdateMatch = action.match(/Updated building #(\d+)(?: \(([^)]+)\))?/i);
	if (bUpdateMatch) {
		const addr = bUpdateMatch[2] || buildingsMap?.[bUpdateMatch[1]] || `#${bUpdateMatch[1]}`;
		return isPl ? `Zaktualizowano budynek: ${addr}` : `Updated building: ${addr}`;
	}

	// Deleted building at {addr} (#{id}) or Deleted building #{id} ({addr}) or Deleted building #{id}
	const bDeleteAtMatch = action.match(/Deleted building at (.+?)(?:\s*\(#\d+\))?$/i);
	if (bDeleteAtMatch) {
		return isPl ? `Usunięto budynek: ${bDeleteAtMatch[1]}` : `Deleted building: ${bDeleteAtMatch[1]}`;
	}
	const bDeleteWithAddrMatch = action.match(/Deleted building #(\d+)\s*\(([^)]+)\)/i);
	if (bDeleteWithAddrMatch) {
		return isPl ? `Usunięto budynek: ${bDeleteWithAddrMatch[2]}` : `Deleted building: ${bDeleteWithAddrMatch[2]}`;
	}
	const bDeleteMatch = action.match(/Deleted building #(\d+)/i);
	if (bDeleteMatch) {
		const addr = buildingsMap?.[bDeleteMatch[1]] || log.changes_json?.address?.old;
		if (addr) {
			return isPl ? `Usunięto budynek: ${addr}` : `Deleted building: ${addr}`;
		}
		return isPl ? `Usunięto budynek #${bDeleteMatch[1]}` : `Deleted building #${bDeleteMatch[1]}`;
	}

	if (log.operation_type === "status_change") {
		const taskName = log.task_title || log.task?.title;
		const taskPrefix = taskName ? `"${taskName}": ` : "";
		if (log.changes_json?.status?.new === "completed" || action.includes("completed")) {
			return isPl ? `${taskPrefix}Ukończono zadanie` : `${taskPrefix}Marked task as completed`;
		}
		if (log.changes_json?.status?.new === "pending" || action.includes("pending")) {
			return isPl ? `${taskPrefix}Przywrócono zadanie do oczekujących` : `${taskPrefix}Reverted task to pending`;
		}
		return t.changedStatus || action;
	}

	if (log.operation_type === "create" && log.entity_type === "task") {
		const taskName = log.task_title || log.changes_json?.title?.new || log.task?.title;
		if (taskName) {
			return isPl
				? `Utworzono zadanie: "${taskName}"`
				: `Created task: "${taskName}"`;
		}
		return t.createdTask || action;
	}

	if (log.operation_type === "delete" && log.entity_type === "task") {
		const taskName = log.task_title || log.changes_json?.title?.old || log.task?.title;
		if (taskName) {
			return isPl
				? `Usunięto zadanie: "${taskName}"`
				: `Deleted task: "${taskName}"`;
		}
		return t.deletedTask || action;
	}

	if (log.operation_type === "update" && log.entity_type === "task") {
		const taskName = log.task_title || log.task?.title;
		return taskName ? (isPl ? `Zaktualizowano zadanie: "${taskName}"` : `Updated task: "${taskName}"`) : (t.updatedTask || action);
	}

	return action;
}

function getLogTitle(log, t, buildingsMap, usersMap) {
	if (log.operation_type === "login_success") {
		return t.loginSuccess || "Logged in successfully";
	}
	if (log.operation_type === "login_failed") {
		return t.loginFailed || "Failed login";
	}
	if (log.entity_type === "user") {
		const userName =
			log.changes_json?.name?.new ||
			log.changes_json?.name?.old ||
			log.user_login ||
			(usersMap && (usersMap[log.entity_id] || usersMap[String(log.entity_id)]));
		if (userName) return userName;
		if (log.operation_type === "create") return t.createdUser || "Created user";
		if (log.operation_type === "delete") return t.deletedUser || "Deleted user";
		return t.updatedUser || "Updated user";
	}
	if (log.entity_type === "building") {
		const buildingName =
			log.changes_json?.address?.new ||
			log.changes_json?.address?.old ||
			log.building_street_address ||
			(buildingsMap && (buildingsMap[log.entity_id] || buildingsMap[String(log.entity_id)]));
		if (buildingName) return buildingName;
		if (log.operation_type === "create") return t.createdBuilding || "Created building";
		if (log.operation_type === "delete") return t.deletedBuilding || "Deleted building";
		return t.updatedBuilding || "Updated building";
	}
	if (log.entity_type === "task") {
		if (log.operation_type === "create") return log.changes_json?.title?.new || log.task_title || log.task?.title || t.createdTask;
		if (log.operation_type === "delete") return log.changes_json?.title?.old || log.task_title || log.task?.title || t.deletedTask;
		return log.task_title || log.task?.title || t.tasks;
	}
	return log.task_title || t.activityLog || "Log";
}

function translateFieldName(field, t) {
	const map = {
		title: t.title || "Tytuł",
		description: t.description || "Opis",
		status: t.status || "Status",
		assigned_to: t.assignedTo || t.contractor || "Wykonawca",
		contractor_id: t.contractor || "Wykonawca",
		contractor: t.contractor || "Wykonawca",
		building_id: t.building || "Budynek",
		building: t.building || "Budynek",
		user_id: t.user || "Użytkownik",
		user: t.user || "Użytkownik",
		created_by: t.createdBy || "Utworzone przez",
		name: t.name || "Imię i nazwisko",
		login: t.login || "Login",
		role: t.role || "Rola",
		city: t.city || "Miasto",
		district: t.district || "Dzielnica",
		street_address: t.streetAddress || "Adres",
		address: t.streetAddress || "Adres",
		first_name: t.firstName || "Imię",
		last_name: t.lastName || "Nazwisko",
	};
	return map[field] || field;
}

function formatFieldValue(field, val, t, usersMap, buildingsMap) {
	if (val === null || val === undefined || val === "") {
		return null;
	}
	if (typeof val === "object") {
		return null;
	}
	if (field === "status") {
		return val === "completed" ? (t.completed || "Ukończone") : val === "pending" ? (t.pending || "Oczekujące") : String(val);
	}
	if (field === "role") {
		return t[val] || String(val);
	}
	if (
		field === "assigned_to" ||
		field === "contractor" ||
		field === "contractor_id" ||
		field === "user_id" ||
		field === "created_by"
	) {
		if (usersMap && (usersMap[val] || usersMap[String(val)])) {
			return usersMap[val] || usersMap[String(val)];
		}
	}
	if (field === "building" || field === "building_id") {
		if (buildingsMap && (buildingsMap[val] || buildingsMap[String(val)])) {
			return buildingsMap[val] || buildingsMap[String(val)];
		}
	}
	return String(val);
}

function renderChanges(changes, t, usersMap, buildingsMap) {
	if (!changes || typeof changes !== "object") return null;
	const entries = Object.entries(changes);
	if (entries.length === 0) return null;

	const renderedItems = entries
		.map(([field, change]) => {
			const isObj = change && typeof change === "object";
			const hasOld = Boolean(isObj && Object.prototype.hasOwnProperty.call(change, "old"));
			const hasNew = Boolean(isObj && Object.prototype.hasOwnProperty.call(change, "new"));

			const rawOld = hasOld ? change.old : null;
			const rawNew = hasNew ? change.new : (!isObj ? change : null);

			const oldVal = (hasOld && rawOld !== null && rawOld !== undefined && rawOld !== "")
				? formatFieldValue(field, rawOld, t, usersMap, buildingsMap)
				: null;
			const newVal = (rawNew !== null && rawNew !== undefined && rawNew !== "")
				? formatFieldValue(field, rawNew, t, usersMap, buildingsMap)
				: null;

			if (!oldVal && !newVal) return null;

			return (
				<div
					key={field}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						fontSize: "11px",
						lineHeight: 1.3,
						flexWrap: "wrap",
					}}
				>
					<span
						style={{
							fontWeight: font.weight.medium,
							color: colors.textHeading,
							minWidth: "70px",
						}}
					>
						{translateFieldName(field, t)}:
					</span>

					{/* Case 1: Update (both old and new values exist) */}
					{hasOld && hasNew && (
						<>
							{oldVal && (
								<span
									style={{
										color: colors.danger,
										textDecoration: "line-through",
										opacity: 0.85,
									}}
								>
									{oldVal}
								</span>
							)}
							{oldVal && newVal && (
								<span style={{ color: colors.textSecondary, fontSize: "10px" }}>→</span>
							)}
							{newVal && (
								<span
									style={{
										color: colors.success,
										fontWeight: font.weight.medium,
									}}
								>
									{newVal}
								</span>
							)}
						</>
					)}

					{/* Case 2: Only old value (deleted entity or removed attribute) */}
					{hasOld && !hasNew && oldVal && (
						<span
							style={{
								color: colors.textPrimary,
								opacity: 0.9,
							}}
						>
							{oldVal}
						</span>
					)}

					{/* Case 3: Only new value (created entity or new attribute) */}
					{!hasOld && newVal && (
						<span
							style={{
								color: colors.success,
								fontWeight: font.weight.medium,
							}}
						>
							{newVal}
						</span>
					)}
				</div>
			);
		})
		.filter(Boolean);

	if (renderedItems.length === 0) return null;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "4px",
			}}
		>
			<div
				style={{
					fontSize: "10px",
					fontWeight: font.weight.big,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
				}}
			>
				{t.changes || "Changes"}
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "3px",
					background: colors.cardBg,
					padding: "5px 8px",
					borderRadius: radius.sm,
					border: `1px solid ${colors.borderSubtle}`,
				}}
			>
				{renderedItems}
			</div>
		</div>
	);
}

export default function LogEntry({
	initialData,
	language = "pl",
	users = EMPTY_USERS,
	buildings = EMPTY_BUILDINGS,
	expanded = false,
	onToggle,
}) {
	const t = translations[language] || translations.pl;
	const log = initialData;
	const [hovered, setHovered] = useState(false);

	const usersMap = useMemo(() => buildUsersMap(users), [users]);
	const buildingsMap = useMemo(() => buildBuildingsMap(buildings), [buildings]);

	const user = users.find((u) => u.id === log.user_id) || log.user;
	const badgeStatus = OPERATION_STATUS[log.operation_type] || "info";
	const operationColor = OPERATION_COLORS[log.operation_type] || colors.textSecondary;

	const taskTitle = getLogTitle(log, t, buildingsMap, usersMap);
	const actionText = formatLogAction(log, t, language, buildingsMap, usersMap);
	const badgeLabel = t["op_" + log.operation_type] || log.operation_type;

	const buildingAddress = useMemo(() => getLogBuildingAddress(log, buildingsMap), [log, buildingsMap]);

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onToggle}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle?.(e);
				}
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				width: "100%",
				background: colors.cardBg,
				borderRadius: radius.md,
				border: `1px solid ${hovered ? colors.primaryHover : colors.cardBorder}`,
				boxShadow: hovered ? shadow.cardHover : shadow.sm,
				overflow: "hidden",
				padding: 0,
				boxSizing: "border-box",
				cursor: "pointer",
				transition: "border-color 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<div
				style={{
					padding: "8px 12px",
					borderLeft: `4px solid ${operationColor}`,
					display: "flex",
					flexDirection: "column",
					gap: "4px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "8px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							minWidth: 0,
							flex: 1,
						}}
					>
						<span
							style={{
								fontSize: font.size.sm,
								fontWeight: font.weight.semibold,
								color: colors.textHeading,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{taskTitle}
						</span>
						<Badge
							status={badgeStatus}
							dot={true}
							style={{ fontSize: "11px", padding: "1px 6px" }}
						>
							{badgeLabel}
						</Badge>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							flexShrink: 0,
						}}
					>
						<span
							style={{
								fontSize: font.size.xs,
								color: colors.textSecondary,
								whiteSpace: "nowrap",
							}}
						>
							{formatTimestamp(log.timestamp, language)}
						</span>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.2s ease",
								color: colors.textSecondary,
							}}
						>
							<IconChevronDown size="xs" />
						</span>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "8px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "6px",
							minWidth: 0,
							flex: 1,
						}}
					>
						<span
							style={{
								fontSize: "11px",
								color: colors.textBody,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{actionText}
						</span>
						{buildingAddress && (
							<span
								style={{
									fontSize: "9px",
									color: colors.textSecondary,
									background: colors.pageBg,
									padding: "1px 4px",
									borderRadius: radius.sm,
									border: `0.5px solid ${colors.borderSubtle}`,
									flexShrink: 0,
									whiteSpace: "nowrap",
								}}
							>
								{buildingAddress}
							</span>
						)}
					</div>

					<UserPerson user={user} log={log} t={t} />
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateRows: expanded ? "1fr" : "0fr",
					transition: "grid-template-rows 0.25s ease",
				}}
			>
				<div style={{ overflow: "hidden" }}>
					<div
						style={{
							borderTop: `1px solid ${colors.borderSubtle}`,
							padding: "6px 10px 8px 10px",
							background: colors.pageBg,
							display: "flex",
							flexDirection: "column",
							gap: "4px",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{renderChanges(log.changes_json, t, usersMap, buildingsMap) || (
							<div style={{ fontSize: "11px", color: colors.textSecondary, fontStyle: "italic" }}>
								{t.noDetails || "Brak szczegółów zmian"}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
