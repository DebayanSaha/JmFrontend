import axios from 'axios';
 
// 👇 util to read cookies
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
 
let navigateRef = null;
 
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,  // ⬅️ Send cookies with requests
});
 
// 🔁 Set this from your App.jsx or AuthWrapper
export const setNavigate = (navigate) => {
  navigateRef = navigate;
};
 
// ✅ Request interceptor to attach CSRF token for unsafe methods
axiosInstance.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf_access_token');
  const method = config.method?.toLowerCase();
 
  if (['post', 'put', 'delete', 'patch'].includes(method)) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
 
  return config;
}, (error) => Promise.reject(error));
 
// ✅ Response interceptor to auto-refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
 
    const isRefreshEndpoint = originalRequest.url?.includes('/refresh');
 
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      originalRequest._retry = true;
 
      try {
        await axiosInstance.post('/refresh'); // uses refresh cookie
        return axiosInstance(originalRequest); // retry original
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