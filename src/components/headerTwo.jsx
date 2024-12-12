import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HeaderTwo = () => {
  const navigation = [
    { name: 'HOME', path: '/landing' },
    { name: 'FEDERATIONS', path: '/federation' },
    { name: 'EVENTS', path: '/events' },
    { name: 'MATCHES', path: '/match' },
    { name: 'INFRASTRUCTURE', path: '/infrastructures' },
    { name: 'LOGIN', path: '/login' },
  ];

  const [activeTab, setActiveTab] = useState('HOME');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow fixed top-0 w-full z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/landing">
            <img src="/logo/logo.svg" alt="MINISPORTS" className="h-12 w-auto" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            {navigation.map((item) => (
              <Link
                to={item.path}
                key={item.name}
                className={`px-6 py-2.5 rounded-lg text-base transition duration-300 ease-in-out transform hover:scale-105 ${
                  activeTab === item.name
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(item.name)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg py-6 space-y-6 px-6`}
        >
          {navigation.map((item) => (
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
