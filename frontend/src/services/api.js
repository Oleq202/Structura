const API_BASE =
	import.meta.env.VITE_API_BASE_URL ||
	(typeof window !== "undefined" && window.location.hostname
		? `http://${window.location.hostname}:8000`
		: "http://localhost:8000");

let inMemoryAccessToken = null;
let refreshPromise = null;

export function getAccessToken() {
	return inMemoryAccessToken;
}

export function setAccessToken(token) {
	inMemoryAccessToken = token;
}

function getAuthHeaders() {
	const headers = {
		"Content-Type": "application/json",
	};
	if (inMemoryAccessToken) {
		headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
	}
	return headers;
}

export async function doRefreshToken() {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		try {
			const res = await fetch(`${API_BASE}/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({}),
			});
			if (!res.ok) {
				throw new Error("Refresh failed");
			}
			const data = await res.json();
			if (data.access_token) {
				inMemoryAccessToken = data.access_token;
			}
			return data.access_token;
		} catch (err) {
			inMemoryAccessToken = null;
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

	const fetchOptions = {
		...options,
		headers,
		credentials: "include",
	};

	let response = await fetch(url, fetchOptions);

	if ((response.status === 401 || (response.status === 403 && !inMemoryAccessToken)) && !url.endsWith("/login") && !url.endsWith("/refresh")) {
		const newToken = await doRefreshToken();
		if (newToken) {
			const retryHeaders = {
				...headers,
				Authorization: `Bearer ${newToken}`,
			};
			response = await fetch(url, { ...fetchOptions, headers: retryHeaders });
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
		credentials: "include",
		body: JSON.stringify({
			login,
			password,
		}),
	});
	if (!response.ok) {
		throw new Error("Login failed");
	}
	const data = await response.json();
	if (data.access_token) {
		inMemoryAccessToken = data.access_token;
	}
	return data;
}

export async function logout() {
	try {
		await authFetch(`${API_BASE}/logout`, {
			method: "POST",
		});
	} catch (e) {
		console.warn("Logout request failed:", e);
	} finally {
		inMemoryAccessToken = null;
	}
}

export async function initSession() {
	try {
		const token = await doRefreshToken();
		if (!token) return null;
		const user = await getMe();
		return user;
	} catch (e) {
		inMemoryAccessToken = null;
		return null;
	}
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


export async function getTasks(params = {}) {
	const searchParams = new URLSearchParams();
	if (params.building_id !== undefined && params.building_id !== null) {
		searchParams.append("building_id", params.building_id);
	}
	if (params.status) {
		searchParams.append("status", params.status);
	}
	if (params.search) {
		searchParams.append("search", params.search);
	}
	if (params.completed_days !== undefined && params.completed_days !== null) {
		searchParams.append("completed_days", params.completed_days);
	}
	if (params.limit !== undefined && params.limit !== null) {
		searchParams.append("limit", params.limit);
	}
	if (params.offset !== undefined && params.offset !== null) {
		searchParams.append("offset", params.offset);
	}
	const queryString = searchParams.toString();
	const url = queryString ? `${API_BASE}/tasks?${queryString}` : `${API_BASE}/tasks`;
	const response = await authFetch(url, {
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

export async function deleteTask(taskId) {
	const response = await authFetch(`${API_BASE}/tasks/${taskId}`, {
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

export async function changePassword(currentPassword, newPassword) {
	const response = await authFetch(`${API_BASE}/users/me/password`, {
		method: "PUT",
		body: JSON.stringify({
			current_password: currentPassword,
			new_password: newPassword,
		}),
	});
	if (!response.ok) {
		const errData = await response.json().catch(() => null);
		throw new Error(errData?.detail || "Failed to change password");
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
