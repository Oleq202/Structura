import { useState, useRef, useEffect } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	status,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import { Modal, Button, Input, Textarea } from "./ui";
import {
	IconTasks,
	IconEdit,
	IconSearch,
	IconCheck,
	IconMapPin,
} from "./icons";

const EMPTY_BUILDINGS = [];
const EMPTY_CONTRACTORS = [];

function compareBuildings(a, b) {
	const addrA = `${a.street_address || ""} ${a.city || ""} ${a.district || ""}`.trim();
	const addrB = `${b.street_address || ""} ${b.city || ""} ${b.district || ""}`.trim();
	return addrA.localeCompare(addrB, undefined, { sensitivity: "base" });
}

function compareContractors(a, b) {
	const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.login || "";
	const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.login || "";
	return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
}

function BuildingPicker({
	buildings,
	selectedBuildingIds,
	search,
	onSearchChange,
	selectedId,
	onSelect,
	error,
	t,
}) {
	const allowedBuildingIds = selectedBuildingIds?.length
		? new Set(selectedBuildingIds)
		: null;
	const q = search.toLowerCase();

	const filtered = buildings
		.filter((b) => {
			if (allowedBuildingIds && !allowedBuildingIds.has(b.id)) {
				return false;
			}
			const addr = `${b.street_address} ${b.district || ""} ${b.city}`.toLowerCase();
			return addr.includes(q);
		})
		.sort(compareBuildings);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: spacing[1] }}>
			<span
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.semibold,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.caps,
				}}
			>
				{t.building || "Budynek"} *
			</span>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "6px",
					border: error ? `1.5px solid #dc2626` : `1px solid ${colors.borderDefault}`,
					borderRadius: radius.md,
					padding: "8px",
					background: colors.cardBg,
				}}
			>
				<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
					<span
						style={{
							position: "absolute",
							left: "10px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
							pointerEvents: "none",
						}}
					>
						<IconSearch size="sm" />
					</span>
					<input
						type="text"
						placeholder={t.searchBuilding || "Szukaj budynku..."}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							width: "100%",
							minHeight: "38px",
							padding: `0 ${spacing[2]} 0 ${spacing[8]}`,
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							color: colors.textBody,
							background: colors.pageBg,
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.sm,
							boxSizing: "border-box",
							outline: "none",
						}}
					/>
				</div>

				<div
					style={{
						maxHeight: "130px",
						overflowY: "auto",
						WebkitOverflowScrolling: "touch",
						display: "flex",
						flexDirection: "column",
						gap: "4px",
					}}
				>
					{filtered.length > 0 ? (
						filtered.map((b) => {
							const isChecked = selectedId === String(b.id);
							return (
								<button
									key={b.id}
									type="button"
									role="radio"
									aria-checked={isChecked}
									onClick={() => onSelect(String(b.id))}
									style={{
										display: "flex",
										alignItems: "center",
										minHeight: "44px",
										gap: spacing[2],
										padding: `${spacing[2]} ${spacing[3]}`,
										borderRadius: radius.sm,
										background: isChecked ? `${colors.primary}12` : colors.pageBg,
										border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
										cursor: "pointer",
										width: "100%",
										textAlign: "left",
										boxSizing: "border-box",
										transition: "border-color 0.15s ease, background-color 0.15s ease",
									}}
								>
									<div
										style={{
											width: "18px",
											height: "18px",
											borderRadius: radius.full,
											border: `1.5px solid ${isChecked ? colors.primary : colors.borderStrong}`,
											background: isChecked ? colors.primary : colors.cardBg,
											color: "#ffffff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										{isChecked && <IconCheck size="xs" />}
									</div>

									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: font.weight.semibold,
												color: colors.textHeading,
												fontSize: font.size.sm,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{b.street_address}
										</div>
										<div
											style={{
												fontSize: font.size.xs,
												color: colors.textSecondary,
												display: "flex",
												alignItems: "center",
												gap: "3px",
											}}
										>
											<IconMapPin size="xs" style={{ color: colors.primary }} />
											<span>{[b.district, b.city].filter(Boolean).join(", ")}</span>
										</div>
									</div>
								</button>
							);
						})
					) : (
						<div
							style={{
								padding: spacing[3],
								fontSize: font.size.xs,
								color: colors.textSecondary,
								textAlign: "center",
							}}
						>
							{t.noResults || "Brak wyników"}
						</div>
					)}
				</div>
			</div>

			{error && (
				<span style={{ fontSize: font.size.xs, color: "#dc2626", fontWeight: font.weight.medium }}>
					{error}
				</span>
			)}
		</div>
	);
}

