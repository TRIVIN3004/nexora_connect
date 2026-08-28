import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Video, 
  Ticket, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  User, 
  ExternalLink,
  PlusCircle,
  HelpCircle,
  FileText,
  Megaphone,
  Pin,
  Check
} from 'lucide-react';
import { BroadcastModal } from './BroadcastModal';

export const Dashboard: React.FC = () => {
  const { db, dispatcher, currentUser, setCurrentTab, triggerRefresh } = useApp();
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch records
  const allWebinars = db.getWebinars();
  const allMeetings = db.getMeetings();
  const allTickets = db.getTickets();
  const allNotes = db.getKnowledgeNotes().filter(n => n.status === 'PUBLISHED');
  const allRecordings = db.getRecordings();
  const allBroadcasts = db.getCompanyMessages();

  // Sort broadcasts: pinned first, then newest
  const sortedBroadcasts = [...allBroadcasts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const recentBroadcasts = sortedBroadcasts.slice(0, 2);

  // 1. Calculate Statistics
  const upcomingWebinarsCount = allWebinars.filter(w => w.status === 'UPCOMING' || w.status === 'LIVE').length;
  
  const todaysMeetings = allMeetings.filter(m => m.date === todayStr);
  const userMeetings = todaysMeetings.filter(m => 
    currentUser.role === 'ADMIN' || 
    m.organizerId === currentUser.email || 
    m.participants.includes(currentUser.email)
  );
  
  const userTickets = allTickets.filter(t => 
    currentUser.role === 'ADMIN' || 
    t.createdById === currentUser.email
  );
  const openTicketsCount = userTickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const notesCount = allNotes.length;

  // Recent recordings (first 3)
  const recentRecordings = allRecordings.slice(0, 3);
  // Live or upcoming webinars (first 2)
  const activeWebinars = allWebinars.filter(w => w.status === 'LIVE' || w.status === 'UPCOMING').slice(0, 2);
  // Recent published notes (first 3)
  const recentNotes = allNotes.slice(0, 3);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleToggleAcknowledge = (msgId: string) => {
    db.acknowledgeCompanyMessage(msgId, currentUser.email);
    triggerRefresh();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
      
      {/* ====================================================
          WELCOME HEADER BANNER
          ==================================================== */}
      <div className="bg-gradient-to-r from-[#06152F] to-[#0878C9] rounded-2xl p-6 md:p-8 text-white premium-shadow relative overflow-hidden">
        {/* Subtle grid accent design */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading tracking-tight mb-2">
              {getGreeting()}, {currentUser.name} 👋
            </h1>
            <p className="text-slate-200 text-sm md:text-base font-medium max-w-xl">
              Welcome to the Nexora Connect portal. Explore webinars, coordinate meetings, share knowledge, and collaborate.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Megaphone size={14} className="text-yellow-300" />
              <span>Broadcast to All</span>
            </button>
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-100">
                Role: {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          COMPANY BROADCASTS NOTICE WIDGET
          ==================================================== */}
      {recentBroadcasts.length > 0 && (
        <div className="bg-gradient-to-br from-white to-sky-50/30 dark:from-dark-card dark:to-slate-900/60 rounded-2xl border border-nexora-blue/30 dark:border-nexora-blue/20 p-5 md:p-6 premium-shadow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-nexora-blue/10 text-nexora-blue dark:text-nexora-electric">
                <Megaphone size={17} />
              </div>
              <div>
                <h2 className="text-sm md:text-base font-bold font-heading text-slate-900 dark:text-white flex items-center">
                  Company Broadcasts & Announcements
                </h2>
                <p className="text-[11px] text-slate-400">
                  Active company-wide updates sent to all employees
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="text-xs font-bold text-nexora-blue dark:text-nexora-electric hover:underline flex items-center"
              >
                + Send Message to All
              </button>
              <button
                onClick={() => setCurrentTab('broadcasts')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
              >
                <span>View all ({allBroadcasts.length})</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBroadcasts.map(msg => {
              const hasAcked = (msg.acknowledgments || []).includes(currentUser.email);
              return (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-nexora-blue/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {msg.pinned && (
                          <span className="p-1 rounded bg-amber-500/10 text-amber-600 text-[10px] font-bold flex items-center">
                            <Pin size={10} className="mr-0.5" /> Pinned
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric bg-nexora-blue/10 px-2 py-0.5 rounded-full">
                          {msg.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {msg.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">
                      By {msg.senderName}
                    </span>
                    <button
                      onClick={() => handleToggleAcknowledge(msg.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                        hasAcked
                          ? 'bg-green-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Check size={12} />
                      <span>{hasAcked ? 'Acknowledged' : 'Acknowledge'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Broadcast Modal Dialog */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* ====================================================
          DASHBOARD CARDS INDICATORS
          ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Webinars Card */}
        <div 
          onClick={() => setCurrentTab('webinars')} 
          className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow hover:border-nexora-blue/50 dark:hover:border-nexora-blue/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Upcoming Webinars
              </span>
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {String(upcomingWebinarsCount).padStart(2, '0')}
              </span>
            </div>
            <div className="p-2.5 bg-nexora-blue/10 rounded-lg text-nexora-blue dark:text-nexora-electric group-hover:bg-nexora-blue group-hover:text-white transition-colors duration-200">
              <Calendar size={18} />
            </div>
          </div>
          <div className="flex items-center text-[10px] font-semibold text-nexora-blue dark:text-nexora-electric mt-4">
            <span>Browse learning topics</span>
            <ArrowRight size={10} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Meetings Card */}
        <div 
          onClick={() => setCurrentTab('meetings')} 
          className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow hover:border-nexora-blue/50 dark:hover:border-nexora-blue/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Today's Meetings
              </span>
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {String(userMeetings.length).padStart(2, '0')}
              </span>
            </div>
            <div className="p-2.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors duration-200">
              <Clock size={18} />
            </div>
          </div>
          <div className="flex items-center text-[10px] font-semibold text-green-600 dark:text-green-400 mt-4">
            <span>View agenda timeline</span>
            <ArrowRight size={10} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Tickets Card */}
        <div 
          onClick={() => setCurrentTab('tickets')} 
          className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow hover:border-nexora-blue/50 dark:hover:border-nexora-blue/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Open Support Issues
              </span>
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {String(openTicketsCount).padStart(2, '0')}
              </span>
            </div>
            <div className="p-2.5 bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors duration-200">
              <Ticket size={18} />
            </div>
          </div>
          <div className="flex items-center text-[10px] font-semibold text-red-600 dark:text-red-400 mt-4">
            <span>Manage tech tickets</span>
            <ArrowRight size={10} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Knowledge Notes Card */}
        <div 
          onClick={() => setCurrentTab('library')} 
          className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow hover:border-nexora-blue/50 dark:hover:border-nexora-blue/50 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Knowledge Notes
              </span>
              <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {String(notesCount).padStart(2, '0')}
              </span>
            </div>
            <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-200">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="flex items-center text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-4">
            <span>Open team wiki library</span>
            <ArrowRight size={10} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

      </div>

      {/* ====================================================
          CORE SECTION CONTENT WIDGETS
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Meetings Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Meetings widget */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold font-heading flex items-center">
                <Clock className="w-4 h-4 text-green-500 mr-2" /> Today's Meetings Syncs
              </h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded font-medium">
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {userMeetings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No meetings scheduled for today</p>
                <p className="text-xs">Your calendar is clean. Enjoy your focus time!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {userMeetings.map(meet => {
                  const organizer = db.getUser(meet.organizerId);
                  return (
                    <div key={meet.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-start space-x-3.5">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg text-slate-700 dark:text-slate-300 font-semibold text-center min-w-16">
                          <span className="block text-xs uppercase tracking-wider">{meet.startTime}</span>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">{meet.platform}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{meet.title}</h3>
                          <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 mt-1">
                            <span className="flex items-center"><User size={12} className="mr-1" /> Organizer: {organizer ? organizer.name : meet.organizerId}</span>
                            <span>•</span>
                            <span>{meet.participants.length + 1} participants</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={meet.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center transition-all duration-150 active:scale-[0.98]"
                      >
                        Join Session <ExternalLink size={12} className="ml-1" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Learning Webinar Module */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold font-heading flex items-center">
                <Calendar className="w-4 h-4 text-nexora-blue mr-2" /> Live & Upcoming Learning Sessions
              </h2>
              <button 
                onClick={() => setCurrentTab('webinars')}
                className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
              >
                View all webinars <ArrowRight size={12} className="ml-1" />
              </button>
            </div>

            {activeWebinars.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                Nothing scheduled yet. New learning opportunities will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeWebinars.map(web => {
                  const userEmail = (currentUser.email || '').trim().toLowerCase();
                  const registered = db.getWebinarRegistrations().some(
                    r => r.webinarId === web.id && (r.userId || '').trim().toLowerCase() === userEmail
                  );
                  return (
                    <div key={web.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700/80 transition-colors duration-200">
                      <div className="h-32 relative overflow-hidden">
                        <img src={web.thumbnail} alt={web.title} className="w-full h-full object-cover" />
                        <span className={`absolute top-2 right-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          web.status === 'LIVE' 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-nexora-blue text-white'
                        }`}>
                          {web.status}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-nexora-blue dark:text-nexora-electric uppercase font-bold tracking-wider">{web.category}</span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">{web.title}</h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Speaker: {web.speaker}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{web.date}</span>
                          {web.status === 'COMPLETED' ? (
                            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              Finished
                            </span>
                          ) : registered ? (
                            <span 
                              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 cursor-default"
                              title="Your seat is confirmed"
                            >
                              Registered ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                db.registerForWebinar(web.id, currentUser.email);
                                dispatcher.dispatchWebinarRegistration(currentUser.email, web.id);
                                triggerRefresh();
                              }}
                              className="px-2.5 py-1 bg-nexora-blue text-white rounded text-[10px] font-bold hover:bg-nexora-blue/80 active:scale-95 cursor-pointer"
                            >
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Library & Recording Feeds */}
        <div className="space-y-6">
          
          {/* Support Widget */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold font-heading flex items-center">
                <Ticket className="w-4 h-4 text-red-500 mr-2" /> Helpdesk Tickets
              </h2>
              <button 
                onClick={() => setCurrentTab('tickets')}
                className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
              >
                Go to Support <ArrowRight size={12} className="ml-1" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 leading-relaxed">
              Need assistance? Raise a support ticket directly with IT, HR, or project coordinators.
            </p>

            <button
              onClick={() => {
                setCurrentTab('tickets');
                // Auto scroll to creation or pass flag later
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150"
            >
              <PlusCircle size={14} className="mr-1.5" /> File Support Ticket
            </button>
          </div>

          {/* Latest Knowledge Notes */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold font-heading flex items-center">
                <BookOpen className="w-4 h-4 text-purple-500 mr-2" /> Recent Knowledge Notes
              </h2>
              <button 
                onClick={() => setCurrentTab('library')}
                className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline"
              >
                Explore Wiki
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                Be the first to share something useful.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => setCurrentTab('library')}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 p-2 rounded-lg transition-colors duration-150 flex items-start space-x-2.5"
                  >
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400 mt-0.5">
                      <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue dark:group-hover:text-nexora-electric truncate">
                        {note.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        By {note.authorName} in {note.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Added Recordings */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold font-heading flex items-center">
                <Video className="w-4 h-4 text-orange-500 mr-2" /> Recorded Synced Videos
              </h2>
              <button 
                onClick={() => setCurrentTab('recordings')}
                className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline"
              >
                Browse logs
              </button>
            </div>

            <div className="space-y-3.5">
              {recentRecordings.map(rec => (
                <div 
                  key={rec.id} 
                  onClick={() => setCurrentTab('recordings')}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <div className="w-16 h-10 rounded overflow-hidden relative border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-black/70 text-white px-1 rounded">
                      {rec.duration}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-nexora-blue dark:group-hover:text-nexora-electric transition-colors duration-150">
                      {rec.title}
                    </h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      {rec.date} • {rec.organizer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
