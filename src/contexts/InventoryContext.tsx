import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { InventoryItem, InventoryContextType } from '../types';
import { useItemContext } from './ItemContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider = ({ children }: InventoryProviderProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('registeredInventory');
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const { items } = useItemContext();

  // Firestore real-time listener for inventory
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const inventoryRef = collection(db, 'inventory');
    const unsubscribe = onSnapshot(
      inventoryRef,
      (snapshot) => {
        const fetchedInventory: InventoryItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as InventoryItem;
          fetchedInventory.push({
            itemId: docSnap.id || data.itemId,
            quantity: data.quantity ?? 0,
          });
        });
        setInventory(fetchedInventory);
        localStorage.setItem('registeredInventory', JSON.stringify(fetchedInventory));
      },
      (error) => {
        console.warn('Firestore inventory sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Initialize inventory for new items
  useEffect(() => {
    const newInventoryItems: InventoryItem[] = [];

    items.forEach((item) => {
      if (!inventory.some((invItem) => invItem.itemId === item.id)) {
        newInventoryItems.push({
          itemId: item.id,
          quantity: 0,
        });
      }
    });

    if (newInventoryItems.length > 0) {
      const updated = [...inventory, ...newInventoryItems];
      setInventory(updated);
      localStorage.setItem('registeredInventory', JSON.stringify(updated));

      if (isFirebaseConfigured) {
        newInventoryItems.forEach(async (newItem) => {
          try {
            await setDoc(doc(db, 'inventory', newItem.itemId), newItem);
          } catch (err) {
            console.error('Failed to init inventory item in Firestore:', err);
          }
        });
      }
    }
  }, [items]);

  const saveInventoryItemRemote = async (item: InventoryItem) => {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'inventory', item.itemId), item);
      } catch (err) {
        console.error('Failed to sync inventory to Firestore:', err);
      }
    }
  };

  const updateInventory = (itemId: string, quantity: number) => {
    const existingIndex = inventory.findIndex((item) => item.itemId === itemId);
    let updatedInventory: InventoryItem[];
    const itemToSave = { itemId, quantity };

    if (existingIndex >= 0) {
      updatedInventory = [...inventory];
      updatedInventory[existingIndex].quantity = quantity;
    } else {
      updatedInventory = [...inventory, itemToSave];
    }

    setInventory(updatedInventory);
    localStorage.setItem('registeredInventory', JSON.stringify(updatedInventory));
    saveInventoryItemRemote(itemToSave);
  };

  const getInventoryByItemId = (itemId: string): number => {
    const item = inventory.find((item) => item.itemId === itemId);
    return item ? item.quantity : 0;
  };

  const checkStockAvailability = (itemId: string, quantity: number): boolean => {
    const currentStock = getInventoryByItemId(itemId);
    return currentStock >= quantity;
  };

  const reduceStock = (stockItems: { itemId: string; quantity: number }[]): boolean => {
    const hasEnoughStock = stockItems.every((item) =>
      checkStockAvailability(item.itemId, item.quantity)
    );

    if (!hasEnoughStock) {
      return false;
    }

    const updatedInventory = [...inventory];
    const itemsToUpdateRemote: InventoryItem[] = [];

    stockItems.forEach(({ itemId, quantity }) => {
      const index = updatedInventory.findIndex((item) => item.itemId === itemId);
      if (index >= 0) {
        updatedInventory[index].quantity -= quantity;
        itemsToUpdateRemote.push(updatedInventory[index]);
      }
    });

    setInventory(updatedInventory);
    localStorage.setItem('registeredInventory', JSON.stringify(updatedInventory));

    if (isFirebaseConfigured) {
      itemsToUpdateRemote.forEach(async (invItem) => {
        try {
          await setDoc(doc(db, 'inventory', invItem.itemId), invItem);
        } catch (err) {
          console.error('Failed to sync reduced stock to Firestore:', err);
        }
      });
    }

    return true;
  };

  const value = {
    inventory,
    updateInventory,
    getInventoryByItemId,
    checkStockAvailability,
    reduceStock,
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};