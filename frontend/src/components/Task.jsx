import { useState } from "react";
import {
    colors,
    font,
    spacing,
    radius,
    shadow,
    components,
    badgeStyle,
} from "../theme";

const STATUS_BADGE = {
    pending: "new",
    completed: "done",
};

function Avatar({ firstName, lastName }) {
    const initials =
        [firstName, lastName]
            .filter(Boolean)
            .map((name) => name[0].toUpperCase())
            .join("") || "?";
    return <div style={components.avatar}>{initials}</div>;
}

function UserCell({ user }) {
    if (!user) {
        return (
            <span style={{ color: colors.textMuted, fontStyle: "italic" }}>
                Unassigned
            </span>
        );
    }
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return (
        <>
            <span>{fullName}</span>
            <Avatar firstName={user.firstName} lastName={user.lastName} />
        </>
    );
}

function MetaRow({ label, children }) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <span style={components.sectionLabel}>{label}</span>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing[2],
                    fontSize: font.size.sm,
                    color: colors.textBody,
                    fontWeight: font.weight.medium,
                }}
            >
                {children}
            </div>
        </div>
    );
}

function formatTimestamp(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Task({ initialData, expanded, onToggle, onMarkCompleted, onReassign }) {
    const [task] = useState(initialData);
    const isPending = task.status === "pending";
    const badgeKey = STATUS_BADGE[task.status] ?? "new";
    const badge = badgeStyle(badgeKey);

    const buildingLabel = task.building
        ? [task.building.district, task.building.city]
              .filter(Boolean)
              .join(", ")
        : "";
    const buildingAddress = task.building?.street_address ?? null;

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "420px",
                background: colors.cardBg,
                borderRadius: radius.xl,
                border: `0.5px solid ${colors.cardBorder}`,
                boxShadow: shadow.modal,
                overflow: "hidden",
                cursor: "pointer",
            }}
            onClick={onToggle}
        >
            <div style={{ padding: `${spacing[4]} ${spacing[5]}` }}>
                <h2
                    style={{
                        fontSize: font.size.lg,
                        fontWeight: font.weight.medium,
                        color: colors.textHeading,
                        letterSpacing: font.letterSpacing.tight,
                        lineHeight: font.lineHeight.tight,
                        marginBottom: buildingLabel ? spacing[3] : 0,
                    }}
                >
                    {task.title}
                </h2>

                {buildingAddress && (
                    <div
                        style={{
                            borderTop: `0.5px solid ${colors.borderSubtle}`,
                            paddingTop: spacing[3],
                        }}
                    >
                        <MetaRow label="Building">
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "2px",
                                }}
                            >
                                <span>{buildingAddress}</span>
                                {buildingLabel && (
                                    <span
                                        style={{
                                            fontSize: font.size.xs,
                                            color: colors.textSecondary,
                                            fontWeight: font.weight.regular,
                                        }}
                                    >
                                        {buildingLabel}
                                    </span>
                                )}
                            </div>
                        </MetaRow>
                    </div>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateRows: expanded ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease",
                }}
            >
                <div style={{ overflow: "hidden" }}>
                    <div
                        style={{
                            borderTop: `0.5px solid ${colors.borderSubtle}`,
                            padding: `${spacing[4]} ${spacing[5]}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: spacing[4],
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {task.description && (
                            <p
                                style={{
                                    fontSize: font.size.base,
                                    color: colors.textBody,
                                    lineHeight: font.lineHeight.normal,
                                    margin: 0,
                                }}
                            >
                                {task.description}
                            </p>
                        )}

                        <MetaRow label="Created by">
                            <UserCell user={task.created_by} />
                        </MetaRow>

                        <MetaRow label="Assigned to">
                            <UserCell user={task.assigned_to} />
                        </MetaRow>

                        {task.created_at && (
                            <MetaRow label="Created">
                                <span style={{ color: colors.textSecondary }}>
                                    {formatTimestamp(task.created_at)}
                                </span>
                            </MetaRow>
                        )}

                        {task.updated_at &&
                            task.updated_at !== task.created_at && (
                                <MetaRow label="Last updated">
                                    <span
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {formatTimestamp(task.updated_at)}
                                    </span>
                                </MetaRow>
                            )}

                        {isPending && (
                            <div style={{ display: "flex", gap: spacing[3] }}>
                                <button
                                    style={{
                                        ...components.primaryButton,
                                        flex: 1,
                                        padding: `${spacing[3]} ${spacing[4]}`,
                                        borderRadius: radius.lg,
                                        fontFamily: font.family.sans,
                                        boxSizing: "border-box",
                                    }}
                                    onClick={onMarkCompleted}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            colors.primaryHover)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            colors.primary)
                                    }
                                >
                                    Mark completed
                                </button>
                                <button
                                    style={{
                                        ...components.ghostButton,
                                        padding: `${spacing[3]} ${spacing[4]}`,
                                        borderRadius: radius.lg,
                                        fontFamily: font.family.sans,
                                    }}
                                    onClick={onReassign}
                                >
                                    Reassign
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
