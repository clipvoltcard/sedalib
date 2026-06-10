import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Download, 
  Loader2, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  FileSpreadsheet,
  Boxes,
  Truck,
  Wrench,
  Search
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Material, Entrada, Salida } from '../types';

type ReportType = 'inventario' | 'entradas_fecha' | 'salidas_fecha' | 'mas_utilizados' | 'bajo_stock';

export default function ReportsView() {
  const [reportType, setReportType] = useState<ReportType>('inventario');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data pools
  const [materials, setMaterials] = useState<Material[]>([]);
  const [entries, setEntries] = useState<Entrada[]>([]);
  const [exits, setExits] = useState<Salida[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matRes, entRes, exitRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/entries'),
        fetch('/api/exits')
      ]);

      if (!matRes.ok || !entRes.ok || !exitRes.ok) throw new Error('Error al sincronizar datos');

      setMaterials(await matRes.json());
      setEntries(await entRes.json());
      setExits(await exitRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter processes based on current selection
  const getCompiledReportData = () => {
    switch (reportType) {
      case 'inventario':
        return materials.map((m) => ({
          Código: m.codigo,
          Material: m.nombre,
          Categoría: m.categoria,
          'Stock Actual': m.stockActual,
          'Stock Mínimo': m.stockMinimo,
          Estado: m.stockActual === 0 ? 'Agotado' : m.stockActual < m.stockMinimo ? 'Stock Bajo' : 'Disponible',
          'Estado Operativo': m.estadoOperativo,
          Descripción: m.descripcion || 'Sin descripción'
        }));

      case 'entradas_fecha':
        return entries
          .filter((e) => e.fecha >= startDate && e.fecha <= endDate)
          .map((e) => ({
            ID: e.id,
            Fecha: e.fecha,
            Código: e.materialCodigo,
            Material: e.materialNombre,
            Cantidad: e.cantidad,
            Proveedor: e.proveedor,
            Responsable: e.responsable,
            Observaciones: e.observaciones || 'Sin observaciones'
          }));

      case 'salidas_fecha':
        return exits
          .filter((s) => s.fecha >= startDate && s.fecha <= endDate)
          .map((s) => ({
            ID: s.id,
            Fecha: s.fecha,
            Código: s.materialCodigo,
            Material: s.materialNombre,
            Cantidad: s.cantidad,
            Solicitante: s.tecnicoSolicitante,
            Motivo: s.motivo
          }));

      case 'mas_utilizados':
        // Sum total exits grouped by material
        const usages: { [key: string]: { codigo: string; nombre: string; categoria: string; total: number } } = {};
        exits.forEach((s) => {
          if (!usages[s.materialCodigo]) {
            const matObj = materials.find((m) => m.codigo === s.materialCodigo);
            usages[s.materialCodigo] = {
              codigo: s.materialCodigo,
              nombre: s.materialNombre,
              categoria: matObj?.categoria || 'Desconocida',
              total: 0
            };
          }
          usages[s.materialCodigo].total += s.cantidad;
        });

        return Object.values(usages)
          .sort((a, b) => b.total - a.total)
          .map((u, index) => ({
            Posición: index + 1,
            Código: u.codigo,
            Material: u.nombre,
            Categoría: u.categoria,
            'Retiros Totales': u.total
          }));

      case 'bajo_stock':
        return materials
          .filter((m) => m.stockActual < m.stockMinimo)
          .map((m) => ({
            Código: m.codigo,
            Material: m.nombre,
            Categoría: m.categoria,
            'Stock Actual': m.stockActual,
            'Stock Mínimo': m.stockMinimo,
            Faltante: Math.max(0, m.stockMinimo - m.stockActual),
            'Estado Operativo': m.estadoOperativo
          }));

      default:
        return [];
    }
  };

  const reportData = getCompiledReportData();

  // Export to EXCEL
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      alert('No hay información disponible para exportar.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    
    // Fit sheet columns
    const maxKeys = Object.keys(reportData[0]);
    ws['!cols'] = maxKeys.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    
    const fileTitle = `Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileTitle);
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (reportData.length === 0) {
      alert('No hay información disponible para exportar.');
      return;
    }

    const doc = new jsPDF();
    const todayStr = new Date().toLocaleDateString('es-ES');

    // Title and Corporate Header
    doc.setFillColor(15, 23, 42); // slate-900 background color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('SEDALIB S.A.', 15, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Sistema Profesional de Inventarios y Gestión Logística', 15, 25);
    doc.text(`Fecha de Emisión: ${todayStr} - Sincronizado local`, 15, 32);

    // Document Subtitle
    doc.setTextColor(15, 23, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    
    let subtitle = '';
    if (reportType === 'inventario') subtitle = 'REPORTE DE INVENTARIO GENERAL COMPLETO';
    if (reportType === 'entradas_fecha') subtitle = `REPORTE DE ENTRADAS DEL ${startDate} AL ${endDate}`;
    if (reportType === 'salidas_fecha') subtitle = `REPORTE DE SALIDAS DEL ${startDate} AL ${endDate}`;
    if (reportType === 'mas_utilizados') subtitle = 'REPORTE DE MATERIALES MÁS UTILIZADOS (TOP RETIROS)';
    if (reportType === 'bajo_stock') subtitle = 'REPORTE DE ALERTAS DE BAJO STOCK / REAPROVISIONAMIENTO';

    doc.text(subtitle, 15, 52);

    // Draw simple column header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 58, 180, 8, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const columns = Object.keys(reportData[0]).slice(0, 5); // limit columns on fits
    let colWidths = [25, 65, 35, 25, 30]; // fit sizing for 180mm content area

    // Draw headers
    let xOffset = 15;
    columns.forEach((col, i) => {
      doc.text(col, xOffset + 2, 63);
      xOffset += colWidths[i];
    });

    // Draw rows
    let yOffset = 72;
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    reportData.forEach((row: any, rowIndex) => {
      // Create new page if overflows sheet limit
      if (yOffset > 275) {
        doc.addPage();
        yOffset = 20;
        // header
        doc.setFillColor(241, 245, 249);
        doc.rect(15, yOffset - 5, 180, 8, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        let xOffTmp = 15;
        columns.forEach((col, i) => {
          doc.text(col, xOffTmp + 2, yOffset);
          xOffTmp += colWidths[i];
        });
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        yOffset += 8;
      }

      // Draw light horizon boundaries dividing rows
      doc.setDrawColor(241, 245, 249);
      doc.line(15, yOffset - 4, 195, yOffset - 4);

      xOffset = 15;
      columns.forEach((col, i) => {
        const value = String(row[col] ?? '');
        const truncated = value.length > 32 ? value.substring(0, 30) + '..' : value;
        doc.text(truncated, xOffset + 2, yOffset);
        xOffset += colWidths[i];
      });

      yOffset += 8;
    });

    // Draw total summary line
    doc.setDrawColor(15, 23, 42);
    doc.line(15, yOffset - 2, 195, yOffset - 2);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Total registros emitidos: ${reportData.length}`, 15, yOffset + 4);

    const fileTitle = `Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileTitle);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="reports-view">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Centro Analítico de Reportes</h1>
          <p className="text-sm text-slate-500">Exporte los estados y movimientos consolidados en formato PDF certificado o Microsoft Excel.</p>
        </div>
      </div>

      {/* Inputs Configuration Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Report type selector */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Seleccione Tipo de Reporte</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'inventario', label: 'Inventario General', icon: Boxes },
              { id: 'entradas_fecha', label: 'Entradas por Fechas', icon: Truck },
              { id: 'salidas_fecha', label: 'Salidas por Fechas', icon: Wrench },
              { id: 'mas_utilizados', label: 'Materiales TOP Utilidades', icon: TrendingUp },
              { id: 'bajo_stock', label: 'Bajo Stock / Replenish', icon: AlertTriangle }
            ].map((rep) => {
              const Icon = rep.icon;
              return (
                <button
                  key={rep.id}
                  onClick={() => setReportType(rep.id as any)}
                  className={`flex items-center gap-2.5 py-2.5 px-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                    reportType === rep.id 
                      ? 'border-slate-800 bg-slate-905 bg-slate-900 text-white shadow-md' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {rep.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Date filters (Only relevant for entries_fecha / exits_fecha) */}
        <div className={`space-y-3 lg:col-span-2 transition-opacity duration-300 ${['entradas_fecha', 'salidas_fecha'].includes(reportType) ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Rango de Filtro de Fechas</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Desde:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Hasta:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          {['entradas_fecha', 'salidas_fecha'].includes(reportType) && (
            <p className="text-[10px] text-teal-600 font-medium">※ Filtrando las operaciones registradas entre estas fechas seleccionadas.</p>
          )}
        </div>
      </div>

      {/* Actions and Dynamic preview */}
      <div className="space-y-4">
        
        {/* Export triggers button row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Controles de Descarga y Impresión</h3>
            <p className="text-xxs text-slate-500 mt-0.5">Se encontraron <span className="font-bold font-mono text-slate-800">{reportData.length}</span> registros listos para transferir.</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* PDF export */}
            <button
              onClick={handleExportPDF}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-1.5 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <FileText className="w-4 h-4" />
              Descargar PDF
            </button>

            {/* Excel export */}
            <button
              onClick={handleExportExcel}
              disabled={loading || reportData.length === 0}
              className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Descargar Excel
            </button>
          </div>
        </div>

        {/* Dynamic HTML Table Preview */}
        {loading ? (
          <div className="flex justify-center p-12 bg-white rounded-2xl border">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : reportData.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-light flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Previsualización del Reporte</span>
              <span className="text-xxs text-slate-400 italic">※ Mostrando hasta un máximo de 20 filas en previsualización de pantalla</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                    {Object.keys(reportData[0]).slice(0, 6).map((key) => (
                      <th key={key} className="py-2.5 px-4">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 text-slate-600">
                  {reportData.slice(0, 20).map((row: any, i) => (
                    <tr key={i} className="hover:bg-slate-50/30">
                      {Object.keys(row).slice(0, 6).map((key) => (
                        <td key={key} className="py-2.5 px-4 font-medium font-sans">
                          {typeof row[key] === 'number' ? (
                            <span className="font-mono font-bold text-slate-800">{row[key]}</span>
                          ) : (
                            String(row[key])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-xs">
            <Activity className="w-10 h-10 text-slate-350 text-slate-300 mx-auto mb-2 animate-pulse" />
            <p className="font-bold text-slate-600">No hay información que cumpla la especificación</p>
            <p className="text-slate-400 text-xs mt-0.5">Revise las fechas del filtro superior para reactivar la detección.</p>
          </div>
        )}
      </div>

    </div>
  );
}
