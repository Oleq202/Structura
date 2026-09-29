import { useState, useRef, useEffect, useEffectEvent } from "react";
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
import * as api from "../services/api";

const ICONS = {
	lock: (
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
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
	alertTriangle: (
		<svg
			width="18"
			height="18"
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
	checkCircle: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
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

const inputBaseStyle = {
	boxSizing: "border-box",
	width: "100%",
	padding: `${spacing[2]} ${spacing[3]}`,
	paddingRight: spacing[12],
	fontSize: font.size.base,
	borderRadius: radius.md,
	outline: "none",
	background: colors.cardBg,
	color: colors.textHeading,
	fontFamily: font.family.sans,
	transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

const togglePasswordButtonStyle = {
	position: "absolute",
	right: spacing[1],
	background: "none",
	border: "none",
	padding: spacing[1],
	minWidth: "44px",
	minHeight: "44px",
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: font.size.xs,
	color: colors.textSecondary,
	cursor: "pointer",
	fontWeight: font.weight.medium,
	fontFamily: font.family.sans,
};

function PasswordField({
	id,
	label,
	value,
	onChange,
	showPassword,
	onToggleShow,
	placeholder,
	hasError,
	inputRef,
	showLabel,
	hideLabel,
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: spacing[1] }}>
			<label
				htmlFor={id}
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.medium,
					color: colors.textSecondary,
				}}
			>
				{label}
			</label>
			<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
				<input
					id={id}
					ref={inputRef}
					type={showPassword ? "text" : "password"}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					style={{
						...inputBaseStyle,
						border: `1px solid ${hasError ? "#ef4444" : colors.borderDefault}`,
					}}
				/>
				<button
					type="button"
					onClick={onToggleShow}
					style={togglePasswordButtonStyle}
					aria-label={showPassword ? hideLabel : showLabel}
				>
					{showPassword ? hideLabel : showLabel}
				</button>
			</div>
		</div>
	);
}

function ChangePasswordHeader({ title, onClose, loading, closeLabel }) {
	return (
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
			<div style={{ display: "flex", alignItems: "center", gap: spacing[3] }}>
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: radius.md,
						background: "rgba(77, 179, 255, 0.2)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: colors.primary,
						flexShrink: 0,
					}}
				>
					{ICONS.lock}
				</div>
				<h3
					style={{
						margin: 0,
						fontSize: font.size.md,
						fontWeight: font.weight.big,
						letterSpacing: font.letterSpacing.wide,
					}}
				>
					{title}
				</h3>
			</div>
			<button
				type="button"
				onClick={onClose}
				disabled={loading}
				aria-label={closeLabel}
				style={{
					background: "transparent",
					border: "none",
					color: "rgba(255, 255, 255, 0.7)",
					cursor: loading ? "not-allowed" : "pointer",
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
				}}
			>
				{ICONS.close}
			</button>
		</div>
	);
}

function ChangePasswordStatusBanners({ error, success, successMessage }) {
	if (error) {
		return (
			<div
				style={{
					background: "#fef2f2",
					border: "1.5px solid #f87171",
					borderRadius: radius.md,
					padding: `${spacing[2]} ${spacing[3]}`,
					display: "flex",
					alignItems: "center",
					gap: spacing[2],
					color: "#991b1b",
					fontSize: font.size.xs,
					fontWeight: font.weight.medium,
					animation: "shake 0.35s ease-in-out, popIn 0.2s ease-out",
				}}
			>
				<span style={{ color: "#dc2626", flexShrink: 0 }}>
					{ICONS.alertTriangle}
				</span>
				<span>{error}</span>
			</div>
		);
	}

	if (success) {
		return (
			<div
				style={{
					background: status.success.bg,
					border: `1.5px solid ${status.success.border}`,
					borderRadius: radius.md,
					padding: `${spacing[2]} ${spacing[3]}`,
					display: "flex",
					alignItems: "center",
					gap: spacing[2],
					color: status.success.text,
					fontSize: font.size.xs,
					fontWeight: font.weight.bold,
					animation: "popIn 0.2s ease-out",
				}}
			>
				<span style={{ flexShrink: 0 }}>
					{ICONS.checkCircle}
				</span>
				<span>{successMessage}</span>
			</div>
		);
	}

	return null;
}

