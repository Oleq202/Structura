import { useEffect, useRef } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	status,
} from "../theme";
import { translations } from "../i18n";

const ICONS = {
	logout: (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	),
	close: (
		<svg
			width="16"
			height="16"
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

export default function LogoutConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	language = "pl",
	currentUser,
}) {
	const t = translations[language] || translations.pl;
	const modalRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const userName = [currentUser?.first_name, currentUser?.last_name]
		.filter(Boolean)
		.join(" ") || currentUser?.login;

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(9, 21, 42, 0.65)",
				backdropFilter: "blur(6px)",
				WebkitBackdropFilter: "blur(6px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 2500,
				padding: spacing[4],
			}}
			onClick={() => onClose?.()}
		>
			<div
				ref={modalRef}
				style={{
					background: colors.cardBg,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "420px",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div
					style={{
						padding: `${spacing[4]} ${spacing[5]}`,
						background: colors.shellDeep,
						color: colors.shellText,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexShrink: 0,
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: spacing[3],
						}}
					>
						<div
							style={{
								width: "36px",
								height: "36px",
								borderRadius: radius.md,
								background: "rgba(240, 149, 149, 0.2)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: status.danger.border,
							}}
						>
							{ICONS.logout}
						</div>
						<h3
							style={{
								margin: 0,
								fontSize: font.size.md,
								fontWeight: font.weight.big,
								letterSpacing: font.letterSpacing.wide,
							}}
						>
							{t.logoutConfirmTitle || "Potwierdzenie wylogowania"}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "transparent",
							border: "none",
							color: "rgba(255, 255, 255, 0.7)",
							cursor: "pointer",
							padding: spacing[1],
							borderRadius: radius.sm,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							transition: "color 0.15s, background 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = "#ffffff";
							e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
							e.currentTarget.style.background = "transparent";
						}}
					>
						{ICONS.close}
					</button>
				</div>

				{/* Modal Body */}
				<div
					style={{
						padding: `${spacing[5]} ${spacing[5]}`,
						display: "flex",
						flexDirection: "column",
						gap: spacing[3],
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
						{t.logoutConfirmMessage || "Czy na pewno chcesz się wylogować ze swojego konta?"}
					</p>

					{userName && (
						<div
							style={{
								fontSize: font.size.xs,
								color: colors.textSecondary,
								background: colors.pageBg,
								padding: `${spacing[2]} ${spacing[3]}`,
								borderRadius: radius.md,
								border: `1px solid ${colors.borderSubtle}`,
							}}
						>
							{t.user || "Użytkownik"}: <strong style={{ color: colors.textHeading }}>{userName}</strong>
						</div>
					)}
				</div>

				{/* Modal Footer Actions */}
				<div
					style={{
						padding: `${spacing[3]} ${spacing[5]} ${spacing[5]}`,
						display: "flex",
						justifyContent: "flex-end",
						gap: spacing[3],
						background: colors.cardBg,
					}}
				>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "transparent",
							border: `1px solid ${colors.borderDefault}`,
							borderRadius: radius.md,
							padding: `${spacing[2]} ${spacing[4]}`,
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							fontWeight: font.weight.medium,
							color: colors.textBody,
							cursor: "pointer",
							transition: "background 0.15s, border-color 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = colors.pageBg;
							e.currentTarget.style.borderColor = colors.borderStrong;
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "transparent";
							e.currentTarget.style.borderColor = colors.borderDefault;
						}}
						onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
						onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
					>
						{t.cancel || "Anuluj"}
					</button>

					<button
						type="button"
						onClick={onConfirm}
						style={{
							background: status.danger.bg,
							color: status.danger.text,
							border: `1px solid ${status.danger.border}`,
							borderRadius: radius.md,
							padding: `${spacing[2]} ${spacing[4]}`,
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							fontWeight: font.weight.big,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: spacing[2],
							transition: "all 0.15s ease",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#fbdada";
							e.currentTarget.style.borderColor = "#e57373";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = status.danger.bg;
							e.currentTarget.style.borderColor = status.danger.border;
						}}
						onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
						onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
					>
						{ICONS.logout}
						{t.logoutConfirmButton || "Tak, wyloguj"}
					</button>
				</div>
			</div>
		</div>
	);
}
