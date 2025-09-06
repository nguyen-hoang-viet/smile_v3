export interface Dish {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
  note?: string; // Thêm field note tùy chọn
}

export interface Table {
  id: number;
  name: string;
  orders: OrderItem[];
  isOrdered: boolean;
}

// Backend order response type
export interface OrderResponse {
  id: number;
  table_id: number;
  date: string;
  time: string;
  dish_name: string;
  quantity: number;
  note?: string; // Thêm note
  created_at: string;
}

// Backend order request type
export interface OrderRequest {
  table_id: number;
  dish_name: string;
  quantity: number;
  date: string;
  time: string;
  note?: string; // Thêm note
}

export interface Report {
  table_id: number;
  date: string;
  hour: string;
  product_code: string;
  product_name: string;
  quantity: number;
  total: number;
  ship_fee: number;
  discount: number;
}

export interface BillData {
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  shipFee: number;
  discount: number;
  total: number;
  date: string;
  time: string;
  note?: string;
}
