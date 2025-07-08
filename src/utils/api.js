import axios from "axios";

// Menghubungkan komponen FE ke API BE

const BASE_URL = "http://localhost:5000";

// Konfigurasi Axios Instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true,
});

// Request interceptor -> menambahkan header auth ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error response
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
