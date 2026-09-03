import { useState, useEffect } from 'react';
import { Clock, CheckCircle, CookingPot, Package, Truck, Filter } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Order, OrderStatus } from '../types';
import { formatDateTime } from '../utils/formatters';

const Kitchen = () => {
  const { orders, updateOrderStatus } = useOrderContext();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  
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
          {displayedOrders.map((order) => (
            <div 
              key={order.id} 
              className={`border-2 rounded-xl overflow-hidden shadow-sm transition-colors flex flex-col justify-between ${getStatusColorClass(order.status)}`}
            >
              <div>
                <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center bg-white/40 dark:bg-slate-900/40">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comanda</span>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 leading-tight">#{order.orderNumber}</h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">{order.customerName}</p>
                  </div>
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
                </div>
                
                <div className="p-3.5">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                  
                  <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5 mb-4">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Itens Solicitados:</h4>
                    <ul className="space-y-1.5">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800/40">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            <span className="text-blue-600 dark:text-blue-400 font-bold mr-1">{item.quantity}x</span> {item.description}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 self-center">({item.unit})</span>
                        </li>
                      ))}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;