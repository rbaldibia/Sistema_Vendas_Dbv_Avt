import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { InventoryItem, InventoryContextType } from '../types';
import { useItemContext } from './ItemContext';

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const { items } = useItemContext();

  // Initialize inventory for new items
  useEffect(() => {
    const newInventoryItems: InventoryItem[] = [];
    
    items.forEach(item => {
      if (!inventory.some(invItem => invItem.itemId === item.id)) {
        newInventoryItems.push({
          itemId: item.id,
          quantity: 0
        });
      }
    });
    
    if (newInventoryItems.length > 0) {
      setInventory([...inventory, ...newInventoryItems]);
    }
  }, [items]);
  
  const updateInventory = (itemId: string, quantity: number) => {
    const existingIndex = inventory.findIndex(item => item.itemId === itemId);
    
    if (existingIndex >= 0) {
      const updatedInventory = [...inventory];
      updatedInventory[existingIndex].quantity = quantity;
      setInventory(updatedInventory);
    } else {
      setInventory([...inventory, { itemId, quantity }]);
    }
  };
  
  const getInventoryByItemId = (itemId: string): number => {
    const item = inventory.find(item => item.itemId === itemId);
    return item ? item.quantity : 0;
  };
  
  const checkStockAvailability = (itemId: string, quantity: number): boolean => {
    const currentStock = getInventoryByItemId(itemId);
    return currentStock >= quantity;
  };
  
  const reduceStock = (items: { itemId: string, quantity: number }[]): boolean => {
    // First check if all items have enough stock
    const hasEnoughStock = items.every(item => 
      checkStockAvailability(item.itemId, item.quantity)
    );
    
    if (!hasEnoughStock) {
      return false;
    }
    
    // If all have enough stock, reduce the quantities
    const updatedInventory = [...inventory];
    
    items.forEach(({ itemId, quantity }) => {
      const index = updatedInventory.findIndex(item => item.itemId === itemId);
      if (index >= 0) {
        updatedInventory[index].quantity -= quantity;
      }
    });
    
    setInventory(updatedInventory);
    return true;
  };
  
  const value = {
    inventory,
    updateInventory,
    getInventoryByItemId,
    checkStockAvailability,
    reduceStock
  };
  
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};