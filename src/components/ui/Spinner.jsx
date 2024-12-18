function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
  );
}

export default Spinner; 