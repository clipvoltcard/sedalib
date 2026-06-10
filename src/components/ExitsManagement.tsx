import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Calendar, 
  User, 
  Box, 
  Coins, 
  FileText, 
  Search, 
  Loader2, 
  Check, 
  AlertCircle,
  PackageX
} from 'lucide-react';
import { Salida, Material, User as UserType } from '../types';

interface ExitsProps {
  currentUser: UserType;
  onDataChange?: () => void;
}

export default function ExitsManagement({ currentUser, onDataChange }: ExitsProps) {
  const [exits, setExits] = useState<Salida[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [technicians, setTechnicians] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [materialCodigo, setMaterialCodigo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tecnicoSolicitante, setTecnicoSolicitante] = useState('');
  const [customTechnician, setCustomTechnician] = useState('');
  const [isCustomTech, setIsCustomTech] = useState(false);
  const [motive, setMotive] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  
  // Feedbacks
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [exitsRes, materialsRes, usersRes] = await Promise.all([
        fetch('/api/exits'),
        fetch('/api/materials'),
        fetch('/api/users')
      ]);

      if (!exitsRes.ok || !materialsRes.ok || !usersRes.ok) {
        throw new Error('Fallo la conexión con el servidor de inventario.');
      }

      const exitsData = await exitsRes.json();
      const materialsData = await materialsRes.json();
      const usersData = await usersRes.json();

      setExits(exitsData);
      setMaterials(materialsData);
      
      const techList = usersData.filter((u: UserType) => u.rol === 'técnico');
      setTechnicians(techList);

      if (materialsData.length > 0 && !materialCodigo) {
        setMaterialCodigo(materialsData[0].codigo);
      }

      if (techList.length > 0 && !tecnicoSolicitante) {
        setTecnicoSolicitante(techList[0].nombre);
      } else if (techList.length === 0) {
        setIsCustomTech(true);
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

  const selectedMaterial = materials.find((m) => m.codigo === materialCodigo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!materialCodigo) {
      setFormError('Por favor seleccione un material para realizar la salida');
      return;
    }

    const qty = Number(cantidad);
    if (isNaN(qty) || qty <= 0) {
      setFormError('La cantidad solicitada debe ser un número entero mayor a cero');
      return;
    }

    if (selectedMaterial && selectedMaterial.stockActual < qty) {
      setFormError(`Stock insuficiente. El stock disponible de este material es ${selectedMaterial.stockActual} unidades.`);
      return;
    }

    const applicant = isCustomTech ? customTechnician.trim() : tecnicoSolicitante;
    if (!applicant) {
      setFormError('Escriba o seleccione un técnico solicitante válido');
      return;
    }

    if (!motive.trim()) {
      setFormError('Escriba un motivo justificado para el retiro de material');
      return;
    }

    setActionLoading(true);

    const payload = {
      materialCodigo,
      cantidad: qty,
      tecnicoSolicitante: applicant,
      motive: motive.trim(),
      fecha,
      operatorName: currentUser.nombre
    };

    try {
      const response = await fetch('/api/exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se puede guardar el retiro de stock.');
      }

      setFormSuccess(`¡Salida autorizada y registrada del almacén! -${qty} unidades retiradas.`);
      setCantidad('');
      setMotive('');
      if (isCustomTech) setCustomTechnician('');

      fetchData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar retiro.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredExits = exits.filter((ex) => {
    return (
      ex.materialCodigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.materialNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.tecnicoSolicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.motivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.fecha.includes(searchQuery)
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="exits-view">
      
      {/* Form column - left */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <ArrowDownLeft className="w-5 h-5 text-rose-500" />
          <h2 className="font-bold text-lg text-slate-800">Registrar Salida / Retiro</h2>
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
              Fecha de Salida
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Material Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-slate-400" />
              Cargar Material Disponible
            </label>
            {materials.length > 0 ? (
              <select
                value={materialCodigo}
                onChange={(e) => setMaterialCodigo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-slate-700"
              >
                {materials.map((m) => (
                  <option key={m.codigo} value={m.codigo} disabled={m.stockActual <= 0}>
                    [{m.codigo}] {m.nombre} (Dispo: {m.stockActual} unids) {m.stockActual <= 0 ? ' - (AGOTADO)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-rose-600 font-medium">Debe registrar materiales en el catálogo primero.</p>
            )}
          </div>

          {/* Dynamic Stock Indicator Panel */}
          {selectedMaterial && (
            <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
              selectedMaterial.stockActual === 0 
                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                : selectedMaterial.stockActual < selectedMaterial.stockMinimo 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              <div>
                <p className="font-semibold">{selectedMaterial.nombre}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ubicación física / Almacén central</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg font-mono">{selectedMaterial.stockActual}</span>
                <span className="text-[10px] text-slate-400 block">Stock Actual</span>
              </div>
            </div>
          )}

          {/* Cantidad Retiro */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              Cantidad a Retirar
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="Ej. 2"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Técnico Solicitante */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Técnico Solicitante
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTech(!isCustomTech)}
                className="text-xxs text-amber-600 font-bold hover:underline cursor-pointer"
              >
                {isCustomTech ? 'Seleccionar de lista' : 'Escribir manual'}
              </button>
            </div>

            {isCustomTech ? (
              <input
                type="text"
                required
                placeholder="Nombre del técnico externo / solicitante"
                value={customTechnician}
                onChange={(e) => setCustomTechnician(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ) : technicians.length > 0 ? (
              <select
                value={tecnicoSolicitante}
                onChange={(e) => setTecnicoSolicitante(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-slate-700"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.nombre}>{t.nombre}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Nombre del técnico"
                value={customTechnician}
                onChange={(e) => {
                  setIsCustomTech(true);
                  setCustomTechnician(e.target.value);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          {/* Motivo de salida */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Motivo o Justificación del Retiro
            </label>
            <textarea
              placeholder="Ej. Reparación de tablero en subestación central, reposición equipo defectuoso..."
              required
              value={motive}
              onChange={(e) => setMotive(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading || materials.length === 0 || (selectedMaterial && selectedMaterial.stockActual <= 0)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 hover:bg-rose-600 focus:ring-4 focus:ring-rose-200 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-white font-bold" />}
            Confirmar Retiro / Salida
          </button>
        </form>
      </div>

      {/* Grid List - right columns, span 2 */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search header panel */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Historial de Salidas / Retiros</h3>
            <p className="text-xs text-slate-400">Total de consumos registrados por técnicos autorizados.</p>
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

        {/* Dynamic list */}
        {loading ? (
          <div className="flex justify-center py-12 bg-white rounded-2xl border">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : filteredExits.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead>
                  <tr className="border-b border-slate-100 font-semibold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4 font-mono">Cód. Mat</th>
                    <th className="py-2.5 px-4">Material Retirado</th>
                    <th className="py-2.5 px-4 text-center">Cantidad</th>
                    <th className="py-2.5 px-4">Técnico Solicitante</th>
                    <th className="py-2.5 px-4">Motivo / Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredExits.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{ex.fecha}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{ex.materialCodigo}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{ex.materialNombre}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="py-1 px-2.5 bg-rose-55 hover:bg-rose-100 text-rose-700 rounded-lg font-bold font-mono">
                          -{ex.cantidad}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{ex.tecnicoSolicitante}</td>
                      <td className="py-3 px-4 text-slate-500 text-xxs italic truncate max-w-[150px]" title={ex.motivo}>
                        {ex.motivo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
            <PackageX className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">No hay salidas coincidentes</p>
            <p className="text-slate-400 text-xs mt-0.5">Registre un retiro de materiales usando el formulario de la izquierda.</p>
          </div>
        )}
      </div>

    </div>
  );
}
