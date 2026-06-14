import {
	useState,
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

const inputStyle = (hasError, isFocused) => ({
	...components.input,
	boxSizing: "border-box",
	padding: `${spacing[2]} ${spacing[3]}`,
	borderRadius: radius.lg,
	fontSize: font.size.sm,
	fontFamily: font.family.sans,
	border: hasError
		? `1px solid ${status.danger.border}`
		: isFocused
			? `1px solid ${colors.borderStrong}`
			: `1px solid ${colors.borderDefault}`,
	background: hasError
		? status.danger.bg
		: colors.cardBg,
	color: colors.textBody,
	boxShadow:
		isFocused && !hasError
			? shadow.focus
			: "none",
	transition:
		"border-color 0.15s, box-shadow 0.15s",
});

const labelStyle = {
	fontSize: font.size.sm,
	fontFamily: font.family.sans,
	color: colors.textSecondary,
	marginBottom: spacing[1],
	display: "block",
};

const errorStyle = {
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	color: status.danger.text,
	marginTop: spacing[1],
	paddingLeft: spacing[1],
};

const cardContainerStyle = {
	width: "100%",
	maxWidth: "360px",
	background: colors.cardBg,
	borderRadius: radius.xl,
	border: `0.5px solid ${colors.cardBorder}`,
	padding: spacing[8],
	boxShadow: shadow.modal,
};

const headingStyle = {
	fontSize: font.size["2xl"],
	fontWeight: font.weight.medium,
	color: colors.textHeading,
	marginBottom: spacing[6],
	marginTop: 0,
	letterSpacing: font.letterSpacing.tight,
	lineHeight: font.lineHeight.tight,
};

const formStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[5],
};

const formFieldStyle = {
	display: "flex",
	flexDirection: "column",
};

const passwordInputContainerStyle = {
	position: "relative",
	display: "flex",
	alignItems: "center",
};

const passwordInputStyle = (
	hasError,
	isFocused
) => ({
	...inputStyle(hasError, isFocused),
	paddingRight: spacing[10],
});

const togglePasswordButtonStyle = {
	position: "absolute",
	right: spacing[3],
	background: "none",
	border: "none",
	cursor: "pointer",
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	color: colors.textSecondary,
	padding: 0,
	letterSpacing: font.letterSpacing.wide,
	textTransform: "uppercase",
	transition: "color 0.15s",
};

const errorMessageStyle = {
	...errorStyle,
	background: status.danger.bg,
	border: `0.5px solid ${status.danger.border}`,
	borderRadius: radius.md,
	padding: `${spacing[2]} ${spacing[3]}`,
	margin: 0,
};

const submitButtonStyle = (loading) => ({
	...components.primaryButton,
	width: "100%",
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: loading ? "not-allowed" : "pointer",
	opacity: loading ? 0.55 : 1,
	transition:
		"background 0.15s, opacity 0.15s, transform 0.1s",
	boxSizing: "border-box",
});

const initialState = {
	login: "",
	loginError: "",
	passwordError: "",
	password: "",
	error: "",
	loading: false,
	showPassword: false,
	loginFocused: false,
	passwordFocused: false,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_LOGIN":
			return {
				...state,
				login: action.payload,
			};
		case "SET_LOGIN_ERROR":
			return {
				...state,
				loginError: action.payload,
			};
		case "SET_PASSWORD_ERROR":
			return {
				...state,
				passwordError: action.payload,
			};
		case "SET_PASSWORD":
			return {
				...state,
				password: action.payload,
			};
		case "SET_ERROR":
			return {
				...state,
				error: action.payload,
			};
		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};
		case "SET_SHOW_PASSWORD":
			return {
				...state,
				showPassword: action.payload,
			};
		case "TOGGLE_SHOW_PASSWORD":
			return {
				...state,
				showPassword: !state.showPassword,
			};
		case "SET_LOGIN_FOCUSED":
			return {
				...state,
				loginFocused: action.payload,
			};
		case "SET_PASSWORD_FOCUSED":
			return {
				...state,
				passwordFocused: action.payload,
			};
		default:
			return state;
	}
}

