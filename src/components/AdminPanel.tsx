import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldAlert, 
  FileText, 
  Mail, 
  Activity, 
  Calendar, 
  Clock, 
  Check, 
  X,
  Megaphone,
  PlusCircle,
  Search,
  UserMinus,
  UserPlus,
  Trash2,
  Pin,
  Zap
} from 'lucide-react';
import type { User, KnowledgeNote } from '../services/database';
import { EmailService } from '../services/email';
import type { SentEmail } from '../services/email';
import { BroadcastModal } from './BroadcastModal';
import { InstantEmailModal } from './InstantEmailModal';

export const AdminPanel: React.FC = () => {
  const { db, currentUser, triggerRefresh, setCurrentTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'users' | 'broadcasts' | 'moderation' | 'audit' | 'emails'>('analytics');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isInstantEmailModalOpen, setIsInstantEmailModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteSuccessBanner, setDeleteSuccessBanner] = useState<string | null>(null);
  
  // States
  const [selectedLogEmail, setSelectedLogEmail] = useState<SentEmail | null>(null);
  const [selectedModNote, setSelectedModNote] = useState<KnowledgeNote | null>(null);

  // Retrieve records
  const allUsers = db.getUsers();
  const allWebinars = db.getWebinars();
  const allMeetings = db.getMeetings();
  const allTickets = db.getTickets();
  const allNotes = db.getKnowledgeNotes();
  const allBroadcasts = db.getCompanyMessages();
  const auditLogs = db.getAuditLogs();
  const emailLogs = EmailService.getSentEmailsList();
  const feedbacks = db.getFeedbacks();

  // 1. Calculations
  const pendingNotes = allNotes.filter(n => n.status === 'PENDING_APPROVAL');
  const avgOverallRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.ratingOverall, 0) / feedbacks.length).toFixed(1) 
    : '0.0';

  const filteredUsers = allUsers.filter(u => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || 
           u.email.toLowerCase().includes(q) || 
           (u.designation && u.designation.toLowerCase().includes(q)) ||
           u.role.toLowerCase().includes(q);
  });
  const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
  const empCount = allUsers.filter(u => u.role === 'EMPLOYEE').length;

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      db.updateUser({ ...user, role: newRole });
      db.createAuditLog(currentUser.email, currentUser.name, `CHANGE_USER_ROLE_TO_${newRole}`, 'User', userId);
      triggerRefresh();
    }
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    const targetEmail = userToDelete.email;
    const targetId = userToDelete.id;
    const targetName = userToDelete.name;

    if (targetEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      alert('Action Denied: You cannot delete your own active administrator account.');
      setUserToDelete(null);
      return;
    }

    db.deleteUser(targetId);
    db.deleteUser(targetEmail);
    db.createAuditLog(currentUser.email, currentUser.name, 'DELETE_USER', 'User', targetEmail);
    setUserToDelete(null);
    setDeleteSuccessBanner(`Employee "${targetName}" (${targetEmail}) was successfully removed from the workspace directory.`);
    triggerRefresh();

    setTimeout(() => {
      setDeleteSuccessBanner(null);
    }, 5000);
  };

  const handleApproveNote = (noteId: string) => {
    db.approveKnowledgeNote(noteId, currentUser.email, currentUser.name);
    setSelectedModNote(null);
    triggerRefresh();
    alert('Knowledge note has been approved and published globally!');
  };

  const handleRejectNote = (noteId: string) => {
    // Revert note to draft
    const notes = db.getKnowledgeNotes();
    const idx = notes.findIndex(n => n.id === noteId);
    if (idx > -1) {
      const updated = { ...notes[idx], status: 'DRAFT' as const };
      db.updateKnowledgeNote(updated, currentUser.email, currentUser.name);
      db.createNotification(
        updated.authorId,
        'Knowledge Note Rejected',
        `Your article "${updated.title}" was reviewed and reverted to Drafts. Please refine content.`,
        'ANNOUNCEMENT'
      );
      setSelectedModNote(null);
      triggerRefresh();
      alert('Knowledge note reverted to Drafts. Notification sent to author.');
    }
  };

  const handleDeleteBroadcast = (msgId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete broadcast "${title}"?`)) {
      db.deleteCompanyMessage(msgId);
      db.createAuditLog(currentUser.email, currentUser.name, 'BROADCAST_MESSAGE_DELETED', 'COMPANY_MESSAGE', msgId);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
      
      {/* Tab select bar */}
      <div className="border-b border-slate-200 dark:border-dark-border flex flex-wrap gap-1.5 pb-px">
        {[
          { id: 'analytics', name: 'Dashboard Analytics', icon: Users },
          { id: 'broadcasts', name: 'Company Broadcasts', icon: Megaphone, badge: allBroadcasts.length },
          { id: 'users', name: 'User Directory', icon: Users },
          { id: 'moderation', name: 'Approvals Queue', icon: ShieldAlert, badge: pendingNotes.length },
          { id: 'emails', name: 'Email Sandbox', icon: Mail, badge: emailLogs.length },
          { id: 'audit', name: 'Audit Logs', icon: Activity }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-nexora-blue text-nexora-blue dark:text-nexora-electric'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <IconComp size={14} />
              <span>{tab.name}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="bg-nexora-blue/20 text-nexora-blue dark:text-nexora-electric text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ====================================================
          SUB-TAB: ANALYTICS
          ==================================================== */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Total Accounts', val: allUsers.length, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
            { name: 'Company Broadcasts', val: allBroadcasts.length, icon: Megaphone, color: 'text-sky-500 bg-sky-500/10' },
            { name: 'Upcoming Webinars', val: allWebinars.filter(w => w.status === 'UPCOMING').length, icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
            { name: 'Meetings This Week', val: allMeetings.length, icon: Clock, color: 'text-green-500 bg-green-500/10' },
            { name: 'Open Support Tickets', val: allTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length, icon: ShieldAlert, color: 'text-red-500 bg-red-500/10' },
            { name: 'Published Wiki Notes', val: allNotes.filter(n => n.status === 'PUBLISHED').length, icon: FileText, color: 'text-orange-500 bg-orange-500/10' },
            { name: 'Feedback Average', val: `${avgOverallRating}/5.0`, icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/10' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">{stat.name}</span>
                  <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stat.val}</span>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================
          SUB-TAB: COMPANY BROADCASTS MANAGEMENT
          ==================================================== */}
      {activeSubTab === 'broadcasts' && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center">
                <Megaphone size={14} className="mr-2 text-nexora-blue" />
                Company Broadcasts Oversight ({allBroadcasts.length})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every broadcast is delivered to 100% of staff ({allUsers.length} employees) via in-app alerts and email.
              </p>
            </div>
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Compose Broadcast to All</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/15 text-slate-450 uppercase font-bold">
                  <th className="p-3">Title & Category</th>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Read / Acknowledged</th>
                  <th className="p-3">Sent At</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {allBroadcasts.map(msg => {
                  const acks = (msg.acknowledgments || []).length;
                  return (
                    <tr key={msg.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          {msg.pinned && <Pin size={12} className="text-amber-500 fill-amber-500/20" />}
                          <strong className="text-slate-900 dark:text-white line-clamp-1">{msg.title}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400">{msg.category}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {msg.senderName}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          msg.priority === 'URGENT'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : msg.priority === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {msg.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-green-600 dark:text-green-400 font-bold">{acks}</span> / {allUsers.length} staff
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteBroadcast(msg.id, msg.title)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete broadcast"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          SUB-TAB: USERS MANAGEMENT & DIRECTORY
          ==================================================== */}
      {activeSubTab === 'users' && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden space-y-4 p-5">
          
          {deleteSuccessBanner && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-2">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{deleteSuccessBanner}</span>
              </div>
              <button onClick={() => setDeleteSuccessBanner(null)} className="text-emerald-700 dark:text-emerald-400 hover:opacity-75">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center">
                <Users size={14} className="mr-2 text-nexora-blue" />
                Staff Accounts & Access Management ({allUsers.length})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {adminCount} Administrator{adminCount > 1 ? 's' : ''} • {empCount} Employee{empCount > 1 ? 's' : ''} • Manage roles or permanently remove accounts.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* Search bar */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                  <Search size={13} />
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                />
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Register New User button */}
              <button
                onClick={() => setCurrentTab('register')}
                className="px-3.5 py-1.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <UserPlus size={13} />
                <span>Register Employee</span>
              </button>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/15 text-slate-450 uppercase font-bold">
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Designation / Org</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No employees found matching "{userSearchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isSelf = user.email.toLowerCase() === currentUser.email.toLowerCase();
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-3 flex items-center space-x-3">
                          <img 
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0" 
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="text-[9px] bg-nexora-blue/15 text-nexora-blue dark:text-nexora-electric px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{user.organization || 'Nexora Technologies'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-350 font-mono text-[11px]">{user.email}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{user.designation || 'Specialist Associate'}</td>
                        <td className="p-3">
                          {isSelf ? (
                            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-bold uppercase text-[10px]">
                              {user.role}
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 font-semibold text-[11px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="EMPLOYEE">EMPLOYEE</option>
                            </select>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isSelf ? (
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              Protected
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 border border-red-200 dark:border-red-500/20 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              title={`Remove ${user.name} from company`}
                            >
                              <UserMinus size={12} />
                              <span>Remove</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================
          SUB-TAB: APPROVALS QUEUE
          ==================================================== */}
      {activeSubTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List queue */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 border-b pb-2 border-slate-100 dark:border-slate-850">
              Pending Articles moderation ({pendingNotes.length})
            </h3>
            
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {pendingNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No notes awaiting moderation.</div>
              ) : (
                pendingNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedModNote(note)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedModNote?.id === note.id
                        ? 'border-purple-500 bg-purple-500/5 dark:bg-purple-500/10'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-[8px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wider block w-max mb-1.5">
                      {note.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{note.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Submitted by {note.authorName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reader preview */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 flex flex-col justify-between min-h-[400px]">
            {!selectedModNote ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 flex-grow">
                <ShieldAlert className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-sm font-semibold">Select an article to review</p>
                <p className="text-xs">Moderators must ensure documentation matches coding guidelines.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                
                {/* Content info */}
                <div>
                  <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedModNote.category} • PENDING MODERATION</span>
                      <h3 className="text-sm md:text-base font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                        {selectedModNote.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">Author: {selectedModNote.authorName} ({selectedModNote.authorId})</p>
                    </div>
                    <button 
                      onClick={() => setSelectedModNote(null)}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Body preview */}
                  <div className="py-4 text-xs text-slate-600 dark:text-slate-300 max-h-[220px] overflow-y-auto p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 leading-relaxed font-sans">
                    {selectedModNote.content}
                  </div>
                </div>

                {/* Approve / Reject actions */}
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex justify-end space-x-2.5">
                  <button
                    onClick={() => handleRejectNote(selectedModNote.id)}
                    className="px-3.5 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-lg text-xs font-semibold transition-colors duration-150"
                  >
                    Revert to Draft
                  </button>
                  <button
                    onClick={() => handleApproveNote(selectedModNote.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center shadow"
                  >
                    <Check size={14} className="mr-1.5" /> Approve & Publish
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* ====================================================
          SUB-TAB: EMAIL SANDBOX CONSOLE
          ==================================================== */}
      {activeSubTab === 'emails' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List panel */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-slate-850">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450">
                Outbound SMTP Logs ({emailLogs.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsInstantEmailModalOpen(true)}
                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold flex items-center shadow-xs"
                >
                  <Zap size={11} className="mr-1 text-yellow-200" /> Instant Email
                </button>
                {emailLogs.length > 0 && (
                  <button
                    onClick={() => {
                      EmailService.clearEmailLogs();
                      setSelectedLogEmail(null);
                      triggerRefresh();
                    }}
                    className="text-[9px] font-bold text-red-500 hover:underline"
                  >
                    Clear logs
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {emailLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">No emails sent yet. Trigger notifications to log SMTP templates.</div>
              ) : (
                emailLogs.map(mail => (
                  <div
                    key={mail.id}
                    onClick={() => setSelectedLogEmail(mail)}
                    className={`p-3 border rounded-lg cursor-pointer text-left transition-colors ${
                      selectedLogEmail?.id === mail.id
                        ? 'border-nexora-blue bg-nexora-blue/5 dark:bg-nexora-blue/10'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 block mb-1 font-mono">To: {mail.to}</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{mail.subject}</h4>
                    <span className="text-[9px] text-slate-450 block mt-2 text-right">
                      {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sandbox Screen */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 flex flex-col justify-between min-h-[450px]">
            {!selectedLogEmail ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 flex-grow">
                <Mail className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-2" />
                <p className="text-sm font-semibold">Select an outbound email log</p>
                <p className="text-xs">SMTP console renders the template HTML markup for verification.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Header */}
                <div className="pb-3 border-b border-slate-150 dark:border-slate-850 flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase font-mono">Template: {selectedLogEmail.templateType}</span>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Recipient SMTP: <span className="text-nexora-blue font-mono font-normal">{selectedLogEmail.to}</span></h3>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Subject Line: <strong className="text-slate-900 dark:text-white font-heading">{selectedLogEmail.subject}</strong></h3>
                  </div>
                  <button 
                    onClick={() => setSelectedLogEmail(null)}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* HTML rendering mock box */}
                <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-y-auto max-h-[350px] bg-slate-50 p-4">
                  {/* Dangerously set html since it is internally generated simulation templates */}
                  <div dangerouslySetInnerHTML={{ __html: selectedLogEmail.body }} />
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* ====================================================
          SUB-TAB: AUDIT LOGS
          ==================================================== */}
      {activeSubTab === 'audit' && (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">System Operations Audit Trail</h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold">
              {auditLogs.length} Records
            </span>
          </div>

          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/15 text-slate-450 uppercase font-bold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Target ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/5">
                    <td className="p-4 font-mono text-slate-450 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold">{log.userName}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-mono font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-455">{log.entity}</td>
                    <td className="p-4 font-mono text-[10px] text-slate-400">{log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* In-App Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-500/15 rounded-xl">
                <UserMinus size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Employee Account
                </h3>
                <p className="text-xs text-slate-500">
                  Permanent removal from company workspace
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <img 
                src={userToDelete.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={userToDelete.name} 
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0" 
              />
              <div className="truncate">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{userToDelete.name}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{userToDelete.email}</div>
                <div className="text-[10px] text-slate-400 truncate">{userToDelete.designation || 'Specialist Associate'} • {userToDelete.role}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-white">{userToDelete.name}</strong> from the company portal? Their access, authorizations, and assigned tasks will be revoked immediately.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 size={13} />
                <span>Confirm & Remove User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal for Admin */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Instant Sudden Email Modal */}
      <InstantEmailModal
        isOpen={isInstantEmailModalOpen}
        onClose={() => setIsInstantEmailModalOpen(false)}
      />

    </div>
  );
};
