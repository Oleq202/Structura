import { useState, useRef, useEffect, useReducer } from "react";
import { colors, font, spacing, radius, shadow } from "../theme";
import { translations } from "../i18n";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
	IconAlertTriangle,
	IconEye,
	IconEyeOff,
	IconGlobe,
} from "../components/icons";

const initialState = {
	login: "",
	password: "",
	loginError: "",
	passwordError: "",
	error: "",
	loading: false,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_LOGIN":
			return { ...state, login: action.payload, loginError: "", error: "" };
		case "SET_PASSWORD":
			return { ...state, password: action.payload, passwordError: "", error: "" };
		case "SET_LOGIN_ERROR":
			return { ...state, loginError: action.payload };
		case "SET_PASSWORD_ERROR":
			return { ...state, passwordError: action.payload };
		case "SET_ERROR":
			return { ...state, error: action.payload };
		case "SET_LOADING":
			return { ...state, loading: action.payload };
		default:
			return state;
	}
}

function LoginForm({ state, dispatch, onSubmit, loginRef, t }) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<form
			onSubmit={onSubmit}
			noValidate
			style={{
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
			}}
		>
			{/* Prominent Red Error Alert Banner */}
			{state.error && (
				<div
					role="alert"
					aria-live="assertive"
					style={{
						background: "#fef2f2",
						border: "1.5px solid #f87171",
						borderRadius: radius.md,
						padding: `${spacing[3]} ${spacing[4]}`,
						display: "flex",
						alignItems: "flex-start",
						gap: spacing[3],
						boxShadow: "0 2px 8px rgba(239, 68, 68, 0.12)",
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
							marginTop: "2px",
						}}
					>
						<IconAlertTriangle size="md" />
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

			{/* Username Field */}
			<Input
				ref={loginRef}
				id="login-username"
				name="username"
				label={t.login}
				type="text"
				autoComplete="username"
				value={state.login}
				onChange={(e) =>
					dispatch({ type: "SET_LOGIN", payload: e.target.value })
				}
				error={state.loginError}
				placeholder={t.yourUsername || "Wprowadź login"}
				required
			/>

			{/* Password Field with Eye Toggle */}
			<div style={{ position: "relative" }}>
				<Input
					id="login-password"
					name="password"
					label={t.password}
					type={showPassword ? "text" : "password"}
					autoComplete="current-password"
					value={state.password}
					onChange={(e) =>
						dispatch({ type: "SET_PASSWORD", payload: e.target.value })
					}
					error={state.passwordError}
					placeholder={t.atLeast5Chars || "Wprowadź hasło"}
					style={{ paddingRight: spacing[12] }}
					required
				/>
				<button
					type="button"
					onClick={() => setShowPassword((prev) => !prev)}
					aria-label={showPassword ? (t.hidePassword || "Ukryj hasło") : (t.showPassword || "Pokaż hasło")}
					style={{
						position: "absolute",
						right: spacing[1],
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
						transition: "color 0.15s ease",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.color = colors.primary;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.color = colors.textSecondary;
					}}
				>
					{showPassword ? <IconEyeOff size="md" /> : <IconEye size="md" />}
				</button>
			</div>

			{/* Submit Button */}
			<Button
				type="submit"
				variant="primary"
				loading={state.loading}
				fullWidth
				size="lg"
				style={{
					minHeight: "48px",
					marginTop: spacing[2],
					fontSize: font.size.base,
					fontWeight: font.weight.big,
				}}
				aria-label={t.signIn}
			>
				{state.loading ? (t.signingIn || "Logowanie...") : (t.signIn || "Zaloguj się")}
			</Button>
		</form>
	);
}

export default function LoginPage({
	onLoginSuccess,
	language = "pl",
	onLanguageChange,
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
		dispatch({ type: "SET_ERROR", payload: "" });
		if (!validate()) return;

		dispatch({ type: "SET_LOADING", payload: true });
		try {
			await onLoginSuccess(state.login.trim(), state.password);
		} catch (err) {
			console.warn("Login failed in LoginPage:", err);
			dispatch({
				type: "SET_ERROR",
				payload: t.loginErrorInvalid || t.wrongEmailOrPassword,
			});
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: colors.pageBg,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: spacing[4],
				boxSizing: "border-box",
				position: "relative",
			}}
		>
			{/* Top-Right Language Switcher */}
			{onLanguageChange && (
				<button
					type="button"
					onClick={() => onLanguageChange()}
					style={{
						position: "absolute",
						top: spacing[4],
						right: spacing[4],
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						padding: "6px 12px",
						minHeight: "44px",
						minWidth: "44px",
						borderRadius: radius.full,
						border: `1px solid ${colors.borderDefault}`,
						background: colors.cardBg,
						color: colors.textSecondary,
						fontSize: font.size.xs,
						fontWeight: font.weight.big,
						cursor: "pointer",
						boxShadow: shadow.sm,
						transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
					}}
					aria-label="Change language"
				>
					<IconGlobe size="xs" />
					<span>{language.toUpperCase()}</span>
				</button>
			)}

			<div
				style={{
					background: colors.cardBg,
					padding: `${spacing[8]} ${spacing[6]}`,
					borderRadius: radius.xl,
					boxShadow: shadow.modal,
					width: "100%",
					maxWidth: "420px",
					display: "flex",
					flexDirection: "column",
					gap: spacing[6],
					boxSizing: "border-box",
					border: `1px solid ${colors.borderSubtle}`,
				}}
			>
				{/* Brand Logo & Title */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: spacing[2],
						textAlign: "center",
					}}
				>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: radius.xl,
							background: colors.surfaceHover || "#f1f5f9",
							border: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: shadow.sm,
							marginBottom: spacing[1],
						}}
					>
						<img
							src="/favicon.png"
							alt="Structura logo"
							style={{ width: 36, height: 36, objectFit: "contain" }}
						/>
					</div>
					<h1
						style={{
							fontSize: "26px",
							fontWeight: font.weight.big,
							color: colors.textHeading,
							margin: 0,
							letterSpacing: font.letterSpacing.tight,
						}}
					>
						Structura
					</h1>
					<p
						style={{
							fontSize: font.size.sm,
							color: colors.textSecondary,
							margin: 0,
							fontWeight: font.weight.normal,
						}}
					>
						{t.appSubtitle || "System Zarządzania Usługami Terenowymi"}
					</p>
				</div>

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
