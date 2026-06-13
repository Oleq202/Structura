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

const EMPTY_BUILDINGS = [];

const initialState = (user) => ({
	formData: {
		login: user?.login || "",
		password: "",
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		role: user?.role || "manager",
		assignedBuildings:
			user?.assignedBuildings || [],
	},
	errors: {
		login: "",
		password: "",
		first_name: "",
		last_name: "",
	},
	focused: {
		login: false,
		password: false,
		first_name: false,
		last_name: false,
		buildingSearch: false,
	},
	loading: false,
	buildingSearch: "",
	showPassword: false,
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
		case "SET_ERRORS":
			return {
				...state,
				errors: {
					...state.errors,
					...action.payload,
				},
			};
		case "SET_FOCUSED":
			return {
				...state,
				focused: {
					...state.focused,
					...action.payload,
				},
			};
		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};
		case "SET_BUILDING_SEARCH":
			return {
				...state,
				buildingSearch: action.payload,
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
		case "TOGGLE_BUILDING_ASSIGNMENT":
			const buildingId = action.payload;
			const assignedBuildings =
				state.formData.assignedBuildings.includes(
					buildingId
				)
					? state.formData.assignedBuildings.filter(
							(id) =>
								id !== buildingId
						)
					: [
							...state.formData
								.assignedBuildings,
							buildingId,
						];
			return {
				...state,
				formData: {
					...state.formData,
					assignedBuildings,
				},
			};
		default:
			return state;
	}
}

const modalOverlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	width: "100vw",
	height: "100vh",
	background: "rgba(0, 0, 0, 0.4)",
	backdropFilter: "blur(6px)",
	WebkitBackdropFilter: "blur(6px)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: `0 ${spacing[4]}`,
	boxSizing: "border-box",
	zIndex: 10000,
};

const modalContentStyle = {
	width: "100%",
	maxWidth: "400px",
	maxHeight: "90vh",
	overflowY: "auto",
	background: colors.cardBg,
	borderRadius: radius.xl,
	border: `0.5px solid ${colors.cardBorder}`,
	padding: spacing[8],
	boxShadow: shadow.modal,
	boxSizing: "border-box",
	position: "relative",
};

const closeButtonStyle = {
	position: "absolute",
	top: spacing[4],
	right: spacing[4],
	background: "transparent",
	border: "none",
	color: colors.textSecondary,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	padding: spacing[1],
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

const buttonGroupStyle = {
	display: "flex",
	gap: spacing[3],
	marginTop: spacing[2],
};

const cancelButtonStyle = {
	flex: 1,
	background: "transparent",
	border: `1px solid ${colors.borderDefault}`,
	color: colors.textBody,
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	boxSizing: "border-box",
};

const buildingListStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[2],
	maxHeight: "150px",
	overflowY: "auto",
	paddingRight: spacing[1],
};

const noResultsStyle = {
	fontSize: font.size.sm,
	color: colors.textSecondary,
	padding: spacing[2],
	textAlign: "center",
};

const buildingLabelStyle = {
	display: "flex",
	alignItems: "center",
	gap: spacing[2],
	fontSize: font.size.sm,
	color: colors.textBody,
	cursor: "pointer",
	padding: spacing[1],
	borderRadius: radius.sm,
	transition: "background 0.15s",
};

