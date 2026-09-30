import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { colors, font, radius, shadow } from "../theme";
import { IconCalendar, IconChevronDown, IconChevronLeft, IconChevronRight, IconClose } from "./icons";

const MONTH_NAMES_PL = [
	"Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
	"Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
];
const MONTH_NAMES_EN = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT_PL = [
	"sty", "lut", "mar", "kwi", "maj", "cze",
	"lip", "sie", "wrz", "paź", "lis", "gru"
];
const MONTH_SHORT_EN = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const WEEKDAYS_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatYMD(d) {
	if (!d) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function parseYMD(str) {
	if (!str || typeof str !== "string") return null;
	const parts = str.split("-");
	if (parts.length !== 3) return null;
	const y = parseInt(parts[0], 10);
	const m = parseInt(parts[1], 10) - 1;
	const d = parseInt(parts[2], 10);
	if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
	return new Date(y, m, d);
}

function getPresets() {
	const today = new Date();
	const y = today.getFullYear();
	const m = today.getMonth();
	const d = today.getDate();

	const todayStr = formatYMD(today);

	const yesterday = new Date(y, m, d - 1);
	const yesterdayStr = formatYMD(yesterday);

	const last7 = new Date(y, m, d - 6);
	const last7Str = formatYMD(last7);

	const last30 = new Date(y, m, d - 29);
	const last30Str = formatYMD(last30);

	const thisMonthStart = new Date(y, m, 1);
	const thisMonthEnd = new Date(y, m + 1, 0);

	const lastMonthStart = new Date(y, m - 1, 1);
	const lastMonthEnd = new Date(y, m, 0);

	return [
		{ id: "all", labelPl: "Wszystkie", labelEn: "All time", start: "", end: "" },
		{ id: "today", labelPl: "Dzisiaj", labelEn: "Today", start: todayStr, end: todayStr },
		{ id: "yesterday", labelPl: "Wczoraj", labelEn: "Yesterday", start: yesterdayStr, end: yesterdayStr },
		{ id: "7days", labelPl: "Ostatnie 7 dni", labelEn: "Last 7 days", start: last7Str, end: todayStr },
		{ id: "30days", labelPl: "Ostatnie 30 dni", labelEn: "Last 30 days", start: last30Str, end: todayStr },
		{ id: "this_month", labelPl: "Ten miesiąc", labelEn: "This month", start: formatYMD(thisMonthStart), end: formatYMD(thisMonthEnd) },
		{ id: "last_month", labelPl: "Poprzedni miesiąc", labelEn: "Last month", start: formatYMD(lastMonthStart), end: formatYMD(lastMonthEnd) },
	];
}

function getButtonLabel(startDate, endDate, language) {
	const isPl = language !== "en";
	if (!startDate && !endDate) {
		return isPl ? "Wszystkie" : "All time";
	}

	const presets = getPresets();
	const matchingPreset = presets.find((p) => p.start === startDate && p.end === endDate);
	if (matchingPreset && matchingPreset.id !== "all") {
		return isPl ? matchingPreset.labelPl : matchingPreset.labelEn;
	}

	const startD = parseYMD(startDate);
	const endD = parseYMD(endDate);
	const shortMonths = isPl ? MONTH_SHORT_PL : MONTH_SHORT_EN;

	if (startD && endD) {
		if (startDate === endDate) {
			return `${startD.getDate()} ${shortMonths[startD.getMonth()]}`;
		}
		if (startD.getFullYear() === endD.getFullYear()) {
			return `${startD.getDate()} ${shortMonths[startD.getMonth()]} – ${endD.getDate()} ${shortMonths[endD.getMonth()]}`;
		}
		return `${startD.getDate()} ${shortMonths[startD.getMonth()]} ${startD.getFullYear()} – ${endD.getDate()} ${shortMonths[endD.getMonth()]} ${endD.getFullYear()}`;
	}
	if (startD) {
		return `Od ${startD.getDate()} ${shortMonths[startD.getMonth()]}`;
	}
	if (endD) {
		return `Do ${endD.getDate()} ${shortMonths[endD.getMonth()]}`;
	}
	return isPl ? "Zakres dat" : "Date range";
}

function PresetsList({ presets, activePresetId, language, onSelectPreset }) {
	const isPl = language !== "en";
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "2px",
				minWidth: "140px",
				borderRight: `1px solid ${colors.borderSubtle}`,
				paddingRight: "8px",
			}}
		>
			<div
				style={{
					fontSize: "10px",
					fontWeight: font.weight.semibold,
					color: colors.textSecondary,
					textTransform: "uppercase",
					letterSpacing: "0.5px",
					padding: "4px 8px",
				}}
			>
				{isPl ? "Szybki wybór" : "Quick presets"}
			</div>
			{presets.map((preset) => {
				const isSelected = activePresetId === preset.id;
				return (
					<button
						key={preset.id}
						type="button"
						onClick={() => onSelectPreset(preset)}
						style={{
							textAlign: "left",
							background: isSelected ? `${colors.primary}18` : "transparent",
							color: isSelected ? colors.primary : colors.textPrimary,
							fontWeight: isSelected ? font.weight.semibold : font.weight.normal,
							fontSize: "12px",
							padding: "6px 8px",
							borderRadius: radius.md,
							border: "none",
							cursor: "pointer",
							transition: "background-color 0.15s ease",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<span>{isPl ? preset.labelPl : preset.labelEn}</span>
						{isSelected && (
							<span style={{ fontSize: "11px", color: colors.primary }}>✓</span>
						)}
					</button>
				);
			})}
		</div>
	);
}

