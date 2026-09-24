import { useState, useEffect, useRef } from "react";
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

const ICONS = {
	users: (
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
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
	search: (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
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
	plus: (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	),
	edit: (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</svg>
	),
	trash: (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</svg>
	),
};

const getRoleBadgeStyle = (role) => {
	switch (role) {
		case "admin":
			return {
				bg: "#eef2ff",
				border: "#c7d2fe",
				text: "#4338ca",
			};
		case "manager":
			return {
				bg: "#ecfdf5",
				border: "#a7f3d0",
				text: "#065f46",
			};
		case "contractor":
			return {
				bg: "#fffbeb",
				border: "#fde68a",
				text: "#92400e",
			};
		default:
			return {
				bg: "#f3f4f6",
				border: "#e5e7eb",
				text: "#374151",
			};
	}
};

export default function UsersManagementModal({
	onClose,
	language = "pl",
}) {
	const t = translations[language];
	const [users, setUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState(null);
	const bodyRef = useRef(null);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		api.getUsers()
			.then(setUsers)
			.catch(console.error);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && !editingUser) {
				onClose?.();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, editingUser]);

	const handleEdit = (user) => {
		setEditingUser(user);
	};

	const handleDelete = async (userId) => {
		if (confirm(t.deleteUserConfirm)) {
			await api.deleteUser(userId);
			setUsers(users.filter((u) => u.id !== userId));
		}
	};

	const handleUserSaved = async (savedUser) => {
		try {
			if (editingUser?.id) {
				const updated = await api.updateUser(savedUser.id, savedUser);
				setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
			} else {
				const created = await api.createUser(savedUser);
				setUsers([...users, created]);
			}
		} catch (err) {
			console.error("Error saving user", err);
		}
		setEditingUser(null);
	};

	const filteredUsers = users.filter((u) => {
		const search = searchQuery.toLowerCase();
		const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.login || ""}`.toLowerCase();
		return fullName.includes(search);
	});

	return (
		<>
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
						maxWidth: "580px",
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
								{ICONS.users}
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
									{t.manageUsers || t.users || "Users"}
								</h3>
								<p
									style={{
										margin: "2px 0 0 0",
										fontSize: font.size.xs,
										color: colors.shellTextMuted,
									}}
								>
									{users.length} {t.allUsersCount || (language === "pl" ? "użytkowników" : "users")}
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

					<div
						style={{
							padding: `${spacing[3]} ${spacing[5]}`,
							background: colors.pageBg,
							borderBottom: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							alignItems: "center",
							gap: spacing[3],
						}}
					>
						<div
							style={{
								position: "relative",
								display: "flex",
								alignItems: "center",
								flex: 1,
							}}
						>
							<span
								style={{
									position: "absolute",
									left: spacing[3],
									color: colors.textSecondary,
									display: "flex",
									alignItems: "center",
								}}
							>
								{ICONS.search}
							</span>
							<input
								type="text"
								placeholder={t.searchUsers || "Search users..."}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{
									...components.input,
									paddingLeft: spacing[8],
									fontSize: font.size.sm,
									borderRadius: radius.md,
									width: "100%",
									boxSizing: "border-box",
								}}
							/>
						</div>
						<button
							type="button"
							onClick={() => setEditingUser({})}
							style={{
								...components.primaryButton,
								display: "flex",
								alignItems: "center",
								gap: spacing[2],
								padding: `${spacing[2]} ${spacing[4]}`,
								fontSize: font.size.sm,
								borderRadius: radius.md,
								whiteSpace: "nowrap",
							}}
						>
							{ICONS.plus}
							<span>{t.addUserButton || "Add User"}</span>
						</button>
					</div>

					<div
						ref={bodyRef}
						style={{
							padding: `${spacing[3]} ${spacing[5]}`,
							overflowY: "auto",
							flex: 1,
							display: "flex",
							flexDirection: "column",
							gap: spacing[2],
							background: colors.cardBg,
						}}
					>
						{filteredUsers.length === 0 ? (
							<div
								style={{
									padding: `${spacing[8]} 0`,
									textAlign: "center",
									color: colors.textSecondary,
									fontSize: font.size.sm,
								}}
							>
								{t.noResults || "No users found"}
							</div>
						) : (
							filteredUsers.map((u) => {
								const badge = getRoleBadgeStyle(u.role);
								const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.login;
								const roleLabel = t[u.role] || u.role;

								return (
									<div
										key={u.id}
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "8px 12px",
											borderRadius: radius.md,
											background: colors.pageBg,
											border: `1px solid ${colors.borderSubtle}`,
											gap: spacing[3],
										}}
									>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													fontWeight: font.weight.big,
													color: colors.textHeading,
													fontSize: "13px",
													lineHeight: 1.3,
													wordBreak: "break-word",
												}}
											>
												{fullName}
											</div>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "6px",
													marginTop: "3px",
													flexWrap: "wrap",
												}}
											>
												<span
													style={{
														fontSize: font.size.xs,
														color: colors.textSecondary,
													}}
												>
													@{u.login}
												</span>
												<span
													style={{
														fontSize: "10px",
														fontWeight: font.weight.medium,
														padding: "1px 6px",
														borderRadius: radius.full,
														background: badge.bg,
														border: `1px solid ${badge.border}`,
														color: badge.text,
														lineHeight: 1.2,
													}}
												>
													{roleLabel}
												</span>
											</div>
										</div>

										<div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
											<button
												type="button"
												onClick={() => handleEdit(u)}
												style={{
													...components.ghostButton,
													display: "flex",
													alignItems: "center",
													gap: "4px",
													padding: "4px 8px",
													fontSize: "11px",
													borderRadius: radius.sm,
												}}
											>
												{ICONS.edit}
												<span>{t.edit || "Edit"}</span>
											</button>
											<button
												type="button"
												onClick={() => handleDelete(u.id)}
												style={{
													background: "transparent",
													border: `1px solid ${status.danger.border}`,
													color: status.danger.text,
													display: "flex",
													alignItems: "center",
													gap: "4px",
													padding: "4px 8px",
													fontSize: "11px",
													borderRadius: radius.sm,
													cursor: "pointer",
													transition: "background 0.15s",
												}}
												onMouseEnter={(e) =>
													(e.currentTarget.style.background = status.danger.bg)
												}
												onMouseLeave={(e) =>
													(e.currentTarget.style.background = "transparent")
												}
											>
												{ICONS.trash}
												<span>{t.delete || "Delete"}</span>
											</button>
										</div>
									</div>
								);
							})
						)}
					</div>

					<div
						style={{
							padding: `${spacing[3]} ${spacing[5]}`,
							background: colors.pageBg,
							borderTop: `1px solid ${colors.borderSubtle}`,
							display: "flex",
							justifyContent: "flex-end",
							flexShrink: 0,
						}}
					>
						<button
							type="button"
							onClick={onClose}
							style={{
								...components.ghostButton,
								padding: `${spacing[2]} ${spacing[5]}`,
								fontSize: font.size.sm,
							}}
						>
							{t.close || (language === "pl" ? "Zamknij" : "Close")}
						</button>
					</div>
				</div>
			</div>

			{editingUser && (
				<UserModal
					user={editingUser.id ? editingUser : null}
					onClose={() => setEditingUser(null)}
					onSave={handleUserSaved}
					language={language}
				/>
			)}
		</>
	);
}
