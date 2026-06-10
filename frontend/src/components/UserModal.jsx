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

const EMPTY_BUILDINGS = [];

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

	const [formData, setFormData] = useState({
		login: user?.login || "",
		password: "",
		first_name: user?.first_name || "",
		last_name: user?.last_name || "",
		role: user?.role || "manager",
		assignedBuildings:
			user?.assignedBuildings || [],
	});

	const [errors, setErrors] = useState({
		login: "",
		password: "",
		first_name: "",
		last_name: "",
	});

	const [focused, setFocused] = useState({
		login: false,
		password: false,
		first_name: false,
		last_name: false,
		buildingSearch: false,
	});

	const [loading, setLoading] = useState(false);
	const [buildingSearch, setBuildingSearch] =
		useState("");
	const [showPassword, setShowPassword] =
		useState(false);

	useEffect(() => {
		if (loginRef.current) {
			loginRef.current.focus();
		}
	}, []);

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

	const validate = () => {
		const newErrors = {};
		let valid = true;

		if (!formData.login) {
			newErrors.login = t.required;
			valid = false;
		}

		if (!isEdit && !formData.password) {
			newErrors.password = t.required;
			valid = false;
		} else if (
			formData.password &&
			formData.password.length < 6
		) {
			newErrors.password =
				t.passwordMinLength;
			valid = false;
		}

		if (!formData.first_name) {
			newErrors.first_name = t.required;
			valid = false;
		}

		if (!formData.last_name) {
			newErrors.last_name = t.required;
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const savedUser = {
				login: formData.login,
				first_name: formData.first_name,
				last_name: formData.last_name,
				role: formData.role,
			};
			if (!isEdit) {
				savedUser.password =
					formData.password;
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
			setLoading(false);
		}
	};

	const toggleBuildingAssignment = (
		building_id
	) => {
		setFormData((prev) => ({
			...prev,
			assignedBuildings:
				prev.assignedBuildings.includes(
					building_id
				)
					? prev.assignedBuildings.filter(
							(id) =>
								id !== building_id
						)
					: [
							...prev.assignedBuildings,
							building_id,
						],
		}));
	};

	const filteredBuildings = buildings.filter(
		(building) => {
			const search =
				buildingSearch.toLowerCase();
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
		setShowPassword((v) => !v);

	return (
		<div
			style={{
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
				zIndex: 100,
			}}
			onClick={() => onClose?.()}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					e.preventDefault();
					onClose?.();
				}
			}}
		>
			<div
				style={{
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
				}}
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
					style={{
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
					}}
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
					{isEdit
						? t.editUser
						: t.createUser}
				</h1>
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						gap: spacing[5],
					}}
				>
					<div>
						<label style={labelStyle}>
							{t.login}
						</label>
						<input
							style={inputStyle(
								!!errors.login,
								focused.login
							)}
							ref={loginRef}
							type="text"
							value={formData.login}
							onChange={(e) => {
								setFormData({
									...formData,
									login: e
										.target
										.value,
								});
								if (errors.login)
									setErrors({
										...errors,
										login: "",
									});
							}}
							onFocus={() =>
								setFocused({
									...focused,
									login: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									login: false,
								})
							}
							placeholder={
								t.enterLogin
							}
							aria-label={t.login}
						/>
						{errors.login && (
							<p style={errorStyle}>
								{errors.login}
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
											!!errors.password,
											focused.password
										),
										paddingRight:
											spacing[10],
									}}
									type={
										showPassword
											? "text"
											: "password"
									}
									value={
										formData.password
									}
									onChange={(
										e
									) => {
										setFormData(
											{
												...formData,
												password:
													e
														.target
														.value,
											}
										);
										if (
											errors.password
										)
											setErrors(
												{
													...errors,
													password:
														"",
												}
											);
									}}
									onFocus={() =>
										setFocused(
											{
												...focused,
												password: true,
											}
										)
									}
									onBlur={() =>
										setFocused(
											{
												...focused,
												password: false,
											}
										)
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
									style={{
										position:
											"absolute",
										right: spacing[3],
										background:
											"none",
										border: "none",
										cursor: "pointer",
										fontSize:
											font
												.size
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
											? t.hide
											: t.show
									}
								>
									{showPassword
										? t.hide
										: t.show}
								</button>
							</div>
							{errors.password && (
								<p
									style={
										errorStyle
									}
								>
									{
										errors.password
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
								!!errors.first_name,
								focused.first_name
							)}
							type="text"
							value={
								formData.first_name
							}
							onChange={(e) => {
								setFormData({
									...formData,
									first_name:
										e.target
											.value,
								});
								if (
									errors.first_name
								)
									setErrors({
										...errors,
										first_name:
											"",
									});
							}}
							onFocus={() =>
								setFocused({
									...focused,
									first_name: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									first_name: false,
								})
							}
							placeholder={
								t.enterFirstName
							}
							aria-label={
								t.first_name
							}
						/>
						{errors.first_name && (
							<p style={errorStyle}>
								{
									errors.first_name
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
								!!errors.last_name,
								focused.last_name
							)}
							type="text"
							value={
								formData.last_name
							}
							onChange={(e) => {
								setFormData({
									...formData,
									last_name:
										e.target
											.value,
								});
								if (
									errors.last_name
								)
									setErrors({
										...errors,
										last_name:
											"",
									});
							}}
							onFocus={() =>
								setFocused({
									...focused,
									last_name: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									last_name: false,
								})
							}
							placeholder={
								t.enterLastName
							}
							aria-label={
								t.last_name
							}
						/>
						{errors.last_name && (
							<p style={errorStyle}>
								{errors.last_name}
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
							value={formData.role}
							onChange={(e) =>
								setFormData({
									...formData,
									role: e.target
										.value,
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

					{formData.role ===
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
										focused.buildingSearch
									),
									marginBottom:
										spacing[2],
								}}
								type="text"
								value={
									buildingSearch
								}
								onChange={(e) =>
									setBuildingSearch(
										e.target
											.value
									)
								}
								onFocus={() =>
									setFocused({
										...focused,
										buildingSearch: true,
									})
								}
								onBlur={() =>
									setFocused({
										...focused,
										buildingSearch: false,
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
								style={{
									display:
										"flex",
									flexDirection:
										"column",
									gap: spacing[2],
									maxHeight:
										"150px",
									overflowY:
										"auto",
									paddingRight:
										spacing[1],
								}}
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
												style={{
													display:
														"flex",
													alignItems:
														"center",
													gap: spacing[2],
													fontSize:
														font
															.size
															.sm,
													color: colors.textBody,
													cursor: "pointer",
													padding:
														spacing[1],
													borderRadius:
														radius.sm,
													transition:
														"background 0.15s",
												}}
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
													checked={formData.assignedBuildings.includes(
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
										style={{
											fontSize:
												font
													.size
													.sm,
											color: colors.textSecondary,
											padding:
												spacing[2],
											textAlign:
												"center",
										}}
									>
										{
											t.noResults
										}
									</div>
								)}
							</div>
						</div>
					)}

					<div
						style={{
							display: "flex",
							gap: spacing[3],
							marginTop: spacing[2],
						}}
					>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onClose?.();
							}}
							style={{
								flex: 1,
								background:
									"transparent",
								border: `1px solid ${colors.borderDefault}`,
								color: colors.textBody,
								padding: `${spacing[3]} ${spacing[4]}`,
								borderRadius:
									radius.lg,
								fontSize:
									font.size
										.base,
								fontFamily:
									font.family
										.sans,
								fontWeight:
									font.weight
										.medium,
								cursor: "pointer",
								boxSizing:
									"border-box",
							}}
							aria-label={t.cancel}
						>
							{t.cancel}
						</button>

						<button
							type="submit"
							disabled={loading}
							style={{
								...components.primaryButton,
								flex: 2,
								padding: `${spacing[3]} ${spacing[4]}`,
								borderRadius:
									radius.lg,
								fontSize:
									font.size
										.base,
								fontFamily:
									font.family
										.sans,
								fontWeight:
									font.weight
										.medium,
								letterSpacing:
									font
										.letterSpacing
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
							aria-label={
								loading
									? t.saving
									: isEdit
										? t.update
										: t.create
							}
						>
							{loading
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
