import React from 'react';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700'
  };

  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
