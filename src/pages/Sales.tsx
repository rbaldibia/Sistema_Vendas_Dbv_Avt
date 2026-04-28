import { useState, useEffect } from 'react';
import { Plus, Trash2, ChefHat, ShoppingBag, Archive } from 'lucide-react';
import { useItemContext } from '../contexts/ItemContext';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency } from '../utils/formatters';
import { OrderItem, PaymentType } from '../types';

const Sales = () => {
  const { items } = useItemContext();
  const { orders, addOrder, getNextOrderNumber, archiveOrders, clearOrders } = useOrderContext();
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('Dinheiro');
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  // Calculate total order amount
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Clear messages when order items change
  useEffect(() => {
    setOrderSuccessMessage(null);
    setErrorMessage(null);
  }, [orderItems]);
  
  const handleAddItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Check if the item is already in the order
    const existingItem = orderItems.find(oi => oi.itemId === itemId);
    
    if (existingItem) {
      setOrderItems(
        orderItems.map(oi => 
          oi.itemId === itemId 
            ? { ...oi, quantity: oi.quantity + 1 } 
            : oi
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          itemId,
          description: item.description,
          unit: item.unit,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.itemId !== itemId));
  };
  
  const handleChangeQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setOrderItems(
      orderItems.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      setErrorMessage('Adicione pelo menos um item ao pedido.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe o nome do cliente.');
      return;
    }

    if (isPaid && !paymentType) {
      setErrorMessage('Selecione o tipo de pagamento.');
      return;
    }

    try {
      const nextOrderNumber = getNextOrderNumber();
      const orderId = addOrder({
        items: orderItems,
        status: 'Pendente',
        totalAmount,
        customerName: customerName.trim(),
        isPaid,
        paymentType: isPaid ? paymentType : undefined
      });

      setOrderItems([]);
      setCustomerName('');
      setIsPaid(false);
      setPaymentType('Dinheiro');
      setOrderSuccessMessage(`Pedido #${nextOrderNumber} enviado para a cozinha com sucesso!`);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro ao criar o pedido. Tente novamente.');
      }
    }
  };

  const handleCloseSalesCycle = () => {
    if (orders.length === 0) {
      setErrorMessage('Nenhum pedido para arquivar.');
      setShowArchiveModal(false);
      return;
    }

    archiveOrders(orders);
    clearOrders();
    setShowArchiveModal(false);
    setOrderSuccessMessage(`${orders.length} pedido(s) arquivado(s) com sucesso!`);
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fazer Pedido</h1>
            <p className="mt-1 text-sm text-gray-500">
              Selecione os produtos e registre as vendas
            </p>
          </div>
          {orders.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Archive size={18} />}
              onClick={() => setShowArchiveModal(true)}
            >
              Fechar Ciclo ({orders.length})
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available items */}
        <div className="lg:col-span-2">
          <Card title="Itens Disponíveis">
            {items.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum item cadastrado. Cadastre itens primeiro.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.description}</h3>
                          <p className="text-sm text-gray-500">{item.unit}</p>
                        </div>
                        <p className="font-bold text-blue-600">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus size={16} />}
                          onClick={() => handleAddItem(item.id)}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        {/* Order summary */}
        <div>
          <Card title="Resumo do Pedido" className="sticky top-4">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            
            {orderSuccessMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {orderSuccessMessage}
              </div>
            )}

            <div className="mb-4">
              <Input
                label="Nome do Cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div className="mb-4">
              <Select
                label="Status do Pagamento"
                value={isPaid ? "true" : "false"}
                onChange={(e) => setIsPaid(e.target.value === "true")}
              >
                <option value="false">Não Pago</option>
                <option value="true">Pago</option>
              </Select>
            </div>

            {isPaid && (
              <div className="mb-4">
                <Select
                  label="Forma de Pagamento"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                </Select>
              </div>
            )}
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag size={40} className="mx-auto mb-2 text-gray-400" />
                <p>Nenhum item adicionado ao pedido</p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-200 mb-4 max-h-80 overflow-y-auto">
                  {orderItems.map((item, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)} / {item.unit}</p>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-2 py-1 min-w-8"
                            onClick={() => handleChangeQuantity(item.itemId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="mx-2 min-w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-2 py-1 min-w-8"
                            onClick={() => handleChangeQuantity(item.itemId, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <button
                            className="ml-3 text-red-600 hover:text-red-800"
                            onClick={() => handleRemoveItem(item.itemId)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-right mt-1 font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    icon={<ChefHat size={20} />}
                    onClick={handleSubmitOrder}
                  >
                    Enviar para a Cozinha
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md">
            <h2 className="text-xl font-bold mb-4">Fechar Ciclo de Vendas?</h2>
            <p className="text-gray-600 mb-6">
              Isso vai arquivar todos os {orders.length} pedido(s) do dia e limpar a lista para iniciar um novo ciclo.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowArchiveModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={<Archive size={18} />}
                onClick={handleCloseSalesCycle}
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Sales;