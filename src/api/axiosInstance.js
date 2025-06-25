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

    const isRefreshEndpoint = originalRequest.url?.includes('/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post('/refresh'); // sends refresh cookie
        return axiosInstance(originalRequest); // retry original request
      } catch (refreshError) {
        console.warn("Refresh failed during 401:", refreshError);

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
