import { CncDailyReport, ReportStatus, ApprovalStep } from '../types';
import { INITIAL_REPORTS } from './mockReports';

const STORAGE_KEY = 'cnc_daily_reports_db_v1';

// Synchronous fallback reader from localStorage
export const loadReportsFromStorage = (): CncDailyReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading reports from storage:', err);
    return [];
  }
};

export const saveReportsToStorage = (reports: CncDailyReport[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Error saving reports to storage:', err);
  }
};

// Async Server Sync functions: Fetch from /api/reports so ALL devices (HP SPV, GM, PC Operator) see the exact same real-time data
export const fetchReportsFromServer = async (): Promise<CncDailyReport[]> => {
  try {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveReportsToStorage(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync not available, falling back to local cache', err);
  }
  return loadReportsFromStorage();
};

export const syncReportToServer = async (report: CncDailyReport): Promise<void> => {
  try {
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
  } catch (err) {
    console.warn('Failed to post report to server:', err);
  }
};

export const deleteReportFromServer = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Failed to delete report on server:', err);
  }
};

export const clearReportsOnServer = async (): Promise<void> => {
  try {
    await fetch('/api/reports/clear', {
      method: 'POST',
    });
  } catch (err) {
    console.warn('Failed to clear reports on server:', err);
  }
};

export const getReportById = (id: string): CncDailyReport | undefined => {
  const reports = loadReportsFromStorage();
  return reports.find((r) => r.id === id);
};

export const getReportByToken = (token: string): { report: CncDailyReport; role: 'SUPERVISOR' | 'GM' } | null => {
  const reports = loadReportsFromStorage();
  for (const report of reports) {
    if (report.supervisorToken === token) {
      return { report, role: 'SUPERVISOR' };
    }
    if (report.gmToken === token) {
      return { report, role: 'GM' };
    }
  }
  return null;
};

export const saveOrUpdateReport = (report: CncDailyReport): void => {
  const reports = loadReportsFromStorage();
  const index = reports.findIndex((r) => r.id === report.id);
  const now = new Date().toISOString();
  const updatedReport = {
    ...report,
    updatedAt: now,
  };

  if (index >= 0) {
    reports[index] = updatedReport;
  } else {
    reports.unshift(updatedReport);
  }
  saveReportsToStorage(reports);

  // Background sync to shared server
  syncReportToServer(updatedReport).catch(() => {});
};

export const submitReportByOperator = (report: CncDailyReport): CncDailyReport => {
  const now = new Date().toISOString();
  const timelineItem: ApprovalStep = {
    role: 'OPERATOR',
    actorName: report.operatorName || 'Operator',
    action: 'SUBMITTED',
    fromStatus: report.status || 'DRAFT',
    toStatus: 'PENDING_SUPERVISOR',
    timestamp: now,
    note: `Laporan diajukan untuk SPK ${report.sasaNo} (${report.project})`,
  };

  const updated: CncDailyReport = {
    ...report,
    status: 'PENDING_SUPERVISOR',
    updatedAt: now,
    timeline: [
      ...(report.timeline || []).filter((t) => t.action !== 'SUBMITTED'),
      timelineItem,
    ],
  };

  saveOrUpdateReport(updated);
  return updated;
};

export const processSupervisorApproval = (
  reportId: string,
  decision: 'APPROVED' | 'REJECTED',
  notes: string,
  approverName = 'Mulyana'
): CncDailyReport => {
  const reports = loadReportsFromStorage();
  const report = reports.find((r) => r.id === reportId);
  if (!report) throw new Error('Laporan tidak ditemukan');

  const now = new Date().toISOString();
  const newStatus: ReportStatus = decision === 'APPROVED' ? 'PENDING_GM' : 'REJECTED';

  const timelineItem: ApprovalStep = {
    role: 'SUPERVISOR',
    actorName: approverName,
    action: decision,
    fromStatus: report.status,
    toStatus: newStatus,
    timestamp: now,
    note: notes || (decision === 'APPROVED' ? 'Disetujui oleh Supervisor' : 'Ditolak untuk revisi'),
  };

  const updated: CncDailyReport = {
    ...report,
    status: newStatus,
    updatedAt: now,
    supervisorApproval: {
      approvedAt: now,
      approverName,
      notes,
      decision,
    },
    timeline: [...(report.timeline || []), timelineItem],
  };

  saveOrUpdateReport(updated);
  return updated;
};

export const processGmApproval = (
  reportId: string,
  decision: 'APPROVED' | 'REJECTED',
  notes: string,
  approverName = 'Arifin'
): CncDailyReport => {
  const reports = loadReportsFromStorage();
  const report = reports.find((r) => r.id === reportId);
  if (!report) throw new Error('Laporan tidak ditemukan');

  const now = new Date().toISOString();
  const newStatus: ReportStatus = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';

  const timelineItem: ApprovalStep = {
    role: 'GM',
    actorName: approverName,
    action: decision,
    fromStatus: report.status,
    toStatus: newStatus,
    timestamp: now,
    note: notes || (decision === 'APPROVED' ? 'Disetujui Final oleh GM' : 'Ditolak oleh GM'),
  };

  const updated: CncDailyReport = {
    ...report,
    status: newStatus,
    updatedAt: now,
    gmApproval: {
      approvedAt: now,
      approverName,
      notes,
      decision,
    },
    timeline: [...(report.timeline || []), timelineItem],
  };

  saveOrUpdateReport(updated);
  return updated;
};

export const resetReportsToDemo = (): CncDailyReport[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  // Sync each initial report to server
  INITIAL_REPORTS.forEach((r) => syncReportToServer(r));
  return INITIAL_REPORTS;
};

export const deleteReport = (id: string): void => {
  const reports = loadReportsFromStorage().filter((r) => r.id !== id);
  saveReportsToStorage(reports);
  deleteReportFromServer(id).catch(() => {});
};

export const clearAllReportsToZero = (): void => {
  saveReportsToStorage([]);
  clearReportsOnServer().catch(() => {});
};

export const getApprovalUrl = (token: string, role: 'supervisor' | 'gm', reportId?: string): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  const roleCode = role === 'supervisor' ? 'spv' : 'gm';
  return `${baseUrl}#/${roleCode}/${reportId || token}`;
};
