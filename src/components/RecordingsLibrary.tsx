import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Video, 
  Download, 
  Play, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  X,
  Sparkles,
  Trash2
} from 'lucide-react';
import type { Recording } from '../services/database';
import { AIService } from '../services/ai';

export const RecordingsLibrary: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [recordingToDelete, setRecordingToDelete] = useState<Recording | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // AI Meeting summary states
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ summary: string; actionItems: string[]; keyTopics: string[] } | null>(null);

  // Forms
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    duration: '',
    organizer: '',
    participants: '',
    recordingUrl: 'https://demo.nexora.com/recordings/demo.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    description: '',
    topics: '',
    tags: ''
  });

  const recordings = db.getRecordings();

  // Extract all tags from recordings
  const allTags = ['ALL', ...Array.from(new Set(recordings.flatMap(r => r.tags)))];

  // Apply filters
  const filteredRecordings = recordings.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(search.toLowerCase()) ||
                          rec.description.toLowerCase().includes(search.toLowerCase()) ||
                          rec.topics.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = selectedTag === 'ALL' || rec.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleUploadRecording = (e: React.FormEvent) => {
    e.preventDefault();
    const topicsArr = formData.topics.split(',').map(t => t.trim()).filter(Boolean);
    const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const participantsArr = formData.participants.split(',').map(p => p.trim()).filter(Boolean);

    db.createRecording(
      {
        ...formData,
        topics: topicsArr,
        tags: tagsArr,
        participants: participantsArr
      },
      currentUser.email,
      currentUser.name
    );

    setUploadModalOpen(false);
    triggerRefresh();
  };

  const handleWatchRecording = (rec: Recording) => {
    setActiveRecording(rec);
    setAiSummary(null); // Reset AI summary
  };

  // Triggers simulated AI summary extractor
  const handleGenerateSummary = async (rec: Recording) => {
    setAiSummaryLoading(true);
    try {
      const summary = await AIService.generateMeetingSummary(
        `Meeting transcript for "${rec.title}" dated ${rec.date}. Organizer ${rec.organizer}. Topics: ${rec.topics.join(', ')}`
      );
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    if (!recordingToDelete) return;
    const title = recordingToDelete.title;
    db.deleteRecording(recordingToDelete.id, currentUser.email, currentUser.name);

    if (activeRecording?.id === recordingToDelete.id) {
      setActiveRecording(null);
    }

    setRecordingToDelete(null);
    setDeleteSuccessMsg(`Recording "${title}" has been deleted.`);
    triggerRefresh();

    setTimeout(() => {
      setDeleteSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">

      {/* Delete Success Alert Banner */}
      {deleteSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between animate-slide-up">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-emerald-500 text-white rounded-full">
              <Sparkles size={13} />
            </div>
            <span>{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}
      
      {/* ====================================================
          SUBHEADER & ACTIONS
          ==================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Recorded Sync Sessions
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Access previous technical masterclasses, project sync handovers, and training logs.
          </p>
        </div>
        
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => {
              setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                duration: '',
                organizer: currentUser.name,
                participants: '',
                recordingUrl: 'https://demo.nexora.com/recordings/demo.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
                description: '',
                topics: '',
                tags: ''
              });
              setUploadModalOpen(true);
            }}
            className="px-4 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150"
          >
            <Plus size={16} className="mr-1.5" /> Upload Recording
          </button>
        )}
      </div>

      {/* ====================================================
          SEARCH & TAG FILTERS
          ==================================================== */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md w-full">
          <Search size={16} className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recordings by topic, title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-dark-bg/60 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Tags horizontal list */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto max-w-full pb-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                selectedTag === tag
                  ? 'bg-nexora-blue text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-350'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* ====================================================
          RECORDINGS GRID
          ==================================================== */}
      {filteredRecordings.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center border border-slate-200 dark:border-dark-border premium-shadow">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-200">No recordings found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Try adjusting your search criteria or tags filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map(rec => (
            <div
              key={rec.id}
              className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-255 hover:scale-[1.01]"
            >
              {/* Thumbnail Container */}
              <div className="h-44 relative group overflow-hidden">
                <img src={rec.thumbnail} alt={rec.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => handleWatchRecording(rec)}
                    className="p-3 bg-nexora-blue text-white rounded-full scale-90 group-hover:scale-100 transition-transform duration-200"
                  >
                    <Play size={20} fill="currentColor" />
                  </button>
                </div>
                
                {/* Duration Badge */}
                <span className="absolute bottom-3 right-3 text-[9px] bg-slate-950/80 backdrop-blur-sm text-white px-2 py-0.5 rounded font-bold">
                  {rec.duration}
                </span>

                {/* Date Badge */}
                <span className="absolute top-3 left-3 text-[8px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded uppercase font-semibold">
                  {rec.date}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 
                    onClick={() => handleWatchRecording(rec)}
                    className="font-heading font-bold text-sm md:text-base text-slate-900 dark:text-white cursor-pointer hover:text-nexora-blue dark:hover:text-nexora-electric line-clamp-2"
                  >
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    Organizer: {rec.organizer}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleWatchRecording(rec)}
                      className="px-3 py-1.5 bg-nexora-blue/10 hover:bg-nexora-blue text-nexora-blue hover:text-white rounded-lg text-xs font-semibold transition-colors duration-155 cursor-pointer"
                    >
                      Watch
                    </button>
                    
                    {/* Simulated Download button */}
                    <button
                      onClick={() => alert(`Initiating secure corporate download for: ${rec.title}`)}
                      className="p-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg cursor-pointer transition-colors"
                      title="Download Secure Copy"
                    >
                      <Download size={14} />
                    </button>

                    {/* Delete Recording Button (Admin or Organizer) */}
                    {currentUser.role === 'ADMIN' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecordingToDelete(rec);
                        }}
                        className="p-1.5 border border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete this recording"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ====================================================
          WATCH RECORDING & AI TRANSCRIPT WRAPPER
          ==================================================== */}
      {activeRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] animate-slide-up">
            
            {/* Left Column: Simulated Video Player & Metadata */}
            <div className="flex-1 flex flex-col justify-between border-r border-slate-200 dark:border-dark-border bg-slate-950 text-white p-5">
              
              {/* Media Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs text-nexora-electric uppercase font-bold flex items-center">
                  <Video size={14} className="mr-1.5" /> SECURE MEDIA BRIDGE
                </span>
                <span className="text-[10px] text-slate-400">ID: {activeRecording.id}</span>
              </div>

              {/* Video Mock Frame */}
              <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden my-4 border border-white/5 flex flex-col items-center justify-center">
                <img src={activeRecording.thumbnail} alt="video thumb" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs" />
                <div className="relative z-10 text-center space-y-3.5 p-6">
                  <div className="w-16 h-16 bg-nexora-blue hover:bg-nexora-blue/90 hover:scale-105 rounded-full flex items-center justify-center cursor-pointer shadow-lg mx-auto transition-all">
                    <Play size={26} fill="currentColor" className="ml-1" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{activeRecording.title}</p>
                    <p className="text-xs text-slate-400 mt-1">Simulating player connection to external server. Duration: {activeRecording.duration}</p>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold">{activeRecording.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{activeRecording.description}</p>
              </div>

            </div>

            {/* Right Column: AI Summary & Details */}
            <div className="w-full md:w-96 flex flex-col justify-between bg-white dark:bg-dark-card p-5 overflow-y-auto text-slate-800 dark:text-slate-200">
              
              <div className="space-y-5">
                
                {/* Header Close */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-heading font-extrabold text-xs uppercase tracking-widest text-slate-400">
                    Session Analytics
                  </span>
                  <button 
                    onClick={() => setActiveRecording(null)}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Organizer details */}
                <div className="space-y-1 text-xs">
                  <p className="flex items-center text-slate-400"><User size={12} className="mr-1.5" /> Organizer: <strong className="text-slate-700 dark:text-slate-200 ml-1">{activeRecording.organizer}</strong></p>
                  <p className="flex items-center text-slate-400"><Calendar size={12} className="mr-1.5" /> Date: <span className="text-slate-700 dark:text-slate-200 ml-1">{activeRecording.date}</span></p>
                  <p className="flex items-center text-slate-400"><Clock size={12} className="mr-1.5" /> Duration: <span className="text-slate-700 dark:text-slate-200 ml-1">{activeRecording.duration}</span></p>
                </div>

                {/* Topics covered */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Topics Highlighted</span>
                  <div className="flex flex-wrap gap-1">
                    {activeRecording.topics.map(t => (
                      <span key={t} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Summary Widget */}
                <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric uppercase tracking-widest flex items-center">
                      <Sparkles size={12} className="mr-1" /> AI meeting Minutes
                    </span>
                    {!aiSummary && !aiSummaryLoading && (
                      <button
                        onClick={() => handleGenerateSummary(activeRecording)}
                        className="text-[9px] bg-nexora-blue text-white px-2 py-1 rounded font-bold uppercase active:scale-95"
                      >
                        Extract minutes
                      </button>
                    )}
                  </div>

                  {aiSummaryLoading && (
                    <div className="text-center py-6">
                      <span className="w-5 h-5 border-2 border-nexora-blue border-t-transparent rounded-full animate-spin inline-block mb-1.5"></span>
                      <p className="text-[10px] text-slate-400 font-medium">Analyzing audio tracks transcript...</p>
                    </div>
                  )}

                  {aiSummary && (
                    <div className="space-y-3 animate-fade-in text-[11px] leading-relaxed">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Summary</span>
                        <p className="text-slate-500 dark:text-slate-400">{aiSummary.summary}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Action Items</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 text-slate-500 dark:text-slate-400">
                          {aiSummary.actionItems.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex space-x-2">
                <button
                  onClick={() => alert(`Initiating secure download...`)}
                  className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Download size={14} className="mr-1.5" /> Download (.mp4)
                </button>

                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => setRecordingToDelete(activeRecording)}
                    className="py-2 px-3 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-semibold rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    title="Delete this recording"
                  >
                    <Trash2 size={14} className="mr-1.5" /> Delete
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          UPLOAD RECORDING FORM MODAL
          ==================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                Upload Secures Meeting Recording
              </h2>
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700/80 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadRecording} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Recording Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Microservices event sourcing deepdive"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Summary Description</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Summarize the video contents..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Date & times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Recorded Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g. 1:15:30"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Organizer</label>
                  <input
                    type="text"
                    required
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    placeholder="Sarah Connor"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Cloud Storage URL & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Storage Video URL</label>
                  <input
                    type="url"
                    required
                    value={formData.recordingUrl}
                    onChange={(e) => setFormData({...formData, recordingUrl: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Cover Thumbnail URL</label>
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Participants (comma separated)</label>
                <input
                  type="text"
                  value={formData.participants}
                  onChange={(e) => setFormData({...formData, participants: e.target.value})}
                  placeholder="Devs, Interns"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>

              {/* Topics & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Topics (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={formData.topics}
                    onChange={(e) => setFormData({...formData, topics: e.target.value})}
                    placeholder="e.g. Postgres, Indexing"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="e.g. Backend, Devops"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded text-xs font-semibold shadow"
                >
                  Confirm Upload
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          DELETE RECORDING CONFIRMATION MODAL
          ==================================================== */}
      {recordingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
                  Delete Recording
                </h3>
                <p className="text-xs text-slate-400">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-white">"{recordingToDelete.title}"</strong> ({recordingToDelete.duration}) from the recording library and cloud storage?
            </p>

            <div className="flex justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRecordingToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 size={13} />
                <span>Confirm &amp; Delete Recording</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
