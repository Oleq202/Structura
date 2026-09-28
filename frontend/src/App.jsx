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
	const [language, setLanguage] = useState(defaultLanguage);

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
				}
			} catch (prefErr) {
				console.warn("Could not load preferences on login", prefErr);
			}
		} catch (error) {
			console.error("Login failed:", error);
			alert(
				"Login failed. Please check your credentials."
			);
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
					height: "100vh",
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
						<div
							style={{
								flex: 1,
								minHeight: 0,
								overflowY: "auto",
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
										<LogsPage
											currentUser={
												currentUser
											}
											language={
												language
											}
										/>
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
												setLanguage
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
						</div>
						<Bottombar
							language={language}
						/>
					</>
				)}
			</div>
		</BrowserRouter>
	);
}
