import { useState } from 'react';
import { Search, Eye, X, Truck, CheckCircle, Check, MessageSquare } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const OrderHistory = () => {
  const { orders, updateOrderStatus, deliverOrderItem } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all' | 'allExceptDelivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    actionLabel: string;
    variant: 'primary' | 'success' | 'info' | 'warning' | 'secondary';
    onConfirm: () => void;
  } | null>(null);

  const handleMarkAsDelivered = (orderId: string, orderNumber: number) => {
    updateOrderStatus(orderId, 'Entregue');
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: 'Entregue',
        items: selectedOrder.items.map(i => ({ ...i, deliveredQuantity: i.quantity }))
      });
    }
    setSuccessMessage(`Pedido #${orderNumber} marcado como Entregue com sucesso!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleDeliverItem = (orderId: string, itemIndex: number, quantityToDeliver?: number) => {
    deliverOrderItem(orderId, itemIndex, quantityToDeliver);
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedItems = selectedOrder.items.map((it, idx) => {
        if (idx !== itemIndex) return it;
        const currentDelivered = it.deliveredQuantity || 0;
        const remaining = it.quantity - currentDelivered;
        const toAdd = quantityToDeliver !== undefined ? Math.min(quantityToDeliver, remaining) : remaining;
        return { ...it, deliveredQuantity: currentDelivered + toAdd };
      });
      const allDelivered = updatedItems.every(it => (it.deliveredQuantity || 0) >= it.quantity);
      setSelectedOrder({
        ...selectedOrder,
        items: updatedItems,
        status: allDelivered ? 'Entregue' : selectedOrder.status
      });
    }
    setSuccessMessage('Item entregue com sucesso!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus: boolean;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'allExceptDelivered') {
      matchesStatus = order.status !== 'Entregue';
    } else {
      matchesStatus = order.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });
  
  // Sort orders by creation date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': return 'warning';
      case 'Em preparo': return 'info';
      case 'Pronto': return 'success';
      case 'Entregue': return 'secondary';
      default: return 'primary';
    }
  };
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Status dos Pedidos</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Consulte o histórico e o status em tempo real de todas as comandas
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center shadow-sm text-sm font-medium animate-slide-in-right">
          <CheckCircle size={20} className="mr-2 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {successMessage}
        </div>
      )}
      
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente ou nº da comanda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="sm:w-64">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all' | 'allExceptDelivered')}
              label="Filtrar por status"
            >
              <option value="all">Todos os status</option>
              <option value="allExceptDelivered">Todos menos Entregue</option>
              <option value="Pendente">Pendente</option>
              <option value="Em preparo">Em preparo</option>
              <option value="Pronto">Pronto</option>
              <option value="Entregue">Entregue</option>
            </Select>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhum pedido realizado ainda neste ciclo.
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhum pedido encontrado para os filtros aplicados.
          </div>
        ) : (
          <>
            {/* Mobile View: Cards Layout */}
            <div className="block md:hidden space-y-3">
              {sortedOrders.map((order) => {
                const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                const totalDelivered = order.items.reduce((sum, i) => sum + (i.deliveredQuantity || 0), 0);
                const isPartial = totalDelivered > 0 && totalDelivered < totalQty;
                return (
                  <div 
                    key={order.id} 
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Comanda</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">#{order.orderNumber}</h3>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{order.customerName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                        {isPartial && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 rounded-full">
                            Entrega Parcial ({totalDelivered}/{totalQty})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 dark:text-slate-400 my-2">
                      {formatDateTime(order.createdAt)} • {order.items.length} {order.items.length === 1 ? 'item' : 'itens'} {totalDelivered > 0 && `(${totalDelivered}/${totalQty} entregue(s))`}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-3">
                      <div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">Total</span>
                        <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.status === 'Pronto' && (
                          <Button
                            variant="info"
                            size="sm"
                            icon={<Truck size={16} />}
                            onClick={() => setConfirmModalData({
                              title: "Confirmar Entrega do Pedido?",
                              message: `Deseja marcar o pedido #${order.orderNumber} (${order.customerName}) como Entregue?`,
                              actionLabel: "Confirmar Entrega",
                              variant: "info",
                              onConfirm: () => handleMarkAsDelivered(order.id, order.orderNumber)
                            })}
                          >
                            Entregar
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewDetails(order)}
                        >
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / Tablet View: Table Layout */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/80">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700/80">
                <thead className="bg-slate-100 dark:bg-slate-800/80">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Comanda
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Itens
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                  {sortedOrders.map((order) => {
                    const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
                    const totalDelivered = order.items.reduce((sum, i) => sum + (i.deliveredQuantity || 0), 0);
                    const isPartial = totalDelivered > 0 && totalDelivered < totalQty;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                          {totalDelivered > 0 && (
                            <span className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {totalDelivered}/{totalQty} entregue(s)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                            {isPartial && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 rounded-full">
                                Entrega Parcial
                              </span>
                            )}
                          </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {order.status === 'Pronto' && (
                            <Button
                              variant="info"
                              size="sm"
                              icon={<Truck size={16} />}
                              onClick={() => setConfirmModalData({
                                title: "Confirmar Entrega do Pedido?",
                                message: `Deseja marcar o pedido #${order.orderNumber} (${order.customerName}) como Entregue?`,
                                actionLabel: "Confirmar Entrega",
                                variant: "info",
                                onConfirm: () => handleMarkAsDelivered(order.id, order.orderNumber)
                              })}
                            >
                              Entregar
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Eye size={16} />}
                            onClick={() => handleViewDetails(order)}
                          >
                            Detalhes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Detalhes do Pedido #{selectedOrder.orderNumber}
              </h3>
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                onClick={closeOrderDetails}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Cliente</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Data/Hora</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Status</p>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Pagamento</p>
                  <div className="mt-1 flex items-center space-x-1.5 flex-wrap">
                    {(() => {
                      const currentPaid = selectedOrder.paidAmount ?? (selectedOrder.isPaid ? selectedOrder.totalAmount : 0);
                      const isPartialPayment = !selectedOrder.isPaid && currentPaid > 0;
                      return (
                        <>
                          <Badge variant={selectedOrder.isPaid ? 'success' : isPartialPayment ? 'warning' : 'warning'}>
                            {selectedOrder.isPaid ? 'Pago' : isPartialPayment ? `Parcial: ${formatCurrency(currentPaid)}` : 'Pendente'}
                          </Badge>
                          {selectedOrder.paymentType && (
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              via {selectedOrder.paymentType}
                            </span>
                          )}
                          {isPartialPayment && (
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block w-full mt-1">
                              Restante: {formatCurrency(Math.max(0, selectedOrder.totalAmount - currentPaid))}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Itens do Pedido
                </h4>
                <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedOrder.items.map((item, index) => {
                      const delivered = item.deliveredQuantity || 0;
                      const isFullyDelivered = delivered >= item.quantity;
                      return (
                        <div key={index} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-sm">
                          <div className="flex-1 pr-3">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{item.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.quantity}x {formatCurrency(item.price)} / {item.unit}
                            </p>
                            {item.observation && item.observation.trim() && (
                              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1">
                                <MessageSquare size={12} className="shrink-0" />
                                <span><strong>Obs:</strong> {item.observation}</span>
                              </p>
                            )}
                            {delivered > 0 && (
                              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Status: {delivered}/{item.quantity} entregue{delivered > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {formatCurrency(item.price * item.quantity)}
                            </p>

                            {selectedOrder.status !== 'Entregue' && (
                              isFullyDelivered ? (
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded-md flex items-center gap-1">
                                  <Check size={12} /> Entregue
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setConfirmModalData({
                                      title: "Confirmar Entrega de Item?",
                                      message: `Deseja registrar a entrega de ${item.quantity > 1 ? '1 unidade de ' : ''}"${item.description}" do pedido #${selectedOrder.orderNumber}?`,
                                      actionLabel: "Confirmar Entrega",
                                      variant: "info",
                                      onConfirm: () => handleDeliverItem(selectedOrder.id, index, 1)
                                    })}
                                    className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-md transition-all flex items-center gap-1 shadow-2xs"
                                    title={item.quantity > 1 ? "Entregar 1 unidade deste item" : "Marcar este item como entregue"}
                                  >
                                    <Check size={12} />
                                    <span>{item.quantity > 1 ? "+1 entregue" : "Entregar Item"}</span>
                                  </button>
                                  {item.quantity > 1 && (item.quantity - delivered) > 1 && (
                                    <button
                                      onClick={() => setConfirmModalData({
                                        title: "Confirmar Entrega Total do Item?",
                                        message: `Deseja registrar a entrega de TODAS as unidades restantes (${item.quantity - delivered}) de "${item.description}" do pedido #${selectedOrder.orderNumber}?`,
                                        actionLabel: "Entregar Todas",
                                        variant: "info",
                                        onConfirm: () => handleDeliverItem(selectedOrder.id, index)
                                      })}
                                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:underline px-1 py-0.5"
                                      title="Entregar todas as unidades restantes deste item"
                                    >
                                      (Todas)
                                    </button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">Total do Pedido:</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end space-x-2">
              {selectedOrder.status === 'Pronto' && (
                <Button
                  variant="info"
                  icon={<Truck size={16} />}
                  onClick={() => setConfirmModalData({
                    title: "Confirmar Entrega do Pedido?",
                    message: `Deseja marcar o pedido #${selectedOrder.orderNumber} (${selectedOrder.customerName}) como Entregue?`,
                    actionLabel: "Confirmar Entrega",
                    variant: "info",
                    onConfirm: () => handleMarkAsDelivered(selectedOrder.id, selectedOrder.orderNumber)
                  })}
                >
                  Entregar
                </Button>
              )}
              <Button variant="secondary" onClick={closeOrderDetails}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalData && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck size={20} className="text-blue-500" />
              {confirmModalData.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {confirmModalData.message}
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmModalData(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={confirmModalData.variant}
                fullWidth
                onClick={() => {
                  confirmModalData.onConfirm();
                  setConfirmModalData(null);
                }}
              >
                {confirmModalData.actionLabel}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;