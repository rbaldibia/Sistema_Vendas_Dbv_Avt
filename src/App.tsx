import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { ItemProvider } from './contexts/ItemContext';
import { OrderProvider } from './contexts/OrderContext';

function App() {
  return (
    <Router>
      <ItemProvider>
        <OrderProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </OrderProvider>
      </ItemProvider>
    </Router>
  );
}

export default App;