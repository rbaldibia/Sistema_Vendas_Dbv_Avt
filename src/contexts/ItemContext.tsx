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
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: uuidv4() };
    setItems([...items, newItem]);
    return newItem.id;
  };

  const updateItem = (id: string, updatedItem: Omit<Item, 'id'>) => {
    setItems(
      items.map((item) => (item.id === id ? { ...updatedItem, id } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
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
    getItemById,
    getItemByCode,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};