/**
 * Toast — Lightweight notification component for Structura.
 *
 * Provides feedback for asynchronous actions (saving, completing tasks, errors).
 * Fully accessible with aria-live and role="status" / "alert".
 */
import { useState, useCallback, useMemo } from "react";
import { colors, font, radius, shadow, spacing } from "../../theme";
import { IconCheck, IconAlertTriangle, IconClose } from "../icons";
import { ToastContext } from "../../context/ToastContext";

let toastIdCounter = 0;

export default function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const addToast = useCallback((message, type = "info", duration = 3500) => {
		const id = ++toastIdCounter;
		const newToast = { id, message, type };

		setToasts((prev) => [...prev, newToast]);

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}

		return id;
	}, [removeToast]);

	const contextValue = useMemo(() => ({
		toast: {
			show: (msg, type, duration) => addToast(msg, type, duration),
			success: (msg, duration) => addToast(msg, "success", duration),
			error: (msg, duration) => addToast(msg, "error", duration),
			info: (msg, duration) => addToast(msg, "info", duration),
			dismiss: (id) => removeToast(id),
		},
	}), [addToast, removeToast]);

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<ToastContainer toasts={toasts} onDismiss={removeToast} />
		</ToastContext.Provider>
	);
}

const TYPE_CONFIG = {
	success: {
		bg: "#f0fdf4",
		border: "#86efac",
		text: "#166534",
		icon: <IconCheck size="sm" style={{ color: "#16a34a" }} />,
		role: "status",
	},
	error: {
		bg: "#fef2f2",
		border: "#fca5a5",
		text: "#991b1b",
		icon: <IconAlertTriangle size="sm" style={{ color: "#dc2626" }} />,
		role: "alert",
	},
	info: {
		bg: "#eff6ff",
		border: "#93c5fd",
		text: "#1e40af",
		icon: <IconAlertTriangle size="sm" style={{ color: colors.primary }} />,
		role: "status",
	},
};

function ToastContainer({ toasts, onDismiss }) {
	if (toasts.length === 0) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: "env(safe-area-inset-top, 16px)",
				right: "16px",
				left: "16px",
				maxWidth: "420px",
				margin: "0 auto",
				zIndex: 99999,
				display: "flex",
				flexDirection: "column",
				gap: spacing[2],
				pointerEvents: "none",
			}}
		>
			{toasts.map((item) => {
				const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
				return (
					<div
						key={item.id}
						role={config.role}
						aria-live={item.type === "error" ? "assertive" : "polite"}
						style={{
							pointerEvents: "auto",
							background: config.bg,
							border: `1.5px solid ${config.border}`,
							color: config.text,
							borderRadius: radius.md,
							padding: `${spacing[3]} ${spacing[4]}`,
							boxShadow: shadow.modal,
							display: "flex",
							alignItems: "center",
							gap: spacing[3],
							fontFamily: font.family.sans,
							animation: "popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
						}}
					>
						<div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
							{config.icon}
						</div>
						<div
							style={{
								flex: 1,
								fontSize: font.size.sm,
								fontWeight: font.weight.medium,
								lineHeight: 1.4,
							}}
						>
							{item.message}
						</div>
						<button
							type="button"
							onClick={() => onDismiss(item.id)}
							aria-label="Zamknij powiadomienie"
							style={{
								background: "transparent",
								border: "none",
								color: config.text,
								cursor: "pointer",
								padding: "4px",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: radius.sm,
								opacity: 0.7,
								minWidth: "32px",
								minHeight: "32px",
								transition: "opacity 0.15s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.opacity = "1";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.opacity = "0.7";
							}}
						>
							<IconClose size="xs" />
						</button>
					</div>
				);
			})}
		</div>
	);
}
