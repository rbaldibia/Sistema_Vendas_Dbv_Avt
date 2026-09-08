import { useState, FormEvent } from 'react';
import { Edit, Trash2, Plus, Package, ShoppingBag } from 'lucide-react';
import { useItemContext } from '../contexts/ItemContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/formatters';

const ItemRegistration = () => {
  const { items, addItem, updateItem, deleteItem, toggleItemForSale, getItemByCode } = useItemContext();
  
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
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Cadastro de Itens</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Cadastre os alimentos e produtos que farão parte das vendas
        </p>
      </div>
      
      <Card title={editingId ? "Editar Item" : "Novo Item"}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Input
              label="Código do Item *"
              name="code"
              placeholder="Ex: BEB01"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              disabled={!!editingId}
              maxLength={10}
              required
            />
            
            <Input
              label="Descrição *"
              name="description"
              placeholder="Ex: X-Salada Especial"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              required
            />
            
            <Input
              label="Unidade *"
              name="unit"
              placeholder="Ex: Unidade, Porção"
              value={formData.unit}
              onChange={handleChange}
              error={errors.unit}
              required
            />
            
            <Input
              label="Valor R$ *"
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
          
          <div className="mt-4 sm:mt-6 flex justify-end space-x-2">
            {editingId && (
              <Button
                type="button"
                variant="secondary"
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
      
      <Card title="Itens Cadastrados no Sistema">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <Package size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">Nenhum item cadastrado ainda.</p>
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">({item.unit})</span>
                      {item.forSale ? (
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          Liberado p/ Venda
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                          Não Liberado
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{item.description}</h3>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      onClick={() => toggleItemForSale(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.forSale
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
                          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={item.forSale ? 'Bloquear para Venda' : 'Liberar para Venda'}
                    >
                      <ShoppingBag size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet View: Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/80">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/80">
                <thead className="bg-slate-100 dark:bg-slate-800/80">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Status Venda
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                        {item.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.forSale ? (
                          <span className="inline-flex items-center text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                            Liberado para Venda
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700">
                            Não Liberado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleItemForSale(item.id)}
                          className={`mr-3 transition-colors ${
                            item.forSale
                              ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                          title={item.forSale ? 'Bloquear para Venda' : 'Liberar para Venda'}
                        >
                          <ShoppingBag size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3 transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ItemRegistration;