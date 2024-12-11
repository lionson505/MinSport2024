import React from 'react';

export const Card = ({ title, description, image }) => {
  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none">
      <img className="w-full h-48 object-cover" src={image} alt={title} />
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 hover:text-indigo-500 transition-colors duration-200">{title}</h2>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
      <div className="flex justify-between items-center p-4 border-t border-gray-200">
        <button className="text-white bg-indigo-500 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 rounded-full transition-all duration-200">
          Read More
        </button>
      </div>
    </div>
  );
};

export default Card;
