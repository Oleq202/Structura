import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		headers: {
			"Content-Security-Policy": [
				"default-src 'self'",
				"script-src 'self'",
				"style-src 'self' 'unsafe-inline'",
				"img-src 'self' data:",
				"connect-src 'self' http://localhost:8000 http://localhost:8001",
				"font-src 'self'",
				"frame-ancestors 'none'",
			].join("; "),
		},
	},
});
