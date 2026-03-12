
import React from 'react';
import { LayoutGrid, Bed as BedIcon, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import { Room, Guest } from '../types';
import { parseSafeDate } from '../utils/helpers';

interface RoomInventoryProps {
  rooms: Room[];
  guests: Guest[];
}

const RoomInventory: React.FC<RoomInventoryProps> = ({ rooms, guests }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const getOccupantInBed = (roomId: string, bedId: string) => {
    // Buscar si es una madre
    const mother = guests.find(g =>
      g.roomId === roomId &&
      g.bedId === bedId &&
      (!g.fechaSalida || parseSafeDate(g.fechaSalida) >= parseSafeDate(todayStr))
    );
    if (mother) {
      const stayingChildren = mother.hijosDetalles?.filter(c => c.seAloja) || [];
      const label = stayingChildren.length > 0 ? 'MADRE' : 'HUÉSPED';
      return { nombre: mother.nombre, tipo: label, code: mother.internalId };
    }

    // Buscar si es un hijo
    for (const g of guests) {
      if (!g.fechaSalida || parseSafeDate(g.fechaSalida) >= parseSafeDate(todayStr)) {
        const child = g.hijosDetalles?.find(c => c.roomId === roomId && c.bedId === bedId);
        if (child) return { nombre: `${child.nombre} ${child.apellido}`, tipo: 'HIJO', code: child.internalId };
      }
    }

    return null;
  };

  const totalBeds = rooms.reduce((acc, r) => acc + r.camas.length, 0);

  // Contar ocupadas (madres + hijos)
  let occupiedCount = 0;
  guests.forEach(g => {
    if (!g.fechaSalida || parseSafeDate(g.fechaSalida) >= parseSafeDate(todayStr)) {
      if (g.bedId) occupiedCount++;
      g.hijosDetalles?.forEach(c => {
        if (c.bedId) occupiedCount++;
      });
    }
  });

  const availableBeds = totalBeds - occupiedCount;
  const occupancyPercentage = totalBeds > 0 ? (occupiedCount / totalBeds) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-900"><LayoutGrid size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacidad Real</p>
            <p className="text-2xl font-black text-blue-900">{totalBeds}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Disponibles</p>
            <p className="text-2xl font-black text-green-600">{availableBeds}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-50 p-4 rounded-2xl text-red-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Camas Ocupadas</p>
            <p className="text-2xl font-black text-red-600">{occupiedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${occupancyPercentage > 90 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
            <Percent size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uso de Capacidad</p>
            <p className="text-2xl font-black text-gray-900">{occupancyPercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 bg-gray-50/50 border-b flex justify-between items-center">
              <h3 className="font-black text-blue-900 uppercase text-xs tracking-[0.2em]">{room.nombre}</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase">{room.camas.length} Camas Totales</span>
              </div>
            </div>
            <div className="p-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.camas.map(bed => {
                const occupant = getOccupantInBed(room.id, bed.id);
                return (
                  <div
                    key={bed.id}
                    className={`relative p-5 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center ${occupant
                      ? 'bg-red-50 border-red-100 text-red-800'
                      : 'bg-green-50 border-green-100 text-green-700 hover:scale-[1.02]'
                      }`}
                  >
                    <BedIcon size={24} className="mb-2 opacity-60" />
                    <span className="text-[11px] font-black uppercase tracking-tight mb-2">{bed.nombre}</span>
                    {occupant ? (
                      <div className="flex flex-col items-center">
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase mb-1 ${occupant.tipo === 'MADRE' ? 'bg-blue-900 text-white' : occupant.tipo === 'HIJO' ? 'bg-pink-500 text-white' : 'bg-gray-600 text-white'}`}>
                          {occupant.tipo}
                        </div>
                        <span className="text-[10px] font-black truncate max-w-[90px]">{occupant.nombre.split(' ')[0]}</span>
                        <span className="text-[8px] font-bold text-gray-400 mt-1">{occupant.code}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-green-600/60 tracking-widest">Disponible</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomInventory;
