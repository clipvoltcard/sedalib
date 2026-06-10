import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  FolderMinus, 
  Filter,
  Boxes,
  PackageCheck,
  PackageOpen
} from 'lucide-react';
import { Material } from '../types';

export default function StockControl() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'disponible' | 'bajo' | 'agotado'>('todos');

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) throw new Error('Error al conectar con servidor de inventario');
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

  const getStockStatus = (actual: number, minimo: number): 'disponible' | 'bajo' | 'agotado' => {
    if (actual === 0) return 'agotado';
    if (actual < minimo) return 'bajo';
    return 'disponible';
  };

  // Filter Logic
  const filteredMaterials = materials.filter((m) => {
    const status = getStockStatus(m.stockActual, m.stockMinimo);
    
    const matchesSearch = 
      m.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.categoria.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'todos' ||
      (statusFilter === 'disponible' && status === 'disponible') ||
      (statusFilter === 'bajo' && status === 'bajo') ||
      (statusFilter === 'agotado' && status === 'agotado');

    return matchesSearch && matchesStatus;
  });

  // Aggregated Counts for upper buttons
  const availableCount = materials.filter((m) => getStockStatus(m.stockActual, m.stockMinimo) === 'disponible').length;
  const lowCount = materials.filter((m) => getStockStatus(m.stockActual, m.stockMinimo) === 'bajo').length;
  const exhaustedCount = materials.filter((m) => getStockStatus(m.stockActual, m.stockMinimo) === 'agotado').length;

  return (
    <div className="space-y-6 animate-fade-in" id="stock-control-view">
      
      {/* Upper header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Control de Stock en Tiempo Real</h1>
        <p className="text-sm text-slate-500">Supervise de forma analítica el reabastecimiento y el nivel de seguridad de cada insumo.</p>
      </div>

      {/* Quick Status Filters Cards Row (Filter Tabs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* All tab */}
        <button
          onClick={() => setStatusFilter('todos')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            statusFilter === 'todos' 
              ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <Boxes className={`w-5 h-5 mb-2 ${statusFilter === 'todos' ? 'text-amber-400' : 'text-slate-400'}`} />
          <h4 className="text-xs font-semibold uppercase tracking-wider">Unidades Totales</h4>
          <p className="text-xl font-bold">{materials.length}</p>
        </button>

        {/* Disponible tab */}
        <button
          onClick={() => setStatusFilter('disponible')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            statusFilter === 'disponible' 
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <CheckCircle className={`w-5 h-5 mb-2 ${statusFilter === 'disponible' ? 'text-emerald-25' : 'text-emerald-500'}`} />
          <h4 className="text-xs font-semibold uppercase tracking-wider">Disponible</h4>
          <p className="text-xl font-bold">{availableCount}</p>
        </button>

        {/* Bajo Stock tab */}
        <button
          onClick={() => setStatusFilter('bajo')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            statusFilter === 'bajo' 
              ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 mb-2 ${statusFilter === 'bajo' ? 'text-amber-950' : 'text-amber-500'}`} />
          <h4 className="text-xs font-semibold uppercase tracking-wider">Stock Bajo</h4>
          <p className="text-xl font-bold">{lowCount}</p>
        </button>

        {/* Agotado tab */}
        <button
          onClick={() => setStatusFilter('agotado')}
          className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
            statusFilter === 'agotado' 
              ? 'bg-rose-600 border-rose-600 text-white shadow-md' 
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 mb-2 ${statusFilter === 'agotado' ? 'text-rose-25' : 'text-rose-500'}`} />
          <h4 className="text-xs font-semibold uppercase tracking-wider">Agotado</h4>
          <p className="text-xl font-bold">{exhaustedCount}</p>
        </button>
      </div>

      {/* Live search input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
        <span className="absolute inset-y-0 left-0 pl-7 flex items-center text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar material por código, nombre o categoría en control de stock..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-sans"
        />
      </div>

      {/* Grid of Products Stocks */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((m) => {
            const status = getStockStatus(m.stockActual, m.stockMinimo);
            
            // Progress percentage for safety
            const percentage = m.stockMinimo > 0 ? Math.min(100, (m.stockActual / m.stockMinimo) * 100) : 100;

            return (
              <div 
                key={m.codigo} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all active:scale-[0.99]"
              >
                {/* Upper card header color indicator */}
                <div className={`h-1.5 ${
                  status === 'agotado' 
                    ? 'bg-rose-500' 
                    : status === 'bajo' 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-500'
                }`} />

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Row Code + Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-600 py-1 px-2.5 rounded-lg border">
                      {m.codigo}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xxs font-bold uppercase ${
                      status === 'agotado' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : status === 'bajo' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-emerald-55 text-emerald-700 border border-emerald-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        status === 'agotado' 
                          ? 'bg-rose-500' 
                          : status === 'bajo' 
                          ? 'bg-amber-55' 
                          : 'bg-emerald-500'
                      }`} />
                      {status === 'agotado' ? 'Agotado' : status === 'bajo' ? 'Stock Bajo' : 'Disponible'}
                    </span>
                  </div>

                  {/* Name + Cat */}
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1">{m.nombre}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">{m.categoria}</p>
                  </div>

                  {/* Stock Metrics Numbers comparison */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-center">
                    <div>
                      <p className="text-xxs uppercase tracking-wider text-slate-400 font-semibold">Stock Actual</p>
                      <p className={`text-2xl font-bold font-mono mt-0.5 ${
                        status === 'agotado' 
                          ? 'text-rose-600' 
                          : status === 'bajo' 
                          ? 'text-amber-600 font-black' 
                          : 'text-slate-800'
                      }`}>{m.stockActual}</p>
                    </div>
                    <div>
                      <p className="text-xxs uppercase tracking-wider text-slate-400 font-semibold">Mínimo Alerta</p>
                      <p className="text-xl font-bold font-mono text-slate-400 mt-1">{m.stockMinimo}</p>
                    </div>
                  </div>

                  {/* Gauge bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Medidor de Seguridad:</span>
                      <span className={`font-semibold font-mono ${
                        percentage === 0 
                          ? 'text-rose-600' 
                          : percentage < 100 
                          ? 'text-amber-600' 
                          : 'text-emerald-600'
                      }`}>
                        {status === 'agotado' ? '0% Crítico' : `${percentage.toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === 'agotado' 
                            ? 'w-0' 
                            : status === 'bajo' 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer operational detail */}
                <div className="bg-slate-50 border-t border-slate-150 py-2.5 px-5 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>ESTADO DE OPERACION:</span>
                  <span className={`font-bold uppercase ${
                    m.estadoOperativo === 'Operativo' 
                      ? 'text-emerald-600' 
                      : m.estadoOperativo === 'En Mantenimiento'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>{m.estadoOperativo}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <FolderMinus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-705 text-lg">No hay productos en esta alerta</h4>
          <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Pruebe seleccionando "Unidades Totales" para remover el filtro de stock.</p>
        </div>
      )}
    </div>
  );
}
