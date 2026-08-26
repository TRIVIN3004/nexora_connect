import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Clock, 
  User, 
  List, 
  Grid, 
  ExternalLink,
  Users,
  Edit2,
  X
} from 'lucide-react';
import type { Meeting } from '../services/database';

export const MeetingScheduler: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarInterval, setCalendarInterval] = useState<'month' | 'week' | 'day'>('month');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: '', // Comma separated list of emails
    date: '',
    startTime: '',
    endTime: '',
    platform: 'Google Meet' as Meeting['platform'],
    url: '',
    agenda: '',
    type: 'Team Meeting' as Meeting['type']
  });

  const meetings = db.getMeetings();

  // Filter user specific meetings (admins see all, mentors see their own, users/interns see their own)
  const userMeetings = meetings.filter(m => {
    if (currentUser.role === 'ADMIN') return true;
    return m.organizerId === currentUser.email || m.participants.includes(currentUser.email);
  });

  // Calendar Helpers for August 2026
  // August 2026 starts on Saturday (6), has 31 days.
  const daysInMonth = 31;
  const startDayOfWeek = 6; // Saturday is 6 (Sunday=0, Monday=1, ... Saturday=6)
  

  const handleDayClick = (day: number) => {
    const formattedDate = `2026-08-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const participantsArr = formData.participants.split(',').map(p => p.trim()).filter(Boolean);

    if (editMode && selectedMeeting) {
      const updated: Meeting = {
        ...selectedMeeting,
        ...formData,
        participants: participantsArr
      };
      db.updateMeeting(updated, currentUser.email, currentUser.name);
    } else {
      db.createMeeting(
        {
          ...formData,
          organizerId: currentUser.email,
          participants: participantsArr
        },
        currentUser.email,
        currentUser.name
      );
    }

    setCreateModalOpen(false);
    setEditMode(false);
    triggerRefresh();
  };

  const openEditForm = (meet: Meeting) => {
    setFormData({
      title: meet.title,
      description: meet.description,
      participants: meet.participants.join(', '),
      date: meet.date,
      startTime: meet.startTime,
      endTime: meet.endTime,
      platform: meet.platform,
      url: meet.url,
      agenda: meet.agenda,
      type: meet.type
    });
    setSelectedMeeting(meet);
    setEditMode(true);
    setCreateModalOpen(true);
  };

  // Month Grid calculation
  const renderMonthCells = () => {
    const cells = [];
    // Empty cells for padding
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="border border-slate-100 dark:border-slate-800/40 p-2 min-h-16 bg-slate-50/20 dark:bg-slate-900/5"></div>);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = `2026-08-${String(day).padStart(2, '0')}`;
      const dayMeetings = userMeetings.filter(m => m.date === cellDate);
      const isSelected = selectedDate === cellDate;
      const isToday = cellDate === '2026-08-25'; // Simulated "Today" matching local time.

      cells.push(
        <div 
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`border border-slate-100 dark:border-slate-800/40 p-1.5 min-h-[90px] cursor-pointer flex flex-col justify-between transition-all duration-150 ${
            isSelected 
              ? 'ring-2 ring-nexora-blue ring-inset bg-nexora-blue/5 dark:bg-nexora-blue/10' 
              : isToday
              ? 'bg-orange-500/5 dark:bg-orange-500/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-extrabold flex items-center justify-center w-5 h-5 rounded-full ${
              isToday 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {day}
            </span>
            {dayMeetings.length > 0 && (
              <span className="w-1.5 h-1.5 bg-nexora-blue rounded-full animate-pulse"></span>
            )}
          </div>
          <div className="space-y-1 mt-1 overflow-hidden">
            {dayMeetings.slice(0, 2).map(meet => (
              <div 
                key={meet.id} 
                className="text-[9px] px-1.5 py-0.5 rounded truncate font-bold bg-nexora-blue/15 text-nexora-electric border border-nexora-blue/20"
                title={meet.title}
              >
                {meet.startTime} {meet.title}
              </div>
            ))}
            {dayMeetings.length > 2 && (
              <div className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold pl-1.5">
                +{dayMeetings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    return cells;
  };

  // Week Grid calculation (representing the active week of Aug 24 - Aug 30)
  const renderWeekCells = () => {
    const weekdays = [
      { name: 'Mon 24', date: '2026-08-24' },
      { name: 'Tue 25', date: '2026-08-25' },
      { name: 'Wed 26', date: '2026-08-26' },
      { name: 'Thu 27', date: '2026-08-27' },
      { name: 'Fri 28', date: '2026-08-28' },
      { name: 'Sat 29', date: '2026-08-29' },
      { name: 'Sun 30', date: '2026-08-30' }
    ];

    return weekdays.map(day => {
      const dayMeetings = userMeetings.filter(m => m.date === day.date);
      const isSelected = selectedDate === day.date;
      const isToday = day.date === '2026-08-25';

      return (
        <div 
          key={day.date}
          onClick={() => setSelectedDate(day.date)}
          className={`border border-slate-200 dark:border-slate-800 p-3 min-h-[300px] flex flex-col justify-start space-y-3 cursor-pointer ${
            isSelected 
              ? 'bg-nexora-blue/5 dark:bg-nexora-blue/10 border-nexora-blue/60' 
              : isToday
              ? 'bg-orange-500/5 dark:bg-orange-500/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-850'
          }`}
        >
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{day.name}</span>
            {isToday && <span className="text-[9px] bg-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">Today</span>}
          </div>
          <div className="space-y-2.5 overflow-y-auto flex-1">
            {dayMeetings.length === 0 ? (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block italic pt-2">No meetings</span>
            ) : (
              dayMeetings.map(meet => (
                <div 
                  key={meet.id} 
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditForm(meet);
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800/80 rounded border-l-4 border-nexora-blue text-left hover:scale-[1.01] transition-transform duration-100"
                >
                  <p className="text-[10px] font-extrabold text-slate-900 dark:text-white truncate">{meet.title}</p>
                  <div className="flex items-center text-[8px] text-slate-400 mt-1">
                    <Clock size={8} className="mr-0.5" /> {meet.startTime}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    });
  };

  // Day hourly cells mapping
  const selectedDayMeetings = userMeetings.filter(m => m.date === selectedDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ====================================================
          SUB-HEADER ACTIONS
          ==================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Meeting Scheduler Room
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Book workspace review tags, schedule sync loops, and launch virtual workspace call bridges.
          </p>
        </div>
        
        {/* Toggle + New Button */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 flex">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center ${
                viewMode === 'calendar' ? 'bg-white dark:bg-dark-card shadow-xs text-nexora-blue dark:text-white' : 'text-slate-500'
              }`}
            >
              <Grid size={14} className="mr-1" /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center ${
                viewMode === 'list' ? 'bg-white dark:bg-dark-card shadow-xs text-nexora-blue dark:text-white' : 'text-slate-500'
              }`}
            >
              <List size={14} className="mr-1" /> List View
            </button>
          </div>

          <button
            onClick={() => {
              setEditMode(false);
              setFormData({
                title: '',
                description: '',
                participants: '',
                date: selectedDate,
                startTime: '',
                endTime: '',
                platform: 'Google Meet',
                url: '',
                agenda: '',
                type: 'Team Meeting'
              });
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold flex items-center shadow-md active:scale-95 transition-all duration-150"
          >
            <Plus size={16} className="mr-1.5" /> Book Sync
          </button>
        </div>
      </div>

      {/* ====================================================
          CALENDAR MODE CONTENT
          ==================================================== */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Grid Calendar Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            
            {/* Calendar Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100">
                  August 2026
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded">
                  Internal Syncs
                </span>
              </div>

              {/* Interval selector */}
              <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md flex">
                {(['month', 'week', 'day'] as const).map(interval => (
                  <button
                    key={interval}
                    onClick={() => setCalendarInterval(interval)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      calendarInterval === interval
                        ? 'bg-white dark:bg-dark-card text-nexora-blue dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            {/* MONTH VIEW GRID */}
            {calendarInterval === 'month' && (
              <div className="space-y-1">
                <div className="grid grid-cols-7 text-center font-bold text-slate-400 uppercase tracking-widest text-[9px] pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800/40">
                  {renderMonthCells()}
                </div>
              </div>
            )}

            {/* WEEK VIEW GRID */}
            {calendarInterval === 'week' && (
              <div className="grid grid-cols-7 gap-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                {renderWeekCells()}
              </div>
            )}

            {/* DAY VIEW GRID */}
            {calendarInterval === 'day' && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/40">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Timeline for {selectedDate}</span>
                  {selectedDate === '2026-08-25' && <span className="text-[9px] bg-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">Today</span>}
                </div>
                
                <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                  {selectedDayMeetings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 italic">No meetings scheduled for this date.</div>
                  ) : (
                    selectedDayMeetings.map(meet => (
                      <div 
                        key={meet.id} 
                        onClick={() => openEditForm(meet)}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900/30 rounded-lg border-l-4 border-nexora-blue flex justify-between items-center group cursor-pointer hover:border-nexora-electric"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-nexora-blue dark:text-nexora-electric uppercase tracking-wider block">{meet.type}</span>
                          <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{meet.title}</h3>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                            <span className="flex items-center"><Clock size={10} className="mr-0.5" /> {meet.startTime} - {meet.endTime}</span>
                            <span>•</span>
                            <span className="flex items-center"><Users size={10} className="mr-0.5" /> {meet.participants.length} invitees</span>
                          </div>
                        </div>
                        <a 
                          href={meet.url} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white rounded-lg text-xs"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Schedule List Widget */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
                Selected Date Syncs
              </h2>
              <div className="p-3 border border-slate-100 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-950/20 mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{selectedDate}</span>
                <span className="text-[10px] font-bold text-nexora-blue bg-nexora-blue/10 px-2 py-0.5 rounded">
                  {selectedDayMeetings.length} Meetings
                </span>
              </div>

              <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
                {selectedDayMeetings.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center p-4">No meetings scheduled.</p>
                ) : (
                  selectedDayMeetings.map(meet => (
                    <div 
                      key={meet.id} 
                      onClick={() => openEditForm(meet)}
                      className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-200 cursor-pointer"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{meet.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center">
                        <Clock size={10} className="mr-1" /> {meet.startTime}
                      </p>
                      <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/40">
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase px-1.5 py-0.5 rounded">
                          {meet.platform}
                        </span>
                        <a 
                          href={meet.url} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[9px] font-bold text-green-600 dark:text-green-400 hover:underline flex items-center"
                        >
                          Join <ExternalLink size={10} className="ml-0.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4">
              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Timezone Settings</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Asia/Kolkata (IST - GMT+5:30)</span>
            </div>
          </div>

        </div>
      ) : (
        
        /* LIST VIEW MODE */
        <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Scheduled Sync Calendars ({userMeetings.length})</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
            {userMeetings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-500">No scheduled meetings.</div>
            ) : (
              userMeetings.map(meet => (
                <div key={meet.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-nexora-blue/15 text-nexora-blue dark:text-nexora-electric rounded-xl font-bold text-center min-w-16">
                      <span className="block text-xs uppercase">{new Date(meet.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                      <span className="block text-lg mt-[-2px]">{new Date(meet.date).toLocaleDateString(undefined, { day: 'numeric' })}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase">
                          {meet.type}
                        </span>
                        <span className="text-[10px] text-slate-400">{meet.platform}</span>
                      </div>
                      <h3 
                        onClick={() => openEditForm(meet)}
                        className="text-sm md:text-base font-bold text-slate-900 dark:text-white cursor-pointer hover:underline"
                      >
                        {meet.title}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{meet.description}</p>
                      
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-2">
                        <span className="flex items-center"><Clock size={10} className="mr-0.5" /> {meet.startTime} - {meet.endTime}</span>
                        <span>•</span>
                        <span className="flex items-center"><User size={10} className="mr-0.5" /> Organizer: {meet.organizerId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    {(currentUser.role === 'ADMIN' || meet.organizerId === currentUser.email) && (
                      <button
                        onClick={() => openEditForm(meet)}
                        className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                        title="Edit Meeting"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    <a
                      href={meet.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center"
                    >
                      Join Meeting <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          MEETING DETAIL & EDIT MODAL
          ==================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/30">
              <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                {editMode ? 'Edit Scheduled Sync' : 'Schedule New Call Session'}
              </h2>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700/80 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Sprint Backlog Grooming"
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Summarize the meeting topic..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Date & times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Date</label>
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
                    onChange={(e) => setFormData({...formData, platform: e.target.value as Meeting['platform']})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="MS Teams">MS Teams</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Meeting Room URL</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://zoom.us/j/123456789"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Participants & Meeting Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Meeting Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as Meeting['type']})}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="Team Meeting">Team Meeting</option>
                    <option value="Project Meeting">Project Meeting</option>
                    <option value="Mentor Meeting">Mentor Meeting</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Training">Training</option>
                    <option value="Review">Review</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Participants (comma separated emails)</label>
                  <input
                    type="text"
                    required
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                    placeholder="intern@nexora.com, employee@nexora.com"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Agenda */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Meeting Agenda</label>
                <textarea
                  rows={3}
                  value={formData.agenda}
                  onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  placeholder="Outline the meeting itinerary..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded text-xs font-semibold shadow"
                >
                  {editMode ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
