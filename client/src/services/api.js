// Normalize API_BASE:
// On Vercel (and local dev with Vite proxy), the Express API is co-located under '/api'.
// Guard against non-existent domains (e.g. kho-kho.onrender.com) or broken URL formats.
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const isInvalidOrRender =
  !rawApiUrl ||
  rawApiUrl.includes('onrender.com') ||
  rawApiUrl.startsWith('https//') ||
  rawApiUrl.startsWith('http//');

export const API_BASE =
  typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || isInvalidOrRender)
    ? '/api'
    : (rawApiUrl || '/api');

/**
 * Universal fetch wrapper ensuring cookies are sent (credentials: 'include')
 * and standardized error handling.
 */
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Also include token in Authorization header if present in memory/localStorage as fallback
  const token = localStorage.getItem('kho_kho_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Crucial for HttpOnly cookies
  };

  try {
    const res = await fetch(url, config);

    // Handle CSV or Blob responses
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      return await res.blob();
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    getMe: () => apiRequest('/auth/me'),
    changePassword: (data) => apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
    directChangePassword: (data) => apiRequest('/auth/direct-change-password', { method: 'POST', body: JSON.stringify(data) }),
    getAllUsers: () => apiRequest('/auth/users'),
    impersonate: (targetUserId) => apiRequest('/auth/impersonate', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
    toggleUserStatus: (id) => apiRequest(`/auth/users/${id}/status`, { method: 'PATCH' }),
    resetUserPassword: (id, newPassword) => apiRequest(`/auth/users/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
  },

  // Players
  players: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/players${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => apiRequest(`/players/${id}`),
    create: (playerData) => apiRequest('/players', { method: 'POST', body: JSON.stringify(playerData) }),
    update: (id, playerData) => apiRequest(`/players/${id}`, { method: 'PUT', body: JSON.stringify(playerData) }),
    toggleStatus: (id) => apiRequest(`/players/${id}/status`, { method: 'PATCH' }),
    delete: (id) => apiRequest(`/players/${id}`, { method: 'DELETE' }),
    importCSV: (csvData) => apiRequest('/players/import-csv', { method: 'POST', body: JSON.stringify({ csvData }) }),
    exportCSVUrl: (team) => `${API_BASE}/players/export-csv?team=${team}`,
  },

  // Attendance
  attendance: {
    getSessions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/attendance/sessions${qs ? `?${qs}` : ''}`);
    },
    getSession: (id) => apiRequest(`/attendance/sessions/${id}`),
    createSession: (data) => apiRequest('/attendance/sessions', { method: 'POST', body: JSON.stringify(data) }),
    saveBatch: (data) => apiRequest('/attendance/batch', { method: 'POST', body: JSON.stringify(data) }),
    finalizeSession: (id) => apiRequest(`/attendance/sessions/${id}/finalize`, { method: 'PUT' }),
    getPlayerAttendance: (playerId) => apiRequest(`/attendance/player/${playerId}`),
  },

  // Reports
  reports: {
    getOverview: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/reports/overview${qs ? `?${qs}` : ''}`);
    },
    getDaily: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/reports/daily${qs ? `?${qs}` : ''}`);
    },
    getWeekly: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/reports/weekly${qs ? `?${qs}` : ''}`);
    },
    getMonthly: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/reports/monthly${qs ? `?${qs}` : ''}`);
    },
    getCustom: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/reports/custom${qs ? `?${qs}` : ''}`);
    },
  },

  // Matches & Squad Recommendations
  matches: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/matches${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => apiRequest(`/matches/${id}`),
    create: (data) => apiRequest('/matches', { method: 'POST', body: JSON.stringify(data) }),
    getRecommendations: (id, days = 30) => apiRequest(`/matches/${id}/recommendations?days=${days}`),
    saveSquad: (id, data) => apiRequest(`/matches/${id}/squad`, { method: 'POST', body: JSON.stringify(data) }),
    finalizeSquad: (id, publish = true) =>
      apiRequest(`/matches/${id}/squad/finalize`, { method: 'PUT', body: JSON.stringify({ publish }) }),
  },

  // Announcements
  announcements: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/announcements${qs ? `?${qs}` : ''}`);
    },
    create: (data) => apiRequest('/announcements', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/announcements/${id}`, { method: 'DELETE' }),
  },

  // Daily Ground Activities
  groundActivities: {
    getAdmin: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiRequest(`/ground-activities/admin${qs ? `?${qs}` : ''}`);
    },
    getPlayer: () => apiRequest('/ground-activities/player'),
    create: (data) => apiRequest('/ground-activities', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/ground-activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/ground-activities/${id}`, { method: 'DELETE' }),
  },

  // Content & Utilities
  content: {
    getAchievements: (category) => apiRequest(`/achievements${category ? `?category=${category}` : ''}`),
    getGallery: (category, team) => {
      const qs = new URLSearchParams({ ...(category && { category }), ...(team && { team }) }).toString();
      return apiRequest(`/gallery${qs ? `?${qs}` : ''}`);
    },
    sendContact: (data) => apiRequest('/contact', { method: 'POST', body: JSON.stringify(data) }),
    getAuditLogs: (limit = 50) => apiRequest(`/audit-logs?limit=${limit}`),
    seedDemo: () => apiRequest('/demo/seed', { method: 'POST' }),
  },
};

export default api;
