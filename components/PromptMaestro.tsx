
import React, { useState, useEffect } from 'react';
import { PromptVersion } from '../types';
import * as dataService from '../services/dataService';
import { Save, History, CheckCircle, AlertCircle, Plus, Trash2, RotateCcw } from 'lucide-react';

const PromptMaestro: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptVersion[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const loadedPrompts = dataService.getPrompts();
    setPrompts(loadedPrompts);
    const active = loadedPrompts.find(p => p.isActive);
    if (active) {
      setCurrentPrompt(active.prompt);
    }
  }, []);

  const handleSave = () => {
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa una descripción para esta versión.' });
      return;
    }

    setIsSaving(true);
    const newVersion: PromptVersion = {
      id: `p-${Date.now()}`,
      timestamp: new Date().toISOString(),
      descripcion: description,
      prompt: currentPrompt,
      isActive: true
    };

    const updatedPrompts = prompts.map(p => ({ ...p, isActive: false }));
    const finalPrompts = [newVersion, ...updatedPrompts];
    
    setPrompts(finalPrompts);
    dataService.savePrompts(finalPrompts);
    setDescription('');
    setIsSaving(false);
    setMessage({ type: 'success', text: 'Nueva versión guardada y activada con éxito.' });
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRestore = (id: string) => {
    const updatedPrompts = prompts.map(p => ({
      ...p,
      isActive: p.id === id
    }));
    setPrompts(updatedPrompts);
    dataService.savePrompts(updatedPrompts);
    
    const restored = updatedPrompts.find(p => p.id === id);
    if (restored) {
      setCurrentPrompt(restored.prompt);
    }
    
    setMessage({ type: 'success', text: 'Versión restaurada con éxito.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    const toDelete = prompts.find(p => p.id === id);
    if (toDelete?.isActive) {
      setMessage({ type: 'error', text: 'No puedes eliminar la versión activa.' });
      return;
    }

    const updated = prompts.filter(p => p.id !== id);
    setPrompts(updated);
    dataService.savePrompts(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor de Prompt */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Save className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Editor de Prompt Maestro</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Configura la lógica de la IA</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Plantilla del Prompt (Usa placeholders como {"{{avgOccupancyCount}}"})
              </label>
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="w-full h-96 p-6 bg-gray-50 border-none rounded-2xl text-sm font-mono text-gray-700 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Escribe el prompt aquí..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción de los cambios (ej: Ajuste de tono empático)"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus size={18} />
                Guardar Versión
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Versiones */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-yellow-50 rounded-2xl">
              <History className="text-yellow-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-blue-900 uppercase tracking-tight">Historial</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Snapshots guardados</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {prompts.map((p) => (
              <div 
                key={p.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  p.isActive 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {new Date(p.timestamp).toLocaleString('es-CL')}
                    </span>
                    <h3 className="text-sm font-black text-blue-900 uppercase mt-1 leading-tight">
                      {p.descripcion}
                    </h3>
                  </div>
                  {p.isActive && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg tracking-tighter">
                      Activa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {!p.isActive && (
                    <button
                      onClick={() => handleRestore(p.id)}
                      className="flex-grow py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={12} />
                      Restaurar
                    </button>
                  )}
                  {!p.isActive && (
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptMaestro;