const passwordToggleButtonStyle = {
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

const submitButtonBaseStyle = {
	...components.primaryButton,
	flex: 2,
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	transition:
		"background 0.15s, opacity 0.15s, transform 0.1s",
	boxSizing: "border-box",
};

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

const errorStyle = {
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	color: status.danger.text,
	marginTop: spacing[1],
	paddingLeft: spacing[1],
};

const labelStyle = {
	fontSize: font.size.sm,
	fontFamily: font.family.sans,
	color: colors.textSecondary,
	marginBottom: spacing[1],
	display: "block",
};

export default function UserModal({
	user = null,
	buildings = EMPTY_BUILDINGS,
	onClose,
	onSave,
	language,
}) {
	const t = translations[language];
	const loginRef = useRef(null);
	const isEdit = !!user;

	const [state, dispatch] = useReducer(
		reducer,
		initialState(user)
	);

	useEffect(() => {
		if (loginRef.current) {
			loginRef.current.focus();
		}
	}, []);

	const validate = () => {
		const newErrors = {};
		let valid = true;

		if (!state.formData.login) {
			newErrors.login = t.required;
			valid = false;
		}

		if (!isEdit && !state.formData.password) {
			newErrors.password = t.required;
			valid = false;
		} else if (
			state.formData.password &&
			state.formData.password.length < 6
		) {
			newErrors.password =
				t.passwordMinLength;
			valid = false;
		}

		if (!state.formData.first_name) {
			newErrors.first_name = t.required;
			valid = false;
		}

		if (!state.formData.last_name) {
			newErrors.last_name = t.required;
			valid = false;
		}

		dispatch({
			type: "SET_ERRORS",
			payload: newErrors,
		});
		return valid;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;

		dispatch({
			type: "SET_LOADING",
			payload: true,
		});
		try {
			const savedUser = {
				login: state.formData.login,
				first_name:
					state.formData.first_name,
				last_name:
					state.formData.last_name,
				role: state.formData.role,
			};
			if (!isEdit) {
				savedUser.password =
					state.formData.password;
			} else {
				savedUser.id = user.id;
			}
			console.log(
				isEdit
					? "Updating user:"
					: "Creating user:",
				savedUser
			);
			if (onSave) onSave(savedUser);
			if (onClose) onClose();
		} catch (err) {
			console.error(
				"Error saving user",
				err
			);
		} finally {
			dispatch({
				type: "SET_LOADING",
				payload: false,
			});
		}
	};

	const toggleBuildingAssignment = (
		building_id
	) => {
		dispatch({
			type: "TOGGLE_BUILDING_ASSIGNMENT",
			payload: building_id,
		});
	};

	const filteredBuildings = buildings.filter(
		(building) => {
			const search =
				state.buildingSearch.toLowerCase();
			return (
				building.city
					.toLowerCase()
					.includes(search) ||
				building.district
					?.toLowerCase()
					.includes(search) ||
				building.street_address
					.toLowerCase()
					.includes(search)
			);
		}
	);

	const togglePassword = () =>
		dispatch({
			type: "TOGGLE_SHOW_PASSWORD",
		});

	return (
		<div
			role="button"
			tabIndex={0}
			style={modalOverlayStyle}
			onClick={() => onClose?.()}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					onClose?.();
				}
			}}
		>
			<div
				style={modalContentStyle}
				onClick={(e) =>
					e.stopPropagation()
				}
			>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClose?.();
					}}
					style={closeButtonStyle}
					aria-label={t.close}
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
					>
						<line
							x1="18"
							y1="6"
							x2="6"
							y2="18"
						></line>
						<line
							x1="6"
							y1="6"
							x2="18"
							y2="18"
						></line>
					</svg>
				</button>

				<h1 style={headingStyle}>
					{isEdit
						? t.editUser
						: t.createUser}
				</h1>
				<form
					onSubmit={handleSubmit}
					style={formStyle}
				>
					<div>
						<label style={labelStyle}>
							{t.login}
						</label>
						<input
							style={inputStyle(
								!!state.errors
									.login,
								state.focused
									.login
							)}
							ref={loginRef}
							type="text"
							value={
								state.formData
									.login
							}
							onChange={(e) => {
								dispatch({
									type: "SET_FORM_DATA",
									payload: {
										login: e
											.target
											.value,
									},
								});
								if (
									state.errors
										.login
								)
									dispatch({
										type: "SET_ERRORS",
										payload: {
											login: "",
										},
									});
							}}
							onFocus={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										login: true,
									},
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										login: false,
									},
								})
							}
							placeholder={
								t.enterLogin
							}
							aria-label={t.login}
						/>
						{state.errors.login && (
							<p style={errorStyle}>
								{
									state.errors
										.login
								}
							</p>
						)}
					</div>

					{!isEdit && (
						<div>
							<label
								style={labelStyle}
							>
								{t.password}
							</label>
							<div
								style={{
									position:
										"relative",
									display:
										"flex",
									alignItems:
										"center",
								}}
							>
								<input
									style={{
										...inputStyle(
											!!state
												.errors
												.password,
											state
												.focused
												.password
										),
										paddingRight:
											spacing[10],
									}}
									type={
										state.showPassword
											? "text"
											: "password"
									}
									value={
										state
											.formData
											.password
									}
									onChange={(
										e
									) => {
										dispatch({
											type: "SET_FORM_DATA",
											payload:
												{
													password:
														e
															.target
															.value,
												},
										});
										if (
											state
												.errors
												.password
										)
											dispatch(
												{
													type: "SET_ERRORS",
													payload:
														{
															password:
																"",
														},
												}
											);
									}}
									onFocus={() =>
										dispatch({
											type: "SET_FOCUSED",
											payload:
												{
													password: true,
												},
										})
									}
									onBlur={() =>
										dispatch({
											type: "SET_FOCUSED",
											payload:
												{
													password: false,
												},
										})
									}
									placeholder={
										t.enterPassword
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
										passwordToggleButtonStyle
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
											? t.hide
											: t.show
									}
								>
									{state.showPassword
										? t.hide
										: t.show}
								</button>
							</div>
							{state.errors
								.password && (
								<p
									style={
										errorStyle
									}
								>
									{
										state
											.errors
											.password
									}
								</p>
							)}
						</div>
					)}

					<div>
						<label style={labelStyle}>
							{t.firstName}
						</label>
						<input
							style={inputStyle(
								!!state.errors
									.first_name,
								state.focused
									.first_name
							)}
							type="text"
							value={
								state.formData
									.first_name
							}
							onChange={(e) => {
								dispatch({
									type: "SET_FORM_DATA",
									payload: {
										first_name:
											e
												.target
												.value,
									},
								});
								if (
									state.errors
										.first_name
								)
									dispatch({
										type: "SET_ERRORS",
										payload: {
											first_name:
												"",
										},
									});
							}}
							onFocus={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										first_name: true,
									},
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										first_name: false,
									},
								})
							}
							placeholder={
								t.enterFirstName
							}
							aria-label={
								t.first_name
							}
						/>
						{state.errors
							.first_name && (
							<p style={errorStyle}>
								{
									state.errors
										.first_name
								}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.lastName}
						</label>
						<input
							style={inputStyle(
								!!state.errors
									.last_name,
								state.focused
									.last_name
							)}
							type="text"
							value={
								state.formData
									.last_name
							}
							onChange={(e) => {
								dispatch({
									type: "SET_FORM_DATA",
									payload: {
										last_name:
											e
												.target
												.value,
									},
								});
								if (
									state.errors
										.last_name
								)
									dispatch({
										type: "SET_ERRORS",
										payload: {
											last_name:
												"",
										},
									});
							}}
							onFocus={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										last_name: true,
									},
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_FOCUSED",
									payload: {
										last_name: false,
									},
								})
							}
							placeholder={
								t.enterLastName
							}
							aria-label={
								t.last_name
							}
						/>
						{state.errors
							.last_name && (
							<p style={errorStyle}>
								{
									state.errors
										.last_name
								}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.role}
						</label>
						<select
							style={inputStyle(
								false,
								false
							)}
							value={
								state.formData
									.role
							}
							onChange={(e) =>
								dispatch({
									type: "SET_FORM_DATA",
									payload: {
										role: e
											.target
											.value,
									},
								})
							}
							aria-label={t.role}
						>
							<option
								value="admin"
								aria-label={
									t.admin
								}
							>
								{t.admin}
							</option>
							<option
								value="manager"
								aria-label={
									t.manager
								}
							>
								{t.manager}
							</option>
							<option
								value="contractor"
								aria-label={
									t.contractor
								}
							>
								{t.contractor}
							</option>
						</select>
					</div>

					{state.formData.role ===
						"manager" && (
						<div>
							<label
								style={labelStyle}
							>
								{
									t.assignBuildings
								}
							</label>
							<input
								style={{
									...inputStyle(
										false,
										state
											.focused
											.buildingSearch
									),
									marginBottom:
										spacing[2],
								}}
								type="text"
								value={
									state.buildingSearch
								}
								onChange={(e) =>
									dispatch({
										type: "SET_BUILDING_SEARCH",
										payload:
											e
												.target
												.value,
									})
								}
								onFocus={() =>
									dispatch({
										type: "SET_FOCUSED",
										payload: {
											buildingSearch: true,
										},
									})
								}
								onBlur={() =>
									dispatch({
										type: "SET_FOCUSED",
										payload: {
											buildingSearch: false,
										},
									})
								}
								placeholder={
									t.searchBuildings
								}
								aria-label={
									t.searchBuildings
								}
							/>
							<div
								style={
									buildingListStyle
								}
							>
								{filteredBuildings.length >
								0 ? (
									filteredBuildings.map(
										(
											building
										) => (
											<label
												key={
													building.id
												}
												style={
													buildingLabelStyle
												}
												onMouseEnter={(
													e
												) => {
													e.currentTarget.style.background =
														colors.pageBg;
												}}
												onMouseLeave={(
													e
												) => {
													e.currentTarget.style.background =
														"transparent";
												}}
											>
												<input
													type="checkbox"
													checked={state.formData.assignedBuildings.includes(
														building.id
													)}
													onChange={() =>
														toggleBuildingAssignment(
															building.id
														)
													}
													style={{
														width: "16px",
														height: "16px",
														cursor: "pointer",
													}}
													aria-label={
														building.street_address
													}
												/>
												<span>
													{
														building.street_address
													}

													,{" "}
													{
														building.district
													}

													,{" "}
													{
														building.city
													}
												</span>
											</label>
										)
									)
								) : (
									<div
										style={
											noResultsStyle
										}
									>
										{
											t.noResults
										}
									</div>
								)}
							</div>
						</div>
					)}

					<div style={buttonGroupStyle}>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onClose?.();
							}}
							style={
								cancelButtonStyle
							}
							aria-label={t.cancel}
						>
							{t.cancel}
						</button>

						<button
							type="submit"
							disabled={
								state.loading
							}
							style={{
								...submitButtonBaseStyle,
								cursor: state.loading
									? "not-allowed"
									: "pointer",
								opacity:
									state.loading
										? 0.55
										: 1,
							}}
							onMouseEnter={(e) => {
								if (
									!state.loading
								)
									e.currentTarget.style.background =
										colors.primaryHover;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background =
									colors.primary;
							}}
							onMouseDown={(e) => {
								if (
									!state.loading
								)
									e.currentTarget.style.transform =
										"scale(0.97)";
							}}
							onMouseUp={(e) => {
								e.currentTarget.style.transform =
									"scale(1)";
							}}
							aria-label={
								state.loading
									? t.saving
									: isEdit
										? t.update
										: t.create
							}
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