function CalendarMonthGrid({
	viewYear,
	viewMonth,
	startDate,
	endDate,
	hoverDate,
	onDateClick,
	onDateHover,
	language,
}) {
	const isPl = language !== "en";
	const monthNames = isPl ? MONTH_NAMES_PL : MONTH_NAMES_EN;
	const weekdays = isPl ? WEEKDAYS_PL : WEEKDAYS_EN;

	const todayStr = formatYMD(new Date());

	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const firstDay = new Date(viewYear, viewMonth, 1).getDay();
	const offset = firstDay === 0 ? 6 : firstDay - 1;

	const days = [];
	for (let i = 0; i < offset; i++) {
		days.push(null);
	}
	for (let d = 1; d <= daysInMonth; d++) {
		days.push(d);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<div
				style={{
					fontSize: "12px",
					fontWeight: font.weight.semibold,
					color: colors.textHeading,
					textAlign: "center",
				}}
			>
				{monthNames[viewMonth]} {viewYear}
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(7, 34px)",
					gap: "2px",
					textAlign: "center",
				}}
			>
				{weekdays.map((wd) => (
					<div
						key={wd}
						style={{
							fontSize: "10px",
							fontWeight: font.weight.medium,
							color: colors.textSecondary,
							padding: "4px 0",
						}}
					>
						{wd}
					</div>
				))}

				{days.map((day, idx) => {
					if (!day) {
						return <div key={`empty-${idx}`} style={{ width: "34px", height: "34px" }} />;
					}

					const currentStr = formatYMD(new Date(viewYear, viewMonth, day));
					const isToday = currentStr === todayStr;

					const isStart = startDate === currentStr;
					const isEnd = endDate === currentStr;
					const isSingle = isStart && isEnd;

					let inRange = false;
					if (startDate && endDate) {
						inRange = currentStr >= startDate && currentStr <= endDate;
					} else if (startDate && hoverDate) {
						const lower = startDate < hoverDate ? startDate : hoverDate;
						const upper = startDate < hoverDate ? hoverDate : startDate;
						inRange = currentStr >= lower && currentStr <= upper;
					}

					let bg = "transparent";
					let color = colors.textPrimary;
					let cellRadius = radius.md;

					if (isStart || isEnd) {
						bg = colors.primary;
						color = "#fff";
						cellRadius = isSingle ? radius.full : isStart ? "6px 0 0 6px" : "0 6px 6px 0";
					} else if (inRange) {
						bg = `${colors.primary}20`;
						color = colors.primary;
						cellRadius = 0;
					}

					return (
						<button
							key={day}
							type="button"
							onClick={() => onDateClick(currentStr)}
							onMouseEnter={() => onDateHover(currentStr)}
							onMouseLeave={() => onDateHover(null)}
							style={{
								width: "34px",
								height: "34px",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "12px",
								fontWeight: isStart || isEnd || isToday ? font.weight.semibold : font.weight.normal,
								background: bg,
								color: color,
								borderRadius: cellRadius,
								border: isToday && !isStart && !isEnd ? `1px solid ${colors.primary}` : "none",
								cursor: "pointer",
								padding: 0,
								boxSizing: "border-box",
								transition: "background-color 0.12s ease",
							}}
						>
							{day}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function DateRangePopover({
	coords,
	popoverRef,
	presets,
	activePresetId,
	language,
	viewYear,
	viewMonth,
	rangeStart,
	rangeEnd,
	hoverDate,
	onPrevMonth,
	onNextMonth,
	onSelectPreset,
	onDateClick,
	onDateHover,
	onClear,
	onApply,
}) {
	const isPl = language !== "en";
	return (
		<div
			ref={popoverRef}
			style={{
				position: "fixed",
				top: `${coords.top}px`,
				left: `${coords.left}px`,
				backgroundColor: colors.cardBg,
				border: `1px solid ${colors.borderSubtle}`,
				borderRadius: radius.lg,
				boxShadow: shadow.cardHover || "0 12px 32px -4px rgba(0, 0, 0, 0.2)",
				padding: "12px",
				zIndex: 99999,
				display: "flex",
				flexDirection: "column",
				gap: "12px",
				animation: "popIn 0.15s ease-out",
				maxWidth: "calc(100vw - 24px)",
				boxSizing: "border-box",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: window.innerWidth < 480 ? "column" : "row",
					gap: "12px",
				}}
			>
				<PresetsList
					presets={presets}
					activePresetId={activePresetId}
					language={language}
					onSelectPreset={onSelectPreset}
				/>

				<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "0 4px",
						}}
					>
						<button
							type="button"
							onClick={onPrevMonth}
							aria-label={isPl ? "Poprzedni miesiąc" : "Previous month"}
							style={{
								background: "transparent",
								border: `1px solid ${colors.borderSubtle}`,
								borderRadius: radius.sm,
								padding: "4px 8px",
								cursor: "pointer",
								color: colors.textSecondary,
								display: "flex",
								alignItems: "center",
							}}
						>
							<IconChevronLeft size="xs" />
						</button>
						<span style={{ fontSize: "11px", color: colors.textSecondary }}>
							{isPl ? "Wybierz datę lub zakres" : "Pick date or range"}
						</span>
						<button
							type="button"
							onClick={onNextMonth}
							aria-label={isPl ? "Następny miesiąc" : "Next month"}
							style={{
								background: "transparent",
								border: `1px solid ${colors.borderSubtle}`,
								borderRadius: radius.sm,
								padding: "4px 8px",
								cursor: "pointer",
								color: colors.textSecondary,
								display: "flex",
								alignItems: "center",
							}}
						>
							<IconChevronRight size="xs" />
						</button>
					</div>

					<CalendarMonthGrid
						viewYear={viewYear}
						viewMonth={viewMonth}
						startDate={rangeStart}
						endDate={rangeEnd}
						hoverDate={hoverDate}
						onDateClick={onDateClick}
						onDateHover={onDateHover}
						language={language}
					/>
				</div>
			</div>

			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderTop: `1px solid ${colors.borderSubtle}`,
					paddingTop: "10px",
					gap: "8px",
				}}
			>
				<div style={{ fontSize: "11px", color: colors.textSecondary }}>
					{rangeStart && (
						<span>
							{rangeStart} {rangeEnd && `→ ${rangeEnd}`}
						</span>
					)}
				</div>
				<div style={{ display: "flex", gap: "6px" }}>
					<button
						type="button"
						onClick={onClear}
						style={{
							background: "transparent",
							border: `1px solid ${colors.borderSubtle}`,
							borderRadius: radius.sm,
							padding: "4px 10px",
							fontSize: "11px",
							color: colors.textSecondary,
							cursor: "pointer",
						}}
					>
						{isPl ? "Wyczyść" : "Clear"}
					</button>
					<button
						type="button"
						onClick={onApply}
						disabled={!rangeStart}
						style={{
							background: rangeStart ? colors.primary : colors.borderSubtle,
							color: "#fff",
							border: "none",
							borderRadius: radius.sm,
							padding: "4px 12px",
							fontSize: "11px",
							fontWeight: font.weight.medium,
							cursor: rangeStart ? "pointer" : "not-allowed",
						}}
					>
						{isPl ? "Zastosuj" : "Apply"}
					</button>
				</div>
			</div>
		</div>
	);
}

