import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
	colors,
	font,
	spacing,
	radius,
} from "../theme";
import { translations } from "../i18n";
import * as api from "../services/api";
import UserModal from "./UserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { Modal, Button, Badge } from "./ui";
import useToast from "../hooks/useToast";
import {
	IconUsers,
	IconPlus,
	IconSearch,
	IconEdit,
	IconTrash,
} from "./icons";

const ROLE_STATUS_MAP = {
	admin: "danger",
	manager: "info",
	contractor: "pending",
};

function getRoleLabel(role, t) {
	if (role === "admin") return t.admin || "Administrator";
	if (role === "manager") return t.manager || "Zarządca";
	return t.contractor || "Wykonawca";
}

function getUserInitials(user) {
	const parts = [user.first_name, user.last_name].filter(Boolean);
	if (parts.length > 0) return parts.map((n) => n[0].toUpperCase()).join("");
	return user.login?.[0]?.toUpperCase() || "?";
}

function compareUsers(a, b) {
	const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.login || "";
	const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.login || "";
	return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
}

function UserListItem({ user, isCurrentUser, onEdit, onDelete, t }) {
	const initials = getUserInitials(user);
	const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.login;
	const roleLabel = getRoleLabel(user.role, t);
	const roleStatus = ROLE_STATUS_MAP[user.role] || "pending";

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: `${spacing[3]} ${spacing[3]}`,
				borderRadius: radius.md,
				background: colors.pageBg,
				border: `1px solid ${colors.borderSubtle}`,
				gap: spacing[2],
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: spacing[3], flex: 1, minWidth: 0 }}>
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: radius.full,
						background: colors.primaryLight,
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: font.size.sm,
						fontWeight: font.weight.bold,
						flexShrink: 0,
					}}
				>
					{initials}
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ display: "flex", alignItems: "center", gap: spacing[2], flexWrap: "wrap" }}>
						<span
							style={{
								fontWeight: font.weight.semibold,
								color: colors.textHeading,
								fontSize: font.size.base,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
							}}
						>
							{fullName}
						</span>
						{isCurrentUser && (
							<span
								style={{
									fontSize: font.size.xs,
									color: colors.primary,
									fontWeight: font.weight.semibold,
								}}
							>
								({t.you || "Ty"})
							</span>
						)}
					</div>

					<div style={{ display: "flex", alignItems: "center", gap: spacing[2], marginTop: "2px" }}>
						<span style={{ fontSize: font.size.xs, color: colors.textSecondary }}>
							@{user.login}
						</span>
						<Badge status={roleStatus} dot={false} style={{ fontSize: "11px", padding: "1px 6px" }}>
							{roleLabel}
						</Badge>
					</div>
				</div>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
				<button
					type="button"
					onClick={() => onEdit(user)}
					title={t.edit || "Edytuj"}
					aria-label={`${t.edit || "Edytuj"} ${fullName}`}
					style={{
						background: colors.cardBg,
						border: `1px solid ${colors.borderDefault}`,
						borderRadius: radius.md,
						color: colors.textHeading,
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						minWidth: "44px",
						minHeight: "44px",
						cursor: "pointer",
						transition: "background 0.15s, border-color 0.15s",
					}}
				>
					<IconEdit size="sm" />
				</button>

				{!isCurrentUser && (
					<button
						type="button"
						onClick={() => onDelete(user)}
						title={t.delete || "Usuń"}
						aria-label={`${t.delete || "Usuń"} ${fullName}`}
						style={{
							background: "#fef2f2",
							border: "1px solid #fca5a5",
							borderRadius: radius.md,
							color: "#991b1b",
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							minWidth: "44px",
							minHeight: "44px",
							cursor: "pointer",
							transition: "background 0.15s, border-color 0.15s",
						}}
					>
						<IconTrash size="sm" />
					</button>
				)}
			</div>
		</div>
	);
}

