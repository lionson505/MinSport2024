import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HeaderTwo = () => {
    const navigation = ['HOME', 'FEDERATIONS', 'EVENTS', 'MATCHES', 'INFRASTRUCTURE'];
    const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div>
        <header className="bg-white shadow fixed top-0 w-full z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link
            to="/landing"
            >
            <img src="/logo/logo.svg" alt="MINISPORTS" className="h-12 w-auto" />
            </Link>
            <nav className="hidden md:flex space-x-10">
              {navigation.map((item) => (
                <button
                  key={item}
                  className={`px-6 py-2.5 rounded-lg text-base ${
                    activeTab === item 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(item)}
                >
                  {item}
                </button>
              ))}
            </nav>

            <Link
              to={item.path}
              key={item.name}
              className={`block text-lg text-gray-600 hover:bg-gray-100 py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === item.name ? 'bg-blue-600 text-white' : ''
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              {item.name}
            </Link>
          ))}

          {/* Login Button in Mobile Menu */}
          <Link
            to="/login"
            className="block text-lg text-center text-white bg-blue-600 py-2 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700"
            onClick={() => setIsMenuOpen(false)} // Close menu after clicking login
          >
            LOGIN
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderTwo;
