import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('token');
  const customerToken = localStorage.getItem('customerToken');
  const writerToken = localStorage.getItem('writerToken');
  const kitchenToken = localStorage.getItem('kitchenToken');
  
  // Kitchen token for kitchen-specific routes
  if (kitchenToken && (config.url.includes('/kitchen-auth') || config.url.includes('/kots'))) {
    config.headers.Authorization = `Bearer ${kitchenToken}`;
  }
  // Writer token for writer-specific routes
  else if (writerToken && (config.url.includes('/writer-auth') || config.url.includes('/kots') || config.url.includes('/tables') || config.url.includes('/orders'))) {
    config.headers.Authorization = `Bearer ${writerToken}`;
  } else if (customerToken && (config.url.includes('/customer') || config.url.includes('/my-orders') || !adminToken)) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  
  return config;
});

export default api;
