import axios from "axios";
import { API_URL } from "./config";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ==========================================
// BENDERA / FLAG (Gembok Satpam)
// ==========================================
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          throw new Error("Tidak ada refresh token");
        }

        const refreshResponse = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {
            refresh_token: refreshToken,
          },
        );

        const newAccessToken = refreshResponse.data.data.access_token;
        const newRefreshToken = refreshResponse.data.data.refresh_token;

        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // ==========================================
        // KUNCI GEMBOK DI SINI AGAR TOAST TIDAK DOUBLE
        // ==========================================
        if (!isRedirecting) {
          isRedirecting = true;

          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          toast.error("Sesi Anda telah habis. Silakan login kembali.");

          setTimeout(() => {
            window.location.href = "/auth";
          }, 1000);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
