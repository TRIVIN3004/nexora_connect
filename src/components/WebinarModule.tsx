import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Video, 
  User, 
  Clock, 
  Check,
  ChevronRight,
  ExternalLink,
  CalendarCheck,
  AlertCircle,
  X,
  Trash2,
  Send,
  Zap,
  Mail,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import type { Webinar } from '../services/database';
import { InstantEmailModal } from './InstantEmailModal';

export const WebinarModule: React.FC = () => {
  const { db, dispatcher, currentUser, triggerRefresh } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);

  // Deletion & Action states
  const [webinarToDelete, setWebinarToDelete] = useState<Webinar | null>(null);
  const [broadcastLinkWebinar, setBroadcastLinkWebinar] = useState<Webinar | null>(null);
  const [broadcastCustomNote, setBroadcastCustomNote] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [instantEmailOpen, setInstantEmailOpen] = useState(false);

  // Forms
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [sendLinkToAllOnSchedule, setSendLinkToAllOnSchedule] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    speakerDesignation: '',
    speakerOrganization: 'Nexora Technologies',
    date: '',
    startTime: '',
    endTime: '',
    duration: 90,
    platform: 'Google Meet' as Webinar['platform'],
    url: '',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'Programming',
    tags: '',
    registrationDeadline: '',
    maxParticipants: 100,
    status: 'UPCOMING' as Webinar['status']
  });

  const categories = ['ALL', 'AI / ML', 'Web Development', 'Cloud', 'DevOps', 'Programming'];

  const webinars = db.getWebinars();
  const registrations = db.getWebinarRegistrations();
  const allUsers = db.getUsers();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Apply filters
  const filteredWebinars = webinars.filter(web => {
    const matchesSearch = web.title.toLowerCase().includes(search.toLowerCase()) || 
                          web.speaker.toLowerCase().includes(search.toLowerCase()) ||
                          web.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || web.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || web.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate countdown timer text
  const getCountdown = (dateStr: string, startTimeStr: string) => {
    const target = new Date(`${dateStr}T${startTimeStr}`);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Session started / ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `Starts in ${days} days ${hours} hours`;
    if (hours > 0) return `Starts in ${hours} hours ${minutes} mins`;
    return `Starts in ${minutes} minutes`;
  };

  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const handleRegister = (webinarId: string) => {
    const targetWeb = db.getWebinars().find(w => w.id === webinarId);
    if (targetWeb?.status === 'COMPLETED' || targetWeb?.status === 'CANCELLED') {
      showToast('⚠️ This session has finished. Registrations are closed.');
      return;
    }

    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const isRegistered = registrations.some(
      r => r.webinarId === webinarId && (r.userId || '').trim().toLowerCase() === userEmail
    );

    if (isRegistered) {
      showToast('✅ You are already registered for this session. Your seat is confirmed.');
      return;
    }

    if (registeringId === webinarId) return;
    setRegisteringId(webinarId);

    try {
      db.registerForWebinar(webinarId, userEmail);
      // Dispatch confirmation email & in-app alert once
      dispatcher.dispatchWebinarRegistration(currentUser.email, webinarId);
      showToast('🎉 Registration confirmed! Confirmation email dispatched to your inbox.');
      triggerRefresh();
    } catch (err: any) {
      showToast(`❌ Registration error: ${err.message || 'Failed'}`);
    } finally {
      setTimeout(() => {
        setRegisteringId(null);
      }, 500);
    }

    // Sync current drawer detail
    if (selectedWebinar && selectedWebinar.id === webinarId) {
      const updated = db.getWebinars().find(w => w.id === webinarId);
      if (updated) setSelectedWebinar(updated);
    }
  };

  const handleFinishWebinar = (webinarId: string) => {
    const targetWeb = db.getWebinars().find(w => w.id === webinarId);
    if (!targetWeb) return;

    if (window.confirm(`Mark meeting "${targetWeb.title}" as Finished? Registrations will be permanently closed.`)) {
      const updated: Webinar = { ...targetWeb, status: 'COMPLETED' };
      db.updateWebinar(updated, currentUser.email, currentUser.name);
      if (selectedWebinar && selectedWebinar.id === webinarId) {
        setSelectedWebinar(updated);
      }
      triggerRefresh();
      showToast(`🏁 Meeting "${targetWeb.title}" has been marked as Finished.`);
    }
  };

  const handleConfirmDelete = () => {
    if (!webinarToDelete) return;
    const targetId = webinarToDelete.id;
    const targetTitle = webinarToDelete.title;

    db.deleteWebinar(targetId, currentUser.email, currentUser.name);

    if (selectedWebinar && selectedWebinar.id === targetId) {
      setSelectedWebinar(null);
    }
    if (createModalOpen && editMode && selectedWebinar?.id === targetId) {
      setCreateModalOpen(false);
    }

    setWebinarToDelete(null);
    triggerRefresh();
    showToast(`Webinar "${targetTitle}" was deleted successfully.`);
  };

  const handleBroadcastMeetingLink = () => {
    if (!broadcastLinkWebinar) return;
    setIsBroadcasting(true);

    try {
      dispatcher.dispatchWebinarLinkToAllEmployees(
        broadcastLinkWebinar.id,
        currentUser.name,
        broadcastCustomNote.trim() || undefined
      );

      // Audit log
      db.createAuditLog(
        currentUser.email,
        currentUser.name,
        'WEBINAR_LINK_BROADCAST_TO_ALL',
        'Webinar',
        broadcastLinkWebinar.id
      );

      triggerRefresh();
      setIsBroadcasting(false);
      const title = broadcastLinkWebinar.title;
      setBroadcastLinkWebinar(null);
      setBroadcastCustomNote('');
      showToast(`Meeting link for "${title}" successfully emailed and notified to ALL ${allUsers.length} employees!`);
    } catch (e) {
      console.error('Broadcast webinar link failed:', e);
      setIsBroadcasting(false);
      alert('Failed to send broadcast. Please try again.');
    }
  };

  const handleCreateWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    
    let targetWebinarId = '';

    if (editMode && selectedWebinar) {
      targetWebinarId = selectedWebinar.id;
      const updated: Webinar = {
        ...selectedWebinar,
        ...formData,
        tags: tagsArr,
        duration: Number(formData.duration),
        maxParticipants: Number(formData.maxParticipants)
      };
      db.updateWebinar(updated, currentUser.email, currentUser.name);
      setSelectedWebinar(updated);
      showToast(`Webinar "${updated.title}" updated successfully.`);
    } else {
      const created = db.createWebinar(
        {
          ...formData,
          tags: tagsArr,
          duration: Number(formData.duration),
          maxParticipants: Number(formData.maxParticipants)
        },
        currentUser.email,
        currentUser.name
      );
      targetWebinarId = created.id;
      showToast(`Webinar "${created.title}" scheduled successfully.`);
    }

    // If checkbox to broadcast link to all employees is selected
    if (sendLinkToAllOnSchedule && targetWebinarId) {
      dispatcher.dispatchWebinarLinkToAllEmployees(targetWebinarId, currentUser.name);
      showToast(`Webinar meeting link & invite dispatched to all ${allUsers.length} employees!`);
    }

    setCreateModalOpen(false);
    setEditMode(false);
    triggerRefresh();
  };

  const openEditForm = (web: Webinar) => {
    setFormData({
      title: web.title,
      description: web.description,
      speaker: web.speaker,
      speakerDesignation: web.speakerDesignation,
      speakerOrganization: web.speakerOrganization,
      date: web.date,
      startTime: web.startTime,
      endTime: web.endTime,
      duration: web.duration,
      platform: web.platform,
      url: web.url,
      thumbnail: web.thumbnail,
      category: web.category,
      tags: web.tags.join(', '),
      registrationDeadline: web.registrationDeadline,
      maxParticipants: web.maxParticipants,
      status: web.status
    });
    setEditMode(true);
    setSendLinkToAllOnSchedule(false);
    setCreateModalOpen(true);
  };

  // Calendar integrations
  const getCalendarLink = (web: Webinar, type: 'google' | 'outlook' | 'ics') => {
    const titleStr = encodeURIComponent(web.title);
    const descStr = encodeURIComponent(web.description);
    const startIso = `${web.date.replace(/-/g, '')}T${web.startTime.replace(/:/g, '')}00Z`;
    const endIso = `${web.date.replace(/-/g, '')}T${web.endTime.replace(/:/g, '')}00Z`;

    if (type === 'google') {
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleStr}&dates=${startIso}/${endIso}&details=${descStr}&location=${encodeURIComponent(web.url)}`;
    }
    if (type === 'outlook') {
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${titleStr}&startdt=${web.date}T${web.startTime}&enddt=${web.date}T${web.endTime}&body=${descStr}&location=${encodeURIComponent(web.url)}`;
    }
    // For ICS download simulator
    return `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${titleStr}%0ADTSTART:${startIso}%0ADTEND:${endIso}%0ADESCRIPTION:${descStr}%0ALOCATION:${encodeURIComponent(web.url)}%0AEND:VEVENT%0AEND:VCALENDAR`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 rounded-xl shadow-2xl flex items-center space-x-3 max-w-md animate-slide-in border border-slate-700 dark:border-slate-300">
          <CheckCircle2 size={20} className="text-green-400 dark:text-green-600 shrink-0" />
          <p className="text-xs font-semibold flex-1 leading-snug">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white dark:hover:text-black"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ====================================================
          SUB-HEADER BANNER & ACTIONS
          ==================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center">
            Nexora Webinars Hub
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Discover internal masterclasses, technical panels, and live sessions scheduled across Nexora.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Quick Sudden Instant Email Trigger */}
          <button
            onClick={() => setInstantEmailOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Send an immediate broadcast email to all employees"
          >
            <Zap size={14} className="mr-1.5 text-yellow-200 animate-pulse" />
            <span>Instant Email to All</span>
          </button>

          {/* Schedule Webinar Button (Admin) */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => {
                setEditMode(false);
                setSendLinkToAllOnSchedule(true);
                setFormData({
                  title: '',
                  description: '',
                  speaker: '',
                  speakerDesignation: '',
                  speakerOrganization: 'Nexora Technologies',
                  date: '',
                  startTime: '',
                  endTime: '',
                  duration: 90,
                  platform: 'Google Meet',
                  url: '',
                  thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
                  category: 'Programming',
                  tags: '',
                  registrationDeadline: '',
                  maxParticipants: 100,
                  status: 'UPCOMING'
                });
                setCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <Plus size={16} className="mr-1.5" /> Schedule Webinar
            </button>
          )}
        </div>
      </div>

      {/* ====================================================
          SEARCH & FILTERING PANEL
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col md:flex-row justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, speaker, tag..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-dark-bg/60 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-nexora-blue"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-semibold px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="LIVE">LIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

      </div>

      {/* ====================================================
          WEBINARS CARDS GRID
          ==================================================== */}
      {filteredWebinars.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center border border-slate-200 dark:border-dark-border premium-shadow">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">No webinars found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Nothing scheduled matches your filter query. New learning opportunities will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebinars.map(web => {
            const userEmail = (currentUser.email || '').trim().toLowerCase();
            const isRegistered = registrations.some(
              r => r.webinarId === web.id && (r.userId || '').trim().toLowerCase() === userEmail
            );
            const totalRegistrations = registrations.filter(r => r.webinarId === web.id).length;

            return (
              <div 
                key={web.id}
                className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group"
              >
                {/* Header Image Thumbnail */}
                <div className="h-44 relative overflow-hidden">
                  <img src={web.thumbnail} alt={web.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Status Badges */}
                  <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    web.status === 'LIVE' 
                      ? 'bg-red-500 text-white animate-pulse'
                      : web.status === 'UPCOMING'
                      ? 'bg-nexora-blue text-white'
                      : web.status === 'COMPLETED'
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-red-800 text-red-100'
                  }`}>
                    {web.status}
                  </span>

                  {/* Admin Quick Delete Icon Button */}
                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setWebinarToDelete(web);
                      }}
                      className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white/80 hover:text-white backdrop-blur-xs transition-colors"
                      title="Delete Webinar"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  <span className="absolute bottom-3 left-3 text-[10px] bg-slate-900/80 backdrop-blur-sm text-nexora-electric px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {web.category}
                  </span>

                  <span className="absolute bottom-3 right-3 text-[10px] bg-black/60 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded font-semibold flex items-center">
                    <Video size={10} className="mr-1 text-sky-400" /> {web.platform}
                  </span>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 
                      onClick={() => setSelectedWebinar(web)}
                      className="font-heading font-bold text-sm md:text-base text-slate-900 dark:text-white cursor-pointer hover:text-nexora-blue dark:hover:text-nexora-electric leading-snug line-clamp-2"
                    >
                      {web.title}
                    </h3>
                    
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <User size={13} className="mr-1.5 text-slate-400 shrink-0" />
                      <span className="truncate">{web.speaker} <span className="text-[10px] text-slate-400">({web.speakerDesignation})</span></span>
                    </div>

                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <CalendarIcon size={13} className="mr-1.5 text-slate-400 shrink-0" />
                      <span>{web.date} at {web.startTime}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>👥 {totalRegistrations} registered</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                        Cap: {web.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {/* Broadcast meeting link to all employees quick button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5">
                    
                    {/* Send link to all button */}
                    <button
                      onClick={() => setBroadcastLinkWebinar(web)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-sky-200 dark:border-sky-850 hover:bg-sky-50 dark:hover:bg-sky-950/30 text-nexora-blue dark:text-sky-400 text-[11px] font-bold flex items-center justify-center space-x-1.5 transition-all"
                      title="Email webinar meeting link directly to all company employees"
                    >
                      <Mail size={13} />
                      <span>📧 Send Link to All Staff ({allUsers.length})</span>
                    </button>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setSelectedWebinar(web)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center"
                        >
                          Details <ChevronRight size={14} className="ml-0.5" />
                        </button>

                        {currentUser.role === 'ADMIN' && web.status !== 'COMPLETED' && web.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleFinishWebinar(web.id)}
                            className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded text-[10px] font-bold flex items-center transition-colors cursor-pointer"
                            title="Mark this session as Finished / Completed"
                          >
                            🏁 End Meeting
                          </button>
                        )}
                      </div>

                      {web.status === 'COMPLETED' ? (
                        <div className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center cursor-not-allowed">
                          <CheckCircle2 size={12} className="mr-1 text-slate-400" />
                          Meeting Finished (Closed)
                        </div>
                      ) : web.status === 'CANCELLED' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                          Cancelled
                        </span>
                      ) : isRegistered ? (
                        <div 
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center cursor-default shadow-xs" 
                          title="Your seat is confirmed"
                        >
                          <Check size={13} className="mr-1 text-emerald-500 stroke-[3]" />
                          Registered ✓
                        </div>
                      ) : (
                        <button
                          disabled={registeringId === web.id}
                          onClick={() => handleRegister(web.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-nexora-blue hover:bg-nexora-blue/90 text-white shadow-sm flex items-center transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {registeringId === web.id ? 'Confirming...' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ====================================================
          WEBINAR DETAILS DRAWER / MODAL
          ==================================================== */}
      {selectedWebinar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl h-full bg-white dark:bg-dark-card border-l border-slate-200 dark:border-dark-border flex flex-col justify-between shadow-2xl p-6 overflow-y-auto animate-slide-in">
            
            {/* Drawer Header */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-nexora-blue/15 text-nexora-electric px-3 py-1 rounded font-bold uppercase tracking-wider">
                    {selectedWebinar.category}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedWebinar.platform}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedWebinar(null)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Title & Banner */}
              <h2 className="text-lg md:text-xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight">
                {selectedWebinar.title}
              </h2>
              
              <div className="mt-3 h-44 rounded-lg overflow-hidden relative">
                <img src={selectedWebinar.thumbnail} alt={selectedWebinar.title} className="w-full h-full object-cover" />
                {selectedWebinar.status !== 'COMPLETED' && selectedWebinar.status !== 'CANCELLED' && (
                  <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white px-2.5 py-1 rounded border border-white/10">
                    {getCountdown(selectedWebinar.date, selectedWebinar.startTime)}
                  </div>
                )}
              </div>

              {/* Company-Wide Broadcast Meeting Link Box */}
              <div className="mt-5 p-4 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-r from-sky-500/10 via-nexora-blue/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center">
                    <Send size={13} className="mr-1.5 text-nexora-blue" />
                    Broadcast Meeting Link to ALL Employees
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sends the webinar joining link directly to all {allUsers.length} staff emails.
                  </p>
                </div>
                <button
                  onClick={() => setBroadcastLinkWebinar(selectedWebinar)}
                  className="px-3.5 py-1.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-bold flex items-center shrink-0 shadow-xs active:scale-95 transition-all"
                >
                  <Mail size={13} className="mr-1.5" />
                  Broadcast Link
                </button>
              </div>

              {/* Details List */}
              <div className="mt-5 space-y-4">
                
                {/* Speaker Info */}
                <div className="border border-slate-100 dark:border-slate-850 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold block mb-2">
                    Keynote Speaker
                  </span>
                  <div className="flex items-start space-x-3">
                    <div className="bg-nexora-blue/10 p-2 rounded-lg text-nexora-blue">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedWebinar.speaker}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedWebinar.speakerDesignation}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{selectedWebinar.speakerOrganization}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-slate-950/20">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Date & Time</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {selectedWebinar.date} <br/> {selectedWebinar.startTime} - {selectedWebinar.endTime}
                    </span>
                  </div>
                  <div className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-slate-950/20">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Platform & Meeting URL</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                      <Video size={12} className="mr-1 text-slate-400" /> {selectedWebinar.platform}
                    </span>
                    <a
                      href={selectedWebinar.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-nexora-blue hover:underline truncate block mt-0.5"
                    >
                      {selectedWebinar.url}
                    </a>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {selectedWebinar.description}
                  </p>
                </div>

                {/* Topics covered */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Topics & Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWebinar.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add to Calendar Actions */}
                {selectedWebinar.status !== 'COMPLETED' && selectedWebinar.status !== 'CANCELLED' && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sync to Calendar</h4>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={getCalendarLink(selectedWebinar, 'google')} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-850"
                      >
                        <CalendarCheck size={12} className="mr-1 text-red-500" /> Google Calendar
                      </a>
                      <a 
                        href={getCalendarLink(selectedWebinar, 'outlook')} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-850"
                      >
                        <CalendarCheck size={12} className="mr-1 text-blue-500" /> Outlook
                      </a>
                      <a 
                        href={getCalendarLink(selectedWebinar, 'ics')} 
                        download="event.ics"
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-850"
                      >
                        <Clock size={12} className="mr-1 text-green-500" /> Download ICS
                      </a>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              
              {/* Left: Admin Actions (Edit, Mark Finished & Delete) */}
              {currentUser.role === 'ADMIN' ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditForm(selectedWebinar)}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold flex items-center"
                  >
                    <Edit3 size={13} className="mr-1.5" /> Edit
                  </button>

                  {selectedWebinar.status !== 'COMPLETED' && selectedWebinar.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleFinishWebinar(selectedWebinar.id)}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg text-xs font-bold flex items-center transition-colors cursor-pointer"
                      title="Mark session as Completed / Finished"
                    >
                      🏁 End Meeting
                    </button>
                  )}

                  <button
                    onClick={() => setWebinarToDelete(selectedWebinar)}
                    className="px-3 py-2 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center"
                  >
                    <Trash2 size={13} className="mr-1.5" /> Delete
                  </button>
                </div>
              ) : <div />}

              {/* Right: Registration / Launch Actions */}
              <div className="flex items-center space-x-2">
                {selectedWebinar.status === 'COMPLETED' ? (
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center">
                    <CheckCircle2 size={13} className="mr-1.5 text-slate-400" />
                    Session Finished (Registration Closed)
                  </span>
                ) : selectedWebinar.status === 'CANCELLED' ? (
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest px-4 py-2">
                    Cancelled
                  </span>
                ) : (
                  <>
                    {registrations.some(
                      r => r.webinarId === selectedWebinar.id && (r.userId || '').trim().toLowerCase() === (currentUser.email || '').trim().toLowerCase()
                    ) ? (
                      <div className="px-4 py-2 text-xs font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center cursor-default">
                        <Check size={13} className="mr-1.5 text-emerald-500 stroke-[3]" />
                        Registered ✓ (Seat Confirmed)
                      </div>
                    ) : (
                      <button
                        disabled={registeringId === selectedWebinar.id}
                        onClick={() => handleRegister(selectedWebinar.id)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-nexora-blue hover:bg-nexora-blue/90 text-white shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {registeringId === selectedWebinar.id ? 'Registering...' : 'Register'}
                      </button>
                    )}

                    <a
                      href={selectedWebinar.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150"
                    >
                      Join Session <ExternalLink size={12} className="ml-1" />
                    </a>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          DELETE CONFIRMATION MODAL
          ==================================================== */}
      {webinarToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-red-200 dark:border-red-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Delete Webinar?
                </h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{webinarToDelete.title}"</strong>? 
              This will permanently remove the webinar, its schedule, and all associated registrations from the database.
            </p>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setWebinarToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Yes, Delete Webinar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          BROADCAST MEETING LINK TO ALL EMPLOYEES MODAL
          ==================================================== */}
      {broadcastLinkWebinar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-sky-100 dark:bg-sky-950/50 rounded-xl text-nexora-blue">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                    Send Meeting Link to ALL Employees
                  </h3>
                  <p className="text-xs text-slate-400">
                    Broadcast meeting invitation directly to all {allUsers.length} staff members.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastLinkWebinar(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Webinar Summary Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {broadcastLinkWebinar.title}
              </p>
              <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 space-x-3">
                <span>📅 {broadcastLinkWebinar.date} at {broadcastLinkWebinar.startTime}</span>
                <span>📹 {broadcastLinkWebinar.platform}</span>
              </div>
              <p className="text-[11px] text-nexora-blue font-mono truncate">
                Link: {broadcastLinkWebinar.url}
              </p>
            </div>

            {/* Optional Custom Note */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Optional Message / Announcement Note
              </label>
              <textarea
                rows={3}
                value={broadcastCustomNote}
                onChange={(e) => setBroadcastCustomNote(e.target.value)}
                placeholder="e.g. The live masterclass will begin shortly. Please click the link to join the session on time!"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-nexora-blue"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setBroadcastLinkWebinar(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={handleBroadcastMeetingLink}
                className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send to All {allUsers.length} Persons</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          SCHEDULER / CREATE & EDIT DIALOG
          ==================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                {editMode ? 'Edit Webinar Configurations' : 'Schedule New Internal Webinar'}
              </h2>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700/80 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateWebinar} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Webinar Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Masterclass on Microfrontends"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide details about covered topics, target audience, prerequisites..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                />
              </div>

              {/* Speaker row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Speaker Name</label>
                  <input
                    type="text"
                    required
                    value={formData.speaker}
                    onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.speakerDesignation}
                    onChange={(e) => setFormData({...formData, speakerDesignation: e.target.value})}
                    placeholder="Staff Tech Architect"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Organization</label>
                  <input
                    type="text"
                    required
                    value={formData.speakerOrganization}
                    onChange={(e) => setFormData({...formData, speakerOrganization: e.target.value})}
                    placeholder="Nexora Technologies"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Webinar Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Platform & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value as Webinar['platform']})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="MS Teams">MS Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Webex">Webex</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Webinar URL</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://meet.google.com/abc-xyz"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Category, tags, max users */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="e.g. React, frontend, js"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: Number(e.target.value)})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Thumbnail & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Cover Thumbnail URL</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Reg Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Webinar['status']})}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="LIVE">LIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {/* Broadcast meeting link to all employees checkbox */}
              <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-850 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="sendLinkToAllOnSchedule"
                  checked={sendLinkToAllOnSchedule}
                  onChange={(e) => setSendLinkToAllOnSchedule(e.target.checked)}
                  className="mt-0.5 rounded text-nexora-blue focus:ring-nexora-blue"
                />
                <label htmlFor="sendLinkToAllOnSchedule" className="text-xs text-slate-700 dark:text-slate-300 leading-snug cursor-pointer">
                  <strong>Send meeting link and webinar invitation to ALL employees ({allUsers.length} staff)</strong> immediately upon scheduling
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                {editMode && selectedWebinar ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setWebinarToDelete(selectedWebinar);
                    }}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded text-xs font-semibold flex items-center"
                  >
                    <Trash2 size={13} className="mr-1" /> Delete Webinar
                  </button>
                ) : <div />}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded text-xs font-semibold shadow"
                  >
                    {editMode ? 'Save Changes' : 'Schedule Webinar'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Sudden Instant Email Modal */}
      <InstantEmailModal
        isOpen={instantEmailOpen}
        onClose={() => setInstantEmailOpen(false)}
        defaultPriority="HIGH"
      />

    </div>
  );
};
