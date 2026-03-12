
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList, AreaChart, Area, Legend
} from 'recharts';
import { Users, LogIn, LogOut, Clock, Baby, Sparkles, Loader2, BrainCircuit, MessageSquareText, TrendingUp, Globe, AlertTriangle, Wallet, Heart } from 'lucide-react';
import { Guest, Payment, Donation } from '../types';
import { DAILY_RATE, MAX_CAPACITY } from '../constants';
import { parseSafeDate, getDaysInRange, calculateAge, formatDateDisplay } from '../utils/helpers';
import { analyzePeriod } from '../services/geminiService';

interface DashboardProps {
  guests: Guest[];
  payments: Payment[];
  donations: Donation[];
}

const Dashboard: React.FC<DashboardProps> = ({ guests, payments, donations }) => {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-02-28');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const CORPORATE_BLUE = '#1e3a8a';
  const CORPORATE_GOLD = '#facc15';
  const COLORS = ['#1e3a8a', '#facc15', '#3b82f6', '#eab308', '#64748b', '#ef4444', '#0d9488', '#7c3aed'];

  const formatMoney = (amount: number) => {
    return `$ ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const stats = useMemo(() => {
    const days = getDaysInRange(dateFrom, dateTo);
    const numDays = days.length;
    const from = parseSafeDate(dateFrom);
    const to = parseSafeDate(dateTo);

    let totalStayDays = 0;
    let newEntries = 0;
    let exits = 0;
    let totalChildren = 0;
    const individualStays: number[] = [];

    const ageGroups: Record<string, number> = {
      '16-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '66+': 0, 'S/I': 0
    };
    const causeCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const derivationCounts: Record<string, number> = {};
    const uniqueGuestsInPeriod = new Set<string>();
    const femaleGuestsInPeriod = new Set<string>();
    let ninosMenores16 = 0;

    const trendData = days.map(dayStr => {
      const target = parseSafeDate(dayStr);
      const activeCount = guests.filter(g => {
        const ingreso = parseSafeDate(g.fechaIngreso);
        const salida = g.fechaSalida ? parseSafeDate(g.fechaSalida) : null;
        const isActive = target >= ingreso && (!salida || target <= salida);
        return isActive;
      }).reduce((acc, g) => {
        const childrenStaying = (g.hijosDetalles || []).filter(c => c.seAloja).length;
        return acc + 1 + childrenStaying;
      }, 0);
      return {
        date: dayStr.split('-').slice(1).reverse().join('/'),
        ocupacion: activeCount
      };
    });

    const lastDayOccupancy = trendData[trendData.length - 1]?.ocupacion || 0;

    let primeraVezMujeres = 0;
    let recurrentesMujeres = 0;

    guests.forEach(g => {
      const entry = parseSafeDate(g.fechaIngreso);
      const exit = g.fechaSalida ? parseSafeDate(g.fechaSalida) : null;

      const stayStart = entry < from ? from : entry;
      const stayEnd = !exit || exit > to ? to : exit;

      if (stayStart <= stayEnd) {
        uniqueGuestsInPeriod.add(g.id);

        // Todo huésped principal se considera mujer
        femaleGuestsInPeriod.add(g.id);
        if (!g.esRecurrente) primeraVezMujeres++;
        else recurrentesMujeres++;

        if (entry >= from && entry <= to) newEntries++;
        if (exit && exit >= from && exit <= to) exits++;

        const diff = Math.floor((stayEnd.getTime() - stayStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalStayDays += diff;
        individualStays.push(diff);

        // Contar hijos acompañantes < 16
        // Priorizar hijosDetalles, pero si está vacío usar cantidadHijos si la madre es activa
        const hasDetails = g.hijosDetalles && g.hijosDetalles.length > 0;
        if (hasDetails) {
          const activeChildren = g.hijosDetalles!.filter(c => {
            if (!c.seAloja) return false;
            const childAge = c.nacimiento ? calculateAge(c.nacimiento) : 0;
            return childAge < 16;
          });
          totalChildren += activeChildren.length;
        } else {
          // Fallback a cantidadHijos para datos legados o ingresos rápidos
          totalChildren += (g.cantidadHijos || 0);
        }

        const age = g.nacimiento ? calculateAge(g.nacimiento) : -1;
        // Si el huésped principal tiene < 16, se cuenta como niño también
        if (age >= 0 && age < 16) ninosMenores16++;

        if (age < 0) {
          ageGroups['S/I']++;
        } else if (age >= 16) {
          let bucket = '';
          if (age <= 25) bucket = '16-25';
          else if (age <= 35) bucket = '26-35';
          else if (age <= 45) bucket = '36-45';
          else if (age <= 55) bucket = '46-55';
          else if (age <= 65) bucket = '56-65';
          else bucket = '66+';

          ageGroups[bucket]++;
        }

        causeCounts[g.causa] = (causeCounts[g.causa] || 0) + 1;
        countryCounts[g.pais] = (countryCounts[g.pais] || 0) + 1;
        const derivation = g.institucionDerivadora || 'S/I';
        derivationCounts[derivation] = (derivationCounts[derivation] || 0) + 1;
      }
    });

    const totalMujeres = femaleGuestsInPeriod.size;

    const totalInPeriod = Object.values(ageGroups).reduce((a, b) => a + b, 0);
    const avgOccupancyCount = totalStayDays / numDays;
    const occupancyPercentage = (avgOccupancyCount / MAX_CAPACITY) * 100;
    const avgStay = individualStays.length > 0 ? totalStayDays / individualStays.length : 0;

    const minStay = individualStays.length > 0 ? Math.min(...individualStays) : 0;
    const maxStay = individualStays.length > 0 ? Math.max(...individualStays) : 0;

    const actualPayments = payments
      .filter(p => p.fecha >= dateFrom && p.fecha <= dateTo && p.esPagado)
      .reduce((sum, p) => sum + p.monto, 0);

    const potentialRevenue = totalStayDays * DAILY_RATE;
    const pendingDebt = Math.max(0, potentialRevenue - actualPayments);

    const totalCountries = Object.values(countryCounts).reduce((a, b) => a + b, 0);
    const countryData = Object.entries(countryCounts).map(([name, value]) => ({
      name,
      value,
      displayLabel: `${value} (${totalCountries > 0 ? Math.round((value / totalCountries) * 100) : 0}%)`
    })).sort((a, b) => b.value - a.value);

    const totalDonations = donations
      .filter(d => d.fecha >= dateFrom && d.fecha <= dateTo)
      .reduce((sum, d) => sum + d.montoEstimado, 0);

    const donationCategories: Record<string, number> = {};
    donations
      .filter(d => d.fecha >= dateFrom && d.fecha <= dateTo)
      .forEach(d => {
        donationCategories[d.categoria] = (donationCategories[d.categoria] || 0) + d.montoEstimado;
      });

    const donationTrendData = days.map(dayStr => {
      const dailyTotal = donations
        .filter(d => d.fecha === dayStr)
        .reduce((sum, d) => sum + d.montoEstimado, 0);
      return {
        date: dayStr.split('-').slice(1).reverse().join('/'),
        monto: dailyTotal
      };
    });

    const donationRecordsInPeriod = donations.filter(d => d.fecha >= dateFrom && d.fecha <= dateTo).length;

    const donationDistributionData = Object.entries(donationCategories).map(([name, value]) => ({
      name,
      value,
      type: 'Donación'
    })).filter(d => d.value > 0);

    const totalIncome = totalDonations + actualPayments;
    const totalTransactions = donationRecordsInPeriod + payments.filter(p => p.fecha >= dateFrom && p.fecha <= dateTo && p.esPagado).length;

    return {
      avgOccupancyCount: avgOccupancyCount.toFixed(1),
      occupancyPercentage: occupancyPercentage.toFixed(1),
      lastDayOccupancy,
      newEntries,
      exits,
      avgStay: avgStay.toFixed(1),
      minStay,
      maxStay,
      totalChildren: totalChildren + ninosMenores16,
      ninosMenores16,
      totalMujeres,
      primeraVezMujeres,
      recurrentesMujeres,
      trendData,
      donationTrendData,
      donationRecordsInPeriod,
      totalTransactions,
      ageData: Object.entries(ageGroups).map(([name, value]) => ({
        name,
        value
      })).filter(d => d.value > 0),
      causeData: Object.entries(causeCounts).map(([name, value]) => ({
        name,
        value,
        percent: totalInPeriod > 0 ? Math.round((value / totalInPeriod) * 100) : 0
      })).sort((a, b) => b.value - a.value),
      countryData,
      derivationData: Object.entries(derivationCounts).map(([name, value]) => ({
        name,
        value,
        displayLabel: `${value} (${totalInPeriod > 0 ? Math.round((value / totalInPeriod) * 100) : 0}%)`
      })).sort((a, b) => b.value - a.value),
      paymentData: [
        { name: 'Pagado', value: actualPayments, fill: CORPORATE_BLUE },
        { name: 'Pendiente', value: pendingDebt, fill: CORPORATE_GOLD }
      ],
      donationDistributionData,
      totalDonations,
      actualPayments,
      pendingDebt,
      totalIncome
    };
  }, [guests, payments, donations, dateFrom, dateTo]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    const report = await analyzePeriod(stats);
    setAiAnalysis(report);
    setIsAnalyzing(false);
  };

  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = Math.round(percent * 100);
    return pct > 0 ? (
      <text x={x} y={y} fill={CORPORATE_BLUE} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-black">
        {`${pct}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header con Filtros y Ocupación */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Desde</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hasta</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">
                Ocupación al Cierre: {stats.lastDayOccupancy} / {MAX_CAPACITY}
              </span>
              {stats.lastDayOccupancy >= MAX_CAPACITY * 0.9 && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
            </div>
            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${stats.lastDayOccupancy >= MAX_CAPACITY ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, (stats.lastDayOccupancy / MAX_CAPACITY) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAiAnalysis}
          disabled={isAnalyzing}
          className="bg-[#1e3a8a] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} className="text-yellow-400" />}
          Análisis Estratégico IA
        </button>
      </div>

      {aiAnalysis && (
        <div className="bg-blue-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4">
          <Sparkles className="absolute -right-4 -bottom-4 text-white/5 w-48 h-48" />
          <div className="relative z-10">
            <h4 className="flex items-center gap-2 font-black uppercase tracking-[0.2em] text-xs mb-4 text-yellow-400">
              <MessageSquareText size={16} /> Informe Ejecutivo Gemini 3
            </h4>
            <p className="text-sm leading-relaxed text-blue-50 font-medium">{aiAnalysis}</p>
            <button onClick={() => setAiAnalysis(null)} className="mt-6 text-[10px] font-black uppercase text-blue-300 hover:text-white underline underline-offset-4">Cerrar</button>
          </div>
        </div>
      )}

      {/* KPIs Principales (Operacionales) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ocupación Prom.', value: stats.avgOccupancyCount, sub: `${stats.occupancyPercentage}% periodo`, icon: Users, color: 'text-blue-600' },
          { label: 'Ingresos', value: stats.newEntries, sub: 'En este periodo', icon: LogIn, color: 'text-green-600' },
          { label: 'Salidas', value: stats.exits, sub: 'En este periodo', icon: LogOut, color: 'text-red-600' },
          { label: 'Estadía Prom.', value: `${stats.avgStay} d`, sub: `Mín: ${stats.minStay} | Máx: ${stats.maxStay}`, icon: Clock, color: 'text-amber-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center group relative">
            <kpi.icon className={`${kpi.color} mb-3`} size={28} />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-gray-900 mb-0.5">{kpi.value}</p>
            <p className="text-[10px] text-gray-400 font-bold">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ANÁLISIS DE IMPACTO SOCIAL (Demografía y Causas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución Etaria con Overlay de Mujeres */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex justify-between items-center">
            Distribución Etaria (16+)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill={CORPORATE_BLUE} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 900, fill: CORPORATE_BLUE }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicadores de Impacto */}
        <div className="space-y-6">
          {/* Mujeres en Periodo */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <Users className="text-pink-500 mb-3" size={28} />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mujeres en Periodo</p>
            <p className="text-3xl font-black text-gray-900 mb-2">{stats.totalMujeres}</p>
            <div className="flex gap-4 text-[10px] font-black uppercase">
              <span className="text-green-600">1era Vez: {stats.primeraVezMujeres}</span>
              <span className="text-blue-600">Recurrentes: {stats.recurrentesMujeres}</span>
            </div>
          </div>

          {/* Niños Menores 16 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <Baby className="text-indigo-600 mb-3" size={28} />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Niños Menores 16</p>
            <p className="text-3xl font-black text-gray-900 mb-0.5">{stats.totalChildren}</p>
            <p className="text-[10px] text-gray-400 font-bold">Total periodal (incl. acompañantes)</p>
          </div>

          {/* Causas Principales (Gráfico de Porcentaje) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-[9px] font-black uppercase tracking-widest mb-4 text-gray-400 border-b pb-1">Causas de Ingreso (%)</h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.causeData.slice(0, 4)} layout="vertical" margin={{ left: -20, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} width={80} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="percent" fill={CORPORATE_BLUE} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="percent" position="right" formatter={(v: any) => `${v}%`} style={{ fontSize: 9, fontWeight: 900, fill: CORPORATE_BLUE }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEXTO SOCIAL Y DERIVACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instituciones Derivadoras */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-indigo-500" /> Instituciones Derivadoras (%)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.derivationData} layout="vertical" margin={{ left: 20, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e3a8a', fontSize: 10, fontWeight: 800 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="displayLabel" position="right" style={{ fontSize: 10, fontWeight: 800, fill: CORPORATE_BLUE }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diversidad de Origen */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex items-center gap-2">
            <Globe size={14} className="text-blue-500" /> Nacionalidad / Origen (%)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.countryData} layout="vertical" margin={{ left: 20, right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e3a8a', fontSize: 10, fontWeight: 800 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill={CORPORATE_GOLD} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="displayLabel" position="right" style={{ fontSize: 10, fontWeight: 800, fill: CORPORATE_BLUE }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TENDENCIA OPERACIONAL */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2">Ocupación Diaria Periodo</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="ocupacion" stroke={CORPORATE_BLUE} strokeWidth={3} fillOpacity={0.1} fill={CORPORATE_BLUE} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ANÁLISIS FINANCIERO Y DONACIONES */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Análisis Financiero & Transparencia</h2>

        {/* Resumen de Transparencia - Impacto Visual */}
        <div className="bg-blue-900 p-8 rounded-3xl shadow-xl border border-blue-800 text-white mb-10 relative overflow-hidden group">
          <div className="absolute top-[-20px] right-[-20px] p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Wallet size={240} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-4 text-blue-300 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" /> Ingreso Total Fundación
            </h3>
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-12">
              <div>
                <p className="text-5xl font-black leading-none tracking-tighter mb-2">{formatMoney(stats.totalIncome)}</p>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest pl-1">Aportes Totales Percibidos</p>
              </div>
              <div className="h-16 w-px bg-blue-700/50 hidden md:block"></div>
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]"></div>
                  <div>
                    <p className="text-lg font-black leading-none text-white">{formatMoney(stats.actualPayments)}</p>
                    <p className="text-[9px] text-blue-300 uppercase font-black tracking-tighter">Pagos de Usuarias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12_px_rgba(52,211,153,0.6)]"></div>
                  <div>
                    <p className="text-lg font-black leading-none text-white">{formatMoney(stats.totalDonations)}</p>
                    <p className="text-[9px] text-blue-300 uppercase font-black tracking-tighter">Donaciones Recibidas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-start gap-4 bg-blue-950/40 p-5 rounded-2xl border border-blue-800/50 backdrop-blur-sm">
              <Heart size={20} className="text-pink-400 mt-1 shrink-0" />
              <p className="text-sm text-blue-100 font-medium leading-relaxed italic">
                "Este monto representa el 100% de los recursos que sostienen la Hospedería. Cada peso permite brindar dignidad, techo y alimentación a mujeres e hijos que transitan por nuestra casa."
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recaudación de Aportes - Usuarias (Antiguo Estado de Financiamiento) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex items-center gap-2">
              Recaudación de Aportes - Usuarias <Wallet size={14} className="text-blue-500" />
            </h3>
            <div className="flex flex-col h-[300px]">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.paymentData}
                      dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={75}
                      paddingAngle={5}
                      label={renderCustomLabel}
                    >
                      {stats.paymentData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 text-center">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5" style={{ color: CORPORATE_BLUE }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CORPORATE_BLUE }}></span>
                    Recaudado
                  </p>
                  <p className="text-xs font-black" style={{ color: CORPORATE_BLUE }}>{formatMoney(stats.actualPayments)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5" style={{ color: CORPORATE_GOLD }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CORPORATE_GOLD }}></span>
                    Pendiente
                  </p>
                  <p className="text-xs font-black" style={{ color: CORPORATE_GOLD }}>{formatMoney(stats.pendingDebt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución de Donaciones (Donut) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex justify-between items-center">
              Distribución de Donaciones <span className="text-emerald-600">{formatMoney(stats.totalDonations)}</span>
            </h3>
            <div className="flex flex-col h-[350px]">
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.donationDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={2}
                      label={renderCustomLabel}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {stats.donationDistributionData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Registros</span>
                  <span className="text-2xl font-black text-gray-700 leading-none">{stats.donationRecordsInPeriod}</span>
                </div>
              </div>

              {/* Resumen por Categoría con estilo Recaudado/Pendiente */}
              <div className="mt-4 pt-4 border-t border-gray-50 h-[100px] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-y-4 text-center">
                  {stats.donationDistributionData.map((cat, i) => (
                    <div key={i} className="px-1 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest truncate flex items-center justify-center gap-1.5" style={{ color: COLORS[i % COLORS.length] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        {cat.name}
                      </p>
                      <p className="text-sm font-black" style={{ color: COLORS[i % COLORS.length] }}>{formatMoney(cat.value)}</p>
                    </div>
                  ))}
                  {stats.donationDistributionData.length === 0 && (
                    <p className="col-span-2 text-center text-[9px] text-gray-300 italic py-2">Sin donaciones en este periodo</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Flujo de Donaciones */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400 border-b pb-2 flex justify-between items-center">
              Flujo de Donaciones <Wallet size={14} className="text-green-500" />
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.donationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(v: any) => formatMoney(v)} width={80} />
                  <Tooltip formatter={(v: any) => formatMoney(v as number)} />
                  <Area type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={3} fillOpacity={0.1} fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
