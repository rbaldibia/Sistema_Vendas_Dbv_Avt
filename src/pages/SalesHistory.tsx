import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';

const SalesHistory = () => {
  const { archivedOrders } = useOrderContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    archivedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      dates.add(date);
    });
    return Array.from(dates).sort().reverse();
  }, [archivedOrders]);

  const ordersOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return archivedOrders.filter(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDate === selectedDate;
    });
  }, [selectedDate, archivedOrders]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  const formatDateBR = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const totalSalesOnDate = useMemo(() => {
    return ordersOnSelectedDate.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [ordersOnSelectedDate]);

  const paymentMethodStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ordersOnSelectedDate.forEach(order => {
      if (order.isPaid && order.paymentType) {
        stats[order.paymentType] = (stats[order.paymentType] || 0) + 1;
      }
    });
    return stats;
  }, [ordersOnSelectedDate]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Vendas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consulte as vendas arquivadas por data
        </p>
      </div>

      <div className="relative max-w-xs">
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Calendar size={18} />
            {selectedDate ? formatDateBR(selectedDate) : 'Selecione uma data'}
          </span>
          <ChevronDown size={18} className={`transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCalendarOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {availableDates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma data com vendas arquivadas
              </div>
            ) : (
              availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => handleSelectDate(date)}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    selectedDate === date ? 'bg-blue-100' : ''
                  }`}
                >
                  {formatDateBR(date)}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600">Faturamento Total</p>
                <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalSalesOnDate)}</p>
                <p className="text-sm text-blue-700 mt-2">{ordersOnSelectedDate.length} pedido(s)</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Pagamentos Confirmados</p>
                <p className="text-3xl font-bold text-green-900">
                  {ordersOnSelectedDate.filter(o => o.isPaid).length}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  {ordersOnSelectedDate.filter(o => !o.isPaid).length} pendente(s)
                </p>
              </div>
            </Card>
          </div>

          {Object.keys(paymentMethodStats).length > 0 && (
            <Card title="Métodos de Pagamento">
              <div className="space-y-2">
                {Object.entries(paymentMethodStats).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{method}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Pedidos do Dia">
            {ordersOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum pedido registrado para esta data
              </div>
            ) : (
              <div className="space-y-4">
                {ordersOnSelectedDate.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900">Pedido #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatCurrency(order.totalAmount)}</p>
                        <Badge className="mt-1">
                          {order.isPaid ? order.paymentType : 'Não Pago'}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm text-gray-600">
                            <span>
                              {item.quantity}x {item.description}
                            </span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {!selectedDate && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Selecione uma data para visualizar o histórico de vendas</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesHistory;
