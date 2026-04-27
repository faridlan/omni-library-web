// src/api/config.ts

// Mengambil URL dari .env, atau gunakan localhost sebagai fallback pengaman
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
