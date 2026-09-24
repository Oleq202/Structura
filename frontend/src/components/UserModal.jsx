import {
	useRef,
	useEffect,
	useReducer,
} from "react";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
	components,
	status,
} from "../theme";
import { translations } from "../i18n";

const ICONS = {
	user: (
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
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	),
	close: (
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
	eye: (
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
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	),
	eyeOff: (
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
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</svg>
	),
};

const initialState = (user) => ({
	formData: {
		login: user?.login || "",
		password: "",
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		role: user?.role || "manager",
	},
	passwordChange: {
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	},
	errors: {
		login: "",
		password: "",
		first_name: "",
		last_name: "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	},
	loading: false,
	showPassword: false,
	isChangingPassword: false,
});

function reducer(state, action) {
	switch (action.type) {
		case "SET_FORM_DATA":
			return {
				...state,
				formData: {
					...state.formData,
					...action.payload,
				},
			};
		case "SET_PASSWORD_CHANGE":
			return {
				...state,
				passwordChange: {
					...state.passwordChange,
					...action.payload,
				},
			};
		case "SET_ERRORS":
			return {
				...state,
				errors: {
					...state.errors,
					...action.payload,
				},
			};
		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};
		case "TOGGLE_SHOW_PASSWORD":
			return {
				...state,
				showPassword: !state.showPassword,
			};
		case "TOGGLE_CHANGING_PASSWORD":
			return {
				...state,
				isChangingPassword: !state.isChangingPassword,
			};
		default:
			return state;
	}
}

export default function UserModal({
	user = null,
	onClose,
	onSave,
	language = "pl",
}) {
	const t = translations[language];
	const isEdit = !!user;
	const bodyRef = useRef(null);
	const loginRef = useRef(null);
	const [state, dispatch] = useReducer(reducer, user, initialState);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		if (loginRef.current) {
			loginRef.current.focus();
		}
	}, [user]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose?.();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	const validate = () => {
		const newErrors = {};
		let valid = true;

		if (!state.formData.login.trim()) {
			newErrors.login = t.required;
			valid = false;
		}

		if (!isEdit && !state.formData.password) {
			newErrors.password = t.required;
			valid = false;
		} else if (!isEdit && state.formData.password && state.formData.password.length < 5) {
			newErrors.password = t.passwordMinLength;
			valid = false;
		}

		if (isEdit && state.isChangingPassword) {
			if (!state.passwordChange.currentPassword) {
				newErrors.currentPassword = t.required;
				valid = false;
			}
			if (!state.passwordChange.newPassword) {
				newErrors.newPassword = t.required;
				valid = false;
			} else if (state.passwordChange.newPassword.length < 5) {
				newErrors.newPassword = t.passwordMinLength;
				valid = false;
			}
			if (state.passwordChange.newPassword !== state.passwordChange.confirmPassword) {
				newErrors.confirmPassword = "Passwords do not match";
				valid = false;
			}
		}

		if (!state.formData.first_name.trim()) {
			newErrors.first_name = t.required;
			valid = false;
		}

		if (!state.formData.last_name.trim()) {
			newErrors.last_name = t.required;
			valid = false;
		}

		dispatch({
			type: "SET_ERRORS",
			payload: newErrors,
		});
		return valid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		dispatch({
			type: "SET_LOADING",
			payload: true,
		});

		try {
			const savedUser = {
				login: state.formData.login.trim(),
				first_name: state.formData.first_name.trim(),
				last_name: state.formData.last_name.trim(),
				role: state.formData.role,
			};
			if (!isEdit) {
				savedUser.password = state.formData.password;
			} else {
				savedUser.id = user.id;
				if (state.isChangingPassword) {
					savedUser.currentPassword = state.passwordChange.currentPassword;
					savedUser.password = state.passwordChange.newPassword;
				}
			}
			if (onSave) await onSave(savedUser);
			if (onClose) onClose();
		} catch (err) {
			console.error("Error saving user", err);
		} finally {
			dispatch({
				type: "SET_LOADING",
				payload: false,
			});
		}
	};

	const roles = [
		{ id: "manager", label: t.manager || "Manager" },
		{ id: "contractor", label: t.contractor || "Contractor" },
		{ id: "admin", label: t.admin || "Admin" },
	];

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
				style={{
					background: colors.cardBg,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					border: `1px solid ${colors.borderSubtle}`,
					width: "100%",
					maxWidth: "500px",
					maxHeight: "85vh",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					boxSizing: "border-box",
					fontFamily: font.family.sans,
				}}
				onClick={(e) => e.stopPropagation()}
			>
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
								background: "rgba(255,255,255,0.12)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: colors.primary,
							}}
						>
							{ICONS.user}
						</div>
						<div>
							<h3
								style={{
									margin: 0,
									fontSize: font.size.md,
									fontWeight: font.weight.big,
									color: "#ffffff",
								}}
							>
								{isEdit ? t.editUser : t.createUser}
							</h3>
							<p
								style={{
									margin: "2px 0 0 0",
									fontSize: font.size.xs,
									color: colors.shellTextMuted,
								}}
							>
								{isEdit
									? (user.login || t.settings)
									: (t.addUser || "Fill in account details")}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "rgba(255,255,255,0.08)",
							border: "none",
							borderRadius: radius.full,
							width: "32px",
							height: "32px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							color: colors.shellTextMuted,
							transition: "background 0.15s, color 0.15s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.2)";
							e.currentTarget.style.color = "#ffffff";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.08)";
							e.currentTarget.style.color = colors.shellTextMuted;
						}}
						aria-label={t.close || "Close"}
					>
						{ICONS.close}
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						overflow: "hidden",
						margin: 0,
					}}
				>
					<div
						ref={bodyRef}
						style={{
							padding: `${spacing[4]} ${spacing[5]}`,
							overflowY: "auto",
							flex: 1,
							display: "flex",
							flexDirection: "column",
							gap: spacing[4],
							background: colors.cardBg,
						}}
					>
						<div>
							<label
								style={{
									fontSize: font.size.xs,
									fontWeight: font.weight.big,
									color: colors.textSecondary,
									marginBottom: spacing[1],
									display: "block",
									textTransform: "uppercase",
									letterSpacing: font.letterSpacing.wide,
								}}
							>
								{t.role}
							</label>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: spacing[2],
								}}
							>
								{roles.map((r) => {
									const isSelected = state.formData.role === r.id;
									return (
										<button
											key={r.id}
											type="button"
											onClick={() =>
												dispatch({
													type: "SET_FORM_DATA",
													payload: { role: r.id },
												})
											}
											style={{
												padding: `${spacing[2]} ${spacing[3]}`,
												borderRadius: radius.md,
												border: `1.5px solid ${isSelected ? colors.primary : colors.borderDefault}`,
												background: isSelected ? `${colors.primary}12` : colors.pageBg,
												color: isSelected ? colors.primary : colors.textBody,
												fontWeight: isSelected ? font.weight.big : font.weight.medium,
												fontSize: font.size.xs,
												cursor: "pointer",
												transition: "all 0.15s ease",
												textAlign: "center",
											}}
										>
											{r.label}
										</button>
									);
								})}
							</div>
						</div>

						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing[3] }}>
							<div>
								<label
									style={{
										fontSize: font.size.xs,
										fontWeight: font.weight.big,
										color: colors.textSecondary,
										marginBottom: spacing[1],
										display: "block",
										textTransform: "uppercase",
										letterSpacing: font.letterSpacing.wide,
									}}
								>
									{t.firstName}
								</label>
								<input
									type="text"
									value={state.formData.first_name}
									onChange={(e) =>
										dispatch({
											type: "SET_FORM_DATA",
											payload: { first_name: e.target.value },
										})
									}
									placeholder={t.enterFirstName}
									style={{
										...components.input,
										width: "100%",
										boxSizing: "border-box",
										fontSize: font.size.sm,
										borderRadius: radius.md,
										border: state.errors.first_name
											? `1px solid ${status.danger.border}`
											: `1px solid ${colors.borderDefault}`,
										background: state.errors.first_name
											? status.danger.bg
											: colors.cardBg,
									}}
								/>
								{state.errors.first_name && (
									<p style={{ fontSize: font.size.xs, color: status.danger.text, margin: `${spacing[1]} 0 0 0` }}>
										{state.errors.first_name}
									</p>
								)}
							</div>

							<div>
								<label
									style={{
										fontSize: font.size.xs,
										fontWeight: font.weight.big,
										color: colors.textSecondary,
										marginBottom: spacing[1],
										display: "block",
										textTransform: "uppercase",
										letterSpacing: font.letterSpacing.wide,
									}}
								>
									{t.lastName}
								</label>
								<input
									type="text"
									value={state.formData.last_name}
									onChange={(e) =>
										dispatch({
											type: "SET_FORM_DATA",
											payload: { last_name: e.target.value },
										})
									}
									placeholder={t.enterLastName}
									style={{
										...components.input,
										width: "100%",
										boxSizing: "border-box",
										fontSize: font.size.sm,
										borderRadius: radius.md,
										border: state.errors.last_name
											? `1px solid ${status.danger.border}`
											: `1px solid ${colors.borderDefault}`,
										background: state.errors.last_name
											? status.danger.bg
											: colors.cardBg,
									}}
								/>
								{state.errors.last_name && (
									<p style={{ fontSize: font.size.xs, color: status.danger.text, margin: `${spacing[1]} 0 0 0` }}>
										{state.errors.last_name}
									</p>
								)}
							</div>
						</div>

						<div>
							<label
								style={{
									fontSize: font.size.xs,
									fontWeight: font.weight.big,
									color: colors.textSecondary,
									marginBottom: spacing[1],
									display: "block",
									textTransform: "uppercase",
									letterSpacing: font.letterSpacing.wide,
								}}
							>
								{t.login}
							</label>
							<input
								ref={loginRef}
								type="text"
								value={state.formData.login}
								onChange={(e) =>
									dispatch({
										type: "SET_FORM_DATA",
										payload: { login: e.target.value },
									})
								}
								placeholder={t.enterLogin}
								style={{
									...components.input,
									width: "100%",
									boxSizing: "border-box",
									fontSize: font.size.sm,
									borderRadius: radius.md,
									border: state.errors.login
										? `1px solid ${status.danger.border}`
										: `1px solid ${colors.borderDefault}`,
									background: state.errors.login
										? status.danger.bg
										: colors.cardBg,
								}}
							/>
							{state.errors.login && (
								<p style={{ fontSize: font.size.xs, color: status.danger.text, margin: `${spacing[1]} 0 0 0` }}>
									{state.errors.login}
								</p>
							)}
						</div>

						{!isEdit && (
							<div>
								<label
									style={{
										fontSize: font.size.xs,
										fontWeight: font.weight.big,
										color: colors.textSecondary,
										marginBottom: spacing[1],
										display: "block",
										textTransform: "uppercase",
										letterSpacing: font.letterSpacing.wide,
									}}
								>
									{t.password}
								</label>
								<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
									<input
										type={state.showPassword ? "text" : "password"}
										value={state.formData.password}
										onChange={(e) =>
											dispatch({
												type: "SET_FORM_DATA",
												payload: { password: e.target.value },
											})
										}
										placeholder={t.enterPassword}
										style={{
											...components.input,
											width: "100%",
											boxSizing: "border-box",
											paddingRight: spacing[9],
											fontSize: font.size.sm,
											borderRadius: radius.md,
											border: state.errors.password
												? `1px solid ${status.danger.border}`
												: `1px solid ${colors.borderDefault}`,
											background: state.errors.password
												? status.danger.bg
												: colors.cardBg,
										}}
									/>
									<button
										type="button"
										onClick={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
										style={{
											position: "absolute",
											right: spacing[3],
											background: "none",
											border: "none",
											color: colors.textSecondary,
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											padding: 0,
										}}
									>
										{state.showPassword ? ICONS.eyeOff : ICONS.eye}
									</button>
								</div>
								{state.errors.password && (
									<p style={{ fontSize: font.size.xs, color: status.danger.text, margin: `${spacing[1]} 0 0 0` }}>
										{state.errors.password}
									</p>
								)}
							</div>
						)}

						{isEdit && (
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
									onClick={() => dispatch({ type: "TOGGLE_CHANGING_PASSWORD" })}
									style={{
										background: "none",
										border: "none",
										color: colors.primary,
										fontWeight: font.weight.big,
										fontSize: font.size.xs,
										cursor: "pointer",
										padding: 0,
									}}
								>
									{state.isChangingPassword
										? "✕ Anuluj zmianę hasła"
										: "+ Zmień hasło"}
								</button>

								{state.isChangingPassword && (
									<div style={{ marginTop: spacing[3], display: "flex", flexDirection: "column", gap: spacing[3] }}>
										<div>
											<input
												type="password"
												placeholder="Aktualne hasło"
												value={state.passwordChange.currentPassword}
												onChange={(e) =>
													dispatch({
														type: "SET_PASSWORD_CHANGE",
														payload: { currentPassword: e.target.value },
													})
												}
												style={{
													...components.input,
													width: "100%",
													boxSizing: "border-box",
													fontSize: font.size.sm,
													borderRadius: radius.md,
												}}
											/>
										</div>
										<div>
											<input
												type="password"
												placeholder="Nowe hasło"
												value={state.passwordChange.newPassword}
												onChange={(e) =>
													dispatch({
														type: "SET_PASSWORD_CHANGE",
														payload: { newPassword: e.target.value },
													})
												}
												style={{
													...components.input,
													width: "100%",
													boxSizing: "border-box",
													fontSize: font.size.sm,
													borderRadius: radius.md,
												}}
											/>
										</div>
										<div>
											<input
												type="password"
												placeholder="Powtórz nowe hasło"
												value={state.passwordChange.confirmPassword}
												onChange={(e) =>
													dispatch({
														type: "SET_PASSWORD_CHANGE",
														payload: { confirmPassword: e.target.value },
													})
												}
												style={{
													...components.input,
													width: "100%",
													boxSizing: "border-box",
													fontSize: font.size.sm,
													borderRadius: radius.md,
												}}
											/>
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					<div
						style={{
							padding: `${spacing[3]} ${spacing[5]}`,
							background: colors.pageBg,
							borderTop: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							justifyContent: "flex-end",
							gap: spacing[2],
							flexShrink: 0,
						}}
					>
						<button
							type="button"
							onClick={onClose}
							style={{
								...components.ghostButton,
								padding: `${spacing[2]} ${spacing[4]}`,
								fontSize: font.size.sm,
							}}
						>
							{t.cancel}
						</button>
						<button
							type="submit"
							disabled={state.loading}
							style={{
								...components.primaryButton,
								padding: `${spacing[2]} ${spacing[5]}`,
								fontSize: font.size.sm,
								opacity: state.loading ? 0.6 : 1,
								cursor: state.loading ? "not-allowed" : "pointer",
							}}
						>
							{state.loading
								? t.saving
								: isEdit
									? t.update
									: t.create}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
