
import React, { useState } from 'react';
import { UserPlus, Shield, Mail, Trash2, Edit3, X, User as UserIcon, Check, ShieldAlert } from 'lucide-react';
import { User, UserRole } from '../types';
import { hashPassword } from '../utils/helpers';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onAdd: (u: User) => void;
  onUpdate: (u: User) => void;
  onDelete: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const initialForm: Partial<User> = {
    nombre: '',
    email: '',
    password: '',
    role: 'Operador',
    activo: true
  };

  const [formData, setFormData] = useState<Partial<User>>(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || (!editingUser && !formData.password)) return;

    let finalPassword = formData.password;
    if (formData.password) {
      finalPassword = await hashPassword(formData.password);
    }

    const newUser: User = {
      ...(formData as User),
      password: finalPassword,
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
    };

    if (editingUser) onUpdate(newUser);
    else onAdd(newUser);

    setShowModal(false);
    setEditingUser(null);
    setFormData(initialForm);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900">Control de Accesos</h2>
          <p className="text-xs text-gray-500 font-medium">Gestione los usuarios autorizados para acceder al sistema.</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingUser(null); setFormData(initialForm); }}
          className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-all font-bold text-sm shadow-lg shadow-blue-900/10"
        >
          <UserPlus size={18} />
          Crear Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${user.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                  {user.role === 'Admin' ? <ShieldAlert size={24} /> : <UserIcon size={24} />}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingUser(user); setFormData(user); setShowModal(true); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => { if (confirm('¿Eliminar acceso para este usuario?')) onDelete(user.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 truncate">{user.nombre}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">
                <Mail size={12} /> {user.email}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${user.role === 'Admin' ? 'bg-yellow-400 text-blue-900' : 'bg-blue-900 text-white'
                  }`}>
                  {user.role}
                </span>
                <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${user.activo ? 'text-green-600' : 'text-red-600'}`}>
                  <Check size={12} /> {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Nombre Completo</label>
                <input required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Email de Acceso</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Contraseña {editingUser && '(dejar vacío para no cambiar)'}</label>
                <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Rol Asignado</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold">
                    <option value="Admin">Administrador</option>
                    <option value="Operador">Operador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Estado</label>
                  <select value={formData.activo ? 'true' : 'false'} onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold">
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-500 text-sm">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-all font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-900/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
