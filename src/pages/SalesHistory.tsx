import { useState, useMemo } from 'react';
import { Calendar, ChevronDown, DollarSign, CheckCircle, Filter, X, MessageSquare } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency } from '../utils/formatters';
import { Order, PaymentType } from '../types';

const SalesHistory = () => {
  const { archivedOrders, updateArchivedOrderPayment } = useOrderContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid'>('all');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('Dinheiro');
  const [paymentMode, setPaymentMode] = useState<'full' | 'partial'>('full');
  const [partialPaymentInput, setPartialPaymentInput] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const displayedOrders = useMemo(() => {
    if (paymentFilter === 'unpaid') {
      return ordersOnSelectedDate.filter(order => !order.isPaid);
    }
    return ordersOnSelectedDate;
  }, [ordersOnSelectedDate, paymentFilter]);

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

  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrderForPayment(order);
    setPaymentType(order.paymentType || 'Dinheiro');
    setPaymentMode('full');
    setPartialPaymentInput('');
    setModalError(null);
  };

  const handleConfirmPayment = () => {
    if (!selectedOrderForPayment) return;

    const currentPaid = selectedOrderForPayment.paidAmount ?? (selectedOrderForPayment.isPaid ? selectedOrderForPayment.totalAmount : 0);
    const remaining = Math.max(0, selectedOrderForPayment.totalAmount - currentPaid);

    if (paymentMode === 'full') {
      const newPaidAmount = selectedOrderForPayment.totalAmount;
      updateArchivedOrderPayment(selectedOrderForPayment.id, true, paymentType, newPaidAmount);
      setSuccessMessage(`Baixa total dada com sucesso para a comanda #${selectedOrderForPayment.orderNumber} (${paymentType})!`);
      setSelectedOrderForPayment(null);
    } else {
      const parsedAmount = parseFloat(partialPaymentInput.replace(',', '.'));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setModalError('Informe um valor válido para o pagamento parcial.');
        return;
      }

      if (parsedAmount > remaining) {
        setModalError(`O valor digitado (${formatCurrency(parsedAmount)}) é maior que o saldo restante (${formatCurrency(remaining)}).`);
        return;
      }

      const newPaidAmount = currentPaid + parsedAmount;
      const isFullyPaid = newPaidAmount >= selectedOrderForPayment.totalAmount;

      updateArchivedOrderPayment(selectedOrderForPayment.id, isFullyPaid, paymentType, newPaidAmount);
      setSuccessMessage(`Pagamento parcial de ${formatCurrency(parsedAmount)} registrado para a comanda #${selectedOrderForPayment.orderNumber} (${paymentType})!`);
      setSelectedOrderForPayment(null);
    }

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Histórico de Vendas</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Consulte o arquivo de vendas de ciclos passados por data e gerencie pendências
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center shadow-sm text-sm font-medium animate-slide-in-right">
          <CheckCircle size={20} className="mr-2 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* Date and Payment Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <button
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs text-slate-900 dark:text-slate-100 font-medium text-sm hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              {selectedDate ? formatDateBR(selectedDate) : 'Selecione uma data'}
            </span>
            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden py-1 max-h-60 overflow-y-auto">
              {availableDates.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 text-center">Nenhum ciclo arquivado</div>
              ) : (
                availableDates.map(date => (
                  <button
                    key={date}
                    onClick={() => handleSelectDate(date)}
                    className={`w-full text-left px-3.5 py-2 text-sm transition-colors flex items-center justify-between ${
                      selectedDate === date
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{formatDateBR(date)}</span>
                    {selectedDate === date && <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="sm:w-56">
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'unpaid')}
              icon={<Filter size={16} />}
            >
              <option value="all">Nenhum (Todos)</option>
              <option value="unpaid">Pendentes</option>
            </Select>
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

          <Card title={`Pedidos do Dia Arquivados ${paymentFilter === 'unpaid' ? '(Somente Pendentes)' : ''}`}>
            {displayedOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {paymentFilter === 'unpaid'
                  ? 'Nenhum pedido pendente de pagamento para esta data!'
                  : 'Nenhum pedido registrado para esta data'}
              </div>
            ) : (
              <div className="space-y-3.5">
                {displayedOrders.map(order => {
                  const currentPaid = order.paidAmount ?? (order.isPaid ? order.totalAmount : 0);
                  const remaining = Math.max(0, order.totalAmount - currentPaid);
                  const isPartial = !order.isPaid && currentPaid > 0;

                  return (
                    <div key={order.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-base text-slate-900 dark:text-slate-100">Comanda #{order.orderNumber}</p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.customerName}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="font-bold text-blue-600 dark:text-blue-400 text-base">{formatCurrency(order.totalAmount)}</p>
                          {isPartial && (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                              Pago: {formatCurrency(currentPaid)} | Restante: {formatCurrency(remaining)}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {!order.isPaid && (
                              <Button
                                variant="success"
                                size="sm"
                                icon={<DollarSign size={14} />}
                                onClick={() => handleOpenPaymentModal(order)}
                              >
                                Dar Baixa
                              </Button>
                            )}
                            <Badge variant={order.isPaid ? 'success' : isPartial ? 'warning' : 'warning'}>
                              {order.isPaid
                                ? order.paymentType || 'Pago'
                                : isPartial
                                ? `Parcial: ${formatCurrency(currentPaid)}`
                                : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/80 dark:border-slate-700/60 pt-2.5">
                        <ul className="space-y-1.5">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300">
                              <div className="flex justify-between items-start">
                                <span>
                                  <strong className="text-slate-900 dark:text-slate-100">{item.quantity}x</strong> {item.description}
                                </span>
                                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                              {item.observation && item.observation.trim() && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded mt-0.5 inline-flex items-center gap-1">
                                  <MessageSquare size={11} className="shrink-0" />
                                  <span><strong>Obs:</strong> {item.observation}</span>
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
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

      {/* Dar Baixa de Pagamento Modal */}
      {selectedOrderForPayment && (() => {
        const currentPaid = selectedOrderForPayment.paidAmount ?? (selectedOrderForPayment.isPaid ? selectedOrderForPayment.totalAmount : 0);
        const remaining = Math.max(0, selectedOrderForPayment.totalAmount - currentPaid);

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-500" />
                  Dar Baixa de Pagamento
                </h3>
                <button
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
                  {modalError}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm space-y-1">
                <p className="text-slate-500 dark:border-slate-400 text-xs">Comanda: <strong className="text-slate-900 dark:text-slate-100">#{selectedOrderForPayment.orderNumber}</strong></p>
                <p className="text-slate-500 dark:border-slate-400 text-xs">Cliente: <strong className="text-slate-900 dark:text-slate-100">{selectedOrderForPayment.customerName}</strong></p>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400">Valor Total: <strong className="text-slate-900 dark:text-slate-100">{formatCurrency(selectedOrderForPayment.totalAmount)}</strong></span>
                  <span className="text-slate-500 dark:text-slate-400">Já Pago: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(currentPaid)}</strong></span>
                </div>
                <p className="text-xs pt-1">
                  Saldo Restante: <strong className="text-blue-600 dark:text-blue-400 font-bold">{formatCurrency(remaining)}</strong>
                </p>
              </div>

              <div>
                <Select
                  label="Tipo de Baixa"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as 'full' | 'partial')}
                >
                  <option value="full">Quitar Totalidade ({formatCurrency(remaining)})</option>
                  <option value="partial">Pagamento Parcial</option>
                </Select>
              </div>

              {paymentMode === 'partial' && (
                <div>
                  <Input
                    label="Valor a Pagar Agora (R$) *"
                    type="text"
                    placeholder="0,00"
                    value={partialPaymentInput}
                    onChange={(e) => {
                      setPartialPaymentInput(e.target.value);
                      setModalError(null);
                    }}
                  />
                  {partialPaymentInput && !isNaN(parseFloat(partialPaymentInput.replace(',', '.'))) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Novo Saldo Restante: <strong className="text-amber-600 dark:text-amber-400">{formatCurrency(Math.max(0, remaining - (parseFloat(partialPaymentInput.replace(',', '.')) || 0)))}</strong>
                    </p>
                  )}
                </div>
              )}

              <div>
                <Select
                  label="Forma de Pagamento Recebida *"
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                >
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pix">Pix</option>
                  <option value="Débito">Débito</option>
                  <option value="Crédito">Crédito</option>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setSelectedOrderForPayment(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  fullWidth
                  icon={<CheckCircle size={18} />}
                  onClick={handleConfirmPayment}
                >
                  Confirmar Baixa
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SalesHistory;