export default function LoginPage({
	onLoginSuccess,
	language = "pl",
}) {
	const t = translations[language];
	const loginRef = useRef(null);
	const [state, dispatch] = useReducer(
		reducer,
		initialState
	);

	useEffect(() => {
		loginRef.current.focus();
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
			onLoginSuccess(
				state.login,
				state.password
			);
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

	const togglePassword = () =>
		dispatch({
			type: "TOGGLE_SHOW_PASSWORD",
		});

	return (
		<div
			style={{
				minHeight: "100vh",
				background: colors.pageBg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: `0 ${spacing[4]}`,
				fontFamily: font.family.sans,
			}}
		>
			<div style={cardContainerStyle}>
				<h1 style={headingStyle}>
					{t.signIn}
				</h1>

				<form
					onSubmit={handleSubmit}
					style={formStyle}
				>
					<div style={formFieldStyle}>
						<label style={labelStyle}>
							{t.login}
						</label>
						<input
							style={inputStyle(
								!!state.loginError,
								state.loginFocused
							)}
							ref={loginRef}
							type="text"
							value={state.login}
							onChange={(e) => {
								dispatch({
									type: "SET_LOGIN",
									payload:
										e.target
											.value,
								});
								if (
									state.loginError
								)
									dispatch({
										type: "SET_LOGIN_ERROR",
										payload:
											"",
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
							placeholder={
								t.yourUsername
							}
							aria-label={t.login}
						/>
						{state.loginError && (
							<p style={errorStyle}>
								{state.loginError}
							</p>
						)}
					</div>

					<div style={formFieldStyle}>
						<label style={labelStyle}>
							{t.password}
						</label>
						<div
							style={
								passwordInputContainerStyle
							}
						>
							<input
								style={passwordInputStyle(
									!!state.passwordError,
									state.passwordFocused
								)}
								type={
									state.showPassword
										? "text"
										: "password"
								}
								value={
									state.password
								}
								onChange={(e) => {
									dispatch({
										type: "SET_PASSWORD",
										payload:
											e
												.target
												.value,
									});
									if (
										state.passwordError
									)
										dispatch({
											type: "SET_PASSWORD_ERROR",
											payload:
												"",
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
								placeholder={
									t.atLeast5Chars
								}
								aria-label={
									t.password
								}
							/>
							<button
								type="button"
								onClick={
									togglePassword
								}
								style={
									togglePasswordButtonStyle
								}
								onMouseEnter={(
									e
								) =>
									(e.currentTarget.style.color =
										colors.primary)
								}
								onMouseLeave={(
									e
								) =>
									(e.currentTarget.style.color =
										colors.textSecondary)
								}
								aria-label={
									state.showPassword
										? t.hidePassword
										: t.showPassword
								}
							>
								{state.showPassword
									? t.hide
									: t.show}
							</button>
						</div>
						{state.passwordError && (
							<p style={errorStyle}>
								{
									state.passwordError
								}
							</p>
						)}
					</div>

					{state.error && (
						<p
							style={
								errorMessageStyle
							}
						>
							{state.error}
						</p>
					)}

					<button
						type="submit"
						disabled={state.loading}
						style={submitButtonStyle(
							state.loading
						)}
						onMouseEnter={(e) => {
							if (!state.loading)
								e.currentTarget.style.background =
									colors.primaryHover;
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background =
								colors.primary;
						}}
						onMouseDown={(e) => {
							if (!state.loading)
								e.currentTarget.style.transform =
									"scale(0.97)";
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.transform =
								"scale(1)";
						}}
						aria-label={t.signIn}
					>
						{state.loading
							? t.signingIn
							: t.signIn}
					</button>
				</form>
			</div>
		</div>
	);
}
