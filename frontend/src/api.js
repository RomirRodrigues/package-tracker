const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  sendOtp: (phone) =>
    request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone, code) =>
    request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  // Packages
  getPackages: (token) =>
    request('/api/packages', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  createPackage: (data, token) =>
    request('/api/packages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  getPackageById: (id, token) =>
    request(`/api/packages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
