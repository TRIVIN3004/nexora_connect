import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserCheck, 
  UserX, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  Send, 
  Calendar, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  Users, 
  Info, 
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { EmailService } from '../services/email';
import type { AttendanceRecord } from '../services/database';

// Default 15 Present Students for standard initial sync
const defaultPresentEmails = [
  'trivintrivin2005@gmail.com',
  'naveensv0112@gmail.com',
  'kanimozhiprakash2006@gmail.com',
  'ireneclemencia2311@gmail.com',
  'srdharshanraj@gmail.com',
  'kishoremohan1307@gmail.com',
  'krmadona23@gmail.com',
  'nidiyarajkadavan@gmail.com',
  'pavithraayohan@gmail.com',
  'ssujitha9307@gmail.com',
  'prishaaraj06@gmail.com',
  'cathrinemary0208@gmail.com',
  'sangamithrakesavan8@gmail.com',
  'vishwakrish2006@gmail.com',
  'keerthivasan@gmail.com'
];

interface StudentRosterItem {
  id: string;
  name: string;
  email: string;
  designation?: string;
  avatarUrl?: string;
  status: 'PRESENT' | 'ABSENT';
  remarks?: string;
}

export const AttendanceManager: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const allUsers = db.getUsers();
  const attendanceRecords = db.getAttendanceRecords();

  // Active Session Form State
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTitle, setSessionTitle] = useState<string>('Daily Technical Training & Internship Standup');
  const [customRemarks, setCustomRemarks] = useState<string>('');
  
  // Email options
  const [sendPresentEmails, setSendPresentEmails] = useState<boolean>(true);
  const [sendAbsentWarnings, setSendAbsentWarnings] = useState<boolean>(true);
  const [sendAdminReports, setSendAdminReports] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT'>('ALL');

  // Smart Paste Modal State
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState<boolean>(false);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [smartPasteStats, setSmartPasteStats] = useState<{ matched: number; totalPasted: number; unmatchedTokens: string[] } | null>(null);

  // Dispatch Progress State
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchProgress, setDispatchProgress] = useState<{
    current: number;
    total: number;
    currentAction: string;
    logs: string[];
    isDone: boolean;
  }>({ current: 0, total: 0, currentAction: '', logs: [], isDone: false });

  // History Detail Modal
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<AttendanceRecord | null>(null);

  // Initialize Roster State
  const [roster, setRoster] = useState<StudentRosterItem[]>(() => {
    return allUsers.map(u => ({
      id: u.id || u.email,
      name: u.name,
      email: u.email,
      designation: u.designation || 'Software Associate',
      avatarUrl: u.avatarUrl,
      status: defaultPresentEmails.includes(u.email.toLowerCase()) ? 'PRESENT' : 'ABSENT',
      remarks: ''
    }));
  });

  // Calculate Metrics
  const totalStudents = roster.length;
  const presentCount = roster.filter(s => s.status === 'PRESENT').length;
  const absentCount = roster.filter(s => s.status === 'ABSENT').length;
  const turnoutRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0';

  const totalEmailsQueued = 
    (sendPresentEmails ? presentCount : 0) + 
    (sendAbsentWarnings ? absentCount : 0) + 
    (sendAdminReports ? 2 : 0);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.designation && student.designation.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'ALL' || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [roster, searchQuery, statusFilter]);

  // Toggle single student status
  const toggleStudentStatus = (id: string) => {
    setRoster(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT'
        };
      }
      return s;
    }));
  };

  // Mark single student status directly
  const setStudentStatus = (id: string, status: 'PRESENT' | 'ABSENT') => {
    setRoster(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  // Bulk Actions
  const handleMarkAllPresent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'PRESENT' })));
  };

  const handleMarkAllAbsent = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: 'ABSENT' })));
  };

  const handleInvertSelection = () => {
    setRoster(prev => prev.map(s => ({ ...s, status: s.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' })));
  };

  const handleResetToDefault = () => {
    setRoster(allUsers.map(u => ({
      id: u.id || u.email,
      name: u.name,
      email: u.email,
      designation: u.designation || 'Software Associate',
      avatarUrl: u.avatarUrl,
      status: defaultPresentEmails.includes(u.email.toLowerCase()) ? 'PRESENT' : 'ABSENT',
      remarks: ''
    })));
  };

  // Smart Paste Auto-Match Algorithm
  const handleApplySmartPaste = () => {
    if (!pasteInput.trim()) return;

    // Split input by lines, commas, tabs, semicolons
    const tokens = pasteInput
      .split(/[\n,\t;]+/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 1);

    if (tokens.length === 0) return;

    let matchedCount = 0;
    const unmatched: string[] = [];

    // Check which users match
    const matchedUserEmails = new Set<string>();

    tokens.forEach(token => {
      let foundMatch = false;

      allUsers.forEach(u => {
        const uEmail = u.email.toLowerCase();
        const uName = u.name.toLowerCase();

        // Exact or fuzzy token checks
        if (
          uEmail === token ||
          uName === token ||
          uName.includes(token) ||
          token.includes(uName) ||
          // partial first/last name matches
          uName.split(' ').some(part => part.length >= 3 && (token.includes(part) || part.includes(token)))
        ) {
          matchedUserEmails.add(uEmail);
          foundMatch = true;
        }
      });

      // Special alias checks
      if (!foundMatch) {
        if (token.includes('dharshan') || token.includes('dharsha')) {
          matchedUserEmails.add('srdharshanraj@gmail.com');
          foundMatch = true;
        } else if (token.includes('prisha') || token.includes('prishaa')) {
          matchedUserEmails.add('prishaaraj06@gmail.com');
          foundMatch = true;
        } else if (token.includes('rubeena') || token.includes('rubena') || token.includes('cathrine')) {
          matchedUserEmails.add('cathrinemary0208@gmail.com');
          foundMatch = true;
        } else if (token.includes('keerthi') || token.includes('keerthivasan')) {
          matchedUserEmails.add('keerthivasan@gmail.com');
          foundMatch = true;
        } else if (token.includes('irene') || token.includes('clemencia')) {
          matchedUserEmails.add('ireneclemencia2311@gmail.com');
          foundMatch = true;
        }
      }

      if (!foundMatch) {
        unmatched.push(token);
      }
    });

    // Update roster: matched = PRESENT, others = ABSENT
    setRoster(prev => prev.map(s => {
      const isMatched = matchedUserEmails.has(s.email.toLowerCase());
      if (isMatched) matchedCount++;
      return {
        ...s,
        status: isMatched ? 'PRESENT' : 'ABSENT'
      };
    }));

    setSmartPasteStats({
      matched: matchedUserEmails.size,
      totalPasted: tokens.length,
      unmatchedTokens: unmatched
    });
  };

  // Format Display Date
  const formattedDateString = useMemo(() => {
    try {
      const [y, m, d] = sessionDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return sessionDate;
    }
  }, [sessionDate]);

  // Execute Email Dispatch Protocol
  const handleExecuteDispatch = async () => {
    const presentStudents = roster.filter(s => s.status === 'PRESENT');
    const absentStudents = roster.filter(s => s.status === 'ABSENT');

    const totalToDispatch = 
      (sendPresentEmails ? presentStudents.length : 0) + 
      (sendAbsentWarnings ? absentStudents.length : 0) + 
      (sendAdminReports ? 2 : 0);

    const confirmMsg = `Are you ready to record attendance and dispatch emails for ${formattedDateString}?\n\n` +
      `• Present Students: ${presentStudents.length} (Confirmation Emails: ${sendPresentEmails ? 'YES' : 'NO'})\n` +
      `• Absent Students: ${absentStudents.length} (Warning Notices: ${sendAbsentWarnings ? 'YES' : 'NO'})\n` +
      `• Executive Admin Reports: ${sendAdminReports ? '2 Admins' : 'NONE'}\n` +
      `• Total Emails to Dispatch: ${totalToDispatch}\n\n` +
      `Click OK to proceed with real-time automated delivery.`;

    if (!window.confirm(confirmMsg)) return;

    setIsDispatching(true);
    setDispatchProgress({
      current: 0,
      total: totalToDispatch,
      currentAction: 'Initializing Nexora Attendance Email Dispatch Protocol...',
      logs: [`[INITIALIZE] Attendance Marker Protocol started for ${formattedDateString}`],
      isDone: false
    });

    let sentCount = 0;
    let presentSent = 0;
    let absentSent = 0;
    let adminSent = 0;

    const appendLog = (msg: string) => {
      setDispatchProgress(prev => ({
        ...prev,
        logs: [msg, ...prev.logs]
      }));
    };

    // 1. Send Present Confirmation Emails
    if (sendPresentEmails && presentStudents.length > 0) {
      appendLog(`>>> [PHASE 1] Dispatching Attendance Confirmation to ${presentStudents.length} Present Students...`);
      for (const student of presentStudents) {
        setDispatchProgress(prev => ({
          ...prev,
          current: sentCount,
          currentAction: `Sending Confirmation to ${student.name} (${student.email})...`
        }));

        try {
          const res = await EmailService.sendAttendancePresentEmail(
            student.email,
            student.name,
            formattedDateString,
            sessionTitle,
            customRemarks
          );
          sentCount++;
          presentSent++;
          appendLog(`✓ [PRESENT CONFIRMED] ${student.name} (${student.email}) — ${res.success ? 'Delivered' : 'Logged'}`);
        } catch (err: any) {
          sentCount++;
          appendLog(`✗ [PRESENT ERROR] ${student.name} — ${err.message || 'Failed'}`);
        }

        // Slight rate limiting delay
        await new Promise(r => setTimeout(r, 120));
      }
    }

    // 2. Send Absence Warning Emails
    if (sendAbsentWarnings && absentStudents.length > 0) {
      appendLog(`>>> [PHASE 2] Dispatching Official Absence Warning Notices to ${absentStudents.length} Absent Students...`);
      for (const student of absentStudents) {
        setDispatchProgress(prev => ({
          ...prev,
          current: sentCount,
          currentAction: `Sending Warning Notice to ${student.name} (${student.email})...`
        }));

        try {
          const res = await EmailService.sendAttendanceAbsentWarningEmail(
            student.email,
            student.name,
            formattedDateString,
            sessionTitle,
            customRemarks
          );
          sentCount++;
          absentSent++;
          appendLog(`⚠️ [WARNING SENT] ${student.name} (${student.email}) — ${res.success ? 'Delivered' : 'Logged'}`);
        } catch (err: any) {
          sentCount++;
          appendLog(`✗ [WARNING ERROR] ${student.name} — ${err.message || 'Failed'}`);
        }

        // Slight rate limiting delay
        await new Promise(r => setTimeout(r, 120));
      }
    }

    // 3. Send Executive Admin Reports
    if (sendAdminReports) {
      appendLog(`>>> [PHASE 3] Dispatching Executive Attendance Report to Administrators...`);
      const adminRecipients = [
        { name: 'Nexora Administrator', email: 'contactnexoratechs@gmail.com' },
        { name: 'Trivin (Managing Director)', email: 'trivintrivin2005@gmail.com' }
      ];

      for (const admin of adminRecipients) {
        setDispatchProgress(prev => ({
          ...prev,
          current: sentCount,
          currentAction: `Sending Executive Report to ${admin.name}...`
        }));

        try {
          const res = await EmailService.sendAttendanceAdminReport(
            admin.email,
            admin.name,
            formattedDateString,
            sessionTitle,
            presentStudents.map(s => ({ name: s.name, email: s.email })),
            absentStudents.map(s => ({ name: s.name, email: s.email })),
            customRemarks
          );
          sentCount++;
          adminSent++;
          appendLog(`📊 [ADMIN REPORT] ${admin.name} (${admin.email}) — ${res.success ? 'Delivered' : 'Logged'}`);
        } catch (err: any) {
          sentCount++;
          appendLog(`✗ [ADMIN REPORT ERROR] ${admin.name} — ${err.message || 'Failed'}`);
        }

        await new Promise(r => setTimeout(r, 120));
      }
    }

    // 4. Save Record to Database
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: sessionDate,
      formattedDate: formattedDateString,
      sessionTitle: sessionTitle,
      totalStudents: totalStudents,
      presentCount: presentStudents.length,
      absentCount: absentStudents.length,
      presentEmails: presentStudents.map(s => s.email),
      absentEmails: absentStudents.map(s => s.email),
      students: roster.map(s => ({
        name: s.name,
        email: s.email,
        status: s.status,
        remarks: s.remarks
      })),
      markedBy: currentUser.email,
      markedByName: currentUser.name,
      emailsSent: totalToDispatch > 0,
      presentEmailsSent: presentSent,
      absentWarningsSent: absentSent,
      adminReportsSent: adminSent,
      notes: customRemarks || 'Session attendance recorded and verified.',
      createdAt: new Date().toISOString()
    };

    db.saveAttendanceRecord(newRecord);
    db.createAuditLog(
      currentUser.email,
      currentUser.name,
      'RECORD_ATTENDANCE_AND_DISPATCH_EMAILS',
      'ATTENDANCE',
      newRecord.id
    );

    appendLog(`🌟 [SUCCESS] Attendance record saved successfully with ID ${newRecord.id}`);

    setDispatchProgress(prev => ({
      ...prev,
      current: totalToDispatch,
      currentAction: 'All attendance emails successfully processed and delivered!',
      isDone: true
    }));

    triggerRefresh();
  };

  // Export Attendance Record to CSV
  const handleExportCSV = (record: AttendanceRecord) => {
    const headers = ['#', 'Student Name', 'Email Address', 'Status', 'Session Date', 'Session Title'];
    const rows = record.students.map((s, idx) => [
      idx + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      s.status,
      `"${record.formattedDate}"`,
      `"${record.sessionTitle.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nexora_Attendance_${record.date}_${record.sessionTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteHistoryRecord = (id: string, date: string) => {
    if (window.confirm(`Delete historical attendance record for ${date}?`)) {
      db.deleteAttendanceRecord(id);
      db.createAuditLog(currentUser.email, currentUser.name, 'DELETE_ATTENDANCE_RECORD', 'ATTENDANCE', id);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* ====================================================
          TOP HERO / METRICS BANNER
          ==================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-nexora-navy to-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 text-white shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-nexora-blue/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-nexora-blue/20 border border-nexora-blue/40 text-nexora-electric text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldAlert size={13} />
              <span>Official Attendance Protocol</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Live Attendance Marker & Automated Mailer
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-1.5 leading-relaxed">
              Log daily session attendance, match attendees with smart auto-detection, send instant congratulations to Present students, dispatch mandatory 85% attendance warning notices to Absent students, and submit executive summary reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIsSmartPasteOpen(true);
                setSmartPasteStats(null);
                setPasteInput('');
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-nexora-blue to-sky-500 hover:from-nexora-navy hover:to-sky-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles size={15} />
              <span>✨ Smart Paste & Match Names</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-1.5"
              title="Reset to verified default 15 present students"
            >
              <RefreshCw size={14} />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Enrolled</span>
              <Users size={16} className="text-blue-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">{totalStudents}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Students in directory</div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-md p-4 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Present Today</span>
              <UserCheck size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-400">{presentCount}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5 font-semibold">{turnoutRate}% turnout rate</div>
          </div>

          <div className="bg-rose-950/40 backdrop-blur-md p-4 rounded-xl border border-rose-500/30">
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Absent (Warnings)</span>
              <UserX size={16} className="text-rose-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-rose-400">{absentCount}</div>
            <div className="text-[10px] text-rose-300/80 mt-0.5 font-semibold">{(100 - Number(turnoutRate)).toFixed(1)}% absentees</div>
          </div>

          <div className="bg-sky-950/40 backdrop-blur-md p-4 rounded-xl border border-sky-500/30">
            <div className="flex items-center justify-between text-sky-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Mails To Dispatch</span>
              <Mail size={16} className="text-sky-400" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-sky-300">{totalEmailsQueued}</div>
            <div className="text-[10px] text-sky-400/80 mt-0.5 font-semibold">Real-time Resend API</div>
          </div>
        </div>
      </div>

      {/* ====================================================
          SESSION CONFIGURATION CARD
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-nexora-blue/10 text-nexora-blue dark:text-nexora-electric rounded-lg">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Session Configuration</h3>
              <p className="text-xs text-slate-500">Configure the date, session title, and instructor remarks for emails</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Date:</span>
            <div className="text-xs font-bold text-nexora-blue dark:text-nexora-electric">{formattedDateString}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Session Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexora-blue"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Session Title / Masterclass Topic
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Daily Technical Training & Internship Standup"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexora-blue"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Instructor Remarks / Announcements (Optional — Appended to Student & Admin Emails)
          </label>
          <textarea
            rows={2}
            value={customRemarks}
            onChange={(e) => setCustomRemarks(e.target.value)}
            placeholder="e.g. Great progress on today's frontend milestone. Tomorrow we review full backend API integration."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexora-blue resize-none"
          />
        </div>
      </div>

      {/* ====================================================
          ROSTER & ATTENDANCE MARKER TOOLBAR
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Student Attendance Roster ({roster.length})
              </h3>
              <p className="text-xs text-slate-500">
                Click any student's status pill to toggle between Present and Absent
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Check size={13} />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleMarkAllAbsent}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <X size={13} />
              <span>Mark All Absent</span>
            </button>
            <button
              onClick={handleInvertSelection}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Invert
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name, email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nexora-blue"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({roster.length})
            </button>
            <button
              onClick={() => setStatusFilter('PRESENT')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                statusFilter === 'PRESENT'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
              }`}
            >
              <span>Present</span>
              <span className="text-[10px] bg-emerald-600/30 px-1.5 py-0.2 rounded-full font-mono">{presentCount}</span>
            </button>
            <button
              onClick={() => setStatusFilter('ABSENT')}
              className={`flex-1 md:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                statusFilter === 'ABSENT'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20'
              }`}
            >
              <span>Absent</span>
              <span className="text-[10px] bg-rose-600/30 px-1.5 py-0.2 rounded-full font-mono">{absentCount}</span>
            </button>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="border border-slate-200 dark:border-dark-border rounded-xl overflow-hidden">
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm z-10 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5 w-12 text-center">#</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5 hidden sm:table-cell">Designation / Role</th>
                  <th className="p-3.5 text-center w-48">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredRoster.map((student, idx) => {
                  const isPresent = student.status === 'PRESENT';
                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors ${
                        isPresent 
                          ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10' 
                          : 'hover:bg-rose-50/40 dark:hover:bg-rose-950/10'
                      }`}
                    >
                      <td className="p-3.5 text-center font-mono text-[11px] text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="p-3.5">
                        <div 
                          onClick={() => toggleStudentStatus(student.id)} 
                          className="flex items-center space-x-3 cursor-pointer select-none group"
                          title="Click to toggle status"
                        >
                          <div className="relative">
                            <img
                              src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={student.name}
                              className={`w-8 h-8 rounded-full object-cover border-2 transition-all group-hover:scale-105 ${
                                isPresent ? 'border-emerald-500' : 'border-rose-400'
                              }`}
                            />
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-dark-card ${
                                isPresent ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-nexora-blue transition-colors">{student.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 hidden sm:table-cell text-slate-600 dark:text-slate-300 text-xs">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-[11px]">
                          {student.designation || 'Software Associate'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center p-0.5 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'PRESENT')}
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
                              isPresent
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-emerald-500'
                            }`}
                          >
                            <Check size={12} />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(student.id, 'ABSENT')}
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
                              !isPresent
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <X size={12} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================================================
          EMAIL AUTOMATION & DISPATCH CONSOLE
          ==================================================== */}
      <div className="bg-gradient-to-br from-slate-900 to-nexora-navy text-white rounded-2xl p-6 md:p-8 shadow-xl space-y-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-nexora-blue/20 text-nexora-electric rounded-xl border border-nexora-blue/40">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Automated Email Dispatch Protocol
              </h3>
              <p className="text-xs text-slate-300">
                Select email broadcast streams and execute live dispatches with a single click
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Prepared Recipients:</span>
            <span className="text-sm font-extrabold text-nexora-electric font-mono">{totalEmailsQueued} Emails</span>
          </div>
        </div>

        {/* Checkbox Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Present Confirmation Option */}
          <div 
            onClick={() => setSendPresentEmails(!sendPresentEmails)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              sendPresentEmails 
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg' 
                : 'bg-slate-900/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={sendPresentEmails}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <div>
                <div className="font-bold text-xs text-emerald-400 flex items-center space-x-1.5">
                  <span>Present Confirmations</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {presentCount} Mails
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Sends green congratulations letter confirming presence, punctuality, and session topic.
                </p>
              </div>
            </div>
          </div>

          {/* Absent Warning Option */}
          <div 
            onClick={() => setSendAbsentWarnings(!sendAbsentWarnings)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              sendAbsentWarnings 
                ? 'bg-rose-950/40 border-rose-500/50 shadow-lg' 
                : 'bg-slate-900/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={sendAbsentWarnings}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
              />
              <div>
                <div className="font-bold text-xs text-rose-400 flex items-center space-x-1.5">
                  <span>Absence Warning Notices</span>
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {absentCount} Mails
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Sends official red warning letter with 85% attendance rule, HR contact, and portal links.
                </p>
              </div>
            </div>
          </div>

          {/* Admin Executive Report Option */}
          <div 
            onClick={() => setSendAdminReports(!sendAdminReports)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              sendAdminReports 
                ? 'bg-sky-950/40 border-sky-500/50 shadow-lg' 
                : 'bg-slate-900/50 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={sendAdminReports}
                onChange={() => {}}
                className="mt-1 w-4 h-4 text-sky-400 rounded focus:ring-sky-400"
              />
              <div>
                <div className="font-bold text-xs text-sky-300 flex items-center space-x-1.5">
                  <span>Admin Executive Summary</span>
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    2 Admins
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Sends full breakdown tables & metrics to Administrator and Trivin.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <Info size={14} className="text-nexora-blue shrink-0" />
            <span>Emails will be securely delivered via verified domain <strong>connect@mail.nexoratechs.xyz</strong></span>
          </div>

          <button
            type="button"
            onClick={handleExecuteDispatch}
            disabled={isDispatching || totalEmailsQueued === 0}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-nexora-blue via-sky-600 to-emerald-600 hover:from-nexora-navy hover:to-emerald-700 text-white font-black text-sm rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <Send size={16} />
            <span>🚀 Record Attendance & Dispatch All {totalEmailsQueued} Emails</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          ATTENDANCE HISTORY & SAVED SESSIONS
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Saved Attendance Sessions History ({attendanceRecords.length})
              </h3>
              <p className="text-xs text-slate-500">
                View previous session records, exported CSV logs, and turnout rates
              </p>
            </div>
          </div>
        </div>

        {attendanceRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No attendance records logged yet. Mark and save your first session above.
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-dark-border rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Date & Session Title</th>
                  <th className="p-3.5 text-center">Turnout</th>
                  <th className="p-3.5 text-center">Present / Absent</th>
                  <th className="p-3.5 text-center">Email Dispatch</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {attendanceRecords.map(record => {
                  const rate = record.totalStudents > 0 
                    ? ((record.presentCount / record.totalStudents) * 100).toFixed(1) 
                    : '0.0';

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{record.sessionTitle}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {record.formattedDate || record.date} • Logged by {record.markedByName}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-full font-bold font-mono text-[11px]">
                          {rate}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{record.presentCount} Present</span>
                        <span className="text-slate-300 dark:text-slate-600 mx-1.5">/</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{record.absentCount} Absent</span>
                      </td>
                      <td className="p-3.5 text-center">
                        {record.emailsSent ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            <CheckCircle2 size={11} />
                            <span>Mails Sent ({record.presentEmailsSent || record.presentCount} + {record.absentWarningsSent || record.absentCount})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No Mails Dispatched</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedHistoryRecord(record)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="View Full Student Breakdown"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportCSV(record)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                            title="Download CSV"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHistoryRecord(record.id, record.formattedDate || record.date)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
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

      {/* ====================================================
          MODAL: SMART PASTE & MATCH NAMES
          ==================================================== */}
      {isSmartPasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-nexora-blue/10 text-nexora-blue dark:text-nexora-electric rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Smart Paste & Auto-Match Attendance
                  </h3>
                  <p className="text-xs text-slate-500">Paste attendee names copied from Google Meet, Zoom, or Chat</p>
                </div>
              </div>
              <button
                onClick={() => setIsSmartPasteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Raw Attendee Names / Emails:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPasteInput(`Trivin\nnaveen\nkanimozhi\nirene clemencia\nkeerthivasan\ndharshan\nkishore mohan\nmadona\nnidiya\npavithraa\nsujitha\nprisha\nrubeena\nsangamithra\nvishwa`);
                  }}
                  className="text-[11px] text-nexora-blue dark:text-nexora-electric font-semibold hover:underline cursor-pointer"
                >
                  Insert Today's 15 Students Sample
                </button>
              </div>

              <textarea
                rows={7}
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                placeholder="Paste names or emails separated by new lines or commas:&#10;&#10;Trivin&#10;Naveen&#10;Kanimozhi&#10;Irene Clemencia&#10;Keerthivasan..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexora-blue resize-none"
              />
            </div>

            {smartPasteStats && (
              <div className={`p-3.5 rounded-xl border text-xs ${
                smartPasteStats.matched > 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 size={14} />
                  <span>
                    Successfully matched {smartPasteStats.matched} students as PRESENT!
                  </span>
                </div>
                <div className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                  Remaining {totalStudents - smartPasteStats.matched} students were automatically marked as ABSENT.
                </div>
                {smartPasteStats.unmatchedTokens.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 text-[10px] text-slate-500">
                    Unrecognized keywords: {smartPasteStats.unmatchedTokens.join(', ')}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSmartPasteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApplySmartPaste}
                className="px-5 py-2 bg-gradient-to-r from-nexora-blue to-emerald-600 hover:from-nexora-navy hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles size={13} />
                <span>Apply Auto-Match to Roster</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: REAL-TIME DISPATCH PROGRESS DIALOG
          ==================================================== */}
      {isDispatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up text-slate-900 dark:text-white">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className={`p-3 rounded-xl ${
                dispatchProgress.isDone 
                  ? 'bg-emerald-500/20 text-emerald-500' 
                  : 'bg-nexora-blue/20 text-nexora-electric animate-spin'
              }`}>
                {dispatchProgress.isDone ? <CheckCircle2 size={24} /> : <RefreshCw size={24} />}
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-wider">
                  {dispatchProgress.isDone ? 'Email Dispatch Completed! 🚀' : 'Dispatching Attendance Emails...'}
                </h3>
                <p className="text-xs text-slate-500">
                  {dispatchProgress.currentAction}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span>Progress</span>
                <span className="font-mono text-nexora-blue dark:text-nexora-electric">
                  {dispatchProgress.current} / {dispatchProgress.total} ({
                    dispatchProgress.total > 0 
                      ? Math.round((dispatchProgress.current / dispatchProgress.total) * 100) 
                      : 100
                  }%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-nexora-blue via-sky-500 to-emerald-500 h-full transition-all duration-200"
                  style={{
                    width: `${dispatchProgress.total > 0 ? (dispatchProgress.current / dispatchProgress.total) * 100 : 100}%`
                  }}
                />
              </div>
            </div>

            {/* Live Terminal Logs */}
            <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] h-44 overflow-y-auto space-y-1">
              {dispatchProgress.logs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>

            {dispatchProgress.isDone && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDispatching(false)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Close & View Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: HISTORY RECORD DETAILS VIEWER
          ==================================================== */}
      {selectedHistoryRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedHistoryRecord.sessionTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedHistoryRecord.formattedDate || selectedHistoryRecord.date} • Logged by {selectedHistoryRecord.markedByName}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Roster</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{selectedHistoryRecord.totalStudents}</div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Present</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedHistoryRecord.presentCount}</div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Absent</div>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{selectedHistoryRecord.absentCount}</div>
              </div>
            </div>

            {/* Student List in Record */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 font-bold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {selectedHistoryRecord.students.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{s.email}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          s.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleExportCSV(selectedHistoryRecord)}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Download size={13} />
                <span>Export to CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedHistoryRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
