import { useState } from 'react';
import { Search, Eye, X } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Order, OrderStatus } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const OrderHistory = () => {
  const { orders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all' | 'allExceptDelivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
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
              {sortedOrders.map((order) => (
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
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-slate-500 dark:text-slate-400 my-2">
                    {formatDateTime(order.createdAt)} • {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700/60 mt-3">
                    <div>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block">Total</span>
                      <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
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
              ))}
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
                  {sortedOrders.map((order) => (
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye size={16} />}
                          onClick={() => handleViewDetails(order)}
                        >
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
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
                    <Badge variant={selectedOrder.isPaid ? 'success' : 'warning'}>
                      {selectedOrder.isPaid ? 'Pago' : 'Pendente'}
                    </Badge>
                    {selectedOrder.isPaid && selectedOrder.paymentType && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        via {selectedOrder.paymentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Itens do Pedido
                </h4>
                <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden">
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.quantity}x {formatCurrency(item.price)} / {item.unit}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
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

            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <Button variant="secondary" onClick={closeOrderDetails}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;