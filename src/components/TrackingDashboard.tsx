import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  ExternalLink, 
  Share2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Edit3,
  Layers,
  UserCheck,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart3,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { CncDailyReport, ReportStatus } from '../types';
import { exportReportsToCsvSummary, exportReportsToCsvDetailed } from '../services/csvExport';
import { LabtechLogo } from './LabtechLogo';

interface TrackingDashboardProps {
  reports: CncDailyReport[];
  onSelectReport: (report: CncDailyReport) => void;
  onEditReport: (report: CncDailyReport) => void;
  onOpenApproval: (reportId: string, role: 'supervisor' | 'gm') => void;
  onNavigatePrint: (report: CncDailyReport) => void;
  onOpenShareModal: (report: CncDailyReport) => void;
  onNewReport: () => void;
  onDeleteReport: (id: string) => void;
  onClearAllReports: () => void;
  onResetData: () => void;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  reports,
  onSelectReport,
  onEditReport,
  onOpenApproval,
  onNavigatePrint,
  onOpenShareModal,
  onNewReport,
  onDeleteReport,
  onClearAllReports,
  onResetData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [shiftFilter, setShiftFilter] = useState<string>('ALL');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const handleExportCsv = (mode: 'summary' | 'detail') => {
    setIsExportMenuOpen(false);
    const targetData = filteredReports.length > 0 ? filteredReports : reports;
    if (mode === 'summary') {
      exportReportsToCsvSummary(targetData);
      setExportNotice(`Berhasil mengekspor ringkasan ${targetData.length} laporan ke file CSV!`);
    } else {
      exportReportsToCsvDetailed(targetData);
      setExportNotice(`Berhasil mengekspor detail lembar kerja Sheet 1-6 (${targetData.length} laporan) ke file CSV!`);
    }
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.sasaNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.operatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchShift = shiftFilter === 'ALL' || r.shift.includes(shiftFilter);

      return matchSearch && matchStatus && matchShift;
    });
  }, [reports, searchQuery, statusFilter, shiftFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const pendingSupervisor = reports.filter((r) => r.status === 'PENDING_SUPERVISOR').length;
    const pendingGm = reports.filter((r) => r.status === 'PENDING_GM').length;
    const totalPending = pendingSupervisor + pendingGm;
    const approved = reports.filter((r) => r.status === 'APPROVED').length;
    const rejected = reports.filter((r) => r.status === 'REJECTED').length;
    const draft = reports.filter((r) => r.status === 'DRAFT').length;

    const totalComponents = reports.reduce((acc, r) => {
      const bComps = r.sectionB_Quick.reduce((a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 0);
      const cComps = r.sectionC_Tekma.reduce((a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0), 0);
      return acc + bComps + cComps;
    }, 0);

    const chartData = [
      {
        name: 'Pending SPV',
        statusKey: 'PENDING_SUPERVISOR',
        total: pendingSupervisor,
        fill: '#f59e0b', // amber-500
        description: 'Menunggu Mulyana',
      },
      {
        name: 'Pending GM',
        statusKey: 'PENDING_GM',
        total: pendingGm,
        fill: '#a855f7', // purple-500
        description: 'Menunggu Arifin',
      },
      {
        name: 'Approved',
        statusKey: 'APPROVED',
        total: approved,
        fill: '#10b981', // emerald-500
        description: 'Selesai & Sah',
      },
      {
        name: 'Perlu Revisi',
        statusKey: 'REJECTED',
        total: rejected,
        fill: '#ef4444', // red-500
        description: 'Ditolak',
      },
    ];

    return { 
      total, 
      pendingSupervisor, 
      pendingGm, 
      totalPending, 
      approved, 
      rejected, 
      draft, 
      totalComponents,
      chartData 
    };
  }, [reports]);

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai / Approved</span>
          </span>
        );
      case 'PENDING_SUPERVISOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu SPV (Mulyana)</span>
          </span>
        );
      case 'PENDING_GM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu GM (Arifin)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Perlu Revisi</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <span>Draft Operator</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-700/60 hidden sm:flex items-center justify-center flex-shrink-0">
              <LabtechLogo size="sm" showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-semibold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-700/50">
                  PT Labtech Indonesia
                </span>
                <span className="text-xs text-slate-400">• Divisi Mesin CNC Router</span>
              </div>
              <h2 className="text-2xl font-bold mt-1 text-white tracking-tight">
                Dashboard Pelacakan Laporan Harian CNC Router
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Pantau status penyerahan formulir fisik, verifikasi perawatan mesin & mata pisau, serta progres persetujuan bertingkat dari Supervisor (Mulyana) hingga GM (Arifin).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
            {/* Export CSV Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-600 transition shadow-sm"
                title="Ekspor data laporan harian ke format CSV untuk analisis spreadsheet Excel"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Ekspor CSV</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Excel
                </span>
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                    Pilih Format Ekspor (.csv)
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCsv('summary')}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Format Ringkasan (1 Baris/Laporan)</div>
                      <div className="text-[10px] text-slate-500">
                        Total komponen, status SPV & GM, oli, dan sisa material
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCsv('detail')}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition border-t border-slate-100"
                  >
                    <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">Format Detail Sheet Mesin (1-6)</div>
                      <div className="text-[10px] text-slate-500">
                        Breakdown Waktu Proses, Delay, Setup, Dimensi per Sheet Quick & Tekma
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onNewReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Laporan Baru</span>
            </button>

            {reports.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white text-xs font-semibold rounded-xl border border-red-700/60 transition shadow-sm"
                title="Hapus seluruh riwayat laporan sampai nol (bersihkan semua data)"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Hapus Semua (Nol)</span>
                <span className="sm:hidden">Hapus Nol</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/70">
            <span className="text-[11px] text-slate-400 block font-medium">Total Laporan</span>
            <div className="text-2xl font-black text-white mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-400">Arsip aktif</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-amber-600/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-medium">Menunggu SPV</span>
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{stats.pendingSupervisor}</div>
            <span className="text-[10px] text-amber-200/80">Pak Mulyana</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-purple-600/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-purple-300 font-medium">Menunggu GM</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">{stats.pendingGm}</div>
            <span className="text-[10px] text-purple-200/80">Pak Arifin</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-emerald-600/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-medium">Selesai / Approved</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{stats.approved}</div>
            <span className="text-[10px] text-emerald-200/80">Siap Cetak PDF</span>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-300 font-medium">Total Komponen</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400 mt-0.5">{stats.totalComponents}</div>
            <span className="text-[10px] text-slate-400">Quick & Tekma (pcs)</span>
          </div>
        </div>
      </div>

      {/* Visual Summary Card: Recharts Bar Chart of Report Statuses */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ringkasan Visual Status Laporan
              </h3>
              <p className="text-xs text-slate-500">
                Distribusi laporan per tahap persetujuan (Pending SPV, Pending GM, Approved, dan Revisi)
              </p>
            </div>
          </div>

          {/* Quick ratio indicators */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setStatusFilter(statusFilter === 'PENDING_SUPERVISOR' ? 'ALL' : 'PENDING_SUPERVISOR')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'PENDING_SUPERVISOR' 
                  ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold' 
                  : 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Pending SPV: <strong>{stats.pendingSupervisor}</strong></span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'PENDING_GM' ? 'ALL' : 'PENDING_GM')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'PENDING_GM' 
                  ? 'bg-purple-100 border-purple-400 text-purple-900 font-bold' 
                  : 'bg-purple-50/70 border-purple-200 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Pending GM: <strong>{stats.pendingGm}</strong></span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                statusFilter === 'APPROVED' 
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' 
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Approved: <strong>{stats.approved}</strong></span>
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#475569' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700">
                        <div className="font-bold flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: data.fill }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          {data.description}
                        </div>
                        <div className="mt-1.5 text-sm font-black text-white border-t border-slate-800 pt-1">
                          {data.total} Laporan
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="total" 
                radius={[6, 6, 0, 0]} 
                barSize={48}
                onClick={(entry: any) => {
                  if (entry && entry.statusKey) {
                    setStatusFilter(statusFilter === entry.statusKey ? 'ALL' : entry.statusKey);
                  }
                }}
                className="cursor-pointer"
              >
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote helper */}
        <div className="mt-2 text-center sm:text-left text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-2">
          <span>💡 Tip: Klik salah satu batang grafik untuk langsung menyaring daftar tabel di bawah.</span>
          <span className="font-medium text-slate-500">
            Total Pending (SPV + GM): <strong>{stats.totalPending}</strong> | Approved: <strong>{stats.approved}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SPK Sosa No, project, operator, ID..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING_SUPERVISOR">Menunggu SPV (Mulyana)</option>
            <option value="PENDING_GM">Menunggu GM (Arifin)</option>
            <option value="APPROVED">Selesai / Approved</option>
            <option value="REJECTED">Ditolak / Perlu Revisi</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Semua Shift</option>
            <option value="Shift 1">Shift 1 (Pagi)</option>
            <option value="Shift 2">Shift 2 (Siang)</option>
            <option value="Shift 3">Shift 3 (Malam)</option>
            <option value="Lembur">Lembur</option>
          </select>
        </div>
      </div>

      {/* Export feedback toast */}
      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan di folder Unduhan</span>
        </div>
      )}

      {/* Reports Table List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Riwayat Laporan Terdaftar ({filteredReports.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCsv('summary')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition"
              title="Ekspor baris laporan yang sedang ditampilkan ke CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Ringkasan ({filteredReports.length})</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportCsv('detail')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition"
              title="Ekspor seluruh Sheet 1-6 Mesin CNC ke CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor Detail Sheet</span>
            </button>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            {reports.length === 0 ? (
              <div className="space-y-2">
                <p className="text-base font-bold text-slate-700">
                  Riwayat Laporan Kosong (0 Laporan)
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Semua data riwayat laporan telah dibersihkan hingga nol. Anda dapat membuat laporan baru atau memulihkan data demo kapan saja.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={onNewReport}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                  >
                    + Buat Laporan Baru Sekarang
                  </button>
                  <button
                    type="button"
                    onClick={onResetData}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
                  >
                    Pulihkan Data Demo Bawaan
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-600">Tidak ada laporan yang sesuai kriteria pencarian.</p>
                <p className="text-xs text-slate-400 mt-1">Ubah kata kunci filter atau klik "+ Buat Laporan Baru".</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-3">ID & Tanggal</th>
                  <th className="p-3">No. SPK & Project</th>
                  <th className="p-3">Operator & Shift</th>
                  <th className="p-3">Produksi Mesin</th>
                  <th className="p-3">Status Persetujuan</th>
                  <th className="p-3 text-right">Aksi & Approval Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredReports.map((report) => {
                  const bComps = report.sectionB_Quick.reduce(
                    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
                    0
                  );
                  const cComps = report.sectionC_Tekma.reduce(
                    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
                    0
                  );

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* ID & Date */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900">{report.id}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{report.dayAndDate}</div>
                        <div className="text-[10px] text-slate-400">
                          {report.workStartTime} - {report.workEndTime} WIB
                        </div>
                      </td>

                      {/* Project & SASA */}
                      <td className="p-3">
                        <span className="font-semibold text-blue-700 block">{report.project}</span>
                        <div className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px] text-slate-700">
                          {report.sasaNo}
                        </div>
                      </td>

                      {/* Operator & Shift */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{report.operatorName}</div>
                        <div className="text-[11px] text-slate-500">{report.shift}</div>
                        <div className="text-[10px] text-slate-400">
                          Oli: {report.sectionA.oilFillVolumeMl} mL ({report.sectionA.oilLevel})
                        </div>
                      </td>

                      {/* Machine Production */}
                      <td className="p-3">
                        <div className="text-[11px]">
                          <span className="text-slate-500">Quick:</span>{' '}
                          <span className="font-bold text-slate-700">{bComps} pcs</span>
                        </div>
                        <div className="text-[11px]">
                          <span className="text-blue-500">Tekma:</span>{' '}
                          <span className="font-bold text-blue-800">{cComps} pcs</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Total: <strong>{bComps + cComps} pcs</strong>
                        </div>
                      </td>

                      {/* Status & Stepper */}
                      <td className="p-3">
                        <div>{getStatusBadge(report.status)}</div>

                        {/* Visual Workflow Steps */}
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                          <span className="text-emerald-600 font-bold" title="Operator sudah submit">
                            Op ✓
                          </span>
                          <span>➔</span>
                          <span className={`${
                            report.supervisorApproval?.decision === 'APPROVED'
                              ? 'text-emerald-600 font-bold'
                              : report.status === 'PENDING_SUPERVISOR'
                              ? 'text-amber-600 font-bold underline'
                              : 'text-slate-400'
                          }`} title="Supervisor: Mulyana">
                            SPV {report.supervisorApproval?.decision === 'APPROVED' ? '✓' : ''}
                          </span>
                          <span>➔</span>
                          <span className={`${
                            report.gmApproval?.decision === 'APPROVED'
                              ? 'text-emerald-600 font-bold'
                              : report.status === 'PENDING_GM'
                              ? 'text-purple-600 font-bold underline'
                              : 'text-slate-400'
                          }`} title="GM: Arifin">
                            GM {report.gmApproval?.decision === 'APPROVED' ? '✓' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Share / Link Modal */}
                          <button
                            onClick={() => onOpenShareModal(report)}
                            title="Salin Tautan Approval"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Role Simulation Button depending on status */}
                          {report.status === 'PENDING_SUPERVISOR' && (
                            <button
                              onClick={() => onOpenApproval(report.id, 'supervisor')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              title="Buka Halaman Persetujuan Supervisor Mulyana"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Review SPV</span>
                            </button>
                          )}

                          {report.status === 'PENDING_GM' && (
                            <button
                              onClick={() => onOpenApproval(report.id, 'gm')}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              title="Buka Halaman Persetujuan GM Arifin"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>Review GM</span>
                            </button>
                          )}

                          {/* Print PDF Button */}
                          <button
                            onClick={() => onNavigatePrint(report)}
                            title="Cetak Formulir Kertas Resmi (PDF)"
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg transition"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            <span>Cetak PDF</span>
                          </button>

                          {/* Edit / View */}
                          <button
                            onClick={() => onEditReport(report)}
                            title="Edit Data Formulir"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus laporan ${report.id}?`)) {
                                onDeleteReport(report.id);
                              }
                            }}
                            title="Hapus Laporan"
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal to Clear All Reports to Zero */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-600 text-white p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">Hapus Seluruh Riwayat Laporan?</h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Tindakan ini akan mengosongkan seluruh data ({reports.length} laporan) sampai nol.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p>
                Apakah Anda yakin ingin menghapus <strong>semua {reports.length} laporan harian</strong> dari database lokal perangkat Anda?
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Informasi Penting:</span>
                </div>
                <p>
                  Setelah dihapus sampai 0, Anda tetap dapat memasukkan laporan baru kapan saja atau memulihkan data contoh pabrik bawaan lewat tombol <em>"Reset Demo"</em>.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirmModal(false);
                  onClearAllReports();
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua Sampai Nol</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
