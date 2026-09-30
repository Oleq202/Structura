import {
	colors,
	font,
	spacing,
	radius,
	shadow,
} from "../theme";
import { translations } from "../i18n";
import {
	IconChevronDown,
	IconMapPin,
	IconClock,
	IconCheck,
	IconRefresh,
	IconEdit,
	IconTrash,
	IconUser,
} from "./icons";
import { Button, Badge } from "./ui";

const taskCardStyle = {
	width: "100%",
	boxSizing: "border-box",
	background: colors.cardBg,
	borderRadius: radius.xl,
	border: `1px solid ${colors.cardBorder}`,
	boxShadow: shadow.card,
	overflow: "hidden",
	textAlign: "left",
	transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
};

function ContractorAvatar({ firstName, lastName }) {
	const initials = [firstName, lastName]
		.filter(Boolean)
		.map((n) => n[0].toUpperCase())
		.join("") || "?";

	return (
		<div
			style={{
				width: "30px",
				height: "30px",
				borderRadius: radius.full,
				background: colors.primaryLight,
				border: `1px solid #bfdbfe`,
				color: colors.primary,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontSize: font.size.xs,
				fontWeight: font.weight.bold,
				letterSpacing: "0.5px",
				flexShrink: 0,
			}}
			aria-hidden="true"
		>
			{initials}
		</div>
	);
}

function UserCell({ user, t }) {
	if (!user) {
		return (
			<span style={{ color: colors.textMuted, fontStyle: "italic", fontSize: font.size.sm }}>
				{t.unassigned || "Nieprzypisany"}
			</span>
		);
	}
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.login;
	return (
		<div style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
			<ContractorAvatar firstName={user.first_name} lastName={user.last_name} />
			<span style={{ fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.textBody }}>
				{fullName}
			</span>
		</div>
	);
}

function MetaRow({ label, icon, children }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: spacing[2],
				padding: `${spacing[1]} 0`,
			}}
		>
			<span
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "6px",
					fontSize: font.size.xs,
					fontWeight: font.weight.semibold,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.wide,
				}}
			>
				{icon}
				{label}
			</span>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: spacing[2],
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

