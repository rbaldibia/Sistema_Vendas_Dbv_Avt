import { useState, useEffect } from 'react';
import { Plus, Trash2, ChefHat, ShoppingBag, Archive, ShoppingCart, Package, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react';
import { useItemContext } from '../contexts/ItemContext';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency } from '../utils/formatters';
import { OrderItem, PaymentType } from '../types';

const Sales = () => {
  const { items, toggleItemAvailability } = useItemContext();
  const { orders, addOrder, getNextOrderNumber, archiveOrders, clearOrders } = useOrderContext();
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'full' | 'partial'>('unpaid');
  const [partialPaidAmount, setPartialPaidAmount] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Dinheiro');
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  
  // Mobile tab state: 'products' or 'cart'
  const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
  
  // Calculate total order amount and total quantity
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Clear messages when order items change
  useEffect(() => {
    setOrderSuccessMessage(null);
    setErrorMessage(null);
  }, [orderItems]);
  
  const handleAddItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;

    if (item.available === false) {
      setErrorMessage(`O item "${item.description}" está esgotado e não pode ser vendido.`);
      return;
    }
    
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

  const handleObservationChange = (index: number, observation: string) => {
    setOrderItems(
      orderItems.map((item, i) => 
        i === index 
          ? { ...item, observation } 
          : item
      )
    );
  };
  
  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      setErrorMessage('Adicione pelo menos um item ao pedido.');
      return;
    }

    // Check if any selected item was deactivated in the meantime
    const unavailableInCart = orderItems.find(oi => {
      const found = items.find(i => i.id === oi.itemId);
      return found && found.available === false;
    });

    if (unavailableInCart) {
      setErrorMessage(`O item "${unavailableInCart.description}" no carrinho ficou esgotado na cozinha. Remova-o para prosseguir.`);
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Informe o nome do cliente.');
      return;
    }

    if (paymentStatus === 'partial') {
      const parsedPartial = parseFloat(partialPaidAmount.replace(',', '.'));
      if (isNaN(parsedPartial) || parsedPartial <= 0) {
        setErrorMessage('Informe um valor válido para o pagamento parcial.');
        return;
      }
    }

    if ((paymentStatus === 'full' || paymentStatus === 'partial') && !paymentType) {
      setErrorMessage('Selecione a forma de pagamento.');
      return;
    }

    setShowSubmitConfirmModal(true);
  };

  const confirmSubmitOrder = () => {
    let finalPaidAmount = 0;
    let finalIsPaid = false;

    if (paymentStatus === 'full') {
      finalIsPaid = true;
      finalPaidAmount = totalAmount;
    } else if (paymentStatus === 'partial') {
      const parsedPartial = parseFloat(partialPaidAmount.replace(',', '.'));
      if (!isNaN(parsedPartial) && parsedPartial > 0) {
        if (parsedPartial >= totalAmount) {
          finalIsPaid = true;
          finalPaidAmount = totalAmount;
        } else {
          finalIsPaid = false;
          finalPaidAmount = parsedPartial;
        }
      }
    }

    try {
      const nextOrderNumber = getNextOrderNumber();
      addOrder({
        items: orderItems,
        status: 'Pendente',
        totalAmount,
        customerName: customerName.trim(),
        isPaid: finalIsPaid,
        paidAmount: finalPaidAmount,
        paymentType: (paymentStatus === 'full' || paymentStatus === 'partial') ? paymentType : undefined
      });

      setOrderItems([]);
      setCustomerName('');
      setPaymentStatus('unpaid');
      setPartialPaidAmount('');
      setPaymentType('Dinheiro');
      setShowSubmitConfirmModal(false);
      setOrderSuccessMessage(`Pedido #${nextOrderNumber} enviado para a cozinha com sucesso!`);
      
      // On mobile, switch back to products view after order
      setMobileTab('products');
    } catch (error) {
      setShowSubmitConfirmModal(false);
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Fazer Pedido</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Selecione os produtos e registre as vendas rapidamente
          </p>
        </div>
        {orders.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Archive size={18} />}
            onClick={() => setShowArchiveModal(true)}
            className="self-start sm:self-auto"
          >
            Fechar Ciclo ({orders.length})
          </Button>
        )}
      </div>

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
        <button
          onClick={() => setMobileTab('products')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
            mobileTab === 'products'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Package size={18} />
          <span>Produtos ({items.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
            mobileTab === 'cart'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShoppingCart size={18} />
          <span>Carrinho {totalQuantity > 0 && `(${totalQuantity})`}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Available items */}
        <div className={`lg:col-span-2 ${mobileTab === 'products' ? 'block' : 'hidden lg:block'}`}>
          <Card title="Itens Cadastrados">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Package size={40} className="mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                <p>Nenhum item cadastrado. Cadastre itens no menu "Cadastro de Itens".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {items.map((item) => {
                  const isAvailable = item.available !== false;
                  const inCart = orderItems.find(oi => oi.itemId === item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`border rounded-xl p-3.5 sm:p-4 transition-all flex flex-col justify-between ${
                        isAvailable
                          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:shadow-md'
                          : 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 opacity-90'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">{item.description}</h3>
                            {!isAvailable && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Esgotado
                              </span>
                            )}
                          </div>
                          <span className="inline-block mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                            {item.unit}
                          </span>
                        </div>
                        <p className={`font-bold text-lg ${isAvailable ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/40 flex items-center justify-between gap-2">
                        {inCart ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            {inCart.quantity} no carrinho
                          </span>
                        ) : !isAvailable ? (
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1"
                            title="Clique para reativar este produto se tiver estoque novamente"
                          >
                            <RefreshCw size={12} />
                            <span>Reativar Item</span>
                          </button>
                        ) : (
                          <span />
                        )}

                        {isAvailable ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus size={16} />}
                            onClick={() => handleAddItem(item.id)}
                          >
                            Adicionar
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            Indisponível
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
        
        {/* Order summary */}
        <div className={`${mobileTab === 'cart' ? 'block' : 'hidden lg:block'}`}>
          <Card title="Resumo do Pedido" className="lg:sticky lg:top-20">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}
            
            {orderSuccessMessage && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
                {orderSuccessMessage}
              </div>
            )}

            <div className="mb-3">
              <Input
                label="Nome do Cliente *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="mb-3">
              <Select
                label="Status do Pagamento"
                value={paymentStatus}
                onChange={(e) => {
                  const status = e.target.value as 'unpaid' | 'full' | 'partial';
                  setPaymentStatus(status);
                  if (status === 'partial' && !partialPaidAmount && totalAmount > 0) {
                    setPartialPaidAmount('');
                  }
                }}
              >
                <option value="unpaid">Pendente (Não Pago)</option>
                <option value="full">Pago Total</option>
                <option value="partial">Pago Parcial</option>
              </Select>
            </div>

            {paymentStatus === 'partial' && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-2">
                <Input
                  label="Valor Pago Agora (R$) *"
                  type="text"
                  placeholder="0,00"
                  value={partialPaidAmount}
                  onChange={(e) => setPartialPaidAmount(e.target.value)}
                />
                {totalAmount > 0 && (
                  <div className="text-xs flex justify-between font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Saldo Restante Devedor:</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {formatCurrency(Math.max(0, totalAmount - (parseFloat(partialPaidAmount.replace(',', '.')) || 0)))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(paymentStatus === 'full' || paymentStatus === 'partial') && (
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
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <ShoppingBag size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">Nenhum item adicionado ao pedido</p>
              </div>
            ) : (
              <>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Itens Selecionados ({totalQuantity})
                </div>
                <ul className="divide-y divide-slate-200 dark:divide-slate-700/60 mb-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
                  {orderItems.map((item, index) => (
                    <li key={index} className="py-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{item.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(item.price)} / {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-2 py-0.5 text-xs h-7 w-7 p-0"
                            onClick={() => handleChangeQuantity(item.itemId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center font-semibold text-sm text-slate-800 dark:text-slate-200">
                            {item.quantity}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="px-2 py-0.5 text-xs h-7 w-7 p-0"
                            onClick={() => handleChangeQuantity(item.itemId, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <button
                            className="ml-1.5 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                            onClick={() => handleRemoveItem(item.itemId)}
                            title="Remover item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="relative flex items-center">
                          <MessageSquare size={13} className="absolute left-2.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Obs: Ex: sem ketchup, sem leite em pó..."
                            value={item.observation || ''}
                            onChange={(e) => handleObservationChange(index, e.target.value)}
                            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <p className="text-right mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                        Subtotal: {formatCurrency(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200">Total:</span>
                    <span className="font-bold text-xl sm:text-2xl text-blue-600 dark:text-blue-400">
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

      {/* Submit Order Confirmation Modal */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ChefHat size={22} className="text-blue-500" />
              Confirmar Envio do Pedido?
            </h2>
            
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm space-y-1.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Comanda: <strong className="text-slate-900 dark:text-slate-100 font-bold">#{getNextOrderNumber()}</strong></p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cliente: <strong className="text-slate-900 dark:text-slate-100">{customerName}</strong></p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Itens: <strong className="text-slate-900 dark:text-slate-100">{totalQuantity} item(ns)</strong></p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Valor Total: <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(totalAmount)}</strong></p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pagamento: <strong className="text-slate-900 dark:text-slate-100">
                  {paymentStatus === 'full' ? `Pago (${paymentType})` : paymentStatus === 'partial' ? `Parcial: ${formatCurrency(parseFloat(partialPaidAmount.replace(',', '.')) || 0)} (${paymentType})` : 'Pendente'}
                </strong>
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-xs">
              Tem certeza que deseja enviar este pedido para a cozinha?
            </p>

            <div className="flex gap-3 pt-1">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowSubmitConfirmModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                fullWidth
                icon={<ChefHat size={18} />}
                onClick={confirmSubmitOrder}
              >
                Confirmar Envio
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Fechar Ciclo de Vendas?</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              Isso vai arquivar todos os <strong className="text-blue-600 dark:text-blue-400">{orders.length} pedido(s)</strong> do ciclo atual no histórico e limpar a lista ativa.
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
                Confirmar Fechamento
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Sales;