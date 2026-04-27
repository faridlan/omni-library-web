// src/types/api.ts

// Cerminan dari domain.PaginationMeta
export interface PaginationMeta {
  total_data: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

// Cerminan dari utils.PaginatedResponse[T any]
export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// Cerminan dari utils.SuccessResponse[T any]
export interface SuccessResponse<T> {
  message: string;
  data: T;
}

// Cerminan dari Model Buku (Respons dari API)
export interface Book {
  id: string;
  isbn: string;
  title: string;
  authors: string[];
  published_date: string;
  description: string;
  page_count: number;
  cover_url: string;
}

// ==========================================
// AUTH & USER TYPES
// ==========================================
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface FetchBookRequest {
  isbn: string;
}

// ==========================================
// LIBRARY & USER_BOOK TYPES
// ==========================================

export interface AddBookRequest {
  book_id: string;
}

export interface UpdateProgressRequest {
  status: string; // Contoh: "UNREAD", "READING", "COMPLETED"
  current_page: number;
  rating: number;
}

// Asumsi bentuk kembalian dari GET /api/library
export interface UserBookResponse {
  id: string; // ID unik dari tabel user_books
  user_id: string;
  book_id: string;
  status: string;
  current_page: number;
  rating: number;
  book: Book; // Relasi ke objek buku asli agar judul & cover bisa dirender
}

// ==========================================
// BOOK NOTES TYPES
// ==========================================

export interface AddNoteRequest {
  quote: string;
  page_reference: number;
  tags: string[];
}

// Asumsi bentuk kembalian data dari GET Notes
export interface BookNoteResponse {
  id: string;
  user_id: string;
  book_id: string;
  quote: string;
  page_reference: number;
  tags: string[];
  created_at: string;
}
