import { useRef, useEffect, useReducer } from "react";
import { colors, font, spacing, radius, shadow } from "../theme";
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
	gap: spacing[5],
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
	border: `1px solid ${
		hasError
			? colors.danger
			: isFocused
				? colors.primary
				: colors.borderDefault
	}`,
	boxShadow: isFocused ? shadow.focus : "none",
});

const passwordInputContainerStyle = {
	position: "relative",
	display: "flex",
	alignItems: "center",
};

const passwordInputStyle = (hasError, isFocused) => ({
	...inputBaseStyle,
	paddingRight: spacing[12],
	border: `1px solid ${
		hasError
			? colors.danger
			: isFocused
				? colors.primary
				: colors.borderDefault
	}`,
	boxShadow: isFocused ? shadow.focus : "none",
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

const errorStyle = {
	color: colors.danger,
	fontSize: font.size.xs,
	margin: 0,
	fontWeight: font.weight.medium,
};

const errorMessageStyle = {
	color: colors.danger,
	fontSize: font.size.sm,
	margin: 0,
	textAlign: "center",
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
		<form onSubmit={onSubmit} style={formStyle}>
			<div style={formFieldStyle}>
				<label htmlFor="login-username" style={labelStyle}>
					{t.login}
				</label>
				<input
					id="login-username"
					style={inputStyle(!!state.loginError, state.loginFocused)}
					ref={loginRef}
					type="text"
					value={state.login}
					onChange={(e) => {
						dispatch({
							type: "SET_LOGIN",
							payload: e.target.value,
						});
						if (state.loginError)
							dispatch({
								type: "SET_LOGIN_ERROR",
								payload: "",
							});
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
					<p style={errorStyle}>{state.loginError}</p>
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
							!!state.passwordError,
							state.passwordFocused
						)}
						type={state.showPassword ? "text" : "password"}
						value={state.password}
						onChange={(e) => {
							dispatch({
								type: "SET_PASSWORD",
								payload: e.target.value,
							});
							if (state.passwordError)
								dispatch({
									type: "SET_PASSWORD_ERROR",
									payload: "",
								});
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
					<p style={errorStyle}>{state.passwordError}</p>
				)}
			</div>

			{state.error && <p style={errorMessageStyle}>{state.error}</p>}

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

		if (!state.login) {
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
		return valid;
	};

	const handleSubmit = (e) => {
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
			onLoginSuccess(state.login, state.password);
		} catch (err) {
			dispatch({
				type: "SET_ERROR",
				payload: t.wrongEmailOrPassword,
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
