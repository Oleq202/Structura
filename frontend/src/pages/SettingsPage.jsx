import { useState } from "react";
import { colors, font, spacing, radius, shadow, components } from "../theme";
import { translations } from "../i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";
import UsersManagementModal from "../components/UsersManagementModal";
import BuildingsManagementModal from "../components/BuildingsManagementModal";

function Avatar({ firstName, lastName }) {
	const initials =
		[firstName, lastName]
			.filter(Boolean)
			.map((name) => name[0].toUpperCase())
			.join("") || "?";
	return <div style={components.avatar}>{initials}</div>;
}

function UserCell({ user, t }) {
	if (!user) {
		return <span style={{ color: colors.textMuted, fontStyle: "italic" }}>{t.unassigned}</span>;
	}
	const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
	return (
		<>
			<span>{fullName}</span>
			<Avatar firstName={user.firstName} lastName={user.lastName} />
		</>
	);
}

export default function SettingsPage({ currentUser, language, onLanguageChange }) {
	const t = translations[language];
	const [isUsersModalOpen, setUsersModalOpen] = useState(false);
	const [isBuildingsModalOpen, setBuildingsModalOpen] = useState(false);

	const isAdmin = currentUser?.role === "admin";

	const handleLanguageToggle = () => {
		onLanguageChange(language === "pl" ? "en" : "pl");
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				background: colors.pageBg,
				fontFamily: font.family.sans,
				boxSizing: "border-box",
				minHeight: "100vh",
			}}
		>
			<div
				style={{
					padding: `${spacing[6]} ${spacing[4]}`,
					display: "flex",
					justifyContent: "space-between",
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
					<UserCell user={currentUser} t={t} />
				</div>
				<LanguageSwitcher language={language} onLanguageChange={handleLanguageToggle} />
			</div>

			<div
				style={{
					padding: `0 ${spacing[4]}`,
					display: "flex",
					flexDirection: "column",
					gap: spacing[4],
				}}
			>
				{isAdmin ? (
					<>
						<button
							onClick={() => setUsersModalOpen(true)}
							style={{
								...components.primaryButton,
								width: "100%",
								padding: `${spacing[4]} ${spacing[6]}`,
								borderRadius: radius.lg,
								fontSize: font.size.md,
								fontFamily: font.family.sans,
								fontWeight: font.weight.medium,
								letterSpacing: font.letterSpacing.wide,
								cursor: "pointer",
								boxSizing: "border-box",
								transition: "background 0.15s, transform 0.1s",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background = colors.primaryHover)
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background = colors.primary)
							}
							onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
							onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
						>
							{t.addUser}
						</button>

						<button
							onClick={() => setBuildingsModalOpen(true)}
							style={{
								...components.primaryButton,
								width: "100%",
								padding: `${spacing[4]} ${spacing[6]}`,
								borderRadius: radius.lg,
								fontSize: font.size.md,
								fontFamily: font.family.sans,
								fontWeight: font.weight.medium,
								letterSpacing: font.letterSpacing.wide,
								cursor: "pointer",
								boxSizing: "border-box",
								transition: "background 0.15s, transform 0.1s",
							}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background = colors.primaryHover)
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background = colors.primary)
							}
							onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
							onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
						>
							{t.addBuilding}
						</button>
					</>
				) : (
					<div
						style={{
							textAlign: "center",
							padding: spacing[8],
							color: colors.textSecondary,
							fontSize: font.size.md,
						}}
					>
						{t.settingsAccessLimited}
					</div>
				)}
			</div>

			{isUsersModalOpen && (
				<UsersManagementModal
					onClose={() => setUsersModalOpen(false)}
					language={language}
				/>
			)}

			{isBuildingsModalOpen && (
				<BuildingsManagementModal
					onClose={() => setBuildingsModalOpen(false)}
					language={language}
				/>
			)}
		</div>
	);
}
