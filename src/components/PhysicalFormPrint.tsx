import React from 'react';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { CncDailyReport } from '../types';
import { LabtechLogo } from './LabtechLogo';

interface PhysicalFormPrintProps {
  report: CncDailyReport;
  onBack: () => void;
}

export const PhysicalFormPrint: React.FC<PhysicalFormPrintProps> = ({
  report,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalQuickComps = report.sectionB_Quick.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
    0
  );
  const totalTekmaComps = report.sectionC_Tekma.reduce(
    (a, b) => a + (typeof b.totalComponents === 'number' ? b.totalComponents : 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2 sm:px-6">
      {/* Print Controls (Hidden when printing) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Ukuran A4 Standar • Tata Letak Formulir Pabrik Fisik
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF (Ctrl + P)</span>
          </button>
        </div>
      </div>

      {/* ===================== PHYSICAL PAPER FORM REPLICA ===================== */}
      <div className="print-page max-w-4xl mx-auto bg-white p-8 sm:p-10 shadow-lg border border-slate-400 text-slate-900 text-[11px] leading-tight font-sans">
        {/* KOP / Header Dokumen Resmi Manufaktur */}
        <div className="border-2 border-slate-900 mb-3">
          <div className="grid grid-cols-12 divide-x-2 divide-slate-900">
            {/* Logo & Company */}
            <div className="col-span-3 p-2.5 flex flex-col justify-center items-center text-center bg-slate-50">
              <div className="mb-1">
                <LabtechLogo size="sm" showText={false} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 leading-tight">
                PT LABTECH INDONESIA
              </span>
              <span className="text-[8px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">
                DIVISI CNC ROUTER
              </span>
            </div>

            {/* Title */}
            <div className="col-span-6 p-3 flex flex-col justify-center text-center">
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wide">
                LAPORAN HARIAN DATA MESIN CNC
              </h1>
              <span className="text-[10px] font-semibold text-slate-600 uppercase mt-0.5">
                Formulir Kendali Mutu & Perawatan Mesin Presisi
              </span>
            </div>

            {/* Document Control */}
            <div className="col-span-3 p-2 text-[9px] flex flex-col justify-center space-y-0.5 bg-slate-50">
              <div><strong>No. Dok :</strong> FR-PRD-CNC-04</div>
              <div><strong>Revisi  :</strong> 02</div>
              <div><strong>Tgl Efektif:</strong> 01-Jan-2026</div>
              <div><strong>Halaman :</strong> 1 dari 1</div>
            </div>
          </div>
        </div>

        {/* Status Cap / Watermark if approved */}
        {report.status === 'APPROVED' && (
          <div className="mb-2 text-right">
            <span className="inline-block px-3 py-0.5 border-2 border-emerald-600 text-emerald-700 font-black text-xs uppercase tracking-widest rounded">
              ✓ DOKUMEN RESMI TELAH DISETUJUI FINAL (APPROVED)
            </span>
          </div>
        )}

        {/* 1. Header Informasi Kerja */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
            1. INFORMASI OPERASIONAL & SHIFT
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-900 text-[10px]">
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Nama Operator:</span>
              <strong className="text-slate-900">{report.operatorName}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Shift:</span>
              <strong>{report.shift}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Hari / Tanggal:</span>
              <strong>{report.dayAndDate}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Jam Kerja:</span>
              <strong>{report.workStartTime} s/d {report.workEndTime}</strong>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-900 border-t border-slate-900 text-[10px]">
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Nama Project:</span>
              <strong className="text-slate-900">{report.project}</strong>
            </div>
            <div className="p-1.5">
              <span className="text-slate-500 block text-[9px]">Sosa No. (No. SPK / Order):</span>
              <strong className="font-mono text-slate-900">{report.sasaNo}</strong>
            </div>
          </div>
        </div>

        {/* 2. Bagian A: Perawatan Mesin */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN A: PERAWATAN MESIN (MAINTENANCE)</span>
            <span className="font-mono text-[9px]">Pelumasan & Pisau</span>
          </div>
          <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
            <div>
              <table className="w-full border-collapse border border-slate-900 text-[9px]">
                <tbody>
                  <tr>
                    <td className="p-1 bg-slate-100 font-semibold w-40 border border-slate-900">Volume Pengisian Oli</td>
                    <td className="p-1 font-bold border border-slate-900">{report.sectionA.oilFillVolumeMl || 0} mL</td>
                  </tr>
                  <tr>
                    <td className="p-1 bg-slate-100 font-semibold border border-slate-900">Pilihan Level Oli</td>
                    <td className="p-1 font-bold border border-slate-900">
                      [ {report.sectionA.oilLevel === 'Rendah' ? 'X' : ' '} ] Rendah &nbsp;&nbsp;
                      [ {report.sectionA.oilLevel === 'Normal' ? 'X' : ' '} ] Normal &nbsp;&nbsp;
                      [ {report.sectionA.oilLevel === 'Diatas Normal' ? 'X' : ' '} ] Diatas Normal
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className="w-full border-collapse border border-slate-900 text-[9px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-1 border border-slate-900 text-left">Mata Pisau</th>
                    <th className="p-1 border border-slate-900 text-center">Ganti</th>
                    <th className="p-1 border border-slate-900 text-center">Tgl Pergantian</th>
                    <th className="p-1 border border-slate-900 text-left">Kondisi / Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold">1. Vcut</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionA.bladeChanges.vcut.replaced ? 'Ya' : 'Tdk'}</td>
                    <td className="p-1 border border-slate-900 text-center">{report.sectionA.bladeChanges.vcut.changeDate || '-'}</td>
                    <td className="p-1 border border-slate-900">{report.sectionA.bladeChanges.vcut.toolCondition || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold">2. End Mill 3mm</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionA.bladeChanges.endmill3mm.replaced ? 'Ya' : 'Tdk'}</td>
                    <td className="p-1 border border-slate-900 text-center">{report.sectionA.bladeChanges.endmill3mm.changeDate || '-'}</td>
                    <td className="p-1 border border-slate-900">{report.sectionA.bladeChanges.endmill3mm.toolCondition || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold">3. End Mill 6mm</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionA.bladeChanges.endmill6mm.replaced ? 'Ya' : 'Tdk'}</td>
                    <td className="p-1 border border-slate-900 text-center">{report.sectionA.bladeChanges.endmill6mm.changeDate || '-'}</td>
                    <td className="p-1 border border-slate-900">{report.sectionA.bladeChanges.endmill6mm.toolCondition || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Bagian B: Mesin CNC Quick (Putih) */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN B: TABEL KERJA MESIN CNC QUICK (PUTIH)</span>
            <span>Total Komponen: {totalQuickComps} pcs</span>
          </div>
          <table className="w-full border-collapse border border-slate-900 text-[9px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="p-1 border border-slate-900 text-center w-8">Sheet</th>
                <th className="p-1 border border-slate-900">Nama Produk</th>
                <th className="p-1 border border-slate-900">Jenis Material</th>
                <th className="p-1 border border-slate-900 text-center">Proses (m)</th>
                <th className="p-1 border border-slate-900 text-center">Delay (m)</th>
                <th className="p-1 border border-slate-900 text-center">Setup (m)</th>
                <th className="p-1 border border-slate-900 text-center">Inspeksi (m)</th>
                <th className="p-1 border border-slate-900 text-center">Total Komp</th>
                <th className="p-1 border border-slate-900 text-center">Potongan</th>
                <th className="p-1 border border-slate-900 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionB_Quick.map((s) => (
                <tr key={s.sheetNumber}>
                  <td className="p-1 border border-slate-900 text-center font-bold">#{s.sheetNumber}</td>
                  <td className="p-1 border border-slate-900">{s.productName || '-'}</td>
                  <td className="p-1 border border-slate-900">{s.materialType || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.processTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">
                    {s.delayTime ? `${s.delayTime} (${s.delayReason || '-'})` : '-'}
                  </td>
                  <td className="p-1 border border-slate-900 text-center">{s.setupTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.inspectionTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{s.totalComponents || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.cutType}</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{s.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Bagian C: Mesin CNC Tekma (Biru) */}
        <div className="border border-slate-900 mb-3">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900 flex justify-between">
            <span>BAGIAN C: TABEL KERJA MESIN CNC TEKMA (BIRU)</span>
            <span>Total Komponen: {totalTekmaComps} pcs</span>
          </div>
          <table className="w-full border-collapse border border-slate-900 text-[9px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="p-1 border border-slate-900 text-center w-8">Sheet</th>
                <th className="p-1 border border-slate-900">Nama Produk</th>
                <th className="p-1 border border-slate-900">Jenis Material</th>
                <th className="p-1 border border-slate-900 text-center">Proses (m)</th>
                <th className="p-1 border border-slate-900 text-center">Delay (m)</th>
                <th className="p-1 border border-slate-900 text-center">Setup (m)</th>
                <th className="p-1 border border-slate-900 text-center">Inspeksi (m)</th>
                <th className="p-1 border border-slate-900 text-center">Total Komp</th>
                <th className="p-1 border border-slate-900 text-center">Potongan</th>
                <th className="p-1 border border-slate-900 text-center">Kualitas</th>
              </tr>
            </thead>
            <tbody>
              {report.sectionC_Tekma.map((s) => (
                <tr key={s.sheetNumber}>
                  <td className="p-1 border border-slate-900 text-center font-bold">#{s.sheetNumber}</td>
                  <td className="p-1 border border-slate-900">{s.productName || '-'}</td>
                  <td className="p-1 border border-slate-900">{s.materialType || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.processTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">
                    {s.delayTime ? `${s.delayTime} (${s.delayReason || '-'})` : '-'}
                  </td>
                  <td className="p-1 border border-slate-900 text-center">{s.setupTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.inspectionTime || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{s.totalComponents || '-'}</td>
                  <td className="p-1 border border-slate-900 text-center">{s.cutType}</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{s.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Bagian D & E (Side by Side) */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Bagian D: Material */}
          <div className="border border-slate-900">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
              BAGIAN D: MATERIAL
            </div>
            <table className="w-full border-collapse border border-slate-900 text-[9px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-1 border border-slate-900 text-left">Jenis Material</th>
                  <th className="p-1 border border-slate-900 text-center w-16">Lembar</th>
                  <th className="p-1 border border-slate-900 text-left">Sisa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border border-slate-900 font-semibold">PP 6mm</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionD.ppG4mm.lembar || 0}</td>
                  <td className="p-1 border border-slate-900">{report.sectionD.ppG4mm.sisa || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1 border border-slate-900 font-semibold">PP 8mm</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionD.pp8mm.lembar || 0}</td>
                  <td className="p-1 border border-slate-900">{report.sectionD.pp8mm.sisa || '-'}</td>
                </tr>
                <tr>
                  <td className="p-1 border border-slate-900 font-semibold">PP 10mm</td>
                  <td className="p-1 border border-slate-900 text-center font-bold">{report.sectionD.ppF10mm.lembar || 0}</td>
                  <td className="p-1 border border-slate-900">{report.sectionD.ppF10mm.sisa || '-'}</td>
                </tr>
                {report.sectionD.otherMaterials.map((m) => (
                  <tr key={m.id}>
                    <td className="p-1 border border-slate-900 font-semibold">{m.name || 'Lain-lain'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{m.lembar || 0}</td>
                    <td className="p-1 border border-slate-900">{m.sisa || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bagian E: Dimensi Hasil Potong */}
          <div className="border border-slate-900">
            <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
              BAGIAN E: DIMENSI HASIL POTONG (MM)
            </div>
            <table className="w-full border-collapse border border-slate-900 text-[9px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-1 border border-slate-900 text-center w-12">Sheet</th>
                  <th className="p-1 border border-slate-900 text-center">Panjang</th>
                  <th className="p-1 border border-slate-900 text-center">Lebar</th>
                  <th className="p-1 border border-slate-900 text-center">Tebal</th>
                  <th className="p-1 border border-slate-900 text-left">Toleransi</th>
                </tr>
              </thead>
              <tbody>
                {report.sectionE.map((dim) => (
                  <tr key={dim.sheetNumber}>
                    <td className="p-1 border border-slate-900 text-center font-bold">Sheet {dim.sheetNumber}</td>
                    <td className="p-1 border border-slate-900 text-center">{dim.lengthMm || '-'}</td>
                    <td className="p-1 border border-slate-900 text-center">{dim.widthMm || '-'}</td>
                    <td className="p-1 border border-slate-900 text-center">{dim.thicknessMm || '-'}</td>
                    <td className="p-1 border border-slate-900">{dim.toleranceNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Bagian F: Catatan */}
        <div className="border border-slate-900 mb-4">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b border-slate-900">
            BAGIAN F: CATATAN LAPORAN OPERASIONAL
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-900 text-[9px] p-1.5">
            <div className="px-1.5">
              <strong className="block text-slate-700 mb-0.5">Pekerjaan Lainnya:</strong>
              <p className="text-slate-800">{report.sectionF.otherWork || '-'}</p>
            </div>
            <div className="px-1.5">
              <strong className="block text-slate-700 mb-0.5">Pesan / Informasi:</strong>
              <p className="text-slate-800">{report.sectionF.messageOrInfo || '-'}</p>
            </div>
            <div className="px-1.5">
              <strong className="block text-slate-700 mb-0.5">Kendala:</strong>
              <p className="text-slate-800">{report.sectionF.issues || 'Nihil'}</p>
            </div>
          </div>
        </div>

        {/* 7. KOTAK TANDA TANGAN & PERSETUJUAN RESMI (3 KOLOM) */}
        <div className="print-signature-box border-2 border-slate-900">
          <div className="bg-slate-200 px-2 py-1 font-bold text-[10px] uppercase border-b-2 border-slate-900 text-center">
            LEMBAR PENGESAHAN & PERSETUJUAN BERTINGKAT
          </div>
          <div className="grid grid-cols-3 divide-x-2 divide-slate-900 text-[10px]">
            {/* 1. Dibuat Oleh (Operator) */}
            <div className="p-2 flex flex-col justify-between h-32 text-center">
              <span className="font-semibold text-slate-700">Dibuat Oleh (Operator):</span>
              <div className="my-auto">
                <span className="font-serif italic text-base text-slate-800">
                  {report.operatorName}
                </span>
                <div className="text-[9px] text-slate-400 mt-1">Tanda Tangan Digital</div>
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {report.operatorName}
                <span className="block text-[8px] font-normal text-slate-500">
                  Tgl: {new Date(report.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>

            {/* 2. Diperiksa & Disetujui (Supervisor: Mulyana) */}
            <div className="p-2 flex flex-col justify-between h-32 text-center bg-slate-50/50">
              <span className="font-semibold text-slate-700">
                Diperiksa & Disetujui (SPV):
              </span>
              <div className="my-auto">
                {report.supervisorApproval?.decision === 'APPROVED' ? (
                  <div className="border-2 border-emerald-600 px-2 py-0.5 inline-block rounded text-emerald-800 font-bold text-[11px] transform -rotate-2">
                    ✓ APPROVED SPV
                    <div className="text-[8px] font-mono text-emerald-700">
                      {report.supervisorApproval.approverName}
                    </div>
                  </div>
                ) : report.supervisorApproval?.decision === 'REJECTED' ? (
                  <div className="border-2 border-red-600 px-2 py-0.5 inline-block rounded text-red-800 font-bold text-[10px]">
                    REJECTED
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">(Menunggu Persetujuan)</span>
                )}
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {report.supervisorName} (Mulyana)
                <span className="block text-[8px] font-normal text-slate-500">
                  {report.supervisorApproval?.approvedAt
                    ? `Tgl: ${new Date(report.supervisorApproval.approvedAt).toLocaleDateString('id-ID')}`
                    : 'Supervisor Produksi'}
                </span>
              </div>
            </div>

            {/* 3. Diketahui & Disahkan (GM: Arifin) */}
            <div className="p-2 flex flex-col justify-between h-32 text-center bg-slate-50/50">
              <span className="font-semibold text-slate-700">
                Diketahui & Disahkan (GM):
              </span>
              <div className="my-auto">
                {report.gmApproval?.decision === 'APPROVED' ? (
                  <div className="border-2 border-blue-800 px-2 py-0.5 inline-block rounded text-blue-900 font-black text-[11px] transform rotate-1">
                    ✓ FINAL APPROVED
                    <div className="text-[8px] font-mono text-blue-800">
                      {report.gmApproval.approverName} (GM)
                    </div>
                  </div>
                ) : report.gmApproval?.decision === 'REJECTED' ? (
                  <div className="border-2 border-red-600 px-2 py-0.5 inline-block rounded text-red-800 font-bold text-[10px]">
                    REJECTED
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">(Menunggu Pengesahan GM)</span>
                )}
              </div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                {report.gmName} (Arifin)
                <span className="block text-[8px] font-normal text-slate-500">
                  {report.gmApproval?.approvedAt
                    ? `Tgl: ${new Date(report.gmApproval.approvedAt).toLocaleDateString('id-ID')}`
                    : 'General Manager'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Dokumen */}
        <div className="mt-3 flex justify-between items-center text-[8px] text-slate-500 border-t border-slate-300 pt-1">
          <span>Dicetak melalui Sistem Informasi Manufaktur CNC PT Labtech Indonesia</span>
          <span>Security Token: {report.supervisorToken.substring(0, 10)}... | {report.id}</span>
        </div>
      </div>
    </div>
  );
};
