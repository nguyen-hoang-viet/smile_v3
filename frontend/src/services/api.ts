import axios from 'axios';
import { OrderRequest, OrderResponse } from '../types';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const API_BASE_URL =
  (process.env.REACT_APP_API_URL?.replace(/\/?$/, '/')) || 'http://localhost:8000/api/';

// Đừng set Content-Type global cho mọi method
const api = axios.create({ baseURL: API_BASE_URL });

// Nếu cần, chỉ set Content-Type cho POST/PUT khi gửi body JSON:
api.interceptors.request.use((config) => {
  if (config.method && ['post', 'put', 'patch'].includes(config.method)) {
    config.headers.set('Content-Type', 'application/json');
  }
  return config;
});

export const orderAPI = {
  // Get all orders
  getAllOrders: (): Promise<{ data: OrderResponse[] }> => api.get('orders/'),
  
  // Create order item
  createItem: (tableId: number, dishName: string, quantity: number, note?: string) =>
    api.post(`orders/table/${tableId}/item`, { dish_name: dishName, quantity, note: note ?? "" }),
  
  // Add order to database
  addOrder: (orderData: OrderRequest): Promise<{ data: OrderResponse }> => 
    api.post('orders/', orderData),

  // Update order quantity
  updateOrder: (tableId: number, dishName: string, quantity: number) => 
    api.put(`orders/table/${tableId}/dish/${encodeURIComponent(dishName)}`, { quantity }),

  // Update order note
  updateNote: (tableId: number, dishName: string, note: string) => 
    api.put(`orders/table/${tableId}/dish/${encodeURIComponent(dishName)}/note`, { note }),

  // Delete specific order by table and dish
  deleteOrder: (tableId: number, dishName: string) => 
    api.delete(`orders/table/${tableId}/dish/${encodeURIComponent(dishName)}`),

  // Delete all orders
  deleteAllOrders: () => api.delete('orders/'),

  // Get orders by table
  getOrdersByTable: (tableId: number): Promise<{ data: OrderResponse[] }> => 
    api.get(`orders/table/${tableId}`),

  // Delete all orders for a specific table
  deleteOrdersByTable: (tableId: number) => {
    return api.delete(`/orders/by-table/${tableId}`);
  },
};



export const reportAPI = {
  // Get all reports
  getAllReports: () => api.get('reports/'),
  
  // Add report
  addReport: (reportData: {
    tableNumber: number;
    date: string;
    time: string;
    code: string;
    nameDish: string;
    quantity: number;
    totalCheck: number;
    shipFee: number;
    discountCheck: number;
  }) => api.post('reports/', reportData),

  // Delete all reports
  deleteAllReports: () => api.delete('reports/'),

  // Add multiple reports in a single batch
  addReportBatch: (data: { reports: any[] }) => {
    return api.post('/reports/batch', data);
  },
};

export const redisAPI = {
  // Check Redis data
  checkRedisData: () => api.get('redis/check'),
  
  // Get data from Redis
  getRedisData: () => api.get('redis/data'),
};
