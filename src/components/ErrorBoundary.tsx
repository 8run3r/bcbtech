import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        padding: 20,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "#ff3d71",
            marginBottom: 16,
          }}>
            // SYSTEM_ERROR
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 12px",
            letterSpacing: "-0.04em",
          }}>
            Oops
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 32,
          }}>
            Niečo sa pokazilo. Skúste obnoviť stránku.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#00ffaa",
              background: "transparent",
              border: "1px solid rgba(0,255,170,0.3)",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            [ RELOAD ]
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
