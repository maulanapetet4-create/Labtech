import React, { useState, useEffect } from 'react';
import { 
  loadReportsFromStorage, 
  saveOrUpdateReport, 
  submitReportByOperator, 
  resetReportsToDemo, 
  getReportById,
  deleteReport,
  clearAllReportsToZero,
  fetchReportsFromServer
} from './services/reportStorage';
import { createNewBlankReport } from './services/mockReports';
import { CncDailyReport } from './types';
import { HeaderNav } from './components/HeaderNav';
import { OperatorForm } from './components/OperatorForm';
import { TrackingDashboard } from './components/TrackingDashboard';
import { ApprovalView } from './components/ApprovalView';
import { PhysicalFormPrint } from './components/PhysicalFormPrint';
import { ApprovalShareModal } from './components/ApprovalShareModal';
import { initAuth, googleSignIn, logout as googleLogout } from './lib/firebase';
import { User } from 'firebase/auth';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<CncDailyReport[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'approval' | 'print'>('dashboard');
  const [activeReport, setActiveReport] = useState<CncDailyReport | null>(null);
  const [approvalRole, setApprovalRole] = useState<'supervisor' | 'gm'>('supervisor');
  const [shareModalReport, setShareModalReport] = useState<CncDailyReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Drive & Firebase User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);

  // Listen to Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setDriveAccessToken(token);
        // Sync user to Cloud SQL database
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoUrl: user.photoURL,
          }),
        }).catch((err) => console.warn('Failed to sync user to Cloud SQL:', err));
      },
      () => {
        setCurrentUser(null);
        setDriveAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setDriveAccessToken(res.accessToken);
        showToast(`Berhasil login Google: ${res.user.displayName || res.user.email}`);

        // Sync user to Cloud SQL
        fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName,
            photoUrl: res.user.photoURL,
          }),
        }).catch(() => {});
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      showToast('Gagal menghubungkan akun Google.');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleLogout();
      setCurrentUser(null);
      setDriveAccessToken(null);
      showToast('Berhasil keluar dari akun Google.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Load initial reports from local cache and sync with central Cloud SQL server
  useEffect(() => {
    const loaded = loadReportsFromStorage();
    setReports(loaded);
    if (loaded.length > 0 && !activeReport) {
      setActiveReport(loaded[0]);
    }

    // Cloud SQL server sync for all devices (HP SPV, GM, PC Operator)
    fetchReportsFromServer().then((serverReports) => {
      if (serverReports && serverReports.length > 0) {
        setReports(serverReports);
        setActiveReport((prev) => {
          if (!prev) return serverReports[0];
          const refreshed = serverReports.find((r) => r.id === prev.id);
          return refreshed || serverReports[0];
        });
      }
    });
  }, []);

  // Check URL hash for direct approval links (#/spv/CNC-... or #/gm/CNC-... or legacy #approval?...)
  useEffect(() => {
    const checkHashRoute = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      let role: 'supervisor' | 'gm' = 'supervisor';
      let searchKey = '';

      // Pattern 1: Short Clean Format (e.g. #/spv/CNC-2026-001 or #/gm/CNC-2026-001)
      const shortMatch = hash.match(/^#\/(spv|gm)\/([^?&]+)/i);
      if (shortMatch) {
        role = shortMatch[1].toLowerCase() === 'gm' ? 'gm' : 'supervisor';
        searchKey = decodeURIComponent(shortMatch[2]);
      } 
      // Pattern 2: Legacy query format (#approval?token=...&role=...&id=...)
      else if (hash.startsWith('#approval')) {
        const queryStr = hash.split('?')[1];
        if (queryStr) {
          const params = new URLSearchParams(queryStr);
          const legacyRole = params.get('role');
          role = legacyRole === 'gm' ? 'gm' : 'supervisor';
          searchKey = params.get('id') || params.get('token') || '';
        }
      }

      if (searchKey) {
        // Fetch latest state from central server first
        const serverReports = await fetchReportsFromServer();
        let target = serverReports.find(
          (r) => r.id === searchKey || r.supervisorToken === searchKey || r.gmToken === searchKey
        );

        if (!target) {
          const allReports = loadReportsFromStorage();
          target = allReports.find(
            (r) => r.id === searchKey || r.supervisorToken === searchKey || r.gmToken === searchKey
          );
        }

        if (target) {
          setActiveReport(target);
          setApprovalRole(role);
          setCurrentView('approval');
        }
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Actions
  const handleNewReport = () => {
    const fresh = createNewBlankReport('');
    setActiveReport(fresh);
    setCurrentView('form');
  };

  const handleSaveDraft = (report: CncDailyReport) => {
    saveOrUpdateReport(report);
    const updatedList = loadReportsFromStorage();
    setReports(updatedList);
    setActiveReport(report);
    showToast('Draft laporan berhasil disimpan ke Cloud SQL!');
  };

  const handleSubmitReport = (report: CncDailyReport) => {
    const submitted = submitReportByOperator(report);
    const updatedList = loadReportsFromStorage();
    setReports(updatedList);
    setActiveReport(submitted);
    // Open share modal immediately so user sees generated unique link and Google Drive backup
    setShareModalReport(submitted);
    showToast('Laporan berhasil diajukan ke Supervisor (Mulyana)! Tautan persetujuan telah diterbitkan.');
  };

  const handleUpdateReportFromApproval = (updated: CncDailyReport) => {
    const updatedList = loadReportsFromStorage();
    setReports(updatedList);
    setActiveReport(updated);
  };

  const handleResetData = () => {
    if (confirm('Reset seluruh data ke data contoh pabrik bawaan?')) {
      const resetList = resetReportsToDemo();
      setReports(resetList);
      setActiveReport(resetList[0]);
      setCurrentView('dashboard');
      showToast('Data demo berhasil di-reset.');
    }
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    const updated = loadReportsFromStorage();
    setReports(updated);
    if (activeReport?.id === id) {
      setActiveReport(updated[0] || null);
    }
    showToast(`Laporan ${id} telah dihapus.`);
  };

  const handleClearAllReports = () => {
    clearAllReportsToZero();
    setReports([]);
    setActiveReport(null);
    showToast('Seluruh data laporan berhasil dibersihkan.');
  };

  const handleOpenApproval = (reportId: string, role: 'supervisor' | 'gm') => {
    const target = reports.find((r) => r.id === reportId) || getReportById(reportId);
    if (target) {
      setActiveReport(target);
      setApprovalRole(role);
      setCurrentView('approval');
    }
  };

  const handleNavigatePrint = (report: CncDailyReport) => {
    setActiveReport(report);
    setCurrentView('print');
  };

  // Stats calculation
  const stats = {
    total: reports.length,
    pendingSupervisor: reports.filter((r) => r.status === 'PENDING_SUPERVISOR').length,
    pendingGm: reports.filter((r) => r.status === 'PENDING_GM').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      {currentView !== 'print' && (
        <HeaderNav
          currentView={currentView}
          onNavigate={(v) => {
            setCurrentView(v);
            if (v === 'dashboard') {
              window.location.hash = '';
            }
          }}
          onNewReport={handleNewReport}
          onResetData={handleResetData}
          currentUser={currentUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          stats={stats}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <TrackingDashboard
            reports={reports}
            onSelectReport={(r) => {
              setActiveReport(r);
              setCurrentView('form');
            }}
            onEditReport={(r) => {
              setActiveReport(r);
              setCurrentView('form');
            }}
            onOpenApproval={handleOpenApproval}
            onNavigatePrint={handleNavigatePrint}
            onOpenShareModal={(r) => setShareModalReport(r)}
            onNewReport={handleNewReport}
            onDeleteReport={handleDeleteReport}
            onClearAllReports={handleClearAllReports}
            onResetData={handleResetData}
          />
        )}

        {currentView === 'form' && activeReport && (
          <OperatorForm
            report={activeReport}
            onSaveDraft={handleSaveDraft}
            onSubmitReport={handleSubmitReport}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'approval' && activeReport && (
          <ApprovalView
            report={activeReport}
            role={approvalRole}
            onUpdateReport={handleUpdateReportFromApproval}
            onNavigateDashboard={() => {
              window.location.hash = '';
              setCurrentView('dashboard');
            }}
            onNavigatePrint={handleNavigatePrint}
            onOpenShareModal={(r) => setShareModalReport(r)}
          />
        )}

        {currentView === 'print' && activeReport && (
          <PhysicalFormPrint
            report={activeReport}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Share / Unique Link & Google Drive Modal */}
      {shareModalReport && (
        <ApprovalShareModal
          report={shareModalReport}
          isOpen={!!shareModalReport}
          onClose={() => setShareModalReport(null)}
          onOpenApproval={(id, role) => {
            setShareModalReport(null);
            handleOpenApproval(id, role);
          }}
          currentUser={currentUser}
          accessToken={driveAccessToken}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
        />
      )}
    </div>
  );
}
