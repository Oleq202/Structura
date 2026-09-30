import { useState } from "react";
import {
	colors,
	font,
	spacing,
	radius,
	shadow,
} from "../theme";
import { translations } from "../i18n";
import UsersManagementModal from "../components/UsersManagementModal";
import BuildingsManagementModal from "../components/BuildingsManagementModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import { Button, Badge } from "../components/ui";
import {
	IconUsers,
	IconBuilding,
	IconKey,
	IconLogout,
	IconChevronRight,
	IconGlobe,
} from "../components/icons";
import * as api from "../services/api";

function SettingsSection({ title, children }) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: spacing[2] }}>
			{title && (
				<span
					style={{
						fontSize: font.size.xs,
						fontWeight: font.weight.semibold,
						color: colors.textSecondary,
						textTransform: "uppercase",
						letterSpacing: font.letterSpacing.caps,
						paddingLeft: spacing[1],
					}}
				>
					{title}
				</span>
			)}
			<div
				style={{
					background: colors.cardBg,
					borderRadius: radius.xl,
					border: `1px solid ${colors.cardBorder}`,
					boxShadow: shadow.sm,
					overflow: "hidden",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{children}
			</div>
		</div>
	);
}

function SettingsTile({
	icon,
	title,
	description,
	onClick,
	trailing,
	isDanger = false,
	showBorder = true,
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: spacing[3],
				padding: `${spacing[3]} ${spacing[4]}`,
				background: "transparent",
				border: "none",
				borderBottom: showBorder ? `1px solid ${colors.borderSubtle}` : "none",
				cursor: "pointer",
				width: "100%",
				textAlign: "left",
				boxSizing: "border-box",
				minHeight: "56px",
				transition: "background-color 0.15s ease",
			}}
			onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.pageBg)}
			onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
		>
			<div style={{ display: "flex", alignItems: "center", gap: spacing[3], flex: 1, minWidth: 0 }}>
				<div
					style={{
						width: "36px",
						height: "36px",
						borderRadius: radius.md,
						background: isDanger ? "#fee2e2" : colors.primaryLight,
						color: isDanger ? "#dc2626" : colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					{icon}
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontSize: font.size.base,
							fontWeight: font.weight.semibold,
							color: isDanger ? "#dc2626" : colors.textHeading,
						}}
					>
						{title}
					</div>
					{description && (
						<div
							style={{
								fontSize: font.size.xs,
								color: colors.textSecondary,
								marginTop: "2px",
							}}
						>
							{description}
						</div>
					)}
				</div>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: spacing[2], flexShrink: 0 }}>
				{trailing}
				{!trailing && (
					<IconChevronRight
						size="sm"
						style={{ color: colors.textMuted }}
					/>
				)}
			</div>
		</button>
	);
}

const ROLE_META = {
	admin: { status: "danger", defaultLabel: "Administrator", key: "admin" },
	manager: { status: "info", defaultLabel: "Zarządca", key: "manager" },
	contractor: { status: "pending", defaultLabel: "Wykonawca", key: "contractor" },
};

function getRoleMeta(role, t) {
	const config = ROLE_META[role] || ROLE_META.contractor;
	return {
		status: config.status,
		label: t[config.key] || config.defaultLabel,
	};
}

function getUserInitials(user) {
	return (
		[user?.first_name, user?.last_name]
			.filter(Boolean)
			.map((n) => n[0].toUpperCase())
			.join("") || user?.login?.[0]?.toUpperCase() || "?"
	);
}

function getUserFullName(user) {
	return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.login || "";
}

function ProfileOverviewCard({ currentUser, language, onLanguageChange, t }) {
	const initials = getUserInitials(currentUser);
	const fullName = getUserFullName(currentUser);
	const { label: roleLabel, status: roleStatus } = getRoleMeta(currentUser?.role, t);

	const handleLanguageToggle = async () => {
		const nextLang = language === "pl" ? "en" : "pl";
		onLanguageChange(nextLang);
		try {
			await api.updateUserPreferences({ language: nextLang });
		} catch (err) {
			console.warn("Could not save language preference to backend", err);
		}
	};

	return (
		<div
			style={{
				background: colors.cardBg,
				borderRadius: radius.xl,
				border: `1px solid ${colors.cardBorder}`,
				boxShadow: shadow.sm,
				padding: `${spacing[5]} ${spacing[5]}`,
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: spacing[4],
				flexWrap: "wrap",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: spacing[3], flex: 1, minWidth: 0 }}>
				<div
					style={{
						width: "52px",
						height: "52px",
						borderRadius: radius.full,
						background: colors.primaryLight,
						border: "2px solid #bfdbfe",
						color: colors.primary,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: font.size.lg,
						fontWeight: font.weight.bold,
						flexShrink: 0,
					}}
				>
					{initials}
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							fontSize: font.size.lg,
							fontWeight: font.weight.bold,
							color: colors.textHeading,
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{fullName}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: spacing[2],
							marginTop: "4px",
							flexWrap: "wrap",
						}}
					>
						<span style={{ fontSize: font.size.xs, color: colors.textSecondary }}>
							@{currentUser?.login}
						</span>
						<Badge status={roleStatus} dot={false} style={{ fontSize: "11px", padding: "1px 6px" }}>
							{roleLabel}
						</Badge>
					</div>
				</div>
			</div>

			<Button
				variant="secondary"
				size="sm"
				onClick={handleLanguageToggle}
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: spacing[2],
				}}
			>
				<IconGlobe size="xs" />
				<span style={{ fontWeight: font.weight.bold }}>
					{language.toUpperCase()}
				</span>
			</Button>
		</div>
	);
}

