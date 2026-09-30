/**
 * Modal — Accessible dialog primitive for Structura.
 *
 * Features:
 * - Portal rendering via createPortal
 * - role="dialog", aria-modal="true", aria-labelledby
 * - Focus trapping (Tab and Shift+Tab cycle within modal)
 * - Escape key to close
 * - Click backdrop to close
 * - Responsive: centered dialog on desktop, bottom sheet on mobile
 * - Smooth enter animation
 * - Safe-area inset aware
 */
import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { colors, font, spacing, radius, shadow } from "../../theme";
import { IconClose } from "../icons";

const backdropContainerStyle = {
	position: "fixed",
	inset: 0,
	zIndex: 9000,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: spacing[4],
	boxSizing: "border-box",
};

const backdropOverlayStyle = {
	position: "fixed",
	inset: 0,
	border: "none",
	background: "rgba(15, 23, 42, 0.5)",
	backdropFilter: "blur(4px)",
	WebkitBackdropFilter: "blur(4px)",
	animation: "fadeIn 0.15s ease-out",
	padding: 0,
	margin: 0,
	cursor: "default",
};

const dialogBaseStyle = {
	position: "relative",
	background: colors.cardBg,
	borderRadius: radius.xl,
	boxShadow: shadow.modal,
	display: "flex",
	flexDirection: "column",
	maxHeight: "90dvh",
	width: "100%",
	animation: "popIn 0.2s ease-out",
	boxSizing: "border-box",
	overflow: "hidden",
};

const headerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: `${spacing[4]} ${spacing[5]}`,
	borderBottom: `1px solid ${colors.borderSubtle}`,
	flexShrink: 0,
};

const titleStyle = {
	fontSize: font.size.lg,
	fontWeight: font.weight.semibold,
	color: colors.textHeading,
	margin: 0,
	letterSpacing: font.letterSpacing.tight,
	lineHeight: font.lineHeight.tight,
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
};

const closeButtonStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: "36px",
	height: "36px",
	borderRadius: radius.md,
	border: "none",
	background: "transparent",
	color: colors.textMuted,
	cursor: "pointer",
	flexShrink: 0,
	transition: "background 0.15s ease, color 0.15s ease",
};

const bodyStyle = {
	flex: 1,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
	padding: `${spacing[4]} ${spacing[5]}`,
};

const footerStyle = {
	display: "flex",
	justifyContent: "flex-end",
	gap: spacing[2],
	padding: `${spacing[3]} ${spacing[5]}`,
	borderTop: `1px solid ${colors.borderSubtle}`,
	background: colors.pageBg,
	flexShrink: 0,
};

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
	isOpen,
	onClose,
	title,
	icon,
	children,
	footer,
	maxWidth = "520px",
	hideCloseButton = false,
}) {
	const dialogRef = useRef(null);
	const previousFocusRef = useRef(null);

	// Focus trap
	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose?.();
				return;
			}

			if (e.key === "Tab" && dialogRef.current) {
				const focusable = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
				if (focusable.length === 0) {
					e.preventDefault();
					return;
				}
				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (e.shiftKey) {
					if (document.activeElement === first) {
						e.preventDefault();
						last.focus();
					}
				} else {
					if (document.activeElement === last) {
						e.preventDefault();
						first.focus();
					}
				}
			}
		},
		[onClose]
	);

	// Auto-focus and restore focus on close
	useEffect(() => {
		if (!isOpen) return;

		previousFocusRef.current = document.activeElement;

		// Small delay so the dialog is mounted before we try to focus
		const timer = setTimeout(() => {
			if (dialogRef.current) {
				const firstFocusable = dialogRef.current.querySelector(FOCUSABLE_SELECTOR);
				if (firstFocusable) {
					firstFocusable.focus();
				}
			}
		}, 50);

		// Lock body scroll
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			clearTimeout(timer);
			document.body.style.overflow = prev;
			if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
				previousFocusRef.current.focus();
			}
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<div
			style={backdropContainerStyle}
			onKeyDown={handleKeyDown}
		>
			<button
				type="button"
				tabIndex={-1}
				aria-label="Close dialog"
				style={backdropOverlayStyle}
				onClick={onClose}
			/>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
				style={{ ...dialogBaseStyle, maxWidth, zIndex: 1 }}
			>
				{/* Header */}
				{(title || !hideCloseButton) && (
					<div style={headerStyle}>
						<h2 id="modal-title" style={titleStyle}>
							{icon && <span style={{ color: colors.primary, display: "flex" }}>{icon}</span>}
							{title}
						</h2>
						{!hideCloseButton && (
							<button
								type="button"
								onClick={onClose}
								style={closeButtonStyle}
								aria-label="Close"
								onPointerEnter={(e) => {
									e.currentTarget.style.background = colors.borderSubtle;
									e.currentTarget.style.color = colors.textBody;
								}}
								onPointerLeave={(e) => {
									e.currentTarget.style.background = "transparent";
									e.currentTarget.style.color = colors.textMuted;
								}}
							>
								<IconClose size="sm" />
							</button>
						)}
					</div>
				)}

				{/* Body */}
				<div style={bodyStyle}>
					{children}
				</div>

				{/* Footer */}
				{footer && (
					<div style={footerStyle}>
						{footer}
					</div>
				)}
			</div>
		</div>,
		document.body
	);
}

/**
 * Pre-composed Modal sub-components for convenience.
 */
Modal.Header = function ModalHeader({ children, style, ...props }) {
	return <div style={{ ...headerStyle, ...style }} {...props}>{children}</div>;
};

Modal.Body = function ModalBody({ children, style, ...props }) {
	return <div style={{ ...bodyStyle, ...style }} {...props}>{children}</div>;
};

Modal.Footer = function ModalFooter({ children, style, ...props }) {
	return <div style={{ ...footerStyle, ...style }} {...props}>{children}</div>;
};