function TaskHeader({
	task,
	buildingLabel,
	buildingAddress,
	isPending,
	isUpdating,
	expanded,
	onToggle,
	t,
}) {
	return (
		<div
			role="button"
			tabIndex={0}
			aria-expanded={expanded}
			onClick={onToggle}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onToggle();
				}
			}}
			style={{
				padding: `${spacing[4]} ${spacing[5]}`,
				cursor: "pointer",
				userSelect: "none",
				WebkitTapHighlightColor: "transparent",
			}}
		>
			{/* Top row: Title and Status Badge + Expand Toggle */}
			<div
				style={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: spacing[3],
					marginBottom: spacing[2],
				}}
			>
				<h3
					style={{
						fontSize: font.size.md,
						fontWeight: font.weight.semibold,
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
				</h3>

				<div style={{ display: "flex", alignItems: "center", gap: spacing[2], flexShrink: 0 }}>
					<Badge status={isPending ? "pending" : "completed"} dot={!isUpdating}>
						{isUpdating
							? (t.saving || "Zapisywanie...")
							: isPending
								? (t.pending || "Oczekujące")
								: (t.completed || "Ukończone")}
					</Badge>

					<div
						style={{
							width: "28px",
							height: "28px",
							borderRadius: radius.md,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: colors.textSecondary,
							transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
							transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
						aria-hidden="true"
					>
						<IconChevronDown size="sm" />
					</div>
				</div>
			</div>

			{/* Building Location Badge / Pill */}
			{buildingAddress ? (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						marginTop: spacing[2],
						color: colors.textBody,
						fontSize: font.size.sm,
						fontWeight: font.weight.medium,
					}}
				>
					<IconMapPin size="sm" style={{ color: colors.primary, flexShrink: 0 }} />
					<span style={{ color: colors.textHeading }}>{buildingAddress}</span>
					{buildingLabel && (
						<span
							style={{
								color: colors.textSecondary,
								fontSize: font.size.xs,
								fontWeight: font.weight.regular,
							}}
						>
							• {buildingLabel}
						</span>
					)}
				</div>
			) : (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "6px",
						marginTop: spacing[2],
						color: colors.textMuted,
						fontSize: font.size.xs,
						fontStyle: "italic",
					}}
				>
					<IconMapPin size="xs" style={{ opacity: 0.6 }} />
					<span>{t.noBuilding || "Brak przypisanego budynku"}</span>
				</div>
			)}
		</div>
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
				borderTop: `1px solid ${colors.borderSubtle}`,
				padding: `${spacing[4]} ${spacing[5]}`,
				background: "#fafcff",
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
			}}
			onClick={(e) => e.stopPropagation()}
		>
			{/* Description */}
			{task.description && (
				<div
					style={{
						padding: spacing[3],
						borderRadius: radius.md,
						background: colors.cardBg,
						border: `1px solid ${colors.borderSubtle}`,
					}}
				>
					<p
						style={{
							fontSize: font.size.base,
							color: colors.textBody,
							lineHeight: font.lineHeight.normal,
							margin: 0,
							whiteSpace: "pre-wrap",
						}}
					>
						{task.description}
					</p>
				</div>
			)}

			{/* Metadata List */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: spacing[2],
					padding: `${spacing[2]} 0`,
				}}
			>
				<MetaRow label={t.assignedTo} icon={<IconUser size="xs" />}>
					<UserCell user={task.assigned_to_user} t={t} />
				</MetaRow>

				<MetaRow label={t.createdBy} icon={<IconUser size="xs" />}>
					<UserCell user={task.created_by_user} t={t} />
				</MetaRow>

				{task.created_at && (
					<MetaRow label={t.created} icon={<IconClock size="xs" />}>
						<span style={{ fontSize: font.size.xs, color: colors.textSecondary, fontWeight: font.weight.medium }}>
							{formatTimestamp(task.created_at, language)}
						</span>
					</MetaRow>
				)}

				{task.updated_at && task.updated_at !== task.created_at && (
					<MetaRow label={t.lastUpdated} icon={<IconClock size="xs" />}>
						<span style={{ fontSize: font.size.xs, color: colors.textSecondary, fontWeight: font.weight.medium }}>
							{formatTimestamp(task.updated_at, language)}
						</span>
					</MetaRow>
				)}
			</div>

			{/* Action Buttons */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: spacing[3],
					paddingTop: spacing[2],
				}}
			>
				{isPending ? (
					<>
						<Button
							variant="primary"
							size="lg"
							fullWidth
							loading={isUpdating}
							onClick={(e) => {
								e.stopPropagation();
								onMarkCompleted?.();
							}}
						>
							<IconCheck size="sm" />
							<span>{t.markCompleted || "Oznacz jako ukończone"}</span>
						</Button>

						{canEdit && (
							<Button
								variant="secondary"
								size="lg"
								disabled={isUpdating}
								onClick={(e) => {
									e.stopPropagation();
									onEdit?.();
								}}
							>
								<IconEdit size="sm" />
								<span>{t.edit || "Edytuj"}</span>
							</Button>
						)}
					</>
				) : (
					<>
						<Button
							variant="ghost"
							size="lg"
							fullWidth
							loading={isUpdating}
							onClick={(e) => {
								e.stopPropagation();
								onRevertCompleted?.();
							}}
						>
							<IconRefresh size="sm" />
							<span>{t.revertCompletion || "Przywróć"}</span>
						</Button>

						{canDelete && (
							<Button
								variant="danger"
								size="lg"
								disabled={isUpdating}
								onClick={(e) => {
									e.stopPropagation();
									onDeleteTask?.();
								}}
							>
								<IconTrash size="sm" />
								<span>{t.delete || "Usuń"}</span>
							</Button>
						)}
					</>
				)}
			</div>
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
				opacity: isUpdating ? 0.8 : 1,
				borderColor: isUpdating ? colors.primary : colors.cardBorder,
			}}
			role="region"
			aria-label={task.title}
		>
			<TaskHeader
				task={task}
				buildingLabel={buildingLabel}
				buildingAddress={buildingAddress}
				isPending={isPending}
				isUpdating={isUpdating}
				expanded={expanded}
				onToggle={onToggle}
				t={t}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateRows: expanded ? "1fr" : "0fr",
					transition: "grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
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
