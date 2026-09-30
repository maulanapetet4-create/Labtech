import React, { useState } from 'react';
import { Cloud, Check, Loader2, ExternalLink, HardDrive, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';
import { CncDailyReport } from '../types';
import { uploadReportToGoogleDrive } from '../services/googleDriveService';

interface GoogleDriveBackupProps {
  report: CncDailyReport;
  currentUser: User | null;
  accessToken: string | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const GoogleDriveBackup: React.FC<GoogleDriveBackupProps> = ({
  report,
  currentUser,
  accessToken,
  onLogin,
  onLogout,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!accessToken) {
      try {
        await onLogin();
      } catch (err: any) {
        setErrorMsg('Silakan login Google Drive terlebih dahulu.');
        return;
      }
    }

    if (!accessToken) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await uploadReportToGoogleDrive(report, accessToken);
      setSuccessMsg(`Tersimpan di Google Drive: Folder "Laporan CNC PT Labtech"`);
      if (res.webViewLink) {
        setDriveLink(res.webViewLink);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal mengunggah ke Google Drive');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-white shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">Google Drive Backup</h4>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                Cloud Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser
                ? `Terhubung: ${currentUser.email || currentUser.displayName}`
                : 'Simpan arsip laporan ini secara otomatis ke Google Drive Anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!currentUser ? (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition shadow-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Hubungkan Akun Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Upload ke Google Drive</span>
                  </>
                )}
              </button>

              <button
                onClick={onLogout}
                title="Keluar Google"
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mt-3 p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          {driveLink && (
            <a
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
            >
              <span>Buka di Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs text-red-300">
          {errorMsg}
        </div>
      )}
    </div>
  );
};
