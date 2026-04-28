import { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

const Select = ({
  label,
  error,
  children,
  fullWidth = true,
  className = '',
  ...props
}: SelectProps) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          px-3 py-2 bg-white border rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;