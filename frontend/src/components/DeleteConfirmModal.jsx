import {
	colors,
	font,
	spacing,
	radius,
	status,
} from "../theme";
import { translations } from "../i18n";
import { Modal, Button } from "./ui";
import { IconTrash } from "./icons";

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	isDeleting = false,
	title,
	message,
	itemName,
	itemType,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;

	const modalTitle = title || t.deleteConfirmTitle || "Potwierdzenie usunięcia";
	const confirmText = isDeleting
		? (t.deleting || "Usuwanie...")
		: (t.deleteConfirmButton || "Tak, usuń");

	const modalFooter = (
		<>
			<Button
				variant="secondary"
				size="md"
				disabled={isDeleting}
				onClick={onClose}
			>
				{t.cancel || "Anuluj"}
			</Button>
			<Button
				variant="danger"
				size="md"
				loading={isDeleting}
				disabled={isDeleting}
				onClick={onConfirm}
				style={{
					background: "#dc2626",
					color: "#ffffff",
					borderColor: "#b91c1c",
				}}
			>
				{confirmText}
			</Button>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={isDeleting ? undefined : onClose}
			title={modalTitle}
			icon={
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: radius.md,
						background: "#fee2e2",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#dc2626",
						flexShrink: 0,
					}}
				>
					<IconTrash size="md" />
				</div>
			}
			footer={modalFooter}
			maxWidth="460px"
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: spacing[4],
				}}
			>
				<p
					style={{
						margin: 0,
						fontSize: font.size.base,
						color: colors.textBody,
						lineHeight: font.lineHeight.normal,
					}}
				>
					{message || t.deleteTaskModalMsg || "Czy na pewno chcesz usunąć ten element?"}
				</p>

				{itemName && (
					<div
						style={{
							background: colors.pageBg,
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.lg,
							padding: `${spacing[3]} ${spacing[4]}`,
							display: "flex",
							flexDirection: "column",
							gap: spacing[1],
						}}
					>
						{itemType && (
							<span
								style={{
									fontSize: font.size.xs,
									color: colors.textSecondary,
									textTransform: "uppercase",
									letterSpacing: font.letterSpacing.caps,
									fontWeight: font.weight.semibold,
								}}
							>
								{itemType}
							</span>
						)}
						<span
							style={{
								fontSize: font.size.md,
								fontWeight: font.weight.bold,
								color: colors.textHeading,
								wordBreak: "break-word",
							}}
						>
							{itemName}
						</span>
					</div>
				)}

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: spacing[2],
						background: status.danger.bg,
						border: `1px solid ${status.danger.border}`,
						color: status.danger.text,
						borderRadius: radius.md,
						padding: `${spacing[2]} ${spacing[3]}`,
						fontSize: font.size.xs,
						fontWeight: font.weight.medium,
					}}
				>
					<span
						style={{
							width: "6px",
							height: "6px",
							borderRadius: radius.full,
							background: status.danger.solid || "#dc2626",
							flexShrink: 0,
						}}
					/>
					<span>{t.deleteConfirmWarning || "Tej operacji nie można cofnąć."}</span>
				</div>
			</div>
		</Modal>
	);
}
