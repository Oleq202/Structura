/**
 * Badge — Semantic status indicator for Structura.
 *
 * Uses status tokens from theme.js for consistent coloring.
 * Includes optional dot indicator for outdoor sunlight readability.
 *
 * Usage:
 *   <Badge status="pending">Pending</Badge>
 *   <Badge status="completed" dot>Completed</Badge>
 */
import { status as statusTokens, font, spacing, radius } from "../../theme";

const baseBadgeStyle = {
	display: "inline-flex",
	alignItems: "center",
	gap: "6px",
	borderRadius: radius.full,
	fontSize: font.size.xs,
	fontWeight: font.weight.semibold,
	fontFamily: font.family.sans,
	padding: `3px ${spacing[2]}`,
	whiteSpace: "nowrap",
	lineHeight: 1.4,
	letterSpacing: font.letterSpacing.wide,
};

export default function Badge({
	children,
	status = "info",
	dot = true,
	style: customStyle,
	...props
}) {
	const s = statusTokens[status] || statusTokens.info;

	const badgeStyle = {
		...baseBadgeStyle,
		background: s.bg,
		color: s.text,
		border: `1px solid ${s.border}`,
		...customStyle,
	};

	return (
		<span style={badgeStyle} {...props}>
			{dot && (
				<span
					style={{
						width: "7px",
						height: "7px",
						borderRadius: radius.full,
						background: s.solid || s.text,
						flexShrink: 0,
					}}
					aria-hidden="true"
				/>
			)}
			{children}
		</span>
	);
}
