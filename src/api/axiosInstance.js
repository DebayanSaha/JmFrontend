import axios from 'axios';

let navigateRef = null;

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export const setNavigate = (navigate) => {
  navigateRef = navigate;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const skipAuth = config?.skipAuth === true;

    if (skipAuth) {
      delete config.headers?.Authorization;
    } else if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Handles 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      if (navigateRef) {
        navigateRef('/login');
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
