const API_BASE = "http://localhost:8000";

export async function login(login, password) {
	const response = await fetch(`${API_BASE}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			login,
			password,
		}),
	});
	if (!response.ok) {
		throw new Error("Login failed");
	}
	return response.json();
}

export async function createUser(userData) {
	const response = await fetch(`${API_BASE}/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(userData),
	});
	if (!response.ok) {
		throw new Error("Failed to create user");
	}
	return response.json();
}

export async function createBuilding(buildingData) {
	const response = await fetch(`${API_BASE}/buildings`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(buildingData),
	});
	if (!response.ok) {
		throw new Error("Failed to create building");
	}
	return response.json();
}

export async function assignBuildingManager(userId, buildingId) {
	const response = await fetch(`${API_BASE}/building-managers`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ user_id: userId, building_id: buildingId }),
	});
	if (!response.ok) throw new Error("Failed to assign building manager");
	return response.json();
}
