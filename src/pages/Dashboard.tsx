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
    return filteredOrders.filter(order => order.isPaid);
  }, [filteredOrders]);

  const unpaidOrders = useMemo(() => {
    return filteredOrders.filter(order => !order.isPaid);
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

  const paymentMethodColors: Record<string, string> = {
    'Dinheiro': 'bg-green-100 text-green-800',
    'Pix': 'bg-purple-100 text-purple-800',
    'Débito': 'bg-blue-100 text-blue-800',
    'Crédito': 'bg-orange-100 text-orange-800'
  };

  const getPaymentColor = (method: string): string => {
    return paymentMethodColors[method] || 'bg-gray-100 text-gray-800';
  };

  const pieChartData = Object.entries(paymentMethodDistribution).map(([method, data]) => ({
    method,
    percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0,
    amount: data.amount
  }));

  const maxPercentage = Math.max(...pieChartData.map(d => d.percentage), 100);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Análise e métricas de vendas
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-gray-600" />
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-600">Faturamento Total</p>
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-blue-700">{filteredOrders.length} pedidos</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-600">Pagos</p>
              <Users size={20} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{paidOrders.length}</p>
            <p className="text-xs text-green-700">
              {totalRevenue > 0 ? formatCurrency((paidOrders.reduce((sum, o) => sum + o.totalAmount, 0) / totalRevenue) * 100) : '0%'} do faturamento
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-orange-600">Pendentes</p>
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-900">{unpaidOrders.length}</p>
            <p className="text-xs text-orange-700">
              {formatCurrency(unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-purple-600">Ticket Médio</p>
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0)}
            </p>
            <p className="text-xs text-purple-700">por pedido</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Métodos de Pagamento">
          {Object.keys(paymentMethodDistribution).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum pagamento registrado no período
            </div>
          ) : (
            <div className="space-y-4">
              {pieChartData.map(data => (
                <div key={data.method} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{data.method}</span>
                    <span className="text-sm text-gray-600">{data.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(data.percentage / maxPercentage) * 100}%`,
                        backgroundColor: data.method === 'Dinheiro' ? '#16a34a' :
                                        data.method === 'Pix' ? '#9333ea' :
                                        data.method === 'Débito' ? '#2563eb' :
                                        '#ea580c'
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{formatCurrency(data.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Status de Pagamentos">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-900">Pagos</span>
                <span className="text-2xl font-bold text-green-600">{paidOrders.length}</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                {formatCurrency(paidOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-orange-900">Pendentes</span>
                <span className="text-2xl font-bold text-orange-600">{unpaidOrders.length}</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                {formatCurrency(unpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{filteredOrders.length}</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Produtos Mais Vendidos">
        {productPerformance.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum produto vendido no período
          </div>
        ) : (
          <div className="space-y-3">
            {productPerformance.slice(0, 10).map((product, index) => (
              <div
                key={product.name}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600 text-white">{index + 1}</Badge>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <span className="font-bold text-blue-600">{formatCurrency(product.revenue)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{product.quantity} unidade(s)</span>
                  <span>•</span>
                  <span>
                    {formatCurrency(product.revenue / product.quantity)} por unidade
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
