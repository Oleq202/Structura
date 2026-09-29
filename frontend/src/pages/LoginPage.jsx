import { useRef, useEffect, useReducer } from "react";
import { colors, font, spacing, radius, shadow, status } from "../theme";
import { translations } from "../i18n";

const cardContainerStyle = {
	background: colors.cardBg,
	padding: `${spacing[8]} ${spacing[8]}`,
	borderRadius: radius.xl,
	boxShadow: shadow.modal,
	width: "100%",
	maxWidth: "420px",
	display: "flex",
	flexDirection: "column",
	gap: spacing[6],
	boxSizing: "border-box",
	border: `1px solid ${colors.borderSubtle}`,
};

const headingStyle = {
	fontSize: font.size["2xl"] || "24px",
	fontWeight: font.weight.big,
	color: colors.textHeading,
	textAlign: "center",
	margin: 0,
	letterSpacing: font.letterSpacing.tight,
};

const formStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[4],
};

const formFieldStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[2],
};

const labelStyle = {
	fontSize: font.size.sm,
	fontWeight: font.weight.medium,
	color: colors.textSecondary,
};

const inputBaseStyle = {
	boxSizing: "border-box",
	width: "100%",
	padding: `${spacing[3]} ${spacing[4]}`,
	fontSize: font.size.base,
	borderRadius: radius.md,
	outline: "none",
	background: colors.cardBg,
	color: colors.textHeading,
	fontFamily: font.family.sans,
	transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

const inputStyle = (hasError, isFocused) => ({
	...inputBaseStyle,
	border: `1.5px solid ${
		hasError
			? "#ef4444"
			: isFocused
				? colors.primary
				: colors.borderDefault
	}`,
	boxShadow: hasError
		? isFocused
			? "0 0 0 3px rgba(239, 68, 68, 0.25)"
			: "none"
		: isFocused
			? shadow.focus
			: "none",
});

const passwordInputContainerStyle = {
	position: "relative",
	display: "flex",
	alignItems: "center",
};

const passwordInputStyle = (hasError, isFocused) => ({
	...inputBaseStyle,
	paddingRight: spacing[12],
	border: `1.5px solid ${
		hasError
			? "#ef4444"
			: isFocused
				? colors.primary
				: colors.borderDefault
	}`,
	boxShadow: hasError
		? isFocused
			? "0 0 0 3px rgba(239, 68, 68, 0.25)"
			: "none"
		: isFocused
			? shadow.focus
			: "none",
});

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
	fontSize: font.size.sm,
	color: colors.textSecondary,
	cursor: "pointer",
	fontWeight: font.weight.medium,
	fontFamily: font.family.sans,
};

const fieldErrorStyle = {
	color: "#dc2626",
	fontSize: font.size.xs,
	margin: 0,
	fontWeight: font.weight.medium,
};

const submitButtonStyle = (loading) => ({
	background: loading ? `${colors.primary}99` : colors.primary,
	color: "#ffffff",
	border: "none",
	borderRadius: radius.md,
	padding: `${spacing[3]} ${spacing[4]}`,
	minHeight: "44px",
	minWidth: "44px",
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontSize: font.size.base,
	fontWeight: font.weight.big,
	cursor: loading ? "not-allowed" : "pointer",
	marginTop: spacing[2],
	fontFamily: font.family.sans,
	transition: "background-color 0.15s ease, transform 0.1s ease",
});

const ICONS = {
	alertTriangle: (
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
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	),
};

const initialState = {
	login: "",
	password: "",
	showPassword: false,
	loginError: "",
	passwordError: "",
	error: "",
	loading: false,
	loginFocused: false,
	passwordFocused: false,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_LOGIN":
			return { ...state, login: action.payload };
		case "SET_PASSWORD":
			return { ...state, password: action.payload };
		case "TOGGLE_SHOW_PASSWORD":
			return { ...state, showPassword: !state.showPassword };
		case "SET_LOGIN_ERROR":
			return { ...state, loginError: action.payload };
		case "SET_PASSWORD_ERROR":
			return { ...state, passwordError: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "SET_LOADING":
			return { ...state, loading: action.payload };
		case "SET_LOGIN_FOCUSED":
			return { ...state, loginFocused: action.payload };
		case "SET_PASSWORD_FOCUSED":
			return { ...state, passwordFocused: action.payload };
		default:
			return state;
	}
}

