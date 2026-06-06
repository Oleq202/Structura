import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// @ts-expect-error - JSX import without type declaration
import LoginPage from "./pages/LoginPage";
// @ts-expect-error - JSX import without type declaration
import ManagerPage from "./pages/ManagerPage";
// @ts-expect-error - JSX import without type declaration
import CalendarPage from "./pages/CalendarPage";
// @ts-expect-error - JSX import without type declaration
import LogsPage from "./pages/LogsPage";
// @ts-expect-error - JSX import without type declaration
import SettingsPage from "./pages/SettingsPage";
// @ts-expect-error - JSX import without type declaration
import Bottombar from "./components/Bottombar";
// @ts-expect-error - JSX import without type declaration
import AppHeader from "./components/AppHeader";
// @ts-expect-error - JS import without type declaration
import { defaultLanguage } from "./i18n";
// @ts-expect-error - JS import without type declaration
import * as api from "./services/api";

interface User {
	id: number;
	login: string;
	firstName: string;
	lastName: string;
	role: string;
}

export default function App() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [language, setLanguage] = useState(defaultLanguage);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	const handleLoginSuccess = async (loginInput: string, passwordInput: string) => {
		try {
			const user = await api.login(loginInput, passwordInput);
			localStorage.setItem("currentUser", JSON.stringify(user));
			setCurrentUser(user);
			setIsLoggedIn(true);
		} catch (error) {
			console.error("Login failed:", error);
			alert("Login failed. Please check your credentials.");
		}
	};

	return (
		<BrowserRouter>
			<div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
				{!isLoggedIn ? (
					<LoginPage onLoginSuccess={handleLoginSuccess} language={language} />
				) : (
					<>
						<AppHeader />
						<div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
							<Routes>
								<Route path="/" element={<ManagerPage language={language} />} />
								<Route
									path="/calendar"
									element={<CalendarPage language={language} />}
								/>
								<Route path="/logs" element={<LogsPage language={language} />} />
								<Route
									path="/settings"
									element={
										<SettingsPage
											currentUser={currentUser}
											language={language}
											onLanguageChange={setLanguage}
										/>
									}
								/>
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</div>
						<Bottombar language={language} />
					</>
				)}
			</div>
		</BrowserRouter>
	);
}