function ChangePasswordFooter({
	onClose,
	loading,
	success,
	cancelText,
	submitText,
	savingText,
}) {
	return (
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
				disabled={loading}
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
					cursor: loading ? "not-allowed" : "pointer",
				}}
			>
				{cancelText}
			</button>

			<button
				type="submit"
				disabled={loading || success}
				style={{
					background: loading ? `${colors.primary}99` : colors.primary,
					color: "#ffffff",
					border: "none",
					borderRadius: radius.md,
					padding: `${spacing[2]} ${spacing[4]}`,
					minHeight: "44px",
					minWidth: "120px",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					boxSizing: "border-box",
					fontSize: font.size.base,
					fontFamily: font.family.sans,
					fontWeight: font.weight.big,
					cursor: loading || success ? "not-allowed" : "pointer",
					gap: spacing[2],
				}}
			>
				{loading ? (
					<>
						{ICONS.spinner}
						{savingText}
					</>
				) : (
					<>
						{ICONS.lock}
						{submitText}
					</>
				)}
			</button>
		</div>
	);
}

function validatePasswordInputs({ currentPassword, newPassword, confirmPassword, t }) {
	if (!currentPassword) {
		return t.currentPasswordRequired || "Aktualne hasło jest wymagane";
	}
	if (!newPassword) {
		return t.newPasswordRequired || "Nowe hasło jest wymagane";
	}
	if (newPassword.length < 5) {
		return t.passwordMinLength || "Hasło musi mieć co najmniej 5 znaków";
	}
	if (newPassword === currentPassword) {
		return t.passwordSameAsCurrent || "Nowe hasło musi różnić się od aktualnego";
	}
	if (newPassword !== confirmPassword) {
		return t.passwordsDoNotMatch || "Nowe hasła nie są identyczne";
	}
	return null;
}

function parseApiErrorMessage(err, t) {
	const detail = err?.message || "";
	const lower = detail.toLowerCase();
	if (lower.includes("current password") || lower.includes("invalid current")) {
		return t.invalidCurrentPassword || "Nieprawidłowe aktualne hasło";
	}
	if (lower.includes("different")) {
		return t.passwordSameAsCurrent || "Nowe hasło musi różnić się od aktualnego";
	}
	return detail || t.wrongEmailOrPassword || "Wystąpił błąd podczas zmiany hasła";
}

function getFormLabels(t) {
	return {
		show: t.show || "Pokaż",
		hide: t.hide || "Ukryj",
		current: t.currentPassword || "Aktualne hasło",
		enterCurrent: t.enterCurrentPassword || "Wprowadź aktualne hasło",
		newPass: t.newPassword || "Nowe hasło",
		minChars: t.atLeast5Chars || "Co najmniej 5 znaków",
		confirm: t.confirmNewPassword || "Powtórz nowe hasło",
		enterConfirm: t.enterConfirmNewPassword || "Wprowadź ponownie nowe hasło",
		successMsg: t.passwordChangedSuccess || "Hasło zostało pomyślnie zmienione",
		cancel: t.cancel || "Anuluj",
		changePass: t.changePassword || "Zmień hasło",
		saving: t.savingPassword || "Zmienianie hasła...",
	};
}

function useChangePasswordForm(onClose, t) {
	const [form, setForm] = useState({
		current: "",
		newPass: "",
		confirm: "",
	});
	const [visibility, setVisibility] = useState({
		showCurrent: false,
		showNew: false,
		showConfirm: false,
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const currentPasswordRef = useRef(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			currentPasswordRef.current?.focus();
		}, 50);
		return () => clearTimeout(timer);
	}, []);

	const handleChange = (field) => (e) => {
		setForm((prev) => ({ ...prev, [field]: e.target.value }));
		setError("");
	};

	const toggleVisibility = (field) => () => {
		setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		const valErr = validatePasswordInputs({
			currentPassword: form.current,
			newPassword: form.newPass,
			confirmPassword: form.confirm,
			t,
		});
		if (valErr) {
			setError(valErr);
			return;
		}

		setLoading(true);
		try {
			await api.changePassword(form.current, form.newPass);
			setSuccess(true);
			setTimeout(() => {
				onClose?.();
			}, 1400);
		} catch (err) {
			setError(parseApiErrorMessage(err, t));
		} finally {
			setLoading(false);
		}
	};

	return {
		form,
		visibility,
		error,
		success,
		loading,
		currentPasswordRef,
		handleChange,
		toggleVisibility,
		submit,
	};
}

