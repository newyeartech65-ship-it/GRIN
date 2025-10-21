
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-md border-b border-cyan-400/20 z-10">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-xl md:text-2xl font-bold text-center text-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]">
          ⚡ GRIN AI – <span className="text-green-400 drop-shadow-[0_0_6px_rgba(0,255,156,0.7)]">ONLINE</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
