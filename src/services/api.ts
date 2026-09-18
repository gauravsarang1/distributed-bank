import { Account, Payment, User } from '../types/index.ts';

const TOKEN_KEY = 'bank_jwt_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<{ success: boolean; data: { user: User; account: Account; token: string } }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        }
      ),

    login: (email: string, password: string) =>
      request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  users: {
    me: () => request<User>('/api/users/me'),
  },

  accounts: {
    getAll: () => request<Account[]>('/api/accounts'),
    getById: (id: string) => request<Account>(`/api/accounts/${id}`),
    deposit: (id: string, amount: string | number) =>
      request<{ success: boolean; message: string; account: Account }>(
        `/api/accounts/${id}/deposit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount: amount.toString() }),
        }
      ),
    withdraw: (id: string, amount: string | number) =>
      request<{ success: boolean; message: string; account: Account }>(
        `/api/accounts/${id}/withdraw`,
        {
          method: 'POST',
          body: JSON.stringify({ amount: amount.toString() }),
        }
      ),
  },

  payments: {
    transfer: (senderAccountId: string, receiverIdentifier: string, amount: string | number) =>
      request<{ success: boolean; message: string; payment: Payment }>(
        '/api/payments/transfer',
        {
          method: 'POST',
          body: JSON.stringify({
            senderAccountId,
            receiverIdentifier,
            amount: amount.toString(),
          }),
        }
      ),
    getAll: () => request<Payment[]>('/api/payments'),
    getById: (id: string) => request<Payment>(`/api/payments/${id}`),
  },
};
