import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table (links to Firebase Auth UID)
export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// CNC Daily Reports table stored in PostgreSQL
export const cncReports = pgTable('cnc_reports', {
  id: text('id').primaryKey(), // e.g. CNC-202609-001
  sasaNo: text('sasa_no').notNull(), // Sosa No / SPK No
  project: text('project').notNull(),
  operatorName: text('operator_name').notNull(),
  shift: text('shift').notNull(),
  dayAndDate: text('day_and_date').notNull(),
  status: text('status').notNull(), // DRAFT, PENDING_SUPERVISOR, PENDING_GM, APPROVED, REJECTED
  supervisorToken: text('supervisor_token'),
  gmToken: text('gm_token'),
  supervisorName: text('supervisor_name').default('Mulyana'),
  gmName: text('gm_name').default('Arifin'),
  reportData: jsonb('report_data').notNull(), // Complete report JSON (sections A-F, timeline, approvals)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
