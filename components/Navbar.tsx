
import React, { useState } from 'react';
import { Menu, X, Home, Users, Wallet, Heart, ShieldCheck, LogOut, LayoutGrid, Settings, Sparkles } from 'lucide-react';
import { AppView, User } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: Home, roles: ['Admin', 'Operador'] },
    { id: AppView.INVENTORY, label: 'Disponibilidad', icon: LayoutGrid, roles: ['Admin', 'Operador'] },
    { id: AppView.GUESTS, label: 'Huéspedes', icon: Users, roles: ['Admin', 'Operador'] },
    { id: AppView.PAYMENTS, label: 'Pagos', icon: Wallet, roles: ['Admin', 'Operador'] },
    { id: AppView.DONATIONS, label: 'Donaciones', icon: Heart, roles: ['Admin', 'Operador'] },
    { id: AppView.SETUP, label: 'Setup', icon: Settings, roles: ['Admin'] },
    { id: AppView.USERS, label: 'Usuarios', icon: ShieldCheck, roles: ['Admin'] },
    { id: AppView.PROMPTS, label: 'Prompt IA', icon: Sparkles, roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <nav className="sticky top-0 z-50 bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-grow">
            <div className="flex items-center space-x-1">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentView === item.id
                    ? 'bg-yellow-400 text-blue-900 shadow-lg'
                    : 'hover:bg-blue-800 text-blue-100 hover:text-white'
                    }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
              <div className="w-px h-6 bg-blue-800 mx-2"></div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-white hover:bg-red-600/20 transition-all"
              >
                <LogOut size={14} />
                Salir
              </button>
            </div>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-blue-800 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-blue-900 border-t border-blue-800 pb-3 pt-2 px-2 space-y-1 sm:px-3">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setIsOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest ${currentView === item.id ? 'bg-yellow-400 text-blue-900' : 'hover:bg-blue-800 text-blue-100'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { onLogout(); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-red-400 hover:bg-red-600/10"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
