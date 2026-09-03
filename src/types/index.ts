// Item related types
export interface Item {
  id: string;
  code: string;
  description: string;
  unit: string;
  price: number;
  available?: boolean;
}

// Order related types
export interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
  description: string;
  unit: string;
}

export type OrderStatus = 'Pendente' | 'Em preparo' | 'Pronto' | 'Entregue';
export type PaymentType = 'Dinheiro' | 'Pix' | 'Débito' | 'Crédito';

export interface Order {
  id: string;
  orderNumber: number;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  isPaid: boolean;
  paymentType?: PaymentType;
  originallyPaid?: boolean;
}

// Context types
export interface ItemContextType {
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => string;
  updateItem: (id: string, item: Omit<Item, 'id'>) => void;
  deleteItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  setItemAvailability: (id: string, available: boolean) => void;
  getItemById: (id: string) => Item | undefined;
  getItemByCode: (code: string) => Item | undefined;
}

export interface OrderContextType {
  orders: Order[];
  archivedOrders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateArchivedOrderPayment: (id: string, isPaid: boolean, paymentType?: PaymentType) => void;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
  getNextOrderNumber: () => number;
  archiveOrders: (orders: Order[]) => void;
  clearOrders: () => void;
  getArchivedOrdersByDateRange: (startDate: Date, endDate: Date) => Order[];
}