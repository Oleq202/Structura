/**
 * Skeleton — Loading placeholder primitive for Structura.
 *
 * Renders a shimmering placeholder shape while content is loading.
 * Uses the shimmer animation defined in index.css.
 *
 * Presets:
 *   <Skeleton.Text />      — single line
 *   <Skeleton.Card />      — card-shaped block
 *   <Skeleton.Avatar />    — circle
 */
import { colors, radius } from "../../theme";

const baseSkeletonStyle = {
	background: `linear-gradient(90deg, ${colors.borderSubtle} 25%, ${colors.pageBg} 50%, ${colors.borderSubtle} 75%)`,
	backgroundSize: "400% 100%",
	animation: "shimmer 1.8s ease-in-out infinite",
	borderRadius: radius.md,
};

export default function Skeleton({
	width = "100%",
	height = "20px",
	borderRadius: br,
	style: customStyle,
	...props
}) {
	return (
		<div
			style={{
				...baseSkeletonStyle,
				width,
				height,
				...(br ? { borderRadius: br } : {}),
				...customStyle,
			}}
			aria-hidden="true"
			role="presentation"
			{...props}
		/>
	);
}

Skeleton.Text = function SkeletonText({ width = "100%", lines = 1, gap = "10px", ...props }) {
	if (lines === 1) return <Skeleton width={width} height="16px" {...props} />;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap }} aria-hidden="true">
			{Array.from({ length: lines }, (_, i) => (
				<Skeleton
					key={i}
					width={i === lines - 1 ? "70%" : width}
					height="16px"
					{...props}
				/>
			))}
		</div>
	);
};

Skeleton.Card = function SkeletonCard({ height = "120px", ...props }) {
	return (
		<Skeleton
			width="100%"
			height={height}
			borderRadius={radius.lg}
			{...props}
		/>
	);
};

Skeleton.Avatar = function SkeletonAvatar({ size = "40px", ...props }) {
	return (
		<Skeleton
			width={size}
			height={size}
			borderRadius="50%"
			style={{ flexShrink: 0 }}
			{...props}
		/>
	);
};
