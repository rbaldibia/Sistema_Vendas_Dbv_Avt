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
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Histórico de Vendas</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Consulte o arquivo de vendas de ciclos passados por data
        </p>
      </div>

      <div className="relative max-w-xs">
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 flex items-center justify-between shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            {selectedDate ? formatDateBR(selectedDate) : 'Selecione uma data'}
          </span>
          <ChevronDown size={18} className={`transition-transform duration-200 text-slate-400 ${isCalendarOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCalendarOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
            {availableDates.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Nenhuma data com vendas arquivadas
              </div>
            ) : (
              availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => handleSelectDate(date)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 dark:hover:bg-slate-700 ${
                    selectedDate === date 
                      ? 'bg-blue-100 dark:bg-slate-700 font-bold text-blue-700 dark:text-blue-300' 
                      : 'text-slate-700 dark:text-slate-300'
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
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Faturamento Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalSalesOnDate)}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{ordersOnSelectedDate.length} pedido(s) arquivado(s)</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200 dark:border-slate-700">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pagamentos Confirmados</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {ordersOnSelectedDate.filter(o => o.isPaid).length}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {ordersOnSelectedDate.filter(o => !o.isPaid).length} pendente(s)
                </p>
              </div>
            </Card>
          </div>

          {Object.keys(paymentMethodStats).length > 0 && (
            <Card title="Métodos de Pagamento Utilizados">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {Object.entries(paymentMethodStats).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{method}</span>
                    <Badge variant="info">{count} pedido(s)</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Pedidos do Dia Arquivados">
            {ordersOnSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Nenhum pedido registrado para esta data
              </div>
            ) : (
              <div className="space-y-3.5">
                {ordersOnSelectedDate.map(order => (
                  <div key={order.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-base text-slate-900 dark:text-slate-100">Comanda #{order.orderNumber}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-base">{formatCurrency(order.totalAmount)}</p>
                        <Badge variant={order.isPaid ? 'success' : 'warning'} className="mt-1">
                          {order.isPaid ? order.paymentType : 'Pendente'}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/80 dark:border-slate-700/60 pt-2.5">
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>
                              <strong className="text-slate-900 dark:text-slate-100">{item.quantity}x</strong> {item.description}
                            </span>
                            <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
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
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Calendar size={48} className="mx-auto mb-3 text-slate-400 dark:text-slate-600" />
            <p className="text-base font-medium">Selecione uma data acima para visualizar o histórico de vendas arquivadas</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SalesHistory;
