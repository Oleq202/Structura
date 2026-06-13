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
import * as api from "../services/api";

const EMPTY_BUILDINGS = [];
const EMPTY_CONTRACTORS = [];

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
	border: "none",
	margin: 0,
	border: "none",
	margin: 0,
};

const modalContentStyle = {
	width: "100%",
	maxWidth: "360px",
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

const submitButtonStyle = (loading) => ({
	...components.primaryButton,
	flex: 2,
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

const radioLabelBaseStyle = {
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

const initialState = {
	task: {
		title: "",
		description: "",
		building_id: "",
		assigned_to: "",
	},
	loading: false,
	titleError: "",
	descriptionError: "",
	buildingIdError: "",
	assignedToError: "",
	titleFocused: false,
	descriptionFocused: false,
	buildingSearch: "",
	contractorSearch: "",
	buildingSearchFocused: false,
	contractorSearchFocused: false,
};

function reducer(state, action) {
	switch (action.type) {
		case "SET_TASK":
			return {
				...state,
				task: {
					...state.task,
					...action.payload,
				},
			};
		case "SET_LOADING":
			return {
				...state,
				loading: action.payload,
			};
		case "SET_TITLE_ERROR":
			return {
				...state,
				titleError: action.payload,
			};
		case "SET_DESCRIPTION_ERROR":
			return {
				...state,
				descriptionError: action.payload,
			};
		case "SET_BUILDING_ID_ERROR":
			return {
				...state,
				buildingIdError: action.payload,
			};
		case "SET_ASSIGNED_TO_ERROR":
			return {
				...state,
				assignedToError: action.payload,
			};
		case "SET_TITLE_FOCUSED":
			return {
				...state,
				titleFocused: action.payload,
			};
		case "SET_DESCRIPTION_FOCUSED":
			return {
				...state,
				descriptionFocused:
					action.payload,
			};
		case "SET_BUILDING_SEARCH":
			return {
				...state,
				buildingSearch: action.payload,
			};
		case "SET_CONTRACTOR_SEARCH":
			return {
				...state,
				contractorSearch: action.payload,
			};
		case "SET_BUILDING_SEARCH_FOCUSED":
			return {
				...state,
				buildingSearchFocused:
					action.payload,
			};
		case "SET_CONTRACTOR_SEARCH_FOCUSED":
			return {
				...state,
				contractorSearchFocused:
					action.payload,
			};
		case "CLEAR_ERRORS":
			return {
				...state,
				titleError: "",
				descriptionError: "",
				buildingIdError: "",
				assignedToError: "",
			};
		default:
			return state;
	}
}

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
	const [state, dispatch] = useReducer(
		reducer,
		initialState
	);

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

	const filteredContractors =
		contractors.filter((contractor) => {
			const search =
				state.contractorSearch.toLowerCase();
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		dispatch({ type: "CLEAR_ERRORS" });

		if (!state.task.title) {
			dispatch({
				type: "SET_TITLE_ERROR",
				payload: t.required,
			});
			return;
		}

		if (!state.task.building_id) {
			dispatch({
				type: "SET_BUILDING_ID_ERROR",
				payload: t.required,
			});
			return;
		}

		if (!state.task.assigned_to) {
			dispatch({
				type: "SET_ASSIGNED_TO_ERROR",
				payload: t.required,
			});
			return;
		}

		dispatch({
			type: "SET_LOADING",
			payload: true,
		});
		try {
			await api.createTask({
				title: state.task.title,
				description:
					state.task.description,
				building_id: parseInt(
					state.task.building_id
				),
				created_by: currentUser.id,
				assigned_to: parseInt(
					state.task.assigned_to
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
			dispatch({
				type: "SET_LOADING",
				payload: false,
			});
		}
	};

	return (
		<div
			type="button"
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
					{t.createNewTask}
				</h1>
				<form
					onSubmit={handleSubmit}
					style={formStyle}
				>
					<div>
						<label style={labelStyle}>
							{t.title}
						</label>
						<input
							style={inputStyle(
								!!state.titleError,
								state.titleFocused
							)}
							ref={createTaskRef}
							type="text"
							value={
								state.task.title
							}
							onChange={(e) =>
								dispatch({
									type: "SET_TASK",
									payload: {
										title: e
											.target
											.value,
									},
								})
							}
							onFocus={() =>
								dispatch({
									type: "SET_TITLE_FOCUSED",
									payload: true,
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_TITLE_FOCUSED",
									payload: false,
								})
							}
							placeholder={
								t.enterTaskTitle
							}
							aria-label={
								t.enterTaskTitle
							}
						/>
						{state.titleError && (
							<p style={errorStyle}>
								{state.titleError}
							</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							{t.description}
						</label>
						<input
							style={inputStyle(
								!!state.descriptionError,
								state.descriptionFocused
							)}
							type="text"
							value={
								state.task
									.description
							}
							onChange={(e) =>
								dispatch({
									type: "SET_TASK",
									payload: {
										description:
											e
												.target
												.value,
									},
								})
							}
							onFocus={() =>
								dispatch({
									type: "SET_DESCRIPTION_FOCUSED",
									payload: true,
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_DESCRIPTION_FOCUSED",
									payload: false,
								})
							}
							placeholder={
								t.enterTaskDescription
							}
							aria-label={
								t.enterTaskDescription
							}
						/>
						{state.descriptionError && (
							<p style={errorStyle}>
								{
									state.descriptionError
								}
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
									!!state.buildingIdError,
									state.buildingSearchFocused
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
										e.target
											.value,
								})
							}
							onFocus={() =>
								dispatch({
									type: "SET_BUILDING_SEARCH_FOCUSED",
									payload: true,
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_BUILDING_SEARCH_FOCUSED",
									payload: false,
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
											style={
												radioLabelBaseStyle
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
												type="radio"
												name="building"
												checked={
													state
														.task
														.building_id ===
													String(
														b.id
													)
												}
												onChange={() =>
													dispatch(
														{
															type: "SET_TASK",
															payload:
																{
																	building_id:
																		String(
																			b.id
																		),
																},
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
						{state.buildingIdError && (
							<p style={errorStyle}>
								{
									state.buildingIdError
								}
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
									!!state.assignedToError,
									state.contractorSearchFocused
								),
								marginBottom:
									spacing[2],
							}}
							type="text"
							value={
								state.contractorSearch
							}
							onChange={(e) =>
								dispatch({
									type: "SET_CONTRACTOR_SEARCH",
									payload:
										e.target
											.value,
								})
							}
							onFocus={() =>
								dispatch({
									type: "SET_CONTRACTOR_SEARCH_FOCUSED",
									payload: true,
								})
							}
							onBlur={() =>
								dispatch({
									type: "SET_CONTRACTOR_SEARCH_FOCUSED",
									payload: false,
								})
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
											style={
												radioLabelBaseStyle
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
												type="radio"
												name="contractor"
												checked={
													state
														.task
														.assigned_to ===
													String(
														c.id
													)
												}
												onChange={() =>
													dispatch(
														{
															type: "SET_TASK",
															payload:
																{
																	assigned_to:
																		String(
																			c.id
																		),
																},
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
						{state.assignedToError && (
							<p style={errorStyle}>
								{
									state.assignedToError
								}
							</p>
						)}
					</div>

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
							style={submitButtonStyle(
								state.loading
							)}
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
								t.createTask
							}
						>
							{state.loading
								? t.creating
								: t.createTask}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
