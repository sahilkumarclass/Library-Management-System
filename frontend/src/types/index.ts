export type Role = "ADMIN" | "MEMBER";

export type AuthResponse = {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: Role;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  available: boolean;
  createdAt: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type TransactionStatus = "ISSUED" | "RETURNED";

export type Transaction = {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  fine: number;
  status: TransactionStatus;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
