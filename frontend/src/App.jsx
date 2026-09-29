import { useState, useEffect } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ManagerPage from "./pages/ManagerPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import Bottombar from "./components/Bottombar";
import AppHeader from "./components/AppHeader";
import { defaultLanguage } from "./i18n";
import * as api from "./services/api";

export default function App() {
	const [currentUser, setCurrentUser] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const [language, setLanguage] = useState(() => {
		return localStorage.getItem("structura_lang") || defaultLanguage;
	});

	const handleLanguageChange = (newLang) => {
		setLanguage(newLang);
		localStorage.setItem("structura_lang", newLang);
	};

	const handleLogout = async () => {
		try {
			await api.logout();
		} catch (e) {
			console.warn("Logout error:", e);
		}
		setCurrentUser(null);
		setIsLoggedIn(false);
	};

	useEffect(() => {
		let isMounted = true;
		const initAuth = async () => {
			try {
				const user = await api.initSession();
				if (user && isMounted) {
					setCurrentUser(user);
					setIsLoggedIn(true);
					try {
						const prefs = await api.getUserPreferences();
						if (prefs && prefs.language && isMounted) {
							setLanguage(prefs.language);
							localStorage.setItem("structura_lang", prefs.language);
						}
					} catch (prefErr) {
						console.warn("Could not load preferences on session init", prefErr);
					}
				}
			} catch (err) {
				console.info("No active session found:", err);
			} finally {
				if (isMounted) {
					setIsInitializing(false);
				}
			}
		};

		initAuth();

		const onUnauthorized = () => {
			setCurrentUser(null);
			setIsLoggedIn(false);
		};
		window.addEventListener("auth:unauthorized", onUnauthorized);
		return () => {
			isMounted = false;
			window.removeEventListener("auth:unauthorized", onUnauthorized);
		};
	}, []);

	const handleLoginSuccess = async (
		loginInput,
		passwordInput
	) => {
		try {
			const user = await api.login(
				loginInput,
				passwordInput
			);
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

	if (isInitializing) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
					background: "#0f172a",
					color: "#94a3b8",
					fontFamily: "Inter, sans-serif",
					fontSize: "1rem",
				}}
			>
				Loading Structura...
			</div>
		);
	}

	return (
		<BrowserRouter>
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
				{!isLoggedIn ? (
					<LoginPage
						onLoginSuccess={
							handleLoginSuccess
						}
						language={language}
					/>
				) : (
					<>
						<AppHeader />
						<main
							style={{
								flex: 1,
								minHeight: 0,
								overflowY: "auto",
								WebkitOverflowScrolling: "touch",
								background: "#f8fafc",
							}}
						>
							<Routes>
								<Route
									path="/"
									element={
										<ManagerPage
											currentUser={
												currentUser
											}
											language={
												language
											}
											onLogout={
												handleLogout
											}
										/>
									}
								/>
								<Route
									path="/logs"
									element={
										currentUser?.role === "admin" ? (
											<LogsPage
												currentUser={
													currentUser
												}
												language={
													language
												}
											/>
										) : (
											<Navigate
												to="/"
												replace
											/>
										)
									}
								/>
								<Route
									path="/settings"
									element={
										<SettingsPage
											currentUser={
												currentUser
											}
											language={
												language
											}
											onLanguageChange={
												handleLanguageChange
											}
											onLogout={
												handleLogout
											}
										/>
									}
								/>
								<Route
									path="*"
									element={
										<Navigate
											to="/"
											replace
										/>
									}
								/>
							</Routes>
						</main>
						<Bottombar
							language={language}
							currentUser={currentUser}
						/>
					</>
				)}
			</div>
		</BrowserRouter>
	);
}
