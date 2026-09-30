/**
 * Input — Accessible text input primitive for Structura.
 *
 * Features:
 * - Built-in label, helper text, and error display
 * - 16px font-size on mobile to prevent iOS Safari auto-zoom
 * - 44px min-height touch target
 * - Focus ring and error ring via theme tokens
 * - aria-invalid and aria-describedby for accessibility
 */
import { useState } from "react";
import { colors, font, spacing, radius, shadow } from "../../theme";

const containerStyle = {
	display: "flex",
	flexDirection: "column",
	gap: spacing[1],
	width: "100%",
};

const labelStyle = {
	fontSize: font.size.sm,
	fontWeight: font.weight.semibold,
	color: colors.textSecondary,
	textTransform: "uppercase",
	letterSpacing: font.letterSpacing.caps,
	display: "block",
};

const inputBaseStyle = {
	boxSizing: "border-box",
	width: "100%",
	minHeight: "44px",
	padding: `${spacing[2]} ${spacing[3]}`,
	fontSize: font.size.md, // 16px prevents iOS zoom
	fontFamily: font.family.sans,
	color: colors.textBody,
	background: colors.cardBg,
	borderRadius: radius.md,
	outline: "none",
	transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

const helperStyle = {
	fontSize: font.size.xs,
	fontWeight: font.weight.medium,
	margin: 0,
};

function getInputStyle(hasError, isFocused) {
	return {
		...inputBaseStyle,
		border: `1.5px solid ${
			hasError
				? "#dc2626"
				: isFocused
					? colors.primary
					: colors.borderDefault
		}`,
		boxShadow: hasError
			? isFocused
				? shadow.focusError
				: "none"
			: isFocused
				? shadow.focus
				: "none",
	};
}

export default function Input({
	ref,
	label,
	error,
	helperText,
	id,
	style: customStyle,
	containerProps,
	...inputProps
}) {
	const [focused, setFocused] = useState(false);
	const hasError = !!error;

	const inputId = id || `input-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;
	const errorId = hasError ? `${inputId}-error` : undefined;
	const helperId = helperText && !hasError ? `${inputId}-helper` : undefined;
	const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

	return (
		<div style={containerStyle} {...containerProps}>
			{label && (
				<label htmlFor={inputId} style={labelStyle}>
					{label}
				</label>
			)}
			<input
				ref={ref}
				id={inputId}
				style={{ ...getInputStyle(hasError, focused), ...customStyle }}
				onFocus={(e) => {
					setFocused(true);
					inputProps.onFocus?.(e);
				}}
				onBlur={(e) => {
					setFocused(false);
					inputProps.onBlur?.(e);
				}}
				aria-invalid={hasError || undefined}
				aria-describedby={describedBy}
				{...inputProps}
			/>
			{hasError && (
				<p id={errorId} style={{ ...helperStyle, color: "#dc2626" }} role="alert">
					{error}
				</p>
			)}
			{helperText && !hasError && (
				<p id={helperId} style={{ ...helperStyle, color: colors.textMuted }}>
					{helperText}
				</p>
			)}
		</div>
	);
}

/**
 * Textarea variant with the same API surface as Input.
 */
export function Textarea({
	ref,
	label,
	error,
	helperText,
	id,
	rows = 3,
	style: customStyle,
	containerProps,
	...textareaProps
}) {
	const [focused, setFocused] = useState(false);
	const hasError = !!error;

	const textareaId = id || `textarea-${label?.replace(/\s+/g, "-").toLowerCase() || "field"}`;
	const errorId = hasError ? `${textareaId}-error` : undefined;

	return (
		<div style={containerStyle} {...containerProps}>
			{label && (
				<label htmlFor={textareaId} style={labelStyle}>
					{label}
				</label>
			)}
			<textarea
				ref={ref}
				id={textareaId}
				rows={rows}
				style={{
					...getInputStyle(hasError, focused),
					resize: "vertical",
					minHeight: "80px",
					...customStyle,
				}}
				onFocus={(e) => {
					setFocused(true);
					textareaProps.onFocus?.(e);
				}}
				onBlur={(e) => {
					setFocused(false);
					textareaProps.onBlur?.(e);
				}}
				aria-invalid={hasError || undefined}
				aria-describedby={errorId}
				{...textareaProps}
			/>
			{hasError && (
				<p id={errorId} style={{ ...helperStyle, color: "#dc2626" }} role="alert">
					{error}
				</p>
			)}
			{helperText && !hasError && (
				<p style={{ ...helperStyle, color: colors.textMuted }}>
					{helperText}
				</p>
			)}
		</div>
	);
}
