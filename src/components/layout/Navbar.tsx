import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, ChefHat, ShoppingBag, ClipboardList, PackageSearch, X, BarChart3, Archive } from 'lucide-react';
import logo from '/D5.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { path: '/items', name: 'Cadastro de Itens', icon: <PackageSearch size={20} /> },
    { path: '/sales', name: 'Vendas', icon: <ShoppingBag size={20} /> },
    { path: '/history', name: 'Pedidos Realizados', icon: <ClipboardList size={20} /> },
    { path: '/sales-history', name: 'Histórico de Vendas', icon: <Archive size={20} /> },
    { path: '/dashboard', name: 'Dashboard', icon: <BarChart3 size={20} /> },
    { path: '/kitchen', name: 'Cozinha', icon: <ChefHat size={20} /> },
  ];

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Vandas Dbv" className="object-contain brightness-0 invert" style={{ width: '60px', height: '60px' }} />
            <span className="text-xl font-bold">Vandas Dbv/Avt</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-blue-100 hover:bg-blue-700 hover:text-white"
            onClick={toggleMenu}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-blue-800 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <ChefHat size={24} />
                <span className="text-xl font-bold">FoodSys</span>
              </div>
              <button
                className="p-2 rounded-md text-blue-100 hover:bg-blue-700 hover:text-white"
                onClick={toggleMenu}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`
                  }
                  onClick={toggleMenu}
                >
                  {item.icon}
                  <span className="text-lg">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;