function UserListContent({ loading, users, currentUserId, onEdit, onDelete, t }) {
	if (loading) {
		return (
			<div
				style={{
					padding: `${spacing[8]} 0`,
					textAlign: "center",
					color: colors.textSecondary,
					fontSize: font.size.sm,
				}}
			>
				{t.loading || "Ładowanie..."}
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div
				style={{
					padding: `${spacing[8]} 0`,
					textAlign: "center",
					color: colors.textSecondary,
					fontSize: font.size.sm,
				}}
			>
				{t.noResults || "Nie znaleziono użytkowników"}
			</div>
		);
	}

	return users.map((user) => (
		<UserListItem
			key={user.id}
			user={user}
			isCurrentUser={user.id === currentUserId}
			onEdit={onEdit}
			onDelete={onDelete}
			t={t}
		/>
	));
}

function useUsersManagement(language, toast) {
	const [users, setUsers] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState(null);
	const [userToDelete, setUserToDelete] = useState(null);
	const [isDeletingUser, setIsDeletingUser] = useState(false);
	const [loading, setLoading] = useState(true);

	const refreshUsers = useCallback(() => {
		api.getUsers()
			.then((data) => setUsers(data || []))
			.catch(console.error);
	}, []);

	useEffect(() => {
		let isMounted = true;
		api.getUsers()
			.then((data) => {
				if (isMounted) setUsers(data || []);
			})
			.catch(console.error)
			.finally(() => {
				if (isMounted) setLoading(false);
			});
		return () => {
			isMounted = false;
		};
	}, []);

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;
		try {
			setIsDeletingUser(true);
			await api.deleteUser(userToDelete.id);
			setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
			setUserToDelete(null);
			toast.success(language === "pl" ? "Użytkownik został usunięty" : "User deleted");
		} catch (err) {
			console.error("Error deleting user", err);
			toast.error(language === "pl" ? "Nie udało się usunąć użytkownika" : "Failed to delete user");
		} finally {
			setIsDeletingUser(false);
		}
	};

	const handleUserSaved = async (savedUser) => {
		try {
			if (editingUser?.id) {
				const updated = await api.updateUser(savedUser.id, savedUser);
				setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
			} else {
				const created = await api.createUser(savedUser);
				setUsers((prev) => [...prev, created]);
			}
			toast.success(language === "pl" ? "Użytkownik został zapisany" : "User saved");
			setEditingUser(null);
		} catch (err) {
			console.error("Error saving user", err);
			toast.error(err?.message || (language === "pl" ? "Nie udało się zapisać użytkownika" : "Failed to save user"));
			throw err;
		}
	};

	const filteredUsers = useMemo(() => {
		const search = searchQuery.toLowerCase();
		return users
			.filter((u) => {
				const fullName = `${u.first_name || ""} ${u.last_name || ""} ${u.login || ""}`.toLowerCase();
				return fullName.includes(search);
			})
			.sort(compareUsers);
	}, [users, searchQuery]);

	return {
		users,
		loading,
		searchQuery,
		setSearchQuery,
		editingUser,
		setEditingUser,
		userToDelete,
		setUserToDelete,
		isDeletingUser,
		handleConfirmDelete,
		handleUserSaved,
		refreshUsers,
		filteredUsers,
	};
}

function getUserDeleteName(user) {
	if (!user) return "";
	return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.login || "";
}

function UsersSearchBar({ searchQuery, onSearchChange, onAdd, t }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: spacing[2],
				marginBottom: spacing[3],
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
						pointerEvents: "none",
					}}
				>
					<IconSearch size="sm" />
				</span>
				<input
					type="text"
					placeholder={t.searchUsers || "Szukaj użytkowników..."}
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					style={{
						width: "100%",
						minHeight: "44px",
						padding: `0 ${spacing[2]} 0 ${spacing[8]}`,
						fontSize: font.size.md,
						fontFamily: font.family.sans,
						color: colors.textBody,
						background: colors.pageBg,
						border: `1px solid ${colors.borderDefault}`,
						borderRadius: radius.md,
						boxSizing: "border-box",
						outline: "none",
					}}
				/>
			</div>

			<Button
				variant="primary"
				size="md"
				onClick={onAdd}
				style={{ flexShrink: 0 }}
			>
				<IconPlus size="sm" />
				<span>{t.addUserButton || "Dodaj"}</span>
			</Button>
		</div>
	);
}

