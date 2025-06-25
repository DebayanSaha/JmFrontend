import axios from 'axios';

let navigateRef = null;

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,  // ⬅️ necessary to send cookies
});

// 🔁 Let AppRouter or auth handler set this
export const setNavigate = (navigate) => {
  navigateRef = navigate;
};

// ✅ REMOVE Request Interceptor (not needed with cookie-based auth)
// Cookies are automatically included by browser, no headers needed

// ✅ Response Interceptor: refresh if 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry once on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (sends refresh token via cookie)
        await axiosInstance.post('/refresh');

        // Retry original request after refresh success
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh failed during 401:", refreshError);

        // Clear storage and redirect to login
        localStorage.clear();
        sessionStorage.clear();

        if (navigateRef) {
          navigateRef('/login');
        } else {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
