const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let refreshPromise = null;

function getAuthHeaders() {
	const token = localStorage.getItem("accessToken");
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

async function doRefreshToken() {
	if (refreshPromise) return refreshPromise;
	const token = localStorage.getItem("refreshToken");
	if (!token) return null;

	refreshPromise = (async () => {
		try {
			const res = await fetch(`${API_BASE}/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: token }),
			});
			if (!res.ok) {
				throw new Error("Refresh failed");
			}
			const data = await res.json();
			if (data.access_token) {
				localStorage.setItem("accessToken", data.access_token);
			}
			if (data.refresh_token) {
				localStorage.setItem("refreshToken", data.refresh_token);
			}
			const storedUser = localStorage.getItem("currentUser:v1");
			if (storedUser) {
				try {
					const userObj = JSON.parse(storedUser);
					userObj.access_token = data.access_token;
					if (data.refresh_token) userObj.refresh_token = data.refresh_token;
					localStorage.setItem("currentUser:v1", JSON.stringify(userObj));
				} catch (e) {
					console.error("Failed to parse stored user during token refresh:", e);
				}
			}
			return data.access_token;
		} catch (err) {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			window.dispatchEvent(new CustomEvent("auth:unauthorized"));
			return null;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

async function authFetch(url, options = {}) {
	const headers = {
		...getAuthHeaders(),
		...(options.headers || {}),
	};

	let response = await fetch(url, { ...options, headers });

	if (response.status === 401 && !url.endsWith("/login") && !url.endsWith("/refresh")) {
		const newToken = await doRefreshToken();
		if (newToken) {
			const retryHeaders = {
				...headers,
				Authorization: `Bearer ${newToken}`,
			};
			response = await fetch(url, { ...options, headers: retryHeaders });
		} else {
			window.dispatchEvent(new CustomEvent("auth:unauthorized"));
		}
	}

	return response;
}

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

export async function getUsers() {
	const response = await authFetch(`${API_BASE}/users`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}
	return response.json();
}

export async function getUserBuildings(userId) {
	const response = await authFetch(`${API_BASE}/users/${userId}/buildings`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch user buildings");
	}
	return response.json();
}

export async function createUser(userData) {
	const response = await authFetch(`${API_BASE}/users`, {
		method: "POST",
		body: JSON.stringify(userData),
	});
	if (!response.ok) {
		throw new Error("Failed to create user");
	}
	return response.json();
}

export async function updateUser(userId, userData) {
	const response = await authFetch(`${API_BASE}/users/${userId}`, {
		method: "PUT",
		body: JSON.stringify(userData),
	});
	if (!response.ok) {
		throw new Error("Failed to update user");
	}
	return response.json();
}

export async function deleteUser(userId) {
	const response = await authFetch(`${API_BASE}/users/${userId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error("Failed to delete user");
	}
	return response.json();
}

export async function getBuildings() {
	const response = await authFetch(`${API_BASE}/buildings`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch buildings");
	}
	return response.json();
}

export async function createBuilding(buildingData) {
	const response = await authFetch(`${API_BASE}/buildings`, {
		method: "POST",
		body: JSON.stringify(buildingData),
	});
	if (!response.ok) {
		throw new Error("Failed to create building");
	}
	return response.json();
}

export async function updateBuilding(buildingId, buildingData) {
	const response = await authFetch(`${API_BASE}/buildings/${buildingId}`, {
		method: "PUT",
		body: JSON.stringify(buildingData),
	});
	if (!response.ok) {
		throw new Error("Failed to update building");
	}
	return response.json();
}

export async function deleteBuilding(buildingId) {
	const response = await authFetch(`${API_BASE}/buildings/${buildingId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error("Failed to delete building");
	}
	return response.json();
}

export async function assignBuildingManager(userId, buildingId) {
	const response = await authFetch(`${API_BASE}/building-managers`, {
		method: "POST",
		body: JSON.stringify({
			user_id: userId,
			building_id: buildingId,
		}),
	});
	if (!response.ok) {
		throw new Error("Failed to assign building manager");
	}
	return response.json();
}

export async function removeBuildingManager(userId, buildingId) {
	const response = await authFetch(`${API_BASE}/building-managers`, {
		method: "DELETE",
		body: JSON.stringify({
			user_id: userId,
			building_id: buildingId,
		}),
	});
	if (!response.ok) {
		throw new Error("Failed to remove building manager");
	}
	return response.json();
}

export async function getTasks() {
	const response = await authFetch(`${API_BASE}/tasks`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch tasks");
	}
	return response.json();
}

export async function createTask(taskData) {
	const response = await authFetch(`${API_BASE}/tasks`, {
		method: "POST",
		body: JSON.stringify(taskData),
	});
	if (!response.ok) {
		throw new Error("Failed to create task");
	}
	return response.json();
}

export async function updateTask(taskId, taskData) {
	const response = await authFetch(`${API_BASE}/tasks/${taskId}`, {
		method: "PUT",
		body: JSON.stringify(taskData),
	});
	if (!response.ok) {
		throw new Error("Failed to update task");
	}
	return response.json();
}

export async function deleteTask(taskId, userId) {
	const response = await authFetch(`${API_BASE}/tasks/${taskId}?user_id=${userId}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error("Failed to delete task");
	}
	return response.json();
}

export async function updateTaskStatus(taskId, status) {
	const response = await authFetch(`${API_BASE}/tasks/${taskId}/status`, {
		method: "PUT",
		body: JSON.stringify({ status }),
	});
	if (!response.ok) {
		throw new Error("Failed to update task status");
	}
	return response.json();
}

export async function getContractors() {
	const response = await authFetch(`${API_BASE}/users?role=contractor`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch contractors");
	}
	return response.json();
}

export async function getActivityLogs(filters = {}) {
	const { userId, entityType, operationType, search, startDate, endDate, limit = 50 } = filters;
	const params = new URLSearchParams();
	if (userId) params.append("user_id", userId);
	if (entityType) params.append("entity_type", entityType);
	if (operationType) params.append("operation_type", operationType);
	if (search) params.append("search", search);
	if (startDate) params.append("start_date", startDate);
	if (endDate) params.append("end_date", endDate);
	if (limit) params.append("limit", limit);

	const response = await authFetch(`${API_BASE}/activity-logs?${params.toString()}`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch activity logs");
	}
	return response.json();
}

export async function getUserPreferences() {
	const response = await authFetch(`${API_BASE}/users/me/preferences`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch user preferences");
	}
	return response.json();
}

export async function updateUserPreferences(preferences) {
	const response = await authFetch(`${API_BASE}/users/me/preferences`, {
		method: "PUT",
		body: JSON.stringify(preferences),
	});
	if (!response.ok) {
		throw new Error("Failed to update user preferences");
	}
	return response.json();
}

export async function getMe() {
	const response = await authFetch(`${API_BASE}/users/me`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch current user");
	}
	return response.json();
}

export async function refreshToken(token) {
	const response = await fetch(`${API_BASE}/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh_token: token }),
	});
	if (!response.ok) {
		throw new Error("Failed to refresh token");
	}
	return response.json();
}
