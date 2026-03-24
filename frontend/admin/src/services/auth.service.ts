type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AdminLoginData = {
  user: AdminUser;
  accessToken: string;
};

type ApiEnvelope<T> = {
  message: string;
  data: T | null;
  error: {
    code: number;
    detail: string;
    solution: string;
  } | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const loginAdmin = async (email: string, password: string): Promise<AdminLoginData> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  let payload: ApiEnvelope<AdminLoginData> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<AdminLoginData>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.message || 'Admin login failed');
  }

  return payload.data;
};

export const logoutAdmin = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export const validateAdminSession = async (): Promise<{ userId: string; role: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/admin/validate-session`, {
    method: 'POST',
    credentials: 'include',
  });

  let payload: ApiEnvelope<{ userId: string; role: string }> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<{ userId: string; role: string }>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.message || 'Session validation failed');
  }

  return payload.data;
};