function useDateRangeState({ startDate, endDate, onChange }) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverDate, setHoverDate] = useState(null);
	const [rangeStart, setRangeStart] = useState(startDate);
	const [rangeEnd, setRangeEnd] = useState(endDate);

	const initialDate = parseYMD(startDate) || new Date();
	const [viewYear, setViewYear] = useState(initialDate.getFullYear());
	const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const [coords, setCoords] = useState(null);

	const updateCoords = useCallback(() => {
		if (!triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		const popoverWidth = Math.min(520, window.innerWidth - 24);
		const spaceRight = window.innerWidth - rect.left;
		const left = spaceRight < popoverWidth ? Math.max(12, window.innerWidth - popoverWidth - 12) : rect.left;
		setCoords({
			top: rect.bottom + 6,
			left: left,
		});
	}, []);

	useEffect(() => {
		if (isOpen) {
			updateCoords();
		}
	}, [isOpen, updateCoords]);

	const handleToggle = () => {
		if (!isOpen) {
			setRangeStart(startDate);
			setRangeEnd(endDate);
			const parsed = parseYMD(startDate) || new Date();
			setViewYear(parsed.getFullYear());
			setViewMonth(parsed.getMonth());
		}
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e) => {
			if (
				triggerRef.current &&
				!triggerRef.current.contains(e.target) &&
				popoverRef.current &&
				!popoverRef.current.contains(e.target)
			) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		const handleResizeOrScroll = () => {
			updateCoords();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", handleResizeOrScroll);
		window.addEventListener("scroll", handleResizeOrScroll, true);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", handleResizeOrScroll);
			window.removeEventListener("scroll", handleResizeOrScroll, true);
		};
	}, [isOpen, updateCoords]);

	const handlePrevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else {
			setViewMonth((m) => m - 1);
		}
	};

	const handleNextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else {
			setViewMonth((m) => m + 1);
		}
	};

	const handleSelectPreset = (preset) => {
		setRangeStart(preset.start);
		setRangeEnd(preset.end);
		onChange(preset.start, preset.end);
		setIsOpen(false);
	};

	const handleDateClick = (dateStr) => {
		if (!rangeStart || (rangeStart && rangeEnd)) {
			setRangeStart(dateStr);
			setRangeEnd("");
		} else {
			let s = rangeStart;
			let e = dateStr;
			if (e < s) {
				const temp = s;
				s = e;
				e = temp;
			}
			setRangeStart(s);
			setRangeEnd(e);
			onChange(s, e);
			setIsOpen(false);
		}
	};

	const handleClear = () => {
		setRangeStart("");
		setRangeEnd("");
		onChange("", "");
		setIsOpen(false);
	};

	const handleApply = () => {
		onChange(rangeStart, rangeEnd || rangeStart);
		setIsOpen(false);
	};

	return {
		isOpen,
		rangeStart,
		rangeEnd,
		hoverDate,
		viewYear,
		viewMonth,
		coords,
		triggerRef,
		popoverRef,
		setHoverDate,
		handleToggle,
		handlePrevMonth,
		handleNextMonth,
		handleSelectPreset,
		handleDateClick,
		handleClear,
		handleApply,
	};
}

