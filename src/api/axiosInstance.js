import axios from 'axios';

let navigateRef = null;

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,  // very important for refresh cookie
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
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.access_token;

        if (newToken) {
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest); // retry original request
        }
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
