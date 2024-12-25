import React from 'react';

const SportLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24">
        {/* Animated basketball */}
        <div className="absolute inset-0 animate-bounce">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="#F97316" />
            <path
              d="M50 10 Q50 50 50 90 M10 50 Q50 50 90 50"
              stroke="#000"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M25 25 Q50 50 75 75 M25 75 Q50 50 75 25"
              stroke="#000"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SportLoader; 