export default function DateRangePicker({
	startDate = "",
	endDate = "",
	onChange,
	language = "pl",
	height = "42px",
}) {
	const isPl = language !== "en";
	const presets = useMemo(() => getPresets(), []);

	const activePresetId = useMemo(() => {
		const match = presets.find((p) => p.start === startDate && p.end === endDate);
		return match ? match.id : (!startDate && !endDate ? "all" : "custom");
	}, [presets, startDate, endDate]);

	const {
		isOpen,
		rangeStart,
		rangeEnd,
		hoverDate,
		viewYear,
		viewMonth,
		coords,
		triggerRef,
		popoverRef,
		setHoverDate,
		handleToggle,
		handlePrevMonth,
		handleNextMonth,
		handleSelectPreset,
		handleDateClick,
		handleClear,
		handleApply,
	} = useDateRangeState({ startDate, endDate, onChange });

	const buttonLabel = getButtonLabel(startDate, endDate, language);
	const isFiltered = Boolean(startDate || endDate);

	return (
		<div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
			<button
				ref={triggerRef}
				type="button"
				onClick={handleToggle}
				aria-expanded={isOpen}
				style={{
					display: "inline-flex",
					alignItems: "center",
					gap: "8px",
					height: height,
					padding: isFiltered ? "0 8px 0 12px" : "0 12px",
					borderRadius: radius.md,
					border: `1px solid ${isFiltered || isOpen ? colors.primary : colors.borderSubtle}`,
					background: isFiltered || isOpen ? `${colors.primary}12` : colors.cardBg,
					color: isFiltered || isOpen ? colors.primary : colors.textPrimary,
					fontSize: "12px",
					fontWeight: font.weight.medium,
					cursor: "pointer",
					boxSizing: "border-box",
					transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
					whiteSpace: "nowrap",
				}}
			>
				<IconCalendar size="sm" />
				<span style={{ color: colors.textSecondary, fontSize: "11px" }}>
					{isPl ? "Zakres:" : "Range:"}
				</span>
				<span style={{ fontWeight: font.weight.semibold }}>{buttonLabel}</span>
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s ease",
						color: colors.textSecondary,
						marginLeft: "2px",
					}}
				>
					<IconChevronDown size="xs" />
				</span>
			</button>

			{isFiltered && (
				<button
					type="button"
					onClick={handleClear}
					aria-label={isPl ? "Wyczyść zakres dat" : "Clear date range"}
					style={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						marginLeft: "4px",
						color: colors.textSecondary,
						background: "transparent",
						border: "none",
						cursor: "pointer",
						padding: "4px",
						borderRadius: radius.full,
					}}
				>
					<IconClose size="xs" />
				</button>
			)}

			{isOpen && coords && createPortal(
				<DateRangePopover
					coords={coords}
					popoverRef={popoverRef}
					presets={presets}
					activePresetId={activePresetId}
					language={language}
					viewYear={viewYear}
					viewMonth={viewMonth}
					rangeStart={rangeStart}
					rangeEnd={rangeEnd}
					hoverDate={hoverDate}
					onPrevMonth={handlePrevMonth}
					onNextMonth={handleNextMonth}
					onSelectPreset={handleSelectPreset}
					onDateClick={handleDateClick}
					onDateHover={setHoverDate}
					onClear={handleClear}
					onApply={handleApply}
				/>,
				document.body
			)}
		</div>
	);
}
