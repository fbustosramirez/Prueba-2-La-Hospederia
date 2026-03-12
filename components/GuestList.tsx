
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Home, Baby, UserPlus, Info, MessageSquareText, Globe, MapPin, AlertCircle, RefreshCcw, LogOut } from 'lucide-react';
import { Guest, Room, Child, Payment } from '../types';
import { COUNTRIES } from '../constants';
import { calculateAge, formatDateDisplay, parseSafeDate, generateSfrBaseId } from '../utils/helpers';

interface GuestListProps {
  guests: Guest[];
  rooms: Room[];
  payments: Payment[];
  onAdd: (g: Guest) => void;
  onUpdate: (g: Guest) => void;
  onDelete: (id: string) => void;
  admissionCauses: string[];
}

const GuestList: React.FC<GuestListProps> = ({ guests, rooms, payments, onAdd, onUpdate, onDelete, admissionCauses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [shouldScrollToExit, setShouldScrollToExit] = useState(false);

  const exitSectionRef = useRef<HTMLDivElement>(null);

  const initialFormState: Partial<Guest> = {
    internalId: '',
    nombre: '',
    rut: '',
    nacimiento: '',
    pais: COUNTRIES[0],
    ciudad: '',
    causa: '',
    institucionDerivadora: '',
    esRecurrente: false,
    tieneHijos: false,
    cantidadHijos: 0,
    hijosDetalles: [],
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaSalida: '',
    comentarios: '',
    roomId: '',
    bedId: ''
  };

  const [formData, setFormData] = useState<Partial<Guest>>(initialFormState);

  useEffect(() => {
    if (showModal && !editingGuest && !formData.internalId) {
      setFormData(prev => ({ ...prev, internalId: generateSfrBaseId() }));
    }
  }, [showModal, editingGuest]);

  // Efecto para scroll automático a la zona de salida
  useEffect(() => {
    if (showModal && shouldScrollToExit) {
      setTimeout(() => {
        exitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setShouldScrollToExit(false);
      }, 500);
    }
  }, [showModal, shouldScrollToExit]);

  const handleChildrenCountChange = (count: number) => {
    const currentDetails = [...(formData.hijosDetalles || [])];
    const newDetails: Child[] = Array.from({ length: count }).map((_, i) => {
      const baseId = formData.internalId || 'REF-TEMP';
      return currentDetails[i] || {
        id: `child-${Date.now()}-${i}`,
        internalId: `${baseId}-${i + 1}`,
        nombre: '',
        apellido: '',
        rut: '',
        nacimiento: '',
        nacionalidad: COUNTRIES[0],
        seAloja: true, // Por defecto se aloja
        roomId: formData.roomId,
        bedId: ''
      };
    });
    setFormData({ ...formData, cantidadHijos: count, tieneHijos: count > 0, hijosDetalles: newDetails });
  };

  const getOccupiedBedIds = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const occupied = new Set<string>();

    guests.forEach(g => {
      const isActive = !g.fechaSalida || parseSafeDate(g.fechaSalida) >= parseSafeDate(todayStr);
      if (isActive) {
        if (g.bedId) occupied.add(g.bedId);
        g.hijosDetalles?.forEach(c => {
          if (c.bedId) occupied.add(c.bedId);
        });
      }
    });

    if (editingGuest) {
      if (editingGuest.bedId) occupied.delete(editingGuest.bedId);
      editingGuest.hijosDetalles?.forEach(c => {
        if (c.bedId) occupied.delete(c.bedId);
      });
    }

    return Array.from(occupied);
  };

  const getAvailableBedsForRoom = (roomId: string, currentSelectionInModal: string[] = []) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return [];
    const globalOccupied = getOccupiedBedIds();
    const roomBeds = room.camas.filter(b => !globalOccupied.includes(b.id) && !currentSelectionInModal.includes(b.id));
    return [...roomBeds, { id: 'otro', nombre: 'Otro (Compartido)' }];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.nacimiento || !formData.fechaIngreso || !formData.pais) {
      alert("Por favor complete los campos marcados con asterisco (*).");
      return;
    }

    const newGuest: Guest = {
      ...formData as Guest,
      id: editingGuest ? editingGuest.id : Date.now().toString(),
    };

    if (editingGuest) onUpdate(newGuest);
    else onAdd(newGuest);

    setShowModal(false);
    setEditingGuest(null);
    setFormData(initialFormState);
  };

  const handleOpenExitProcess = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData(guest);
    setShouldScrollToExit(true);
    setShowModal(true);
  };

  const filteredGuests = guests.filter(g =>
    g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.internalId || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (!a.fechaSalida && b.fechaSalida) return -1;
    if (a.fechaSalida && !b.fechaSalida) return 1;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-grow relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Nombre o Código Maestro..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
          />
        </div>
        <button onClick={() => { setShowModal(true); setEditingGuest(null); setFormData(initialFormState); setShouldScrollToExit(false); }} className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-900 text-white px-8 py-3 rounded-xl hover:bg-blue-800 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/10">
          <Plus size={18} /> Nuevo Ingreso Familiar
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Ficha</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Derivación / Causa</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGuests.map(g => {
                const isExit = g.fechaSalida && parseSafeDate(g.fechaSalida) < parseSafeDate(new Date().toISOString().split('T')[0]);
                return (
                  <tr key={g.id} className={`hover:bg-blue-50/30 transition-colors group ${isExit ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-900 bg-yellow-400 px-1.5 py-0.5 rounded shadow-sm">{g.internalId}</span>
                        {g.esRecurrente && <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-1 py-0.5 rounded uppercase">RECURRENTE</span>}
                      </div>
                      <p className={`font-black text-sm ${isExit ? 'text-gray-500 line-through' : 'text-blue-900'}`}>{g.nombre}</p>
                      <p className="text-[10px] text-gray-400 font-bold">RUT: {g.rut || 'S/R'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-blue-900">
                          <Home size={12} className="text-blue-400" />
                          <span className="text-[10px] font-black uppercase">{g.bedId || 'S/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-pink-600">
                          <Baby size={12} />
                          <span className="text-[10px] font-black uppercase">{g.cantidadHijos} Hijos</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-blue-800 font-black uppercase truncate max-w-[150px]">{g.institucionDerivadora || 'Derivación Manual'}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">{g.causa || 'Sin causa registrada'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isExit ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}></span>
                          <span className={`text-[10px] font-black uppercase ${isExit ? 'text-gray-400' : 'text-green-600'}`}>
                            {isExit ? 'Egresada' : 'Activa'}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 mt-1">Ingreso: {formatDateDisplay(g.fechaIngreso)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingGuest(g); setFormData(g); setShowModal(true); setShouldScrollToExit(false); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Editar Ficha"><Edit2 size={14} /></button>
                        {!isExit && (
                          <button onClick={() => handleOpenExitProcess(g)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Tramitar Egreso"><LogOut size={14} /></button>
                        )}
                        <button onClick={() => { if (confirm('¿Eliminar registro?')) onDelete(g.id); }} className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE FICHA FAMILIAR */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
            {/* Header */}
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900 p-3 rounded-2xl text-white shadow-lg"><UserPlus size={24} /></div>
                <div>
                  <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Ficha de Ingreso Familiar</h2>
                  <span className="text-[11px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest mt-1 inline-block">Maestro: {formData.internalId}</span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white p-2 rounded-full text-gray-300 hover:text-red-500 shadow-sm transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-10 space-y-12 bg-white">
              {/* SECCIÓN MADRE */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Info size={16} className="text-blue-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Identificación de la Madre</h3>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <RefreshCcw size={14} className="text-blue-600" />
                    <label className="text-[10px] font-black uppercase text-blue-900">¿Huésped Recurrente?</label>
                    <select value={formData.esRecurrente ? 'true' : 'false'} onChange={e => setFormData({ ...formData, esRecurrente: e.target.value === 'true' })} className="bg-white border-none rounded-lg text-xs font-black px-4 py-1 text-blue-600">
                      <option value="false">No (Nueva)</option>
                      <option value="true">Sí (Recurrente)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nombre Completo *</label>
                    <input required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombres y Apellidos" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">RUT</label>
                    <input value={formData.rut} onChange={e => setFormData({ ...formData, rut: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">F. Nacimiento Madre *</label>
                    <input type="date" required value={formData.nacimiento} onChange={e => setFormData({ ...formData, nacimiento: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">País *</label>
                    <select required value={formData.pais} onChange={e => setFormData({ ...formData, pais: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold">
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Ciudad</label>
                    <input value={formData.ciudad} onChange={e => setFormData({ ...formData, ciudad: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Causa de Ingreso</label>
                    <select value={formData.causa} onChange={e => setFormData({ ...formData, causa: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold">
                      <option value="">Seleccione una causa...</option>
                      {admissionCauses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Institución que Deriva</label>
                    <input value={formData.institucionDerivadora} onChange={e => setFormData({ ...formData, institucionDerivadora: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" placeholder="S/I si es manual" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">F. Ingreso *</label>
                    <input type="date" required value={formData.fechaIngreso} onChange={e => setFormData({ ...formData, fechaIngreso: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Dormitorio</label>
                    <select value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value, bedId: '' })} className="w-full px-4 py-3 bg-blue-50 border-blue-100 rounded-xl text-xs font-black text-blue-900 uppercase">
                      <option value="">Seleccionar...</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Cama</label>
                    <select disabled={!formData.roomId} value={formData.bedId} onChange={e => setFormData({ ...formData, bedId: e.target.value })} className="w-full px-4 py-3 bg-blue-50 border-blue-100 rounded-xl text-xs font-black text-blue-900 uppercase">
                      <option value="">Elegir Cama</option>
                      {formData.roomId && getAvailableBedsForRoom(formData.roomId).map(b => (
                        <option key={b.id} value={b.id}>{b.nombre}</option>
                      ))}
                      {editingGuest?.bedId && editingGuest.roomId === formData.roomId && editingGuest.bedId !== 'otro' && (
                        <option value={editingGuest.bedId}>{editingGuest.bedId} (Actual)</option>
                      )}
                      <option value="otro">Otro (Espacio compartido)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* SECCIÓN HIJOS */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Baby size={18} className="text-pink-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Hijos</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase text-gray-400">Cantidad:</label>
                    <select value={formData.cantidadHijos} onChange={e => handleChildrenCountChange(parseInt(e.target.value))} className="bg-gray-100 border-none rounded-lg text-xs font-black px-4 py-1">
                      {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {formData.hijosDetalles?.map((child, idx) => (
                    <div key={idx} className="bg-gray-50/40 p-8 rounded-[2.5rem] border border-gray-100 relative pt-12 shadow-sm">
                      <div className="absolute top-5 left-8 flex items-center gap-3">
                        <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">HIJO {idx + 1}</span>
                        <span className="text-[9px] font-black text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100 tracking-tighter">{child.internalId}</span>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input placeholder="Nombre" required value={child.nombre} onChange={e => {
                            const d = [...formData.hijosDetalles!]; d[idx].nombre = e.target.value; setFormData({ ...formData, hijosDetalles: d });
                          }} className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold" />
                          <input placeholder="Apellido" required value={child.apellido} onChange={e => {
                            const d = [...formData.hijosDetalles!]; d[idx].apellido = e.target.value; setFormData({ ...formData, hijosDetalles: d });
                          }} className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="date" required value={child.nacimiento} onChange={e => {
                            const d = [...formData.hijosDetalles!]; d[idx].nacimiento = e.target.value; setFormData({ ...formData, hijosDetalles: d });
                          }} className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold" />
                          <div className="bg-blue-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-lg shadow-blue-900/10">
                            {calculateAge(child.nacimiento)} Años
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <select value={child.seAloja ? 'true' : 'false'} onChange={e => {
                            const d = [...formData.hijosDetalles!]; d[idx].seAloja = e.target.value === 'true';
                            if (!d[idx].seAloja) { d[idx].roomId = ''; d[idx].bedId = ''; }
                            setFormData({ ...formData, hijosDetalles: d });
                          }} className="px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl text-[10px] font-black text-pink-700 uppercase flex-1">
                            <option value="true">Si se aloja</option>
                            <option value="false">No se aloja</option>
                          </select>
                        </div>
                        {child.seAloja && (
                          <>
                            <select value={child.roomId} onChange={e => {
                              const d = [...formData.hijosDetalles!]; d[idx].roomId = e.target.value; d[idx].bedId = ''; setFormData({ ...formData, hijosDetalles: d });
                            }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-blue-900 uppercase">
                              <option value="">Habitación...</option>
                              {rooms.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                            </select>
                            <select disabled={!child.roomId} required value={child.bedId} onChange={e => {
                              const d = [...formData.hijosDetalles!]; d[idx].bedId = e.target.value; setFormData({ ...formData, hijosDetalles: d });
                            }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-blue-900 uppercase">
                              <option value="">Cama...</option>
                              {child.roomId && getAvailableBedsForRoom(child.roomId, [formData.bedId!, ...formData.hijosDetalles!.filter((_, i) => i !== idx).map(c => c.bedId!)]).map(b => (
                                <option key={b.id} value={b.id}>{b.nombre}</option>
                              ))}
                              {child.bedId && child.bedId !== 'otro' && <option value={child.bedId}>{child.bedId} (Actual)</option>}
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECCIÓN EGRESO (CON REF) */}
              <div ref={exitSectionRef}>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-red-600 border-b border-red-100 pb-2">
                    <LogOut size={18} />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Cierre de Estadía (Egreso)</h3>
                  </div>
                  <div className="p-10 bg-red-50/40 border-2 border-dashed border-red-200 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
                    <div className="flex-grow">
                      <p className="text-lg font-black text-red-900 mb-2 uppercase tracking-tight">Registro de Salida</p>
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-relaxed">
                        Al establecer una fecha de salida, todas las camas del grupo familiar (madre e hijos) quedarán liberadas automáticamente en el inventario global.
                      </p>
                    </div>
                    <div className="w-full md:w-64">
                      <label className="block text-[10px] font-black text-red-400 uppercase mb-3 text-center">Fecha de Egreso</label>
                      <input
                        type="date"
                        value={formData.fechaSalida}
                        onChange={e => setFormData({ ...formData, fechaSalida: e.target.value })}
                        className="w-full px-6 py-4 bg-white border-2 border-red-100 rounded-[1.5rem] text-sm font-black text-red-600 focus:ring-4 focus:ring-red-500/10 outline-none text-center shadow-lg"
                      />
                    </div>
                    {formData.fechaSalida && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, fechaSalida: '' })}
                        className="text-red-400 hover:text-red-700 text-[10px] font-black uppercase underline underline-offset-8 transition-all"
                      >
                        Anular Proceso de Egreso
                      </button>
                    )}
                  </div>
                </section>
              </div>

              {/* COMENTARIOS */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-blue-900 border-b border-gray-100 pb-2">
                  <MessageSquareText size={16} className="text-blue-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Perfil Social y Conductual</h3>
                </div>
                <textarea
                  value={formData.comentarios}
                  onChange={e => setFormData({ ...formData, comentarios: e.target.value })}
                  placeholder="Observaciones relevantes sobre la estancia, salud o motivo del egreso..."
                  className="w-full p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[180px] shadow-sm"
                />
              </section>

              {/* BOTONERA */}
              <div className="flex gap-4 pt-10 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 border-2 border-gray-100 rounded-2xl font-black text-gray-400 uppercase tracking-widest text-xs hover:bg-gray-50 transition-all">Cerrar</button>
                <button type="submit" className="flex-[2] px-8 py-5 bg-blue-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-900/40 hover:bg-blue-800 transform active:scale-[0.98] transition-all">
                  {editingGuest ? 'Actualizar Ficha e Inventario' : 'Registrar Ingreso Familiar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;
