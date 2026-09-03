import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useOrderContext } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  const { archivedOrders } = useOrderContext();
  const [dateRange, setDateRange] = useState('7');

  const getDaysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const filteredOrders = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoffDate = getDaysAgo(days);
    return archivedOrders.filter(order => new Date(order.createdAt) >= cutoffDate);
  }, [dateRange, archivedOrders]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [filteredOrders]);

  const paidOrders = useMemo(() => {
    return filteredOrders.filter(order => order.originallyPaid ?? order.isPaid);
  }, [filteredOrders]);

  const unpaidOrders = useMemo(() => {
    return filteredOrders.filter(order => !(order.originallyPaid ?? order.isPaid));
  }, [filteredOrders]);

  const paymentMethodDistribution = useMemo(() => {
    const distribution: Record<string, { count: number; amount: number }> = {};
    paidOrders.forEach(order => {
      if (order.paymentType) {
        if (!distribution[order.paymentType]) {
          distribution[order.paymentType] = { count: 0, amount: 0 };
        }
        distribution[order.paymentType].count += 1;
        distribution[order.paymentType].amount += order.totalAmount;
      }
    });
    return distribution;
  }, [paidOrders]);

  const productPerformance = useMemo(() => {
    const performance: Record<string, { quantity: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!performance[item.description]) {
          performance[item.description] = { quantity: 0, revenue: 0 };
        }
        performance[item.description].quantity += item.quantity;
        performance[item.description].revenue += item.price * item.quantity;
      });
    });
    return Object.entries(performance)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const pieChartData = Object.entries(paymentMethodDistribution).map(([method, data]) => ({
    method,
    percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
    amount: data.amount
  }));

  const maxPercentage = Math.max(...pieChartData.map(d => d.percentage), 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard & Indicadores</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Análise em tempo real de receita, vendas e produtos mais procurados
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-slate-800 dark:to-slate-800/80 border border-blue-200/80 dark:border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Faturamento Total</p>
              <div className="p-2 bg-blue-600/10 dark:bg-blue-400/10 rounded-lg">
                <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{filteredOrders.length} pedidos arquivados</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-slate-800 dark:to-slate-800/80 border border-emerald-200/80 dark:border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pedidos Pagos</p>
              <div className="p-2 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-lg">
                <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{paidOrders.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalRevenue > 0 ? ((paidOrders.reduce((sum, o) => sum + o.totalAmount, 0) / totalRevenue) * 100).toFixed(0) : '0'}% do faturamento
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/80 to-amber-100/60 dark:from-slate-800 dark:to-slate-800/80 border border-amber-200/80 dark:border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pendentes</p>
              <div className="p-2 bg-amber-600/10 dark:bg-amber-400/10 rounded-lg">
                <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{unpaidOrders.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0))} em aberto
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/80 to-purple-100/60 dark:from-slate-800 dark:to-slate-800/80 border border-purple-200/80 dark:border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Ticket Médio</p>
              <div className="p-2 bg-purple-600/10 dark:bg-purple-400/10 rounded-lg">
                <DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">médio por pedido</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card title="Métodos de Pagamento">
          {Object.keys(paymentMethodDistribution).length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Nenhum pagamento registrado no período selecionado
            </div>
          ) : (
            <div className="space-y-4">
              {pieChartData.map(data => (
                <div key={data.method} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{data.method}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">{data.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${(data.percentage / maxPercentage) * 100}%`,
                        backgroundColor: data.method === 'Dinheiro' ? '#10b981' :
                                        data.method === 'Pix' ? '#a855f7' :
                                        data.method === 'Débito' ? '#3b82f6' :
                                        '#f97316'
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(data.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Status de Pagamentos">
          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">Pagos</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{paidOrders.length}</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Total: {formatCurrency(paidOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900 dark:text-amber-200">Pendentes</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{unpaidOrders.length}</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Total: {formatCurrency(unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-800/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-200">Total de Pedidos</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{filteredOrders.length}</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Total: {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Produtos Mais Vendidos">
        {productPerformance.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Nenhum produto vendido no período selecionado
          </div>
        ) : (
          <div className="space-y-2.5">
            {productPerformance.slice(0, 10).map((product, index) => (
              <div
                key={product.name}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{index + 1}º</Badge>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{product.name}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span><strong>{product.quantity}</strong> unid.</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
