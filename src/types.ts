export type ShiftType = 'Shift 1 (Pagi)' | 'Shift 2 (Siang)' | 'Shift 3 (Malam)' | 'Lembur';
export type OilLevelType = 'Rendah' | 'Normal' | 'Diatas Normal';
export type CutType = 'Vcut' | 'Cut' | 'Vcut + Cut';
export type QualityType = 'OK' | 'Not OK';

export type ReportStatus = 
  | 'DRAFT'
  | 'PENDING_SUPERVISOR'
  | 'PENDING_GM'
  | 'APPROVED'
  | 'REJECTED';

export interface BladeChangeItem {
  replaced: boolean;
  changeDate: string;
  toolCondition?: string;
}

export interface SectionAMaintenance {
  oilFillVolumeMl: number | '';
  oilLevel: OilLevelType;
  bladeChanges: {
    vcut: BladeChangeItem;
    endmill3mm: BladeChangeItem;
    endmill6mm: BladeChangeItem;
  };
}

export interface CncSheetRecord {
  sheetNumber: number; // 1 to 6
  processTime: number | ''; // in minutes
  delayTime: number | ''; // in minutes
  delayReason?: string;
  setupTime: number | ''; // in minutes
  inspectionTime: number | ''; // in minutes
  productName: string;
  materialType: string;
  totalComponents: number | '';
  cutType: CutType;
  quality: QualityType;
}

export interface SectionDMaterial {
  ppG4mm: { lembar: number | ''; sisa: string };
  pp8mm: { lembar: number | ''; sisa: string };
  ppF10mm: { lembar: number | ''; sisa: string };
  otherMaterials: Array<{
    id: string;
    name: string;
    lembar: number | '';
    sisa: string;
  }>;
}

export interface DimensionRecord {
  sheetNumber: number; // 1 to 6
  lengthMm: number | '';
  widthMm: number | '';
  thicknessMm: number | '';
  toleranceNotes?: string;
}

export interface SectionFNotes {
  otherWork: string;
  messageOrInfo: string;
  issues: string;
}

export interface ApprovalStep {
  role: 'OPERATOR' | 'SUPERVISOR' | 'GM';
  actorName: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  fromStatus?: ReportStatus;
  toStatus?: ReportStatus;
  timestamp: string;
  note?: string;
  digitalSignature?: string;
}

export interface CncDailyReport {
  id: string; // e.g. CNC-2026-0928-001
  createdAt: string;
  updatedAt: string;
  
  // Header
  operatorName: string;
  shift: ShiftType;
  dayAndDate: string; // e.g. "Senin, 28 September 2026"
  workStartTime: string; // e.g. "08:00"
  workEndTime: string; // e.g. "16:30"
  project: string;
  sasaNo: string; // No. SPK / Order Sosa

  // Bagian A (Perawatan Mesin)
  sectionA: SectionAMaintenance;

  // Bagian B & C (Tabel Kerja CNC)
  sectionB_Quick: CncSheetRecord[]; // Mesin CNC Quick (Putih) - Sheet 1 to 6
  sectionC_Tekma: CncSheetRecord[]; // Mesin CNC Tekma (Biru) - Sheet 1 to 6

  // Bagian D (Material)
  sectionD: SectionDMaterial;

  // Bagian E (Dimensi Hasil Potong)
  sectionE: DimensionRecord[]; // Sheet 1 to 6

  // Bagian F (Catatan)
  sectionF: SectionFNotes;

  // Approval Workflow
  status: ReportStatus;
  supervisorToken: string;
  gmToken: string;
  
  supervisorName: string; // Default: 'Mulyana'
  gmName: string; // Default: 'Arifin'
  
  supervisorApproval?: {
    approvedAt?: string;
    approverName: string;
    notes?: string;
    decision: 'APPROVED' | 'REJECTED';
  };

  gmApproval?: {
    approvedAt?: string;
    approverName: string;
    notes?: string;
    decision: 'APPROVED' | 'REJECTED';
  };

  timeline: ApprovalStep[];
}
