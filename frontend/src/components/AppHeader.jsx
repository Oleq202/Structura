import { colors, font, spacing } from "../theme";

const headerContainerStyle = {
	background: colors.shell,
	minHeight: "52px",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	paddingTop: "env(safe-area-inset-top, 0px)",
	paddingLeft: "max(16px, env(safe-area-inset-left, 0px))",
	paddingRight: "max(16px, env(safe-area-inset-right, 0px))",
	boxSizing: "border-box",
	flexShrink: 0,
	zIndex: 100,
	borderBottom: `1px solid ${colors.shellDeep}`,
};

const headerInnerStyle = {
	maxWidth: "840px",
	width: "100%",
	height: "52px",
	display: "flex",
	alignItems: "center",
	gap: spacing[3],
};

const logoStyle = {
	width: "36px",
	height: "36px",
	alignSelf: "center",
	marginTop: "-2px",
};

const titleStyle = {
	fontFamily: font.family.sans,
	fontSize: font.size.xl,
	fontWeight: font.weight.bold,
	color: colors.shellText,
	letterSpacing: font.letterSpacing.tight,
};

export default function AppHeader() {
	return (
		<header style={headerContainerStyle}>
			<div style={headerInnerStyle}>
				<img
					src="/favicon.png"
					alt="Structura logo"
					style={logoStyle}
				/>
				<span style={titleStyle}>
					Structura
				</span>
			</div>
		</header>
	);
}
