import { colors, font, spacing } from "../theme";

const headerContainerStyle = {
	background: colors.shell,
	height: "52px",
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
	padding: `0 ${spacing[4]}`,
	boxSizing: "border-box",
	flexShrink: 0,
};

const logoStyle = {
	width: "36px",
	height: "36px",
	alignSelf: "center",
	marginTop: "-4px",
};

const titleStyle = {
	fontFamily: font.family.sans,
	fontSize: font.size.xl,
	fontWeight: font.weight.bold,
	color: colors.shellText,
	letterSpacing: font.letterSpacing.tight,
	lineHeight: "52px",
};

export default function AppHeader() {
	return (
		<div style={headerContainerStyle}>
			<img
				src="/favicon.png"
				alt="Structura logo"
				style={logoStyle}
			/>
			<span style={titleStyle}>
				Structura
			</span>
		</div>
	);
}
