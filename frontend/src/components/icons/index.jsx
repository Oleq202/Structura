/**
 * Structura Icon Library
 *
 * Centralized, zero-dependency SVG icon components.
 * All icons use a unified 24×24 viewBox with consistent 2px stroke width.
 *
 * Usage:
 *   import { IconCheck, IconPlus } from "../icons";
 *   <IconCheck size="md" />
 *   <IconPlus size={20} className="my-icon" />
 */

const SIZES = {
	xs: 14,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 28,
};

function resolveSize(size) {
	if (typeof size === "number") return size;
	return SIZES[size] || SIZES.md;
}

function Icon({ size = "md", children, style, ...props }) {
	const px = resolveSize(size);
	return (
		<svg
			width={px}
			height={px}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ flexShrink: 0, ...style }}
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

// ── Navigation & Actions ──────────────────────────────

export function IconCheck(props) {
	return (
		<Icon {...props}>
			<polyline points="20 6 9 17 4 12" />
		</Icon>
	);
}

export function IconPlus(props) {
	return (
		<Icon {...props}>
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</Icon>
	);
}

export function IconClose(props) {
	return (
		<Icon {...props}>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</Icon>
	);
}

export function IconSearch(props) {
	return (
		<Icon {...props}>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</Icon>
	);
}

export function IconFilter(props) {
	return (
		<Icon {...props}>
			<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
		</Icon>
	);
}

export function IconEdit(props) {
	return (
		<Icon {...props}>
			<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
			<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
		</Icon>
	);
}

export function IconTrash(props) {
	return (
		<Icon {...props}>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</Icon>
	);
}

export function IconRefresh(props) {
	return (
		<Icon {...props}>
			<polyline points="23 4 23 10 17 10" />
			<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
		</Icon>
	);
}

// ── Chevrons & Arrows ─────────────────────────────────

export function IconChevronDown(props) {
	return (
		<Icon {...props}>
			<polyline points="6 9 12 15 18 9" />
		</Icon>
	);
}

export function IconChevronUp(props) {
	return (
		<Icon {...props}>
			<polyline points="18 15 12 9 6 15" />
		</Icon>
	);
}

export function IconChevronRight(props) {
	return (
		<Icon {...props}>
			<polyline points="9 18 15 12 9 6" />
		</Icon>
	);
}

export function IconChevronLeft(props) {
	return (
		<Icon {...props}>
			<polyline points="15 18 9 12 15 6" />
		</Icon>
	);
}

// ── Domain Objects ────────────────────────────────────

export function IconBuilding(props) {
	return (
		<Icon {...props}>
			<rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01" />
			<path d="M16 6h.01" />
			<path d="M12 6h.01" />
			<path d="M12 10h.01" />
			<path d="M12 14h.01" />
			<path d="M16 10h.01" />
			<path d="M16 14h.01" />
			<path d="M8 10h.01" />
			<path d="M8 14h.01" />
		</Icon>
	);
}

export function IconUser(props) {
	return (
		<Icon {...props}>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</Icon>
	);
}

export function IconUsers(props) {
	return (
		<Icon {...props}>
			<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</Icon>
	);
}

export function IconMapPin(props) {
	return (
		<Icon {...props}>
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
			<circle cx="12" cy="10" r="3" />
		</Icon>
	);
}

export function IconClock(props) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</Icon>
	);
}

export function IconCalendar(props) {
	return (
		<Icon {...props}>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</Icon>
	);
}

export function IconTasks(props) {
	return (
		<Icon {...props}>
			<path d="M9 11l3 3L22 4" />
			<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
		</Icon>
	);
}

// ── UI / System ───────────────────────────────────────

export function IconEye(props) {
	return (
		<Icon {...props}>
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</Icon>
	);
}

export function IconEyeOff(props) {
	return (
		<Icon {...props}>
			<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
			<line x1="1" y1="1" x2="23" y2="23" />
		</Icon>
	);
}

export function IconKey(props) {
	return (
		<Icon {...props}>
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</Icon>
	);
}

export function IconLogout(props) {
	return (
		<Icon {...props}>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</Icon>
	);
}

export function IconGlobe(props) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="10" />
			<line x1="2" y1="12" x2="22" y2="12" />
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
		</Icon>
	);
}

export function IconSettings(props) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
		</Icon>
	);
}

export function IconList(props) {
	return (
		<Icon {...props}>
			<line x1="8" y1="6" x2="21" y2="6" />
			<line x1="8" y1="12" x2="21" y2="12" />
			<line x1="8" y1="18" x2="21" y2="18" />
			<line x1="3" y1="6" x2="3.01" y2="6" />
			<line x1="3" y1="12" x2="3.01" y2="12" />
			<line x1="3" y1="18" x2="3.01" y2="18" />
		</Icon>
	);
}

export function IconAlertTriangle(props) {
	return (
		<Icon {...props}>
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</Icon>
	);
}

export function IconSpinner({ size = "md", style, ...props }) {
	const px = resolveSize(size);
	return (
		<svg
			width={px}
			height={px}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ flexShrink: 0, animation: "spin 0.8s linear infinite", ...style }}
			aria-hidden="true"
			{...props}
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
}
