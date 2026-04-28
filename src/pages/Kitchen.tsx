import { useState, useEffect } from 'react';
import { Clock, CheckCircle, CookingPot, Package, Truck } from 'lucide-react';
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
  
  // Filter out delivered orders and sort by creation date (oldest first)
  useEffect(() => {
    const filteredOrders = orders
      .filter(order => order.status !== 'Entregue')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    setActiveOrders(filteredOrders);
  }, [orders]);
  
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus, orderNumber: number) => {
    updateOrderStatus(orderId, newStatus);

    setStatusUpdateSuccess(`Status do pedido #${orderNumber} atualizado para ${newStatus}`);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setStatusUpdateSuccess(null);
    }, 3000);
  };
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': return <Clock size={18} />;
      case 'Em preparo': return <CookingPot size={18} />;
      case 'Pronto': return <Package size={18} />;
      case 'Entregue': return <Truck size={18} />;
    }
  };
  
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-amber-50 border-amber-200';
      case 'Em preparo': return 'bg-blue-50 border-blue-200';
      case 'Pronto': return 'bg-green-50 border-green-200';
      case 'Entregue': return 'bg-gray-50 border-gray-200';
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
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cozinha (Painel de Produção)</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os pedidos recebidos e atualize o status de produção
          </p>
        </div>
      </div>
      
      {statusUpdateSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle size={20} className="mr-2" />
          {statusUpdateSuccess}
        </div>
      )}
      
      {activeOrders.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CookingPot size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pedido pendente</h3>
            <p className="text-gray-500">Todos os pedidos foram entregues</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map((order) => (
            <div 
              key={order.id} 
              className={`border-2 rounded-lg overflow-hidden shadow-sm ${getStatusColor(order.status)}`}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500">Comanda</span>
                  <h3 className="font-bold text-lg">#{order.orderNumber}</h3>
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
              
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-3">
                  Recebido em: {formatDateTime(order.createdAt)}
                </div>
                
                <div className="border-b border-gray-200 pb-3 mb-3">
                  <h4 className="font-medium text-gray-700 mb-2">Itens:</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          <span className="font-medium">{item.quantity}x</span> {item.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  {getAvailableActions(order.status).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant as any}
                      fullWidth
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