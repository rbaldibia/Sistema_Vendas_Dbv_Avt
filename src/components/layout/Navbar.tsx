import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, ChefHat, ShoppingBag, ClipboardList, PackageSearch, X, BarChart3, Archive, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '/D5.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/items', name: 'Cadastro de Itens', icon: <PackageSearch size={18} /> },
    { path: '/sales', name: 'Vendas', icon: <ShoppingBag size={18} /> },
    { path: '/history', name: 'Pedidos Realizados', icon: <ClipboardList size={18} /> },
    { path: '/sales-history', name: 'Histórico de Vendas', icon: <Archive size={18} /> },
    { path: '/dashboard', name: 'Dashboard', icon: <BarChart3 size={18} /> },
    { path: '/kitchen', name: 'Cozinha', icon: <ChefHat size={18} /> },
  ];

  return (
    <nav className="bg-blue-800 dark:bg-slate-950 text-white shadow-md border-b border-blue-700/50 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <NavLink to="/sales" className="flex items-center space-x-2.5 group">
            <img src={logo} alt="Vandas Dbv" className="object-contain brightness-0 invert transition-transform group-hover:scale-105" style={{ width: '44px', height: '44px' }} />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-tight">Campanhas Dbv/Avt</span>
              <span className="text-xs text-blue-200 dark:text-slate-400 font-medium">Sistema de Vendas</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-blue-700 dark:bg-slate-800 text-white shadow-xs font-semibold'
                    : 'text-blue-100 dark:text-slate-300 hover:bg-blue-700/70 dark:hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-2 rounded-lg bg-blue-700/60 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 text-amber-300 dark:text-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema claro/escuro"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-blue-700/60 dark:bg-slate-800 text-amber-300 dark:text-amber-400 transition-colors focus:outline-none"
              title="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 rounded-lg text-blue-100 hover:bg-blue-700 dark:hover:bg-slate-800 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-blue-900 dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-800 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <img src={logo} alt="Vandas Dbv" className="object-contain brightness-0 invert" style={{ width: '40px', height: '40px' }} />
                  <span className="text-lg font-bold">Vendas Dbv/Avt</span>
                </div>
                <button
                  className="p-2 rounded-lg text-blue-100 hover:bg-blue-800 dark:hover:bg-slate-800"
                  onClick={toggleMenu}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex flex-col space-y-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                        ? 'bg-blue-700 dark:bg-slate-800 text-white font-bold'
                        : 'text-blue-100 dark:text-slate-300 hover:bg-blue-800 dark:hover:bg-slate-800'
                      }`
                    }
                    onClick={toggleMenu}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-blue-800 dark:border-slate-800 flex items-center justify-between text-xs text-blue-200 dark:text-slate-400">
              <span>Tema: {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-800 dark:bg-slate-800 text-amber-300 dark:text-amber-400 font-medium"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Alternar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;