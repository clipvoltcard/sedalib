import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Boxes, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Clock, 
  FileText, 
  Users, 
  Shield, 
  Wrench,
  User as UserIcon,
  Warehouse
} from 'lucide-react';

import { User } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MaterialsManagement from './components/MaterialsManagement';
import EntriesManagement from './components/EntriesManagement';
import ExitsManagement from './components/ExitsManagement';
import StockControl from './components/StockControl';
import MovementsLog from './components/MovementsLog';
import UsersManagement from './components/UsersManagement';
import ReportsView from './components/ReportsView';

type TabType = 'dashboard' | 'materiales' | 'entradas' | 'salidas' | 'stock' | 'movimientos' | 'reportes' | 'usuarios';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stats refresh trigger for cross-component synchronizations
  const [statsReloadCount, setStatsReloadCount] = useState(0);

  // Fallback direct-download direct drive URL of the provided logo
  const driveLogoUrl = "https://lh3.googleusercontent.com/d/19pmeBYW0l8T-MpJyHR-lXU48grWwIpxO";

  // Check persistent session on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sedalib_user');
    const savedToken = localStorage.getItem('sedalib_token');
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('sedalib_user');
        localStorage.removeItem('sedalib_token');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem('sedalib_user', JSON.stringify(user));
    localStorage.setItem('sedalib_token', userToken);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('sedalib_user');
    localStorage.removeItem('sedalib_token');
    setActiveTab('dashboard');
    setMobileMenuOpen(false);
  };

  const triggerStatsRefresh = () => {
    setStatsReloadCount((prev) => prev + 1);
  };

  // Nav categories declaration
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materiales', label: 'Gestión de Materiales', icon: Boxes },
    { id: 'entradas', label: 'Registro de Entradas', icon: ArrowUpRight },
    { id: 'salidas', label: 'Registro de Salidas', icon: ArrowDownLeft },
    { id: 'stock', label: 'Control de Stock', icon: TrendingUp },
    { id: 'movimientos', label: 'Movimientos', icon: Clock },
    { id: 'reportes', label: 'Reportes', icon: FileText },
  ];

  // If not logged in, show Login view
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active view renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={statsReloadCount} />;
      case 'materiales':
        return <MaterialsManagement currentUser={currentUser} onDataChange={triggerStatsRefresh} />;
      case 'entradas':
        return <EntriesManagement currentUser={currentUser} onDataChange={triggerStatsRefresh} />;
      case 'salidas':
        return <ExitsManagement currentUser={currentUser} onDataChange={triggerStatsRefresh} />;
      case 'stock':
        return <StockControl />;
      case 'movimientos':
        return <MovementsLog />;
      case 'reportes':
        return <ReportsView />;
      case 'usuarios':
        return <UsersManagement currentUser={currentUser} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-shell">
      
      {/* Top Professional Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-950 px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburguer button toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-350 cursor-pointer"
            title="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo Brand Frame */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-8 w-auto max-w-[140px] px-2 bg-white/5 rounded-lg border border-slate-800 shadow-inner overflow-hidden shrink-0">
              <img 
                src={driveLogoUrl} 
                alt="Logo Sedalib S.A." 
                referrerPolicy="no-referrer"
                className="h-7 w-auto object-contain z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling;
                  if (sibling) sibling.classList.remove('hidden');
                }}
              />
              <div className="hidden flex items-center justify-center w-full h-full text-amber-500">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xs tracking-tight font-sans uppercase block text-slate-350">
                SEDALIB S.A.
              </span>
              <span className="text-[9px] text-slate-400 block -mt-0.5 font-mono tracking-widest font-semibold uppercase">
                Control de Inventarios
              </span>
            </div>
          </div>
        </div>

        {/* User context menu + Signout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-bold font-sans text-slate-100 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-amber-500" />
              {currentUser.nombre}
            </span>
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-semibold flex items-center gap-0.5">
              {currentUser.rol === 'administrador' ? <Shield className="w-2.5 h-2.5" /> : <Wrench className="w-2.5 h-2.5" />}
              {currentUser.rol}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-slate-800 hidden sm:block" />

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 py-1.5 px-3.5 bg-slate-850 hover:bg-rose-900 border border-slate-800 hover:border-rose-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-inner active:scale-95"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        
        {/* SIDEBAR NAVIGATION (Desktop Mode) */}
        <aside className="hidden lg:block w-64 bg-slate-900 text-slate-350 shrink-0 border-r border-slate-950 p-4 space-y-6">
          
          {/* Brand Logo and Title Header inside sidebar */}
          <div className="flex flex-col items-center pb-4 border-b border-slate-850">
            <div className="relative flex items-center justify-center w-full h-14 bg-white/5 rounded-xl border border-slate-800 shadow-inner overflow-hidden mb-2.5 px-2">
              <img 
                src={driveLogoUrl} 
                alt="Sedalib Banner" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sibling = e.currentTarget.nextElementSibling;
                  if (sibling) sibling.classList.remove('hidden');
                }}
              />
              <div className="hidden flex items-center justify-center gap-1.5 w-full h-full text-amber-500">
                <Warehouse className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-xs tracking-tight text-white">SEDALIB S.A.</span>
              </div>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-xs tracking-tight text-white uppercase block">
                SEDALIB S.A.
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold uppercase mt-0.5">
                Control de Inventario
              </span>
            </div>
          </div>

          {/* Quick Stats overview panel in sidebar */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-500 font-mono tracking-widest font-semibold uppercase">Estación de Trabajo</p>
            <h4 className="text-xs text-amber-500 font-bold mt-1 font-mono uppercase bg-amber-500/10 py-1 px-2 rounded-lg border border-amber-500/10">
              ALMACÉN CENTRAL S&I
            </h4>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-2 mb-2 font-mono">Menú Operativo</p>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'hover:bg-slate-850 hover:text-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 col`} />
                  {item.label}
                </button>
              );
            })}

            {/* Special User administration - accessible strictly for administrator roll */}
            {currentUser.rol === 'administrador' && (
              <div className="pt-4 border-t border-slate-800/60 mt-4">
                <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase px-2 mb-2 font-mono">Seguridad</p>
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`w-full flex items-center gap-3.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'usuarios'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'hover:bg-slate-850 hover:text-slate-100 text-slate-400'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  Usuarios & Roles
                </button>
              </div>
            )}
          </div>

          <div className="text-center pt-8 font-mono text-[9px] text-slate-600 block border-t border-slate-800/30">
            SINC LOCALHOST v1.0.2<br />
            SEDALIB S.A.
          </div>
        </aside>

        {/* MOBILE NAVIGATION DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 lg:hidden flex">
            {/* Backdrop shadow click to close */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer sheet content */}
            <nav className="relative w-64 bg-slate-900 text-slate-350 p-5 flex flex-col justify-between border-r border-slate-950 h-full animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 max-w-[150px] h-8 bg-white/5 rounded-lg px-2 border border-slate-800/60 overflow-hidden">
                    <img 
                      src={driveLogoUrl} 
                      alt="Sedalib Logo" 
                      referrerPolicy="no-referrer"
                      className="h-6 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling;
                        if (sibling) sibling.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden flex items-center justify-center w-full h-full text-amber-500">
                      <Warehouse className="w-4 h-4" />
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-950/40 p-2.5 rounded-xl text-xs flex items-center gap-2 mb-4 border border-slate-850">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono">Sesión: {currentUser.nombre}</span>
                </div>

                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as TabType);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeTab === item.id
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                            : 'hover:bg-slate-850 hover:text-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}

                  {currentUser.rol === 'administrador' && (
                    <button
                      onClick={() => {
                        setActiveTab('usuarios');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-t border-slate-800/60 mt-3 pt-3 ${
                        activeTab === 'usuarios'
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                          : 'hover:bg-slate-850 hover:text-slate-100 text-slate-400'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      Usuarios y Roles
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 text-center text-[10px] font-mono text-slate-550">
                Sistema de Inventario v1.0
              </div>
            </nav>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT ROUTE AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300" id="main-content-window">
          {renderTabContent()}
        </main>
      </div>

      {/* Professional subtle footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© 2026 Sedalib S.A. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <span>Licencia: Corporativa</span>
          <span>Sinc: Localhost & Cloud Run (Hosting)</span>
        </div>
      </footer>

    </div>
  );
}