function LoginForm({ state, dispatch, onSubmit, loginRef, t }) {
	return (
		<form onSubmit={onSubmit} style={formStyle} noValidate>
			{/* Prominent Red Error Alert Banner ("red thingy") */}
			{state.error && (
				<div
					role="alert"
					aria-live="assertive"
					style={{
						background: "#fef2f2",
						border: "1.5px solid #f87171",
						borderRadius: radius.lg,
						padding: `${spacing[3]} ${spacing[4]}`,
						display: "flex",
						alignItems: "flex-start",
						gap: spacing[3],
						boxShadow: "0 2px 8px rgba(239, 68, 68, 0.12)",
						animation: "shake 0.35s ease-in-out, popIn 0.2s ease-out",
						boxSizing: "border-box",
					}}
				>
					<div
						style={{
							color: "#dc2626",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
							marginTop: "1px",
						}}
					>
						{ICONS.alertTriangle}
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "2px",
							flex: 1,
						}}
					>
						<span
							style={{
								fontSize: font.size.sm,
								fontWeight: font.weight.bold,
								color: "#991b1b",
							}}
						>
							{t.loginErrorTitle || "Błąd logowania"}
						</span>
						<span
							style={{
								fontSize: font.size.xs,
								fontWeight: font.weight.medium,
								color: "#b91c1c",
								lineHeight: font.lineHeight.tight,
							}}
						>
							{state.error}
						</span>
					</div>
				</div>
			)}

			<div style={formFieldStyle}>
				<label htmlFor="login-username" style={labelStyle}>
					{t.login}
				</label>
				<input
					id="login-username"
					style={inputStyle(!!state.loginError || !!state.error, state.loginFocused)}
					ref={loginRef}
					type="text"
					value={state.login}
					onChange={(e) => {
						dispatch({
							type: "SET_LOGIN",
							payload: e.target.value,
						});
						if (state.loginError) {
							dispatch({
								type: "SET_LOGIN_ERROR",
								payload: "",
							});
						}
						if (state.error) {
							dispatch({
								type: "SET_ERROR",
								payload: "",
							});
						}
					}}
					onFocus={() =>
						dispatch({
							type: "SET_LOGIN_FOCUSED",
							payload: true,
						})
					}
					onBlur={() =>
						dispatch({
							type: "SET_LOGIN_FOCUSED",
							payload: false,
						})
					}
					placeholder={t.yourUsername}
					aria-label={t.login}
				/>
				{state.loginError && (
					<p style={fieldErrorStyle}>{state.loginError}</p>
				)}
			</div>

			<div style={formFieldStyle}>
				<label htmlFor="login-password" style={labelStyle}>
					{t.password}
				</label>
				<div style={passwordInputContainerStyle}>
					<input
						id="login-password"
						style={passwordInputStyle(
							!!state.passwordError || !!state.error,
							state.passwordFocused
						)}
						type={state.showPassword ? "text" : "password"}
						value={state.password}
						onChange={(e) => {
							dispatch({
								type: "SET_PASSWORD",
								payload: e.target.value,
							});
							if (state.passwordError) {
								dispatch({
									type: "SET_PASSWORD_ERROR",
									payload: "",
								});
							}
							if (state.error) {
								dispatch({
									type: "SET_ERROR",
									payload: "",
								});
							}
						}}
						onFocus={() =>
							dispatch({
								type: "SET_PASSWORD_FOCUSED",
								payload: true,
							})
						}
						onBlur={() =>
							dispatch({
								type: "SET_PASSWORD_FOCUSED",
								payload: false,
							})
						}
						placeholder={t.atLeast5Chars}
						aria-label={t.password}
					/>
					<button
						type="button"
						onClick={() => dispatch({ type: "TOGGLE_SHOW_PASSWORD" })}
						style={togglePasswordButtonStyle}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color = colors.primary)
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = colors.textSecondary)
						}
						aria-label={
							state.showPassword ? t.hidePassword : t.showPassword
						}
					>
						{state.showPassword ? t.hide : t.show}
					</button>
				</div>
				{state.passwordError && (
					<p style={fieldErrorStyle}>{state.passwordError}</p>
				)}
			</div>

			<button
				type="submit"
				disabled={state.loading}
				style={submitButtonStyle(state.loading)}
				onMouseEnter={(e) => {
					if (!state.loading)
						e.currentTarget.style.background = colors.primaryHover;
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.background = colors.primary;
				}}
				onMouseDown={(e) => {
					if (!state.loading)
						e.currentTarget.style.transform = "scale(0.97)";
				}}
				onMouseUp={(e) => {
					e.currentTarget.style.transform = "scale(1)";
				}}
				aria-label={t.signIn}
			>
				{state.loading ? t.signingIn : t.signIn}
			</button>
		</form>
	);
}

export default function LoginPage({
	onLoginSuccess,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const loginRef = useRef(null);
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		if (loginRef.current) {
			loginRef.current.focus();
		}
	}, []);

	const validate = () => {
		let valid = true;

		if (!state.login.trim()) {
			dispatch({
				type: "SET_LOGIN_ERROR",
				payload: t.loginRequired,
			});
			valid = false;
		} else {
			dispatch({
				type: "SET_LOGIN_ERROR",
				payload: "",
			});
		}

		if (!state.password) {
			dispatch({
				type: "SET_PASSWORD_ERROR",
				payload: t.passwordRequired,
			});
			valid = false;
		} else if (state.password.length < 5) {
			dispatch({
				type: "SET_PASSWORD_ERROR",
				payload: t.passwordMinLength,
			});
			valid = false;
		} else {
			dispatch({
				type: "SET_PASSWORD_ERROR",
				payload: "",
			});
		}

		if (!valid) {
			dispatch({
				type: "SET_ERROR",
				payload: t.loginErrorRequired || t.wrongEmailOrPassword,
			});
		}

		return valid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch({
			type: "SET_ERROR",
			payload: "",
		});
		if (!validate()) return;

		dispatch({
			type: "SET_LOADING",
			payload: true,
		});
		try {
			await onLoginSuccess(state.login.trim(), state.password);
		} catch (err) {
			console.warn("Login failed error in LoginPage:", err);
			dispatch({
				type: "SET_ERROR",
				payload: t.loginErrorInvalid || t.wrongEmailOrPassword,
			});
		} finally {
			dispatch({
				type: "SET_LOADING",
				payload: false,
			});
		}
	};

	return (
		<div
			style={{
				height: "100%",
				minHeight: "100dvh",
				background: colors.pageBg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: `${spacing[4]}`,
				boxSizing: "border-box",
				fontFamily: font.family.sans,
			}}
		>
			<div style={cardContainerStyle}>
				<h1 style={headingStyle}>{t.signIn}</h1>
				<LoginForm
					state={state}
					dispatch={dispatch}
					onSubmit={handleSubmit}
					loginRef={loginRef}
					t={t}
				/>
			</div>
		</div>
	);
}
