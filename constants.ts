import { Case, CaseStage, Client, CourtType, Hearing, Act, Task } from './types';
import { Gavel, Users, FileText, AlertCircle, BookOpen, PenTool, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';

export const CASE_TYPES = [
  { code: 'AA', name: 'Arbitration Appeals' },
  { code: 'ABA', name: 'Criminal Anticipatory Bail' },
  { code: 'AO', name: 'Appeal from Order' },
  { code: 'APEAL', name: 'Criminal Appeal' },
  { code: 'APL', name: 'Criminal Application U/s 482' },
  { code: 'APPA', name: 'Criminal Application in Appeal' },
  { code: 'APPCO', name: 'Application in Cr. Conf.' },
  { code: 'APPCP', name: 'Application in Cr. Cont. Petition' },
  { code: 'APPLN', name: 'Criminal Application' },
  { code: 'APPP', name: 'Criminal Application in Application' },
  { code: 'APPR', name: 'Criminal Application in Revision' },
  { code: 'APPW', name: 'Criminal Application in Writ Petition' },
  { code: 'ARA', name: 'Arbitration Application' },
  { code: 'ARP', name: 'Arbitration Petition' },
  { code: 'BA', name: 'Criminal Bail Application' },
  { code: 'CA', name: 'Civil Application' },
  { code: 'CAA', name: 'Civil Application in AO' },
  { code: 'CAC', name: 'Civil Application in CRA' },
  { code: 'CAE', name: 'Civil Application in Civil Reference' },
  { code: 'CAF', name: 'Civil Application in Civil FA' },
  { code: 'CAL', name: 'Company Application' },
  { code: 'CALCR', name: 'Company Applications (Criminal)' },
  { code: 'CAM', name: 'Civil Application in AA' },
  { code: 'CAN', name: 'Civil Application in CP' },
  { code: 'CAO', name: 'CA in others (MCA.EP/CA/XOB/CMP)' },
  { code: 'CAP', name: 'Company Appeal' },
  { code: 'CAPL', name: 'Custom Appeal' },
  { code: 'CAS', name: 'Civil Application in Second Appeal (SA)' },
  { code: 'CAT', name: 'Civil Application in Tax Matters' },
  { code: 'CAW', name: 'Civil Application in Writ Petitions (WP)' },
  { code: 'CAZ', name: 'Civil Application in LPA' },
  { code: 'CEL', name: 'Central Excise Appeal' },
  { code: 'CER', name: 'Central Excise Reference' },
  { code: 'CMP', name: 'Company Petition' },
  { code: 'COMAP', name: 'Commercial Appeal' },
  { code: 'CONF', name: 'Criminal Confirmation Case' },
  { code: 'CONP', name: 'Criminal Contempt Petition' },
  { code: 'CP', name: 'Cont. Petition' },
  { code: 'CPL', name: 'Contempt Appeal' },
  { code: 'CRA', name: 'Civil Revision Application' },
  { code: 'C.REF', name: 'Civil Reference' },
  { code: 'CRPIL', name: 'Criminal PIL' },
  { code: 'CS', name: 'Civil Suits (Transfer Civil Suits)' },
  { code: 'EDR', name: 'Estate Duty Reference' },
  { code: 'EP', name: 'Election Petition' },
  { code: 'FA', name: 'First Appeal' },
  { code: 'FCA', name: 'Family Court Appeal' },
  { code: 'GTA', name: 'Gift Tax Application' },
  { code: 'GTR', name: 'Gift Tax Reference' },
  { code: 'ITA', name: 'Income Tax Application' },
  { code: 'ITL', name: 'Income Tax Appeal' },
  { code: 'ITR', name: 'Income Tax Reference' },
  { code: 'LPA', name: 'Letter Patent Appeal' },
  { code: 'MCA', name: 'Miscellaneous Civil Application' },
  { code: 'OLR', name: 'Official Liquidator Report' },
  { code: 'PIL', name: 'Public Interest Litigation' },
  { code: 'RAP', name: 'Review Petition in ARA' },
  { code: 'RC', name: 'Rejected Case' },
  { code: 'REF', name: 'Criminal Reference' },
  { code: 'REVN', name: 'Criminal Revision Application' },
  { code: 'RPA', name: 'Review Petition in AO' },
  { code: 'RPC', name: 'Review Petition in CRA' },
  { code: 'RPC (FCA)', name: 'Review Petition in FCA' },
  { code: 'RPF', name: 'Review Petition in FA' },
  { code: 'RPL', name: 'Review Petition in LPA' },
  { code: 'RPN', name: 'Review Petition in CP' },
  { code: 'RPR', name: 'Review Petition in ARP' },
  { code: 'RPS', name: 'Review Petition in SA' },
  { code: 'RPW', name: 'Review Petition in WP' },
  { code: 'SA', name: 'Second Appeal' },
  { code: 'SMAP', name: 'Criminal Suo Motu Application' },
  { code: 'SMC', name: 'Suo Motu Contempt Petition' },
  { code: 'SMCP', name: 'Criminal Suo Motu Contempt Petition' },
  { code: 'SMP', name: 'Suo Motu Cr. PIL' },
  { code: 'SMWP', name: 'Suo Motu Cr. Writ Petition' },
  { code: 'SPLCA', name: 'Special Civil Application' },
  { code: 'STA', name: 'Sales Tax Application' },
  { code: 'STR', name: 'Sales Tax Reference' },
  { code: 'STXA', name: 'Sales Tax Appeal' },
  { code: 'WP', name: 'Writ Petition' },
  { code: 'WTA', name: 'Wealth Tax Application' },
  { code: 'WTL', name: 'Wealth Tax Appeal' },
  { code: 'WTR', name: 'Wealth Tax Reference' },
  { code: 'XOB', name: 'Cross Objection' }
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'C001', name: 'Dream Infrastructure & Developers', company: 'Dream Infra Ltd.', email: 'contact@dreaminfra.com', phone: '+91 98765 43210', status: 'Active', address: 'Plot 44, Civil Lines, Nagpur', totalMatters: 3 },
  { id: 'C002', name: 'Rahul Naresh Puglia', email: 'rahul.p@example.com', phone: '+91 98765 12345', status: 'Active', address: 'Ramdaspeth, Nagpur', totalMatters: 1 },
  { id: 'C003', name: 'Amarsingh Rathod', email: 'amar.rathod@example.com', phone: '+91 99887 77665', status: 'Inactive', address: 'Wardha Road, Nagpur', totalMatters: 0 },
  { id: 'C004', name: 'TechSolutions Pvt Ltd', company: 'TechSolutions', email: 'legal@techsol.com', phone: '+91 77777 88888', status: 'Lead', address: 'IT Park, Parsodi', totalMatters: 0 },
];

