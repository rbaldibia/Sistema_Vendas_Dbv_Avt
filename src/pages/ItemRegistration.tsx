import { useState, FormEvent } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useItemContext } from '../contexts/ItemContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/formatters';

const ItemRegistration = () => {
  const { items, addItem, updateItem, deleteItem, getItemByCode } = useItemContext();
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    unit: '',
    price: ''
  });
  
  const [errors, setErrors] = useState({
    code: '',
    description: '',
    unit: '',
    price: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      unit: '',
      price: ''
    });
    setErrors({
      code: '',
      description: '',
      unit: '',
      price: ''
    });
    setEditingId(null);
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      code: '',
      description: '',
      unit: '',
      price: ''
    };
    
    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
      isValid = false;
    }
    
    if (!formData.unit.trim()) {
      newErrors.unit = 'Unidade é obrigatória';
      isValid = false;
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Valor é obrigatório';
      isValid = false;
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valor deve ser um número positivo';
      isValid = false;
    }
    
    // Check for duplicate code (only when adding new item)
    if (!editingId && formData.code.trim()) {
      const existingItem = getItemByCode(formData.code);
      if (existingItem) {
        newErrors.code = 'Este código já está em uso';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const itemData = {
      code: formData.code,
      description: formData.description,
      unit: formData.unit,
      price: parseFloat(formData.price)
    };
    
    if (editingId) {
      updateItem(editingId, itemData);
    } else {
      addItem(itemData);
    }
    
    resetForm();
  };
  
  const handleEdit = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setFormData({
        code: item.code,
        description: item.description,
        unit: item.unit,
        price: item.price.toString()
      });
      setEditingId(id);
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      deleteItem(id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Cadastro de Itens</h1>
        <p className="mt-1 text-sm text-gray-500">
          Cadastre os alimentos e bebidas que serão vendidos
        </p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Código do Item"
              name="code"
              placeholder="Ex: ABC123"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              disabled={!!editingId}
              maxLength={10}
              required
            />
            
            <Input
              label="Descrição"
              name="description"
              placeholder="Ex: Hambúrguer Tradicional"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
            />
            
            <Input
              label="Unidade"
              name="unit"
              placeholder="Ex: Unidade, Porção, etc."
              value={formData.unit}
              onChange={handleChange}
              error={errors.unit}
              required
            />
            
            <Input
              label="Valor (R$)"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ex: 15.90"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                className="mr-2"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            )}
            
            <Button 
              type="submit"
              icon={editingId ? <Edit size={18} /> : <Plus size={18} />}
            >
              {editingId ? 'Atualizar Item' : 'Salvar Item'}
            </Button>
          </div>
        </form>
      </Card>
      
      <Card title="Itens Cadastrados">
        {items.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum item cadastrado
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ItemRegistration;