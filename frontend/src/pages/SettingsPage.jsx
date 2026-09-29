import { useState } from "react";
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
import LanguageSwitcher from "../components/LanguageSwitcher";
import UsersManagementModal from "../components/UsersManagementModal";
import BuildingsManagementModal from "../components/BuildingsManagementModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import LogoutConfirmModal from "../components/LogoutConfirmModal";
import * as api from "../services/api";

const unassignedTextStyle = {
	color: colors.textMuted,
	fontStyle: "italic",
};

const primaryButtonStyle = {
	...components.primaryButton,
	width: "100%",
	minHeight: "44px",
	padding: "10px 14px",
	borderRadius: radius.md,
	fontSize: "13px",
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: "pointer",
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: spacing[2],
	transition: "background 0.15s, transform 0.1s",
};

const secondaryButtonStyle = {
	width: "100%",
	minHeight: "44px",
	padding: "10px 14px",
	borderRadius: radius.md,
	fontSize: "13px",
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: "pointer",
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: spacing[2],
	background: colors.cardBg,
	color: colors.textHeading,
	border: `1px solid ${colors.borderDefault}`,
	transition: "background 0.15s, border-color 0.15s, transform 0.1s",
};

const logoutButtonStyle = {
	width: "100%",
	minHeight: "44px",
	padding: "10px 14px",
	borderRadius: radius.md,
	fontSize: "13px",
	fontFamily: font.family.sans,
	fontWeight: font.weight.medium,
	letterSpacing: font.letterSpacing.wide,
	cursor: "pointer",
	boxSizing: "border-box",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: spacing[2],
	background: status.danger.bg,
	color: status.danger.text,
	border: `1px solid ${status.danger.border}`,
	transition: "background 0.15s, border-color 0.15s, transform 0.1s",
};

const ICONS = {
	users: (
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
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	),
	building: (
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
	key: (
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
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	logout: (
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
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	),
};

function Avatar({ first_name, last_name }) {
	const initials =
		[first_name, last_name]
			.filter(Boolean)
			.map((name) => name[0].toUpperCase())
			.join("") || "?";
	return (
		<div style={components.avatar}>
			{initials}
		</div>
	);
}

function UserCell({ user, t }) {
	if (!user) {
		return (
			<span style={unassignedTextStyle}>
				{t.unassigned}
			</span>
		);
	}
	const full_name = [
		user.first_name,
		user.last_name,
	]
		.filter(Boolean)
		.join(" ");
	return (
		<>
			<span>{full_name}</span>
			<Avatar
				first_name={user.first_name}
				last_name={user.last_name}
			/>
		</>
	);
}

export default function SettingsPage({
	currentUser,
	language,
	onLanguageChange,
	onLogout,
}) {
	const t = translations[language] || translations.pl;
	const [isUsersModalOpen, setUsersModalOpen] =
		useState(false);
	const [
		isBuildingsModalOpen,
		setBuildingsModalOpen,
	] = useState(false);
	const [isChangePasswordModalOpen, setChangePasswordModalOpen] =
		useState(false);
	const [isLogoutModalOpen, setLogoutModalOpen] =
		useState(false);

	const isAdmin = currentUser?.role === "admin";

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
				display: "flex",
				flexDirection: "column",
				background: colors.pageBg,
				fontFamily: font.family.sans,
				boxSizing: "border-box",
				maxWidth: "600px",
				margin: "0 auto",
				width: "100%",
				paddingBottom: spacing[8],
			}}
		>
			<div
				style={{
					padding: `${spacing[6]} ${spacing[4]}`,
					display: "flex",
					justifyContent:
						"space-between",
					alignItems: "center",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: spacing[3],
					}}
				>
					<UserCell
						user={currentUser}
						t={t}
					/>
				</div>
				<LanguageSwitcher
					language={language}
					onLanguageChange={
						handleLanguageToggle
					}
				/>
			</div>

			<div
				style={{
					padding: `0 ${spacing[4]}`,
					display: "flex",
					flexDirection: "column",
					gap: spacing[4],
				}}
			>
				{isAdmin && (
					<>
						<button
							type="button"
							onClick={() =>
								setUsersModalOpen(
									true
								)
							}
							style={
								primaryButtonStyle
							}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background =
									colors.primaryHover)
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background =
									colors.primary)
							}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform =
									"scale(0.98)")
							}
							onMouseUp={(e) =>
								(e.currentTarget.style.transform =
									"scale(1)")
							}
						>
							{ICONS.users}
							{t.addUser}
						</button>

						<button
							type="button"
							onClick={() =>
								setBuildingsModalOpen(
									true
								)
							}
							style={
								primaryButtonStyle
							}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background =
									colors.primaryHover)
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background =
									colors.primary)
							}
							onMouseDown={(e) =>
								(e.currentTarget.style.transform =
									"scale(0.98)")
							}
							onMouseUp={(e) =>
								(e.currentTarget.style.transform =
									"scale(1)")
							}
						>
							{ICONS.building}
							{t.addBuilding}
						</button>
					</>
				)}

				<button
					type="button"
					onClick={() => setChangePasswordModalOpen(true)}
					style={secondaryButtonStyle}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = colors.pageBg;
						e.currentTarget.style.borderColor = colors.borderStrong;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = colors.cardBg;
						e.currentTarget.style.borderColor = colors.borderDefault;
					}}
					onMouseDown={(e) =>
						(e.currentTarget.style.transform =
							"scale(0.98)")
					}
					onMouseUp={(e) =>
						(e.currentTarget.style.transform =
							"scale(1)")
					}
				>
					{ICONS.key}
					{t.changePassword}
				</button>

				<button
					type="button"
					onClick={() => setLogoutModalOpen(true)}
					style={logoutButtonStyle}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#fbdada";
						e.currentTarget.style.borderColor = "#e57373";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = status.danger.bg;
						e.currentTarget.style.borderColor = status.danger.border;
					}}
					onMouseDown={(e) =>
						(e.currentTarget.style.transform =
							"scale(0.98)")
					}
					onMouseUp={(e) =>
						(e.currentTarget.style.transform =
							"scale(1)")
					}
				>
					{ICONS.logout}
					{t.logout}
				</button>
			</div>

			{isUsersModalOpen && (
				<UsersManagementModal
					onClose={() =>
						setUsersModalOpen(false)
					}
					language={language}
				/>
			)}

			{isBuildingsModalOpen && (
				<BuildingsManagementModal
					onClose={() =>
						setBuildingsModalOpen(
							false
						)
					}
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
		</div>
	);
}

