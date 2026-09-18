import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Grape, Flame, ChevronDown, Check } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  icon: typeof Sun;
  iconColor: string;
  bgPreview: string;
  accentPreview: string;
  borderColor: string;
}

const themeOptions: ThemeOption[] = [
  {
    id: 'light',
    name: 'Claro',
    description: 'Modo limpo e padronizado',
    icon: Sun,
    iconColor: 'text-amber-500',
    bgPreview: 'bg-slate-100',
    accentPreview: 'bg-blue-600',
    borderColor: 'border-slate-300',
  },
  {
    id: 'dark',
    name: 'Escuro',
    description: 'Modo noturno confortável',
    icon: Moon,
    iconColor: 'text-sky-400',
    bgPreview: 'bg-slate-900',
    accentPreview: 'bg-blue-500',
    borderColor: 'border-slate-700',
  },
  {
    id: 'jabuticaba',
    name: 'Jabuticaba',
    description: 'Roxo vibrante e elegante',
    icon: Grape,
    iconColor: 'text-purple-400',
    bgPreview: 'bg-[#11081a]',
    accentPreview: 'bg-[#d946ef]',
    borderColor: 'border-purple-800',
  },
  {
    id: 'braseiro',
    name: 'Braseiro',
    description: 'Tom brasa e coral quente',
    icon: Flame,
    iconColor: 'text-orange-500',
    bgPreview: 'bg-[#150b08]',
    accentPreview: 'bg-[#ff6b4a]',
    borderColor: 'border-orange-900',
  },
];

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector = ({ compact = false }: ThemeSelectorProps) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = themeOptions.find((opt) => opt.id === theme) || themeOptions[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/80 ${
          compact
            ? 'bg-blue-700/60 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 text-white'
            : 'bg-blue-700/80 dark:bg-slate-800/90 hover:bg-blue-700 dark:hover:bg-slate-700 text-white shadow-sm border border-blue-600/40 dark:border-slate-700'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Tema atual: ${currentOption.name}. Clique para mudar.`}
      >
        <div className={`p-1 rounded-lg bg-black/20 dark:bg-white/10 ${currentOption.iconColor}`}>
          <CurrentIcon size={18} />
        </div>
        {!compact && <span className="text-sm font-semibold tracking-wide">{currentOption.name}</span>}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 text-blue-200 dark:text-slate-400 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      {/* Pop-up Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aparência do Sistema
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Escolha o seu tema preferido
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-slate-300 border border-blue-200 dark:border-slate-700">
              4 Opções
            </span>
          </div>

          {/* Theme List */}
          <div className="p-2 space-y-1">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700/80 shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Icon container */}
                    <div
                      className={`p-2 rounded-xl border ${option.borderColor} ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 group-hover:scale-110 transition-transform'
                      }`}
                    >
                      <IconComponent size={20} className={option.iconColor} />
                    </div>

                    {/* Title and Description */}
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-bold ${
                            isSelected
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}
                        >
                          {option.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Color Preview & Checkmark */}
                  <div className="flex items-center space-x-2.5">
                    {/* Theme Swatch preview */}
                    <div
                      className={`w-7 h-7 rounded-full border ${option.borderColor} ${option.bgPreview} flex items-center justify-center shadow-inner`}
                      title={`Prévia: ${option.name}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${option.accentPreview}`} />
                    </div>

                    {/* Active Check Icon */}
                    <div className="w-5 flex justify-center">
                      {isSelected && (
                        <Check size={18} className="text-blue-600 dark:text-amber-400 animate-in zoom-in-50" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
