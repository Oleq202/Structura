import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
} from "../theme";
import { translations } from "../i18n";

const taskCardStyle = {
	width: "100%",
	boxSizing: "border-box",
	background: colors.cardBg,
	borderRadius: radius.xl,
	border: `0.5px solid ${colors.cardBorder}`,
	boxShadow: shadow.modal,
	overflow: "hidden",
	cursor: "pointer",
	padding: 0,
	textAlign: "left",
};

const unassignedTextStyle = {
	color: colors.textMuted,
	fontStyle: "italic",
};

function Avatar({ first_name, last_name }) {
	const initials =
		[first_name, last_name]
			.filter(Boolean)
			.map((name) => name[0].toUpperCase())
			.join("") || "?";
	return <div style={components.avatar}>{initials}</div>;
}

function UserCell({ user, t }) {
	if (!user) {
		return <span style={unassignedTextStyle}>{t.unassigned}</span>;
	}
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
	return (
		<>
			<span>{fullName}</span>
			<Avatar first_name={user.first_name} last_name={user.last_name} />
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
			<span style={components.sectionLabel}>{label}</span>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: spacing[2],
					fontSize: font.size.sm,
					color: colors.textBody,
					fontWeight: font.weight.medium,
				}}
			>
				{children}
			</div>
		</div>
	);
}

function formatTimestamp(iso, language) {
	if (!iso) return "";
	const locale = language === "pl" ? "pl-PL" : "en-US";
	return new Date(iso).toLocaleString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function TaskHeader({ task, buildingLabel, buildingAddress, isPending, isUpdating, t }) {
	const statusBadgeStyle = isPending
		? {
				bg: "#fef3c7",
				border: "#fde68a",
				text: "#92400e",
				label: t.pending || "Oczekujące",
			}
		: {
				bg: "#eaf3de",
				border: "#97c459",
				text: "#27500a",
				label: t.completed || "Ukończone",
			};

	return (
		<div style={{ padding: `${spacing[4]} ${spacing[5]}` }}>
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: spacing[2],
					marginBottom: buildingAddress ? spacing[3] : 0,
				}}
			>
				<h2
					style={{
						fontSize: font.size.lg,
						fontWeight: font.weight.medium,
						color: isPending ? colors.textHeading : colors.textSecondary,
						letterSpacing: font.letterSpacing.tight,
						lineHeight: font.lineHeight.tight,
						margin: 0,
						flex: 1,
						minWidth: 0,
						wordBreak: "break-word",
					}}
				>
					{task.title}
				</h2>

				<span
					style={{
						padding: "2px 8px",
						borderRadius: radius.full,
						fontSize: "11px",
						fontWeight: font.weight.big,
						background: statusBadgeStyle.bg,
						border: `1px solid ${statusBadgeStyle.border}`,
						color: statusBadgeStyle.text,
						whiteSpace: "nowrap",
						flexShrink: 0,
						display: "inline-flex",
						alignItems: "center",
						gap: "5px",
						transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
					}}
				>
					{isUpdating ? (
						<svg
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{ animation: "spin 0.8s linear infinite" }}
						>
							<path d="M21 12a9 9 0 1 1-6.219-8.56" />
						</svg>
					) : (
						<span
							style={{
								width: "6px",
								height: "6px",
								borderRadius: radius.full,
								background: statusBadgeStyle.text,
							}}
						/>
					)}
					{isUpdating ? (t.saving || "Zapisywanie...") : statusBadgeStyle.label}
				</span>
			</div>

			{buildingAddress && (
				<div
					style={{
						borderTop: `0.5px solid ${colors.borderSubtle}`,
						paddingTop: spacing[3],
					}}
				>
					<MetaRow label={t.building}>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-end",
								gap: "2px",
							}}
						>
							<span>{buildingAddress}</span>
							{buildingLabel && (
								<span
									style={{
										fontSize: font.size.xs,
										color: colors.textSecondary,
										fontWeight: font.weight.regular,
									}}
								>
									{buildingLabel}
								</span>
							)}
						</div>
					</MetaRow>
				</div>
			)}
		</div>
	);
}