function UserSubModals({
	editingUser,
	onCloseEditing,
	onSaveUser,
	userToDelete,
	onCloseDelete,
	onConfirmDelete,
	isDeletingUser,
	language,
	t,
}) {
	const deleteUserName = getUserDeleteName(userToDelete);

	return (
		<>
			{editingUser && (
				<UserModal
					isOpen={!!editingUser}
					user={editingUser.id ? editingUser : null}
					onClose={onCloseEditing}
					onSave={onSaveUser}
					language={language}
				/>
			)}

			{userToDelete && (
				<DeleteConfirmModal
					isOpen={!!userToDelete}
					onClose={onCloseDelete}
					onConfirm={onConfirmDelete}
					isDeleting={isDeletingUser}
					title={t.deleteUserConfirmTitle || "Usunięcie użytkownika"}
					message={t.deleteUserModalMsg || t.deleteUserConfirm}
					itemName={deleteUserName}
					itemType={t.user || "Użytkownik"}
					language={language}
				/>
			)}
		</>
	);
}

export default function UsersManagementModal({
	isOpen = true,
	onClose,
	currentUser,
	language = "pl",
}) {
	const t = translations[language] || translations.pl;
	const { toast } = useToast();
	const listRef = useRef(null);

	const {
		users,
		loading,
		searchQuery,
		setSearchQuery,
		editingUser,
		setEditingUser,
		userToDelete,
		setUserToDelete,
		isDeletingUser,
		handleConfirmDelete,
		handleUserSaved,
		filteredUsers,
	} = useUsersManagement(language, toast);

	if (!isOpen) return null;

	const modalTitle = (
		<div style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
			<span>{t.users || "Użytkownicy"}</span>
			<span
				style={{
					padding: "2px 8px",
					borderRadius: radius.full,
					fontSize: font.size.xs,
					fontWeight: font.weight.semibold,
					background: colors.primaryLight,
					color: colors.primary,
				}}
			>
				{users.length}
			</span>
		</div>
	);

	const modalFooter = (
		<Button variant="secondary" size="md" onClick={onClose}>
			{t.close || (language === "pl" ? "Zamknij" : "Close")}
		</Button>
	);

	const isMainModalOpen = !editingUser && !userToDelete;

	return (
		<>
			<Modal
				isOpen={isMainModalOpen}
				onClose={onClose}
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
						<IconUsers size="md" />
					</div>
				}
				footer={modalFooter}
				maxWidth="580px"
			>
				<UsersSearchBar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onAdd={() => setEditingUser({})}
					t={t}
				/>

				<div
					ref={listRef}
					style={{
						maxHeight: "380px",
						overflowY: "auto",
						WebkitOverflowScrolling: "touch",
						display: "flex",
						flexDirection: "column",
						gap: spacing[2],
						paddingRight: spacing[1],
					}}
				>
					<UserListContent
						loading={loading}
						users={filteredUsers}
						currentUserId={currentUser?.id}
						onEdit={setEditingUser}
						onDelete={setUserToDelete}
						t={t}
					/>
				</div>
			</Modal>

			<UserSubModals
				editingUser={editingUser}
				onCloseEditing={() => setEditingUser(null)}
				onSaveUser={handleUserSaved}
				userToDelete={userToDelete}
				onCloseDelete={() => setUserToDelete(null)}
				onConfirmDelete={handleConfirmDelete}
				isDeletingUser={isDeletingUser}
				language={language}
				t={t}
			/>
		</>
	);
}
