import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { ItemProvider } from './contexts/ItemContext';
import { OrderProvider } from './contexts/OrderContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ItemProvider>
          <OrderProvider>
            <Layout>
              <AppRoutes />
            </Layout>
          </OrderProvider>
        </ItemProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;