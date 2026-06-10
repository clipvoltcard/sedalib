import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Calendar, 
  User, 
  Box, 
  Coins, 
  Truck, 
  BookOpen, 
  Search, 
  Loader2, 
  Check, 
  AlertCircle,
  Warehouse
} from 'lucide-react';
import { Entrada, Material, User as UserType } from '../types';

interface EntriesProps {
  currentUser: UserType;
  onDataChange?: () => void;
}

export default function EntriesManagement({ currentUser, onDataChange }: EntriesProps) {
  const [entries, setEntries] = useState<Entrada[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [materialCodigo, setMaterialCodigo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [observaciones, setObservaciones] = useState('');
  
  // Searching & feedbacks
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load everything
  const fetchData = async () => {
    try {
      const [entriesRes, materialsRes] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/materials')
      ]);

      if (!entriesRes.ok || !materialsRes.ok) {
        throw new Error('Eror al sincronizar datos del servidor.');
      }

      const entriesData = await entriesRes.json();
      const materialsData = await materialsRes.json();

      setEntries(entriesData);
      setMaterials(materialsData);

      if (materialsData.length > 0 && !materialCodigo) {
        setMaterialCodigo(materialsData[0].codigo);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!materialCodigo) {
      setFormError('Por favor seleccione un material para realizar la entrada');
      return;
    }

    const qty = Number(cantidad);
    if (isNaN(qty) || qty <= 0) {
      setFormError('La cantidad ingresada debe ser un número entero mayor a cero');
      return;
    }

    setActionLoading(true);

    const payload = {
      materialCodigo,
      cantidad: qty,
      proveedor: proveedor.trim() || 'No Especificado',
      responsable: currentUser.nombre,
      observaciones: observaciones.trim(),
      fecha
    };

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo guardar la entrada de stock.');
      }

      setFormSuccess(`¡Entrada registrada correctamente! +${qty} unidades añadidas.`);
      setCantidad('');
      setProveedor('');
      setObservaciones('');
      
      // Sincronize
      fetchData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      setFormError(err.message || 'Error en la petición de entradas.');
    } finally {
      setActionLoading(false);
    }
  };

  // Searching elements
  const filteredEntries = entries.filter((ent) => {
    return (
      ent.materialCodigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.materialNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.proveedor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.responsable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.fecha.includes(searchQuery)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="entries-view">
      
      {/* Form Area - left column */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-lg text-slate-800">Registrar Entrada de Stock</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl">
              <Check className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha de Registro
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Material Select combo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              Seleccionar Material
            </label>
            {materials.length > 0 ? (
              <select
                value={materialCodigo}
                onChange={(e) => setMaterialCodigo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-slate-700"
              >
                {materials.map((m) => (
                  <option key={m.codigo} value={m.codigo}>
                    [{m.codigo}] {m.nombre} (Stock actual: {m.stockActual})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-rose-600 font-medium">Debe registrar materiales antes de operar entradas.</p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Cantidad a Ingresar
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="Ej. 10"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Proveedor Responsable
            </label>
            <input
              type="text"
              placeholder="Ej. Importadora S.A.C."
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Responsable - Autoset */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Responsable Operativo
            </label>
            <input
              type="text"
              disabled
              value={currentUser.nombre}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Observaciones
            </label>
            <textarea
              placeholder="Guía de remisión, estado general del lote..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading || materials.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200 text-slate-950 font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            Confirmar Ingreso de Stock
          </button>
        </form>
      </div>

      {/* Grid List - right column, span 2 */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search header list */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Historial de Entradas Recientes</h3>
            <p className="text-xs text-slate-400">Total de lotes agregados al depósito.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar histórico..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* List representation */}
        {loading ? (
          <div className="flex justify-center py-12 bg-white rounded-2xl border">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : filteredEntries.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4 font-mono">Cód. Mat</th>
                    <th className="py-2.5 px-4">Nombre Material</th>
                    <th className="py-2.5 px-4 text-center">Cantidad</th>
                    <th className="py-2.5 px-4">Proveedor</th>
                    <th className="py-2.5 px-4">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredEntries.map((ent) => (
                    <tr key={ent.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{ent.fecha}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{ent.materialCodigo}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{ent.materialNombre}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="py-1 px-2.5 bg-emerald-50 text-emerald-700 rounded-lg font-bold font-mono">
                          +{ent.cantidad}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-[120px] truncate" title={ent.proveedor}>
                        {ent.proveedor}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate">{ent.responsable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
            <Warehouse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No hay entradas coincidentes</p>
            <p className="text-slate-400 text-xs mt-0.5">Realice una entrada a través del formulario de la izquierda.</p>
          </div>
        )}
      </div>

    </div>
  );
}
