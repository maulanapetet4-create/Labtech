import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  Printer, 
  ArrowLeft, 
  Share2, 
  Send, 
  FileText, 
  AlertTriangle,
  Layers,
  Ruler,
  Wrench,
  Cpu,
  History,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import { CncDailyReport } from '../types';
import { processSupervisorApproval, processGmApproval, getApprovalUrl } from '../services/reportStorage';

interface ApprovalViewProps {
  report: CncDailyReport;
  role: 'supervisor' | 'gm';
  onUpdateReport: (updated: CncDailyReport) => void;
  onNavigateDashboard: () => void;
  onNavigatePrint: (report: CncDailyReport) => void;
  onOpenShareModal: (report: CncDailyReport) => void;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({
  report,
  role,
  onUpdateReport,
  onNavigateDashboard,
  onNavigatePrint,
  onOpenShareModal,
}) => {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const approverTitle = role === 'supervisor' 
    ? `Supervisor: ${report.supervisorName} (Mulyana)` 
    : `General Manager: ${report.gmName} (Arifin)`;

  const isSupervisorTurn = role === 'supervisor' && report.status === 'PENDING_SUPERVISOR';
  const isGmTurn = role === 'gm' && report.status === 'PENDING_GM';
  const canTakeAction = isSupervisorTurn || isGmTurn;

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let updated: CncDailyReport;
      if (role === 'supervisor') {
        updated = processSupervisorApproval(
          report.id, 
          decision, 
          notes || (decision === 'APPROVED' ? 'Hasil potong rapi dan dimensi sesuai toleransi gambar kerja.' : 'Mohon periksa kembali data sheet.'),
          report.supervisorName
        );
        setFeedbackSuccess(
          decision === 'APPROVED'
            ? 'Laporan berhasil disetujui! Status kini beralih ke: Menunggu GM (Arifin).'
            : 'Laporan ditolak dan dikembalikan untuk revisi Operator.'
        );
      } else {
        updated = processGmApproval(
          report.id, 
          decision, 
          notes || (decision === 'APPROVED' ? 'Disetujui. Lanjutkan produksi.' : 'Mohon tinjau ulang efisiensi waktu.'),
          report.gmName
        );
        setFeedbackSuccess(
          decision === 'APPROVED'
            ? 'Laporan resmi disetujui final oleh GM Arifin! Dokumen siap dicetak.'
            : 'Laporan ditolak oleh GM.'
        );
      }

      onUpdateReport(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses persetujuan');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculations for summary stats
  const totalQuickComps = report.sectionB_Quick.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 
    0
  );
  const totalTekmaComps = report.sectionC_Tekma.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onNavigateDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Riwayat</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenShareModal(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Lihat Tautan Approval</span>
          </button>

          <button
            onClick={() => onNavigatePrint(report)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Role Banner */}
      <div className={`p-5 rounded-2xl border text-white shadow-md ${
        role === 'supervisor'
          ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 border-amber-600'
          : 'bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 border-purple-500'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white">
              {role === 'supervisor' ? <UserCheck className="w-6 h-6 text-amber-300" /> : <ShieldCheck className="w-6 h-6 text-purple-300" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  {role === 'supervisor' ? 'Level 1: Persetujuan Supervisor' : 'Level 2: Persetujuan GM'}
                </span>
                <span className="text-xs text-white/80 font-mono">ID: {report.id}</span>
              </div>
              <h2 className="text-xl font-bold mt-0.5">{approverTitle}</h2>
              <p className="text-xs text-white/80">
                Silakan periksa lembar kerja mesin CNC, volume oli, pergantian pisau, dan pemakaian material berikut.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-white/70">Status Laporan Saat Ini</div>
              <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                {report.status === 'APPROVED' ? 'Selesai / Approved' :
                 report.status === 'PENDING_SUPERVISOR' ? 'Menunggu Supervisor (Mulyana)' :
                 report.status === 'PENDING_GM' ? 'Menunggu GM (Arifin)' :
                 report.status === 'REJECTED' ? 'Ditolak / Perlu Revisi' : 'Draft'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start justify-between gap-3 text-emerald-800 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Persetujuan Berhasil Disimpan!</h4>
              <p className="text-xs mt-0.5">{feedbackSuccess}</p>
            </div>
          </div>

          {report.status === 'APPROVED' && (
            <button
              onClick={() => onNavigatePrint(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Formulir PDF Sekarang</span>
            </button>
          )}

          {report.status === 'PENDING_GM' && role === 'supervisor' && (
            <button
              onClick={() => onOpenShareModal(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Link ke GM (Arifin)</span>
            </button>
          )}
        </div>
      )}

      {/* APPROVAL ACTION BOX (If eligible) */}
      {canTakeAction ? (
        <div className="bg-white rounded-xl shadow-md border-2 border-blue-500 overflow-hidden">
          <div className="bg-blue-600 text-white px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Panel Keputusan Persetujuan: {role === 'supervisor' ? 'Mulyana (Supervisor)' : 'Arifin (GM)'}</span>
            </div>
            <span className="text-xs bg-blue-700 px-2.5 py-0.5 rounded font-medium">Tindakan Diperlukan</span>
          </div>

          <form onSubmit={handleDecisionSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Keputusan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  decision === 'APPROVED'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={() => setDecision('APPROVED')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Setujui (Approve)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {role === 'supervisor'
                        ? 'Data valid, teruskan ke General Manager (Arifin).'
                        : 'Sahkan laporan harian sebagai dokumen final.'}
                    </p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  decision === 'REJECTED'
                    ? 'border-red-500 bg-red-50/70 text-red-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    onChange={() => setDecision('REJECTED')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold text-sm flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Tolak / Perlu Revisi (Reject)</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Kembalikan ke Operator dengan catatan perbaikan.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Evaluasi {role === 'supervisor' ? 'Supervisor' : 'General Manager'}:
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={decision === 'APPROVED' ? 'Contoh: Dimensi sesuai toleransi gambar kerja, sisa material balance.' : 'Tuliskan poin yang perlu direvisi operator...'}
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="submit"
                disabled={isProcessing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {decision === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>
                  {isProcessing ? 'Memproses...' : decision === 'APPROVED' ? 'Konfirmasi & Setujui' : 'Kirim Penolakan'}
                </span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {report.status === 'APPROVED'
                ? 'Laporan ini telah disetujui penuh oleh Supervisor dan General Manager.'
                : report.status === 'PENDING_GM' && role === 'supervisor'
                ? 'Laporan telah disetujui oleh Supervisor dan saat ini sedang menunggu persetujuan General Manager (Arifin).'
                : report.status === 'PENDING_SUPERVISOR' && role === 'gm'
                ? 'Laporan masih dalam antrean review Supervisor Mulyana sebelum diteruskan ke GM.'
                : 'Laporan ini tidak dalam giliran persetujuan Anda.'}
            </span>
          </div>

          {report.status === 'APPROVED' && (
            <button
              onClick={() => onNavigatePrint(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Hasil Final</span>
            </button>
          )}
        </div>
      )}

      {/* ===================== SUMMARY PREVIEW OF ENTIRE PHYSICAL FORM ===================== */}

      {/* HEADER SUMMARY */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Informasi Dasar Laporan</span>
          <span>SPK: {report.sasaNo}</span>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Operator</span>
            <span className="font-bold text-slate-800">{report.operatorName}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Shift</span>
            <span className="font-bold text-slate-800">{report.shift}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Hari & Tanggal</span>
            <span className="font-semibold text-slate-800">{report.dayAndDate}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 text-[10px] block">Jam Kerja</span>
            <span className="font-semibold text-slate-800">{report.workStartTime} - {report.workEndTime}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 col-span-2">
            <span className="text-slate-400 text-[10px] block">Project</span>
            <span className="font-bold text-blue-700">{report.project}</span>
          </div>
        </div>
      </div>

      {/* BAGIAN A: PERAWATAN MESIN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bagian A: Perawatan Mesin (Oli & Mata Pisau)</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">Volume Pengisian Oli</span>
            <span className="text-base font-bold text-slate-800">{report.sectionA.oilFillVolumeMl || 0} mL</span>
          </div>
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <span className="text-slate-500 text-[11px] block">Level Oli</span>
            <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs mt-1 ${
              report.sectionA.oilLevel === 'Normal' ? 'bg-emerald-100 text-emerald-800' :
              report.sectionA.oilLevel === 'Rendah' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {report.sectionA.oilLevel}
            </span>
          </div>
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50 col-span-2">
            <span className="text-slate-500 text-[11px] block mb-1">Pergantian Mata Pisau:</span>
            <div className="space-y-1 text-[11px]">
              <div>• Vcut: {report.sectionA.bladeChanges.vcut.replaced ? `Ganti (${report.sectionA.bladeChanges.vcut.changeDate}) - ${report.sectionA.bladeChanges.vcut.toolCondition || '-'}` : 'Tidak diganti'}</div>
              <div>• End Mill 3mm: {report.sectionA.bladeChanges.endmill3mm.replaced ? `Ganti (${report.sectionA.bladeChanges.endmill3mm.changeDate})` : 'Kondisi baik'}</div>
              <div>• End Mill 6mm: {report.sectionA.bladeChanges.endmill6mm.replaced ? `Ganti (${report.sectionA.bladeChanges.endmill6mm.changeDate})` : 'Kondisi baik'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN B: MESIN CNC QUICK (PUTIH) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-700 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-yellow-300" />
            <span>Bagian B: Mesin CNC Quick (Putih) - Sheet 1 s/d 6</span>
          </div>
          <span className="text-[11px] text-slate-300 font-normal">Total Komponen: {totalQuickComps} pcs</span>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold">
                <th className="p-1.5 border border-slate-200 text-center w-12">Sheet</th>
                <th className="p-1.5 border border-slate-200">Nama Produk</th>
                <th className="p-1.5 border border-slate-200">Material</th>
                <th className="p-1.5 border border-slate-200 text-center">Waktu Proses</th>
                <th className="p-1.5 border border-slate-200 text-center">Setup</th>
                <th className="p-1.5 border border-slate-200 text-center">Inspeksi</th>
                <th className="p-1.5 border border-slate-200">Delay & Alasan</th>
                <th className="p-1.5 border border-slate-200 text-center">Total Komp.</th>
                <th className="p-1.5 border border-slate-200 text-center">Jenis Potong</th>
                <th className="p-1.5 border border-slate-200 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionB_Quick.map((s) => (
                <tr key={s.sheetNumber} className="border-b border-slate-200">
                  <td className="p-1.5 border border-slate-200 text-center font-bold bg-slate-50">#{s.sheetNumber}</td>
                  <td className="p-1.5 border border-slate-200">{s.productName || '-'}</td>
                  <td className="p-1.5 border border-slate-200">{s.materialType || '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.processTime ? `${s.processTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.setupTime ? `${s.setupTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.inspectionTime ? `${s.inspectionTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200">
                    {s.delayTime ? `${s.delayTime}m (${s.delayReason || '-'})` : '-'}
                  </td>
                  <td className="p-1.5 border border-slate-200 text-center font-bold">{s.totalComponents || '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.cutType}</td>
                  <td className="p-1.5 border border-slate-200 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      s.quality === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {s.quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAGIAN C: MESIN CNC TEKMA (BIRU) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-300" />
            <span>Bagian C: Mesin CNC Tekma (Biru) - Sheet 1 s/d 6</span>
          </div>
          <span className="text-[11px] text-blue-200 font-normal">Total Komponen: {totalTekmaComps} pcs</span>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-950 font-semibold">
                <th className="p-1.5 border border-slate-200 text-center w-12">Sheet</th>
                <th className="p-1.5 border border-slate-200">Nama Produk</th>
                <th className="p-1.5 border border-slate-200">Material</th>
                <th className="p-1.5 border border-slate-200 text-center">Waktu Proses</th>
                <th className="p-1.5 border border-slate-200 text-center">Setup</th>
                <th className="p-1.5 border border-slate-200 text-center">Inspeksi</th>
                <th className="p-1.5 border border-slate-200">Delay & Alasan</th>
                <th className="p-1.5 border border-slate-200 text-center">Total Komp.</th>
                <th className="p-1.5 border border-slate-200 text-center">Jenis Potong</th>
                <th className="p-1.5 border border-slate-200 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionC_Tekma.map((s) => (
                <tr key={s.sheetNumber} className="border-b border-slate-200">
                  <td className="p-1.5 border border-slate-200 text-center font-bold bg-blue-50 text-blue-900">#{s.sheetNumber}</td>
                  <td className="p-1.5 border border-slate-200">{s.productName || '-'}</td>
                  <td className="p-1.5 border border-slate-200">{s.materialType || '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.processTime ? `${s.processTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.setupTime ? `${s.setupTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.inspectionTime ? `${s.inspectionTime} m` : '-'}</td>
                  <td className="p-1.5 border border-slate-200">
                    {s.delayTime ? `${s.delayTime}m (${s.delayReason || '-'})` : '-'}
                  </td>
                  <td className="p-1.5 border border-slate-200 text-center font-bold">{s.totalComponents || '-'}</td>
                  <td className="p-1.5 border border-slate-200 text-center">{s.cutType}</td>
                  <td className="p-1.5 border border-slate-200 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      s.quality === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {s.quality}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BAGIAN D & E (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bagian D: Material */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bagian D: Pemakaian & Sisa Material</span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">PP 6mm:</span>
              <span>{report.sectionD.ppG4mm.lembar || 0} Lembar | Sisa: {report.sectionD.ppG4mm.sisa || '-'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">PP 8mm:</span>
              <span>{report.sectionD.pp8mm.lembar || 0} Lembar | Sisa: {report.sectionD.pp8mm.sisa || '-'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800">PP 10mm:</span>
              <span>{report.sectionD.ppF10mm.lembar || 0} Lembar | Sisa: {report.sectionD.ppF10mm.sisa || '-'}</span>
            </div>
            {report.sectionD.otherMaterials.map((m) => (
              <div key={m.id} className="flex justify-between p-2 rounded bg-blue-50 border border-blue-200">
                <span className="font-semibold text-blue-900">{m.name || 'Lain-lain'}:</span>
                <span>{m.lembar || 0} Lembar | Sisa: {m.sisa || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian E: Dimensi Hasil Potong */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>Bagian E: Dimensi Hasil Potong (P x L x T)</span>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-1 border border-slate-200 text-center">Sheet</th>
                  <th className="p-1 border border-slate-200 text-center">Panjang (mm)</th>
                  <th className="p-1 border border-slate-200 text-center">Lebar (mm)</th>
                  <th className="p-1 border border-slate-200 text-center">Tebal (mm)</th>
                  <th className="p-1 border border-slate-200">Toleransi</th>
                </tr>
              </thead>
              <tbody>
                {report.sectionE.map((d) => (
                  <tr key={d.sheetNumber}>
                    <td className="p-1 border border-slate-200 text-center font-semibold">Sheet {d.sheetNumber}</td>
                    <td className="p-1 border border-slate-200 text-center">{d.lengthMm || '-'}</td>
                    <td className="p-1 border border-slate-200 text-center">{d.widthMm || '-'}</td>
                    <td className="p-1 border border-slate-200 text-center">{d.thicknessMm || '-'}</td>
                    <td className="p-1 border border-slate-200 text-slate-500">{d.toleranceNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BAGIAN F: CATATAN OPERASIONAL */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
          Bagian F: Catatan & Laporan Operasional
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Pekerjaan Lainnya:</span>
            <p className="text-slate-600 italic">{report.sectionF.otherWork || 'Tidak ada catatan.'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Pesan / Informasi:</span>
            <p className="text-slate-600 italic">{report.sectionF.messageOrInfo || 'Tidak ada pesan khusus.'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Kendala yang Dihadapi:</span>
            <p className="text-slate-600 italic">{report.sectionF.issues || 'Nihil / Lancar.'}</p>
          </div>
        </div>
      </div>

      {/* AUDIT TIMELINE & CAP PERSETUJUAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Riwayat & Stempel Verifikasi Digital
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Operator Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Operator Pengaju</span>
              <div className="my-3 font-mono font-bold text-slate-800 text-sm">{report.operatorName}</div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-2">
              Status: Diajukan ({new Date(report.createdAt).toLocaleDateString('id-ID')})
            </div>
          </div>

          {/* Supervisor Box */}
          <div className={`border rounded-xl p-4 text-center flex flex-col justify-between ${
            report.supervisorApproval?.decision === 'APPROVED'
              ? 'border-emerald-300 bg-emerald-50/50'
              : report.supervisorApproval?.decision === 'REJECTED'
              ? 'border-red-300 bg-red-50/50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Supervisor: {report.supervisorName} (Mulyana)
              </span>
              <div className="my-2">
                {report.supervisorApproval ? (
                  <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                    report.supervisorApproval.decision === 'APPROVED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {report.supervisorApproval.decision === 'APPROVED' ? 'APPROVED (SPV)' : 'REJECTED'}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium italic">Menunggu Persetujuan</span>
                )}
              </div>
              {report.supervisorApproval?.notes && (
                <p className="text-[11px] text-slate-600 italic">"{report.supervisorApproval.notes}"</p>
              )}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-2">
              {report.supervisorApproval?.approvedAt
                ? new Date(report.supervisorApproval.approvedAt).toLocaleString('id-ID')
                : 'Belum diverifikasi'}
            </div>
          </div>

          {/* GM Box */}
          <div className={`border rounded-xl p-4 text-center flex flex-col justify-between ${
            report.gmApproval?.decision === 'APPROVED'
              ? 'border-emerald-300 bg-emerald-50/50'
              : report.gmApproval?.decision === 'REJECTED'
              ? 'border-red-300 bg-red-50/50'
              : 'border-slate-200 bg-slate-50'
          }`}>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                General Manager: {report.gmName} (Arifin)
              </span>
              <div className="my-2">
                {report.gmApproval ? (
                  <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                    report.gmApproval.decision === 'APPROVED'
                      ? 'bg-purple-700 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {report.gmApproval.decision === 'APPROVED' ? 'FINAL APPROVED (GM)' : 'REJECTED'}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">Menunggu Review GM</span>
                )}
              </div>
              {report.gmApproval?.notes && (
                <p className="text-[11px] text-slate-600 italic">"{report.gmApproval.notes}"</p>
              )}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-200 pt-2">
              {report.gmApproval?.approvedAt
                ? new Date(report.gmApproval.approvedAt).toLocaleString('id-ID')
                : 'Belum diverifikasi'}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== LOG HISTORI PERUBAHAN STATUS ===================== */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Log Histori Status & Audit Trail</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-normal">
                  {(report.timeline || []).length} Entri Tercatat
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Riwayat lengkap perubahan status laporan, waktu timestamp, nama penanggung jawab, dan catatan verifikasi
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status Sekarang</span>
            <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${
              report.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              report.status === 'PENDING_SUPERVISOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              report.status === 'PENDING_GM' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              report.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              'bg-slate-700 text-slate-300'
            }`}>
              {report.status}
            </span>
          </div>
        </div>

        <div className="p-5">
          {!report.timeline || report.timeline.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <span>Belum ada riwayat aktivitas tercatat untuk laporan ini.</span>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {report.timeline.map((step, idx) => {
                const stepDate = new Date(step.timestamp);
                const isApproved = step.action === 'APPROVED';
                const isRejected = step.action === 'REJECTED';
                const isSubmitted = step.action === 'SUBMITTED';

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Bullet */}
                    <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-xs ${
                      isApproved 
                        ? 'bg-emerald-500 border-white text-white' 
                        : isRejected 
                        ? 'bg-red-500 border-white text-white' 
                        : 'bg-blue-600 border-white text-white'
                    }`}>
                      {isApproved ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : isRejected ? (
                        <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 border border-slate-200 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            step.role === 'OPERATOR' 
                              ? 'bg-blue-100 text-blue-800' 
                              : step.role === 'SUPERVISOR' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {step.role}
                          </span>

                          <span className="font-bold text-xs text-slate-900">
                            {step.actorName}
                          </span>

                          {/* Action Badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                            isApproved 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isRejected 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isApproved ? 'Telah Menyetujui (Approve)' : isRejected ? 'Menolak (Reject)' : 'Mengajukan Laporan (Submit)'}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {stepDate.toLocaleDateString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })},{' '}
                            {stepDate.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })} WIB
                          </span>
                        </div>
                      </div>

                      {/* Status Transition Badges (From Status -> To Status) */}
                      <div className="flex items-center gap-2 my-2 text-xs flex-wrap bg-white px-3 py-2 rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-500 font-medium">Perubahan Status:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {step.fromStatus || (step.role === 'OPERATOR' ? 'DRAFT' : step.role === 'SUPERVISOR' ? 'PENDING_SUPERVISOR' : 'PENDING_GM')}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          (step.toStatus || (isApproved ? (step.role === 'SUPERVISOR' ? 'PENDING_GM' : 'APPROVED') : isRejected ? 'REJECTED' : 'PENDING_SUPERVISOR')) === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : (step.toStatus || '') === 'PENDING_GM'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : (step.toStatus || '') === 'PENDING_SUPERVISOR'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }`}>
                          {step.toStatus || (isApproved ? (step.role === 'SUPERVISOR' ? 'PENDING_GM' : 'APPROVED') : isRejected ? 'REJECTED' : 'PENDING_SUPERVISOR')}
                        </span>
                      </div>

                      {/* Notes / Reason */}
                      {step.note && (
                        <div className="mt-2 text-xs text-slate-700 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200/80 italic">
                          <span className="font-semibold text-slate-600 not-italic mr-1">Catatan / Evaluasi:</span>
                          "{step.note}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
