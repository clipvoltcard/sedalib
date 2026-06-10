import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Search, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sliders, 
  NotebookText,
  Boxes,
  Lock,
  UserCheck
} from 'lucide-react';
import { Movimiento } from '../types';

export default function MovementsLog() {
  const [movements, setMovements] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovements = async () => {
    try {
      const response = await fetch('/api/movements');
      if (!response.ok) throw new Error('Error al sincronizar bitácora de movimientos');
      const data = await response.json();
      setMovements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter((mov) => {
    return (
      mov.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.accion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.materialAfectado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.fechaHora.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getActionIcon = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('ENTRADA')) {
      return (
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-150">
          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
        </div>
      );
    }
    if (act.includes('SALIDA') || act.includes('ELIMINACIÓN DE MATERIAL') || act.includes('RETIRO')) {
      return (
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-150">
          <ArrowDownLeft className="w-4 h-4 text-rose-600" />
        </div>
      );
    }
    if (act.includes('USUARIO') || act.includes('INICIO')) {
      return (
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-150">
          <UserCheck className="w-4 h-4 text-blue-600" />
        </div>
      );
    }
    return (
      <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-150">
        <Sliders className="w-4 h-4 text-slate-600" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="movements-view">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bitácora de Auditoría y Movimientos</h1>
        <p className="text-sm text-slate-500">Historial completo e inmutable de operaciones realizadas en el depósito logístico.</p>
      </div>

      {/* Control Search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-800 text-sm">Registro de Operaciones Recientes</h3>
        </div>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por operador, acción, equipo o fecha..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>
      </div>

      {/* Main timeline listing */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredMovements.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-slate-100 ml-4 pl-8 space-y-6">
            {filteredMovements.map((mov, index) =>  (
              <div key={mov.id || index} className="relative group animate-fade-in">
                {/* Timeline dot (Floating Icon) */}
                <div className="absolute -left-13.5 top-0.5 z-10 transition-transform duration-300 group-hover:scale-105">
                  {getActionIcon(mov.accion)}
                </div>

                {/* Card representation */}
                <div className="bg-slate-50 group-hover:bg-slate-100/50 p-4 rounded-2xl border border-slate-250 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.1 text-xxs font-semibold bg-white border text-slate-500 px-2 py-0.5 rounded-md font-mono">
                      <Users className="w-3 h-3 text-slate-400" />
                      Operario: <span className="text-slate-800 font-bold">{mov.usuario}</span>
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 mt-1 uppercase tracking-tight">
                      {mov.accion}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Elemento afectado: <span className="font-bold text-slate-700">{mov.materialAfectado}</span>
                    </p>
                  </div>

                  {/* Timestamp detail */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-500 font-mono">{mov.fechaHora}</p>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">SINC: REGISTRO LOCAL</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <NotebookText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-700">No se encontraron operaciones registradas</h4>
          <p className="text-slate-400 text-xs mt-1">Intente cambiando el término de búsqueda de auditoría.</p>
        </div>
      )}

    </div>
  );
}
