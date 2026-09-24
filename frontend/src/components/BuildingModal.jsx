import { useState, useRef, useEffect } from "react";
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
	building: (
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
			<rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01" />
			<path d="M16 6h.01" />
			<path d="M12 6h.01" />
			<path d="M12 10h.01" />
			<path d="M12 14h.01" />
			<path d="M16 10h.01" />
			<path d="M16 14h.01" />
			<path d="M8 10h.01" />
			<path d="M8 14h.01" />
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
};

export default function BuildingModal({
	building = null,
	onClose,
	onSave,
	language = "pl",
}) {
	const t = translations[language];
	const isEdit = !!building;
	const bodyRef = useRef(null);
	const addressInputRef = useRef(null);

	const [formData, setFormData] = useState({
		city: building?.city || "",
		district: building?.district || "",
		street_address: building?.street_address || "",
	});

	const [errors, setErrors] = useState({
		city: "",
		street_address: "",
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		if (addressInputRef.current) {
			addressInputRef.current.focus();
		}
	}, [building]);

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

		if (!formData.street_address.trim()) {
			newErrors.street_address = t.required;
			valid = false;
		}

		if (!formData.city.trim()) {
			newErrors.city = t.required;
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		try {
			const savedBuilding = {
				...(building?.id && { id: building.id }),
				city: formData.city.trim(),
				district: formData.district.trim(),
				street_address: formData.street_address.trim(),
			};
			if (onSave) await onSave(savedBuilding);
			if (onClose) onClose();
		} catch (err) {
			console.error("Error saving building", err);
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
					maxWidth: "460px",
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
							{ICONS.building}
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
								{isEdit ? t.editBuilding : t.createBuilding}
							</h3>
							<p
								style={{
									margin: "2px 0 0 0",
									fontSize: font.size.xs,
									color: colors.shellTextMuted,
								}}
							>
								{isEdit
									? (building.street_address || t.building)
									: (t.addBuilding || "Enter building location")}
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
								{t.streetAddress}
							</label>
							<input
								ref={addressInputRef}
								type="text"
								value={formData.street_address}
								onChange={(e) => {
									setFormData({
										...formData,
										street_address: e.target.value,
									});
									if (errors.street_address) {
										setErrors({ ...errors, street_address: "" });
									}
								}}
								placeholder={t.enterStreetAddress}
								style={{
									...components.input,
									width: "100%",
									boxSizing: "border-box",
									fontSize: font.size.sm,
									borderRadius: radius.md,
									border: errors.street_address
										? `1px solid ${status.danger.border}`
										: `1px solid ${colors.borderDefault}`,
									background: errors.street_address
										? status.danger.bg
										: colors.cardBg,
								}}
							/>
							{errors.street_address && (
								<p
									style={{
										fontSize: font.size.xs,
										color: status.danger.text,
										margin: `${spacing[1]} 0 0 0`,
									}}
								>
									{errors.street_address}
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
								{t.district}
							</label>
							<input
								type="text"
								value={formData.district}
								onChange={(e) =>
									setFormData({
										...formData,
										district: e.target.value,
									})
								}
								placeholder={t.enterDistrict}
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
								{t.city}
							</label>
							<input
								type="text"
								value={formData.city}
								onChange={(e) => {
									setFormData({
										...formData,
										city: e.target.value,
									});
									if (errors.city) {
										setErrors({ ...errors, city: "" });
									}
								}}
								placeholder={t.enterCity}
								style={{
									...components.input,
									width: "100%",
									boxSizing: "border-box",
									fontSize: font.size.sm,
									borderRadius: radius.md,
									border: errors.city
										? `1px solid ${status.danger.border}`
										: `1px solid ${colors.borderDefault}`,
									background: errors.city
										? status.danger.bg
										: colors.cardBg,
								}}
							/>
							{errors.city && (
								<p
									style={{
										fontSize: font.size.xs,
										color: status.danger.text,
										margin: `${spacing[1]} 0 0 0`,
									}}
								>
									{errors.city}
								</p>
							)}
						</div>
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
							disabled={loading}
							style={{
								...components.primaryButton,
								padding: `${spacing[2]} ${spacing[5]}`,
								fontSize: font.size.sm,
								opacity: loading ? 0.6 : 1,
								cursor: loading ? "not-allowed" : "pointer",
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
