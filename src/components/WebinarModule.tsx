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
  X
} from 'lucide-react';
import type { Webinar } from '../services/database';

export const WebinarModule: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);

  // Forms
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    speakerDesignation: '',
    speakerOrganization: '',
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

  const handleRegister = (webinarId: string) => {
    const isRegistered = registrations.some(r => r.webinarId === webinarId && r.userId === currentUser.email);
    if (isRegistered) {
      db.unregisterForWebinar(webinarId, currentUser.email);
    } else {
      db.registerForWebinar(webinarId, currentUser.email);
    }
    triggerRefresh();
    // Sync current drawer detail
    if (selectedWebinar && selectedWebinar.id === webinarId) {
      const updated = db.getWebinars().find(w => w.id === webinarId);
      if (updated) setSelectedWebinar(updated);
    }
  };

  const handleCreateWebinar = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    
    if (editMode && selectedWebinar) {
      const updated: Webinar = {
        ...selectedWebinar,
        ...formData,
        tags: tagsArr,
        duration: Number(formData.duration),
        maxParticipants: Number(formData.maxParticipants)
      };
      db.updateWebinar(updated, currentUser.email, currentUser.name);
      setSelectedWebinar(updated);
    } else {
      db.createWebinar(
        {
          ...formData,
          tags: tagsArr,
          duration: Number(formData.duration),
          maxParticipants: Number(formData.maxParticipants)
        },
        currentUser.email,
        currentUser.name
      );
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
      
      {/* ====================================================
          SUB-HEADER BANNER & ACTIONS
          ==================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Nexora Webinars Hub
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Discover internal lectures, technical panels, and masterclasses scheduled by mentors.
          </p>
        </div>
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => {
              setEditMode(false);
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
            className="px-4 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150"
          >
            <Plus size={16} className="mr-1.5" /> Schedule Webinar
          </button>
        )}
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
            const isRegistered = registrations.some(r => r.webinarId === web.id && r.userId === currentUser.email);
            return (
              <div 
                key={web.id}
                className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 hover:scale-[1.01]"
              >
                {/* Header Image Thumbnail */}
                <div className="h-44 relative overflow-hidden">
                  <img src={web.thumbnail} alt={web.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
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

                  <span className="absolute bottom-3 left-3 text-[10px] bg-slate-900/80 backdrop-blur-sm text-nexora-electric px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {web.category}
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
                      <User size={13} className="mr-1.5 text-slate-400" />
                      <span>{web.speaker} <span className="text-[10px] text-slate-400">({web.speakerDesignation})</span></span>
                    </div>

                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <CalendarIcon size={13} className="mr-1.5 text-slate-400" />
                      <span>{web.date} at {web.startTime}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedWebinar(web)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center"
                    >
                      Details <ChevronRight size={14} className="ml-0.5" />
                    </button>

                    {web.status !== 'COMPLETED' && web.status !== 'CANCELLED' ? (
                      <button
                        onClick={() => handleRegister(web.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-all duration-150 active:scale-95 ${
                          isRegistered
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25 hover:bg-green-500/20'
                            : 'bg-nexora-blue hover:bg-nexora-blue/90 text-white shadow-sm'
                        }`}
                      >
                        {isRegistered ? (
                          <><Check size={12} className="mr-1" /> Registered</>
                        ) : (
                          'Register Now'
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {web.status === 'COMPLETED' ? 'Session Completed' : 'Cancelled'}
                      </span>
                    )}
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
                <span className="text-xs bg-nexora-blue/15 text-nexora-electric px-3 py-1 rounded font-bold uppercase tracking-wider">
                  {selectedWebinar.category}
                </span>
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

              {/* Details List */}
              <div className="mt-6 space-y-4">
                
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
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Platform</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                      <Video size={12} className="mr-1 text-slate-400" /> {selectedWebinar.platform}
                    </span>
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
              
              {/* Left: Admin Actions */}
              {currentUser.role === 'ADMIN' ? (
                <button
                  onClick={() => openEditForm(selectedWebinar)}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold"
                >
                  Edit Webinar Info
                </button>
              ) : <div />}

              {/* Right: Registration / Launch Actions */}
              <div className="flex space-x-2">
                {selectedWebinar.status !== 'COMPLETED' && selectedWebinar.status !== 'CANCELLED' ? (
                  <>
                    <button
                      onClick={() => handleRegister(selectedWebinar.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                        registrations.some(r => r.webinarId === selectedWebinar.id && r.userId === currentUser.email)
                          ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {registrations.some(r => r.webinarId === selectedWebinar.id && r.userId === currentUser.email) ? 'Registered ✓' : 'Register'}
                    </button>

                    {registrations.some(r => r.webinarId === selectedWebinar.id && r.userId === currentUser.email) && (
                      <a
                        href={selectedWebinar.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150"
                      >
                        Join Webinar <ExternalLink size={12} className="ml-1" />
                      </a>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2">
                    {selectedWebinar.status === 'COMPLETED' ? 'Session Over' : 'Cancelled'}
                  </span>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          SCHEDULER / CREATE DIALOG
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

            <form onSubmit={handleCreateWebinar} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
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

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
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

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
