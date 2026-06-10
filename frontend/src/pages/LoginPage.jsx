import {
	useState,
	useRef,
	useEffect,
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

export default function LoginPage({
	onLoginSuccess,
	language = "pl",
}) {
	const t = translations[language];
	const loginRef = useRef(null);
	const [login, setLogin] = useState("");
	const [loginError, setLoginError] =
		useState("");
	const [passwordError, setPasswordError] =
		useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] =
		useState(false);
	const [loginFocused, setLoginFocused] =
		useState(false);
	const [passwordFocused, setPasswordFocused] =
		useState(false);

	useEffect(() => {
		loginRef.current.focus();
	}, []);

	const validate = () => {
		let valid = true;

		if (!login) {
			setLoginError(t.loginRequired);
			valid = false;
		} else {
			setLoginError("");
		}

		if (!password) {
			setPasswordError(t.passwordRequired);
			valid = false;
		} else if (password.length < 5) {
			setPasswordError(t.passwordMinLength);
			valid = false;
		} else {
			setPasswordError("");
		}
		return valid;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");
		if (!validate()) return;

		setLoading(true);
		try {
			onLoginSuccess(login, password);
		} catch (err) {
			setError(t.wrongEmailOrPassword);
		} finally {
			setLoading(false);
		}
	};

	const togglePassword = () =>
		setShowPassword((v) => !v);

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
			<div
				style={{
					width: "100%",
					maxWidth: "360px",
					background: colors.cardBg,
					borderRadius: radius.xl,
					border: `0.5px solid ${colors.cardBorder}`,
					padding: spacing[8],
					boxShadow: shadow.modal,
				}}
			>
				<h1
					style={{
						fontSize:
							font.size["2xl"],
						fontWeight:
							font.weight.medium,
						color: colors.textHeading,
						marginBottom: spacing[6],
						marginTop: 0,
						letterSpacing:
							font.letterSpacing
								.tight,
						lineHeight:
							font.lineHeight.tight,
					}}
				>
					{t.signIn}
				</h1>

				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						gap: spacing[5],
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection:
								"column",
						}}
					>
						<label style={labelStyle}>
							{t.login}
						</label>
						<input
							style={inputStyle(
								!!loginError,
								loginFocused
							)}
							ref={loginRef}
							type="text"
							value={login}
							onChange={(e) => {
								setLogin(
									e.target.value
								);
								if (loginError)
									setLoginError(
										""
									);
							}}
							onFocus={() =>
								setLoginFocused(
									true
								)
							}
							onBlur={() =>
								setLoginFocused(
									false
								)
							}
							placeholder={
								t.yourUsername
							}
							aria-label={t.login}
						/>
						{loginError && (
							<p style={errorStyle}>
								{loginError}
							</p>
						)}
					</div>

					<div
						style={{
							display: "flex",
							flexDirection:
								"column",
						}}
					>
						<label style={labelStyle}>
							{t.password}
						</label>
						<div
							style={{
								position:
									"relative",
								display: "flex",
								alignItems:
									"center",
							}}
						>
							<input
								style={{
									...inputStyle(
										!!passwordError,
										passwordFocused
									),
									paddingRight:
										spacing[10],
								}}
								type={
									showPassword
										? "text"
										: "password"
								}
								value={password}
								onChange={(e) => {
									setPassword(
										e.target
											.value
									);
									if (
										passwordError
									)
										setPasswordError(
											""
										);
								}}
								onFocus={() =>
									setPasswordFocused(
										true
									)
								}
								onBlur={() =>
									setPasswordFocused(
										false
									)
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
								style={{
									position:
										"absolute",
									right: spacing[3],
									background:
										"none",
									border: "none",
									cursor: "pointer",
									fontSize:
										font.size
											.xs,
									fontFamily:
										font
											.family
											.sans,
									fontWeight:
										font
											.weight
											.medium,
									color: colors.textSecondary,
									padding: 0,
									letterSpacing:
										font
											.letterSpacing
											.wide,
									textTransform:
										"uppercase",
									transition:
										"color 0.15s",
								}}
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
									showPassword
										? t.hidePassword
										: t.showPassword
								}
							>
								{showPassword
									? t.hide
									: t.show}
							</button>
						</div>
						{passwordError && (
							<p style={errorStyle}>
								{passwordError}
							</p>
						)}
					</div>

					{error && (
						<p
							style={{
								...errorStyle,
								background:
									status.danger
										.bg,
								border: `0.5px solid ${status.danger.border}`,
								borderRadius:
									radius.md,
								padding: `${spacing[2]} ${spacing[3]}`,
								margin: 0,
							}}
						>
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						style={{
							...components.primaryButton,
							width: "100%",
							padding: `${spacing[3]} ${spacing[4]}`,
							borderRadius:
								radius.lg,
							fontSize:
								font.size.base,
							fontFamily:
								font.family.sans,
							fontWeight:
								font.weight
									.medium,
							letterSpacing:
								font.letterSpacing
									.wide,
							cursor: loading
								? "not-allowed"
								: "pointer",
							opacity: loading
								? 0.55
								: 1,
							transition:
								"background 0.15s, opacity 0.15s, transform 0.1s",
							boxSizing:
								"border-box",
						}}
						onMouseEnter={(e) => {
							if (!loading)
								e.currentTarget.style.background =
									colors.primaryHover;
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background =
								colors.primary;
						}}
						onMouseDown={(e) => {
							if (!loading)
								e.currentTarget.style.transform =
									"scale(0.97)";
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.transform =
								"scale(1)";
						}}
						aria-label={t.signIn}
					>
						{loading
							? t.signingIn
							: t.signIn}
					</button>
				</form>
			</div>
		</div>
	);
}
