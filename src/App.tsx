import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { WebinarModule } from './components/WebinarModule';
import { MeetingScheduler } from './components/MeetingScheduler';
import { RecordingsLibrary } from './components/RecordingsLibrary';
import { FeedbackSystem } from './components/FeedbackSystem';
import { TicketingSystem } from './components/TicketingSystem';
import { KnowledgeLibrary } from './components/KnowledgeLibrary';
import { KnowledgeNoteEditor } from './components/KnowledgeNoteEditor';
import { MyActivity } from './components/MyActivity';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel';
import { StressReliefGames } from './components/StressReliefGames';
import { RegisterProfile } from './components/RegisterProfile';
import { Login } from './components/Login';
import { 
  Search, 
  ArrowRight, 
  Calendar, 
  Video, 
  BookOpen, 
  Ticket, 
  FolderSync
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab, searchQuery, setSearchQuery, db, currentUser } = useApp();
  const [authView, setAuthView] = React.useState<'login' | 'register'>('login');

  // Listen to custom tab event from Knowledge Library redirects
  useEffect(() => {
    const handleSetTabEditor = () => {
      setCurrentTab('editor');
    };
    window.addEventListener('setTab_editor', handleSetTabEditor);
    return () => window.removeEventListener('setTab_editor', handleSetTabEditor);
  }, [setCurrentTab]);

  // Block dashboard and show login/register view if guest
  if (!currentUser || currentUser.email === 'guest@nexoratechs.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 text-slate-800 flex items-center justify-center p-4 selection:bg-nexora-blue/20">
        {authView === 'login' ? (
          <Login onToggleView={() => setAuthView('register')} />
        ) : (
          <div className="w-full max-w-xl">
            <RegisterProfile />
            <div className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => setAuthView('login')}
                className="text-nexora-blue hover:underline font-bold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Execute Global Search
  const performGlobalSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const webinarsRes = db.getWebinars().filter(w => 
      w.title.toLowerCase().includes(query) || 
      w.description.toLowerCase().includes(query) ||
      w.speaker.toLowerCase().includes(query)
    );

    const meetingsRes = db.getMeetings().filter(m => {
      const isVisible = currentUser.role === 'ADMIN' || m.organizerId === currentUser.email || m.participants.includes(currentUser.email);
      return isVisible && (m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query));
    });

    const recordingsRes = db.getRecordings().filter(r => 
      r.title.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query) ||
      r.topics.some(t => t.toLowerCase().includes(query))
    );

    const notesRes = db.getKnowledgeNotes().filter(n => 
      n.status === 'PUBLISHED' && 
      (n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
    );

    const ticketsRes = db.getTickets().filter(t => {
      const isVisible = currentUser.role === 'ADMIN' || t.createdById === currentUser.email;
      return isVisible && (t.id.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query) || t.description.toLowerCase().includes(query));
    });

    return {
      webinars: webinarsRes,
      meetings: meetingsRes,
      recordings: recordingsRes,
      notes: notesRes,
      tickets: ticketsRes
    };
  };

  const searchResults = performGlobalSearch();

  // Render tab component
  const renderTabContent = () => {
    // If a search query is active, display Global Search Results overview
    if (searchResults) {
      const totalResults = searchResults.webinars.length + 
                           searchResults.meetings.length + 
                           searchResults.recordings.length + 
                           searchResults.notes.length + 
                           searchResults.tickets.length;

      return (
        <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center">
              <Search className="w-5 h-5 mr-2 text-nexora-blue" /> Global Search Results
            </h1>
            <p className="text-xs text-slate-450 mt-1">
              Search query: "<span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>" returned {totalResults} matches.
            </p>
          </div>

          {totalResults === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl">
              <FolderSync className="w-10 h-10 text-slate-350 mx-auto mb-2" />
              <p className="text-sm font-semibold">No results found</p>
              <p className="text-xs text-slate-400">Try searching for keywords like "Node.js", "React", "Docker", "Figma", or ticket ID "NX-".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Summary Stats Card */}
              <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 border-b pb-2 border-slate-100 dark:border-slate-850">
                  Matches Summary
                </h3>
                <div className="space-y-3 font-semibold text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex justify-between">
                    <span>Knowledge Library:</span>
                    <span>{searchResults.notes.length} results</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recordings:</span>
                    <span>{searchResults.recordings.length} results</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Webinars:</span>
                    <span>{searchResults.webinars.length} results</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meetings Calendar:</span>
                    <span>{searchResults.meetings.length} results</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support Tickets:</span>
                    <span>{searchResults.tickets.length} results</span>
                  </div>
                </div>
              </div>

              {/* Detailed results list */}
              <div className="md:col-span-2 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                
                {/* 1. Knowledge notes */}
                {searchResults.notes.length > 0 && (
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <BookOpen size={12} className="mr-1.5 text-purple-500" /> Knowledge Library Notes ({searchResults.notes.length})
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-2">
                      {searchResults.notes.map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentTab('library');
                          }}
                          className="pt-2 flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue">{note.title}</h4>
                            <p className="text-[9px] text-slate-400">By {note.authorName} in {note.category}</p>
                          </div>
                          <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric hidden group-hover:inline-flex items-center">
                            Open <ArrowRight size={10} className="ml-1" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Recordings */}
                {searchResults.recordings.length > 0 && (
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Video size={12} className="mr-1.5 text-orange-500" /> Synced Recordings ({searchResults.recordings.length})
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-2">
                      {searchResults.recordings.map(rec => (
                        <div 
                          key={rec.id} 
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentTab('recordings');
                          }}
                          className="pt-2 flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue">{rec.title}</h4>
                            <p className="text-[9px] text-slate-400">Date: {rec.date} • {rec.duration}</p>
                          </div>
                          <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric hidden group-hover:inline-flex items-center">
                            Watch <ArrowRight size={10} className="ml-1" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Webinars */}
                {searchResults.webinars.length > 0 && (
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Calendar size={12} className="mr-1.5 text-blue-500" /> Learning Webinars ({searchResults.webinars.length})
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-2">
                      {searchResults.webinars.map(web => (
                        <div 
                          key={web.id} 
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentTab('webinars');
                          }}
                          className="pt-2 flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue">{web.title}</h4>
                            <p className="text-[9px] text-slate-400">Date: {web.date} at {web.startTime} ({web.status})</p>
                          </div>
                          <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric hidden group-hover:inline-flex items-center">
                            Open <ArrowRight size={10} className="ml-1" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Support Tickets */}
                {searchResults.tickets.length > 0 && (
                  <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Ticket size={12} className="mr-1.5 text-red-500" /> Support Desk Tickets ({searchResults.tickets.length})
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-2">
                      {searchResults.tickets.map(tick => (
                        <div 
                          key={tick.id} 
                          onClick={() => {
                            setSearchQuery('');
                            setCurrentTab('tickets');
                          }}
                          className="pt-2 flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue">{tick.id}: {tick.subject}</h4>
                            <p className="text-[9px] text-slate-400">Priority: {tick.priority} • Status: {tick.status}</p>
                          </div>
                          <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric hidden group-hover:inline-flex items-center">
                            Open <ArrowRight size={10} className="ml-1" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      );
    }

    // Default tab routing
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'webinars':
        return <WebinarModule />;
      case 'meetings':
        return <MeetingScheduler />;
      case 'recordings':
        return <RecordingsLibrary />;
      case 'library':
        return <KnowledgeLibrary />;
      case 'tickets':
        return <TicketingSystem />;
      case 'feedback':
        return <FeedbackSystem />;
      case 'games':
        return <StressReliefGames />;
      case 'activity':
        return <MyActivity />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return currentUser.role === 'ADMIN' ? <AdminPanel /> : <Dashboard />;
      case 'editor':
        return <KnowledgeNoteEditor />;
      case 'register':
        return <RegisterProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderTabContent()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
