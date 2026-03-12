import React, { useState } from 'react';
import { Plus, Trash2, Home, Bed as BedIcon, X, AlertCircle } from 'lucide-react';
import { Room, Bed } from '../types';

interface RoomSetupProps {
  rooms: Room[];
  onSave: (rooms: Room[]) => void;
  causes: string[];
  onSaveCauses: (causes: string[]) => void;
  donationCategories: string[];
  onSaveDonationCategories: (categories: string[]) => void;
}

const RoomSetup: React.FC<RoomSetupProps> = ({ rooms, onSave, causes, onSaveCauses, donationCategories, onSaveDonationCategories }) => {
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
  const [localCauses, setLocalCauses] = useState<string[]>(causes);
  const [localCategories, setLocalCategories] = useState<string[]>(donationCategories);
  const [showModal, setShowModal] = useState(false);
  const [showCauseModal, setShowCauseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomBeds, setNewRoomBeds] = useState(1);
  const [newCause, setNewCause] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) return;

    const camas: Bed[] = Array.from({ length: newRoomBeds }).map((_, i) => ({
      id: `bed-${Date.now()}-${i}`,
      nombre: `Cama ${i + 1}`
    }));

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      nombre: newRoomName,
      camas
    };

    const updated = [...localRooms, newRoom];
    setLocalRooms(updated);
    onSave(updated);
    setShowModal(false);
    setNewRoomName('');
    setNewRoomBeds(1);
  };

  const handleDeleteRoom = (id: string) => {
    if (!confirm('¿Segura que desea eliminar esta habitación? Se perderán las asignaciones actuales.')) return;
    const updated = localRooms.filter(r => r.id !== id);
    setLocalRooms(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* SECCIÓN ESTRUCTURA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Estructura de la Hospedería</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Defina los dormitorios y su capacidad</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl hover:bg-blue-800 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10"
          >
            <Plus size={18} />
            Añadir Dormitorio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localRooms.map(room => (
            <div key={room.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-100/50 p-3 rounded-2xl text-blue-900">
                    <Home size={24} />
                  </div>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-black text-gray-900 uppercase text-sm mb-1">{room.nombre}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Capacidad: {room.camas.length} Camas</p>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {room.camas.map(bed => (
                    <div key={bed.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                      <BedIcon size={12} className="text-gray-400" />
                      <span className="text-[10px] font-black text-gray-600 uppercase">{bed.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {localRooms.length === 0 && (
            <div className="col-span-full py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl text-center">
              <Home className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-black uppercase text-xs tracking-widest">No hay habitaciones configuradas</p>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN CAUSAS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Gestión de Causas de Ingreso</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure los motivos de alojamiento</p>
          </div>
          <button
            onClick={() => setShowCauseModal(true)}
            className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-900/10"
          >
            <AlertCircle size={18} />
            Configurar Causas
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localCauses.slice(0, 10).map(cause => (
            <span key={cause} className="px-3 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm">
              {cause}
            </span>
          ))}
          {localCauses.length > 10 && (
            <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-tight">
              +{localCauses.length - 10} más
            </span>
          )}
          {localCauses.length === 0 && (
            <p className="text-xs text-gray-400 font-bold uppercase py-2">No hay causas configuradas</p>
          )}
        </div>
      </div>

      {/* SECCIÓN CONFIGURACIÓN DONACIONES */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Configuración de Donaciones</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Configure los tipos y categorías de aporte</p>
          </div>
          <button
            onClick={() => setShowDonationModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-green-900/10"
          >
            <AlertCircle size={18} />
            Configurar Categorías
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {localCategories.map(cat => (
            <span key={cat} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm">
              {cat}
            </span>
          ))}
          {localCategories.length === 0 && (
            <p className="text-xs text-gray-400 font-bold uppercase py-2">No hay categorías configuradas</p>
          )}
        </div>
      </div>

      {/* MODAL HABITACIÓN */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Configurar Habitación</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nombre del Dormitorio</label>
                <input
                  required
                  autoFocus
                  placeholder="Ej: Sala 1 - Primer Piso"
                  value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Número de Camas Iniciales</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={newRoomBeds}
                  onChange={e => setNewRoomBeds(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-500 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-all font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-900/20">Crear Dormitorio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAUSAS */}
      {showCauseModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Causas de Ingreso</h2>
              <button onClick={() => setShowCauseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-2">
                <input
                  value={newCause}
                  onChange={e => setNewCause(e.target.value)}
                  placeholder="Nueva causa..."
                  className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCause && !localCauses.includes(newCause)) {
                      const updated = [...localCauses, newCause];
                      setLocalCauses(updated);
                      onSaveCauses(updated);
                      setNewCause('');
                    }
                  }}
                  className="bg-blue-900 text-white p-2 rounded-xl"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {localCauses.map(cause => (
                  <div key={cause} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold uppercase text-gray-700">{cause}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localCauses.filter(c => c !== cause);
                        setLocalCauses(updated);
                        onSaveCauses(updated);
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowCauseModal(false)}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DONACIONES */}
      {showDonationModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Categorías de Donación</h2>
              <button onClick={() => setShowDonationModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Nueva categoría..."
                  className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategory && !localCategories.includes(newCategory)) {
                      const updated = [...localCategories, newCategory];
                      setLocalCategories(updated);
                      onSaveDonationCategories(updated);
                      setNewCategory('');
                    }
                  }}
                  className="bg-green-600 text-white p-2 rounded-xl"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {localCategories.map(cat => (
                  <div key={cat} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold uppercase text-gray-700">{cat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localCategories.filter(c => c !== cat);
                        setLocalCategories(updated);
                        onSaveDonationCategories(updated);
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowDonationModal(false)}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl font-bold text-gray-500 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSetup;
