import { useState } from "react";
import {
	colors,
	font,
	radius,
	shadow,
	components,
	badgeStyle,
} from "../theme";
import { translations } from "../i18n";

const OPERATION_BADGE = {
	create: "new",
	update: "warning",
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

function formatLogAction(log, t, language) {
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

	const userCreateMatch = action.match(/Created user '([^']+)'(?: with role '([^']+)')?/i);
	if (userCreateMatch) {
		const [, username, role] = userCreateMatch;
		const roleName = role ? (t[role] || role) : "";
		return isPl
			? `Utworzono użytkownika '${username}'${roleName ? ` z rolą ${roleName}` : ""}`
			: `Created user '${username}'${roleName ? ` with role ${roleName}` : ""}`;
	}

	const userUpdateMatch = action.match(/Updated user '([^']+)'/i);
	if (userUpdateMatch) {
		return isPl ? `Zaktualizowano użytkownika '${userUpdateMatch[1]}'` : `Updated user '${userUpdateMatch[1]}'`;
	}

	const userDeleteMatch = action.match(/Deleted user '([^']+)'/i);
	if (userDeleteMatch) {
		return isPl ? `Usunięto użytkownika '${userDeleteMatch[1]}'` : `Deleted user '${userDeleteMatch[1]}'`;
	}

	const bCreateMatch = action.match(/Created building at ([^,]+),\s*(.+)/i);
	if (bCreateMatch) {
		return isPl ? `Utworzono budynek przy ${bCreateMatch[1]}, ${bCreateMatch[2]}` : `Created building at ${bCreateMatch[1]}, ${bCreateMatch[2]}`;
	}

	const bUpdateMatch = action.match(/Updated building #(\d+)(?: \(([^)]+)\))?/i);
	if (bUpdateMatch) {
		return isPl ? `Zaktualizowano budynek #${bUpdateMatch[1]}${bUpdateMatch[2] ? ` (${bUpdateMatch[2]})` : ""}` : `Updated building #${bUpdateMatch[1]}${bUpdateMatch[2] ? ` (${bUpdateMatch[2]})` : ""}`;
	}

	const bDeleteMatch = action.match(/Deleted building #(\d+)/i);
	if (bDeleteMatch) {
		return isPl ? `Usunięto budynek #${bDeleteMatch[1]}` : `Deleted building #${bDeleteMatch[1]}`;
	}

	if (log.operation_type === "status_change") {
		if (log.changes_json?.status?.new === "completed" || action.includes("completed")) {
			return t.changedToCompleted || "Changed task to completed";
		}
		if (log.changes_json?.status?.new === "pending" || action.includes("pending")) {
			return t.revertedToPending || "Reverted task to pending";
		}
		return t.changedStatus || action;
	}

	if (log.operation_type === "create" && log.entity_type === "task") {
		const taskName = log.task_title || log.changes_json?.title?.new || log.task?.title;
		return taskName ? (isPl ? `Utworzono zadanie: "${taskName}"` : `Created task: "${taskName}"`) : (t.createdTask || action);
	}

	if (log.operation_type === "delete" && log.entity_type === "task") {
		const taskName = log.task_title || log.changes_json?.title?.old || log.task?.title;
		return taskName ? (isPl ? `Usunięto zadanie: "${taskName}"` : `Deleted task: "${taskName}"`) : (t.deletedTask || action);
	}

	if (log.operation_type === "update" && log.entity_type === "task") {
		const taskName = log.task_title || log.task?.title;
		return taskName ? (isPl ? `Zaktualizowano zadanie: "${taskName}"` : `Updated task: "${taskName}"`) : (t.updatedTask || action);
	}

	return action;
}

function getLogTitle(log, t) {
	if (log.operation_type === "login_success") {
		return t.loginSuccess || "Logged in successfully";
	}
	if (log.operation_type === "login_failed") {
		return t.loginFailed || "Failed login";
	}
	if (log.entity_type === "user") {
		if (log.operation_type === "create") return t.createdUser || "Created user";
		if (log.operation_type === "delete") return t.deletedUser || "Deleted user";
		return t.updatedUser || "Updated user";
	}
	if (log.entity_type === "building") {
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
		title: t.title || "Title",
		description: t.description || "Description",
		status: t.status || "Status",
		contractor_id: t.contractor || "Contractor",
		contractor: t.contractor || "Contractor",
		building_id: t.building || "Building",
		building: t.building || "Building",
		login: t.login || "Login",
		role: t.role || "Role",
		city: t.city || "City",
		district: t.district || "District",
		street_address: t.streetAddress || "Street address",
		address: t.streetAddress || "Street address",
		first_name: t.firstName || "First name",
		last_name: t.lastName || "Last name",
	};
	return map[field] || field;
}

function formatFieldValue(field, val, t) {
	if (val === null || val === undefined || val === "") {
		return "—";
	}
	if (field === "status") {
		return val === "completed" ? t.completed : val === "pending" ? t.pending : String(val);
	}
	if (field === "role") {
		return t[val] || String(val);
	}
	return String(val);
}

function renderChanges(changes, t) {
	if (!changes || typeof changes !== "object") return null;
	const entries = Object.entries(changes);
	if (entries.length === 0) return null;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "4px",
				marginTop: "4px",
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
				{entries.map(([field, change]) => {
					const hasOld = change && Object.prototype.hasOwnProperty.call(change, "old");
					const hasNew = change && Object.prototype.hasOwnProperty.call(change, "new");
					const oldVal = hasOld ? formatFieldValue(field, change.old, t) : null;
					const newVal = hasNew ? formatFieldValue(field, change.new, t) : formatFieldValue(field, change, t);

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
							{hasOld && oldVal !== null && (
								<>
									<span
										style={{
											color: colors.danger,
											textDecoration: "line-through",
											opacity: 0.85,
										}}
									>
										{oldVal}
									</span>
									<span style={{ color: colors.textSecondary, fontSize: "10px" }}>→</span>
								</>
							)}
							<span
								style={{
									color: colors.success,
									fontWeight: font.weight.medium,
								}}
							>
								{newVal}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function LogEntry({
	initialData,
	language = "pl",
	users = [],
	expanded = false,
	onToggle,
}) {
	const t = translations[language];
	const log = initialData;
	const [hovered, setHovered] = useState(false);

	const user = users.find((u) => u.id === log.user_id) || log.user;
	const badgeKey = OPERATION_BADGE[log.operation_type] ?? "info";
	const badge = badgeStyle(badgeKey);
	const operationColor = OPERATION_COLORS[log.operation_type] || colors.textSecondary;

	const taskTitle = getLogTitle(log, t);
	const actionText = formatLogAction(log, t, language);
	const badgeLabel = t["op_" + log.operation_type] || log.operation_type;

	const buildingAddress = log.building_street_address || log.task?.building?.street_address || null;

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
				borderRadius: radius.sm,
				border: `1px solid ${hovered ? colors.primarySubtle : colors.borderSubtle}`,
				boxShadow: hovered ? shadow.cardHover : shadow.card,
				overflow: "hidden",
				padding: 0,
				boxSizing: "border-box",
				cursor: "pointer",
				transition: "border-color 0.15s ease, box-shadow 0.15s ease",
			}}
		>
			<div
				style={{
					padding: "6px 10px",
					borderLeft: `3px solid ${operationColor}`,
					display: "flex",
					flexDirection: "column",
					gap: "3px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "6px",
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
								fontSize: "12px",
								fontWeight: font.weight.big,
								color: colors.textHeading,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{taskTitle}
						</span>
						<span
							style={{
								...badge,
								padding: "1px 5px",
								fontSize: "9px",
								flexShrink: 0,
								lineHeight: 1.2,
							}}
						>
							{badgeLabel}
						</span>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "4px",
							flexShrink: 0,
						}}
					>
						<span
							style={{
								fontSize: "10px",
								color: colors.textSecondary,
								whiteSpace: "nowrap",
							}}
						>
							{formatTimestamp(log.timestamp, language)}
						</span>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke={colors.textSecondary}
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.25s ease",
							}}
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
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
						<div
							style={{
								fontSize: "11px",
								color: colors.textHeading,
								lineHeight: 1.4,
								wordBreak: "break-word",
							}}
						>
							{actionText}
						</div>
						{renderChanges(log.changes_json, t)}
					</div>
				</div>
			</div>
		</div>
	);
}
