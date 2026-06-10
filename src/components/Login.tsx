import React, { useState } from 'react';
import { Shield, Key, User as UserIcon, AlertCircle, Loader, Warehouse } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fallback direct-download direct drive URL of the provided logo
  const driveLogoUrl = "https://lh3.googleusercontent.com/d/19pmeBYW0l8T-MpJyHR-lXU48grWwIpxO";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden font-sans">
      {/* Background with professional overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80')` 
        }}
      />
      <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm" />

      {/* Login Box */}
      <div id="login-card" className="relative z-20 w-full max-w-md p-8 sm:p-10 mx-4 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
        
        {/* Logo and Branding Header */}
        <div className="flex flex-col items-center mb-6 w-full">
          <div className="relative flex items-center justify-center w-full h-auto max-h-24 mb-4 overflow-hidden rounded-xl bg-slate-50/5 p-1">
            {/* Try rendering the provided logo with dynamic fallback to a warehouse vector */}
            <img 
              src={driveLogoUrl} 
              alt="Logo Sedalib S.A." 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain z-10 max-h-24"
              onError={(e) => {
                // If Google Drive link fails or blocks in iframe, replace with generic professional icon
                e.currentTarget.style.display = 'none';
                const sibling = e.currentTarget.nextElementSibling;
                if (sibling) sibling.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center justify-center w-full h-16 text-amber-500 animate-pulse bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Warehouse className="w-10 h-10 mr-2" />
              <span className="font-bold text-lg font-sans">SEDALIB S.A.</span>
            </div>
          </div>
          
          <h1 id="brand-title" className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white text-center">
            SEDALIB S.A.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-mono">
            Gestión Profesional de Inventarios
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario (ej. Danae)"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 focus:ring-4 focus:ring-amber-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-5 text-xs text-slate-400 font-mono">
          © 2026 Sedalib S.A. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
