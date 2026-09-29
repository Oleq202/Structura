import { useState, useRef, useEffect, useEffectEvent } from "react";
import { createPortal } from "react-dom";
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
import UserModal from "./UserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const ICONS = {
	users: (
		<svg
			width="20"
			height="20"
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
	plus: (
		<svg
			width="14"
			height="14"
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
	search: (
		<svg
			width="14"
			height="14"
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
	close: (
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
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	),
};

const getRoleBadgeStyle = (role) => {
	switch (role) {
		case "admin":
			return {
				bg: "#fee2e2",
				border: "#fca5a5",
				text: "#991b1b",
			};
		case "manager":
			return {
				bg: "#e0e7ff",
				border: "#c7d2fe",
				text: "#3730a3",
			};
		case "contractor":
			return {
				bg: "#fef3c7",
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

const ROLE_ORDER = { admin: 1, manager: 2, contractor: 3 };

function compareUsers(a, b) {
	const roleA = ROLE_ORDER[a.role] ?? 99;
	const roleB = ROLE_ORDER[b.role] ?? 99;
	if (roleA !== roleB) {
		return roleA - roleB;
	}
	const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.login || "";
	const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.login || "";
	return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
}

function UserAvatar({ firstName, lastName, login }) {
	const initials =
		[firstName, lastName]
			.filter(Boolean)
			.map((n) => n[0].toUpperCase())
			.join("") ||
		(login ? login.substring(0, 2).toUpperCase() : "?");

	return (
		<div
			style={{
				...components.avatar,
				width: "32px",
				height: "32px",
				fontSize: "11px",
				flexShrink: 0,
			}}
		>
			{initials}
		</div>
	);
}

function UserListItem({ user, onEdit, onDelete, t }) {
	const roleStyle = getRoleBadgeStyle(user.role);
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.login;

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "8px 10px",
				borderRadius: radius.md,
				background: colors.pageBg,
				border: `1px solid ${colors.borderSubtle}`,
				gap: spacing[2],
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: spacing[2], flex: 1, minWidth: 0 }}>
				<UserAvatar
					firstName={user.first_name}
					lastName={user.last_name}
					login={user.login}
				/>
				<div style={{ minWidth: 0, flex: 1 }}>
					<div
						style={{
							fontWeight: font.weight.big,
							color: colors.textHeading,
							fontSize: "13px",
							lineHeight: 1.25,
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
							marginTop: "2px",
							flexWrap: "wrap",
						}}
					>
						<span
							style={{
								fontSize: font.size.xs,
								color: colors.textSecondary,
							}}
						>
							@{user.login}
						</span>
						<span
							style={{
								padding: "1px 5px",
								borderRadius: radius.sm,
								fontSize: "9px",
								fontWeight: font.weight.big,
								background: roleStyle.bg,
								border: `1px solid ${roleStyle.border}`,
								color: roleStyle.text,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								flexShrink: 0,
							}}
						>
							{t[user.role] || user.role}
						</span>
					</div>
				</div>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
				<button
					type="button"
					onClick={() => onEdit(user)}
					title={t.edit || "Edit"}
					aria-label={t.edit || "Edit"}
					style={{
						...components.ghostButton,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						minWidth: "44px",
						minHeight: "44px",
						padding: "6px 8px",
						fontSize: "11px",
						borderRadius: radius.sm,
						boxSizing: "border-box",
					}}
				>
					{ICONS.edit}
					<span className="user-action-label">{t.edit || "Edit"}</span>
				</button>
				<button
					type="button"
					onClick={() => onDelete(user)}
					title={t.delete || "Delete"}
					aria-label={t.delete || "Delete"}
					style={{
						background: "transparent",
						border: `1px solid ${status.danger.border}`,
						color: status.danger.text,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						minWidth: "44px",
						minHeight: "44px",
						padding: "6px 8px",
						fontSize: "11px",
						borderRadius: radius.sm,
						cursor: "pointer",
						transition: "background 0.15s",
						boxSizing: "border-box",
					}}
					onMouseEnter={(e) =>
						(e.currentTarget.style.background = status.danger.bg)
					}
					onMouseLeave={(e) =>
						(e.currentTarget.style.background = "transparent")
					}
				>
					{ICONS.trash}
					<span className="user-action-label">{t.delete || "Delete"}</span>
				</button>
			</div>
		</div>
	);
}

function UsersModalHeader({ count, language, t, onClose }) {
	return (
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
						{count} {t.allUsersCount || (language === "pl" ? "użytkowników" : "users")}
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
					width: "44px",
					height: "44px",
					minWidth: "44px",
					minHeight: "44px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					color: colors.shellTextMuted,
					transition: "background 0.15s, color 0.15s",
					boxSizing: "border-box",
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
	);
}

function UsersSearchBar({ searchQuery, setSearchQuery, onAddUser, t }) {
	return (
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
				onClick={onAddUser}
				style={{
					...components.primaryButton,
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "44px",
					minWidth: "44px",
					boxSizing: "border-box",
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
	);
}

export default function UsersManagementModal({
	onClose,
	language = "pl",
}) {
	const t = translations[language];
	const [users, setUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState(null);
	const [userToDelete, setUserToDelete] = useState(null);
	const [isDeletingUser, setIsDeletingUser] = useState(false);
	const bodyRef = useRef(null);

	useEffect(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = 0;
		}
		api.getUsers()
			.then(setUsers)
			.catch(console.error);
	}, []);

	const handleKeyDownEvent = useEffectEvent((e) => {
		if (e.key === "Escape" && !editingUser && !userToDelete) {
			onClose?.();
		}
	});

	useEffect(() => {
		const handleKeyDown = (e) => {
			handleKeyDownEvent(e);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleEdit = (user) => {
		setEditingUser(user);
	};

	const handleDelete = (user) => {
		setUserToDelete(user);
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;
		try {
			setIsDeletingUser(true);
			await api.deleteUser(userToDelete.id);
			setUsers(users.filter((u) => u.id !== userToDelete.id));
			setUserToDelete(null);
		} catch (err) {
			console.error("Error deleting user", err);
		} finally {
			setIsDeletingUser(false);
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

	const filteredUsers = users
		.filter((u) => {
			const search = searchQuery.toLowerCase();
			const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.login || ""}`.toLowerCase();
			return fullName.includes(search);
		})
		.sort(compareUsers);

	return (
		<>
			{createPortal(
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						height: "100%",
						minHeight: "100dvh",
						maxHeight: "100dvh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 99999,
						padding: "calc(12px + env(safe-area-inset-top, 0px)) 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px",
						boxSizing: "border-box",
					}}
				>
					<button
						type="button"
						aria-label={t.close || "Zamknij"}
						tabIndex={-1}
						onClick={() => onClose?.()}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(9, 21, 42, 0.65)",
							backdropFilter: "blur(6px)",
							WebkitBackdropFilter: "blur(6px)",
							border: "none",
							padding: 0,
							margin: 0,
							cursor: "default",
							width: "100%",
							height: "100%",
						}}
					/>
					<div
						style={{
							position: "relative",
							zIndex: 1,
							background: colors.cardBg,
							borderRadius: radius.xl,
							boxShadow: shadow.modal,
							border: `1px solid ${colors.borderSubtle}`,
							width: "100%",
							maxWidth: "580px",
							maxHeight: "calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
							boxSizing: "border-box",
							fontFamily: font.family.sans,
						}}
					>
						<UsersModalHeader
							count={users.length}
							language={language}
							t={t}
							onClose={onClose}
						/>

						<UsersSearchBar
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onAddUser={() => setEditingUser({})}
							t={t}
						/>

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
								filteredUsers.map((user) => (
									<UserListItem
										key={user.id}
										user={user}
										onEdit={handleEdit}
										onDelete={handleDelete}
										t={t}
									/>
								))
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
									minHeight: "44px",
									minWidth: "44px",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									boxSizing: "border-box",
									padding: `${spacing[2]} ${spacing[5]}`,
									fontSize: font.size.sm,
								}}
							>
								{t.close || (language === "pl" ? "Zamknij" : "Close")}
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}

			{editingUser && (
				<UserModal
					user={editingUser.id ? editingUser : null}
					onClose={() => setEditingUser(null)}
					onSave={handleUserSaved}
					language={language}
				/>
			)}

			{userToDelete && (
				<DeleteConfirmModal
					isOpen={!!userToDelete}
					onClose={() => setUserToDelete(null)}
					onConfirm={handleConfirmDelete}
					isDeleting={isDeletingUser}
					title={t.deleteUserConfirmTitle || "Usunięcie użytkownika"}
					message={t.deleteUserModalMsg || t.deleteUserConfirm}
					itemName={
						[userToDelete.first_name, userToDelete.last_name].filter(Boolean).join(" ")
							? `${[userToDelete.first_name, userToDelete.last_name].filter(Boolean).join(" ")} (@${userToDelete.login})`
							: `@${userToDelete.login}`
					}
					itemType={t.user || "Użytkownik"}
					language={language}
				/>
			)}
		</>
	);
}
