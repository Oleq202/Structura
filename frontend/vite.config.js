import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		host: true,
		allowedHosts: true,
		headers: {
			"Content-Security-Policy": [
				"default-src 'self'",
				"script-src 'self' 'unsafe-eval' 'unsafe-inline'",
				"style-src 'self' 'unsafe-inline'",
				"img-src 'self' data:",
				"connect-src 'self' ws: wss: http://localhost:8000 http://localhost:8001 http://192.168.1.213:8000 http://192.168.137.1:8000 http://*:8000",
				"font-src 'self'",
				"frame-ancestors 'none'",
			].join("; "),
		},
	},
});
