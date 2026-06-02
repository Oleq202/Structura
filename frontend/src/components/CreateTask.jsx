import { useState, useRef, useEffect } from "react";
import {
    colors,
    font,
    spacing,
    radius,
    shadow,
    components,
    status,
} from "../theme";

export default function CreateTask({
    buildings = [],
    contractors = [],
    onClose,
}) {
    const createTaskRef = useRef(null);
    const [task, setTask] = useState({
        title: "",
        description: "",
        buildingId: "",
        assignedTo: "",
    });
    const [loading, setLoading] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [buildingIdError, setBuildingIdError] = useState("");
    const [assignedToError, setAssignedToError] = useState("");
    const [titleFocused, setTitleFocused] = useState(false);
    const [descriptionFocused, setDescriptionFocused] = useState(false);

    useEffect(() => {
        if (createTaskRef.current) {
            createTaskRef.current.focus();
        }
    }, []);

    const inputStyle = (hasError, isFocused) => ({
        ...components.input,
        boxSizing: "border-box",
        padding: `${spacing[2]} ${spacing[3]}`,
        borderRadius: radius.lg,
        fontSize: font.size.sm,
        fontFamily: font.family.sans,
        border: hasError
            ? `1px solid ${status.danger.border}`
            : isFocused
              ? `1px solid ${colors.borderStrong}`
              : `1px solid ${colors.borderDefault}`,
        background: hasError ? status.danger.bg : colors.cardBg,
        color: colors.textBody,
        boxShadow: isFocused && !hasError ? shadow.focus : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setTitleError("");
        setDescriptionError("");
        setBuildingIdError("");
        setAssignedToError("");

        if (!task.title) {
            setTitleError("Title is required");
            return;
        }

        setLoading(true);
        try {
            console.log("Successfully created task:", task);
            if (onClose) onClose();
        } catch (err) {
            console.error("Error creating task", err);
        } finally {
            setLoading(false);
        }
    };

    const errorStyle = {
        fontSize: font.size.xs,
        fontFamily: font.family.sans,
        color: status.danger.text,
        marginTop: spacing[1],
        paddingLeft: spacing[1],
    };

    const labelStyle = {
        fontSize: font.size.sm,
        fontFamily: font.family.sans,
        color: colors.textSecondary,
        marginBottom: spacing[1],
        display: "block",
    };

    return (
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
                zIndex: 1000,
            }}
            onClick={() => onClose?.()}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "360px",
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
                    Create new task
                </h1>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: spacing[5],
                    }}
                >
                    <div>
                        <label style={labelStyle}>Title</label>
                        <input
                            style={inputStyle(!!titleError, titleFocused)}
                            ref={createTaskRef}
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                                setTask({ ...task, title: e.target.value })
                            }
                            onFocus={() => setTitleFocused(true)}
                            onBlur={() => setTitleFocused(false)}
                            placeholder="Enter task title"
                        />
                        {titleError && <p style={errorStyle}>{titleError}</p>}
                    </div>

                    <div>
                        <label style={labelStyle}>Description</label>
                        <input
                            style={inputStyle(
                                !!descriptionError,
                                descriptionFocused,
                            )}
                            type="text"
                            value={task.description}
                            onChange={(e) =>
                                setTask({
                                    ...task,
                                    description: e.target.value,
                                })
                            }
                            onFocus={() => setDescriptionFocused(true)}
                            onBlur={() => setDescriptionFocused(false)}
                            placeholder="Enter task description"
                        />
                        {descriptionError && (
                            <p style={errorStyle}>{descriptionError}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Building</label>
                        <select
                            style={inputStyle(!!buildingIdError, false)}
                            value={task.buildingId}
                            onChange={(e) =>
                                setTask({ ...task, buildingId: e.target.value })
                            }
                        >
                            <option value="">Select a building</option>
                            {buildings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.street_address}, {b.district}, {b.city}
                                </option>
                            ))}
                        </select>
                        {buildingIdError && (
                            <p style={errorStyle}>{buildingIdError}</p>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Contractor</label>
                        <select
                            style={inputStyle(!!assignedToError, false)}
                            value={task.assignedTo}
                            onChange={(e) =>
                                setTask({ ...task, assignedTo: e.target.value })
                            }
                        >
                            <option value="">Select a contractor</option>
                            {contractors.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.firstName} {c.lastName}
                                </option>
                            ))}
                        </select>
                        {assignedToError && (
                            <p style={errorStyle}>{assignedToError}</p>
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: spacing[3],
                            marginTop: spacing[2],
                        }}
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose?.();
                            }}
                            style={{
                                flex: 1,
                                background: "transparent",
                                border: `1px solid ${colors.borderDefault}`,
                                color: colors.textBody,
                                padding: `${spacing[3]} ${spacing[4]}`,
                                borderRadius: radius.lg,
                                fontSize: font.size.base,
                                fontFamily: font.family.sans,
                                fontWeight: font.weight.medium,
                                cursor: "pointer",
                                boxSizing: "border-box",
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...components.primaryButton,
                                flex: 2,
                                padding: `${spacing[3]} ${spacing[4]}`,
                                borderRadius: radius.lg,
                                fontSize: font.size.base,
                                fontFamily: font.family.sans,
                                fontWeight: font.weight.medium,
                                letterSpacing: font.letterSpacing.wide,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.55 : 1,
                                transition:
                                    "background 0.15s, opacity 0.15s, transform 0.1s",
                                boxSizing: "border-box",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading)
                                    e.currentTarget.style.background =
                                        colors.primaryHover;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                    colors.primary;
                            }}
                            onMouseDown={(e) => {
                                if (!loading)
                                    e.currentTarget.style.transform =
                                        "scale(0.97)";
                            }}
                            onMouseUp={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        >
                            {loading ? "Creating…" : "Create task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
