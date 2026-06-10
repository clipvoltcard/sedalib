import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Wrench, 
  AlertCircle, 
  X, 
  Check, 
  Filter, 
  Loader2,
  Package,
  WrenchIcon,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Material, User } from '../types';

interface MaterialsProps {
  currentUser: User;
  onDataChange?: () => void;
}

export default function MaterialsManagement({ currentUser, onDataChange }: MaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states (new / edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  // Inputs
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [stockActual, setStockActual] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(0);
  const [estadoOperativo, setEstadoOperativo] = useState<'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio'>('Operativo');
  
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('Error al cargar catálogo');
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const openNewForm = () => {
    setEditingMaterial(null);
    setCodigo('');
    setNombre('');
    setCategoria('EPP'); // default
    setDescripcion('');
    setStockActual(1);
    setStockMinimo(5);
    setEstadoOperativo('Operativo');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (mat: Material) => {
    setEditingMaterial(mat);
    setCodigo(mat.codigo);
    setNombre(mat.nombre);
    setCategoria(mat.categoria);
    setDescripcion(mat.descripcion || '');
    setStockActual(mat.stockActual);
    setStockMinimo(mat.stockMinimo);
    setEstadoOperativo(mat.estadoOperativo);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim() || !categoria.trim()) {
      setFormError('Por favor complete los campos obligatorios');
      return;
    }

    setActionLoading(true);
    setFormError('');

    const payload = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      descripcion: descripcion.trim(),
      stockActual: Number(stockActual),
      stockMinimo: Number(stockMinimo),
      estadoOperativo,
      operatorName: currentUser.nombre
    };

    try {
      let url = '/api/materials';
      let method = 'POST';

      if (editingMaterial) {
        url = `/api/materials/${editingMaterial.codigo}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error procesando solicitud');
      }

      setIsFormOpen(false);
      fetchMaterials();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar registros.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (matCodigo: string) => {
    if (!confirm(`¿Está seguro que desea eliminar el material ${matCodigo}?`)) return;

    try {
      const response = await fetch(`/api/materials/${matCodigo}?operatorName=${encodeURIComponent(currentUser.nombre)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar');
      }

      fetchMaterials();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert(err.message || 'Fallo al eliminar material.');
    }
  };

  // Filter materials based on search text and dropdown filters
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = 
      m.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === '' || m.categoria === selectedCategory;
    const matchesState = selectedState === '' || m.estadoOperativo === selectedState;

    return matchesSearch && matchesCategory && matchesState;
  });

  // Unique categories for filtering
  const categories = Array.from(new Set(materials.map((m) => m.categoria)));

  return (
    <div className="space-y-6 animate-fade-in" id="materials-view">
      {/* Header operations bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión del Catálogo de Materiales</h1>
          <p className="text-sm text-slate-500">Registre, actualice y supervise las propiedades físicas de su inventario.</p>
        </div>
        
        {/* Only administrators can add or edit materials in depth */}
        {currentUser.rol === 'administrador' ? (
          <button
            onClick={openNewForm}
            className="flex items-center justify-center gap-2 cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Registrar Nuevo Material
          </button>
        ) : (
          <div className="text-xs bg-slate-100 text-slate-500 py-1.5 px-3 rounded-lg border font-medium">
            🔒 Edición restringida para Administradores
          </div>
        )}
      </div>

      {/* Searching & Filter Rail */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
        {/* Text Search */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código, nombre, categoría, descripción..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
          />
        </div>

        {/* Category Select */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Filter className="w-3.5 h-3.5" />
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Operational State Select */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            <option value="Operativo">Operativo</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Fuera de Servicio">Fuera de Servicio</option>
          </select>
        </div>
      </div>

      {/* Main Material List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                  <th className="py-3 px-4 font-mono">Código</th>
                  <th className="py-3 px-4">Material / Insumo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-center">Unids. Stock</th>
                  <th className="py-3 px-4 text-center">Mín. Alerta</th>
                  <th className="py-3 px-4 text-center">Estado Operativo</th>
                  {currentUser.rol === 'administrador' && <th className="py-3 px-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((mat) => {
                  const underStock = mat.stockActual < mat.stockMinimo;
                  return (
                    <tr key={mat.codigo} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{mat.codigo}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{mat.nombre}</td>
                      <td className="py-3.5 px-4">
                        <span className="py-1 px-2.5 bg-slate-100 rounded-lg text-xs font-mono font-semibold text-slate-600">
                          {mat.categoria}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs max-w-xs truncate text-slate-400" title={mat.descripcion}>
                        {mat.descripcion || 'Sin descripción descriptiva.'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-mono font-bold text-sm ${underStock ? 'text-rose-600' : 'text-slate-800'}`}>
                          {mat.stockActual}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">{mat.stockMinimo}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 py-1 px-2 rounded-full text-xxs font-bold uppercase ${
                          mat.estadoOperativo === 'Operativo' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : mat.estadoOperativo === 'En Mantenimiento'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            mat.estadoOperativo === 'Operativo' 
                              ? 'bg-emerald-500' 
                              : mat.estadoOperativo === 'En Mantenimiento'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} />
                          {mat.estadoOperativo}
                        </span>
                      </td>
                      
                      {currentUser.rol === 'administrador' && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditForm(mat)}
                              title="Editar propiedades"
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mat.codigo)}
                              title="Eliminar producto"
                              className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center sm:p-12 shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">Catálogo Vacío o Filtros Excluyentes</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">No se encontraron materiales que coincidan con la búsqueda. Intente modificando los filtros del panel superior político.</p>
        </div>
      )}

      {/* FORM MODAL (Drawes for register and editing) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 text-white px-6 py-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-lg">
                  {editingMaterial ? 'Editar Material Registrado' : 'Registrar Nuevo Equipo de Inventario'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Código de Material */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Código Identificación <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMaterial}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej. INS-900"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                  />
                  {!editingMaterial && <p className="text-[10px] text-slate-400 mt-1">El código es único e inmodificable.</p>}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Categoría del Insumo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="EPP">EPP (Seguridad Personal)</option>
                    <option value="Herramientas">Herramientas Mecánica/Manual</option>
                    <option value="Eléctricos">Consumibles Eléctricos</option>
                    <option value="Ferretería">Ferretería General</option>
                    <option value="Pintura">Pintura y Recubrimientos</option>
                    <option value="Electrónicos">Componentes Electrónicos</option>
                  </select>
                </div>
              </div>

              {/* Nombre descriptivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nombre Comercial / Identificador <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Pinza crimpadora RJ45 Pro"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción del equipo / Características</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Escriba especificaciones técnicas, marcas o detalles..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stock Actual / stock inicial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock Actual <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockActual}
                    onChange={(e) => setStockActual(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Alerta de Stock Mínimo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock Mínimo (Alerta) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Estado operativo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Estado Operativo <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Operativo', 'En Mantenimiento', 'Fuera de Servicio'] as const).map((es) => (
                    <button
                      key={es}
                      type="button"
                      onClick={() => setEstadoOperativo(es)}
                      className={`py-2 px-3 border rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        estadoOperativo === es 
                          ? 'border-amber-500 bg-amber-50 text-amber-950 focus:ring-2 focus:ring-amber-300' 
                          : 'border-slate-250 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {es}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
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
                  {editingMaterial ? 'Guardar Cambios' : 'Completar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
