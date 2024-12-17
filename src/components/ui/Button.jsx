import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-100',
    ghost: 'hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline'
  },
  sizes: {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-sm',
    lg: 'h-10 rounded-md px-8',
    icon: 'h-9 w-9'
  }
};

const getButtonClasses = ({ variant = 'default', size = 'default', className }) => {
  return cn(
    buttonVariants.base,
    buttonVariants.variants[variant],
    buttonVariants.sizes[size],
    className
  );
};

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  return (
    <button
      className={getButtonClasses({ variant, size, className })}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants, getButtonClasses }; 