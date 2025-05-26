import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import store from '../store'; 
import { attemptRefreshAuthToken, logoutUser } from '../store/actions/authActions';
import { RootState } from '../store';

const REST_API_BASE_URL = import.meta.env.VITE_REST_API_BASE_URL;

const apiClient = axios.create({
  baseURL: REST_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = (store.getState() as RootState).auth;
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
   
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await store.dispatch(attemptRefreshAuthToken() as any); 

        if (newAccessToken && typeof newAccessToken === 'string') {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          processQueue(error, null);
          store.dispatch(logoutUser() as any);
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        processQueue(refreshError as AxiosError, null);
        store.dispatch(logoutUser() as any);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 401 && originalRequest._retry) {
       
        store.dispatch(logoutUser() as any);
        return Promise.reject(error);
    }


    return Promise.reject(error);
  }
);

export default apiClient;
