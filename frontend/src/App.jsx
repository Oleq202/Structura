import { useState, useEffect } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ManagerPage from "./pages/ManagerPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import Bottombar from "./components/Bottombar";
import AppHeader from "./components/AppHeader";
import DesktopSidebar from "./components/DesktopSidebar";
import { defaultLanguage } from "./i18n";
import { colors, font } from "./theme";
import { IconSpinner } from "./components/icons";
import * as api from "./services/api";

const DESKTOP_BREAKPOINT = 1024;

function useMediaQuery(query) {
	const [matches, setMatches] = useState(() => {
		if (typeof window !== "undefined") {
			return window.matchMedia(query).matches;
		}
		return false;
	});

	useEffect(() => {
		const mql = window.matchMedia(query);
		const handler = (e) => setMatches(e.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	}, [query]);

	return matches;
}

function AppShell() {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const [language, setLanguage] = useState(() => {
		return localStorage.getItem("structura_lang") || defaultLanguage;
	});

	const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT}px)`);

	const handleLanguageChange = (newLang) => {
		// If called with a string (from SettingsPage), use it directly
		// Otherwise toggle (from header/sidebar button)
		if (typeof newLang === "string") {
			setLanguage(newLang);
			localStorage.setItem("structura_lang", newLang);
		} else {
			const toggled = language === "pl" ? "en" : "pl";
			setLanguage(toggled);
			localStorage.setItem("structura_lang", toggled);
		}
	};

	const handleLogout = async () => {
		try {
			await api.logout();
		} catch (e) {
			console.warn("Logout error:", e);
		}
		navigate("/", { replace: true });
		setCurrentUser(null);
		setIsLoggedIn(false);
	};

	useEffect(() => {
		const controller = new AbortController();

		api.initSession()
			.then((user) => {
				if (controller.signal.aborted) return;
				if (user) {
					setCurrentUser(user);
					setIsLoggedIn(true);
					api.getUserPreferences()
						.then((prefs) => {
							if (!controller.signal.aborted && prefs?.language) {
								setLanguage(prefs.language);
								localStorage.setItem("structura_lang", prefs.language);
							}
						})
						.catch((prefErr) => {
							console.warn("Could not load preferences on session init", prefErr);
						});
				}
			})
			.catch((err) => {
				console.info("No active session found:", err);
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setIsInitializing(false);
				}
			});

		return () => controller.abort();
	}, []);

	useEffect(() => {
		const onUnauthorized = () => {
			navigate("/", { replace: true });
			setCurrentUser(null);
			setIsLoggedIn(false);
		};
		window.addEventListener("auth:unauthorized", onUnauthorized);
		return () => {
			window.removeEventListener("auth:unauthorized", onUnauthorized);
		};
	}, [navigate]);

	const handleLoginSuccess = async (
		loginInput,
		passwordInput
	) => {
		try {
			const user = await api.login(
				loginInput,
				passwordInput
			);
			// Always default to the manager page ('/') when logging in
			navigate("/", { replace: true });
			setCurrentUser(user);
			setIsLoggedIn(true);

			try {
				const prefs = await api.getUserPreferences();
				if (prefs && prefs.language) {
					setLanguage(prefs.language);
					localStorage.setItem("structura_lang", prefs.language);
				}
			} catch (prefErr) {
				console.warn("Could not load preferences on login", prefErr);
			}
			return user;
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	// ── Loading State ─────────────────────────────────
	if (isInitializing) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "100dvh",
					background: colors.shellBg,
					color: colors.shellTextMuted,
					fontFamily: font.family.sans,
					fontSize: font.size.base,
					gap: "16px",
				}}
			>
				<IconSpinner size="xl" style={{ color: colors.shellAccent }} />
				<span>Loading Structura…</span>
			</div>
		);
	}

	// ── Login ─────────────────────────────────────────
	if (!isLoggedIn) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
					minHeight: "100dvh",
					maxHeight: "100dvh",
					overflow: "hidden",
				}}
			>
				<LoginPage
					onLoginSuccess={handleLoginSuccess}
					language={language}
					onLanguageChange={handleLanguageChange}
				/>
			</div>
		);
	}

	// ── Authenticated App Shell ───────────────────────
	return (
		<div
			style={{
				display: "flex",
				flexDirection: isDesktop ? "row" : "column",
				height: "100%",
				minHeight: "100dvh",
				maxHeight: "100dvh",
				overflow: "hidden",
			}}
		>
			{/* Desktop: Persistent Sidebar */}
			{isDesktop && (
				<DesktopSidebar
					language={language}
					currentUser={currentUser}
					onLanguageChange={handleLanguageChange}
					onLogout={handleLogout}
				/>
			)}

			{/* Mobile/Tablet: Top Header */}
			{!isDesktop && (
				<AppHeader
					currentUser={currentUser}
					language={language}
					onLanguageChange={handleLanguageChange}
				/>
			)}

			{/* Main Content Area */}
			<main
				style={{
					flex: 1,
					minHeight: 0,
					minWidth: 0,
					overflowY: "auto",
					WebkitOverflowScrolling: "touch",
					background: colors.pageBg,
				}}
			>
				<Routes>
					<Route
						path="/"
						element={
							<ManagerPage
								currentUser={currentUser}
								language={language}
								onLogout={handleLogout}
							/>
						}
					/>
					<Route
						path="/logs"
						element={
							currentUser?.role === "admin" ? (
								<LogsPage
									currentUser={currentUser}
									language={language}
								/>
							) : (
								<Navigate to="/" replace />
							)
						}
					/>
					<Route
						path="/settings"
						element={
							<SettingsPage
								currentUser={currentUser}
								language={language}
								onLanguageChange={handleLanguageChange}
								onLogout={handleLogout}
							/>
						}
					/>
					<Route
						path="*"
						element={<Navigate to="/" replace />}
					/>
				</Routes>
			</main>

			{/* Mobile/Tablet: Bottom Navigation */}
			{!isDesktop && (
				<Bottombar
					language={language}
					currentUser={currentUser}
				/>
			)}
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AppShell />
		</BrowserRouter>
	);
}
