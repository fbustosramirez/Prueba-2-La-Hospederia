
import { Guest } from '../types';

export const generateSfrBaseId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `REF-${random}`;
};

/**
 * Creates a Date object from a YYYY-MM-DD string with T12:00:00 to avoid timezone shifts.
 */
export const parseSafeDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  return new Date(`${dateStr}T12:00:00`);
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = parseSafeDate(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const calculateAge = (birthDateStr: string): number => {
  if (!birthDateStr) return 0;
  const birthDate = parseSafeDate(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const isGuestActiveOnDate = (guest: Guest, targetDateStr: string): boolean => {
  const target = parseSafeDate(targetDateStr);
  const ingreso = parseSafeDate(guest.fechaIngreso);
  const salida = guest.fechaSalida ? parseSafeDate(guest.fechaSalida) : null;
  return target >= ingreso && (!salida || target <= salida);
};

export const getDaysInRange = (startDate: string, endDate: string): string[] => {
  const start = parseSafeDate(startDate);
  const end = parseSafeDate(endDate);
  const days: string[] = [];
  let current = new Date(start);

  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(','));
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