function ContractorPicker({
	contractors,
	search,
	onSearchChange,
	selectedId,
	onSelect,
	error,
	t,
}) {
	const filtered = contractors
		.filter((c) => {
			const q = search.toLowerCase();
			return (
				(c.first_name || "").toLowerCase().includes(q) ||
				(c.last_name || "").toLowerCase().includes(q) ||
				(c.login || "").toLowerCase().includes(q)
			);
		})
		.sort(compareContractors);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: spacing[1] }}>
			<span
				style={{
					fontSize: font.size.sm,
					fontWeight: font.weight.semibold,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: font.letterSpacing.caps,
				}}
			>
				{t.contractor || "Wykonawca"} *
			</span>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "6px",
					border: error ? `1.5px solid #dc2626` : `1px solid ${colors.borderDefault}`,
					borderRadius: radius.md,
					padding: "8px",
					background: colors.cardBg,
				}}
			>
				<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
					<span
						style={{
							position: "absolute",
							left: "10px",
							color: colors.textSecondary,
							display: "flex",
							alignItems: "center",
							pointerEvents: "none",
						}}
					>
						<IconSearch size="sm" />
					</span>
					<input
						type="text"
						placeholder={t.searchContractor || "Szukaj wykonawcy..."}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						style={{
							width: "100%",
							minHeight: "38px",
							padding: `0 ${spacing[2]} 0 ${spacing[8]}`,
							fontSize: font.size.base,
							fontFamily: font.family.sans,
							color: colors.textBody,
							background: colors.pageBg,
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.sm,
							boxSizing: "border-box",
							outline: "none",
						}}
					/>
				</div>

				<div
					style={{
						maxHeight: "130px",
						overflowY: "auto",
						WebkitOverflowScrolling: "touch",
						display: "flex",
						flexDirection: "column",
						gap: "4px",
					}}
				>
					{filtered.length > 0 ? (
						filtered.map((c) => {
							const isChecked = selectedId === String(c.id);
							const initials =
								[c.first_name, c.last_name]
									.filter(Boolean)
									.map((n) => n[0].toUpperCase())
									.join("") || c.login?.[0]?.toUpperCase() || "?";
							const fullName =
								[c.first_name, c.last_name].filter(Boolean).join(" ") || c.login;

							return (
								<button
									key={c.id}
									type="button"
									role="radio"
									aria-checked={isChecked}
									onClick={() => onSelect(String(c.id))}
									style={{
										display: "flex",
										alignItems: "center",
										minHeight: "44px",
										gap: spacing[2],
										padding: `${spacing[2]} ${spacing[3]}`,
										borderRadius: radius.sm,
										background: isChecked ? `${colors.primary}12` : colors.pageBg,
										border: `1px solid ${isChecked ? colors.primary : colors.borderSubtle}`,
										cursor: "pointer",
										width: "100%",
										textAlign: "left",
										boxSizing: "border-box",
										transition: "border-color 0.15s ease, background-color 0.15s ease",
									}}
								>
									<div
										style={{
											width: "18px",
											height: "18px",
											borderRadius: radius.full,
											border: `1.5px solid ${isChecked ? colors.primary : colors.borderStrong}`,
											background: isChecked ? colors.primary : colors.cardBg,
											color: "#ffffff",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										{isChecked && <IconCheck size="xs" />}
									</div>

									<div
										style={{
											width: "26px",
											height: "26px",
											borderRadius: radius.full,
											background: colors.primaryLight,
											color: colors.primary,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: font.size.xs,
											fontWeight: font.weight.bold,
											flexShrink: 0,
										}}
									>
										{initials}
									</div>

									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: font.weight.semibold,
												color: colors.textHeading,
												fontSize: font.size.sm,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{fullName}
										</div>
										{c.login && c.login !== fullName && (
											<div style={{ fontSize: font.size.xs, color: colors.textSecondary }}>
												@{c.login}
											</div>
										)}
									</div>
								</button>
							);
						})
					) : (
						<div
							style={{
								padding: spacing[3],
								fontSize: font.size.xs,
								color: colors.textSecondary,
								textAlign: "center",
							}}
						>
							{t.noResults || "Brak wyników"}
						</div>
					)}
				</div>
			</div>

			{error && (
				<span style={{ fontSize: font.size.xs, color: "#dc2626", fontWeight: font.weight.medium }}>
					{error}
				</span>
			)}
		</div>
	);
}

