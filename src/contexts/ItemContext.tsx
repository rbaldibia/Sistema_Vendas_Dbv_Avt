import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Item, ItemContextType } from '../types';

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

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    localStorage.setItem('registeredItems', JSON.stringify(newItems));
  };

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      available: item.available ?? true,
    };
    saveItems([...items, newItem]);
    return newItem.id;
  };

  const updateItem = (id: string, updatedItem: Omit<Item, 'id'>) => {
    const newItems = items.map((item) =>
      item.id === id
        ? { ...updatedItem, id, available: updatedItem.available ?? item.available ?? true }
        : item
    );
    saveItems(newItems);
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    const newItems = items.map((item) =>
      item.id === id
        ? { ...item, available: item.available === undefined ? false : !item.available }
        : item
    );
    saveItems(newItems);
  };

  const setItemAvailability = (id: string, available: boolean) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, available } : item
    );
    saveItems(newItems);
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