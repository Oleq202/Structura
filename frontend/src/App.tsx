import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ManagerPage from "./pages/ManagerPage";
import CalendarPage from "./pages/CalendarPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import Bottombar from "./components/Bottombar";
import AppHeader from "./components/AppHeader";
import { defaultLanguage } from "./i18n";

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [language, setLanguage] = useState(defaultLanguage);
    const [currentUser, setCurrentUser] = useState(null);

    const handleLoginSuccess = () => {
        setCurrentUser({
            id: 1,
            login: "admin",
            firstName: "Jan",
            lastName: "Kowalski",
            role: "admin",
        });
        setIsLoggedIn(true);
    };

    if (!isLoggedIn) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <BrowserRouter>
            <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                <AppHeader />
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    <Routes>
                        <Route path="/" element={<ManagerPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/logs" element={<LogsPage />} />
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
                <Bottombar />
            </div>
        </BrowserRouter>
    );
}
