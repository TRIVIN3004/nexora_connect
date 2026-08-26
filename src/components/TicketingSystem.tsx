import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  Ticket, 
  User, 
  X,
  Sparkles,
  Inbox
} from 'lucide-react';
import type { Ticket as TicketEntity } from '../services/database';
import { AIService } from '../services/ai';

export const TicketingSystem: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<TicketEntity | null>(null);

  // Forms
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<TicketEntity['category']>('Technical');
  const [newTicketPriority, setNewTicketPriority] = useState<TicketEntity['priority']>('MEDIUM');
  const [commentText, setCommentText] = useState('');

  // AI Classification state
  const [aiClassifying, setAiClassifying] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<{ category: string; priority: string; confidence: number; reasoning: string } | null>(null);

  const tickets = db.getTickets();
  const comments = db.getTicketComments();
  const adminsAndMentors = db.getUsers().filter(u => u.role === 'ADMIN');

  // Filter tickets: users see their own, admins/mentors see all
  const visibleTickets = tickets.filter(t => {
    if (currentUser.role === 'ADMIN') return true;
    return t.createdById === currentUser.email;
  });

  const filteredTickets = visibleTickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || 
                          t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats for admin dashboard
  const totalCount = visibleTickets.length;
  const countOpen = visibleTickets.filter(t => t.status === 'OPEN').length;
  const countAssigned = visibleTickets.filter(t => t.status === 'ASSIGNED').length;
  const countInProgress = visibleTickets.filter(t => t.status === 'IN PROGRESS').length;
  const countWaiting = visibleTickets.filter(t => t.status === 'WAITING FOR USER').length;
  const countResolved = visibleTickets.filter(t => t.status === 'RESOLVED').length;
  const countClosed = visibleTickets.filter(t => t.status === 'CLOSED').length;


  // Trigger AI Auto Classification
  const handleAIClassify = async () => {
    if (!newTicketSubject && !newTicketDesc) return;
    setAiClassifying(true);
    setAiClassificationResult(null);

    try {
      const result = await AIService.classifyTicket(newTicketSubject, newTicketDesc);
      setAiClassificationResult(result);
      setNewTicketCategory(result.category as TicketEntity['category']);
      setNewTicketPriority(result.priority as TicketEntity['priority']);
    } catch (e) {
      console.error(e);
    } finally {
      setAiClassifying(false);
    }
  };

  const handleRaiseTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newT = db.createTicket(
      {
        subject: newTicketSubject,
        description: newTicketDesc,
        category: newTicketCategory,
        priority: newTicketPriority,
        createdById: currentUser.email
      },
      currentUser.email,
      currentUser.name
    );

    // Reset Form
    setNewTicketSubject('');
    setNewTicketDesc('');
    setAiClassificationResult(null);
    setCreateModalOpen(false);
    
    // Auto select newly created ticket
    setSelectedTicket(newT);
    triggerRefresh();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    db.addTicketComment(
      selectedTicket.id,
      currentUser.email,
      currentUser.name,
      currentUser.role,
      commentText
    );

    setCommentText('');
    triggerRefresh();
  };

  const handleAssignChange = (assigneeId: string) => {
    if (!selectedTicket) return;
    db.assignTicket(selectedTicket.id, assigneeId, currentUser.email, currentUser.name);
    // Refresh local selected details
    const updated = db.getTickets().find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
    triggerRefresh();
  };

  const handleStatusChange = (newStatus: TicketEntity['status']) => {
    if (!selectedTicket) return;
    const updated: TicketEntity = {
      ...selectedTicket,
      status: newStatus
    };
    db.updateTicket(updated, currentUser.email, currentUser.name);
    setSelectedTicket(updated);
    triggerRefresh();
  };

  const getPriorityColor = (priority: TicketEntity['priority']) => {
    if (priority === 'URGENT') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (priority === 'HIGH') return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
    if (priority === 'MEDIUM') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
  };

  const getStatusColor = (status: TicketEntity['status']) => {
    if (status === 'OPEN') return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
    if (status === 'ASSIGNED') return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
    if (status === 'IN PROGRESS') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
    if (status === 'WAITING FOR USER') return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
    if (status === 'RESOLVED') return 'bg-green-500/15 text-green-600 dark:text-green-400';
    return 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400';
  };

  const selectedTicketComments = comments.filter(c => selectedTicket && c.ticketId === selectedTicket.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Support Desk & Tickets
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            File support tickets for access authorizations, hardware configurations, or webinar sync setups.
          </p>
        </div>
        
        <button
          onClick={() => {
            setCreateModalOpen(true);
            setNewTicketSubject('');
            setNewTicketDesc('');
            setAiClassificationResult(null);
          }}
          className="px-4 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all"
        >
          <Plus size={16} className="mr-1.5" /> File Ticket
        </button>
      </div>

      {/* ====================================================
          ADMIN VIEW: TICKET STATUSES ANALYTICS
          ==================================================== */}
      {currentUser.role === 'ADMIN' && (
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
            System Tickets Queue Analytics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/10 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="block text-xl font-bold font-heading">{totalCount}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
            </div>
            <div className="p-3 bg-purple-500/5 rounded-lg text-center border border-purple-500/10">
              <span className="block text-xl font-bold font-heading text-purple-600 dark:text-purple-400">{countOpen}</span>
              <span className="text-[10px] text-purple-500 uppercase font-semibold">Open</span>
            </div>
            <div className="p-3 bg-blue-500/5 rounded-lg text-center border border-blue-500/10">
              <span className="block text-xl font-bold font-heading text-blue-600 dark:text-blue-400">{countAssigned}</span>
              <span className="text-[10px] text-blue-500 uppercase font-semibold">Assigned</span>
            </div>
            <div className="p-3 bg-amber-500/5 rounded-lg text-center border border-amber-500/10">
              <span className="block text-xl font-bold font-heading text-amber-600 dark:text-amber-400">{countInProgress}</span>
              <span className="text-[10px] text-amber-500 uppercase font-semibold">In Progress</span>
            </div>
            <div className="p-3 bg-rose-500/5 rounded-lg text-center border border-rose-500/10">
              <span className="block text-xl font-bold font-heading text-rose-600 dark:text-rose-400">{countWaiting}</span>
              <span className="text-[10px] text-rose-500 uppercase font-semibold">Waiting</span>
            </div>
            <div className="p-3 bg-green-500/5 rounded-lg text-center border border-green-500/10">
              <span className="block text-xl font-bold font-heading text-green-600 dark:text-green-400">{countResolved + countClosed}</span>
              <span className="text-[10px] text-green-500 uppercase font-semibold">Resolved</span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          CORE SECTION: TICKETS LAYOUT
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets list and search */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket ID or subject..."
                className="w-full pl-8 pr-4 py-1.5 rounded border border-slate-250 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Filters selectors */}
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-455 block mb-1">Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-[10px] font-semibold p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="OPEN">OPEN</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="WAITING FOR USER">WAITING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-455 block mb-1">Priority</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full text-[10px] font-semibold p-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="ALL">ALL PRIORITIES</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No support tickets found.
                </div>
              ) : (
                filteredTickets.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors duration-150 text-left ${
                      selectedTicket?.id === t.id 
                        ? 'border-nexora-blue bg-nexora-blue/5 dark:bg-nexora-blue/10'
                        : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-bold text-slate-400">{t.id}</span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{t.subject}</h4>
                    
                    <div className="mt-2.5 flex justify-between items-center">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${getPriorityColor(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Ticket details comment thread */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 flex flex-col justify-between min-h-[400px]">
          
          {!selectedTicket ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 flex-1">
              <Inbox className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">Select a support ticket</p>
              <p className="text-xs">Select any ticket from the listing panel to view comments thread or modify status.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Info Area */}
              <div>
                <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{selectedTicket.category} • ID: {selectedTicket.id}</span>
                    <h2 className="text-sm md:text-base font-extrabold font-heading text-slate-900 dark:text-white mt-1">
                      {selectedTicket.subject}
                    </h2>
                  </div>
                  
                  {/* Status Dropdown selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketEntity['status'])}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md border focus:outline-none ${getStatusColor(selectedTicket.status)} border-transparent`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="WAITING FOR USER">WAITING FOR USER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Assignment & Owner row */}
                <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <User size={12} />
                    <span>Created by: <strong className="text-slate-700 dark:text-slate-200">{selectedTicket.createdById}</strong></span>
                  </div>

                  {/* Assignee select box (Only Admins/Mentors can reassign) */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Assigned To:</span>
                    {currentUser.role === 'ADMIN' ? (
                      <select
                        value={selectedTicket.assignedToId || ''}
                        onChange={(e) => handleAssignChange(e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {adminsAndMentors.map(u => (
                          <option key={u.email} value={u.email}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    ) : (
                      <strong className="text-slate-750 dark:text-slate-200">
                        {selectedTicket.assignedToId || 'Unassigned support queue'}
                      </strong>
                    )}
                  </div>
                </div>

                {/* Description details */}
                <div className="py-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-b border-slate-100 dark:border-slate-800">
                  <strong className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1.5">Description details</strong>
                  <p className="p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/10 border border-slate-150 dark:border-slate-800/40">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Comment Thread (scrollable) */}
              <div className="flex-1 flex flex-col justify-end mt-4">
                <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-1 mb-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-50 dark:border-slate-900">
                    Replies Thread ({selectedTicketComments.length})
                  </span>
                  
                  {selectedTicketComments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No comments posted yet. Add a reply to coordinate.</p>
                  ) : (
                    selectedTicketComments.map(c => (
                      <div key={c.id} className="text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {c.userName} <span className="text-[9px] text-slate-400 font-normal">({c.userRole})</span>
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                          {c.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your response here..."
                    className="flex-grow px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold"
                  >
                    Reply
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ====================================================
          RAISE TICKET MODAL FORM
          ==================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white flex items-center">
                <Ticket className="w-4 h-4 text-nexora-blue mr-2" /> Log Support Ticket
              </h2>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700/80 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  placeholder="e.g. Docker license expired or unable to sync calendars"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Details Description</label>
                <textarea
                  rows={3}
                  required
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  placeholder="Elaborate on the issue, including any error logs, step guidelines, or attachments info..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* AI Auto-categorization trigger button */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-nexora-blue dark:text-nexora-electric animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold block text-slate-700 dark:text-slate-300">AI Ticket router engine</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Let AI predict ticket Category & Priority to speed routing.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAIClassify}
                  disabled={!newTicketSubject || aiClassifying}
                  className="px-3 py-1.5 bg-nexora-blue text-white rounded text-[10px] font-bold uppercase disabled:opacity-50"
                >
                  {aiClassifying ? 'Analyzing...' : 'Predict Details'}
                </button>
              </div>

              {/* Output AI display */}
              {aiClassificationResult && (
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-xs space-y-1 animate-fade-in">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-green-600 dark:text-green-400">Predicted Category: {aiClassificationResult.category}</span>
                    <span className="text-green-600 dark:text-green-400">Priority: {aiClassificationResult.priority}</span>
                  </div>
                  <p className="text-[10px] text-slate-450 italic">Reasoning: {aiClassificationResult.reasoning}</p>
                </div>
              )}

              {/* Categorization & Priorities manual options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Manual Category</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value as TicketEntity['category'])}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Access Issue">Access Issue</option>
                    <option value="Internship">Internship</option>
                    <option value="Project">Project</option>
                    <option value="HR">HR</option>
                    <option value="Training">Training</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Manual Priority</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value as TicketEntity['priority'])}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded text-xs font-semibold shadow"
                >
                  Confirm File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
