// Simple API client for Tournament module
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3300/api';

async function http(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data.data !== undefined ? data.data : data;
}

export const tournamentsApi = {
  list: (q = {}) => http('GET', `/tournaments` + buildQuery(q)),
  get: (id) => http('GET', `/tournaments/${id}`),
  create: (payload) => http('POST', `/tournaments`, payload),
  update: (id, payload) => http('PUT', `/tournaments/${id}`, payload),
  remove: (id) => http('DELETE', `/tournaments/${id}`),
};

export const resultsApi = {
  list: (tournamentId) => http('GET', `/tournaments/${tournamentId}/results`),
  create: (tournamentId, payload) => http('POST', `/tournaments/${tournamentId}/results`, payload),
  update: (id, payload) => http('PUT', `/tournaments/results/${id}`, payload),
  remove: (id) => http('DELETE', `/tournaments/results/${id}`),
};

export const playersApi = {
  list: (tournamentId, q = {}) => http('GET', `/tournaments/${tournamentId}/players` + buildQuery(q)),
  get: (id) => http('GET', `/tournaments/players/${id}`),
  create: (tournamentId, payload) => http('POST', `/tournaments/${tournamentId}/players`, payload),
  update: (id, payload) => http('PUT', `/tournaments/players/${id}`, payload),
  remove: (id) => http('DELETE', `/tournaments/players/${id}`),
};

function buildQuery(obj) {
  const entries = Object.entries(obj || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  const params = new URLSearchParams(entries);
  return `?${params.toString()}`;
}
