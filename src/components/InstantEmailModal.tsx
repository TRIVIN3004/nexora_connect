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
  ShieldAlert,
  Search,
  Check,
  UserCheck,
  Plus
} from 'lucide-react';

interface InstantEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
  defaultContent?: string;
  defaultPriority?: 'NORMAL' | 'HIGH' | 'URGENT';
  initialTargetEmails?: string[];
}

export const InstantEmailModal: React.FC<InstantEmailModalProps> = ({
  isOpen,
  onClose,
  defaultSubject = '',
  defaultContent = '',
  defaultPriority = 'HIGH',
  initialTargetEmails = []
}) => {
  const { db, dispatcher, currentUser, setCurrentTab, triggerRefresh } = useApp();

  const allUsers = db.getUsers();

  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>(
    initialTargetEmails.length > 0 ? 'SPECIFIC' : 'ALL'
  );
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>(initialTargetEmails);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [customEmailInput, setCustomEmailInput] = useState('');

  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState(defaultContent);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>(defaultPriority);
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      label: '🚨 Urgent Notice',
      title: 'URGENT: Immediate Attention Required',
      priority: 'URGENT' as const,
      content:
        'Dear Team,\n\nPlease review this urgent operational update immediately. Ensure all critical systems and communications are coordinated with your project leads without delay.\n\nThank you for your prompt response.'
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
        'Greetings Team Nexora,\n\nWe would like to share an important briefing regarding upcoming milestones and timeline updates. Please read the details carefully.'
    },
    {
      label: '⚡ Maintenance Alert',
      title: 'System Notice: Temporary Maintenance & Server Updates',
      priority: 'HIGH' as const,
      content:
        'Notice:\n\nOur platform infrastructure is undergoing scheduled system updates. Services remain accessible, but brief latency may occur during the next 30 minutes.'
    }
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setSubject(p.title);
    setContent(p.content);
    setPriority(p.priority);
  };

  const toggleUserSelection = (email: string) => {
    const normalized = email.toLowerCase().trim();
    if (selectedUserEmails.includes(normalized)) {
      setSelectedUserEmails(selectedUserEmails.filter(e => e !== normalized));
    } else {
      setSelectedUserEmails([...selectedUserEmails, normalized]);
    }
  };

  const handleSelectAll = () => {
    setSelectedUserEmails(allUsers.map(u => u.email.toLowerCase().trim()));
  };

  const handleClearAll = () => {
    setSelectedUserEmails([]);
  };

  const handleSelectAdminsOnly = () => {
    setSelectedUserEmails(allUsers.filter(u => u.role === 'ADMIN').map(u => u.email.toLowerCase().trim()));
  };

  const handleSelectEmployeesOnly = () => {
    setSelectedUserEmails(allUsers.filter(u => u.role === 'EMPLOYEE').map(u => u.email.toLowerCase().trim()));
  };

  const handleAddCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!selectedUserEmails.includes(email)) {
      setSelectedUserEmails([...selectedUserEmails, email]);
    }
    setCustomEmailInput('');
  };

  const filteredUsers = allUsers.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const handleSend = () => {
    if (targetType === 'SPECIFIC' && selectedUserEmails.length === 0) {
      alert('Please select or add at least one recipient email address.');
      return;
    }
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
      if (targetType === 'ALL') {
        // Dispatch to all
        dispatcher.dispatchInstantEmailToAll(
          subject.trim(),
          content.trim(),
          currentUser.name,
          priority,
          actionUrl.trim() || undefined,
          actionLabel.trim() || undefined
        );

        db.createAuditLog(
          currentUser.email,
          currentUser.name,
          'INSTANT_EMAIL_BROADCAST_SENT',
          'EmailBroadcast',
          `all-${allUsers.length}-employees`
        );

        setSuccessBanner(`Instant emails dispatched successfully to all ${allUsers.length} employees!`);
      } else {
        // Dispatch to targeted recipients
        dispatcher.dispatchInstantEmailToTarget(
          selectedUserEmails,
          subject.trim(),
          content.trim(),
          currentUser.name,
          priority,
          actionUrl.trim() || undefined,
          actionLabel.trim() || undefined
        );

        db.createAuditLog(
          currentUser.email,
          currentUser.name,
          'INSTANT_EMAIL_TARGETED_SENT',
          'EmailTargeted',
          `recipients-${selectedUserEmails.length}: ${selectedUserEmails.slice(0, 3).join(', ')}${selectedUserEmails.length > 3 ? '...' : ''}`
        );

        setSuccessBanner(`Instant emails dispatched successfully to ${selectedUserEmails.length} selected recipient(s)!`);
      }

      triggerRefresh();
      setIsSending(false);

      setTimeout(() => {
        setSuccessBanner(null);
        onClose();
        setSubject('');
        setContent('');
        setActionUrl('');
        setActionLabel('');
        setPriority('HIGH');
      }, 1600);
    } catch (e) {
      console.error('Instant email dispatch failed:', e);
      setIsSending(false);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col premium-shadow overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Send Instant Sudden Email
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Direct Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Send sudden high-priority alerts via real email and in-app notifications to everyone or specific individuals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                <p className="text-sm font-bold">{successBanner}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Delivered immediate in-app notifications and verified emails via SMTP.
                </p>
              </div>
            </div>
          )}

          {/* Target Audience Selector */}
          <div className="space-y-2 bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Target Audience
            </label>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === 'ALL'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    <Users size={15} className="text-amber-500" />
                    <span>All Employees</span>
                  </div>
                  {targetType === 'ALL' && <Check size={14} className="text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-450 dark:text-slate-500">
                  Broadcast to all {allUsers.length} active company staff
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('SPECIFIC')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  targetType === 'SPECIFIC'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    <UserCheck size={15} className="text-amber-500" />
                    <span>Particular Person(s)</span>
                  </div>
                  {targetType === 'SPECIFIC' && <Check size={14} className="text-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-450 dark:text-slate-500">
                  Select specific individual employee(s) or custom email
                </p>
              </button>
            </div>

            {/* Targeted Person Selection UI */}
            {targetType === 'SPECIFIC' && (
              <div className="pt-3 space-y-3 animate-fade-in">
                
                {/* Quick Selection Shortcuts */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 border-slate-200/60 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Select All ({allUsers.length})
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAdminsOnly}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Admins Only
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectEmployeesOnly}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Employees Only
                    </button>
                    {selectedUserEmails.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors cursor-pointer"
                      >
                        Clear Selection ({selectedUserEmails.length})
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {selectedUserEmails.length} Recipient(s) Selected
                  </span>
                </div>

                {/* Selected Users Chips */}
                {selectedUserEmails.length > 0 && (
                  <div className="p-2.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700/60 max-h-24 overflow-y-auto flex flex-wrap gap-1.5">
                    {selectedUserEmails.map(email => {
                      const userObj = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
                      return (
                        <span
                          key={email}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                        >
                          <span>{userObj ? userObj.name : email}</span>
                          <button
                            type="button"
                            onClick={() => toggleUserSelection(email)}
                            className="hover:text-red-500 ml-1 cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Search Employees Input */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search employee by name, email, role..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Employee List with Checkboxes */}
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-850">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No matching employees found</div>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelected = selectedUserEmails.includes(u.email.toLowerCase().trim());
                      return (
                        <div
                          key={u.id || u.email}
                          onClick={() => toggleUserSelection(u.email)}
                          className={`p-2 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-500/10 dark:bg-amber-500/15'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={u.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-2 shrink-0 ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Direct Email Address */}
                <form onSubmit={handleAddCustomEmail} className="flex gap-2">
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="Or type direct email (e.g. colleague@example.com)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </form>

              </div>
            )}
          </div>

          {/* Quick Message Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Sparkles size={12} className="mr-1 text-amber-500" /> Quick Message Presets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-left transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600 truncate cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Level Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1.5">
              Urgency & Priority Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here. It will be emailed and dispatched as an in-app alert immediately..."
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
            <div className="flex items-center font-medium">
              <Users size={13} className="mr-1 text-slate-400" />
              <span>
                Target:{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {targetType === 'ALL'
                    ? `All ${allUsers.length} staff members`
                    : `${selectedUserEmails.length} selected recipient(s)`}
                </strong>
              </span>
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
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSending || (targetType === 'SPECIFIC' && selectedUserEmails.length === 0)}
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
                  <span>
                    {targetType === 'ALL'
                      ? '⚡ Send to All Staff'
                      : `⚡ Send to ${selectedUserEmails.length} Recipient${selectedUserEmails.length === 1 ? '' : 's'}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
