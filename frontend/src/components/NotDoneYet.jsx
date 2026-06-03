import { spacing } from "../theme";

export default function NotDoneYet({ text }) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: `0 ${spacing[4]}`,
                boxSizing: "border-box",
            }}
        >
            {text} is not done yet
        </div>
    );
}