function ChangePasswordForm({ onClose, t }) {
	const labels = getFormLabels(t);
	const {
		form,
		visibility,
		error,
		success,
		loading,
		currentPasswordRef,
		handleChange,
		toggleVisibility,
		submit,
	} = useChangePasswordForm(onClose, t);

	const hasErr = Boolean(error);

	return (
		<form onSubmit={submit} style={{ margin: 0 }}>
			<div
				style={{
					padding: `${spacing[5]} ${spacing[5]}`,
					display: "flex",
					flexDirection: "column",
					gap: spacing[4],
					boxSizing: "border-box",
				}}
			>
				<ChangePasswordStatusBanners
					error={error}
					success={success}
					successMessage={labels.successMsg}
				/>

				<PasswordField
					id="current-password"
					label={labels.current}
					value={form.current}
					onChange={handleChange("current")}
					showPassword={visibility.showCurrent}
					onToggleShow={toggleVisibility("showCurrent")}
					placeholder={labels.enterCurrent}
					hasError={hasErr}
					inputRef={currentPasswordRef}
					showLabel={labels.show}
					hideLabel={labels.hide}
				/>

				<PasswordField
					id="new-password"
					label={labels.newPass}
					value={form.newPass}
					onChange={handleChange("newPass")}
					showPassword={visibility.showNew}
					onToggleShow={toggleVisibility("showNew")}
					placeholder={labels.minChars}
					hasError={hasErr}
					showLabel={labels.show}
					hideLabel={labels.hide}
				/>

				<PasswordField
					id="confirm-password"
					label={labels.confirm}
					value={form.confirm}
					onChange={handleChange("confirm")}
					showPassword={visibility.showConfirm}
					onToggleShow={toggleVisibility("showConfirm")}
					placeholder={labels.enterConfirm}
					hasError={hasErr}
					showLabel={labels.show}
					hideLabel={labels.hide}
				/>
			</div>

			<ChangePasswordFooter
				onClose={onClose}
				loading={loading}
				success={success}
				cancelText={labels.cancel}
				submitText={labels.changePass}
				savingText={labels.saving}
			/>
		</form>
	);
}

function ChangePasswordModalFrame({ title, onClose, closeLabel, children }) {
	const modalRef = useRef(null);

	const handleKeyDownEvent = useEffectEvent((e) => {
		if (e.key === "Escape") {
			onClose?.();
		}
	});

	useEffect(() => {
		const handleKeyDown = (e) => {
			handleKeyDownEvent(e);
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
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
			<button
				type="button"
				aria-label={closeLabel}
				tabIndex={-1}
				onClick={() => onClose?.()}
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
					cursor: "default",
					width: "100%",
					height: "100%",
				}}
			/>

			<div
				ref={modalRef}
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
				<ChangePasswordHeader
					title={title}
					onClose={onClose}
					loading={false}
					closeLabel={closeLabel}
				/>
				{children}
			</div>
		</div>
	);
}

export default function ChangePasswordModal({ isOpen, onClose, language = "pl" }) {
	const t = translations[language] || translations.pl;
	if (!isOpen) return null;

	return createPortal(
		<ChangePasswordModalFrame
			title={t.changePassword || "Zmień hasło"}
			onClose={onClose}
			closeLabel={t.close || "Zamknij"}
		>
			<ChangePasswordForm onClose={onClose} t={t} />
		</ChangePasswordModalFrame>,
		document.body
	);
}
