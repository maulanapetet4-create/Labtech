import { db } from './index.ts';
import { users, cncReports } from './schema.ts';
import { eq, desc } from 'drizzle-orm';
import { CncDailyReport } from '../types.ts';

// User sync
export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
          photoUrl: photoUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (err) {
    console.error('Database query failed for getOrCreateUser:', err);
    throw new Error('Database operation failed', { cause: err });
  }
}

// Reports repository methods for Cloud SQL
export async function getCloudSqlReports(): Promise<CncDailyReport[]> {
  try {
    const rows = await db.select().from(cncReports).orderBy(desc(cncReports.createdAt));
    return rows.map((r) => r.reportData as CncDailyReport);
  } catch (err) {
    console.error('Failed to get reports from Cloud SQL:', err);
    throw new Error('Database query failed', { cause: err });
  }
}

export async function getCloudSqlReportByIdOrToken(idOrToken: string): Promise<CncDailyReport | null> {
  try {
    const rows = await db.select().from(cncReports);
    const found = rows.find(
      (r) => r.id === idOrToken || r.supervisorToken === idOrToken || r.gmToken === idOrToken
    );
    return found ? (found.reportData as CncDailyReport) : null;
  } catch (err) {
    console.error('Failed to get report by id/token from Cloud SQL:', err);
    throw new Error('Database query failed', { cause: err });
  }
}

export async function saveOrUpdateCloudSqlReport(report: CncDailyReport): Promise<CncDailyReport> {
  try {
    await db
      .insert(cncReports)
      .values({
        id: report.id,
        sasaNo: report.sasaNo || '',
        project: report.project || '',
        operatorName: report.operatorName || '',
        shift: report.shift || '',
        dayAndDate: report.dayAndDate || '',
        status: report.status || 'DRAFT',
        supervisorToken: report.supervisorToken || null,
        gmToken: report.gmToken || null,
        supervisorName: report.supervisorName || 'Mulyana',
        gmName: report.gmName || 'Arifin',
        reportData: report,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cncReports.id,
        set: {
          sasaNo: report.sasaNo || '',
          project: report.project || '',
          operatorName: report.operatorName || '',
          shift: report.shift || '',
          dayAndDate: report.dayAndDate || '',
          status: report.status || 'DRAFT',
          supervisorToken: report.supervisorToken || null,
          gmToken: report.gmToken || null,
          supervisorName: report.supervisorName || 'Mulyana',
          gmName: report.gmName || 'Arifin',
          reportData: report,
          updatedAt: new Date(),
        },
      });
    return report;
  } catch (err) {
    console.error('Failed to save report to Cloud SQL:', err);
    throw new Error('Database insert failed', { cause: err });
  }
}

export async function deleteCloudSqlReport(id: string): Promise<boolean> {
  try {
    await db.delete(cncReports).where(eq(cncReports.id, id));
    return true;
  } catch (err) {
    console.error('Failed to delete report in Cloud SQL:', err);
    throw new Error('Database delete failed', { cause: err });
  }
}

export async function clearAllCloudSqlReports(): Promise<boolean> {
  try {
    await db.delete(cncReports);
    return true;
  } catch (err) {
    console.error('Failed to clear reports in Cloud SQL:', err);
    throw new Error('Database clear failed', { cause: err });
  }
}
