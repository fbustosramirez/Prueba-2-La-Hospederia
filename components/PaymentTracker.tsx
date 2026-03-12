
import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Guest, Payment } from '../types';
import { DAILY_RATE } from '../constants';
import { isGuestActiveOnDate, formatDateDisplay } from '../utils/helpers';

interface PaymentTrackerProps {
  guests: Guest[];
  payments: Payment[];
  onTogglePayment: (guestId: string, date: string, isPaid: boolean) => void;
}

const PaymentTracker: React.FC<PaymentTrackerProps> = ({ guests, payments, onTogglePayment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const activeGuests = guests.filter(g => isGuestActiveOnDate(g, selectedDate));

  const getPaymentStatus = (guestId: string) => {
    return payments.find(p => p.guestId === guestId && p.fecha === selectedDate)?.esPagado || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="bg-blue-100 p-3 rounded-full">
          <Calendar className="text-blue-900" size={24} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">Fecha de Control</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-xl font-bold text-gray-900 bg-transparent border-none focus:ring-0 cursor-pointer p-0"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-blue-900">Control de Estancia Diaria</h3>
          <span className="text-sm font-medium text-gray-500">Tarifa: $ {DAILY_RATE.toLocaleString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-500 bg-gray-50 font-bold">
              <tr>
                <th className="px-6 py-3">Huésped</th>
                <th className="px-6 py-3">F. Ingreso</th>
                <th className="px-6 py-3 text-center">Estado de Pago</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeGuests.map(g => {
                const isPaid = getPaymentStatus(g.id);
                return (
                  <tr key={g.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{g.nombre}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDateDisplay(g.fechaIngreso)}</td>
                    <td className="px-6 py-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-tight">
                          <CheckCircle size={14} /> Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-tight">
                          <XCircle size={14} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onTogglePayment(g.id, selectedDate, !isPaid)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          isPaid 
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                          : 'bg-yellow-400 text-blue-900 hover:bg-yellow-500 shadow-sm'
                        }`}
                      >
                        {isPaid ? 'Marcar Pendiente' : 'Marcar Pagado'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activeGuests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    No hay huéspedes activas para la fecha seleccionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentTracker;
