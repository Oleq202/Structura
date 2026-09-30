import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	status,
} from "../theme";
import { translations } from "../i18n";
import { Modal, Button, Input } from "./ui";
import { IconUser, IconEye, IconEyeOff } from "./icons";

function RoleSelector({ currentRole, onChange, t }) {
	const roles = [
		{ id: "manager", label: t.manager || "Zarządca" },
		{ id: "contractor", label: t.contractor || "Wykonawca" },
		{ id: "admin", label: t.admin || "Administrator" },
	];

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: spacing[1] }}>
			<span
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.semibold,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.caps,
				}}
			>
				{t.role || "Rola"} *
			</span>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: spacing[2],
				}}
			>
				{roles.map((r) => {
					const isSelected = currentRole === r.id;
					return (
						<button
							key={r.id}
							type="button"
							onClick={() => onChange(r.id)}
							style={{
								padding: `${spacing[2]} ${spacing[2]}`,
								minHeight: "44px",
								minWidth: "44px",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								boxSizing: "border-box",
								borderRadius: radius.md,
								border: `1.5px solid ${isSelected ? colors.primary : colors.borderDefault}`,
								background: isSelected ? `${colors.primary}12` : colors.pageBg,
								color: isSelected ? colors.primary : colors.textBody,
								fontWeight: isSelected ? font.weight.semibold : font.weight.medium,
								fontSize: font.size.sm,
								cursor: "pointer",
								transition: "background-color 0.15s ease, border-color 0.15s ease",
								textAlign: "center",
							}}
						>
							{r.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function validateUserFields({ formData, isEdit, isChangingPassword, passwordChange, t }) {
	const newErrors = {};

	if (!formData.login.trim()) {
		newErrors.login = t.required || "Pole wymagane";
	}
	if (!formData.first_name.trim()) {
		newErrors.first_name = t.required || "Pole wymagane";
	}
	if (!formData.last_name.trim()) {
		newErrors.last_name = t.required || "Pole wymagane";
	}

	if (!isEdit) {
		if (!formData.password) {
			newErrors.password = t.required || "Pole wymagane";
		} else if (formData.password.length < 5) {
			newErrors.password = t.passwordMinLength || "Hasło musi mieć co najmniej 5 znaków";
		}
	}

	if (isEdit && isChangingPassword) {
		if (!passwordChange.currentPassword) {
			newErrors.currentPassword = t.currentPasswordRequired || t.required || "Pole wymagane";
		}
		if (!passwordChange.newPassword) {
			newErrors.newPassword = t.newPasswordRequired || t.required || "Pole wymagane";
		} else if (passwordChange.newPassword.length < 5) {
			newErrors.newPassword = t.passwordMinLength || "Hasło musi mieć co najmniej 5 znaków";
		} else if (passwordChange.newPassword === passwordChange.currentPassword) {
			newErrors.newPassword = t.passwordSameAsCurrent || "Nowe hasło musi różnić się od aktualnego";
		}
		if (passwordChange.newPassword !== passwordChange.confirmPassword) {
			newErrors.confirmPassword = t.passwordsDoNotMatch || "Hasła nie są identyczne";
		}
	}

	return newErrors;
}

function PasswordToggleInput({
	id,
	label,
	value,
	onChange,
	error,
	placeholder,
	autoComplete,
	required = false,
	t,
}) {
	const [show, setShow] = useState(false);

	return (
		<div style={{ position: "relative" }}>
			<Input
				id={id}
				label={label}
				type={show ? "text" : "password"}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				error={error}
				autoComplete={autoComplete}
				required={required}
			/>
			<button
				type="button"
				onClick={() => setShow((prev) => !prev)}
				aria-label={show ? (t.hidePassword || "Ukryj hasło") : (t.showPassword || "Pokaż hasło")}
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

function PasswordChangeSection({
	isChangingPassword,
	onToggle,
	passwordChange,
	onChangeField,
	errors,
	t,
}) {
	return (
		<div
			style={{
				border: `1px solid ${colors.borderSubtle}`,
				borderRadius: radius.md,
				padding: spacing[3],
				background: colors.pageBg,
			}}
		>
			<button
				type="button"
				onClick={onToggle}
				style={{
					background: "none",
					border: "none",
					color: colors.primary,
					fontWeight: font.weight.semibold,
					fontSize: font.size.sm,
					cursor: "pointer",
					padding: 0,
					minHeight: "44px",
					display: "inline-flex",
					alignItems: "center",
					boxSizing: "border-box",
				}}
			>
				{isChangingPassword
					? (t.cancelPasswordChange || "✕ Anuluj zmianę hasła")
					: (t.changeUserPassword || "+ Zmień hasło użytkownika")}
			</button>

			{isChangingPassword && (
				<div style={{ marginTop: spacing[3], display: "flex", flexDirection: "column", gap: spacing[3] }}>
					<PasswordToggleInput
						id="user-current-password"
						label={t.currentPassword || "Aktualne hasło"}
						placeholder={t.enterCurrentPassword || "Wprowadź aktualne hasło"}
						value={passwordChange.currentPassword}
						onChange={(e) => onChangeField("currentPassword", e.target.value)}
						error={errors.currentPassword}
						autoComplete="current-password"
						t={t}
					/>
					<PasswordToggleInput
						id="user-new-password"
						label={t.newPassword || "Nowe hasło"}
						placeholder={t.enterNewPassword || "Nowe hasło (min. 5 znaków)"}
						value={passwordChange.newPassword}
						onChange={(e) => onChangeField("newPassword", e.target.value)}
						error={errors.newPassword}
						autoComplete="new-password"
						t={t}
					/>
					<PasswordToggleInput
						id="user-confirm-password"
						label={t.confirmNewPassword || "Powtórz nowe hasło"}
						placeholder={t.confirmNewPasswordPlaceholder || "Powtórz nowe hasło"}
						value={passwordChange.confirmPassword}
						onChange={(e) => onChangeField("confirmPassword", e.target.value)}
						error={errors.confirmPassword}
						autoComplete="new-password"
						t={t}
					/>
				</div>
			)}
		</div>
	);
}

function useUserForm({
	user,
	isEdit,
	onClose,
	onSave,
	setLoadingState,
	t,
}) {
	const loginInputRef = useRef(null);
	const [formData, setFormData] = useState({
		login: user?.login || "",
		password: "",
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		role: user?.role || "contractor",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [passwordChange, setPasswordChange] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => loginInputRef.current?.focus(), 50);
		return () => clearTimeout(timer);
	}, []);

	const handleFieldChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handlePasswordChangeField = (field, value) => {
		setPasswordChange((prev) => ({ ...prev, [field]: value }));
		if (errors[field] || errors.form) {
			setErrors((prev) => ({ ...prev, [field]: "", form: "" }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validateUserFields({
			formData,
			isEdit,
			isChangingPassword,
			passwordChange,
			t,
		});

		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setLoading(true);
		setLoadingState?.(true);

		try {
			const savedUser = {
				login: formData.login.trim(),
				first_name: formData.first_name.trim(),
				last_name: formData.last_name.trim(),
				role: formData.role,
			};

			if (!isEdit) {
				savedUser.password = formData.password;
			} else {
				savedUser.id = user.id;
				if (isChangingPassword) {
					savedUser.current_password = passwordChange.currentPassword;
					savedUser.currentPassword = passwordChange.currentPassword;
					savedUser.password = passwordChange.newPassword;
				}
			}

			if (onSave) await onSave(savedUser);
			if (onClose) onClose();
		} catch (err) {
			console.error("Error saving user", err);
			const errMsg = err?.message || (t.failedToSaveUser || "Błąd zapisu użytkownika");
			const lower = errMsg.toLowerCase();
			if (lower.includes("aktualne") || lower.includes("current password")) {
				setErrors({ currentPassword: t.invalidCurrentPassword || errMsg });
			} else if (lower.includes("różnić") || lower.includes("different") || lower.includes("same")) {
				setErrors({ newPassword: t.passwordSameAsCurrent || errMsg });
			} else {
				setErrors({ form: errMsg });
			}
		} finally {
			setLoading(false);
			setLoadingState?.(false);
		}
	};

	return {
		loginInputRef,
		formData,
		showPassword,
		setShowPassword,
		isChangingPassword,
		setIsChangingPassword,
		passwordChange,
		errors,
		loading,
		handleFieldChange,
		handlePasswordChangeField,
		handleSubmit,
	};
}

function NewPasswordInput({
	password,
	onChange,
	error,
	showPassword,
	onToggleShowPassword,
	t,
}) {
	return (
		<div style={{ position: "relative" }}>
			<Input
				label={t.password || "Hasło"}
				type={showPassword ? "text" : "password"}
				placeholder={t.enterPassword || "Wprowadź hasło (min. 5 znaków)"}
				value={password}
				onChange={onChange}
				error={error}
				autoComplete="new-password"
				required
			/>
			<button
				type="button"
				onClick={onToggleShowPassword}
				aria-label={showPassword ? (t.hidePassword || "Ukryj hasło") : (t.showPassword || "Pokaż hasło")}
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
				{showPassword ? <IconEyeOff size="sm" /> : <IconEye size="sm" />}
			</button>
		</div>
	);
}

function UserFormFooter({ loading, isEdit, onClose, t }) {
	const submitLabel = loading
		? (t.saving || "Zapisywanie...")
		: isEdit
			? (t.update || "Zaktualizuj")
			: (t.create || "Utwórz");

	return (
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
				disabled={loading}
				onClick={onClose}
			>
				{t.cancel || "Anuluj"}
			</Button>
			<Button
				variant="primary"
				size="md"
				type="submit"
				loading={loading}
			>
				{submitLabel}
			</Button>
		</div>
	);
}

function UserFormContent({
	user,
	isEdit,
	onClose,
	onSave,
	setLoadingState,
	t,
}) {
	const {
		loginInputRef,
		formData,
		showPassword,
		setShowPassword,
		isChangingPassword,
		setIsChangingPassword,
		passwordChange,
		errors,
		loading,
		handleFieldChange,
		handlePasswordChangeField,
		handleSubmit,
	} = useUserForm({
		user,
		isEdit,
		onClose,
		onSave,
		setLoadingState,
		t,
	});

	return (
		<form
			id="user-form"
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
				margin: 0,
			}}
		>
			{errors.form && (
				<div
					style={{
						padding: `${spacing[2]} ${spacing[3]}`,
						borderRadius: "6px",
						background: status.danger.bg,
						border: `1px solid ${status.danger.border}`,
						color: status.danger.text,
						fontSize: font.size.xs,
					}}
				>
					{errors.form}
				</div>
			)}

			<RoleSelector
				currentRole={formData.role}
				onChange={(role) => handleFieldChange("role", role)}
				t={t}
			/>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[3] }}>
				<Input
					label={t.firstName || "Imię"}
					placeholder={t.enterFirstName || "Wprowadź imię"}
					value={formData.first_name}
					onChange={(e) => handleFieldChange("first_name", e.target.value)}
					error={errors.first_name}
					autoComplete="given-name"
					required
				/>

				<Input
					label={t.lastName || "Nazwisko"}
					placeholder={t.enterLastName || "Wprowadź nazwisko"}
					value={formData.last_name}
					onChange={(e) => handleFieldChange("last_name", e.target.value)}
					error={errors.last_name}
					autoComplete="family-name"
					required
				/>
			</div>

			<Input
				ref={loginInputRef}
				label={t.login || "Login"}
				placeholder={t.enterLogin || "Wprowadź login"}
				value={formData.login}
				onChange={(e) => handleFieldChange("login", e.target.value)}
				error={errors.login}
				autoComplete="username"
				required
			/>

			{!isEdit ? (
				<NewPasswordInput
					password={formData.password}
					onChange={(e) => handleFieldChange("password", e.target.value)}
					error={errors.password}
					showPassword={showPassword}
					onToggleShowPassword={() => setShowPassword((prev) => !prev)}
					t={t}
				/>
			) : (
				<PasswordChangeSection
					isChangingPassword={isChangingPassword}
					onToggle={() => setIsChangingPassword((prev) => !prev)}
					passwordChange={passwordChange}
					onChangeField={handlePasswordChangeField}
					errors={errors}
					t={t}
				/>
			)}

			<UserFormFooter
				loading={loading}
				isEdit={isEdit}
				onClose={onClose}
				t={t}
			/>
		</form>
	);
}

export default function UserModal({
	user = null,
	onClose,
	onSave,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const isEdit = !!user?.id;
	const [loading, setLoading] = useState(false);

	if (!onClose) return null;

	const modalTitle = (
		<div>
			<div style={{ fontSize: font.size.lg, fontWeight: font.weight.semibold }}>
				{isEdit ? t.editUser || "Edytuj użytkownika" : t.createUser || "Dodaj użytkownika"}
			</div>
			{isEdit && user?.login && (
				<div style={{ fontSize: font.size.xs, color: colors.textSecondary, marginTop: "2px" }}>
					@{user.login}
				</div>
			)}
		</div>
	);

	return (
		<Modal
			isOpen={true}
			onClose={loading ? undefined : onClose}
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
					<IconUser size="md" />
				</div>
			}
			maxWidth="480px"
		>
			<UserFormContent
				key={user?.id || "new"}
				user={user}
				isEdit={isEdit}
				onClose={onClose}
				onSave={onSave}
				setLoadingState={setLoading}
				t={t}
			/>
		</Modal>
	);
}
