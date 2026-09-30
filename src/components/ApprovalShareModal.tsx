import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Send, 
  ExternalLink, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  X 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { CncDailyReport } from '../types';
import { getApprovalUrl } from '../services/reportStorage';
import { GoogleDriveBackup } from './GoogleDriveBackup';

interface ApprovalShareModalProps {
  report: CncDailyReport;
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: (reportId: string, role: 'supervisor' | 'gm') => void;
  currentUser?: User | null;
  accessToken?: string | null;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
}

export const ApprovalShareModal: React.FC<ApprovalShareModalProps> = ({
  report,
  isOpen,
  onClose,
  onOpenApproval,
  currentUser = null,
  accessToken = null,
  onGoogleSignIn = async () => {},
  onGoogleSignOut = async () => {},
}) => {
  const [copiedRole, setCopiedRole] = useState<'supervisor' | 'gm' | null>(null);

  if (!isOpen) return null;

  const spvUrl = getApprovalUrl(report.supervisorToken, 'supervisor', report.id);
  const gmUrl = getApprovalUrl(report.gmToken, 'gm', report.id);

  const copyToClipboard = (text: string, role: 'supervisor' | 'gm') => {
    navigator.clipboard.writeText(text);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const getWaText = (role: 'supervisor' | 'gm') => {
    if (role === 'supervisor') {
      return encodeURIComponent(
        `Halo Pak ${report.supervisorName} (Supervisor),\n\nLaporan Harian Mesin CNC untuk project *${report.project}* (No. ${report.sasaNo}) oleh Operator *${report.operatorName}* telah diajukan dan membutuhkan persetujuan Anda.\n\nSilakan tinjau dan setujui melalui tautan resmi berikut:\n${spvUrl}`
      );
    }
    return encodeURIComponent(
      `Halo Pak ${report.gmName} (General Manager),\n\nLaporan Harian Mesin CNC untuk project *${report.project}* (No. ${report.sasaNo}) telah disetujui oleh Supervisor *${report.supervisorName}* dan kini menunggu persetujuan Final GM.\n\nSilakan tinjau melalui tautan resmi:\n${gmUrl}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                Alur Persetujuan Bertingkat (Workflow)
              </span>
              <h3 className="text-lg font-bold">Tautan Unik Persetujuan Laporan</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                SPK: {report.sasaNo} • {report.operatorName} ({report.shift})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Progress Tracker Bar */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 text-blue-600">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>1. Operator ({report.operatorName})</span>
              </div>
              <span className="text-slate-300">➔</span>
              <div className={`flex items-center gap-1.5 ${
                report.status === 'PENDING_SUPERVISOR' 
                  ? 'text-amber-600 font-bold' 
                  : report.supervisorApproval?.decision === 'APPROVED' 
                  ? 'text-emerald-600 font-bold' 
                  : 'text-slate-400'
              }`}>
                {report.supervisorApproval?.decision === 'APPROVED' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>2. SPV ({report.supervisorName})</span>
              </div>
              <span className="text-slate-300">➔</span>
              <div className={`flex items-center gap-1.5 ${
                report.status === 'PENDING_GM' 
                  ? 'text-purple-600 font-bold' 
                  : report.gmApproval?.decision === 'APPROVED' 
                  ? 'text-emerald-600 font-bold' 
                  : 'text-slate-400'
              }`}>
                {report.gmApproval?.decision === 'APPROVED' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>3. GM ({report.gmName})</span>
              </div>
            </div>
          </div>

          {/* Level 1: Supervisor Link */}
          <div className={`p-4 rounded-xl border ${
            report.status === 'PENDING_SUPERVISOR'
              ? 'border-amber-400 bg-amber-50/50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs text-slate-800">
                  Tautan Persetujuan Supervisor: {report.supervisorName} (Mulyana)
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                report.status === 'PENDING_SUPERVISOR'
                  ? 'bg-amber-100 text-amber-800'
                  : report.supervisorApproval?.decision === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {report.status === 'PENDING_SUPERVISOR'
                  ? 'Menunggu Review'
                  : report.supervisorApproval?.decision === 'APPROVED'
                  ? 'Sudah Disetujui SPV'
                  : 'Pending'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                readOnly
                value={spvUrl}
                className="w-full text-xs font-mono bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 select-all"
              />
              <button
                onClick={() => copyToClipboard(spvUrl, 'supervisor')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition flex-shrink-0"
              >
                {copiedRole === 'supervisor' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
              <button
                onClick={() => {
                  onClose();
                  onOpenApproval(report.id, 'supervisor');
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Sebagai Supervisor (Mulyana)</span>
              </button>

              <a
                href={`https://wa.me/?text=${getWaText('supervisor')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim WA</span>
              </a>
            </div>
          </div>

          {/* Level 2: GM Link */}
          <div className={`p-4 rounded-xl border ${
            report.status === 'PENDING_GM'
              ? 'border-purple-400 bg-purple-50/50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-xs text-slate-800">
                  Tautan Persetujuan GM: {report.gmName} (Arifin)
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                report.status === 'PENDING_GM'
                  ? 'bg-purple-100 text-purple-800 animate-pulse'
                  : report.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {report.status === 'PENDING_GM'
                  ? 'Menunggu Review GM'
                  : report.status === 'APPROVED'
                  ? 'Final Disetujui'
                  : 'Menunggu SPV Dulu'}
              </span>
            </div>

            {report.status === 'PENDING_SUPERVISOR' ? (
              <p className="text-xs text-slate-500 italic mt-1">
                Link GM akan aktif dan siap dikirimkan secara otomatis begitu Supervisor (Mulyana) menyetujui laporan ini.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    readOnly
                    value={gmUrl}
                    className="w-full text-xs font-mono bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(gmUrl, 'gm')}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition flex-shrink-0"
                  >
                    {copiedRole === 'gm' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApproval(report.id, 'gm');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Sebagai GM (Arifin)</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${getWaText('gm')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim WA</span>
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Google Drive Direct Backup Module */}
          <GoogleDriveBackup
            report={report}
            currentUser={currentUser}
            accessToken={accessToken}
            onLogin={onGoogleSignIn}
            onLogout={onGoogleSignOut}
          />
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Tutup Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
