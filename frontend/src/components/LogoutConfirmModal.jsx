import {
	colors,
	font,
	spacing,
	radius,
} from "../theme";
import { translations } from "../i18n";
import { Modal, Button } from "./ui";
import { IconLogout } from "./icons";

export default function LogoutConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	language = "pl",
	currentUser,
}) {
	const t = translations[language] || translations.pl;

	if (!isOpen) return null;

	const userName =
		[currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
		currentUser?.login;

	const modalTitle = t.logoutConfirmTitle || "Wylogowanie";

	const modalFooter = (
		<>
			<Button variant="secondary" size="md" onClick={onClose}>
				{t.cancel || "Anuluj"}
			</Button>
			<Button
				variant="danger"
				size="md"
				onClick={onConfirm}
				style={{
					background: "#dc2626",
					color: "#ffffff",
					borderColor: "#b91c1c",
				}}
			>
				{t.logoutConfirmButton || t.logout || "Wyloguj się"}
			</Button>
		</>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={modalTitle}
			icon={
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: radius.md,
						background: "#fee2e2",
						color: "#dc2626",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<IconLogout size="md" />
				</div>
			}
			footer={modalFooter}
			maxWidth="420px"
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
					{t.logoutConfirmMsg || "Czy na pewno chcesz zakończyć bieżącą sesję?"}
				</p>

				{userName && (
					<div
						style={{
							background: colors.pageBg,
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.lg,
							padding: `${spacing[3]} ${spacing[4]}`,
							display: "flex",
							alignItems: "center",
							gap: spacing[3],
						}}
					>
						<div
							style={{
								width: "32px",
								height: "32px",
								borderRadius: radius.full,
								background: colors.primaryLight,
								color: colors.primary,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: font.size.xs,
								fontWeight: font.weight.bold,
								flexShrink: 0,
							}}
						>
							{userName[0]?.toUpperCase()}
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<div
								style={{
									fontWeight: font.weight.semibold,
									color: colors.textHeading,
									fontSize: font.size.base,
								}}
							>
								{userName}
							</div>
							{currentUser?.role && (
								<div style={{ fontSize: font.size.xs, color: colors.textSecondary }}>
									{currentUser.role}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
