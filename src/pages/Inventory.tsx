import { useState } from 'react';
import { Save, RefreshCcw } from 'lucide-react';
import { useItemContext } from '../contexts/ItemContext';
import { useInventoryContext } from '../contexts/InventoryContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';

const Inventory = () => {
  const { items } = useItemContext();
  const { inventory, updateInventory, getInventoryByItemId } = useInventoryContext();
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [updateSuccess, setUpdateSuccess] = useState<Record<string, boolean>>({});
  
  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseInt(value);
    setQuantities({
      ...quantities,
      [itemId]: isNaN(numValue) ? 0 : Math.max(0, numValue)
    });
    
    // Clear success message when user makes changes
    if (updateSuccess[itemId]) {
      setUpdateSuccess(prev => ({
        ...prev,
        [itemId]: false
      }));
    }
  };
  
  const handleUpdateInventory = (itemId: string) => {
    const quantity = quantities[itemId];
    if (quantity !== undefined) {
      updateInventory(itemId, quantity);
      setUpdateSuccess(prev => ({
        ...prev,
        [itemId]: true
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(prev => ({
          ...prev,
          [itemId]: false
        }));
      }, 3000);
    }
  };
  
  const getStockStatus = (itemId: string) => {
    const quantity = getInventoryByItemId(itemId);
    if (quantity <= 0) {
      return { label: 'Sem estoque', variant: 'danger' as const };
    } else if (quantity < 5) {
      return { label: 'Baixo', variant: 'warning' as const };
    } else {
      return { label: 'Disponível', variant: 'success' as const };
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Estoque de Itens</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie a quantidade de itens disponíveis no estoque
        </p>
      </div>
      
      <Card>
        {items.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum item cadastrado. Cadastre itens primeiro.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ajustar Estoque
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => {
                  const currentQuantity = getInventoryByItemId(item.id);
                  const status = getStockStatus(item.id);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{currentQuantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Input
                            type="number"
                            min="0"
                            value={quantities[item.id] !== undefined ? quantities[item.id] : currentQuantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Button
                            onClick={() => handleUpdateInventory(item.id)}
                            variant="primary"
                            size="sm"
                            icon={<RefreshCcw size={16} />}
                            className="mr-2"
                          >
                            Atualizar
                          </Button>
                          {updateSuccess[item.id] && (
                            <span className="text-green-600 text-sm animate-fade-in-out">
                              Atualizado!
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Inventory;