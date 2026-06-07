const API_BASE = "http://localhost:8000";

export async function login(login, password) {
	const response = await fetch(
		`${API_BASE}/login`,
		{
			method: "POST",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify({
				login,
				password,
			}),
		}
	);
	if (!response.ok) {
		throw new Error("Login failed");
	}
	return response.json();
}

export async function createUser(userData) {
	const response = await fetch(
		`${API_BASE}/users`,
		{
			method: "POST",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify(userData),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to create user");
	}
	return response.json();
}

export async function updateUser(
	userId,
	userData
) {
	const response = await fetch(
		`${API_BASE}/users/${userId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify(userData),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to update user");
	}
	return response.json();
}

export async function deleteUser(userId) {
	const response = await fetch(
		`${API_BASE}/users/${userId}`,
		{
			method: "DELETE",
		}
	);
	if (!response.ok) {
		throw new Error("Failed to delete user");
	}
	return response.json();
}

export async function createBuilding(
	buildingData
) {
	const response = await fetch(
		`${API_BASE}/buildings`,
		{
			method: "POST",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify(buildingData),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to create building"
		);
	}
	return response.json();
}

export async function updateBuilding(
	buildingId,
	buildingData
) {
	const response = await fetch(
		`${API_BASE}/buildings/${buildingId}`,
		{
			method: "PUT",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify(buildingData),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to update building"
		);
	}
	return response.json();
}

export async function deleteBuilding(buildingId) {
	const response = await fetch(
		`${API_BASE}/buildings/${buildingId}`,
		{
			method: "DELETE",
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to delete building"
		);
	}
	return response.json();
}

export async function assignBuildingManager(
	userId,
	buildingId
) {
	const response = await fetch(
		`${API_BASE}/building-managers`,
		{
			method: "POST",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify({
				user_id: userId,
				building_id: buildingId,
			}),
		}
	);
	if (!response.ok)
		throw new Error(
			"Failed to assign building manager"
		);
	return response.json();
}

export async function removeBuildingManager(
	userId,
	buildingId
) {
	const response = await fetch(
		`${API_BASE}/building-managers`,
		{
			method: "DELETE",
			headers: {
				"Content-Type":
					"application/json",
			},
			body: JSON.stringify({
				user_id: userId,
				building_id: buildingId,
			}),
		}
	);
	if (!response.ok)
		throw new Error(
			"Failed to remove building manager"
		);
	return response.json();
}
