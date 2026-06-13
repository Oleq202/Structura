import { useState, useEffect } from "react";
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
import UserModal from "./UserModal";
import * as api from "../services/api";

const getRoleBadgeColor = (role) => {
	switch (role) {
		case "admin":
			return {
				bg: "#fcebeb",
				border: "#f09595",
				text: "#791f1f",
			};
		case "manager":
			return {
				bg: "#e0ecfa",
				border: "#85b7eb",
				text: "#0e4d8a",
			};
		case "contractor":
			return {
				bg: "#eaf3de",
				border: "#97c459",
				text: "#2d5e10",
			};
		default:
			return {
				bg: "#f4f7fb",
				border: "#b0c4d8",
				text: "#3a5068",
			};
	}
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
};

const modalContentStyle = {
	width: "100%",
	maxWidth: "600px",
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

const usersListStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[3],
	marginTop: spacing[4],
};

const userItemStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: `${spacing[3]} ${spacing[4]}`,
	background: colors.cardBg,
	border: `0.5px solid ${colors.cardBorder}`,
	borderRadius: radius.lg,
	transition:
		"border-color 0.15s, background 0.15s",
};

const userInfoStyle = {
	flex: 1,
};

const userNameStyle = {
	fontSize: font.size.base,
	fontWeight: font.weight.medium,
	color: colors.textBody,
	marginBottom: spacing[1],
};

const userRoleStyle = {
	fontSize: font.size.sm,
	color: colors.textSecondary,
};

const actionButtonsStyle = {
	display: "flex",
	gap: spacing[2],
	flexShrink: 0,
};

const editButtonStyle = {
	background: "transparent",
	border: `1px solid ${colors.borderDefault}`,
	color: colors.textBody,
	padding: `${spacing[1]} ${spacing[2]}`,
	borderRadius: radius.md,
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	transition: "border-color 0.15s, color 0.15s",
	whiteSpace: "nowrap",
};

const deleteButtonStyle = {
	background: "transparent",
	border: `1px solid ${status.danger.border}`,
	color: status.danger.text,
	padding: `${spacing[1]} ${spacing[2]}`,
	borderRadius: radius.md,
	fontSize: font.size.xs,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	cursor: "pointer",
	transition: "background 0.15s",
	whiteSpace: "nowrap",
};

const emptyStateStyle = {
	textAlign: "center",
	padding: spacing[8],
	color: colors.textSecondary,
};

const addUserButtonStyle = {
	...components.primaryButton,
	width: "100%",
	padding: `${spacing[3]} ${spacing[4]}`,
	borderRadius: radius.lg,
	fontSize: font.size.base,
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: "pointer",
	boxSizing: "border-box",
	marginBottom: spacing[6],
};

const usersContainerStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[3],
	maxHeight: "60vh",
	overflowY: "auto",
	paddingRight: spacing[2],
};

const roleBadgeBaseStyle = {
	fontSize: font.size.xs,
	padding: `4px ${spacing[2]}`,
	borderRadius: radius.sm,
	fontWeight: font.weight.medium,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	height: "24px",
};

export default function UsersManagementModal({
	onClose,
	language,
}) {
	const t = translations[language];
	const [users, setUsers] = useState([]);
	const [buildings, setBuildings] = useState(
		[]
	);
	useEffect(() => {
		Promise.all([
			api.getUsers(),
			api.getBuildings(),
		])
			.then(([users, buildings]) => {
				setUsers(users);
				setBuildings(buildings);
			})
			.catch(console.error);
	}, []);

	const [editingUser, setEditingUser] =
		useState(null);

	const handleEdit = (user) => {
		setEditingUser(user);
	};

	const handleDelete = async (user_id) => {
		if (confirm(t.deleteUserConfirm)) {
			await api.deleteUser(user_id);
			setUsers(
				users.filter(
					(u) => u.id !== user_id
				)
			);
		}
	};

	const handleUserSaved = async (savedUser) => {
		if (editingUser?.id) {
			const updated = await api.updateUser(
				savedUser.id,
				savedUser
			);
			setUsers(
				users.map((u) =>
					u.id === updated.id
						? updated
						: u
				)
			);
		} else {
			const created =
				await api.createUser(savedUser);
			setUsers([...users, created]);
		}
		setEditingUser(null);
	};

	return (
		<>
			<div
				style={modalOverlayStyle}
				onClick={() => onClose?.()}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						e.preventDefault();
						onClose?.();
					}
				}}
				role="presentation"
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
						{t.addUser}
					</h1>

					<button
						type="button"
						onClick={() =>
							setEditingUser({})
						}
						style={addUserButtonStyle}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background =
								colors.primaryHover)
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background =
								colors.primary)
						}
						aria-label={
							t.addUserButton
						}
					>
						{t.addUserButton}
					</button>

					<div
						style={
							usersContainerStyle
						}
					>
						{users.map((user) => {
							const badgeColor =
								getRoleBadgeColor(
									user.role
								);
							return (
								<div
									key={user.id}
									style={
										userItemStyle
									}
								>
									<div
										style={
											userInfoStyle
										}
									>
										<div
											style={{
												display:
													"flex",
												alignItems:
													"center",
												gap: spacing[2],
											}}
										>
											<span
												style={
													userNameStyle
												}
											>
												{
													user.first_name
												}{" "}
												{
													user.last_name
												}
											</span>
											<span
												style={{
													...roleBadgeBaseStyle,
													background:
														badgeColor.bg,
													border: `0.5px solid ${badgeColor.border}`,
													color: badgeColor.text,
												}}
											>
												{
													t[
														user
															.role
													]
												}
											</span>
										</div>
									</div>
									<div
										style={
											actionButtonsStyle
										}
									>
										<button
											type="button"
											onClick={() =>
												handleEdit(
													user
												)
											}
											style={
												editButtonStyle
											}
											onMouseEnter={(
												e
											) => {
												e.currentTarget.style.borderColor =
													colors.borderStrong;
												e.currentTarget.style.color =
													colors.textHeading;
											}}
											onMouseLeave={(
												e
											) => {
												e.currentTarget.style.borderColor =
													colors.borderDefault;
												e.currentTarget.style.color =
													colors.textBody;
											}}
											aria-label={
												t.edit
											}
										>
											{
												t.edit
											}
										</button>
										<button
											type="button"
											onClick={() =>
												handleDelete(
													user.id
												)
											}
											style={
												deleteButtonStyle
											}
											onMouseEnter={(
												e
											) => {
												e.currentTarget.style.background =
													status.danger.bg;
											}}
											onMouseLeave={(
												e
											) => {
												e.currentTarget.style.background =
													"transparent";
											}}
											aria-label={
												t.delete
											}
										>
											{
												t.delete
											}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{editingUser !== null && (
				<UserModal
					user={
						editingUser.id
							? editingUser
							: null
					}
					buildings={buildings}
					onClose={() =>
						setEditingUser(null)
					}
					onSave={handleUserSaved}
					language={language}
				/>
			)}
		</>
	);
}
