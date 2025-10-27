
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 p-4 shadow-md sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
            MM
          </div>
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-gray-800"></span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Maximilien Maubert</h1>
          <p className="text-sm text-green-400">En ligne</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
