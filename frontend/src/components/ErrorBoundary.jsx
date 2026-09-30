import React from "react";
import { colors, font, radius, shadow, status, spacing } from "../theme";
import { IconAlertTriangle } from "./icons";
import Button from "./ui/Button";

export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		this.setState({ errorInfo });
		console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
		if (window.Sentry && typeof window.Sentry.captureException === "function") {
			window.Sentry.captureException(error, { extra: errorInfo });
		}
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						minHeight: "100dvh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: colors.pageBg,
						fontFamily: font.family.sans,
						padding: spacing[4],
						boxSizing: "border-box",
					}}
				>
					<div
						style={{
							maxWidth: "480px",
							width: "100%",
							backgroundColor: colors.cardBg,
							borderRadius: radius.xl,
							boxShadow: shadow.modal,
							border: `1px solid ${colors.borderSubtle}`,
							padding: `${spacing[8]} ${spacing[6]}`,
							textAlign: "center",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: spacing[4],
							boxSizing: "border-box",
						}}
					>
						<div
							style={{
								width: "56px",
								height: "56px",
								borderRadius: radius.full,
								backgroundColor: status.danger.bg,
								color: status.danger.text,
								border: `1px solid ${status.danger.border}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<IconAlertTriangle size="lg" />
						</div>

						<div>
							<h2
								style={{
									margin: `0 0 ${spacing[2]} 0`,
									color: colors.textHeading,
									fontSize: font.size.xl,
									fontWeight: font.weight.bold,
								}}
							>
								Something went wrong
							</h2>
							<p
								style={{
									color: colors.textSecondary,
									fontSize: font.size.sm,
									lineHeight: font.lineHeight.normal,
									margin: 0,
								}}
							>
								An unexpected error interrupted the application interface. Your session data is safely preserved.
							</p>
						</div>

						<Button
							variant="primary"
							size="lg"
							onClick={this.handleReset}
							style={{ minHeight: "48px", minWidth: "160px" }}
						>
							Reload Application
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
