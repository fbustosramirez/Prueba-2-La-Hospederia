
import React from 'react';
import { AppView } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import PaymentTracker from './components/PaymentTracker';
import Donations from './components/Donations';
import UserManagement from './components/UserManagement';
import RoomSetup from './components/RoomSetup';
import RoomInventory from './components/RoomInventory';
import PromptMaestro from './components/PromptMaestro';
import Login from './components/Login';
import { Home, User } from 'lucide-react';
import { useAppState } from './hooks/useAppState';

const App: React.FC = () => {
  const {
    currentUser, currentView, guests, rooms, payments, donations, users,
    admissionCauses, handleSaveCauses, donationCategories, handleSaveDonationCategories,
    setView, handleLoginSuccess, handleLogout, handleAddGuest, handleUpdateGuest,
    handleDeleteGuest, handleSaveRooms, handleTogglePayment, handleAddDonation,
    handleDeleteDonation, handleAddUser, handleUpdateUser, handleDeleteUser
  } = useAppState();

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard guests={guests} payments={payments} />;
      case AppView.INVENTORY:
        return <RoomInventory rooms={rooms} guests={guests} />;
      case AppView.SETUP:
        return <RoomSetup rooms={rooms} onSave={handleSaveRooms} causes={admissionCauses} onSaveCauses={handleSaveCauses} />;
      case AppView.GUESTS:
        return (
          <GuestList
            guests={guests}
            rooms={rooms}
            payments={payments}
            onAdd={handleAddGuest}
            onUpdate={handleUpdateGuest}
            onDelete={handleDeleteGuest}
            admissionCauses={admissionCauses}
          />
        );
      case AppView.PAYMENTS:
        return <PaymentTracker guests={guests} payments={payments} onTogglePayment={handleTogglePayment} />;
      case AppView.DONATIONS:
        return <Donations donations={donations} onAdd={handleAddDonation} onDelete={handleDeleteDonation} />;
      case AppView.USERS:
        return <UserManagement users={users} currentUser={currentUser} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />;
      case AppView.PROMPTS:
        return <PromptMaestro />;
      default:
        return <Dashboard guests={guests} payments={payments} />;
    }
  };

  const viewTitles = {
    [AppView.DASHBOARD]: 'Dashboard de Gestión',
    [AppView.GUESTS]: 'Registro de Huéspedes',
    [AppView.PAYMENTS]: 'Control de Pagos',
    [AppView.DONATIONS]: 'Módulo de Donaciones',
    [AppView.INVENTORY]: 'Disponibilidad de Camas',
    [AppView.SETUP]: 'Configuración de Hospedaje',
    [AppView.USERS]: 'Gestión de Usuarios',
    [AppView.PROMPTS]: 'Prompt Maestro IA'
  };

  if (!currentUser) return <Login onLogin={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Corporativo */}
      <div className="sticky top-0 z-50">
        <header className="bg-blue-900 text-white shadow-2xl relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-white/20 rotate-12 blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-2.5 md:py-3 relative flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 group">
              <div className="bg-yellow-400 p-2 md:p-3 rounded-2xl shadow-xl shadow-yellow-400/20 transform group-hover:rotate-6 transition-transform">
                <Home className="text-blue-900" size={24} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">
                  Santa Francisca Romana
                </h1>
                <p className="text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase text-blue-300 mt-1.5 opacity-80">
                  Gestión Hospedería
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8">
              <div className="text-right flex flex-col order-2 md:order-1 items-center md:items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300/60 mb-1">Usuario Activo</span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black uppercase tracking-tighter text-white brightness-110">{currentUser?.username}</span>
                    <span className="text-[9px] font-black uppercase text-yellow-400 tracking-widest">{currentUser?.role === 'admin' ? 'Coordinadora' : 'Voluntaria'}</span>
                  </div>
                  <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center border-2 border-yellow-400/30 group-hover:border-yellow-400 transition-all">
                    <User size={18} className="text-yellow-400" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-red-500/20 order-1 md:order-2"
              >
                Finalizar Sesión
              </button>
            </div>
          </div>
        </header>

        <Navbar
          currentView={currentView}
          setView={setView}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full overflow-y-auto scrollbar-hide">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentView === AppView.DASHBOARD && <Dashboard guests={guests} payments={payments} donations={donations} />}
          {currentView === AppView.GUESTS && (
            <GuestList
              guests={guests}
              rooms={rooms}
              admissionCauses={admissionCauses}
              onAdd={handleAddGuest}
              onUpdate={handleUpdateGuest}
              onCheckout={handleDeleteGuest}
              onDelete={handleDeleteGuest}
              onAddPayment={handleTogglePayment}
            />
          )}
          {currentView === AppView.DONATIONS && <Donations donations={donations} categories={donationCategories} onAdd={handleAddDonation} onDelete={handleDeleteDonation} />}
          {currentView === AppView.SETUP && (
            <RoomSetup
              rooms={rooms}
              onSave={handleSaveRooms}
              causes={admissionCauses}
              onSaveCauses={handleSaveCauses}
              donationCategories={donationCategories}
              onSaveDonationCategories={handleSaveDonationCategories}
            />
          )}
          {currentView === AppView.INVENTORY && <RoomInventory rooms={rooms} guests={guests} />}
          {currentView === AppView.PAYMENTS && <PaymentTracker guests={guests} payments={payments} onTogglePayment={handleTogglePayment} />}
          {currentView === AppView.USERS && <UserManagement users={users} currentUser={currentUser} onAdd={handleAddUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />}
          {currentView === AppView.PROMPTS && <PromptMaestro />}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Santa Francisca Romana • ERP v6.0 Advanced
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
