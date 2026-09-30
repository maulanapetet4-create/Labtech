import React from 'react';
import { 
  FileText, 
  Layers, 
  UserCheck, 
  RotateCcw, 
  PlusCircle, 
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LabtechLogo } from './LabtechLogo';

interface HeaderNavProps {
  currentView: 'form' | 'dashboard' | 'approval' | 'print';
  onNavigate: (view: 'form' | 'dashboard' | 'approval' | 'print') => void;
  onNewReport: () => void;
  onResetData: () => void;
  currentUser: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  stats?: {
    total: number;
    pendingSupervisor: number;
    pendingGm: number;
    approved: number;
  };
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onNavigate,
  onNewReport,
  onResetData,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
  stats,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md no-print sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-700/60 flex items-center justify-center">
              <LabtechLogo size="sm" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-tight tracking-wide text-slate-100">
                  Laporan Harian Mesin CNC
                </h1>
                <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
                  PT Labtech Indonesia
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Divisi CNC Router • Database Cloud SQL PostgreSQL & Sinkronisasi Google Drive
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dashboard & Riwayat</span>
              {stats && stats.total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-slate-700 rounded-full">
                  {stats.total}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onNewReport();
                onNavigate('form');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Input Form Operator</span>
            </button>
          </nav>

          {/* User & Google Drive Auth */}
          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition shadow-xs"
                title="Hubungkan Google Drive untuk backup otomatis"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Google Drive</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate text-slate-200 hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={onGoogleSignOut}
                  className="text-slate-400 hover:text-red-400 text-[11px] ml-1"
                  title="Keluar akun Google"
                >
                  Keluar
                </button>
              </div>
            )}

            <button
              onClick={onResetData}
              title="Reset data ke contoh bawaan pabrik"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded font-medium ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            Dashboard ({stats?.total || 0})
          </button>
          <button
            onClick={() => {
              onNewReport();
              onNavigate('form');
            }}
            className={`px-3 py-1.5 rounded font-medium ${
              currentView === 'form' ? 'bg-blue-600 text-white' : 'text-slate-300'
            }`}
          >
            + Form Baru
          </button>
        </div>
      </div>
    </header>
  );
};
