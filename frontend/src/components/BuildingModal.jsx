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

export default function BuildingModal({
	building = null,
	onClose,
	onSave,
	language,
}) {
	const t = translations[language];
	const cityRef = useRef(null);
	const isEdit = !!building;

	const [formData, setFormData] = useState({
		city: building?.city || "",
		district: building?.district || "",
		streetAddress:
			building?.street_address || "",
	});

	const [errors, setErrors] = useState({
		city: "",
		streetAddress: "",
	});

	const [focused, setFocused] = useState({
		city: false,
		district: false,
		streetAddress: false,
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (cityRef.current) {
			cityRef.current.focus();
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

		if (!formData.city) {
			newErrors.city = t.required;
			valid = false;
		}

		if (!formData.streetAddress) {
			newErrors.streetAddress = t.required;
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
			const savedBuilding = {
				id: building?.id || Date.now(),
				city: formData.city,
				district: formData.district,
				street_address:
					formData.streetAddress,
			};
			console.log(
				isEdit
					? "Updating building:"
					: "Creating building:",
				savedBuilding
			);
			if (onSave) onSave(savedBuilding);
			if (onClose) onClose();
		} catch (err) {
			console.error(
				"Error saving building",
				err
			);
		} finally {
			setLoading(false);
		}
	};

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
						? t.editBuilding
						: t.createBuilding}
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
							{t.city}
						</label>
						<input
							style={inputStyle(
								!!errors.city,
								focused.city
							)}
							ref={cityRef}
							type="text"
							value={formData.city}
							onChange={(e) => {
								setFormData({
									...formData,
									city: e.target
										.value,
								});
								if (errors.city)
									setErrors({
										...errors,
										city: "",
									});
							}}
							onFocus={() =>
								setFocused({
									...focused,
									city: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									city: false,
								})
							}
							placeholder={
								t.enterCity
							}
						/>
						{errors.city && (
							<p style={errorStyle}>
								{errors.city}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.district}
						</label>
						<input
							style={inputStyle(
								false,
								focused.district
							)}
							type="text"
							value={
								formData.district
							}
							onChange={(e) =>
								setFormData({
									...formData,
									district:
										e.target
											.value,
								})
							}
							onFocus={() =>
								setFocused({
									...focused,
									district: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									district: false,
								})
							}
							placeholder={
								t.enterDistrict
							}
						/>
					</div>

					<div>
						<label style={labelStyle}>
							{t.streetAddress}
						</label>
						<input
							style={inputStyle(
								!!errors.streetAddress,
								focused.streetAddress
							)}
							type="text"
							value={
								formData.streetAddress
							}
							onChange={(e) => {
								setFormData({
									...formData,
									streetAddress:
										e.target
											.value,
								});
								if (
									errors.streetAddress
								)
									setErrors({
										...errors,
										streetAddress:
											"",
									});
							}}
							onFocus={() =>
								setFocused({
									...focused,
									streetAddress: true,
								})
							}
							onBlur={() =>
								setFocused({
									...focused,
									streetAddress: false,
								})
							}
							placeholder={
								t.enterStreetAddress
							}
						/>
						{errors.streetAddress && (
							<p style={errorStyle}>
								{
									errors.streetAddress
								}
							</p>
						)}
					</div>

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
