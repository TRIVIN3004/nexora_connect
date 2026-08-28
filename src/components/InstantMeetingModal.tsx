import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  X, 
  Sparkles, 
  Clock, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { PersonSelector } from './PersonSelector';
import type { Meeting } from '../services/database';

interface InstantMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedEmails?: string[];
}

export const InstantMeetingModal: React.FC<InstantMeetingModalProps> = ({
  isOpen,
  onClose,
  initialSelectedEmails = []
}) => {
  const { db, dispatcher, currentUser, triggerRefresh } = useApp();
  const allUsers = db.getUsers();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<Meeting['platform']>('Google Meet');
  
  // Generate a random meeting code
  const generateMeetingUrl = (plat: Meeting['platform']) => {
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' + 
                       Math.random().toString(36).substring(2, 6) + '-' + 
                       Math.random().toString(36).substring(2, 5);
    if (plat === 'Zoom') {
      return `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    }
    if (plat === 'MS Teams') {
      return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${randomCode}%40thread.v2/0`;
    }
    return `https://meet.google.com/${randomCode}`;
  };

  const [url, setUrl] = useState(() => generateMeetingUrl('Google Meet'));
  const [targetMode, setTargetMode] = useState<'ALL' | 'SPECIFIC'>(
    initialSelectedEmails.length > 0 ? 'SPECIFIC' : 'SPECIFIC'
  );
  const [selectedEmails, setSelectedEmails] = useState<string[]>(initialSelectedEmails);
  const [customNote, setCustomNote] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [saveToCalendar, setSaveToCalendar] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const presets = [
    { label: '⚡ Quick Standup & Blockers', title: 'Emergency Sync: Quick Standup & Blockers', desc: 'Syncing on blockers and immediate priorities.' },
    { label: '🔍 Tech Architecture Review', title: 'Technical Architecture & Code Review Sync', desc: 'Reviewing component designs and code structure.' },
    { label: '🚨 Hotfix / Debug Session', title: 'Critical Hotfix & Debugging Bridge', desc: 'Troubleshooting live issue coordination.' },
    { label: '🤝 1-on-1 Mentorship Sync', title: '1-on-1 Quick Mentorship & Q&A Session', desc: '1:1 project alignment and check-in.' }
  ];

  const handlePlatformChange = (newPlatform: Meeting['platform']) => {
    setPlatform(newPlatform);
    setUrl(generateMeetingUrl(newPlatform));
  };

  const handleRegenerateUrl = () => {
    setUrl(generateMeetingUrl(platform));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartInstantMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a meeting title.' });
      return;
    }

    const participants = targetMode === 'ALL' ? ['all'] : selectedEmails;
    if (targetMode === 'SPECIFIC' && participants.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one person or choose All Company Members.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const startTimeStr = now.toTimeString().slice(0, 5);
    const endMinutes = new Date(now.getTime() + 45 * 60000);
    const endTimeStr = endMinutes.toTimeString().slice(0, 5);

    try {
      // 1. Optionally persist to Database as an active Meeting record
      if (saveToCalendar) {
        db.createMeeting(
          {
            title: title.trim(),
            description: description.trim() || 'Instant meeting launched live by host.',
            organizerId: currentUser.email,
            participants: participants,
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            platform: platform,
            url: url.trim(),
            agenda: customNote.trim() || 'Instant live discussion and collaboration.',
            type: 'Team Meeting'
          },
          currentUser.email,
          currentUser.name
        );
      }

      // 2. Dispatch Live In-App + Email Invitations to chosen persons
      if (sendEmailNotification) {
        dispatcher.dispatchInstantMeeting({
          title: title.trim(),
          url: url.trim(),
          platform: platform,
          organizerName: currentUser.name,
          organizerEmail: currentUser.email,
          participantEmails: targetMode === 'ALL' ? ['all'] : selectedEmails,
          customNote: customNote.trim() || undefined,
          isAll: targetMode === 'ALL'
        });
      }

      const countText = targetMode === 'ALL' ? `all ${allUsers.length} members` : `${selectedEmails.length} selected attendee(s)`;
      setStatusMessage({
        type: 'success',
        text: `🚀 Instant meeting launched! Invitations dispatched to ${countText}. Redirecting to call...`
      });

      triggerRefresh();

      // Open meeting in new tab after 1.2s
      setTimeout(() => {
        window.open(url.trim(), '_blank');
        setIsSubmitting(false);
        onClose();
      }, 1200);

    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage({
        type: 'error',
        text: `Error dispatching meeting: ${err.message || 'Failed to start'}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-md">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                  Start Instant Meeting
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Live Now
                </span>
              </div>
              <p className="text-xs text-slate-500">Launch a live conference bridge & notify selected persons immediately</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleStartInstantMeeting} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                <Sparkles size={12} className="mr-1 text-amber-500" /> Quick Topic Presets
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(p.title);
                    setDescription(p.desc);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Title */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
              Meeting Title / Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Urgent Standup: API Integration & Deployment Sync"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Platform & Generated Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Virtual Platform
              </label>
              <select
                value={platform}
                onChange={(e) => handlePlatformChange(e.target.value as Meeting['platform'])}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="MS Teams">MS Teams</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Live Conference Link
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-nexora-blue dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                  type="button"
                  onClick={handleRegenerateUrl}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  title="Generate new link"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  title="Copy link to clipboard"
                >
                  {copiedLink ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* ====================================================
              PERSON SELECTION OPTIONS (All vs Selected Persons)
              ==================================================== */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
              Select Attendees to Invite & Notify <span className="text-red-500">*</span>
            </label>

            <PersonSelector
              selectedEmails={selectedEmails}
              onChange={setSelectedEmails}
              targetMode={targetMode}
              onTargetModeChange={setTargetMode}
              themeColor="amber"
              allOptionLabel="All Company Members"
              specificOptionLabel="Select Specific Person(s)"
              allOptionDescription="Broadcast instant meeting link to all team members"
              specificOptionDescription="Pick particular employees or external guests"
              maxListHeight="max-h-40"
            />
          </div>

          {/* Optional Host Message / Note */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
              Custom Message / Instructions to Attendees (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please join right away with your mic ready. We are reviewing the prod deployment."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Notification Options Toggles */}
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
              />
              <span>Send Instant Email & In-App Notification with Direct Join Button</span>
            </label>
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToCalendar}
                onChange={(e) => setSaveToCalendar(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
              />
              <span>Add to Workspace Meeting Calendar timeline</span>
            </label>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
              statusMessage.type === 'success'
                ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
                : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-[11px] text-slate-400 flex items-center">
              <Clock size={13} className="mr-1" />
              <span>Organizer: <strong>{currentUser.name}</strong></span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center shadow-lg shadow-amber-500/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Launching Live Bridge...</span>
                ) : (
                  <>
                    <Zap size={14} className="mr-1.5 fill-current" />
                    Launch & Invite Now
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
