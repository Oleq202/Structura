/**
 * Card — Surface container primitive for Structura.
 *
 * Provides consistent background, border, radius, and shadow
 * from design tokens. Optional hover elevation effect.
 */
import { colors, radius, shadow, spacing } from "../../theme";

const baseCardStyle = {
	background: colors.cardBg,
	border: `1px solid ${colors.cardBorder}`,
	borderRadius: radius.lg,
	padding: spacing[4],
	boxShadow: shadow.card,
	boxSizing: "border-box",
	transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export default function Card({
	children,
	hoverable = false,
	noPadding = false,
	style: customStyle,
	...props
}) {
	const cardStyle = {
		...baseCardStyle,
		...(noPadding ? { padding: 0 } : {}),
		...customStyle,
	};

	const handlePointerEnter = hoverable
		? (e) => {
			e.currentTarget.style.borderColor = colors.cardBorderHover;
			e.currentTarget.style.boxShadow = shadow.cardHover;
		}
		: undefined;

	const handlePointerLeave = hoverable
		? (e) => {
			e.currentTarget.style.borderColor = colors.cardBorder;
			e.currentTarget.style.boxShadow = shadow.card;
		}
		: undefined;

	return (
		<div
			style={cardStyle}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
			{...props}
		>
			{children}
		</div>
	);
}
