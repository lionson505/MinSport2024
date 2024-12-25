const ScrollArea = ({ children, className }) => {
  return (
    <div className={`overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 ${className}`}>
      {children}
    </div>
  );
};

