import { useState } from "react";
import Task from "../components/Task";
import Bottombar from "../components/Bottombar";
import Navbar from "../components/Navbar";
import AppHeader from "../components/AppHeader";
import CreateTask from "../components/CreateTask";
import {
    colors,
    font,
    spacing,
    radius,
    shadow,
    components,
    badgeStyle,
} from "../theme";

export default function ManagerPage() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);
    const openCreateTask = () => setCreateTaskOpen(true);
    const closeCreateTask = () => setCreateTaskOpen(false);
    // const togglePassword = () => setShowPassword((v) => !v);
    const toggleCreateTask = () => setCreateTaskOpen((v) => !v);

    const building = {
        id: 2,
        name: "Blok A",
        city: "Poznań",
        district: "Wilda",
        street_address: "ul. Górna 12",
    };

    const manager = {
        id: 3,
        firstName: "Anna",
        lastName: "Kowalska",
    };

    const contractor = {
        id: 4,
        firstName: "Marek",
        lastName: "Nowak",
    };

    const buildings = [
        {
            id: 1,
            street_address: "ul. Górna 12",
            district: "Wilda",
            city: "Poznań",
        },
        {
            id: 2,
            street_address: "ul. Dolna 5",
            district: "Jeżyce",
            city: "Poznań",
        },
        {
            id: 3,
            street_address: "ul. Środkowa 8",
            district: "Grunwald",
            city: "Poznań",
        },
    ];

    const contractors = [
        { id: 4, firstName: "Marek", lastName: "Nowak" },
        { id: 5, firstName: "Piotr", lastName: "Wiśniewski" },
        { id: 6, firstName: "Tomasz", lastName: "Zając" },
    ];

    const pendingTask = {
        id: 1,
        title: "Replace HVAC filters in Unit 4B",
        description:
            "Filters in unit 4B are overdue for replacement. Tenant reported reduced airflow. Use the standard 16×20×1 MERV-8 filters from the supply closet on floor 2.",
        status: "pending",
        building,
        created_by: manager,
        assigned_to: contractor,
        created_at: "2025-10-15T12:00:00Z",
        updated_at: "2025-10-15T12:00:00Z",
    };

    const completedTask = {
        id: 2,
        title: "Fix leaking pipe in basement",
        description:
            "Water leak reported near the boiler room. Pipe joint needs resealing.",
        status: "completed",
        building,
        created_by: manager,
        assigned_to: contractor,
        created_at: "2025-10-10T09:00:00Z",
        updated_at: "2025-10-11T14:30:00Z",
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                background: colors.pageBg,
                alignItems: "center",
                justifyContent: "center",
                fontFamily: font.family.sans,
                padding: `${spacing[20]} ${spacing[4]} ${spacing[16]}`,
                boxSizing: "border-box",
                minHeight: "100vh",
            }}
        >
            <AppHeader />
            <Navbar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    marginTop: "12px",
                }}
            >
                <Task
                    initialData={pendingTask}
                    onMarkCompleted={() =>
                        console.log("Mark completed:", pendingTask.id)
                    }
                    onReassign={() => console.log("Reassign:", pendingTask.id)}
                />
                <Task
                    initialData={pendingTask}
                    onMarkCompleted={() =>
                        console.log("Mark completed:", pendingTask.id)
                    }
                    onReassign={() => console.log("Reassign:", pendingTask.id)}
                />
                <Task
                    initialData={completedTask}
                    onMarkCompleted={() =>
                        console.log("Mark completed:", completedTask.id)
                    }
                    onReassign={() =>
                        console.log("Reassign:", completedTask.id)
                    }
                />
            </div>
            <button
                style={{
                    ...components.primaryButton,
                    position: "fixed",
                    bottom: spacing[24],
                    right: spacing[4],
                    padding: `${spacing[1]} ${spacing[1]}`,
                    borderRadius: radius.full,
                    fontFamily: font.family.sans,
                    boxSizing: "border-box",
                    zIndex: 200,
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background = colors.primaryHover)
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background = colors.primary)
                }
                onClick={toggleCreateTask}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>
            {isCreateTaskOpen && (
                <CreateTask
                    buildings={buildings}
                    contractors={contractors}
                    onClose={closeCreateTask}
                />
            )}
            <Bottombar />
        </div>
    );
}