function UpdatingSpinner() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ animation: "spin 0.8s linear infinite" }}
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
}

function PendingTaskActions({ isUpdating, canEdit, t, onMarkCompleted, onEdit }) {
	return (
		<div style={{ display: "flex", gap: spacing[3] }}>
			<button
				type="button"
				disabled={isUpdating}
				style={{
					...components.primaryButton,
					flex: 1,
					minHeight: "44px",
					padding: `${spacing[3]} ${spacing[4]}`,
					borderRadius: radius.lg,
					fontFamily: font.family.sans,
					boxSizing: "border-box",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
					opacity: isUpdating ? 0.75 : 1,
					cursor: isUpdating ? "not-allowed" : "pointer",
					transition: "background-color 0.15s ease, opacity 0.15s ease",
				}}
				onClick={(e) => {
					e.stopPropagation();
					if (!isUpdating) onMarkCompleted?.();
				}}
				onMouseEnter={(e) => {
					if (!isUpdating) e.currentTarget.style.background = colors.primaryHover;
				}}
				onMouseLeave={(e) => {
					if (!isUpdating) e.currentTarget.style.background = colors.primary;
				}}
			>
				{isUpdating && <UpdatingSpinner />}
				{isUpdating ? (t.saving || "Zapisywanie...") : t.markCompleted}
			</button>
			{canEdit && (
				<button
					type="button"
					disabled={isUpdating}
					style={{
						...components.ghostButton,
						minHeight: "44px",
						padding: `${spacing[3]} ${spacing[4]}`,
						borderRadius: radius.lg,
						fontFamily: font.family.sans,
						opacity: isUpdating ? 0.5 : 1,
						cursor: isUpdating ? "not-allowed" : "pointer",
					}}
					onClick={(e) => {
						e.stopPropagation();
						if (!isUpdating) onEdit?.();
					}}
				>
					{t.edit}
				</button>
			)}
		</div>
	);
}

function CompletedTaskActions({ isUpdating, canDelete, t, onRevertCompleted, onDeleteTask }) {
	return (
		<div style={{ display: "flex", gap: spacing[3] }}>
			<button
				type="button"
				disabled={isUpdating}
				style={{
					...components.ghostButton,
					minHeight: "44px",
					padding: `${spacing[3]} ${spacing[4]}`,
					borderRadius: radius.lg,
					fontFamily: font.family.sans,
					flex: 1,
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
					opacity: isUpdating ? 0.75 : 1,
					cursor: isUpdating ? "not-allowed" : "pointer",
					transition: "background-color 0.15s ease, opacity 0.15s ease",
				}}
				onClick={(e) => {
					e.stopPropagation();
					if (!isUpdating) onRevertCompleted?.();
				}}
			>
				{isUpdating && <UpdatingSpinner />}
				{isUpdating ? (t.saving || "Zapisywanie...") : t.revertCompletion}
			</button>
			{canDelete && (
				<button
					type="button"
					disabled={isUpdating}
					style={{
						...components.primaryButton,
						minHeight: "44px",
						padding: `${spacing[3]} ${spacing[4]}`,
						borderRadius: radius.lg,
						fontFamily: font.family.sans,
						opacity: isUpdating ? 0.5 : 1,
						cursor: isUpdating ? "not-allowed" : "pointer",
					}}
					onClick={(e) => {
						e.stopPropagation();
						if (!isUpdating) onDeleteTask?.();
					}}
				>
					{t.delete}
				</button>
			)}
		</div>
	);
}

