import React, { useState } from 'react';
import { 
  Save, 
  Send, 
  Wrench, 
  Cpu, 
  Layers, 
  Ruler, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  HelpCircle,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { 
  CncDailyReport, 
  ShiftType, 
  OilLevelType, 
  CutType, 
  QualityType, 
  CncSheetRecord,
  DimensionRecord
} from '../types';
import { createNewBlankReport, createSampleFilledReport } from '../services/mockReports';
import { LabtechLogo } from './LabtechLogo';

interface OperatorFormProps {
  report: CncDailyReport;
  onSaveDraft: (report: CncDailyReport) => void;
  onSubmitReport: (report: CncDailyReport) => void;
  onCancel?: () => void;
}

export const OperatorForm: React.FC<OperatorFormProps> = ({
  report: initialReport,
  onSaveDraft,
  onSubmitReport,
  onCancel,
}) => {
  const [report, setReport] = useState<CncDailyReport>(initialReport);
  const [activeTab, setActiveTab] = useState<'all' | 'header' | 'sectionA' | 'sectionB' | 'sectionC' | 'sectionD' | 'sectionE' | 'sectionF'>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper for updating header
  const updateHeader = (field: keyof CncDailyReport, value: any) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  };

  // Helper for section A (Maintenance)
  const updateSectionA = (field: string, value: any) => {
    setReport((prev) => ({
      ...prev,
      sectionA: {
        ...prev.sectionA,
        [field]: value,
      },
    }));
  };

  const updateBladeChange = (
    tool: 'vcut' | 'endmill3mm' | 'endmill6mm',
    field: 'replaced' | 'changeDate' | 'toolCondition',
    value: any
  ) => {
    setReport((prev) => ({
      ...prev,
      sectionA: {
        ...prev.sectionA,
        bladeChanges: {
          ...prev.sectionA.bladeChanges,
          [tool]: {
            ...prev.sectionA.bladeChanges[tool],
            [field]: value,
          },
        },
      },
    }));
  };

  // Helper for Section B (Quick Machine)
  const updateSheetB = (index: number, field: keyof CncSheetRecord, value: any) => {
    setReport((prev) => {
      const updated = [...prev.sectionB_Quick];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sectionB_Quick: updated };
    });
  };

  // Helper for Section C (Tekma Machine)
  const updateSheetC = (index: number, field: keyof CncSheetRecord, value: any) => {
    setReport((prev) => {
      const updated = [...prev.sectionC_Tekma];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sectionC_Tekma: updated };
    });
  };

  // Helper for Section D (Material)
  const updateSectionD = (key: 'ppG4mm' | 'pp8mm' | 'ppF10mm', field: 'lembar' | 'sisa', value: any) => {
    setReport((prev) => ({
      ...prev,
      sectionD: {
        ...prev.sectionD,
        [key]: {
          ...prev.sectionD[key],
          [field]: value,
        },
      },
    }));
  };

  const addOtherMaterial = () => {
    setReport((prev) => ({
      ...prev,
      sectionD: {
        ...prev.sectionD,
        otherMaterials: [
          ...prev.sectionD.otherMaterials,
          { id: Date.now().toString(), name: '', lembar: '', sisa: '' },
        ],
      },
    }));
  };

  const removeOtherMaterial = (id: string) => {
    setReport((prev) => ({
      ...prev,
      sectionD: {
        ...prev.sectionD,
        otherMaterials: prev.sectionD.otherMaterials.filter((m) => m.id !== id),
      },
    }));
  };

  const updateOtherMaterial = (id: string, field: 'name' | 'lembar' | 'sisa', value: any) => {
    setReport((prev) => ({
      ...prev,
      sectionD: {
        ...prev.sectionD,
        otherMaterials: prev.sectionD.otherMaterials.map((m) =>
          m.id === id ? { ...m, [field]: value } : m
        ),
      },
    }));
  };

  // Helper for Section E (Dimensions)
  const updateDimension = (index: number, field: keyof DimensionRecord, value: any) => {
    setReport((prev) => {
      const updated = [...prev.sectionE];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, sectionE: updated };
    });
  };

  // Helper for Section F (Notes)
  const updateSectionF = (field: 'otherWork' | 'messageOrInfo' | 'issues', value: string) => {
    setReport((prev) => ({
      ...prev,
      sectionF: {
        ...prev.sectionF,
        [field]: value,
      },
    }));
  };

  // Quick fill sample data button
  const handleLoadSample = () => {
    const sample = createSampleFilledReport('Ahmad Fauzi');
    sample.id = report.id; // Keep current ID
    setReport(sample);
    setErrorMsg(null);
  };

  // Reset form to pure empty blank report
  const handleClearForm = () => {
    if (confirm('Kosongkan semua isian formulir ini?')) {
      const blank = createNewBlankReport('');
      blank.id = report.id; // Keep current ID
      setReport(blank);
      setErrorMsg(null);
    }
  };

  // Validate before submit
  const handleValidateAndSubmit = () => {
    if (!report.operatorName.trim()) {
      setErrorMsg('Nama Operator wajib diisi!');
      return;
    }
    if (!report.project.trim()) {
      setErrorMsg('Nama Project wajib diisi!');
      return;
    }
    if (!report.sasaNo.trim()) {
      setErrorMsg('Nomor SPK / Sosa No. wajib diisi!');
      return;
    }

    setErrorMsg(null);
    onSubmitReport(report);
  };

  // Calculations for summary stats
  const totalBComponents = report.sectionB_Quick.reduce(
    (acc, curr) => acc + (typeof curr.totalComponents === 'number' ? curr.totalComponents : 0),
    0
  );
  const totalCComponents = report.sectionC_Tekma.reduce(
    (acc, curr) => acc + (typeof curr.totalComponents === 'number' ? curr.totalComponents : 0),
    0
  );
  const totalProcessMinutes = [
    ...report.sectionB_Quick,
    ...report.sectionC_Tekma,
  ].reduce(
    (acc, curr) => acc + (typeof curr.processTime === 'number' ? curr.processTime : 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 hidden sm:flex items-center justify-center flex-shrink-0">
            <LabtechLogo size="sm" showText={false} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                PT Labtech Indonesia
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {report.id}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                report.status === 'PENDING_SUPERVISOR' ? 'bg-amber-100 text-amber-800' :
                report.status === 'PENDING_GM' ? 'bg-purple-100 text-purple-800' :
                'bg-slate-100 text-slate-700'
              }`}>
                Status: {report.status === 'DRAFT' ? 'Draft' : report.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Laporan Harian Operasional Mesin CNC Router
            </h2>
            <p className="text-xs text-slate-500">
              Pastikan seluruh data Sheet 1 s/d 6, perawatan oli/pisau, dan material tercatat lengkap sebelum diserahkan ke Supervisor (Mulyana).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleClearForm}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg transition"
            title="Kosongkan seluruh isian formulir agar bersih untuk diisi manual"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>Kosongkan Formulir</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition"
            title="Muat data contoh manufaktur SASA otomatis (jika diperlukan untuk uji coba)"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Isi Contoh</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveDraft(report)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            onClick={handleValidateAndSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Laporan ke Supervisor</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500">Total Komponen Quick (B)</div>
          <div className="text-lg font-bold text-slate-800">{totalBComponents} pcs</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500">Total Komponen Tekma (C)</div>
          <div className="text-lg font-bold text-blue-700">{totalCComponents} pcs</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500">Total Waktu Proses CNC</div>
          <div className="text-lg font-bold text-emerald-700">{totalProcessMinutes} menit</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500">Supervisor Penanggung Jawab</div>
          <div className="text-base font-bold text-amber-700">{report.supervisorName} (Mulyana)</div>
        </div>
      </div>

      {/* ===================== FORM SECTIONS ===================== */}

      {/* 1. HEADER FORMULIR */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              1. Header Informasi Kerja
            </h3>
          </div>
          <span className="text-xs text-slate-300">Data Umum & Shift</span>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Operator <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={report.operatorName}
              onChange={(e) => updateHeader('operatorName', e.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shift Kerja <span className="text-red-500">*</span>
            </label>
            <select
              value={report.shift}
              onChange={(e) => updateHeader('shift', e.target.value as ShiftType)}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="Shift 1 (Pagi)">Shift 1 (08:00 - 16:30)</option>
              <option value="Shift 2 (Siang)">Shift 2 (15:00 - 23:00)</option>
              <option value="Shift 3 (Malam)">Shift 3 (23:00 - 07:00)</option>
              <option value="Lembur">Lembur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hari & Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={report.dayAndDate}
              onChange={(e) => updateHeader('dayAndDate', e.target.value)}
              placeholder="Contoh: Senin, 28 September 2026"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={report.workStartTime}
                onChange={(e) => updateHeader('workStartTime', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={report.workEndTime}
                onChange={(e) => updateHeader('workEndTime', e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={report.project}
              onChange={(e) => updateHeader('project', e.target.value)}
              placeholder="Contoh: Project Box Packaging SASA 250g"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sosa No. (No. SPK / Order) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={report.sasaNo}
              onChange={(e) => updateHeader('sasaNo', e.target.value)}
              placeholder="Contoh: SPK-SOSA-9941"
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 2. BAGIAN A: PERAWATAN MESIN */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian A: Perawatan Mesin (Maintenance)
            </h3>
          </div>
          <span className="text-xs text-slate-300">Oli & Pergantian Mata Pisau</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Oli Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Volume Pengisian Oli (mL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={report.sectionA.oilFillVolumeMl}
                  onChange={(e) => updateSectionA('oilFillVolumeMl', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 250"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">mL</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Level Oli Mesin
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Rendah', 'Normal', 'Diatas Normal'] as OilLevelType[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => updateSectionA('oilLevel', lvl)}
                    className={`text-xs py-2 px-2 rounded-lg font-medium border text-center transition ${
                      report.sectionA.oilLevel === lvl
                        ? lvl === 'Normal'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : lvl === 'Rendah'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pergantian Mata Pisau */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status & Tanggal Pergantian Mata Pisau
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vcut */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">1. Mata Pisau V-Cut</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={report.sectionA.bladeChanges.vcut.replaced}
                      onChange={(e) => updateBladeChange('vcut', 'replaced', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ada Pergantian</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500">Tanggal Pergantian</label>
                    <input
                      type="date"
                      value={report.sectionA.bladeChanges.vcut.changeDate}
                      onChange={(e) => updateBladeChange('vcut', 'changeDate', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Kondisi / Catatan Pisau</label>
                    <input
                      type="text"
                      value={report.sectionA.bladeChanges.vcut.toolCondition || ''}
                      onChange={(e) => updateBladeChange('vcut', 'toolCondition', e.target.value)}
                      placeholder="e.g. Sudut 90°, kondisi baru"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* End Mill 3mm */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">2. End Mill 3mm</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={report.sectionA.bladeChanges.endmill3mm.replaced}
                      onChange={(e) => updateBladeChange('endmill3mm', 'replaced', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ada Pergantian</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500">Tanggal Pergantian</label>
                    <input
                      type="date"
                      value={report.sectionA.bladeChanges.endmill3mm.changeDate}
                      onChange={(e) => updateBladeChange('endmill3mm', 'changeDate', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Kondisi / Catatan Pisau</label>
                    <input
                      type="text"
                      value={report.sectionA.bladeChanges.endmill3mm.toolCondition || ''}
                      onChange={(e) => updateBladeChange('endmill3mm', 'toolCondition', e.target.value)}
                      placeholder="e.g. Masih tajam / diganti"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* End Mill 6mm */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-slate-800">3. End Mill 6mm</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={report.sectionA.bladeChanges.endmill6mm.replaced}
                      onChange={(e) => updateBladeChange('endmill6mm', 'replaced', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ada Pergantian</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-500">Tanggal Pergantian</label>
                    <input
                      type="date"
                      value={report.sectionA.bladeChanges.endmill6mm.changeDate}
                      onChange={(e) => updateBladeChange('endmill6mm', 'changeDate', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Kondisi / Catatan Pisau</label>
                    <input
                      type="text"
                      value={report.sectionA.bladeChanges.endmill6mm.toolCondition || ''}
                      onChange={(e) => updateBladeChange('endmill6mm', 'toolCondition', e.target.value)}
                      placeholder="e.g. Masih tajam / diganti"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BAGIAN B: MESIN CNC QUICK (PUTIH) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-700 px-4 py-3 text-white flex items-center justify-between border-b-4 border-slate-300">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-yellow-300" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian B: Tabel Kerja Mesin CNC Quick (Putih)
            </h3>
          </div>
          <span className="text-xs bg-slate-600 px-2.5 py-0.5 rounded font-mono">
            Sheet 1 s/d 6
          </span>
        </div>

        <div className="p-4 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                <th className="p-2 border border-slate-200 w-12 text-center">Sheet</th>
                <th className="p-2 border border-slate-200 min-w-[140px]">Nama Produk</th>
                <th className="p-2 border border-slate-200 min-w-[120px]">Jenis Material</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Waktu Proses (m)</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Setup (m)</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Inspeksi (m)</th>
                <th className="p-2 border border-slate-200 min-w-[130px]">Delay (m) & Alasan</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Total Komp.</th>
                <th className="p-2 border border-slate-200 w-28 text-center">Jenis Potong</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionB_Quick.map((sheet, idx) => (
                <tr key={sheet.sheetNumber} className="hover:bg-slate-50 border-b border-slate-200">
                  <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">
                    #{sheet.sheetNumber}
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={sheet.productName}
                      onChange={(e) => updateSheetB(idx, 'productName', e.target.value)}
                      placeholder="e.g. Part SASA"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={sheet.materialType}
                      onChange={(e) => updateSheetB(idx, 'materialType', e.target.value)}
                      placeholder="e.g. PP G 4mm"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.processTime}
                      onChange={(e) => updateSheetB(idx, 'processTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.setupTime}
                      onChange={(e) => updateSheetB(idx, 'setupTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.inspectionTime}
                      onChange={(e) => updateSheetB(idx, 'inspectionTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="0"
                        value={sheet.delayTime}
                        onChange={(e) => updateSheetB(idx, 'delayTime', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0m"
                        className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={sheet.delayReason || ''}
                        onChange={(e) => updateSheetB(idx, 'delayReason', e.target.value)}
                        placeholder="Alasan delay"
                        className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.totalComponents}
                      onChange={(e) => updateSheetB(idx, 'totalComponents', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="pcs"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-semibold focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <select
                      value={sheet.cutType}
                      onChange={(e) => updateSheetB(idx, 'cutType', e.target.value as CutType)}
                      className="w-full px-1 py-1 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Cut">Cut</option>
                      <option value="Vcut">Vcut</option>
                      <option value="Vcut + Cut">Vcut + Cut</option>
                    </select>
                  </td>
                  <td className="p-1 border border-slate-200">
                    <select
                      value={sheet.quality}
                      onChange={(e) => updateSheetB(idx, 'quality', e.target.value as QualityType)}
                      className={`w-full px-1 py-1 border rounded text-xs font-semibold ${
                        sheet.quality === 'OK'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. BAGIAN C: MESIN CNC TEKMA (BIRU) */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 px-4 py-3 text-white flex items-center justify-between border-b-4 border-blue-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-300" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian C: Tabel Kerja Mesin CNC Tekma (Biru)
            </h3>
          </div>
          <span className="text-xs bg-blue-800 px-2.5 py-0.5 rounded font-mono">
            Sheet 1 s/d 6
          </span>
        </div>

        <div className="p-4 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-blue-50 text-blue-900 border-b border-blue-200 font-semibold">
                <th className="p-2 border border-slate-200 w-12 text-center">Sheet</th>
                <th className="p-2 border border-slate-200 min-w-[140px]">Nama Produk</th>
                <th className="p-2 border border-slate-200 min-w-[120px]">Jenis Material</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Waktu Proses (m)</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Setup (m)</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Inspeksi (m)</th>
                <th className="p-2 border border-slate-200 min-w-[130px]">Delay (m) & Alasan</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Total Komp.</th>
                <th className="p-2 border border-slate-200 w-28 text-center">Jenis Potong</th>
                <th className="p-2 border border-slate-200 w-24 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionC_Tekma.map((sheet, idx) => (
                <tr key={sheet.sheetNumber} className="hover:bg-blue-50/50 border-b border-slate-200">
                  <td className="p-2 border border-slate-200 text-center font-bold bg-blue-50/70 text-blue-900">
                    #{sheet.sheetNumber}
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={sheet.productName}
                      onChange={(e) => updateSheetC(idx, 'productName', e.target.value)}
                      placeholder="e.g. Tray SASA"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={sheet.materialType}
                      onChange={(e) => updateSheetC(idx, 'materialType', e.target.value)}
                      placeholder="e.g. PP F 10mm"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.processTime}
                      onChange={(e) => updateSheetC(idx, 'processTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.setupTime}
                      onChange={(e) => updateSheetC(idx, 'setupTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.inspectionTime}
                      onChange={(e) => updateSheetC(idx, 'inspectionTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="0"
                        value={sheet.delayTime}
                        onChange={(e) => updateSheetC(idx, 'delayTime', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0m"
                        className="w-12 px-1.5 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={sheet.delayReason || ''}
                        onChange={(e) => updateSheetC(idx, 'delayReason', e.target.value)}
                        placeholder="Alasan delay"
                        className="w-full px-1.5 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      min="0"
                      value={sheet.totalComponents}
                      onChange={(e) => updateSheetC(idx, 'totalComponents', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="pcs"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-semibold focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <select
                      value={sheet.cutType}
                      onChange={(e) => updateSheetC(idx, 'cutType', e.target.value as CutType)}
                      className="w-full px-1 py-1 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Cut">Cut</option>
                      <option value="Vcut">Vcut</option>
                      <option value="Vcut + Cut">Vcut + Cut</option>
                    </select>
                  </td>
                  <td className="p-1 border border-slate-200">
                    <select
                      value={sheet.quality}
                      onChange={(e) => updateSheetC(idx, 'quality', e.target.value as QualityType)}
                      className={`w-full px-1 py-1 border rounded text-xs font-semibold ${
                        sheet.quality === 'OK'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300'
                      }`}
                    >
                      <option value="OK">OK</option>
                      <option value="Not OK">Not OK</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. BAGIAN D: MATERIAL */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian D: Pemakaian & Sisa Material
            </h3>
          </div>
          <span className="text-xs text-slate-300">PP 6mm, PP 8mm, PP 10mm, Lain-lain</span>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PP 6mm */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
              <span className="font-bold text-xs text-slate-800 block mb-2">
                1. Material PP 6mm
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500">Jumlah Lembar Terpakai</label>
                  <input
                    type="number"
                    min="0"
                    value={report.sectionD.ppG4mm.lembar}
                    onChange={(e) => updateSectionD('ppG4mm', 'lembar', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 4 lembar"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Keterangan Sisa Material</label>
                  <input
                    type="text"
                    value={report.sectionD.ppG4mm.sisa}
                    onChange={(e) => updateSectionD('ppG4mm', 'sisa', e.target.value)}
                    placeholder="e.g. 1/4 lembar potong sudut"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PP 8mm */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
              <span className="font-bold text-xs text-slate-800 block mb-2">
                2. Material PP 8mm
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500">Jumlah Lembar Terpakai</label>
                  <input
                    type="number"
                    min="0"
                    value={report.sectionD.pp8mm.lembar}
                    onChange={(e) => updateSectionD('pp8mm', 'lembar', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2 lembar"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Keterangan Sisa Material</label>
                  <input
                    type="text"
                    value={report.sectionD.pp8mm.sisa}
                    onChange={(e) => updateSectionD('pp8mm', 'sisa', e.target.value)}
                    placeholder="e.g. 1/2 lembar utuh"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PP 10mm */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
              <span className="font-bold text-xs text-slate-800 block mb-2">
                3. Material PP 10mm
              </span>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500">Jumlah Lembar Terpakai</label>
                  <input
                    type="number"
                    min="0"
                    value={report.sectionD.ppF10mm.lembar}
                    onChange={(e) => updateSectionD('ppF10mm', 'lembar', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 2 lembar"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500">Keterangan Sisa Material</label>
                  <input
                    type="text"
                    value={report.sectionD.ppF10mm.sisa}
                    onChange={(e) => updateSectionD('ppF10mm', 'sisa', e.target.value)}
                    placeholder="e.g. Bram halus / sisa tepi"
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Material Lain-lain */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Material Lain-lain (Kustom)
                </span>
                <span className="text-[11px] text-slate-400">
                  (Tambahkan jika ada material tambahan seperti Acrylic, MDF, dll.)
                </span>
              </div>
              <button
                type="button"
                onClick={addOtherMaterial}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Tambah Baris</span>
              </button>
            </div>

            {report.sectionD.otherMaterials.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Belum ada material lain. Klik "Tambah Baris" jika ada bahan tambahan.
              </p>
            ) : (
              <div className="space-y-2">
                {report.sectionD.otherMaterials.map((mat) => (
                  <div key={mat.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={mat.name}
                        onChange={(e) => updateOtherMaterial(mat.id, 'name', e.target.value)}
                        placeholder="Nama Material (e.g. Acrylic 3mm)"
                        className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        value={mat.lembar}
                        onChange={(e) => updateOtherMaterial(mat.id, 'lembar', e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Lembar"
                        className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white text-center"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={mat.sisa}
                        onChange={(e) => updateOtherMaterial(mat.id, 'sisa', e.target.value)}
                        placeholder="Keterangan sisa potongan"
                        className="w-full text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeOtherMaterial(mat.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. BAGIAN E: DIMENSI HASIL POTONG */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian E: Dimensi Hasil Potong (Sheet 1 s/d Sheet 6)
            </h3>
          </div>
          <span className="text-xs text-slate-300">Panjang (mm), Lebar (mm), Tebal (mm)</span>
        </div>

        <div className="p-4 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                <th className="p-2 border border-slate-200 w-16 text-center">Sheet</th>
                <th className="p-2 border border-slate-200 text-center">Panjang (mm)</th>
                <th className="p-2 border border-slate-200 text-center">Lebar (mm)</th>
                <th className="p-2 border border-slate-200 text-center">Tebal (mm)</th>
                <th className="p-2 border border-slate-200">Catatan Toleransi / Hasil Ukur</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionE.map((dim, idx) => (
                <tr key={dim.sheetNumber} className="hover:bg-slate-50 border-b border-slate-200">
                  <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">
                    Sheet {dim.sheetNumber}
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      step="0.1"
                      value={dim.lengthMm}
                      onChange={(e) => updateDimension(idx, 'lengthMm', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1220"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      step="0.1"
                      value={dim.widthMm}
                      onChange={(e) => updateDimension(idx, 'widthMm', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 850"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="number"
                      step="0.1"
                      value={dim.thicknessMm}
                      onChange={(e) => updateDimension(idx, 'thicknessMm', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 4.0"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-1 border border-slate-200">
                    <input
                      type="text"
                      value={dim.toleranceNotes || ''}
                      onChange={(e) => updateDimension(idx, 'toleranceNotes', e.target.value)}
                      placeholder="e.g. Sesuai toleransi +/- 0.2mm"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. BAGIAN F: CATATAN */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h3 className="font-semibold text-sm uppercase tracking-wider">
              Bagian F: Catatan & Laporan Operasional
            </h3>
          </div>
          <span className="text-xs text-slate-300">Pekerjaan Lain, Informasi & Kendala</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pekerjaan Lainnya
            </label>
            <textarea
              rows={4}
              value={report.sectionF.otherWork}
              onChange={(e) => updateSectionF('otherWork', e.target.value)}
              placeholder="Contoh: Membersihkan area kerja dan mesin dari serbuk plastik..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pesan / Informasi
            </label>
            <textarea
              rows={4}
              value={report.sectionF.messageOrInfo}
              onChange={(e) => updateSectionF('messageOrInfo', e.target.value)}
              placeholder="Contoh: Shift 2 diharapkan melanjutkan cutting lembar 5 & 6..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kendala
            </label>
            <textarea
              rows={4}
              value={report.sectionF.issues}
              onChange={(e) => updateSectionF('issues', e.target.value)}
              placeholder="Contoh: Mata pisau agak panas saat memotong PP 10mm, kompresor angin stabil..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur text-white p-4 rounded-xl shadow-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>
            Tekan <strong>"Submit Laporan"</strong> untuk mengunci draft dan otomatis menerbitkan Tautan Persetujuan Supervisor (Mulyana).
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onSaveDraft(report)}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition"
          >
            Simpan Draft
          </button>
          <button
            type="button"
            onClick={handleValidateAndSubmit}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Laporan ke Supervisor (Mulyana)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
