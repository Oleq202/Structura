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
import * as api from "../services/api";

const EMPTY_BUILDINGS = [];
const EMPTY_CONTRACTORS = [];

export default function CreateTask({
	buildings = EMPTY_BUILDINGS,
	contractors = EMPTY_CONTRACTORS,
	currentUser,
	onClose,
	onTaskCreated,
	language = "pl",
}) {
	const t = translations[language];
	const createTaskRef = useRef(null);
	const [task, setTask] = useState({
		title: "",
		description: "",
		building_id: "",
		assigned_to: "",
	});
	const [loading, setLoading] = useState(false);
	const [titleError, setTitleError] =
		useState("");
	const [
		descriptionError,
		setDescriptionError,
	] = useState("");
	const [buildingIdError, setBuildingIdError] =
		useState("");
	const [assignedToError, setAssignedToError] =
		useState("");
	const [titleFocused, setTitleFocused] =
		useState(false);
	const [
		descriptionFocused,
		setDescriptionFocused,
	] = useState(false);
	const [buildingSearch, setBuildingSearch] =
		useState("");
	const [
		contractorSearch,
		setContractorSearch,
	] = useState("");
	const [
		buildingSearchFocused,
		setBuildingSearchFocused,
	] = useState(false);
	const [
		contractorSearchFocused,
		setContractorSearchFocused,
	] = useState(false);

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

	const filteredContractors =
		contractors.filter((contractor) => {
			const search =
				contractorSearch.toLowerCase();
			return (
				contractor.first_name
					.toLowerCase()
					.includes(search) ||
				contractor.last_name
					.toLowerCase()
					.includes(search)
			);
		});

	useEffect(() => {
		if (createTaskRef.current) {
			createTaskRef.current.focus();
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setTitleError("");
		setDescriptionError("");
		setBuildingIdError("");
		setAssignedToError("");

		if (!task.title) {
			setTitleError(t.required);
			return;
		}

		if (!task.building_id) {
			setBuildingIdError(t.required);
			return;
		}

		if (!task.assigned_to) {
			setAssignedToError(t.required);
			return;
		}

		setLoading(true);
		try {
			await api.createTask({
				title: task.title,
				description: task.description,
				building_id: parseInt(
					task.building_id
				),
				created_by: currentUser.id,
				assigned_to: parseInt(
					task.assigned_to
				),
			});
			if (onTaskCreated) onTaskCreated();
			if (onClose) onClose();
		} catch (err) {
			console.error(
				"Error creating task",
				err
			);
		} finally {
			setLoading(false);
		}
	};

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
					{t.createNewTask}
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
							{t.title}
						</label>
						<input
							style={inputStyle(
								!!titleError,
								titleFocused
							)}
							ref={createTaskRef}
							type="text"
							value={task.title}
							onChange={(e) =>
								setTask({
									...task,
									title: e
										.target
										.value,
								})
							}
							onFocus={() =>
								setTitleFocused(
									true
								)
							}
							onBlur={() =>
								setTitleFocused(
									false
								)
							}
							placeholder={
								t.enterTaskTitle
							}
							aria-label={
								t.enterTaskTitle
							}
						/>
						{titleError && (
							<p style={errorStyle}>
								{titleError}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.description}
						</label>
						<input
							style={inputStyle(
								!!descriptionError,
								descriptionFocused
							)}
							type="text"
							value={
								task.description
							}
							onChange={(e) =>
								setTask({
									...task,
									description:
										e.target
											.value,
								})
							}
							onFocus={() =>
								setDescriptionFocused(
									true
								)
							}
							onBlur={() =>
								setDescriptionFocused(
									false
								)
							}
							placeholder={
								t.enterTaskDescription
							}
							aria-label={
								t.enterTaskDescription
							}
						/>
						{descriptionError && (
							<p style={errorStyle}>
								{descriptionError}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.building}
						</label>
						<input
							style={{
								...inputStyle(
									!!buildingIdError,
									buildingSearchFocused
								),
								marginBottom:
									spacing[2],
							}}
							type="text"
							value={buildingSearch}
							onChange={(e) =>
								setBuildingSearch(
									e.target.value
								)
							}
							onFocus={() =>
								setBuildingSearchFocused(
									true
								)
							}
							onBlur={() =>
								setBuildingSearchFocused(
									false
								)
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
								display: "flex",
								flexDirection:
									"column",
								gap: spacing[2],
								maxHeight:
									"150px",
								overflowY: "auto",
								paddingRight:
									spacing[1],
							}}
						>
							{filteredBuildings.length >
							0 ? (
								filteredBuildings.map(
									(b) => (
										<label
											key={
												b.id
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
												type="radio"
												name="building"
												checked={
													task.building_id ===
													String(
														b.id
													)
												}
												onChange={() =>
													setTask(
														{
															...task,
															building_id:
																String(
																	b.id
																),
														}
													)
												}
												style={{
													width: "16px",
													height: "16px",
													cursor: "pointer",
												}}
												aria-label={
													t.selectBuilding
												}
											/>
											<span>
												{
													b.street_address
												}
												,{" "}
												{
													b.district
												}
												,{" "}
												{
													b.city
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
									{t.noResults}
								</div>
							)}
						</div>
						{buildingIdError && (
							<p style={errorStyle}>
								{buildingIdError}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.contractor}
						</label>
						<input
							style={{
								...inputStyle(
									!!assignedToError,
									contractorSearchFocused
								),
								marginBottom:
									spacing[2],
							}}
							type="text"
							value={
								contractorSearch
							}
							onChange={(e) =>
								setContractorSearch(
									e.target.value
								)
							}
							onFocus={() =>
								setContractorSearchFocused(
									true
								)
							}
							onBlur={() =>
								setContractorSearchFocused(
									false
								)
							}
							placeholder={
								t.searchContractors
							}
							aria-label={
								t.searchContractors
							}
						/>
						<div
							style={{
								display: "flex",
								flexDirection:
									"column",
								gap: spacing[2],
								maxHeight:
									"150px",
								overflowY: "auto",
								paddingRight:
									spacing[1],
							}}
						>
							{filteredContractors.length >
							0 ? (
								filteredContractors.map(
									(c) => (
										<label
											key={
												c.id
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
												type="radio"
												name="contractor"
												checked={
													task.assigned_to ===
													String(
														c.id
													)
												}
												onChange={() =>
													setTask(
														{
															...task,
															assigned_to:
																String(
																	c.id
																),
														}
													)
												}
												style={{
													width: "16px",
													height: "16px",
													cursor: "pointer",
												}}
												aria-label={
													t.selectContractor
												}
											/>
											<span>
												{
													c.first_name
												}{" "}
												{
													c.last_name
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
									{t.noResults}
								</div>
							)}
						</div>
						{assignedToError && (
							<p style={errorStyle}>
								{assignedToError}
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
								t.createTask
							}
						>
							{loading
								? t.creating
								: t.createTask}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
