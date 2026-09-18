export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  balance: string;
  currency: string;
  status: 'ACTIVE' | 'BLOCKED' | 'CLOSED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  senderAccountId: string;
  senderAccountNumber?: string;
  receiverAccountId: string;
  receiverAccountNumber?: string;
  amount: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: string;
  type?: 'SENT' | 'RECEIVED' | 'INTERNAL';
}

export interface ApiSuccessResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  account?: Account;
  payment?: Payment;
}
