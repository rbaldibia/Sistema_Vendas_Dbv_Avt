import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, ChefHat, ClipboardList, BarChart3, PackageSearch } from 'lucide-react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const bottomNavItems = [
    { path: '/sales', name: 'Vendas', icon: <ShoppingBag size={20} /> },
    { path: '/kitchen', name: 'Cozinha', icon: <ChefHat size={20} /> },
    { path: '/history', name: 'Pedidos', icon: <ClipboardList size={20} /> },
    { path: '/dashboard', name: 'Dashboard', icon: <BarChart3 size={20} /> },
    { path: '/items', name: 'Itens', icon: <PackageSearch size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Quick-Navigation Footer Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1.5 flex justify-around items-center">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            <span className="mt-0.5">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;