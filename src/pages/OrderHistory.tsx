import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
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
    // Check if order ID includes search term
    const matchesSearch = searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if status matches filter
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
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Status dos Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consulte o histórico de todas as vendas realizadas
        </p>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por ID do pedido"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} className="text-gray-400" />}
            />
          </div>
          <div className="md:w-64">
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
          <div className="text-center py-8 text-gray-500">
            Nenhum pedido realizado ainda.
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum pedido encontrado para os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comanda
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
        )}
      </Card>
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detalhes do Pedido #{selectedOrder.orderNumber}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={closeOrderDetails}
              >
                &times;
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data/Hora</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pagamento</p>
                  <div className="mt-1">
                    <Badge variant={selectedOrder.isPaid ? 'success' : 'warning'}>
                      {selectedOrder.isPaid ? 'Pago' : 'Não Pago'}
                    </Badge>
                    {selectedOrder.isPaid && selectedOrder.paymentType && (
                      <span className="ml-2 text-sm text-gray-600">
                        via {selectedOrder.paymentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Itens do Pedido</h4>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unidade
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Preço Unit.
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qtd
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Total do Pedido</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
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