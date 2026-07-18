import { useState } from "react";
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

const OPERATION_BADGE = {
	create: "new",
	update: "warning",
	delete: "danger",
	status_change: "info",
};

const OPERATION_COLORS = {
	create: colors.success,
	update: colors.warning,
	delete: colors.danger,
	status_change: colors.info,
};

const logCardStyle = {
	width: "100%",
	maxWidth: "420px",
	background: colors.cardBg,
	borderRadius: radius.xl,
	border: `0.5px solid ${colors.cardBorder}`,
	boxShadow: shadow.modal,
	overflow: "hidden",
	cursor: "pointer",
	padding: 0,
};

function Avatar({ first_name, last_name }) {
	const initials =
		[first_name, last_name]
			.filter(Boolean)
			.map((name) => name[0].toUpperCase())
			.join("") || "?";
	return (
		<div style={components.avatar}>
			{initials}
		</div>
	);
}

function UserCell({ user, t }) {
	if (!user) {
		return (
			<span
				style={{
					color: colors.textMuted,
					fontStyle: "italic",
				}}
			>
				{t.unknown || "Unknown"}
			</span>
		);
	}
	const fullName = [
		user.first_name,
		user.last_name,
	]
		.filter(Boolean)
		.join(" ");
	return (
		<>
			<span>{fullName}</span>
			<Avatar
				first_name={user.first_name}
				last_name={user.last_name}
			/>
		</>
	);
}

function MetaRow({ label, children }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<span style={components.sectionLabel}>
				{label}
			</span>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: spacing[2],
					fontSize: font.size.sm,
					color: colors.textBody,
					fontWeight:
						font.weight.medium,
				}}
			>
				{children}
			</div>
		</div>
	);
}

