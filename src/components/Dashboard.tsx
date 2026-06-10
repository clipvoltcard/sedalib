import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Layers, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  AlertTriangle, 
  PieChart as PieIcon, 
  TrendingUp,
  PackageX
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardStats {
  summary: {
    totalMateriales: number;
    stockDisponible: number;
    materialesBajoStock: number;
    entradasHoy: number;
    salidasHoy: number;
  };
  categoryStats: Array<{ name: string; stock: number }>;
  mostUsedStats: Array<{ name: string; salidas: number }>;
  bajoStockLista: Array<{ codigo: string; nombre: string; stockActual: number; stockMinimo: number; estado: string }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Error al consultar estadísticas');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
        <p className="text-slate-500 text-sm font-mono">Cargando indicadores de stock...</p>
      </div>
    );
  }

  const { summary, categoryStats, mostUsedStats, bajoStockLista } = stats || {
    summary: { totalMateriales: 0, stockDisponible: 0, materialesBajoStock: 0, entradasHoy: 0, salidasHoy: 0 },
    categoryStats: [],
    mostUsedStats: [],
    bajoStockLista: []
  };

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-view">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control General</h1>
          <p className="text-sm text-slate-500">Indicadores clave y estado del inventario para la toma de decisiones.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl font-medium text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Sincronizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Registered Materials */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Materiales</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.totalMateriales}</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Catálogo de productos</p>
          </div>
        </div>

        {/* Card 2: Stock available */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stock Físico</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.stockDisponible}</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Unidades disponibles</p>
          </div>
        </div>

        {/* Card 3: Under stock */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all flex items-center gap-4 ${summary.materialesBajoStock > 0 ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'}`}>
          <div className={`p-3.5 rounded-xl ${summary.materialesBajoStock > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bajo Stock</p>
            <h3 className={`text-2xl font-bold ${summary.materialesBajoStock > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{summary.materialesBajoStock}</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Equipos en alerta</p>
          </div>
        </div>

        {/* Card 4: Daily Entries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Entradas Hoy</p>
            <h3 className="text-2xl font-bold text-emerald-600">+{summary.entradasHoy}</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Unidades ingresadas</p>
          </div>
        </div>

        {/* Card 5: Daily Exits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Salidas Hoy</p>
            <h3 className="text-2xl font-bold text-rose-600">-{summary.salidasHoy}</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Unidades retiradas</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category breakdown (Pie Chart equivalent) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <PieIcon className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-slate-800 text-base">Distribución por Categorías (Stock total)</h4>
          </div>
          
          <div className="h-68">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="stock"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Stock Disponible']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Material Usage (Exits Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h4 className="font-bold text-slate-800 text-base">Materiales Más Utilizados (Retiros Acumulados)</h4>
          </div>
          
          <div className="h-68">
            {mostUsedStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostUsedStats}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad Retirada']} />
                  <Bar dataKey="salidas" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {mostUsedStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <p>Niguna salida registrada aún.</p>
                <p className="text-xs text-slate-400 mt-1">Registre retiros en la sección correspondiente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-rose-800 border-b border-rose-100 pb-3 font-semibold">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h4 className="font-bold text-lg">Alertas de Stock Crítico o Agotado</h4>
        </div>

        {bajoStockLista.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-50">
                  <th className="py-2.5 px-4 font-mono">Código</th>
                  <th className="py-2.5 px-4">Material</th>
                  <th className="py-2.5 px-4 text-center">Stock Actual</th>
                  <th className="py-2.5 px-4 text-center">Stock Mínimo</th>
                  <th className="py-2.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bajoStockLista.map((item) => (
                  <tr key={item.codigo} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{item.codigo}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{item.nombre}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.stockActual}</td>
                    <td className="py-2.5 px-4 text-center text-slate-400">{item.stockMinimo}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold uppercase ${
                        item.stockActual === 0 
                          ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {item.stockActual === 0 ? (
                          <>
                            <PackageX className="w-3 h-3" />
                            Agotado
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 animate-bounce" />
                            Bajo Stock
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-3 justify-center p-8 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-700">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">¡Inventario Conforme!</p>
              <p className="text-xs">Todos los materiales registrados cuentan con stock disponible superior al mínimo de seguridad.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
