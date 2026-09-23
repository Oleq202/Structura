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
	const [currentUser, setCurrentUser] = useState(() => {
		const stored = localStorage.getItem("currentUser:v1");
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch (error) {
				console.error("Failed to parse stored user:", error);
				localStorage.removeItem("currentUser:v1");
				return null;
			}
		}
		return null;
	});

	const [isLoggedIn, setIsLoggedIn] = useState(() => {
		return Boolean(localStorage.getItem("accessToken") && localStorage.getItem("currentUser:v1"));
	});

	const [language, setLanguage] = useState(defaultLanguage);

	const handleLogout = () => {
		localStorage.removeItem("currentUser:v1");
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		setCurrentUser(null);
		setIsLoggedIn(false);
	};

	useEffect(() => {
		const onUnauthorized = () => {
			handleLogout();
		};
		window.addEventListener("auth:unauthorized", onUnauthorized);
		return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
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
			localStorage.setItem(
				"currentUser:v1",
				JSON.stringify(user)
			);
			localStorage.setItem(
				"accessToken",
				user.access_token
			);
			if (user.refresh_token) {
				localStorage.setItem(
					"refreshToken",
					user.refresh_token
				);
			}
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