function AdministrationSection({ t, onManageUsers, onManageBuildings }) {
	return (
		<SettingsSection title={t.administration || "Zarządzanie aplikacją"}>
			<SettingsTile
				icon={<IconUsers size="md" />}
				title={t.manageUsers || t.users || "Użytkownicy"}
				description={t.manageUsersDesc || "Zarządzaj kontami, rolami i uprawnieniami"}
				onClick={onManageUsers}
				showBorder={true}
			/>
			<SettingsTile
				icon={<IconBuilding size="md" />}
				title={t.manageBuildings || t.buildings || "Budynki"}
				description={t.manageBuildingsDesc || "Przeglądaj, dodawaj i edytuj nieruchomości"}
				onClick={onManageBuildings}
				showBorder={false}
			/>
		</SettingsSection>
	);
}

export default function SettingsPage({
	currentUser,
	language,
	onLanguageChange,
	onLogout,
}) {
	const t = translations[language] || translations.pl;
	const [isUsersModalOpen, setUsersModalOpen] = useState(false);
	const [isBuildingsModalOpen, setBuildingsModalOpen] = useState(false);
	const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
	const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

	const isAdmin = currentUser?.role === "admin";

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: spacing[5],
				padding: `${spacing[4]} ${spacing[4]} ${spacing[12]} ${spacing[4]}`,
				maxWidth: "640px",
				margin: "0 auto",
				width: "100%",
				boxSizing: "border-box",
			}}
		>
			<ProfileOverviewCard
				currentUser={currentUser}
				language={language}
				onLanguageChange={onLanguageChange}
				t={t}
			/>

			{isAdmin && (
				<AdministrationSection
					t={t}
					onManageUsers={() => setUsersModalOpen(true)}
					onManageBuildings={() => setBuildingsModalOpen(true)}
				/>
			)}

			<SettingsSection title={t.security || "Bezpieczeństwo"}>
				<SettingsTile
					icon={<IconKey size="md" />}
					title={t.changePassword || "Zmień hasło"}
					description={t.changePasswordDesc || "Zaktualizuj swoje hasło logowania"}
					onClick={() => setChangePasswordModalOpen(true)}
					showBorder={false}
				/>
			</SettingsSection>

			<SettingsSection title={t.session || "Sesja"}>
				<SettingsTile
					icon={<IconLogout size="md" />}
					title={t.logout || "Wyloguj się"}
					description={t.logoutDesc || "Zakończ sesję na tym urządzeniu"}
					isDanger={true}
					onClick={() => setLogoutModalOpen(true)}
					showBorder={false}
				/>
			</SettingsSection>

			{isUsersModalOpen && (
				<UsersManagementModal
					isOpen={isUsersModalOpen}
					onClose={() => setUsersModalOpen(false)}
					currentUser={currentUser}
					language={language}
				/>
			)}

			{isBuildingsModalOpen && (
				<BuildingsManagementModal
					isOpen={isBuildingsModalOpen}
					onClose={() => setBuildingsModalOpen(false)}
					language={language}
				/>
			)}

			{isChangePasswordModalOpen && (
				<ChangePasswordModal
					isOpen={isChangePasswordModalOpen}
					onClose={() => setChangePasswordModalOpen(false)}
					language={language}
				/>
			)}

			{isLogoutModalOpen && (
				<LogoutConfirmModal
					isOpen={isLogoutModalOpen}
					onClose={() => setLogoutModalOpen(false)}
					onConfirm={() => {
						setLogoutModalOpen(false);
						onLogout?.();
					}}
					language={language}
					currentUser={currentUser}
				/>
			)}
		</div>
	);
}
