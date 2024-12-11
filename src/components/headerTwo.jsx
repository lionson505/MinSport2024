import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// import "./../assets/livematchmodal.css";

const HeaderTwo = () => {
  const navigation = [
    { name: 'HOME', path: '/landing' },
    { name: 'FEDERATIONS', path: '/federation' },
    { name: 'EVENTS', path: '/events' },
    { name: 'MATCHES', path: '/match' },
    { name: 'INFRASTRUCTURE', path: '/infrastructures' },
  ];
    const [activeTab, setActiveTab] = useState('HOME');

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
        <Link
          to={item.path}
          key={item.name}
          className={`px-6 py-2.5 rounded-lg text-base ${
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

            <Link
              to="/login"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderTwo;