export const MOCK_CASES: Case[] = [
  {
    id: 'CS-101',
    cnr: 'HCBM040341932025',
    filingDate: '03-11-2025',
    registrationNumber: '122/2025',
    petitioner: 'Rahul Naresh Puglia and Others',
    respondent: 'Atul N. Wandile and Others',
    court: CourtType.HC_NAGPUR,
    bench: 'Single Bench',
    judge: "Hon'ble Shri Justice Rohit Wasudeo Joshi",
    stage: CaseStage.ADMISSION,
    nextHearing: '2025-11-28',
    caseType: 'CRA'
  },
  {
    id: 'CS-102',
    cnr: 'HCBM040341122025',
    filingDate: '15-10-2025',
    registrationNumber: 'WP/453/2025',
    petitioner: 'Dream Infrastructure',
    respondent: 'State of Maharashtra',
    court: CourtType.HC_NAGPUR,
    bench: 'Division Bench',
    judge: "Hon'ble Justice A.S. Chandurkar",
    stage: CaseStage.HEARING,
    nextHearing: '2025-11-29',
    caseType: 'WP'
  },
  {
    id: 'CS-103',
    cnr: 'MHNG010045672024',
    filingDate: '01-02-2024',
    registrationNumber: 'RCC/89/2024',
    petitioner: 'State of Maharashtra',
    respondent: 'Vinod Dinanath Disuja',
    court: CourtType.DISTRICT,
    bench: 'JMFC Court 4',
    judge: "V.K. Deshpande",
    stage: CaseStage.FILING,
    nextHearing: '2025-12-05',
    caseType: 'RCC'
  }
];

export const TODAY_HEARINGS: Hearing[] = [
  { id: 'H1', caseId: 'CS-101', date: '2025-11-20', time: '10:30 AM', purpose: 'For Admission', courtHall: 'Court Room B' },
  { id: 'H2', caseId: 'CS-102', date: '2025-11-20', time: '02:15 PM', purpose: 'Final Hearing', courtHall: 'Court Room A' }
];

export const RECENT_DOCUMENTS = [
  { title: 'Impugned Order_DistrictCourt.pdf', case: 'Rahul Puglia vs Atul Wandile', date: '2 mins ago', type: 'Order' },
  { title: 'Written_Statement_Draft_v2.docx', case: 'Dream Infra vs State', date: '2 hours ago', type: 'Pleading' },
  { title: 'Vakalatnama_Scan.pdf', case: 'Amarsingh Rathod', date: 'Yesterday', type: 'Admin' },
];

export const KNOWLEDGE_BASE: Act[] = [
  { id: 'ACT-01', shortName: 'BNS', fullName: 'Bharatiya Nyaya Sanhita', year: '2023', category: 'Criminal' },
  { id: 'ACT-02', shortName: 'BNSS', fullName: 'Bharatiya Nagarik Suraksha Sanhita', year: '2023', category: 'Criminal' },
  { id: 'ACT-03', shortName: 'BSA', fullName: 'Bharatiya Sakshya Adhiniyam', year: '2023', category: 'Criminal' },
  { id: 'ACT-04', shortName: 'CPC', fullName: 'Code of Civil Procedure', year: '1908', category: 'Civil' },
  { id: 'ACT-05', shortName: 'Const. Ind', fullName: 'Constitution of India', year: '1950', category: 'Constitutional' },
];

export const TASKS: Task[] = [
  { id: 'T1', title: 'File Rejoinder in WP/453', dueDate: '2025-11-25', priority: 'High', status: 'In Progress', associatedCaseId: 'CS-102' },
  { id: 'T2', title: 'Client Meeting: Dream Infra', dueDate: '2025-11-22', priority: 'Medium', status: 'Pending', associatedCaseId: 'CS-102' },
  { id: 'T3', title: 'Pay Court Fees', dueDate: '2025-11-21', priority: 'Low', status: 'Pending' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Cockpit', icon: Gavel },
  { id: 'matters', label: 'Matters', icon: FileText },
  { id: 'clients', label: 'Contacts', icon: Users },
  { id: 'billing', label: 'Billable Hours', icon: IndianRupee },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'drafting', label: 'Drafter AI', icon: PenTool },
  { id: 'research', label: 'Lex Indica', icon: BookOpen },
  { id: 'vault', label: 'Digital Vault', icon: AlertCircle },
];