function TaskActions({
	isPending,
	isUpdating,
	canEdit,
	canDelete,
	t,
	onMarkCompleted,
	onRevertCompleted,
	onEdit,
	onDeleteTask,
}) {
	if (isPending) {
		return (
			<PendingTaskActions
				isUpdating={isUpdating}
				canEdit={canEdit}
				t={t}
				onMarkCompleted={onMarkCompleted}
				onEdit={onEdit}
			/>
		);
	}

	return (
		<CompletedTaskActions
			isUpdating={isUpdating}
			canDelete={canDelete}
			t={t}
			onRevertCompleted={onRevertCompleted}
			onDeleteTask={onDeleteTask}
		/>
	);
}

function TaskDetails({
	task,
	language,
	t,
	isPending,
	isUpdating,
	canEdit,
	canDelete,
	onMarkCompleted,
	onRevertCompleted,
	onEdit,
	onDeleteTask,
}) {
	return (
		<div
			style={{
				borderTop: `0.5px solid ${colors.borderSubtle}`,
				padding: `${spacing[4]} ${spacing[5]}`,
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
			}}
			onClick={(e) => e.stopPropagation()}
		>
			{task.description && (
				<p
					style={{
						fontSize: font.size.base,
						color: colors.textBody,
						lineHeight: font.lineHeight.normal,
						margin: 0,
					}}
				>
					{task.description}
				</p>
			)}

			<MetaRow label={t.createdBy}>
				<UserCell user={task.created_by_user} t={t} />
			</MetaRow>

			<MetaRow label={t.assignedTo}>
				<UserCell user={task.assigned_to_user} t={t} />
			</MetaRow>

			{task.created_at && (
				<MetaRow label={t.created}>
					<span style={{ color: colors.textSecondary }}>
						{formatTimestamp(task.created_at, language)}
					</span>
				</MetaRow>
			)}

			{task.updated_at && task.updated_at !== task.created_at && (
				<MetaRow label={t.lastUpdated}>
					<span style={{ color: colors.textSecondary }}>
						{formatTimestamp(task.updated_at, language)}
					</span>
				</MetaRow>
			)}

			<TaskActions
				isPending={isPending}
				isUpdating={isUpdating}
				canEdit={canEdit}
				canDelete={canDelete}
				t={t}
				onMarkCompleted={onMarkCompleted}
				onRevertCompleted={onRevertCompleted}
				onEdit={onEdit}
				onDeleteTask={onDeleteTask}
			/>
		</div>
	);
}

export default function Task({
	initialData,
	expanded,
	onToggle,
	onEdit,
	onMarkCompleted,
	onRevertCompleted,
	onDeleteTask,
	isUpdating = false,
	language = "pl",
	userRole = "manager",
}) {
	const t = translations[language];
	const task = initialData;
	const isPending = task.status === "pending";

	const canEdit = userRole !== "contractor";
	const canDelete = userRole === "admin";

	const buildingLabel = task.building
		? [task.building.district, task.building.city].filter(Boolean).join(", ")
		: "";
	const buildingAddress = task.building?.street_address ?? null;

	return (
		<div
			style={{
				...taskCardStyle,
				opacity: isUpdating ? 0.85 : 1,
				borderColor: isUpdating ? colors.primary : colors.cardBorder,
				transition: "border-color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
			}}
			role="button"
			tabIndex={0}
			onClick={onToggle}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle?.(e);
				}
			}}
		>
			<TaskHeader
				task={task}
				buildingLabel={buildingLabel}
				buildingAddress={buildingAddress}
				isPending={isPending}
				isUpdating={isUpdating}
				t={t}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateRows: expanded ? "1fr" : "0fr",
					transition: "grid-template-rows 0.25s ease",
				}}
			>
				<div style={{ overflow: "hidden" }}>
					<TaskDetails
						task={task}
						language={language}
						t={t}
						isPending={isPending}
						isUpdating={isUpdating}
						canEdit={canEdit}
						canDelete={canDelete}
						onMarkCompleted={onMarkCompleted}
						onRevertCompleted={onRevertCompleted}
						onEdit={onEdit}
						onDeleteTask={onDeleteTask}
					/>
				</div>
			</div>
		</div>
	);
}
