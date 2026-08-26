import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Megaphone,
  X,
  Send,
  Sparkles,
  Users,
  Pin,
  Check,
  Tag,
  Info
} from 'lucide-react';
import type { CompanyMessage } from '../services/database';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: CompanyMessage['category'];
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'General Update'
}) => {
  const { db, dispatcher, currentUser, triggerRefresh } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CompanyMessage['category']>(defaultCategory);
  const [priority, setPriority] = useState<CompanyMessage['priority']>('NORMAL');
  const [pinned, setPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const allUsers = db.getUsers();

  const presets = [
    {
      label: '✨ General Update',
      title: 'Company Update: Monthly Goals & Progress',
      category: 'General Update' as const,
      priority: 'NORMAL' as const,
      content:
        'Hello everyone! 👋\n\nWe would like to share our current roadmap progress and highlight key deliverables accomplished by the team this month. Thank you for your continued dedication and collaborative spirit!'
    },
    {
      label: '🎉 Team Kudos',
      title: '🎉 Big Congratulations to the Team for Stellar Deliverables!',
      category: 'Celebration' as const,
      priority: 'NORMAL' as const,
      content:
        'Huge shoutout to all team members across Engineering, Design, and Operations! Your exceptional work on recent project milestones has received wonderful client commendations. Keep shining! 🚀'
    },
    {
      label: '⏰ All-Hands Notice',
      title: 'Reminder: Company-Wide All-Hands & Roadmap Sync',
      category: 'Important Notice' as const,
      priority: 'HIGH' as const,
      content:
        'Dear Team,\n\nPlease make sure to join our upcoming company All-Hands session. We will cover company highlights, new product rollouts, and an open Q&A forum with leadership.'
    },
    {
      label: '⚠️ System Maintenance',
      title: 'Notice: Scheduled Infrastructure & Server Maintenance',
      category: 'Urgent Alert' as const,
      priority: 'URGENT' as const,
      content:
        'Please be advised that scheduled maintenance will occur on our staging and database infrastructure this weekend. Brief intermittent connectivity may occur during this window.'
    },
    {
      label: '🌴 Office Notice / HR',
      title: 'Holiday Schedule & Workplace Guidelines Update',
      category: 'HR Update' as const,
      priority: 'NORMAL' as const,
      content:
        'Greetings Team,\n\nPlease review our upcoming holiday calendar and ensure project handoffs and support coverage are arranged with your team leads in advance. Wishing everyone a restful time!'
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setContent(preset.content);
    setCategory(preset.category);
    setPriority(preset.priority);
  };

  const handleSend = () => {
    if (!title.trim()) {
      alert('Please enter a message title/subject.');
      return;
    }
    if (!content.trim()) {
      alert('Please enter message content.');
      return;
    }

    setIsSending(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (tags.length === 0) {
      tags.push(category, 'All Company');
    }

    const newBroadcast = db.createCompanyMessage({
      senderEmail: currentUser.email,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      senderRole: currentUser.role,
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
      targetAudience: 'ALL_EMPLOYEES',
      pinned,
      acknowledgments: [currentUser.email],
      tags
    });

    // Dispatch in-app notifications and email simulation to all company members
    dispatcher.dispatchCompanyBroadcast(newBroadcast);

    // Audit log
    db.createAuditLog(
      currentUser.email,
      currentUser.name,
      'BROADCAST_MESSAGE_SENT',
      'COMPANY_MESSAGE',
      newBroadcast.id
    );

    triggerRefresh();
    setIsSending(false);
    setSuccessNotice(true);

    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setCategory('General Update');
      setPriority('NORMAL');
      setPinned(false);
      setTagsInput('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col premium-shadow overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-nexora-blue/5 via-sky-500/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-nexora-blue/10 text-nexora-blue dark:text-nexora-electric">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold font-heading text-slate-900 dark:text-white">
                Send Company-Wide Message
              </h2>
              <p className="text-xs text-slate-450 dark:text-slate-400">
                Broadcast a normal message or official announcement to all employees.
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
          {successNotice && (
            <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center space-x-3 text-green-700 dark:text-green-300 animate-slide-up">
              <div className="p-1.5 bg-green-500 text-white rounded-full">
                <Check size={16} />
              </div>
              <div>
                <p className="text-sm font-bold">Broadcast Sent Successfully!</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Delivered in-app notifications and email alerts to all {allUsers.length} staff members.
                </p>
              </div>
            </div>
          )}

          {/* Recipient Audience Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-slate-600 dark:text-slate-300 font-semibold">
                <Users size={14} className="mr-1.5 text-nexora-blue" />
                Audience:
              </span>
              <span className="bg-nexora-blue/10 text-nexora-blue dark:text-nexora-electric font-bold px-2 py-0.5 rounded-full border border-nexora-blue/20">
                All People in Company ({allUsers.length} Users)
              </span>
            </div>
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {allUsers.slice(0, 5).map((u, i) => (
                <img
                  key={u.id || i}
                  src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={u.name}
                  title={`${u.name} (${u.email})`}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-card object-cover"
                />
              ))}
              {allUsers.length > 5 && (
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center border-2 border-white dark:border-dark-card">
                  +{allUsers.length - 5}
                </span>
              )}
            </div>
          </div>

          {/* Quick Preset Templates Bar */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center">
              <Sparkles size={12} className="mr-1 text-amber-500" />
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:border-nexora-blue dark:hover:border-nexora-blue hover:text-nexora-blue dark:hover:text-nexora-electric transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Message Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Q3 All-Hands Meeting & Product Roadmap Announcement"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nexora-blue/20 focus:border-nexora-blue transition-all"
            />
          </div>

          {/* Category & Priority Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-nexora-blue"
              >
                <option value="General Update">General Update</option>
                <option value="Important Notice">Important Notice</option>
                <option value="Company News">Company News</option>
                <option value="Celebration">Celebration & Kudos</option>
                <option value="HR Update">HR Policy / Workplace</option>
                <option value="Urgent Alert">Urgent Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'NORMAL', label: 'Normal', color: 'border-slate-300 text-slate-700 dark:text-slate-300' },
                  { id: 'HIGH', label: 'High', color: 'border-amber-500/40 text-amber-600 dark:text-amber-400' },
                  { id: 'URGENT', label: 'Urgent', color: 'border-red-500/40 text-red-600 dark:text-red-400' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all ${
                      priority === p.id
                        ? p.id === 'URGENT'
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : p.id === 'HIGH'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-nexora-blue text-white border-nexora-blue shadow-sm'
                        : `bg-slate-50 dark:bg-slate-900/50 ${p.color} hover:bg-slate-100 dark:hover:bg-slate-800`
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Message Content <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {content.length} characters
              </span>
            </div>
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your company-wide message here... You can use bullet points, emoji, and formatting."
              className="w-full p-3 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nexora-blue/20 focus:border-nexora-blue transition-all leading-relaxed font-sans"
            />
          </div>

          {/* Tags & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                <Tag size={12} className="mr-1 text-slate-400" />
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g., Operations, Milestone, Event"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-nexora-blue"
              />
            </div>

            <div className="pt-4 sm:pt-0">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                  className="rounded border-slate-300 text-nexora-blue focus:ring-nexora-blue"
                />
                <Pin size={14} className={pinned ? 'text-nexora-blue' : 'text-slate-400'} />
                <span>Pin this message to the top of the feed</span>
              </label>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center text-[11px] text-slate-400">
            <Info size={13} className="mr-1 text-nexora-blue shrink-0" />
            <span>Sends in-app alert + email to all {allUsers.length} colleagues.</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSending || !title.trim() || !content.trim()}
              onClick={handleSend}
              className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-nexora-blue to-sky-600 hover:from-nexora-blue/90 hover:to-sky-700 text-white rounded-xl shadow-md flex items-center space-x-1.5 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={13} />
              <span>{isSending ? 'Sending...' : `Send to All (${allUsers.length})`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
