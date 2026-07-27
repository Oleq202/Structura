const API_BASE = "http://localhost:8000";

function getAuthHeaders() {
	const token = localStorage.getItem(
		"accessToken"
	);
	if (token) {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		};
	}
	return {
		"Content-Type": "application/json",
	};
}

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

export async function getUsers() {
	const response = await fetch(
		`${API_BASE}/users`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}
	return response.json();
}

export async function getUserBuildings(userId) {
	const response = await fetch(
		`${API_BASE}/users/${userId}/buildings`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to fetch user buildings"
		);
	}
	return response.json();
}

export async function createUser(userData) {
	const response = await fetch(
		`${API_BASE}/users`,
		{
			method: "POST",
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to delete user");
	}
	return response.json();
}

export async function getBuildings() {
	const response = await fetch(
		`${API_BASE}/buildings`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to fetch buildings"
		);
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
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
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
			headers: getAuthHeaders(),
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

export async function getTasks() {
	const response = await fetch(
		`${API_BASE}/tasks`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to fetch tasks");
	}
	return response.json();
}

export async function createTask(taskData) {
	const response = await fetch(
		`${API_BASE}/tasks`,
		{
			method: "POST",
			headers: getAuthHeaders(),
			body: JSON.stringify(taskData),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to create task");
	}
	return response.json();
}

export async function updateTask(
	taskId,
	taskData
) {
	const response = await fetch(
		`${API_BASE}/tasks/${taskId}`,
		{
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify(taskData),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to update task");
	}
	return response.json();
}

export async function deleteTask(taskId, userId) {
	const response = await fetch(
		`${API_BASE}/tasks/${taskId}?user_id=${userId}`,
		{
			method: "DELETE",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error("Failed to delete task");
	}
	return response.json();
}

export async function updateTaskStatus(
	taskId,
	status
) {
	const response = await fetch(
		`${API_BASE}/tasks/${taskId}/status`,
		{
			method: "PUT",
			headers: getAuthHeaders(),
			body: JSON.stringify({ status }),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to update task status"
		);
	}
	return response.json();
}

export async function getContractors() {
	const response = await fetch(
		`${API_BASE}/users?role=contractor`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to fetch contractors"
		);
	}
	return response.json();
}

export async function getActivityLogs(
	filters = {}
) {
	const {
		userId,
		startDate,
		endDate,
		limit = 50,
	} = filters;
	const params = new URLSearchParams();
	if (userId) params.append("user_id", userId);
	if (startDate)
		params.append("start_date", startDate);
	if (endDate)
		params.append("end_date", endDate);
	if (limit) params.append("limit", limit);

	const response = await fetch(
		`${API_BASE}/activity-logs?${params.toString()}`,
		{
			method: "GET",
			headers: getAuthHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error(
			"Failed to fetch activity logs"
		);
	}
	return response.json();
}
