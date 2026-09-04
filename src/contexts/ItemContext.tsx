import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemContextType } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const useItemContext = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItemContext must be used within an ItemProvider');
  }
  return context;
};

interface ItemProviderProps {
  children: ReactNode;
}

export const ItemProvider = ({ children }: ItemProviderProps) => {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('registeredItems');
    if (!saved) return [];
    try {
      const parsed: Item[] = JSON.parse(saved);
      return parsed.map((item) => ({
        ...item,
        available: item.available ?? true,
      }));
    } catch {
      return [];
    }
  });

  // Real-time Firestore sync
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const itemsRef = collection(db, 'items');
    const unsubscribe = onSnapshot(
      itemsRef,
      (snapshot) => {
        const fetchedItems: Item[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Item;
          fetchedItems.push({
            ...data,
            id: docSnap.id,
            available: data.available ?? true,
          });
        });
        setItems(fetchedItems);
        localStorage.setItem('registeredItems', JSON.stringify(fetchedItems));
      },
      (error) => {
        console.warn('Firestore items sync error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const saveItemsLocalAndRemote = async (
    updatedItems: Item[],
    targetItem?: { item: Item; action: 'set' | 'delete' }
  ) => {
    setItems(updatedItems);
    localStorage.setItem('registeredItems', JSON.stringify(updatedItems));

    if (isFirebaseConfigured && targetItem) {
      try {
        if (targetItem.action === 'set') {
          await setDoc(doc(db, 'items', targetItem.item.id), targetItem.item);
        } else if (targetItem.action === 'delete') {
          await deleteDoc(doc(db, 'items', targetItem.item.id));
        }
      } catch (err) {
        console.error('Failed to sync item with Firestore:', err);
      }
    }
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      available: item.available ?? true,
    };
    const updated = [...items, newItem];
    saveItemsLocalAndRemote(updated, { item: newItem, action: 'set' });
    return newItem.id;
  };

  const updateItem = (id: string, updatedItem: Omit<Item, 'id'>) => {
    const existing = items.find((i) => i.id === id);
    const itemToSave: Item = {
      ...updatedItem,
      id,
      available: updatedItem.available ?? existing?.available ?? true,
    };
    const newItems = items.map((item) => (item.id === id ? itemToSave : item));
    saveItemsLocalAndRemote(newItems, { item: itemToSave, action: 'set' });
  };

  const deleteItem = (id: string) => {
    const itemToDelete = items.find((i) => i.id === id);
    const newItems = items.filter((item) => item.id !== id);
    if (itemToDelete) {
      saveItemsLocalAndRemote(newItems, { item: itemToDelete, action: 'delete' });
    } else {
      setItems(newItems);
      localStorage.setItem('registeredItems', JSON.stringify(newItems));
    }
  };

  const toggleItemAvailability = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updatedItem: Item = {
      ...target,
      available: target.available === undefined ? false : !target.available,
    };
    const newItems = items.map((item) => (item.id === id ? updatedItem : item));
    saveItemsLocalAndRemote(newItems, { item: updatedItem, action: 'set' });
  };

  const setItemAvailability = (id: string, available: boolean) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updatedItem: Item = { ...target, available };
    const newItems = items.map((item) => (item.id === id ? updatedItem : item));
    saveItemsLocalAndRemote(newItems, { item: updatedItem, action: 'set' });
  };

  const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
  };

  const getItemByCode = (code: string) => {
    return items.find((item) => item.code === code);
  };

  const value = {
    items,
    addItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    setItemAvailability,
    getItemById,
    getItemByCode,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};