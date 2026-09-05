import { useState, useEffect } from 'react';
import { Clock, CheckCircle, CookingPot, Package, Truck, Filter, AlertCircle, Check, X, MessageSquare } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import { useItemContext } from '../contexts/ItemContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Order, OrderStatus } from '../types';
import { formatDateTime } from '../utils/formatters';

const Kitchen = () => {
  const { orders, updateOrderStatus, deliverOrderItem } = useOrderContext();
  const { items, toggleItemAvailability } = useItemContext();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [showItemAvailability, setShowItemAvailability] = useState(false);
  
  // Filter out delivered orders and sort by creation date (oldest first)
  useEffect(() => {
    const filteredOrders = orders
      .filter(order => order.status !== 'Entregue')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    setActiveOrders(filteredOrders);
  }, [orders]);
  
  const displayedOrders = activeOrders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus, orderNumber: number) => {
    updateOrderStatus(orderId, newStatus);

    setStatusUpdateSuccess(`Status do pedido #${orderNumber} atualizado para ${newStatus}`);

    setTimeout(() => {
      setStatusUpdateSuccess(null);
    }, 3000);
  };

  const handleToggleItem = (itemId: string, itemDescription: string, currentAvailable: boolean) => {
    toggleItemAvailability(itemId);
    const newStatus = !currentAvailable ? 'Disponível' : 'Esgotado';
    setStatusUpdateSuccess(`Item "${itemDescription}" marcado como ${newStatus}`);
    setTimeout(() => {
      setStatusUpdateSuccess(null);
    }, 3000);
  };

  const unavailableItemsCount = items.filter(i => i.available === false).length;

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': return <Clock size={16} />;
      case 'Em preparo': return <CookingPot size={16} />;
      case 'Pronto': return <Package size={16} />;
      case 'Entregue': return <Truck size={16} />;
    }
  };
  
  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': 
        return 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60';
      case 'Em preparo': 
        return 'bg-blue-50/80 dark:bg-slate-800/80 border-blue-400 dark:border-blue-700/80';
      case 'Pronto': 
        return 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700/60';
      case 'Entregue': 
        return 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  };
  
  const getAvailableActions = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente':
        return [
          { label: 'Iniciar Preparo', newStatus: 'Em preparo' as OrderStatus, variant: 'primary' }
        ];
      case 'Em preparo':
        return [
          { label: 'Finalizar Preparo', newStatus: 'Pronto' as OrderStatus, variant: 'success' }
        ];
      case 'Pronto':
        return [
          { label: 'Marcar como Entregue', newStatus: 'Entregue' as OrderStatus, variant: 'info' }
        ];
      default:
        return [];
    }
  };
  
  const pendingCount = activeOrders.filter(o => o.status === 'Pendente').length;
  const preparingCount = activeOrders.filter(o => o.status === 'Em preparo').length;
  const readyCount = activeOrders.filter(o => o.status === 'Pronto').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Cozinha (Painel de Produção)</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gerencie as comandas recebidas e atualize os estágios de produção
          </p>
        </div>

        {/* Top Right: Items Availability Toggle Menu */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowItemAvailability(!showItemAvailability)}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 transition-all shadow-xs"
          >
            <CookingPot size={18} className="text-amber-500" />
            <span>Itens em Venda</span>
            {unavailableItemsCount > 0 ? (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unavailableItemsCount} esgotado(s)
              </span>
            ) : (
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Todos ok
              </span>
            )}
          </button>

          {/* Item Availability Dropdown Modal/Card */}
          {showItemAvailability && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={18} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Disponibilidade dos Itens</h3>
                </div>
                <button
                  onClick={() => setShowItemAvailability(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Nenhum item cadastrado no sistema.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {items.map((item) => {
                    const isAvailable = item.available !== false;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {item.description}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Unidade: {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleItem(item.id, item.description, isAvailable)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 hover:bg-red-200'
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <Check size={14} />
                              <span>Disponível</span>
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              <span>Esgotado</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {statusUpdateSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center shadow-sm text-sm font-medium animate-slide-in-right">
          <CheckCircle size={20} className="mr-2 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {statusUpdateSuccess}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Todos ({activeOrders.length})
        </button>
        <button
          onClick={() => setFilterStatus('Pendente')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            filterStatus === 'Pendente'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Pendentes ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('Em preparo')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            filterStatus === 'Em preparo'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Em preparo ({preparingCount})
        </button>
        <button
          onClick={() => setFilterStatus('Pronto')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            filterStatus === 'Pronto'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Prontos ({readyCount})
        </button>
      </div>

      {activeOrders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CookingPot size={48} className="mx-auto text-slate-400 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Nenhum pedido pendente</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Todos os pedidos foram produzidos e entregues com sucesso!</p>
          </div>
        </Card>
      ) : displayedOrders.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Filter size={40} className="mx-auto text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum pedido encontrado para a aba selecionada.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedOrders.map((order) => {
            const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const totalDelivered = order.items.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0);
            const isPartialDelivery = totalDelivered > 0 && totalDelivered < totalQty;

            return (
              <div 
                key={order.id} 
                className={`border-2 rounded-xl overflow-hidden shadow-sm transition-colors flex flex-col justify-between ${getStatusColorClass(order.status)}`}
              >
                <div>
                  <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-700/80 flex justify-between items-start bg-white/40 dark:bg-slate-900/40">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comanda</span>
                      <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 leading-tight">#{order.orderNumber}</h3>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{order.customerName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={
                          order.status === 'Pendente' ? 'warning' : 
                          order.status === 'Em preparo' ? 'info' : 
                          order.status === 'Pronto' ? 'success' : 'secondary'
                        }
                        className="flex items-center space-x-1"
                      >
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </Badge>
                      {isPartialDelivery && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 px-2 py-0.5 rounded-full">
                          Entrega Parcial ({totalDelivered}/{totalQty})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-3.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDateTime(order.createdAt)}</span>
                    </div>
                    
                    <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Itens Solicitados:</h4>
                        {totalDelivered > 0 && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {totalDelivered}/{totalQty} entregue(s)
                          </span>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {order.items.map((item, index) => {
                          const delivered = item.deliveredQuantity || 0;
                          const isFullyDelivered = delivered >= item.quantity;
                          return (
                            <li key={index} className={`flex items-center justify-between text-xs p-2 rounded-lg border transition-colors ${
                              isFullyDelivered
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300/60 dark:border-emerald-800/60'
                                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/40 dark:border-slate-800/40'
                            }`}>
                              <div className="flex-1 pr-2">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">{item.quantity}x</span> {item.description}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">({item.unit})</span>
                                {item.observation && item.observation.trim() && (
                                  <div className="mt-1 px-2 py-1 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 rounded-md text-[11px] font-medium text-amber-900 dark:text-amber-200 flex items-start gap-1">
                                    <MessageSquare size={13} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                    <span><strong>Obs:</strong> {item.observation}</span>
                                  </div>
                                )}
                                {delivered > 0 && (
                                  <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                    {delivered}/{item.quantity} entregue{delivered > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              {isFullyDelivered ? (
                                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                  <Check size={12} /> Entregue
                                </span>
                              ) : (
                                <button
                                  onClick={() => deliverOrderItem(order.id, index)}
                                  className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 border border-blue-300 dark:border-blue-800 px-2 py-1 rounded-md transition-all flex items-center gap-1 shrink-0 shadow-2xs"
                                  title="Entregar este item"
                                >
                                  <Check size={12} />
                                  <span>Entregar Item</span>
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <div className="space-y-2">
                    {getAvailableActions(order.status).map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant as any}
                        fullWidth
                        size="md"
                        onClick={() => handleUpdateStatus(order.id, action.newStatus, order.orderNumber)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Kitchen;