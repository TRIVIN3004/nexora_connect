import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  BookOpen, 
  ThumbsUp, 
  Bookmark as BookmarkIcon, 
  Share2, 
  User, 
  Calendar, 
  Eye, 
  ChevronRight,
  PlusCircle,
  Folder,
  ArrowLeft
} from 'lucide-react';
import type { KnowledgeNote } from '../services/database';

export const KnowledgeLibrary: React.FC = () => {
  const { db, currentUser, triggerRefresh, setCurrentTab } = useApp();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(null);

  const categories = [
    'ALL',
    'Programming',
    'AI / ML',
    'Web Development',
    'Backend',
    'Frontend',
    'DevOps',
    'Cloud',
    'Cybersecurity',
    'Projects',
    'Career',
    'Interview Preparation',
    'Company Knowledge'
  ];

  // Retrieve notes (only published notes are visible to non-admins; admins can see drafts/pending in approval queue on admin panel)
  const notes = db.getKnowledgeNotes().filter(n => n.status === 'PUBLISHED');
  const bookmarks = db.getBookmarks();

  // Apply filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
                          note.content.toLowerCase().includes(search.toLowerCase()) ||
                          note.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === 'ALL' || note.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleReadNote = (note: KnowledgeNote) => {
    setSelectedNote(note);
    db.incrementNoteViews(note.id);
    triggerRefresh();
  };

  const handleHelpful = (noteId: string) => {
    db.voteHelpful(noteId, currentUser.email);
    triggerRefresh();
    // Update local reader state
    if (selectedNote && selectedNote.id === noteId) {
      const updated = db.getKnowledgeNotes().find(n => n.id === noteId);
      if (updated) setSelectedNote(updated);
    }
  };

  const handleBookmark = (noteId: string) => {
    db.toggleBookmark(currentUser.email, noteId);
    triggerRefresh();
    // Update local reader state
    if (selectedNote && selectedNote.id === noteId) {
      const updated = db.getKnowledgeNotes().find(n => n.id === noteId);
      if (updated) setSelectedNote(updated);
    }
  };

  const handleShare = (note: KnowledgeNote) => {
    navigator.clipboard.writeText(window.location.href);
    alert(`Secure share link copied to clipboard for note: "${note.title}"`);
  };

  // Find related notes in same category (excluding current)
  const getRelatedNotes = (note: KnowledgeNote) => {
    return notes
      .filter(n => n.category === note.category && n.id !== note.id)
      .slice(0, 2);
  };

  const isBookmarked = (noteId: string) => {
    return bookmarks.some(b => b.userId === currentUser.email && b.noteId === noteId);
  };

  // Estimated reading time
  const getReadingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Subheader */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Nexora Knowledge Library
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Browse engineering conventions, interview cheatersheets, cybersecurity baselines, and project tutorials.
          </p>
        </div>
        
        {/* Write Note Redirect Button */}
        <button
          onClick={() => {
            // Set nav tab to editor
            setCurrentTab('settings'); // or edit tab. Wait, we will map "library-editor"
            localStorage.setItem('nexora_editor_note_id', ''); // Create new note
            // Change tab to editor in app state
            // Let's create an editor nav route called "library-editor"
            const e = document.createEvent('Event');
            e.initEvent('setTab_editor', true, true);
            window.dispatchEvent(e);
          }}
          className="px-4 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all"
        >
          <PlusCircle size={16} className="mr-1.5" /> Share Note
        </button>
      </div>

      {/* ====================================================
          MAIN LIBRARY VIEW CONTROLS
          ==================================================== */}
      {!selectedNote ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Category Sidebar Navigation (1/4) */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-4 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center">
              <Folder className="w-3.5 h-3.5 mr-1 text-slate-400" /> wiki Categories
            </h3>
            
            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
              {categories.map(cat => {
                const isActive = activeCategory === cat;
                const count = cat === 'ALL' 
                  ? notes.length 
                  : notes.filter(n => n.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                      isActive 
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20' 
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-slate-400'
                    }`}
                  >
                    <span className="truncate">{cat === 'ALL' ? 'All Resources' : cat}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid Pane (3/4) */}
          <div className="md:col-span-3 space-y-4">
            
            {/* Search Input bar */}
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wiki articles by keywords, topics, syntax code..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Grid list cards */}
            {filteredNotes.length === 0 ? (
              <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center border border-slate-200 dark:border-dark-border premium-shadow">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">No notes found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Be the first to publish a document in the category: "{activeCategory}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700/80 transition-all duration-200"
                  >
                    <div>
                      {/* Category Badge */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                          {note.category}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <Eye size={12} /> <span>{note.views}</span>
                        </div>
                      </div>

                      <h3 
                        onClick={() => handleReadNote(note)}
                        className="font-heading font-bold text-sm md:text-base text-slate-900 dark:text-white cursor-pointer hover:text-nexora-blue leading-snug line-clamp-2"
                      >
                        {note.title}
                      </h3>
                      
                      <div className="flex items-center text-[10px] text-slate-400 mt-2 space-x-2">
                        <span>By {note.authorName}</span>
                        <span>•</span>
                        <span>{getReadingTime(note.content)}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                      {/* Action buttons */}
                      <button
                        onClick={() => handleReadNote(note)}
                        className="text-[11px] font-bold text-nexora-blue dark:text-nexora-electric hover:underline flex items-center"
                      >
                        Read Note <ChevronRight size={14} className="ml-0.5" />
                      </button>

                      <div className="flex items-center space-x-3 text-slate-400">
                        <button 
                          onClick={() => handleHelpful(note.id)}
                          className="flex items-center space-x-1 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          <ThumbsUp size={12} /> <span className="text-[10px]">{note.helpfulVotes}</span>
                        </button>
                        
                        <button
                          onClick={() => handleBookmark(note.id)}
                          className={`flex items-center ${isBookmarked(note.id) ? 'text-amber-500' : 'hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                          <BookmarkIcon size={12} className={isBookmarked(note.id) ? 'fill-amber-500' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      ) : (
        
        /* DETAIL DOCUMENT WRAPPER READING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in">
          
          {/* Main reader sheet (3/4) */}
          <div className="lg:col-span-3 bg-white dark:bg-dark-card p-6 md:p-8 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-6">
            
            {/* Back button and metadata header */}
            <div className="flex flex-col space-y-3 pb-5 border-b border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setSelectedNote(null)}
                className="flex items-center text-xs text-slate-500 hover:text-slate-800 font-semibold w-max"
              >
                <ArrowLeft size={14} className="mr-1" /> Back to library
              </button>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                  {selectedNote.category}
                </span>
                <span className="text-[10px] text-slate-400">{getReadingTime(selectedNote.content)}</span>
              </div>

              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight mt-1">
                {selectedNote.title}
              </h1>

              {/* Author and Date info */}
              <div className="flex items-center space-x-3.5 pt-2 text-xs text-slate-400">
                <span className="flex items-center"><User size={13} className="mr-1 text-slate-400" /> By {selectedNote.authorName}</span>
                <span>•</span>
                <span className="flex items-center"><Calendar size={13} className="mr-1 text-slate-400" /> Published: {new Date(selectedNote.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center"><Eye size={13} className="mr-1 text-slate-400" /> {selectedNote.views} views</span>
              </div>
            </div>

            {/* Document Rich Content Body */}
            {/* Split content by double carriage returns and mock format headings/code blocks */}
            <div className="prose-custom text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed max-w-none">
              {selectedNote.content.split('\n\n').map((para, i) => {
                if (para.startsWith('###')) {
                  return <h3 key={i} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{para.replace(/###/g, '').trim()}</h3>;
                }
                if (para.startsWith('##')) {
                  return <h2 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">{para.replace(/##/g, '').trim()}</h2>;
                }
                if (para.startsWith('#')) {
                  return <h1 key={i} className="text-xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3">{para.replace(/#/g, '').trim()}</h1>;
                }
                if (para.startsWith('```')) {
                  const cleanedCode = para.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
                  return (
                    <pre key={i} className="p-3 bg-slate-900 text-slate-100 rounded-md overflow-x-auto my-3 text-xs font-mono">
                      <code>{cleanedCode}</code>
                    </pre>
                  );
                }
                if (para.startsWith('* ') || para.startsWith('- ')) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 my-3">
                      {para.split('\n').map((item, idx) => (
                        <li key={idx}>{item.replace(/^[\*\-]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i} className="mb-4">{para}</p>;
              })}
            </div>

            {/* Tags row */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-widest">Document Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNote.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-350">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reader Sheet footer interactions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleHelpful(selectedNote.id)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center"
                >
                  <ThumbsUp size={14} className="mr-1.5 text-slate-500" /> Helpful ({selectedNote.helpfulVotes})
                </button>

                <button
                  onClick={() => handleBookmark(selectedNote.id)}
                  className={`px-4 py-2 border rounded-lg text-xs font-semibold flex items-center ${
                    isBookmarked(selectedNote.id)
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookmarkIcon size={14} className={`mr-1.5 ${isBookmarked(selectedNote.id) ? 'fill-amber-500 text-amber-550' : 'text-slate-500'}`} /> 
                  {isBookmarked(selectedNote.id) ? 'Bookmarked ✓' : 'Bookmark'}
                </button>
              </div>

              <button
                onClick={() => handleShare(selectedNote)}
                className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                title="Share Article Link"
              >
                <Share2 size={16} />
              </button>

            </div>

          </div>

          {/* Related articles sidebar (1/4) */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
              Related Articles
            </h3>
            
            <div className="space-y-3.5">
              {getRelatedNotes(selectedNote).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic p-2">No related articles found in same category.</p>
              ) : (
                getRelatedNotes(selectedNote).map(rel => (
                  <div 
                    key={rel.id}
                    onClick={() => handleReadNote(rel)}
                    className="p-3 border border-slate-100 dark:border-slate-850 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/10 cursor-pointer text-left group"
                  >
                    <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase block w-max mb-1.5">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-nexora-blue line-clamp-1">
                      {rel.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">By {rel.authorName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
