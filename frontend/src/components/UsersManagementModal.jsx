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
import UserModal from "./UserModal";

const mockUsers = [
    { id: 1, login: "admin", firstName: "Jan", lastName: "Kowalski", role: "admin" },
    { id: 2, login: "manager1", firstName: "Anna", lastName: "Nowak", role: "manager" },
    { id: 3, login: "contractor1", firstName: "Piotr", lastName: "Wiśniewski", role: "contractor" },
];

export default function UsersManagementModal({ onClose, language }) {
    const t = translations[language];
    const [users, setUsers] = useState(mockUsers);
    const [editingUser, setEditingUser] = useState(null);

    const handleEdit = (user) => {
        setEditingUser(user);
    };

    const handleDelete = (userId) => {
        if (confirm(t.deleteUserConfirm)) {
            setUsers(users.filter((u) => u.id !== userId));
            console.log("Deleted user:", userId);
        }
    };

    const handleUserSaved = (savedUser) => {
        if (editingUser) {
            setUsers(users.map((u) => (u.id === savedUser.id ? savedUser : u)));
        } else {
            setUsers([...users, { ...savedUser, id: Math.max(...users.map((u) => u.id)) + 1 }]);
        }
        setEditingUser(null);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return { bg: "#fcebeb", border: "#f09595", text: "#791f1f" };
            case "manager":
                return { bg: "#e0ecfa", border: "#85b7eb", text: "#0e4d8a" };
            case "contractor":
                return { bg: "#eaf3de", border: "#97c459", text: "#2d5e10" };
            default:
                return { bg: "#f4f7fb", border: "#b0c4d8", text: "#3a5068" };
        }
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `0 ${spacing[4]}`,
                    boxSizing: "border-box",
                    zIndex: 100,
                }}
                onClick={() => onClose?.()}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: "550px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        background: colors.cardBg,
                        borderRadius: radius.xl,
                        border: `0.5px solid ${colors.cardBorder}`,
                        padding: spacing[8],
                        boxShadow: shadow.modal,
                        boxSizing: "border-box",
                        position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose?.();
                        }}
                        style={{
                            position: "absolute",
                            top: spacing[4],
                            right: spacing[4],
                            background: "transparent",
                            border: "none",
                            color: colors.textSecondary,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: spacing[1],
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <h1
                        style={{
                            fontSize: font.size["2xl"],
                            fontWeight: font.weight.medium,
                            color: colors.textHeading,
                            marginBottom: spacing[6],
                            marginTop: 0,
                            letterSpacing: font.letterSpacing.tight,
                            lineHeight: font.lineHeight.tight,
                        }}
                    >
                        {t.addUser}
                    </h1>

                    <button
                        onClick={() => setEditingUser({})}
                        style={{
                            ...components.primaryButton,
                            width: "100%",
                            padding: `${spacing[3]} ${spacing[4]}`,
                            borderRadius: radius.lg,
                            fontSize: font.size.base,
                            fontFamily: font.family.sans,
                            fontWeight: font.weight.medium,
                            letterSpacing: font.letterSpacing.wide,
                            cursor: "pointer",
                            boxSizing: "border-box",
                            marginBottom: spacing[6],
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = colors.primaryHover)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = colors.primary)
                        }
                    >
                        {t.addUserButton}
                    </button>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: spacing[3],
                            maxHeight: "60vh",
                            overflowY: "auto",
                            paddingRight: spacing[2],
                        }}
                    >
                        {users.map((user) => {
                            const badgeColor = getRoleBadgeColor(user.role);
                            return (
                                <div
                                    key={user.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: `${spacing[3]} ${spacing[4]}`,
                                        background: colors.pageBg,
                                        borderRadius: radius.lg,
                                        border: `0.5px solid ${colors.cardBorder}`,
                                        gap: spacing[2],
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: spacing[1],
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: spacing[2],
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: font.size.base,
                                                    fontWeight: font.weight.medium,
                                                    color: colors.textHeading,
                                                }}
                                            >
                                                {user.firstName} {user.lastName}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: font.size.xs,
                                                    padding: `4px ${spacing[2]}`,
                                                    borderRadius: radius.sm,
                                                    background: badgeColor.bg,
                                                    border: `0.5px solid ${badgeColor.border}`,
                                                    color: badgeColor.text,
                                                    fontWeight: font.weight.medium,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    height: "24px",
                                                }}
                                            >
                                                {t[user.role]}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: spacing[2],
                                            flexShrink: 0,
                                        }}
                                    >
                                        <button
                                            onClick={() => handleEdit(user)}
                                            style={{
                                                background: "transparent",
                                                border: `1px solid ${colors.borderDefault}`,
                                                color: colors.textBody,
                                                padding: `${spacing[1]} ${spacing[2]}`,
                                                borderRadius: radius.md,
                                                fontSize: font.size.xs,
                                                fontFamily: font.family.sans,
                                                fontWeight: font.weight.medium,
                                                cursor: "pointer",
                                                transition: "border-color 0.15s, color 0.15s",
                                                whiteSpace: "nowrap",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = colors.borderStrong;
                                                e.currentTarget.style.color = colors.textHeading;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = colors.borderDefault;
                                                e.currentTarget.style.color = colors.textBody;
                                            }}
                                        >
                                            {t.edit}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            style={{
                                                background: "transparent",
                                                border: `1px solid ${status.danger.border}`,
                                                color: status.danger.text,
                                                padding: `${spacing[1]} ${spacing[2]}`,
                                                borderRadius: radius.md,
                                                fontSize: font.size.xs,
                                                fontFamily: font.family.sans,
                                                fontWeight: font.weight.medium,
                                                cursor: "pointer",
                                                transition: "background 0.15s",
                                                whiteSpace: "nowrap",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = status.danger.bg;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            {t.delete}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {editingUser !== null && (
                <UserModal
                    user={editingUser.id ? editingUser : null}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUserSaved}
                    language={language}
                />
            )}
        </>
    );
}
