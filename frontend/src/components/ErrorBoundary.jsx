import React from "react";
import { colors, font, radius, shadow, status } from "../theme";

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
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.pageBg,
            fontFamily: font.family.sans,
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              backgroundColor: colors.cardBg,
              borderRadius: radius.lg,
              boxShadow: shadow.modal,
              border: `1px solid ${colors.borderSubtle}`,
              padding: "32px",
              textAlign: "center",
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
                fontSize: "24px",
                fontWeight: "bold",
                margin: "0 auto 16px auto",
              }}
            >
              !
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
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
                fontSize: font.size.base,
                lineHeight: font.lineHeight.normal,
                margin: "0 0 24px 0",
              }}
            >
              An unexpected error interrupted the application interface. Your session data is securely preserved.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 24px",
                minHeight: "44px",
                minWidth: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                backgroundColor: colors.primary,
                color: colors.primaryText,
                border: "none",
                borderRadius: radius.md,
                fontSize: font.size.base,
                fontWeight: font.weight.big,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
