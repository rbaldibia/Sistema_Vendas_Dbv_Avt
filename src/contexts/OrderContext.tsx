import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderContextType, OrderStatus, PaymentType } from '../types';

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('currentOrders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        originallyPaid: order.originallyPaid ?? order.isPaid
      }));
    } catch {
      return [];
    }
  });

  const [archivedOrders, setArchivedOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('archivedOrders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        originallyPaid: order.originallyPaid ?? order.isPaid
      }));
    } catch {
      return [];
    }
  });

  const getNextOrderNumber = () => {
    const allOrders = [...orders, ...archivedOrders];
    if (allOrders.length === 0) return 1;
    const maxOrderNumber = Math.max(...allOrders.map(order => order.orderNumber));
    return maxOrderNumber + 1;
  };

  const addOrder = (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): string => {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      orderNumber: getNextOrderNumber(),
      createdAt: new Date(),
      originallyPaid: order.originallyPaid ?? order.isPaid
    };

    const newOrders = [...orders, newOrder];
    setOrders(newOrders);
    localStorage.setItem('currentOrders', JSON.stringify(newOrders));
    return newOrder.id;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const newOrders = orders.map(order =>
      order.id === id ? { ...order, status } : order
    );
    setOrders(newOrders);
    localStorage.setItem('currentOrders', JSON.stringify(newOrders));
  };

  const updateArchivedOrderPayment = (id: string, isPaid: boolean, paymentType?: PaymentType) => {
    const updated = archivedOrders.map(order =>
      order.id === id
        ? {
            ...order,
            isPaid,
            paymentType: paymentType ?? order.paymentType,
            originallyPaid: order.originallyPaid ?? order.isPaid
          }
        : order
    );
    setArchivedOrders(updated);
    localStorage.setItem('archivedOrders', JSON.stringify(updated));
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return orders.filter(
      order => order.createdAt >= startDate && order.createdAt <= endDate
    );
  };

  const archiveOrders = (ordersToArchive: Order[]) => {
    const preparedToArchive = ordersToArchive.map(o => ({
      ...o,
      originallyPaid: o.originallyPaid ?? o.isPaid
    }));
    const updated = [...archivedOrders, ...preparedToArchive];
    setArchivedOrders(updated);
    localStorage.setItem('archivedOrders', JSON.stringify(updated));
  };

  const clearOrders = () => {
    setOrders([]);
    localStorage.setItem('currentOrders', JSON.stringify([]));
  };

  const getArchivedOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return archivedOrders.filter(
      order => order.createdAt >= startDate && order.createdAt <= endDate
    );
  };

  const value = {
    orders,
    archivedOrders,
    addOrder,
    updateOrderStatus,
    updateArchivedOrderPayment,
    getOrderById,
    getOrdersByStatus,
    getOrdersByDateRange,
    getNextOrderNumber,
    archiveOrders,
    clearOrders,
    getArchivedOrdersByDateRange
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};