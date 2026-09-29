import { useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";
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
	trash: (
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
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
			<line x1="10" y1="11" x2="10" y2="17" />
			<line x1="14" y1="11" x2="14" y2="17" />
		</svg>
	),
	warning: (
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
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
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
	spinner: (
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
	),
};

export default function DeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	itemName,
	itemType,
	confirmButtonText,
	cancelButtonText,
	isDeleting = false,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const modalRef = useRef(null);

	const handleKeyDownEvent = useEffectEvent((e) => {
		if (e.key === "Escape" && !isDeleting) {
			onClose?.();
		}
	});

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e) => {
			handleKeyDownEvent(e);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	if (!isOpen) return null;

	const modalTitle = title || t.deleteConfirmTitle || "Potwierdzenie usunięcia";
	const modalMessage = message || t.deleteConfirmWarning || "Czy na pewno chcesz usunąć ten element?";
	const confirmText = confirmButtonText || t.deleteConfirmButton || "Tak, usuń";
	const cancelText = cancelButtonText || t.cancel || "Anuluj";

	return createPortal(
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				height: "100%",
				minHeight: "100dvh",
				maxHeight: "100dvh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 99999,
				padding: "calc(12px + env(safe-area-inset-top, 0px)) 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px",
				boxSizing: "border-box",
			}}
		>
			{/* Backdrop */}
			<button
				type="button"
				aria-label={t.close || "Zamknij"}
				tabIndex={-1}
				onClick={() => {
					if (!isDeleting) onClose?.();
				}}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: "rgba(9, 21, 42, 0.65)",
					backdropFilter: "blur(6px)",
					WebkitBackdropFilter: "blur(6px)",
					border: "none",
					padding: 0,
					margin: 0,
					cursor: isDeleting ? "not-allowed" : "default",
					width: "100%",
					height: "100%",
				}}
			/>

			{/* Modal Dialog Card */}
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-confirm-title"
				style={{
					position: "relative",
					zIndex: 1,
					background: colors.cardBg,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "440px",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
					animation: "popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			>
				{/* Header */}
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
								background: "rgba(240, 149, 149, 0.22)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: status.danger.border,
								flexShrink: 0,
							}}
						>
							{ICONS.trash}
						</div>
						<h3
							id="delete-confirm-title"
							style={{
								margin: 0,
								fontSize: font.size.md,
								fontWeight: font.weight.big,
								letterSpacing: font.letterSpacing.wide,
							}}
						>
							{modalTitle}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						aria-label={t.close || "Zamknij"}
						style={{
							background: "transparent",
							border: "none",
							color: "rgba(255, 255, 255, 0.7)",
							cursor: isDeleting ? "not-allowed" : "pointer",
							padding: spacing[1],
							borderRadius: radius.sm,
							width: "44px",
							height: "44px",
							minWidth: "44px",
							minHeight: "44px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxSizing: "border-box",
							transition: "color 0.15s, background 0.15s",
						}}
						onMouseEnter={(e) => {
							if (!isDeleting) {
								e.currentTarget.style.color = "#ffffff";
								e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
							e.currentTarget.style.background = "transparent";
						}}
					>
						{ICONS.close}
					</button>
				</div>

				{/* Body Content */}
				<div
					style={{
						padding: `${spacing[5]} ${spacing[5]}`,
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
						{modalMessage}
					</p>

					{/* Item preview card */}
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
										fontWeight: font.weight.big,
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

					{/* Danger notice */}
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
						<span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
							{ICONS.warning}
						</span>
						<span>{t.deleteConfirmWarning || "Tej operacji nie można cofnąć."}</span>
					</div>
				</div>

				{/* Footer Actions */}
				<div
					style={{
						padding: `${spacing[3]} ${spacing[5]} ${spacing[5]}`,
						display: "flex",
						justifyContent: "flex-end",
						gap: spacing[3],
						background: colors.cardBg,
						borderTop: `1px solid ${colors.borderSubtle}`,
					}}
				>
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						style={{
							background: "transparent",
							border: `1px solid ${colors.borderDefault}`,
							borderRadius: radius.md,
							padding: `${spacing[2]} ${spacing[4]}`,
							minHeight: "44px",
							minWidth: "80px",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							boxSizing: "border-box",
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							fontWeight: font.weight.medium,
							color: colors.textBody,
							cursor: isDeleting ? "not-allowed" : "pointer",
							opacity: isDeleting ? 0.6 : 1,
							transition: "background 0.15s, border-color 0.15s",
						}}
						onMouseEnter={(e) => {
							if (!isDeleting) {
								e.currentTarget.style.background = colors.pageBg;
								e.currentTarget.style.borderColor = colors.borderStrong;
							}
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "transparent";
							e.currentTarget.style.borderColor = colors.borderDefault;
						}}
						onMouseDown={(e) => {
							if (!isDeleting) e.currentTarget.style.transform = "scale(0.98)";
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.transform = "scale(1)";
						}}
					>
						{cancelText}
					</button>

					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						style={{
							background: isDeleting ? "#fca5a5" : "#dc2626",
							color: "#ffffff",
							border: "1px solid #b91c1c",
							borderRadius: radius.md,
							padding: `${spacing[2]} ${spacing[4]}`,
							minHeight: "44px",
							minWidth: "110px",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							boxSizing: "border-box",
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							fontWeight: font.weight.big,
							cursor: isDeleting ? "not-allowed" : "pointer",
							gap: spacing[2],
							boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
							transition: "background 0.15s, transform 0.1s",
						}}
						onMouseEnter={(e) => {
							if (!isDeleting) {
								e.currentTarget.style.background = "#b91c1c";
							}
						}}
						onMouseLeave={(e) => {
							if (!isDeleting) {
								e.currentTarget.style.background = "#dc2626";
							}
						}}
						onMouseDown={(e) => {
							if (!isDeleting) e.currentTarget.style.transform = "scale(0.98)";
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.transform = "scale(1)";
						}}
					>
						{isDeleting ? (
							<>
								{ICONS.spinner}
								{t.deleting || "Usuwanie..."}
							</>
						) : (
							<>
								{ICONS.trash}
								{confirmText}
							</>
						)}
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
}
