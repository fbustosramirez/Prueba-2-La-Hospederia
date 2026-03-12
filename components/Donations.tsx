
import React, { useState, useMemo } from 'react';
import { Heart, Landmark, Plus, Trash2, Search, Filter, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Donation } from '../types';
import { formatDateDisplay } from '../utils/helpers';

interface DonationsProps {
  donations: Donation[];
  categories: string[];
  onAdd: (d: Donation) => void;
  onDelete: (id: string) => void;
}

const Donations: React.FC<DonationsProps> = ({ donations, categories, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    donante: '',
    categoria: categories[0] || '',
    descripcion: '',
    montoEstimado: '', // String to handle input focus/empty state
    fecha: new Date().toISOString().split('T')[0]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  // Estadísticas (KPIs)
  const stats = useMemo(() => {
    const filteredByDate = donations.filter(d => d.fecha >= dateFrom && d.fecha <= dateTo);
    const total = filteredByDate.reduce((sum, d) => sum + (d.montoEstimado || 0), 0);
    const count = filteredByDate.length;
    const avg = count > 0 ? total / count : 0;

    // Total histórico (realmente histórico sin filtro de fecha para comparación si se quiere, 
    // pero el usuario pidió seleccionar el periodo, así que usaremos el periodo para estos KPIs)
    const totalHistorico = donations.reduce((sum, d) => sum + d.montoEstimado, 0);

    return { total, count, avg, totalHistorico };
  }, [donations, dateFrom, dateTo]);

  // Lista de donantes únicos para "Lookup/Sugerencias"
  const donantesHistoricos = useMemo(() => {
    const unique = Array.from(new Set(donations.map(d => d.donante)));
    return unique.sort();
  }, [donations]);

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.donante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || d.categoria === categoryFilter;
    const matchesDate = d.fecha >= dateFrom && d.fecha <= dateTo;
    return matchesSearch && matchesCategory && matchesDate;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donante || !formData.descripcion) return;

    const newDonation: Donation = {
      ...formData,
      montoEstimado: parseInt(formData.montoEstimado.toString()) || 0,
      id: Date.now().toString(),
    } as Donation;

    onAdd(newDonation);
    setFormData({
      donante: '',
      categoria: categories[0] || '',
      descripcion: '',
      montoEstimado: '',
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* DATE SELECTOR & KPI INDICATORS */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm gap-6">
        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
          <Calendar className="text-blue-900" size={18} />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Periodo de Análisis</span>
            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-transparent text-xs font-black text-blue-900 outline-none cursor-pointer" />
              <span className="text-gray-300">al</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-transparent text-xs font-black text-blue-900 outline-none cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <div className="text-center md:text-right">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto en Periodo</p>
            <p className="text-2xl font-black text-blue-900 leading-none">$ {stats.total.toLocaleString()}</p>
          </div>
          <div className="text-center md:text-right border-l border-gray-100 pl-8">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">N° Registros</p>
            <p className="text-2xl font-black text-amber-500 leading-none">{stats.count}</p>
          </div>
          <div className="text-center md:text-right border-l border-gray-100 pl-8">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Promedio</p>
            <p className="text-2xl font-black text-green-600 leading-none">$ {Math.round(stats.avg).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <Heart className="absolute -right-4 -bottom-4 text-blue-800 w-32 h-32 opacity-20 transform group-hover:scale-110 transition-transform" />
          <p className="text-blue-200 uppercase text-[10px] font-black tracking-widest mb-1">Monto Periodo</p>
          <p className="text-3xl font-black text-white">$ {stats.total.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 text-green-50 w-24 h-24 opacity-50" />
          <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest mb-1">Registros</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-green-600">{stats.count}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <Calendar className="absolute -right-4 -bottom-4 text-blue-50 w-24 h-24 opacity-50" />
          <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest mb-1">Promedio / Período</p>
          <p className="text-3xl font-black text-blue-900">$ {Math.round(stats.avg).toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <CreditCard className="absolute -right-4 -bottom-4 text-amber-50 w-24 h-24 opacity-50" />
          <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest mb-1">Total Histórico</p>
          <p className="text-3xl font-black text-amber-500">$ {stats.totalHistorico.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-blue-900 mb-8 flex items-center gap-3 uppercase tracking-tight">
              <Plus size={20} className="text-yellow-500" />
              Nueva Donación
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Donante Historico (Sugerencias)</label>
                <div className="relative group">
                  <input
                    required
                    list="donantes-list"
                    value={formData.donante}
                    onChange={e => setFormData({ ...formData, donante: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    placeholder="Nombre o entidad"
                  />
                  <datalist id="donantes-list">
                    {donantesHistoricos.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Categoría</label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Monto Estimado ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.montoEstimado}
                  onChange={e => setFormData({ ...formData, montoEstimado: e.target.value })}
                  placeholder="0"
                  className="w-full px-5 py-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl text-xl font-black text-blue-900 outline-none placeholder:text-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Descripción / Concepto</label>
                <textarea
                  required
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none"
                  rows={3}
                  placeholder="Detalle de la donación..."
                />
              </div>

              <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
                Registrar Donación
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-900 p-2 rounded-xl text-white">
                  <Landmark size={20} />
                </div>
                <h3 className="font-black text-blue-900 uppercase tracking-tight">Historial de Donaciones</h3>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar donante..."
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase outline-none"
                >
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Fecha</th>
                    <th className="px-8 py-4">Donante / Categoría</th>
                    <th className="px-8 py-4">Descripción</th>
                    <th className="px-8 py-4 text-right">Valor</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDonations.map(d => (
                    <tr key={d.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-gray-500">{formatDateDisplay(d.fecha)}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-blue-900 uppercase text-xs">{d.donante}</span>
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter mt-0.5">{d.categoria}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 max-w-xs">
                        <p className="text-xs text-gray-600 line-clamp-2">{d.descripcion}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-green-600">$ {d.montoEstimado.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => onDelete(d.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-2 transition-all rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <Heart className="text-gray-200 mb-2" size={40} />
                          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No hay registros coincidentes</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