function useTaskForm({
	task,
	isEdit,
	currentUser,
	onClose,
	onTaskCreated,
	onSubmit,
	setLoadingState,
	t,
}) {
	const titleInputRef = useRef(null);
	const [formData, setFormData] = useState({
		title: task?.title || "",
		description: task?.description || "",
		building_id: task?.building_id ? String(task.building_id) : "",
		assigned_to: task?.assigned_to ? String(task.assigned_to) : "",
	});
	const [buildingSearch, setBuildingSearch] = useState("");
	const [contractorSearch, setContractorSearch] = useState("");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => titleInputRef.current?.focus(), 50);
		return () => clearTimeout(timer);
	}, []);

	const validate = () => {
		const newErrors = {};
		if (!formData.title.trim()) {
			newErrors.title = t.required || "Pole wymagane";
		}
		if (!formData.building_id) {
			newErrors.building_id = t.required || "Pole wymagane";
		}
		if (!formData.assigned_to) {
			newErrors.assigned_to = t.required || "Pole wymagane";
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
				title: formData.title.trim(),
				description: formData.description.trim(),
				building_id: parseInt(formData.building_id, 10),
				created_by: currentUser?.id,
				assigned_to: parseInt(formData.assigned_to, 10),
			};

			if (isEdit) {
				await api.updateTask(task.id, payload);
			} else {
				await api.createTask(payload);
			}

			onTaskCreated?.();
			onSubmit?.();
			onClose?.();
		} catch (err) {
			console.error(isEdit ? "Error updating task" : "Error creating task", err);
			setErrors({ form: err.message || "Błąd zapisu zadania" });
		} finally {
			setLoading(false);
			setLoadingState?.(false);
		}
	};

	const handleTitleChange = (val) => {
		setFormData((prev) => ({ ...prev, title: val }));
		if (errors.title) {
			setErrors((prev) => ({ ...prev, title: "" }));
		}
	};

	const handleDescriptionChange = (val) => {
		setFormData((prev) => ({ ...prev, description: val }));
	};

	const handleBuildingSelect = (id) => {
		setFormData((prev) => ({ ...prev, building_id: id }));
		if (errors.building_id) {
			setErrors((prev) => ({ ...prev, building_id: "" }));
		}
	};

	const handleContractorSelect = (id) => {
		setFormData((prev) => ({ ...prev, assigned_to: id }));
		if (errors.assigned_to) {
			setErrors((prev) => ({ ...prev, assigned_to: "" }));
		}
	};

	return {
		titleInputRef,
		formData,
		buildingSearch,
		setBuildingSearch,
		contractorSearch,
		setContractorSearch,
		errors,
		loading,
		handleSubmit,
		handleTitleChange,
		handleDescriptionChange,
		handleBuildingSelect,
		handleContractorSelect,
	};
}

