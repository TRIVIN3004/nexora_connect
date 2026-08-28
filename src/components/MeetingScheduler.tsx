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
  X, 
  Mail, 
  Send, 
  BellRing,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PersonSelector } from './PersonSelector';
import { InstantMeetingModal } from './InstantMeetingModal';
import type { Meeting } from '../services/database';

export const MeetingScheduler: React.FC = () => {
  const { db, dispatcher, currentUser, triggerRefresh } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarInterval, setCalendarInterval] = useState<'month' | 'week' | 'day'>('month');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [instantMeetingModalOpen, setInstantMeetingModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Scheduled Meeting Person Selection
  const [targetMode, setTargetMode] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [formStatus, setFormStatus] = useState<string | null>(null);

  // Meeting Reminder Broadcast Modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [meetingToRemind, setMeetingToRemind] = useState<Meeting | null>(null);
  const [reminderTargetMode, setReminderTargetMode] = useState<'ATTENDEES' | 'ALL' | 'SPECIFIC'>('ATTENDEES');
  const [reminderSelectedEmails, setReminderSelectedEmails] = useState<string[]>([]);
  const [reminderNote, setReminderNote] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: '',
    date: '',
    startTime: '',
    endTime: '',
    platform: 'Google Meet' as Meeting['platform'],
    url: '',
    agenda: '',
    type: 'Team Meeting' as Meeting['type']
  });

  const meetings = db.getMeetings();
  const allUsers = db.getUsers();

  // Filter user specific meetings (admins see all, mentors see their own, users/interns see their own)
  const userMeetings = meetings.filter(m => {
    if (currentUser.role === 'ADMIN') return true;
    return m.organizerId === currentUser.email || m.participants.includes('all') || m.participants.includes(currentUser.email);
  });

  // Calendar Helpers for August 2026
  const daysInMonth = 31;
  const startDayOfWeek = 6; // Saturday is 6 (Sunday=0, Monday=1, ... Saturday=6)

  const handleDayClick = (day: number) => {
    const formattedDate = `2026-08-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const participantsArr = targetMode === 'ALL' ? ['all'] : selectedEmails;

    if (targetMode === 'SPECIFIC' && participantsArr.length === 0) {
      setFormStatus('❌ Please select at least one person or choose All Company Members.');
      return;
    }

    if (editMode && selectedMeeting) {
      const updated: Meeting = {
        ...selectedMeeting,
        ...formData,
        participants: participantsArr
      };
      db.updateMeeting(updated, currentUser.email, currentUser.name);

      if (sendInviteEmail) {
        dispatcher.dispatchMeetingInvitation(updated.id, participantsArr);
      }
    } else {
      const newMeeting = db.createMeeting(
        {
          ...formData,
          organizerId: currentUser.email,
          participants: participantsArr
        },
        currentUser.email,
        currentUser.name
      );

      if (sendInviteEmail) {
        dispatcher.dispatchMeetingInvitation(newMeeting.id, participantsArr);
      }
    }

    setCreateModalOpen(false);
    setEditMode(false);
    triggerRefresh();
  };

  const openEditForm = (meet: Meeting) => {
    const isAll = meet.participants.includes('all') || meet.participants.length === 0;
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
    setTargetMode(isAll ? 'ALL' : 'SPECIFIC');
    setSelectedEmails(isAll ? [] : meet.participants);
    setSendInviteEmail(false);
    setFormStatus(null);
    setSelectedMeeting(meet);
    setEditMode(true);
    setCreateModalOpen(true);
  };

  const openReminderModal = (meet: Meeting) => {
    setMeetingToRemind(meet);
    setReminderNote('');
    setReminderStatus(null);
    setSendingReminder(false);
    setReminderTargetMode('ATTENDEES');
    setReminderSelectedEmails(meet.participants.includes('all') ? [] : meet.participants);
    setReminderModalOpen(true);
  };

  const handleSendReminderBroadcast = async () => {
    if (!meetingToRemind) return;
    setSendingReminder(true);
    setReminderStatus(null);
    try {
      let targetEmails: string[] = [];
      if (reminderTargetMode === 'ATTENDEES') {
        targetEmails = meetingToRemind.participants;
      } else if (reminderTargetMode === 'ALL') {
        targetEmails = ['all'];
      } else {
        targetEmails = reminderSelectedEmails;
      }

      if (reminderTargetMode === 'SPECIFIC' && targetEmails.length === 0) {
        setSendingReminder(false);
        setReminderStatus('❌ Please select at least one recipient.');
        return;
      }

      dispatcher.dispatchMeetingReminderToTarget(
        meetingToRemind.id,
        targetEmails,
        reminderNote || undefined,
        currentUser.name
      );

      const countLabel = targetEmails.includes('all') || targetEmails.length === 0
        ? `all ${allUsers.length} employees`
        : `${targetEmails.length} recipient(s)`;

      setReminderStatus(`✅ Meeting reminder email successfully broadcasted to ${countLabel}!`);
      setTimeout(() => {
        setSendingReminder(false);
        triggerRefresh();
      }, 900);
    } catch (err: any) {
      setSendingReminder(false);
      setReminderStatus(`❌ Error sending reminder: ${err.message || 'Failed to dispatch'}`);
    }
  };

  // Month Grid calculation
  const renderMonthCells = () => {
    const cells = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="border border-slate-100 dark:border-slate-800/40 p-2 min-h-16 bg-slate-50/20 dark:bg-slate-900/5"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = `2026-08-${String(day).padStart(2, '0')}`;
      const dayMeetings = userMeetings.filter(m => m.date === cellDate);
      const isSelected = selectedDate === cellDate;
      const isToday = cellDate === '2026-08-27';

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

  // Week Grid calculation
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
      const isToday = day.date === '2026-08-27';

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
            Book workspace review tags, broadcast reminder emails to attendees, and launch virtual workspace call bridges.
          </p>
        </div>
        
        {/* Toggle + Instant Meeting + Schedule Button */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap gap-y-2">
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

          {/* Instant Meeting Action Button */}
          <button
            onClick={() => setInstantMeetingModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold flex items-center shadow-md shadow-amber-500/20 active:scale-95 transition-all duration-150 cursor-pointer"
            title="Start an instant live conference bridge now and invite selected attendees"
          >
            <Zap size={14} className="mr-1.5 fill-current animate-pulse text-yellow-200" /> Instant Meeting
          </button>

          {/* Book Scheduled Sync */}
          <button
            onClick={() => {
              setEditMode(false);
              const randomCode = Math.random().toString(36).substring(2, 5) + '-' + 
                                 Math.random().toString(36).substring(2, 6) + '-' + 
                                 Math.random().toString(36).substring(2, 5);
              setFormData({
                title: '',
                description: '',
                participants: 'all',
                date: selectedDate,
                startTime: '10:00',
                endTime: '11:00',
                platform: 'Google Meet',
                url: `https://meet.google.com/${randomCode}`,
                agenda: '',
                type: 'Team Meeting'
              });
              setTargetMode('ALL');
              setSelectedEmails([]);
              setSendInviteEmail(true);
              setFormStatus(null);
              setCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-bold flex items-center shadow-md active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Plus size={15} className="mr-1" /> Schedule Meeting
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
                  {selectedDate === '2026-08-27' && <span className="text-[9px] bg-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">Today</span>}
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
                            <span className="flex items-center"><Users size={10} className="mr-0.5" /> {meet.participants.includes('all') ? 'All Users' : `${meet.participants.length} invitees`}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          {(currentUser.role === 'ADMIN' || meet.organizerId === currentUser.email) && (
                            <button
                              onClick={() => openReminderModal(meet)}
                              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg text-xs font-semibold flex items-center transition-colors"
                              title="Send Reminder Email to All Invitees"
                            >
                              <Mail size={13} className="mr-1" /> Send Reminder
                            </button>
                          )}
                          <a 
                            href={meet.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white rounded-lg text-xs"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
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
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          {(currentUser.role === 'ADMIN' || meet.organizerId === currentUser.email) && (
                            <button
                              onClick={() => openReminderModal(meet)}
                              className="text-[9px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center"
                              title="Send Reminder"
                            >
                              <Mail size={10} className="mr-0.5" /> Reminder
                            </button>
                          )}
                          <a 
                            href={meet.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[9px] font-bold text-green-600 dark:text-green-400 hover:underline flex items-center"
                          >
                            Join <ExternalLink size={10} className="ml-0.5" />
                          </a>
                        </div>
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
                        <span>•</span>
                        <span className="flex items-center"><Users size={10} className="mr-0.5" /> {meet.participants.includes('all') ? 'All 36 Employees' : `${meet.participants.length} invitees`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
                    {(currentUser.role === 'ADMIN' || meet.organizerId === currentUser.email) && (
                      <>
                        <button
                          onClick={() => openReminderModal(meet)}
                          className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white rounded-lg text-xs font-semibold flex items-center transition-colors"
                          title="Broadcast Reminder Email to All"
                        >
                          <Mail size={13} className="mr-1.5" /> Send Reminder to All
                        </button>
                        <button
                          onClick={() => openEditForm(meet)}
                          className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          title="Edit Meeting"
                        >
                          <Edit2 size={12} />
                        </button>
                      </>
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
          MEETING REMINDER EMAIL BROADCAST MODAL
          ==================================================== */}
      {reminderModalOpen && meetingToRemind && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-slide-up max-h-[85vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:bg-slate-900/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-md">
                  <BellRing size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                    Send Meeting Reminder Email
                  </h2>
                  <p className="text-[11px] text-slate-500">Dispatch instant meeting notification & direct join link</p>
                </div>
              </div>
              <button 
                onClick={() => setReminderModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Meeting Summary Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                    {meetingToRemind.platform}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    📅 {meetingToRemind.date} at {meetingToRemind.startTime}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {meetingToRemind.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Meeting URL: <span className="text-nexora-blue dark:text-sky-400 font-mono text-[11px]">{meetingToRemind.url}</span>
                </div>
              </div>

              {/* Recipient Audience Selection Modes */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Choose Reminder Target Audience <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setReminderTargetMode('ATTENDEES')}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold cursor-pointer ${
                      reminderTargetMode === 'ATTENDEES'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Meeting Attendees</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-extrabold">
                        {meetingToRemind.participants.includes('all') ? allUsers.length : meetingToRemind.participants.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Invited roster</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderTargetMode('ALL')}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold cursor-pointer ${
                      reminderTargetMode === 'ALL'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>All Employees</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-extrabold">
                        {allUsers.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Company-wide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderTargetMode('SPECIFIC')}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold cursor-pointer ${
                      reminderTargetMode === 'SPECIFIC'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Selected Persons</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-extrabold">
                        {reminderSelectedEmails.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Pick individuals</span>
                  </button>
                </div>

                {/* If Specific Person Selection */}
                {reminderTargetMode === 'SPECIFIC' && (
                  <PersonSelector
                    selectedEmails={reminderSelectedEmails}
                    onChange={setReminderSelectedEmails}
                    targetMode="SPECIFIC"
                    onTargetModeChange={() => {}}
                    themeColor="amber"
                    allOptionLabel="All Employees"
                    specificOptionLabel="Selected Persons"
                    maxListHeight="max-h-36"
                  />
                )}
              </div>

              {/* Optional Custom Note */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  Optional Note / Instructions to Include in Email
                </label>
                <textarea
                  rows={2}
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="e.g. Please join 5 minutes early with your camera enabled and audio ready."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Status feedback */}
              {reminderStatus && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                  reminderStatus.startsWith('✅') 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
                    : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                }`}>
                  {reminderStatus.startsWith('✅') ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{reminderStatus}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReminderModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={sendingReminder}
                  onClick={handleSendReminderBroadcast}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold flex items-center shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {sendingReminder ? (
                    <span>Sending Broadcast...</span>
                  ) : (
                    <>
                      <Send size={14} className="mr-1.5" /> Send Reminder to Selected
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MEETING DETAIL & EDIT MODAL (WITH PERSON SELECTOR)
          ==================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-slide-up max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <div>
                <h2 className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                  {editMode ? 'Edit Scheduled Sync' : 'Schedule New Meeting Session'}
                </h2>
                <p className="text-xs text-slate-500">Configure meeting agenda, attendees, and dispatch invitations</p>
              </div>
              <button 
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Sprint Planning & Architecture Review"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Summarize the meeting topic and objectives..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Date & times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Platform & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value as Meeting['platform']})}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="MS Teams">MS Teams</option>
                    <option value="Zoom">Zoom</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Meeting Room URL</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Meeting Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Meeting['type']})}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white"
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

              {/* ====================================================
                  PERSON SELECTION OPTIONS (All vs Selected Persons)
                  ==================================================== */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">
                  Select Attendees to Invite & Notify <span className="text-red-500">*</span>
                </label>

                <PersonSelector
                  selectedEmails={selectedEmails}
                  onChange={setSelectedEmails}
                  targetMode={targetMode}
                  onTargetModeChange={setTargetMode}
                  themeColor="blue"
                  allOptionLabel="All Company Members"
                  specificOptionLabel="Select Specific Person(s)"
                  allOptionDescription="Schedule meeting for all registered employees"
                  specificOptionDescription="Pick specific individual team members or external guests"
                  maxListHeight="max-h-40"
                />
              </div>

              {/* Agenda */}
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Meeting Agenda</label>
                <textarea
                  rows={2}
                  value={formData.agenda}
                  onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                  placeholder="Outline the meeting itinerary..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Email Notification Option */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInviteEmail}
                    onChange={(e) => setSendInviteEmail(e.target.checked)}
                    className="w-4 h-4 text-nexora-blue rounded border-slate-300 focus:ring-nexora-blue"
                  />
                  <span>Send Email Invitation & In-App Notification to Selected Attendees</span>
                </label>
              </div>

              {formStatus && (
                <div className="p-3 rounded-xl text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
                  {formStatus}
                </div>
              )}

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  {editMode ? 'Save Changes' : 'Confirm & Schedule Meeting'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          INSTANT MEETING MODAL (LIVE NOW)
          ==================================================== */}
      <InstantMeetingModal
        isOpen={instantMeetingModalOpen}
        onClose={() => setInstantMeetingModalOpen(false)}
      />

    </div>
  );
};

