import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight } from 'lucide-react';

export const MyActivity: React.FC = () => {
  const { db, currentUser, setCurrentTab } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'webinars' | 'meetings' | 'tickets' | 'notes' | 'bookmarks'>('webinars');

  // Retrieve records
  const allWebinars = db.getWebinars();
  const allMeetings = db.getMeetings();
  const allTickets = db.getTickets();
  const allNotes = db.getKnowledgeNotes();
  const registrations = db.getWebinarRegistrations();
  const bookmarks = db.getBookmarks();

  // 1. Filter user-specific datasets
  const myRegistrations = registrations.filter(r => r.userId === currentUser.email);
  const myRegisteredWebinars = allWebinars.filter(w => myRegistrations.some(r => r.webinarId === w.id));

  const myMeetings = allMeetings.filter(m => m.organizerId === currentUser.email || m.participants.includes(currentUser.email));

  const myTickets = allTickets.filter(t => t.createdById === currentUser.email);

  const myAuthoredNotes = allNotes.filter(n => n.authorId === currentUser.email);

  const myBookmarks = allNotes.filter(n => bookmarks.some(b => b.userId === currentUser.email && b.noteId === n.id));

  const renderSectionHeader = (title: string, count: number) => {
    return (
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
          {count} Items
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
      
      {/* Subheader */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
          My Workspace Activity
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Track your webinar registrations, meeting calendars, support tickets status, and bookmarked notes.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-dark-border flex flex-wrap gap-1.5 pb-px">
        {[
          { id: 'webinars', name: 'Registered Webinars', count: myRegisteredWebinars.length },
          { id: 'meetings', name: 'My Meetings Sync', count: myMeetings.length },
          { id: 'tickets', name: 'Support Tickets', count: myTickets.length },
          { id: 'notes', name: 'Authored Articles', count: myAuthoredNotes.length },
          { id: 'bookmarks', name: 'Wiki Bookmarks', count: myBookmarks.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeSubTab === tab.id
                ? 'border-nexora-blue text-nexora-blue dark:text-nexora-electric'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span>{tab.name}</span>
            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-450 px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ====================================================
          TAB VIEWPORTS
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow">
        
        {/* WEBINARS SUB-TAB */}
        {activeSubTab === 'webinars' && (
          <div className="space-y-4">
            {renderSectionHeader('Webinar Registry', myRegisteredWebinars.length)}
            
            {myRegisteredWebinars.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">You have not registered for any upcoming webinars.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {myRegisteredWebinars.map(web => (
                  <div key={web.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                    <div>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded mr-2 ${
                        web.status === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : 'bg-nexora-blue text-white'
                      }`}>{web.status}</span>
                      <strong className="text-xs text-slate-900 dark:text-white">{web.title}</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Speaker: {web.speaker} • Date: {web.date} at {web.startTime}</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('webinars')}
                      className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
                    >
                      Open Module <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEETINGS SUB-TAB */}
        {activeSubTab === 'meetings' && (
          <div className="space-y-4">
            {renderSectionHeader('My Scheduled Syncs', myMeetings.length)}

            {myMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No meetings on your calendar.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {myMeetings.map(meet => (
                  <div key={meet.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase mr-2">
                        {meet.type}
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">{meet.title}</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Date: {meet.date} at {meet.startTime} - {meet.endTime} ({meet.platform})</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('meetings')}
                      className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
                    >
                      View Calendar <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TICKETS SUB-TAB */}
        {activeSubTab === 'tickets' && (
          <div className="space-y-4">
            {renderSectionHeader('Support Tickets Raised', myTickets.length)}

            {myTickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">You have not filed any support tickets.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 font-mono mr-2">{ticket.id}</span>
                      <strong className="text-xs text-slate-900 dark:text-white">{ticket.subject}</strong>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded`}>
                          Priority: {ticket.priority}
                        </span>
                        <span>•</span>
                        <span className="text-[10px] text-slate-400">Status: {ticket.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('tickets')}
                      className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
                    >
                      Track Ticket <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUTHORED ARTICLES SUB-TAB */}
        {activeSubTab === 'notes' && (
          <div className="space-y-4">
            {renderSectionHeader('Authored Wiki Documents', myAuthoredNotes.length)}

            {myAuthoredNotes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">You have not written any wiki notes yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {myAuthoredNotes.map(note => (
                  <div key={note.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                    <div>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded mr-2 ${
                        note.status === 'PUBLISHED' 
                          ? 'bg-green-500/10 text-green-600' 
                          : note.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>{note.status}</span>
                      <strong className="text-xs text-slate-900 dark:text-white">{note.title}</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Category: {note.category} • Views: {note.views} • Helpful votes: {note.helpfulVotes}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        // Open note editor for edit
                        localStorage.setItem('nexora_editor_note_id', note.id);
                        // Trigger edit nav event listener
                        const e = document.createEvent('Event');
                        e.initEvent('setTab_editor', true, true);
                        window.dispatchEvent(e);
                      }}
                      className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
                    >
                      Edit Note <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKMARKS SUB-TAB */}
        {activeSubTab === 'bookmarks' && (
          <div className="space-y-4">
            {renderSectionHeader('Bookmarked Resources', myBookmarks.length)}

            {myBookmarks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">You have no bookmarked articles.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {myBookmarks.map(note => (
                  <div key={note.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-[8px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase mr-2">
                        {note.category}
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">{note.title}</strong>
                      <p className="text-[10px] text-slate-400 mt-1">Author: {note.authorName} • Views: {note.views}</p>
                    </div>
                    <button
                      onClick={() => setCurrentTab('library')}
                      className="text-xs text-nexora-blue dark:text-nexora-electric font-semibold hover:underline flex items-center"
                    >
                      Open Article <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