function TaskFormContent({
	task,
	isEdit,
	buildings,
	selectedBuildingIds,
	contractors,
	currentUser,
	onClose,
	onTaskCreated,
	onSubmit,
	setLoadingState,
	t,
}) {
	const {
		titleInputRef,
		formData,
		buildingSearch,
		setBuildingSearch,
		contractorSearch,
		setContractorSearch,
		errors,
		loading,
		handleSubmit,
		handleTitleChange,
		handleDescriptionChange,
		handleBuildingSelect,
		handleContractorSelect,
	} = useTaskForm({
		task,
		isEdit,
		currentUser,
		onClose,
		onTaskCreated,
		onSubmit,
		setLoadingState,
		t,
	});

	return (
		<form
			id="task-form"
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
						background: status.danger.bg,
						border: `1px solid ${status.danger.border}`,
						color: status.danger.text,
						fontSize: font.size.xs,
					}}
				>
					{errors.form}
				</div>
			)}

			<Input
				ref={titleInputRef}
				label={t.title || "Tytuł"}
				placeholder={t.taskTitlePlaceholder || "np. Naprawa oświetlenia na klatce"}
				value={formData.title}
				onChange={(e) => handleTitleChange(e.target.value)}
				error={errors.title}
				required
			/>

			<Textarea
				label={t.description || "Opis"}
				placeholder={t.taskDescriptionPlaceholder || "Dodaj szczegóły zlecenia, instrukcje wejścia..."}
				rows={3}
				value={formData.description}
				onChange={(e) => handleDescriptionChange(e.target.value)}
			/>

			<BuildingPicker
				buildings={buildings}
				selectedBuildingIds={selectedBuildingIds}
				search={buildingSearch}
				onSearchChange={setBuildingSearch}
				selectedId={formData.building_id}
				onSelect={handleBuildingSelect}
				error={errors.building_id}
				t={t}
			/>

			<ContractorPicker
				contractors={contractors}
				search={contractorSearch}
				onSearchChange={setContractorSearch}
				selectedId={formData.assigned_to}
				onSelect={handleContractorSelect}
				error={errors.assigned_to}
				t={t}
			/>

			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: spacing[2],
					paddingTop: spacing[3],
					borderTop: `1px solid ${colors.borderSubtle}`,
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

export default function TaskModal({
	isOpen = true,
	buildings = EMPTY_BUILDINGS,
	selectedBuildingIds = null,
	contractors = EMPTY_CONTRACTORS,
	currentUser,
	onClose,
	onTaskCreated,
	onSubmit,
	task = null,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const isEdit = !!task?.id;
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const modalTitle = (
		<div>
			<div style={{ fontSize: font.size.lg, fontWeight: font.weight.semibold }}>
				{isEdit ? t.editTask || "Edytuj zadanie" : t.createNewTask || "Nowe zadanie"}
			</div>
			{isEdit && task?.title && (
				<div style={{ fontSize: font.size.xs, color: colors.textSecondary, marginTop: "2px" }}>
					{task.title}
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
						borderRadius: radius.md,
						background: colors.primaryLight,
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					{isEdit ? <IconEdit size="md" /> : <IconTasks size="md" />}
				</div>
			}
			maxWidth="540px"
		>
			<TaskFormContent
				key={task?.id || "new"}
				task={task}
				isEdit={isEdit}
				buildings={buildings}
				selectedBuildingIds={selectedBuildingIds}
				contractors={contractors}
				currentUser={currentUser}
				onClose={onClose}
				onTaskCreated={onTaskCreated}
				onSubmit={onSubmit}
				setLoadingState={setLoading}
				t={t}
			/>
		</Modal>
	);
}
