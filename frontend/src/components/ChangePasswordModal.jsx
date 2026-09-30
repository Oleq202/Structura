import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	status,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import { Modal, Button, Input } from "./ui";
import { IconKey, IconEye, IconEyeOff, IconCheck } from "./icons";

function PasswordInputWithToggle({
	id,
	label,
	value,
	onChange,
	error,
	placeholder,
	inputRef,
	autoComplete,
}) {
	const [show, setShow] = useState(false);

	return (
		<div style={{ position: "relative" }}>
			<Input
				ref={inputRef}
				id={id}
				label={label}
				type={show ? "text" : "password"}
				value={value}
				onChange={onChange}
				error={error}
				placeholder={placeholder}
				autoComplete={autoComplete}
				required
			/>
			<button
				type="button"
				onClick={() => setShow((prev) => !prev)}
				aria-label={show ? "Ukryj hasło" : "Pokaż hasło"}
				style={{
					position: "absolute",
					right: spacing[2],
					top: "28px",
					background: "none",
					border: "none",
					color: colors.textSecondary,
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "44px",
					height: "44px",
					boxSizing: "border-box",
					padding: 0,
				}}
			>
				{show ? <IconEyeOff size="sm" /> : <IconEye size="sm" />}
			</button>
		</div>
	);
}

function ChangePasswordContent({ onClose, t }) {
	const currentPasswordRef = useRef(null);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => currentPasswordRef.current?.focus(), 50);
		return () => clearTimeout(timer);
	}, []);

	const validate = () => {
		const newErrors = {};

		if (!currentPassword) {
			newErrors.currentPassword = t.currentPasswordRequired || "Aktualne hasło jest wymagane";
		}
		if (!newPassword) {
			newErrors.newPassword = t.newPasswordRequired || "Nowe hasło jest wymagane";
		} else if (newPassword.length < 5) {
			newErrors.newPassword = t.passwordMinLength || "Hasło musi mieć co najmniej 5 znaków";
		} else if (newPassword === currentPassword) {
			newErrors.newPassword = t.passwordSameAsCurrent || "Nowe hasło musi różnić się od aktualnego";
		}

		if (newPassword !== confirmPassword) {
			newErrors.confirmPassword = t.passwordsDoNotMatch || "Hasła nie są identyczne";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		setErrors({});

		try {
			await api.changePassword(currentPassword, newPassword);
			setSuccess(true);
			setTimeout(() => {
				onClose?.();
			}, 1200);
		} catch (err) {
			console.error("Failed to change password:", err);
			setErrors({
				form: err.message || t.invalidCurrentPassword || "Nieprawidłowe aktualne hasło",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			id="change-password-form"
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
				margin: 0,
			}}
		>
			{success && (
				<div
					style={{
						padding: `${spacing[3]} ${spacing[4]}`,
						borderRadius: radius.md,
						background: "#f0fdf4",
						border: "1px solid #86efac",
						color: "#166534",
						display: "flex",
						alignItems: "center",
						gap: spacing[2],
						fontSize: font.size.sm,
						fontWeight: font.weight.semibold,
					}}
				>
					<IconCheck size="sm" />
					<span>{t.passwordChangedSuccess || "Hasło zostało pomyślnie zmienione"}</span>
				</div>
			)}

			{errors.form && (
				<div
					style={{
						padding: `${spacing[2]} ${spacing[3]}`,
						borderRadius: radius.md,
						background: status.danger.bg,
						border: `1px solid ${status.danger.border}`,
						color: status.danger.text,
						fontSize: font.size.xs,
						fontWeight: font.weight.medium,
					}}
				>
					{errors.form}
				</div>
			)}

			<PasswordInputWithToggle
				inputRef={currentPasswordRef}
				id="current-password"
				label={t.currentPassword || "Aktualne hasło"}
				value={currentPassword}
				onChange={(e) => {
					setCurrentPassword(e.target.value);
					if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: "" }));
				}}
				error={errors.currentPassword}
				placeholder={t.enterCurrentPassword || "Wprowadź aktualne hasło"}
				autoComplete="current-password"
			/>

			<PasswordInputWithToggle
				id="new-password"
				label={t.newPassword || "Nowe hasło"}
				value={newPassword}
				onChange={(e) => {
					setNewPassword(e.target.value);
					if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: "" }));
				}}
				error={errors.newPassword}
				placeholder={t.enterNewPassword || "Wprowadź nowe hasło (min. 5 znaków)"}
				autoComplete="new-password"
			/>

			<PasswordInputWithToggle
				id="confirm-password"
				label={t.confirmNewPassword || "Powtórz nowe hasło"}
				value={confirmPassword}
				onChange={(e) => {
					setConfirmPassword(e.target.value);
					if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
				}}
				error={errors.confirmPassword}
				placeholder={t.enterConfirmNewPassword || "Wprowadź ponownie nowe hasło"}
				autoComplete="new-password"
			/>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: spacing[2],
					paddingTop: spacing[3],
					borderTop: `1px solid ${colors.borderSubtle}`,
				}}
			>
				<Button
					variant="secondary"
					size="md"
					disabled={loading || success}
					onClick={onClose}
				>
					{t.cancel || "Anuluj"}
				</Button>
				<Button
					variant="primary"
					size="md"
					type="submit"
					loading={loading}
					disabled={success}
				>
					{loading
						? (t.savingPassword || "Zmienianie hasła...")
						: (t.changePassword || "Zmień hasło")}
				</Button>
			</div>
		</form>
	);
}

export default function ChangePasswordModal({
	isOpen = true,
	onClose,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;

	if (!isOpen) return null;

	const modalTitle = t.changePassword || "Zmień hasło";

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
						background: colors.primaryLight,
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<IconKey size="md" />
				</div>
			}
			maxWidth="440px"
		>
			<ChangePasswordContent onClose={onClose} t={t} />
		</Modal>
	);
}
