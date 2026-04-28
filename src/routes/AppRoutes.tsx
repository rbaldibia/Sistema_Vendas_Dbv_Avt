import { Routes, Route, Navigate } from 'react-router-dom';
import ItemRegistration from '../pages/ItemRegistration';
import Sales from '../pages/Sales';
import OrderHistory from '../pages/OrderHistory';
import Kitchen from '../pages/Kitchen';
import SalesHistory from '../pages/SalesHistory';
import Dashboard from '../pages/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/items" element={<ItemRegistration />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/history" element={<OrderHistory />} />
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/sales-history" element={<SalesHistory />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/items" replace />} />
    </Routes>
  );
};

export default AppRoutes;