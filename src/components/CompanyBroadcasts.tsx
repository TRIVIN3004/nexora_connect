import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Megaphone,
  PlusCircle,
  Search,
  Pin,
  CheckCircle2,
  Users,
  Clock,
  Trash2,
  Share2,
  AlertCircle,
  Check,
  Tag
} from 'lucide-react';
import { BroadcastModal } from './BroadcastModal';
import type { CompanyMessage } from '../services/database';

export const CompanyBroadcasts: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAckModalMsg, setActiveAckModalMsg] = useState<CompanyMessage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allMessages = db.getCompanyMessages();
  const allUsers = db.getUsers();

  // Filter messages
  const filteredMessages = allMessages.filter(msg => {
    if (selectedCategory !== 'ALL' && msg.category !== selectedCategory) {
      return false;
    }
    if (selectedPriority !== 'ALL' && msg.priority !== selectedPriority) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = msg.title.toLowerCase().includes(q);
      const matchContent = msg.content.toLowerCase().includes(q);
      const matchSender = msg.senderName.toLowerCase().includes(q) || msg.senderEmail.toLowerCase().includes(q);
      const matchTags = (msg.tags || []).some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchSender && !matchTags) {
        return false;
      }
    }
    return true;
  });

  // Sort: pinned first, then newest
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Stats
  const totalCount = allMessages.length;
  const acknowledgedByMe = allMessages.filter(m => (m.acknowledgments || []).includes(currentUser.email)).length;
  const urgentCount = allMessages.filter(m => m.priority === 'URGENT' || m.priority === 'HIGH').length;

  const handleToggleAcknowledge = (msgId: string) => {
    db.acknowledgeCompanyMessage(msgId, currentUser.email);
    triggerRefresh();
  };

  const handleDeleteMessage = (msgId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove the broadcast "${title}"?`)) {
      db.deleteCompanyMessage(msgId);
      db.createAuditLog(
        currentUser.email,
        currentUser.name,
        'BROADCAST_MESSAGE_DELETED',
        'COMPANY_MESSAGE',
        msgId
      );
      triggerRefresh();
    }
  };

  const handleCopyNotice = (msg: CompanyMessage) => {
    const text = `📢 [${msg.category.toUpperCase()}] ${msg.title}\n\n${msg.content}\n\n— Broadcast by ${msg.senderName} on Nexora Connect`;
    navigator.clipboard.writeText(text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeClass = (category: CompanyMessage['category']) => {
    switch (category) {
      case 'Celebration':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Important Notice':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Urgent Alert':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse';
      case 'HR Update':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'Company News':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getPriorityBadgeClass = (priority: CompanyMessage['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 text-white font-extrabold';
      case 'HIGH':
        return 'bg-amber-500 text-white font-bold';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
      
      {/* ====================================================
          BANNER HEADER
          ==================================================== */}
      <div className="bg-gradient-to-r from-[#06152F] via-[#0A224E] to-[#0878C9] rounded-2xl p-6 md:p-8 text-white premium-shadow relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-nexora-electric border border-white/15">
              <Megaphone size={13} className="animate-bounce" />
              <span>Company Communication Feed</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight">
              Company Broadcasts & Announcements
            </h1>
            <p className="text-slate-200 text-xs md:text-sm max-w-2xl font-medium leading-relaxed">
              Official company-wide communications, milestones, leadership notices, and operational updates delivered to all employees.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-[#06152F] font-bold text-xs md:text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <PlusCircle size={17} className="text-nexora-blue" />
            <span>Broadcast Message to All</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          METRICS CARDS
          ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-dark-card p-4 md:p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Broadcasts
            </span>
            <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">
              {String(totalCount).padStart(2, '0')}
            </span>
          </div>
          <div className="p-3 bg-nexora-blue/10 rounded-xl text-nexora-blue dark:text-nexora-electric">
            <Megaphone size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-4 md:p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Acknowledged
            </span>
            <span className="text-2xl font-extrabold font-heading text-green-600 dark:text-green-400">
              {acknowledgedByMe} <span className="text-xs font-normal text-slate-450">/ {totalCount}</span>
            </span>
          </div>
          <div className="p-3 bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-4 md:p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              High / Urgent
            </span>
            <span className="text-2xl font-extrabold font-heading text-amber-500">
              {String(urgentCount).padStart(2, '0')}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-4 md:p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Staff Reach
            </span>
            <span className="text-2xl font-extrabold font-heading text-purple-600 dark:text-purple-400">
              100% <span className="text-xs font-normal text-slate-450">({allUsers.length} Staff)</span>
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <Users size={20} />
          </div>
        </div>

      </div>

      {/* ====================================================
          FILTERS & SEARCH BAR
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic, sender, or content..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-nexora-blue"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 font-semibold hidden md:inline">Priority:</span>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Alert</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'General Update', label: 'General Updates' },
            { id: 'Important Notice', label: 'Important Notices' },
            { id: 'Celebration', label: 'Celebrations & Kudos' },
            { id: 'Company News', label: 'Company News' },
            { id: 'HR Update', label: 'HR & Workplace' },
            { id: 'Urgent Alert', label: 'Urgent Alerts' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-nexora-blue text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================
          MESSAGES FEED
          ==================================================== */}
      <div className="space-y-4">
        {sortedMessages.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-dark-border p-12 text-center space-y-3">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No broadcasts found</h3>
            <p className="text-xs text-slate-450 max-w-sm mx-auto">
              No company messages matched your search or category filter. Try clearing your filters or create a new message.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedPriority('ALL');
              }}
              className="text-xs font-bold text-nexora-blue hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          sortedMessages.map(msg => {
            const hasAcked = (msg.acknowledgments || []).includes(currentUser.email);
            const ackCount = (msg.acknowledgments || []).length;
            const canDelete = currentUser.role === 'ADMIN' || currentUser.email === msg.senderEmail;

            return (
              <div
                key={msg.id}
                className={`bg-white dark:bg-dark-card rounded-2xl border transition-all duration-200 premium-shadow p-5 md:p-6 space-y-4 ${
                  msg.pinned
                    ? 'border-nexora-blue/60 dark:border-nexora-blue/50 ring-1 ring-nexora-blue/20 bg-gradient-to-br from-nexora-blue/[0.02] to-transparent'
                    : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header row: Sender & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  
                  {/* Sender Info */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={msg.senderName}
                      className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {msg.senderName}
                        </h4>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          msg.senderRole === 'ADMIN'
                            ? 'bg-nexora-blue/15 text-nexora-blue dark:text-nexora-electric border border-nexora-blue/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{msg.senderEmail}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock size={11} className="mr-1" />
                          {new Date(msg.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges Right */}
                  <div className="flex items-center space-x-2">
                    {msg.pinned && (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full flex items-center">
                        <Pin size={11} className="mr-1 fill-amber-500/30" /> Pinned Notice
                      </span>
                    )}

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryBadgeClass(msg.category)}`}>
                      {msg.category}
                    </span>

                    {msg.priority !== 'NORMAL' && (
                      <span className={`px-2 py-0.5 text-[9px] rounded-full uppercase tracking-wider ${getPriorityBadgeClass(msg.priority)}`}>
                        {msg.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Title & Body */}
                <div className="space-y-2.5">
                  <h3 className="text-base md:text-lg font-extrabold font-heading text-slate-900 dark:text-white leading-snug">
                    {msg.title}
                  </h3>
                  <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>

                {/* Tags if any */}
                {msg.tags && msg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md"
                      >
                        <Tag size={10} className="mr-1 text-slate-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Acknowledge Button & Recipient Stats */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleAcknowledge(msg.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all duration-150 active:scale-95 cursor-pointer ${
                        hasAcked
                          ? 'bg-green-600 text-white shadow-sm hover:bg-green-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Check size={14} className={hasAcked ? 'text-white' : 'text-slate-400'} />
                      <span>{hasAcked ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>

                    <button
                      onClick={() => setActiveAckModalMsg(msg)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-nexora-blue dark:hover:text-nexora-electric font-semibold flex items-center space-x-1"
                    >
                      <Users size={13} className="mr-1 text-slate-400" />
                      <span>{ackCount} of {allUsers.length} staff read</span>
                    </button>
                  </div>

                  {/* Right Actions: Share & Delete */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopyNotice(msg)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs transition-colors flex items-center space-x-1"
                      title="Copy broadcast text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={13} className="text-green-500" />
                          <span className="text-[10px] text-green-500 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={13} />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id, msg.title)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-xs transition-colors"
                        title="Delete this broadcast"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ====================================================
          MODAL: VIEW ACKNOWLEDGMENTS LIST
          ==================================================== */}
      {activeAckModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full p-5 space-y-4 premium-shadow animate-scale-in">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center">
                <Users size={16} className="mr-2 text-nexora-blue" />
                Staff Acknowledgments
              </h3>
              <button
                onClick={() => setActiveAckModalMsg(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Notice: <strong className="text-slate-800 dark:text-slate-200">{activeAckModalMsg.title}</strong>
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto pr-1">
              {allUsers.map(user => {
                const acked = (activeAckModalMsg.acknowledgments || []).includes(user.email);
                return (
                  <div key={user.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    {acked ? (
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center">
                        <Check size={11} className="mr-1" /> Acknowledged
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setActiveAckModalMsg(null)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          COMPOSE BROADCAST MODAL
          ==================================================== */}
      <BroadcastModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};