function formatTimestamp(iso, language) {
	if (!iso) return "";
	const locale =
		language === "pl" ? "pl-PL" : "en-US";
	return new Date(iso).toLocaleString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getActionText(operation_type, action, changes_json, t) {
	if (operation_type === "status_change") {
		if (changes_json?.status?.new === "completed") {
			return t.changedToCompleted || "Changed task to completed";
		}
		if (changes_json?.status?.new === "pending") {
			return t.revertedToPending || "Reverted task to pending";
		}
		return action;
	}
	if (operation_type === "create") {
		return t.createdTask || "Created task";
	}
	if (operation_type === "delete") {
		return t.deletedTask || "Deleted task";
	}
	if (operation_type === "update") {
		return t.changedDetails || "Changed task details";
	}
	return action;
}

function renderChanges(changes_json, t) {
	if (!changes_json || Object.keys(changes_json).length === 0) {
		return null;
	}

	return (
		<div
			style={{
				marginTop: spacing[4],
				padding: spacing[4],
				background: colors.pageBg,
				borderRadius: radius.lg,
			}}
		>
			<h4
				style={{
					fontSize: font.size.sm,
					fontWeight:
						font.weight.medium,
					color: colors.textHeading,
					margin: `0 0 ${spacing[3]} 0`,
				}}
			>
				{t.changes || "Changes"}
			</h4>
			{Object.entries(changes_json).map(
				([field, change]) => (
					<div
						key={field}
						style={{
							marginBottom: spacing[2],
							fontSize: font.size.sm,
						}}
					>
						<span
							style={{
								fontWeight:
									font.weight.medium,
								color: colors.textSecondary,
							}}
						>
							{field}:
						</span>
						<div
							style={{
								marginTop: spacing[1],
								display: "flex",
								flexDirection: "column",
								gap: spacing[1],
							}}
						>
							{change.old !== undefined && (
								<div>
									<span
										style={{
											color: colors.danger,
										}}
									>
										{t.oldValue ||
											"Old"}:
									</span>{" "}
									<span
										style={{
											color: colors.textBody,
										}}
									>
										{String(
											change.old
										)}
									</span>
								</div>
							)}
							{change.new !== undefined && (
								<div>
									<span
										style={{
											color: colors.success,
										}}
									>
										{t.newValue ||
											"New"}:
									</span>{" "}
									<span
										style={{
											color: colors.textBody,
										}}
									>
										{String(
											change.new
										)}
									</span>
								</div>
							)}
						</div>
					</div>
				)
			)}
		</div>
	);
}

export default function LogEntry({
	initialData,
	expanded,
	onToggle,
	language = "pl",
}) {
	const t = translations[language];
	const [log] = useState(initialData);
	const badgeKey =
		OPERATION_BADGE[log.operation_type] ??
		"info";
	const badge = badgeStyle(badgeKey);
	const operationColor =
		OPERATION_COLORS[log.operation_type] ||
		colors.textSecondary;

	const buildingLabel = log.task?.building
		? [
				log.task.building.district,
				log.task.building.city,
			]
				.filter(Boolean)
				.join(", ")
		: "";
	const buildingAddress =
		log.task?.building?.street_address ??
		null;

	const actionText = getActionText(
		log.operation_type,
		log.action,
		log.changes_json,
		t
	);

	return (
		<div
			style={logCardStyle}
			onClick={onToggle}
		>
			<div
				style={{
					padding: `${spacing[4]} ${spacing[5]}`,
					borderLeft: `4px solid ${operationColor}`,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: spacing[3],
					}}
				>
					<h2
						style={{
							fontSize: font.size.lg,
							fontWeight:
								font.weight.medium,
							color: colors.textHeading,
							letterSpacing:
								font.letterSpacing
									.tight,
							lineHeight:
								font.lineHeight.tight,
							margin: 0,
							flex: 1,
						}}
					>
						{log.task?.title ||
							t.deletedTask ||
							"Deleted task"}
					</h2>
					<div style={badge}>
						{log.operation_type}
					</div>
				</div>

				<p
					style={{
						fontSize: font.size.sm,
						color: colors.textBody,
						margin: `0 0 ${spacing[3]} 0`,
						lineHeight:
							font.lineHeight.normal,
					}}
				>
					{actionText}
				</p>

				{buildingAddress && (
					<div
						style={{
							borderTop: `0.5px solid ${colors.borderSubtle}`,
							paddingTop:
								spacing[3],
						}}
					>
						<MetaRow
							label={t.building}
						>
							<div
								style={{
									display:
										"flex",
									flexDirection:
										"column",
									alignItems:
										"flex-end",
									gap: "2px",
								}}
							>
								<span>
									{
										buildingAddress
									}
								</span>
								{buildingLabel && (
									<span
										style={{
											fontSize:
												font
													.size
													.xs,
											color: colors.textSecondary,
											fontWeight:
												font
													.weight
													.regular,
										}}
									>
										{
											buildingLabel
										}
									</span>
								)}
							</div>
						</MetaRow>
					</div>
				)}
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateRows: expanded
						? "1fr"
						: "0fr",
					transition:
						"grid-template-rows 0.25s ease",
				}}
			>
				<div
					style={{ overflow: "hidden" }}
				>
					<div
						style={{
							borderTop: `0.5px solid ${colors.borderSubtle}`,
							padding: `${spacing[4]} ${spacing[5]}`,
							display: "flex",
							flexDirection:
								"column",
							gap: spacing[4],
						}}
						onClick={(e) =>
							e.stopPropagation()
						}
					>
						<MetaRow
							label={t.performedBy || "Performed by"}
						>
							<UserCell
								user={log.user}
								t={t}
							/>
						</MetaRow>

						<MetaRow
							label={t.timestamp || "Timestamp"}
						>
							<span
								style={{
									color: colors.textSecondary,
								}}
							>
								{formatTimestamp(
									log.timestamp,
									language
								)}
							</span>
						</MetaRow>

						{renderChanges(
							log.changes_json,
							t
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
