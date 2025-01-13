import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HeaderTwo = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const handleTabClick = (name) => {
  //   console.log(`${name} tab clicked`);
  // };

  const navigation = [
    { name: 'HOME', path: '/home' },
    { name: 'FEDERATIONS', path: '/federation' },
    { name: 'EVENTS', path: '/events' },
    { name: 'MATCHES', path: '/match' },
  ];
  const [iSactiveTab, setIsActiveTab] = useState('HOME');

  const handleTabClick = (name) => {
    setIsActiveTab(name);
  };

  return (
    <div>
      <header className="bg-white shadow fixed top-0 w-full z-50">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/home">
              <img src="/logo/logo.svg" alt="MINISPORTS" className="h-12 w-auto" />
            </Link>
            <div>
              <nav className="hidden md:flex space-x-10">
                {navigation.map((item) => {
                  const isActiveTab = location.pathname === item.path;
                  return (
                    <Link
                      to={item.path}
                      key={item.name}
                      className={`px-6 py-2.5 rounded-lg text-base ${isActiveTab
                        ? 'bg-blue-300 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      onClick={() => {
                        handleTabClick(item.name);
                      }}
                    >
                      {item.name}
                    </Link>
                  )
                })}

                <Link
                  to="/login"
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base"
                >
                  LOGIN
                </Link>
              </nav>
            </div>

            {/* Burger Menu for Small Devices */}
            <div className="md:hidden flex items-center justify-between p-4">
              {/* Burger Icon */}
              <button
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={() => setIsMenuOpen(true)} // Open the off-canvas menu
              >
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>

            {/* Off-Canvas Menu */}
            <div
              className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/home">
                  <img src="/logo/logo.svg" alt="MINISPORTS" className="h-12 w-auto" />
                </Link>
                <button
                  className="text-gray-600 hover:text-gray-900 focus:outline-none"
                  onClick={() => setIsMenuOpen(false)} // Close the off-canvas menu
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col p-4 space-y-4">
                {navigation.map((item) => {
                  const isActiveTab = location.pathname === item.path;
                  return (
                    <Link
                      to={item.path}
                      key={item.name}
                      className={`block px-6 py-2.5 rounded-lg text-base ${isActiveTab
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                      onClick={() => setIsMenuOpen(false)} // Close menu on link click
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <Link
                  to="/login"
                  className="block px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base"
                  onClick={() => setIsMenuOpen(false)} // Close menu on link click
                >
                  LOGIN
                </Link>
              </nav>
            </div>

            {/* Overlay when menu is open */}
            {isMenuOpen && (
              <div
                className="fixed inset-0 bg-black opacity-50 z-40"
                onClick={() => setIsMenuOpen(false)} // Close menu on overlay click
              ></div>
            )}
          </div>
        </div>
      </header >
    </div >
  );
};

export default HeaderTwo;