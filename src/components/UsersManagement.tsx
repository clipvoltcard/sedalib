import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  Wrench, 
  AlertCircle, 
  X, 
  Check, 
  Loader2,
  Lock,
  UserPlus
} from 'lucide-react';
import { User } from '../types';

interface UsersProps {
  currentUser: User;
}

export default function UsersManagement({ currentUser }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Inputs
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'administrador' | 'técnico'>('técnico');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Error al sincronizar lista de personal.');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNewForm = () => {
    setEditingUser(null);
    setUsername('');
    setNombre('');
    setRol('técnico');
    setEstado('activo');
    setPassword('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setNombre(u.nombre);
    setRol(u.rol);
    setEstado(u.estado);
    setPassword(''); // don't prefill password
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !nombre.trim() || (!editingUser && !password.trim())) {
      setFormError('Por favor complete todos los datos requeridos');
      return;
    }

    setActionLoading(true);
    setFormError('');

    const payload = {
      username: username.trim(),
      nombre: nombre.trim(),
      rol,
      estado,
      ...(password.trim() ? { password: password.trim() } : {}),
      operatorName: currentUser.nombre
    };

    try {
      let url = '/api/users';
      let method = 'POST';

      if (editingUser) {
        url = `/api/users/${editingUser.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error guardando el usuario');
      }

      setIsFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'Error guardando usuario.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userToDelete: User) => {
    if (userToDelete.username === 'Danae') {
      alert('La cuenta administrador principal Danae no puede ser eliminada por cuestiones de auditoría.');
      return;
    }

    if (!confirm(`¿Está seguro que desea eliminar a ${userToDelete.nombre} (${userToDelete.username}) del sistema?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userToDelete.id}?operatorName=${encodeURIComponent(currentUser.nombre)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error de eliminación');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Ocurrió un error al remover usuario.');
    }
  };

  if (currentUser.rol !== 'administrador') {
    return (
      <div className="bg-white rounded-2xl border p-12 text-center max-w-lg mx-auto my-12 shadow-sm animate-fade-in">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Acceso Denegado por Rol</h2>
        <p className="text-slate-500 text-sm mt-1">Este menú administrativo de usuarios está limitado exclusivamente a cuentas autorizadas con rol de Administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="users-view">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Administración de Usuarios y Roles</h1>
          <p className="text-sm text-slate-500">Gestione el personal operativo, asigne jerarquías (administrador o técnico) y supervise estados de acceso.</p>
        </div>
        
        <button
          onClick={openNewForm}
          className="flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
          Registrar Usuario
        </button>
      </div>

      {/* Main Table Panel */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto text-sm text-slate-600">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-3 px-6">Nombre de Cuenta (Username)</th>
                  <th className="py-3 px-6">Nombre Completo del Operario</th>
                  <th className="py-3 px-6 text-center">Rol Asignado</th>
                  <th className="py-3 px-6 text-center">Estado Operativo</th>
                  <th className="py-3 px-6 text-right">Acciones de Cuenta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {users.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-800">
                        @{u.username}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-700">
                        {u.nombre}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xxs font-bold uppercase border ${
                          u.rol === 'administrador' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {u.rol === 'administrador' ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              Administrador
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3 h-3 text-indigo-600" />
                              Técnico
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`inline-block py-1 px-2.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          u.estado === 'activo' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-850'
                        }`}>
                          {u.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditForm(u)}
                            title="Editar usuario"
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {/* Protect critical principal admin */}
                          {u.username !== 'Danae' && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Dar de baja / Eliminar"
                              className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DRAWER FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-lg">
                  {editingUser ? 'Editar Cuenta de Usuario' : 'Registrar Nuevo Miembro'}
                </h2>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Username (Id) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre de Usuario (Log In) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={editingUser?.username === 'Danae'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Ej. d_perez"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                />
                {!editingUser && <p className="text-[10px] text-slate-400 mt-1">Este identificador no puede llevar espacios.</p>}
              </div>

              {/* Nombre completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre Completo del Operario <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contraseña de Entrada {editingUser && <span className="text-slate-400 font-normal">(dejar en blanco para omitir cambio)</span>} {!editingUser && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required={!editingUser}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingUser ? "Escriba nueva clave para cambiar" : "Ingrese clave de acceso"}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Rol Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Rol y Jerarquía de Sistema <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={editingUser?.username === 'Danae'}
                    onClick={() => setRol('administrador')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 ${
                      rol === 'administrador' 
                        ? 'border-blue-500 bg-blue-50 text-blue-950 focus:ring-2 focus:ring-blue-105' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Administrador
                  </button>

                  <button
                    type="button"
                    disabled={editingUser?.username === 'Danae'}
                    onClick={() => setRol('técnico')}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 ${
                      rol === 'técnico' 
                        ? 'border-indigo-505 bg-indigo-50 text-indigo-950 focus:ring-2 focus:ring-indigo-105' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Técnico
                  </button>
                </div>
              </div>

              {/* Estado Activo / Inactivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estado de Cuenta <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={editingUser?.username === 'Danae'}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-slate-800 disabled:opacity-60 shadow-xs"
                >
                  <option value="activo">Activo (Acceso Concedido)</option>
                  <option value="inactivo">Inactivo (Suspender Acceso)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingUser ? 'Guardar Cambios' : 'Completar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
