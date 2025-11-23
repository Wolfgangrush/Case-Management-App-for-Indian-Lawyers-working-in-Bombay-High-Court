export enum CaseStage {
  ADMISSION = 'FOR ADMISSION',
  HEARING = 'FINAL HEARING',
  ORDERS = 'FOR ORDERS',
  DISPOSED = 'DISPOSED',
  FILING = 'DEFECT COMPLIANCE'
}

export enum CourtType {
  HC_BOMBAY = 'High Court of Bombay',
  HC_NAGPUR = 'High Court (Nagpur Bench)',
  DISTRICT = 'District Court',
  SUPREME = 'Supreme Court of India'
}

export interface ClientCaseDetails {
  cnr: string;
  caseType: string; // e.g., CRA, WP
  filingNumber?: string;
  filingDate?: string;
  registrationNumber?: string;
  registrationDate?: string;
  firstHearingDate?: string;
  nextHearingDate?: string;
  stage?: string; // e.g., FOR ADMISSION
  coram?: string; // Judge Name
  benchType?: string; // Single, Division
  judicialBranch?: string; // Civil, Criminal
  state?: string;
  district?: string;
  acts?: string; // e.g., Code of Civil Procedure 1908
  sections?: string; // e.g., 115
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Lead';
  totalMatters: number;
  // New fields for integration
  caseDetails?: ClientCaseDetails;
  folderId?: string; // Link to Digital Vault folder
  instructions?: string; // Instructions/Notes
}

export interface Case {
  id: string;
  cnr: string;
  filingDate: string;
  registrationNumber: string;
  petitioner: string;
  respondent: string;
  court: CourtType;
  bench: string;
  judge: string; // Coram
  stage: CaseStage;
  nextHearing: string;
  caseType: string; // e.g., WP, APL, CRA
}

export interface StatMetric {
  label: string;
  value: string | number;
  trend: number; // percentage
  icon: any;
}

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  purpose: string;
  courtHall: string;
}

export interface Act {
  id: string;
  shortName: string;
  fullName: string;
  year: string;
  category: 'Criminal' | 'Civil' | 'Constitutional' | 'Corporate';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  associatedCaseId?: string;
  associatedClientId?: string;
}

export interface TimeEntry {
  id: string;
  clientId: string;
  clientName: string;
  caseId: string; // Optional, maybe general consultation
  description: string;
  date: string;
  hours: number;
  rate: number;
  amount: number;
  billed: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  items: TimeEntry[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid';
}

export interface FileSystemItem {
  id: string;
  parentId: string | null; // null represents root
  name: string;
  type: 'folder' | 'file';
  fileType?: 'pdf' | 'doc' | 'xls' | 'image' | 'unknown';
  size?: string;
  date: string;
  fileUrl?: string; // Blob URL for previewing content
}