import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import { Modal, Button, Input } from "./ui";
import { IconBuilding } from "./icons";

function BuildingFormContent({
	isEdit,
	building,
	t,
	onClose,
	onBuildingCreated,
	onSave,
	setLoadingState,
}) {
	const addressInputRef = useRef(null);
	const [formData, setFormData] = useState({
		street_address: building?.street_address || "",
		city: building?.city || "",
		district: building?.district || "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => addressInputRef.current?.focus(), 50);
		return () => clearTimeout(timer);
	}, []);

	const validate = () => {
		const newErrors = {};
		if (!formData.street_address.trim()) {
			newErrors.street_address = t.required || "Pole wymagane";
		}
		if (!formData.city.trim()) {
			newErrors.city = t.required || "Pole wymagane";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		setLoading(true);
		setLoadingState?.(true);
		try {
			const payload = {
				street_address: formData.street_address.trim(),
				city: formData.city.trim(),
				district: formData.district.trim() || null,
			};

			let saved;
			if (isEdit) {
				saved = await api.updateBuilding(building.id, payload);
			} else {
				saved = await api.createBuilding(payload);
			}

			(onBuildingCreated || onSave)?.(saved || payload);
			onClose?.();
		} catch (err) {
			console.error("Failed to save building:", err);
			setErrors({ form: err.message || "Błąd zapisu" });
		} finally {
			setLoading(false);
			setLoadingState?.(false);
		}
	};

	return (
		<form
			id="building-form"
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: spacing[4],
				margin: 0,
			}}
		>
			{errors.form && (
				<div
					style={{
						padding: `${spacing[2]} ${spacing[3]}`,
						borderRadius: "6px",
						background: "#fef2f2",
						border: "1px solid #fca5a5",
						color: "#991b1b",
						fontSize: font.size.xs,
					}}
				>
					{errors.form}
				</div>
			)}

			<Input
				ref={addressInputRef}
				label={t.streetAddress || "Adres ulicy"}
				placeholder="np. ul. Marszałkowska 10/12"
				value={formData.street_address}
				onChange={(e) => {
					setFormData((prev) => ({ ...prev, street_address: e.target.value }));
					if (errors.street_address) {
						setErrors((prev) => ({ ...prev, street_address: "" }));
					}
				}}
				error={errors.street_address}
				required
			/>

			<Input
				label={t.city || "Miasto"}
				placeholder="np. Warszawa"
				value={formData.city}
				onChange={(e) => {
					setFormData((prev) => ({ ...prev, city: e.target.value }));
					if (errors.city) {
						setErrors((prev) => ({ ...prev, city: "" }));
					}
				}}
				error={errors.city}
				required
			/>

			<Input
				label={t.district || "Dzielnica"}
				placeholder="np. Mokotów (opcjonalnie)"
				value={formData.district}
				onChange={(e) =>
					setFormData((prev) => ({ ...prev, district: e.target.value }))
				}
				helperText={t.enterDistrict || "Opcjonalna nazwa dzielnicy lub osiedla"}
			/>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: spacing[2],
					paddingTop: spacing[2],
				}}
			>
				<Button
					variant="secondary"
					size="md"
					disabled={loading}
					onClick={onClose}
				>
					{t.cancel || "Anuluj"}
				</Button>
				<Button
					variant="primary"
					size="md"
					type="submit"
					loading={loading}
				>
					{loading
						? (t.saving || "Zapisywanie...")
						: isEdit
							? (t.update || "Zaktualizuj")
							: (t.create || "Utwórz")}
				</Button>
			</div>
		</form>
	);
}

export default function BuildingModal({
	isOpen = true,
	onClose,
	onBuildingCreated,
	onSave,
	building = null,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const isEdit = !!building?.id;
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const modalTitle = (
		<div>
			<div style={{ fontSize: font.size.lg, fontWeight: font.weight.semibold }}>
				{isEdit ? t.editBuilding || "Edytuj budynek" : t.createBuilding || "Dodaj budynek"}
			</div>
			{isEdit && building?.street_address && (
				<div style={{ fontSize: font.size.xs, color: colors.textSecondary, marginTop: "2px" }}>
					{building.street_address}
				</div>
			)}
		</div>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={loading ? undefined : onClose}
			title={modalTitle}
			icon={
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: "8px",
						background: colors.primaryLight,
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					<IconBuilding size="md" />
				</div>
			}
			maxWidth="460px"
		>
			<BuildingFormContent
				key={building?.id || "new"}
				isEdit={isEdit}
				building={building}
				t={t}
				onClose={onClose}
				onBuildingCreated={onBuildingCreated}
				onSave={onSave}
				setLoadingState={setLoading}
			/>
		</Modal>
	);
}
