import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const Badge = ({
  children,
  variant = 'primary',
  className = '',
}: BadgeProps) => {
  const variantClasses = {
    primary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60',
    secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-transparent dark:border-slate-700',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-transparent dark:border-emerald-800/60',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-transparent dark:border-red-800/60',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-transparent dark:border-amber-800/60',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-transparent dark:border-blue-800/60',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;