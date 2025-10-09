import axios from "axios";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const publicRequest = axios.create({ baseURL: BASE_URL });
export const privateRequest = axios.create({ baseURL: BASE_URL });

let isRefreshing = false;
let requestQueue = [];

privateRequest.interceptors.request.use(
  (request) => {
    if (isRefreshing && !request.url.includes("/refresh-token")) {
      // Return a promise that waits until refresh completes
      return new Promise((resolve) => {
        requestQueue.push({ request, resolve });
      });
    }
    return request;
  },
  (error) => Promise.reject(error)
);

privateRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and not already refreshing
    if (error.response && error.response.status === 401 && !isRefreshing) {
      isRefreshing = true;

      try {
        const { data } = await publicRequest.post("/auth/refresh-token", null, {
          withCredentials: true,
        });
        const newAccessToken = data.access_token;

        // Update all queued requests with new token
        privateRequest.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        requestQueue.forEach(({ request, resolve }) => {
          request.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(privateRequest(request));
        });

        requestQueue = [];
      } catch (refreshError) {
        requestQueue = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }

      // Retry the original failed request
      originalRequest.headers.Authorization =
        privateRequest.defaults.headers.Authorization;
      return privateRequest(originalRequest);
    }

    // If unauthorized and refresh already in progress
    if (error.response && error.response.status === 401 && isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push({ request: originalRequest, resolve });
      });
    }

    return Promise.reject(error);
  }
);
