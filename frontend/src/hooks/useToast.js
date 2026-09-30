import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		return {
			toast: {
				show: console.log,
				success: console.log,
				error: console.error,
				info: console.info,
				dismiss: () => {},
			},
		};
	}
	return context;
}

export default useToast;
