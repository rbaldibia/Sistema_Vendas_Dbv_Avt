import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderContextType, OrderStatus, PaymentType } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

const parseOrderDate = (orderData: any): Date => {
  if (!orderData.createdAt) return new Date();
  if (typeof orderData.createdAt === 'object' && 'seconds' in orderData.createdAt) {
    return new Date(orderData.createdAt.seconds * 1000);
  }
  return new Date(orderData.createdAt);
};

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('currentOrders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((order: any) => ({
        ...order,
        createdAt: parseOrderDate(order),
        originallyPaid: order.originallyPaid ?? order.isPaid,
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
        createdAt: parseOrderDate(order),
        originallyPaid: order.originallyPaid ?? order.isPaid,
      }));
    } catch {
      return [];
    }
  });

  // Real-time Firestore sync for active orders
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const fetchedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedOrders.push({
            ...(data as Order),
            id: docSnap.id,
            createdAt: parseOrderDate(data),
            originallyPaid: data.originallyPaid ?? data.isPaid,
          });
        });
        // Sort orders by orderNumber ascending
        fetchedOrders.sort((a, b) => a.orderNumber - b.orderNumber);
        setOrders(fetchedOrders);
        localStorage.setItem('currentOrders', JSON.stringify(fetchedOrders));
      },
      (error) => {
        console.warn('Firestore active orders sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for archived orders
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const archivedRef = collection(db, 'archived_orders');
    const unsubscribe = onSnapshot(
      archivedRef,
      (snapshot) => {
        const fetchedArchived: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedArchived.push({
            ...(data as Order),
            id: docSnap.id,
            createdAt: parseOrderDate(data),
            originallyPaid: data.originallyPaid ?? data.isPaid,
          });
        });
        fetchedArchived.sort((a, b) => a.orderNumber - b.orderNumber);
        setArchivedOrders(fetchedArchived);
        localStorage.setItem('archivedOrders', JSON.stringify(fetchedArchived));
      },
      (error) => {
        console.warn('Firestore archived orders sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const getNextOrderNumber = () => {
    const allOrders = [...orders, ...archivedOrders];
    if (allOrders.length === 0) return 1;
    const maxOrderNumber = Math.max(...allOrders.map((order) => order.orderNumber));
    return maxOrderNumber + 1;
  };

  const serializeOrderForFirestore = (order: Order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  });

  const addOrder = (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): string => {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      orderNumber: getNextOrderNumber(),
      createdAt: new Date(),
      originallyPaid: order.originallyPaid ?? order.isPaid,
    };

    const newOrders = [...orders, newOrder];
    setOrders(newOrders);
    localStorage.setItem('currentOrders', JSON.stringify(newOrders));

    if (isFirebaseConfigured) {
      setDoc(doc(db, 'orders', newOrder.id), serializeOrderForFirestore(newOrder)).catch((err) =>
        console.error('Failed to sync new order to Firestore:', err)
      );
    }

    return newOrder.id;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    let updatedOrder: Order | undefined;

    const newOrders = orders.map((order) => {
      if (order.id !== id) return order;

      if (status === 'Entregue') {
        const fullyDeliveredItems = order.items.map((item) => ({
          ...item,
          deliveredQuantity: item.quantity,
        }));
        updatedOrder = { ...order, status, items: fullyDeliveredItems };
      } else {
        updatedOrder = { ...order, status };
      }
      return updatedOrder;
    });

    setOrders(newOrders);
    localStorage.setItem('currentOrders', JSON.stringify(newOrders));

    if (isFirebaseConfigured && updatedOrder) {
      setDoc(doc(db, 'orders', id), serializeOrderForFirestore(updatedOrder)).catch((err) =>
        console.error('Failed to sync order status to Firestore:', err)
      );
    }
  };

  const deliverOrderItem = (orderId: string, itemIndex: number, quantityToDeliver?: number) => {
    let updatedOrder: Order | undefined;

    const newOrders = orders.map((order) => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const currentDelivered = item.deliveredQuantity || 0;
        const remaining = item.quantity - currentDelivered;
        const toAdd = quantityToDeliver !== undefined ? Math.min(quantityToDeliver, remaining) : remaining;
        return {
          ...item,
          deliveredQuantity: currentDelivered + toAdd,
        };
      });

      const isFullyDelivered = updatedItems.every(
        (item) => (item.deliveredQuantity || 0) >= item.quantity
      );
      const newStatus: OrderStatus = isFullyDelivered ? 'Entregue' : order.status;

      updatedOrder = {
        ...order,
        items: updatedItems,
        status: newStatus,
      };

      return updatedOrder;
    });

    setOrders(newOrders);
    localStorage.setItem('currentOrders', JSON.stringify(newOrders));

    if (isFirebaseConfigured && updatedOrder) {
      setDoc(doc(db, 'orders', orderId), serializeOrderForFirestore(updatedOrder)).catch((err) =>
        console.error('Failed to sync order item delivery to Firestore:', err)
      );
    }
  };

  const updateArchivedOrderPayment = (id: string, isPaid: boolean, paymentType?: PaymentType) => {
    let updatedOrder: Order | undefined;

    const updated = archivedOrders.map((order) => {
      if (order.id === id) {
        updatedOrder = {
          ...order,
          isPaid,
          paymentType: paymentType ?? order.paymentType,
          originallyPaid: order.originallyPaid ?? order.isPaid,
        };
        return updatedOrder;
      }
      return order;
    });

    setArchivedOrders(updated);
    localStorage.setItem('archivedOrders', JSON.stringify(updated));

    if (isFirebaseConfigured && updatedOrder) {
      setDoc(doc(db, 'archived_orders', id), serializeOrderForFirestore(updatedOrder)).catch(
        (err) => console.error('Failed to sync archived order payment to Firestore:', err)
      );
    }
  };

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return orders.filter(
      (order) => order.createdAt >= startDate && order.createdAt <= endDate
    );
  };

  const archiveOrders = (ordersToArchive: Order[]) => {
    const preparedToArchive = ordersToArchive.map((o) => ({
      ...o,
      originallyPaid: o.originallyPaid ?? o.isPaid,
    }));
    const updated = [...archivedOrders, ...preparedToArchive];
    setArchivedOrders(updated);
    localStorage.setItem('archivedOrders', JSON.stringify(updated));

    // Remove from active orders
    const toArchiveIds = new Set(ordersToArchive.map((o) => o.id));
    const remainingOrders = orders.filter((o) => !toArchiveIds.has(o.id));
    setOrders(remainingOrders);
    localStorage.setItem('currentOrders', JSON.stringify(remainingOrders));

    if (isFirebaseConfigured) {
      preparedToArchive.forEach(async (order) => {
        try {
          await setDoc(doc(db, 'archived_orders', order.id), serializeOrderForFirestore(order));
          await deleteDoc(doc(db, 'orders', order.id));
        } catch (err) {
          console.error('Failed to sync archive action to Firestore:', err);
        }
      });
    }
  };

  const clearOrders = () => {
    const ordersToDelete = [...orders];
    setOrders([]);
    localStorage.setItem('currentOrders', JSON.stringify([]));

    if (isFirebaseConfigured) {
      ordersToDelete.forEach(async (order) => {
        try {
          await deleteDoc(doc(db, 'orders', order.id));
        } catch (err) {
          console.error('Failed to delete order from Firestore:', err);
        }
      });
    }
  };

  const getArchivedOrdersByDateRange = (startDate: Date, endDate: Date) => {
    return archivedOrders.filter(
      (order) => order.createdAt >= startDate && order.createdAt <= endDate
    );
  };

  const value = {
    orders,
    archivedOrders,
    addOrder,
    updateOrderStatus,
    deliverOrderItem,
    updateArchivedOrderPayment,
    getOrderById,
    getOrdersByStatus,
    getOrdersByDateRange,
    getNextOrderNumber,
    archiveOrders,
    clearOrders,
    getArchivedOrdersByDateRange,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};