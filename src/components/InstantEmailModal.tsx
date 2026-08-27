import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  X,
  Users,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  ShieldAlert
} from 'lucide-react';

interface InstantEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultContent?: string;
  defaultPriority?: 'NORMAL' | 'HIGH' | 'URGENT';
}

export const InstantEmailModal: React.FC<InstantEmailModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultContent = '',
  defaultPriority = 'HIGH'
}) => {
  const { db, dispatcher, currentUser, setCurrentTab, triggerRefresh } = useApp();

  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState(defaultContent);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>(defaultPriority);
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [showRecipients, setShowRecipients] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  if (!isOpen) return null;

  const allUsers = db.getUsers();

  const presets = [
    {
      label: '🚨 Urgent Notice',
      title: 'URGENT: Immediate Attention Required for All Staff',
      priority: 'URGENT' as const,
      content:
        'Dear Team,\n\nPlease review this urgent operational update immediately. Ensure all critical systems and client communications are coordinated with your project leads without delay.\n\nThank you for your prompt response.'
    },
    {
      label: '📅 Emergency Sync',
      title: 'Emergency Team Sync: Standup & Coordination Call',
      priority: 'HIGH' as const,
      content:
        'Hello Everyone,\n\nWe are convening a quick synchronization meeting right now to align on key priority items and blockers. Please join using the link below.'
    },
    {
      label: '📢 Important Update',
      title: 'Company-Wide Announcement: Important Operational Briefing',
      priority: 'NORMAL' as const,
      content:
        'Greetings Team Nexora,\n\nWe would like to share an important briefing with all employees regarding upcoming company milestones and timeline updates. Please read the details carefully.'
    },
    {
      label: '⚡ Maintenance Alert',
      title: 'System Notice: Temporary Maintenance & Server Updates',
      priority: 'HIGH' as const,
      content:
        'Notice to all employees:\n\nOur platform infrastructure is undergoing scheduled system updates. Services remain accessible, but brief latency may occur during the next 30 minutes.'
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setSubject(p.title);
    setContent(p.content);
    setPriority(p.priority);
  };

  const handleSend = () => {
    if (!subject.trim()) {
      alert('Please enter an email subject/headline.');
      return;
    }
    if (!content.trim()) {
      alert('Please enter the email body content.');
      return;
    }

    setIsSending(true);

    try {
      // 1. Dispatch in-app notifications and real SMTP emails via dispatcher
      dispatcher.dispatchInstantEmailToAll(
        subject.trim(),
        content.trim(),
        currentUser.name,
        priority,
        actionUrl.trim() || undefined,
        actionLabel.trim() || undefined
      );

      // 2. Audit log
      db.createAuditLog(
        currentUser.email,
        currentUser.name,
        'INSTANT_EMAIL_BROADCAST_SENT',
        'EmailBroadcast',
        `all-${allUsers.length}-employees`
      );

      triggerRefresh();
      setIsSending(false);
      setSuccessBanner(true);

      setTimeout(() => {
        setSuccessBanner(false);
        onClose();
        setSubject('');
        setContent('');
        setActionUrl('');
        setActionLabel('');
        setPriority('HIGH');
      }, 1500);
    } catch (e) {
      console.error('Instant email dispatch failed:', e);
      setIsSending(false);
      alert('Failed to send broadcast. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col premium-shadow overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-red-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Send Instant Email to All Employees
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Sudden Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immediately dispatches in-app alerts and real email notifications to all {allUsers.length} employees.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Success Banner Overlay */}
          {successBanner && (
            <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center space-x-3 text-green-700 dark:text-green-300 animate-slide-up">
              <div className="p-1.5 bg-green-500 text-white rounded-full">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Instant Emails Dispatched Successfully!</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Delivered immediate in-app notifications and email alerts to all {allUsers.length} employees across Nexora.
                </p>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Sparkles size={12} className="mr-1 text-amber-500" /> Quick Message Presets
              </span>
              <button
                type="button"
                onClick={() => setShowRecipients(!showRecipients)}
                className="text-[11px] font-semibold text-nexora-blue dark:text-nexora-electric hover:underline flex items-center"
              >
                <Users size={12} className="mr-1" />
                {showRecipients ? 'Hide Recipients' : `View ${allUsers.length} Recipients`}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-left transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600 truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipients Dropdown Preview */}
          {showRecipients && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Direct Recipients ({allUsers.length} total staff):</span>
                <span className="text-[10px] text-slate-400 font-normal">All active team members</span>
              </p>
              <div className="max-h-28 overflow-y-auto flex flex-wrap gap-1.5">
                {allUsers.map(u => (
                  <span
                    key={u.id || u.email}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {u.name} <span className="text-slate-400 ml-1">({u.email})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Priority Level Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">
              Urgency & Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  priority === 'NORMAL'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BellRing size={14} />
                <span>Normal Alert</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('HIGH')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  priority === 'HIGH'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <AlertTriangle size={14} />
                <span>High Priority</span>
              </button>

              <button
                type="button"
                onClick={() => setPriority('URGENT')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  priority === 'URGENT'
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert size={14} />
                <span>🚨 Urgent Action</span>
              </button>
            </div>
          </div>

          {/* Email Subject */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Email Subject / Alert Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Urgent Notice: Team All-Hands Sync at 11:30 AM"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Broadcast Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message to all employees here. It will be emailed and sent as an in-app notification immediately..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Optional Action URL / Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Optional Action URL (Meeting Link / Doc)
              </label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://meet.google.com/xyz..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Action Button Label
              </label>
              <input
                type="text"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="e.g. Join Meeting Room Now"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/40">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Users size={13} className="mr-1 text-slate-400" />
              <span>Target: <strong>All {allUsers.length} staff members</strong></span>
            </div>
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setCurrentTab('admin');
                }}
                className="text-[11px] text-nexora-blue dark:text-nexora-electric hover:underline font-semibold cursor-pointer"
              >
                • 📜 View Email History
              </button>
            )}
          </div>

          <div className="flex space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleSend}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-yellow-200" />
                  <span>⚡ Send Immediately to All Staff</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
