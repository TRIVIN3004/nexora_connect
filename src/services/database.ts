import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatarUrl?: string;
  designation?: string;
  organization?: string;
  password?: string;
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  speaker: string;
  speakerDesignation: string;
  speakerOrganization: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  platform: 'Zoom' | 'MS Teams' | 'Google Meet' | 'Webex';
  url: string;
  thumbnail: string;
  category: string;
  tags: string[];
  registrationDeadline: string;
  maxParticipants: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface WebinarRegistration {
  id: string;
  webinarId: string;
  userId: string;
  registeredAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  organizerId: string; // user email
  participants: string[]; // user emails
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  platform: 'Zoom' | 'MS Teams' | 'Google Meet';
  url: string;
  agenda: string;
  type: 'Team Meeting' | 'Project Meeting' | 'Mentor Meeting' | 'Client Meeting' | 'Training' | 'Review' | 'Other';
}

export interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  organizer: string;
  participants: string[];
  recordingUrl: string;
  thumbnail: string;
  description: string;
  topics: string[];
  tags: string[];
}

export interface Feedback {
  id: string;
  targetId: string; // WebinarId or MeetingId
  targetType: 'webinar' | 'meeting';
  userId: string; // user email
  ratingOverall: number; // 1-5
  ratingContent: number; // 1-5
  ratingSpeaker: number; // 1-5
  ratingUsefulness: number; // 1-5
  commentUseful: string;
  commentImprove: string;
  recommend: boolean;
  submittedAt: string;
}

export interface Ticket {
  id: string; // format: NX-XXXXX
  subject: string;
  description: string;
  category: 'Technical' | 'Access Issue' | 'Internship' | 'Project' | 'HR' | 'Training' | 'Meeting' | 'Webinar' | 'Other';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'ASSIGNED' | 'IN PROGRESS' | 'WAITING FOR USER' | 'RESOLVED' | 'CLOSED';
  createdById: string; // user email
  assignedToId?: string; // user email
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string; // user email
  userName: string;
  userRole: string;
  comment: string;
  createdAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  authorId: string; // user email
  authorName: string;
  category: string;
  tags: string[];
  coverImage?: string;
  attachments?: string[];
  externalLinks?: string[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  views: number;
  helpfulVotes: number;
  bookmarksCount: number;
}

export interface Bookmark {
  id: string;
  userId: string; // user email
  noteId: string;
}

export interface Notification {
  id: string;
  userId: string; // user email (target user)
  title: string;
  message: string;
  type: 'MEETING_REMINDER' | 'WEBINAR_REMINDER' | 'TICKET_UPDATE' | 'NEW_KNOWLEDGE_NOTE' | 'ANNOUNCEMENT';
  read: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string; // user email
  emailEnabled: boolean;
  inAppEnabled: boolean;
  meetingReminders: ('24H' | '1H' | '15M')[];
  webinarReminders: ('24H' | '1H')[];
}

export interface CompanyMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: 'ADMIN' | 'EMPLOYEE';
  title: string;
  content: string;
  category: 'General Update' | 'Important Notice' | 'Company News' | 'Celebration' | 'HR Update' | 'Urgent Alert';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL_EMPLOYEES';
  createdAt: string;
  pinned?: boolean;
  acknowledgments: string[];
  tags: string[];
}

export interface AuditLog {
  id: string;
  userId: string; // user email
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
}

// ----------------------------------------------------
// SAMPLE INITIAL DATA
// ----------------------------------------------------

const defaultUsers: User[] = [
  {
    id: 'contact@nexoratechs.com',
    email: 'contact@nexoratechs.com',
    name: 'Administrator',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    designation: 'Nexora Administrator',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'trivintrivin2005@gmail.com',
    email: 'trivintrivin2005@gmail.com',
    name: 'Trivin',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    designation: 'Platform Administrator',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'mrohith0089@gmail.com',
    email: 'mrohith0089@gmail.com',
    name: 'ROHITH M',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'srikreekszoldych@gmail.com',
    email: 'srikreekszoldych@gmail.com',
    name: 'M. Srijith',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'waseemay1127@gmail.com',
    email: 'waseemay1127@gmail.com',
    name: 'Waseem Ahamed A J',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'kishoremohan1307@gmail.com',
    email: 'kishoremohan1307@gmail.com',
    name: 'Kishore Mohan',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'aakashrajselvam@gmail.com',
    email: 'aakashrajselvam@gmail.com',
    name: 'Akashraj',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    designation: 'AI / Data Specialist',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'sivaranjanisumathi75@gmail.com',
    email: 'sivaranjanisumathi75@gmail.com',
    name: 'Sivaranjani',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'pavithraayohan@gmail.com',
    email: 'pavithraayohan@gmail.com',
    name: 'Pavithraa S',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'naveensv0112@gmail.com',
    email: 'naveensv0112@gmail.com',
    name: 'Naveen',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'justinsam1902@gmail.com',
    email: 'justinsam1902@gmail.com',
    name: 'Raghul Prasath A',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'sankarleo23@gmail.com',
    email: 'sankarleo23@gmail.com',
    name: 'Sankar R',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'santho06raj@gmail.com',
    email: 'santho06raj@gmail.com',
    name: 'Santhoshraj V',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'dineshkumar.muthuvel2011@gmail.com',
    email: 'dineshkumar.muthuvel2011@gmail.com',
    name: 'M. Dinesh Kumar',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    designation: 'Technical Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'pathmavathis2005@gmail.com',
    email: 'pathmavathis2005@gmail.com',
    name: 'Pathmavathi S',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'poojavellingiri15@gmail.com',
    email: 'poojavellingiri15@gmail.com',
    name: 'Pooja V',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'ssujitha9307@gmail.com',
    email: 'ssujitha9307@gmail.com',
    name: 'Sujitha S',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'naujawanf@gmail.com',
    email: 'naujawanf@gmail.com',
    name: 'Mohammad Farman Ahmed Naujawan H',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'akshuraj2005@gmail.com',
    email: 'akshuraj2005@gmail.com',
    name: 'Akshaya R',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'prishaaraj06@gmail.com',
    email: 'prishaaraj06@gmail.com',
    name: 'Prishaa Kamal',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'aswin3908@gmail.com',
    email: 'aswin3908@gmail.com',
    name: 'Aswin',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  }
];

const defaultCompanyMessages: CompanyMessage[] = [
  {
    id: 'msg-welcome-all',
    senderEmail: 'contact@nexoratechs.com',
    senderName: 'Administrator',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    senderRole: 'ADMIN',
    title: '🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    content: `Hello Everyone! 👋\n\nWelcome to our centralized Nexora Connect company portal! Here is what you can do on our unified platform:\n\n• 📅 Interactive Webinars: Register and attend masterclasses hosted by internal and external leaders.\n• ⏰ Instant Meeting Syncs: Seamlessly schedule 1:1 or team syncs with Google Meet, Zoom, and MS Teams.\n• 📹 Recordings Archive: Replay webinars and meetings anytime.\n• 📚 Knowledge Base & Wiki: Publish technical documentation, best practices, and architecture notes.\n• 🎫 Support Desk: Submit and monitor resolution progress for technical or operational tickets.\n• 📢 Company Broadcasts: Stay informed on company-wide announcements, policy updates, and team milestones.\n\nPlease take a moment to review your profile settings and explore the features. Have a productive week ahead!`,
    category: 'General Update',
    priority: 'NORMAL',
    targetAudience: 'ALL_EMPLOYEES',
    createdAt: new Date().toISOString(),
    pinned: true,
    acknowledgments: ['contact@nexoratechs.com', 'mentor@nexora.com', 'employee@nexora.com'],
    tags: ['Welcome', 'Company Update', 'Nexora Connect']
  }
];

const defaultWebinars: Webinar[] = [];
const defaultRegistrations: WebinarRegistration[] = [];
const defaultMeetings: Meeting[] = [];
const defaultRecordings: Recording[] = [];
const defaultTickets: Ticket[] = [];
const defaultComments: TicketComment[] = [];
const defaultKnowledgeNotes: KnowledgeNote[] = [];
const defaultBookmarks: Bookmark[] = [];
const defaultNotifications: Notification[] = [
  {
    id: 'notif-welcome-contact',
    userId: 'contact@nexoratechs.com',
    title: '📢 🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    message: 'Welcome to our centralized Nexora Connect company portal! Explore webinars, meetings, recordings, and company broadcasts.',
    type: 'ANNOUNCEMENT',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-welcome-mentor',
    userId: 'mentor@nexora.com',
    title: '📢 🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    message: 'Welcome to our centralized Nexora Connect company portal! Explore webinars, meetings, recordings, and company broadcasts.',
    type: 'ANNOUNCEMENT',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-welcome-employee',
    userId: 'employee@nexora.com',
    title: '📢 🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    message: 'Welcome to our centralized Nexora Connect company portal! Explore webinars, meetings, recordings, and company broadcasts.',
    type: 'ANNOUNCEMENT',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif-welcome-intern',
    userId: 'intern@nexora.com',
    title: '📢 🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    message: 'Welcome to our centralized Nexora Connect company portal! Explore webinars, meetings, recordings, and company broadcasts.',
    type: 'ANNOUNCEMENT',
    read: false,
    createdAt: new Date().toISOString()
  }
];
const defaultPreferences: NotificationPreference[] = [];
const defaultAuditLogs: AuditLog[] = [];
const defaultFeedbacks: Feedback[] = [];

// ----------------------------------------------------
// STORAGE HELPER METHODS
// ----------------------------------------------------

function getStorageItem<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data || data === 'null' || data === 'undefined') {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    const parsed = JSON.parse(data);
    if (parsed === null || parsed === undefined) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    // If defaultValue is an array but parsed is not an array, reset and fallback
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return parsed as T;
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ----------------------------------------------------
// MAPPINGS HELPERS
// ----------------------------------------------------

function mapUserToClient(u: any): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as User['role'],
    avatarUrl: u.avatar_url || undefined,
    designation: u.designation || undefined,
    organization: u.organization || undefined,
    password: u.password || undefined
  };
}

function mapUserToDb(u: User): any {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar_url: u.avatarUrl || null,
    designation: u.designation || null,
    organization: u.organization || 'Nexora Technologies',
    password: u.password || 'Nexora@123'
  };
}

function mapWebinarToClient(w: any): Webinar {
  return {
    id: w.id,
    title: w.title,
    description: w.description || '',
    speaker: w.speaker,
    speakerDesignation: w.speaker_designation || '',
    speakerOrganization: w.speaker_organization || '',
    date: w.date,
    startTime: w.start_time,
    endTime: w.end_time || '',
    duration: Number(w.duration || 0),
    platform: (w.platform || 'Zoom') as Webinar['platform'],
    url: w.meeting_url || '',
    thumbnail: w.cover_url || '',
    category: w.category || '',
    tags: Array.isArray(w.tags) ? w.tags : JSON.parse(w.tags || '[]'),
    registrationDeadline: w.registration_deadline || '',
    maxParticipants: Number(w.max_participants || 100),
    status: (w.status || 'UPCOMING') as Webinar['status']
  };
}

function mapWebinarToDb(w: Webinar): any {
  return {
    id: w.id,
    title: w.title,
    description: w.description,
    speaker: w.speaker,
    speaker_designation: w.speakerDesignation,
    speaker_organization: w.speakerOrganization,
    date: w.date,
    start_time: w.startTime,
    end_time: w.endTime,
    duration: w.duration,
    platform: w.platform,
    meeting_url: w.url,
    cover_url: w.thumbnail,
    category: w.category,
    tags: JSON.stringify(w.tags),
    registration_deadline: w.registrationDeadline,
    max_participants: w.maxParticipants,
    status: w.status
  };
}

function mapRegistrationToClient(r: any): WebinarRegistration {
  return {
    id: r.id,
    webinarId: r.webinar_id,
    userId: r.user_id,
    registeredAt: r.registered_at
  };
}

function mapRegistrationToDb(r: WebinarRegistration): any {
  return {
    id: r.id,
    webinar_id: r.webinarId,
    user_id: r.userId,
    registered_at: r.registeredAt
  };
}

function mapMeetingToClient(m: any): Meeting {
  return {
    id: m.id,
    title: m.title,
    description: m.description || '',
    organizerId: m.organizer_id,
    participants: Array.isArray(m.participants) ? m.participants : JSON.parse(m.participants || '[]'),
    date: m.date,
    startTime: m.start_time,
    endTime: m.end_time || '',
    platform: (m.platform || 'Zoom') as Meeting['platform'],
    url: m.meeting_url || '',
    agenda: m.agenda || '',
    type: (m.type || 'Other') as Meeting['type']
  };
}

function mapMeetingToDb(m: Meeting): any {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    organizer_id: m.organizerId,
    participants: JSON.stringify(m.participants),
    date: m.date,
    start_time: m.startTime,
    end_time: m.endTime,
    platform: m.platform,
    meeting_url: m.url,
    agenda: m.agenda,
    type: m.type
  };
}

function mapRecordingToClient(r: any): Recording {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    duration: r.duration || '',
    organizer: r.organizer || '',
    participants: Array.isArray(r.participants) ? r.participants : JSON.parse(r.participants || '[]'),
    recordingUrl: r.recording_url || '',
    thumbnail: r.thumbnail || '',
    description: r.description || '',
    topics: Array.isArray(r.topics) ? r.topics : JSON.parse(r.topics || '[]'),
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || '[]')
  };
}

function mapRecordingToDb(r: Recording): any {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    duration: r.duration,
    organizer: r.organizer,
    participants: JSON.stringify(r.participants),
    recording_url: r.recordingUrl,
    thumbnail: r.thumbnail,
    description: r.description,
    topics: JSON.stringify(r.topics),
    tags: JSON.stringify(r.tags)
  };
}

function mapFeedbackToClient(f: any): Feedback {
  return {
    id: f.id,
    targetId: f.target_id || '',
    targetType: (f.target_type || 'webinar') as Feedback['targetType'],
    userId: f.user_id || '',
    ratingOverall: Number(f.rating_overall || 5),
    ratingContent: Number(f.rating_content || 5),
    ratingSpeaker: Number(f.rating_speaker || 5),
    ratingUsefulness: Number(f.rating_usefulness || 5),
    commentUseful: f.comment_useful || '',
    commentImprove: f.comment_improve || '',
    recommend: !!f.recommend,
    submittedAt: f.submitted_at
  };
}

function mapFeedbackToDb(f: Feedback): any {
  return {
    id: f.id,
    target_id: f.targetId,
    target_type: f.targetType,
    user_id: f.userId,
    rating_overall: f.ratingOverall,
    rating_content: f.ratingContent,
    rating_speaker: f.ratingSpeaker,
    rating_usefulness: f.ratingUsefulness,
    comment_useful: f.commentUseful,
    comment_improve: f.commentImprove,
    recommend: f.recommend,
    submitted_at: f.submittedAt
  };
}

function mapTicketToClient(t: any): Ticket {
  return {
    id: t.id,
    subject: t.subject,
    description: t.description || '',
    category: t.category || '',
    priority: (t.priority || 'LOW') as Ticket['priority'],
    status: (t.status || 'OPEN') as Ticket['status'],
    createdById: t.created_by_id,
    assignedToId: t.assigned_to_id || undefined,
    createdAt: t.created_at,
    updatedAt: t.updated_at || t.created_at
  };
}

function mapTicketToDb(t: Ticket): any {
  return {
    id: t.id,
    subject: t.subject,
    description: t.description,
    category: t.category,
    priority: t.priority,
    status: t.status,
    created_by_id: t.createdById,
    assigned_to_id: t.assignedToId || null,
    created_at: t.createdAt,
    updated_at: t.updatedAt
  };
}

function mapCommentToClient(c: any): TicketComment {
  return {
    id: c.id,
    ticketId: c.ticket_id,
    userId: c.user_id,
    userName: c.user_name,
    userRole: c.user_role || 'EMPLOYEE',
    comment: c.comment_text || c.comment || '',
    createdAt: c.created_at
  };
}

function mapCommentToDb(c: TicketComment): any {
  return {
    id: c.id,
    ticket_id: c.ticketId,
    user_id: c.userId,
    user_name: c.userName,
    user_role: c.userRole,
    comment_text: c.comment,
    created_at: c.createdAt
  };
}

function mapNoteToClient(n: any): KnowledgeNote {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category || 'General',
    authorId: n.author_id,
    authorName: n.author_name,
    coverImage: n.cover_image || undefined,
    tags: Array.isArray(n.tags) ? n.tags : JSON.parse(n.tags || '[]'),
    status: (n.status || 'DRAFT') as KnowledgeNote['status'],
    views: Number(n.views || 0),
    helpfulVotes: Number(n.helpful_votes || 0),
    bookmarksCount: Number(n.bookmarks_count || 0),
    createdAt: n.created_at,
    updatedAt: n.updated_at || n.created_at
  };
}

function mapNoteToDb(n: KnowledgeNote): any {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category,
    author_id: n.authorId,
    author_name: n.authorName,
    cover_image: n.coverImage || null,
    tags: JSON.stringify(n.tags),
    status: n.status,
    views: n.views,
    helpful_votes: n.helpfulVotes,
    bookmarks_count: n.bookmarksCount,
    created_at: n.createdAt,
    updated_at: n.updatedAt
  };
}

function mapBookmarkToClient(b: any): Bookmark {
  return {
    id: b.id,
    userId: b.user_id,
    noteId: b.note_id
  };
}

function mapBookmarkToDb(b: Bookmark): any {
  return {
    id: b.id,
    user_id: b.userId,
    note_id: b.noteId
  };
}

function mapNotificationToClient(n: any): Notification {
  return {
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type as Notification['type'],
    read: !!n.read,
    createdAt: n.created_at
  };
}

function mapNotificationToDb(n: Notification): any {
  return {
    id: n.id,
    user_id: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    created_at: n.createdAt
  };
}

function mapAuditLogToClient(a: any): AuditLog {
  return {
    id: a.id,
    userId: a.user_email,
    userName: a.user_name,
    action: a.action,
    entity: a.entity_type,
    entityId: a.entity_id || '',
    timestamp: a.timestamp
  };
}

function mapAuditLogToDb(a: AuditLog): any {
  return {
    id: a.id,
    user_email: a.userId,
    user_name: a.userName,
    action: a.action,
    entity_type: a.entity,
    entity_id: a.entityId || null,
    timestamp: a.timestamp
  };
}

function mapCompanyMessageToClient(m: any): CompanyMessage {
  return {
    id: m.id,
    senderEmail: m.sender_email || m.senderEmail,
    senderName: m.sender_name || m.senderName,
    senderAvatar: m.sender_avatar || m.senderAvatar || undefined,
    senderRole: m.sender_role || m.senderRole || 'EMPLOYEE',
    title: m.title,
    content: m.content,
    category: m.category || 'General Update',
    priority: m.priority || 'NORMAL',
    targetAudience: 'ALL_EMPLOYEES',
    createdAt: m.created_at || m.createdAt,
    pinned: !!m.pinned,
    acknowledgments: Array.isArray(m.acknowledgments) ? m.acknowledgments : (typeof m.acknowledgments === 'string' ? JSON.parse(m.acknowledgments || '[]') : []),
    tags: Array.isArray(m.tags) ? m.tags : (typeof m.tags === 'string' ? JSON.parse(m.tags || '[]') : [])
  };
}

function mapCompanyMessageToDb(m: CompanyMessage): any {
  return {
    id: m.id,
    sender_email: m.senderEmail,
    sender_name: m.senderName,
    sender_avatar: m.senderAvatar || null,
    sender_role: m.senderRole,
    title: m.title,
    content: m.content,
    category: m.category,
    priority: m.priority,
    target_audience: m.targetAudience,
    created_at: m.createdAt,
    pinned: m.pinned || false,
    acknowledgments: JSON.stringify(m.acknowledgments || []),
    tags: JSON.stringify(m.tags || [])
  };
}

// ----------------------------------------------------
// DATABASE SERVICE CLASS
// ----------------------------------------------------

export class NexoraDatabase {
  private supabaseUrl: string | null = null;
  private supabaseKey: string | null = null;
  private supabase: SupabaseClient | null = null;
  private onSyncCallback: (() => void) | null = null;

  constructor() {
    // Clear old mock data cache once to seed the 20 real employee accounts
    if (typeof window !== 'undefined' && !localStorage.getItem('nexora_team_roster_v1')) {
      const keysToClear = [
        'nexora_users',
        'nexora_deleted_users'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('nexora_team_roster_v1', 'true');
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('nexora_publish_cleanup_v1')) {
      const keysToClear = [
        'nexora_users',
        'nexora_notifications'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('nexora_publish_cleanup_v1', 'true');
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('nexora_data_reset_v3')) {
      const keysToClear = [
        'nexora_users',
        'nexora_webinars',
        'nexora_webinar_registrations',
        'nexora_meetings',
        'nexora_recordings',
        'nexora_feedbacks',
        'nexora_tickets',
        'nexora_comments',
        'nexora_notes',
        'nexora_bookmarks',
        'nexora_notifications',
        'nexora_audit_logs',
        'nexora_current_user_email',
        'nexora_theme'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('nexora_theme', 'light');
      localStorage.setItem('nexora_data_reset_v3', 'true');
    }

    this.initSupabase();
    this.syncFromSupabase();
    // Force initialization of all local storage keys
    this.getUsers();
    this.getWebinars();
    this.getWebinarRegistrations();
    this.getMeetings();
    this.getRecordings();
    this.getFeedbacks();
    this.getTickets();
    this.getTicketComments();
    this.getKnowledgeNotes();
    this.getBookmarks();
    this.getNotifications();
    this.getNotificationPreferences();
    this.getAuditLogs();
    this.getCompanyMessages();
  }

  initSupabase(): void {
    let url = (import.meta.env.VITE_SUPABASE_URL as string) || localStorage.getItem('nexora_supabase_url');
    this.supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || localStorage.getItem('nexora_supabase_anon_key');
    
    if (url) {
      // Normalize URL (strip trailing slashes, /rest/v1, etc.)
      url = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    }
    this.supabaseUrl = url;

    if (this.supabaseUrl && this.supabaseKey) {
      try {
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        console.log('[SUPABASE] Database client initialized.');
      } catch (e) {
        console.error('[SUPABASE] Failed to initialize client:', e);
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  isSupabaseConnected(): boolean {
    return this.supabase !== null;
  }

  setOnSync(callback: () => void): void {
    this.onSyncCallback = callback;
  }

  async syncFromSupabase(): Promise<void> {
    if (!this.supabase) return;
    console.log('[SUPABASE] Starting background tables sync...');

    try {
      const [
        { data: dbUsers },
        { data: dbWebinars },
        { data: dbRegistrations },
        { data: dbMeetings },
        { data: dbRecordings },
        { data: dbFeedbacks },
        { data: dbTickets },
        { data: dbComments },
        { data: dbNotes },
        { data: dbBookmarks },
        { data: dbNotifications },
        { data: dbAuditLogs }
      ] = await Promise.all([
        this.supabase.from('users').select('*'),
        this.supabase.from('webinars').select('*'),
        this.supabase.from('webinar_registrations').select('*'),
        this.supabase.from('meetings').select('*'),
        this.supabase.from('recordings').select('*'),
        this.supabase.from('feedbacks').select('*'),
        this.supabase.from('tickets').select('*'),
        this.supabase.from('ticket_comments').select('*'),
        this.supabase.from('knowledge_notes').select('*'),
        this.supabase.from('bookmarks').select('*'),
        this.supabase.from('notifications').select('*'),
        this.supabase.from('audit_logs').select('*')
      ]);

      if (dbUsers) {
        const uniqueSynced: User[] = [];
        const seenEmails = new Set<string>();
        dbUsers.map(mapUserToClient).forEach(u => {
          if (u.email && !seenEmails.has(u.email.toLowerCase())) {
            seenEmails.add(u.email.toLowerCase());
            uniqueSynced.push(u);
          }
        });
        setStorageItem('nexora_users', uniqueSynced);
      }
      if (dbWebinars) setStorageItem('nexora_webinars', dbWebinars.map(mapWebinarToClient));
      if (dbRegistrations) setStorageItem('nexora_webinar_registrations', dbRegistrations.map(mapRegistrationToClient));
      if (dbMeetings) setStorageItem('nexora_meetings', dbMeetings.map(mapMeetingToClient));
      if (dbRecordings) setStorageItem('nexora_recordings', dbRecordings.map(mapRecordingToClient));
      if (dbFeedbacks) setStorageItem('nexora_feedbacks', dbFeedbacks.map(mapFeedbackToClient));
      if (dbTickets) setStorageItem('nexora_tickets', dbTickets.map(mapTicketToClient));
      if (dbComments) setStorageItem('nexora_ticket_comments', dbComments.map(mapCommentToClient));
      if (dbNotes) setStorageItem('nexora_knowledge_notes', dbNotes.map(mapNoteToClient));
      if (dbBookmarks) setStorageItem('nexora_bookmarks', dbBookmarks.map(mapBookmarkToClient));
      if (dbNotifications) setStorageItem('nexora_notifications', dbNotifications.map(mapNotificationToClient));
      if (dbAuditLogs) setStorageItem('nexora_audit_logs', dbAuditLogs.map(mapAuditLogToClient));

      try {
        const { data: dbCompanyMsgs, error: cmErr } = await this.supabase.from('company_messages').select('*');
        if (!cmErr && dbCompanyMsgs && dbCompanyMsgs.length > 0) {
          setStorageItem('nexora_company_messages', dbCompanyMsgs.map(mapCompanyMessageToClient));
        }
      } catch (e) {
        // Table fallback to local storage
      }

      console.log('[SUPABASE] Sync success! Client local cache updated.');
      if (this.onSyncCallback) {
        this.onSyncCallback();
      }
    } catch (e) {
      console.error('[SUPABASE] Sync query error:', e);
    }
  }

  // Users
  // Users
  getUsers(): User[] {
    const deletedUserKeys = getStorageItem<string[]>('nexora_deleted_users', []);
    let storedUsers = getStorageItem<User[] | null>('nexora_users', null);

    if (!storedUsers) {
      storedUsers = defaultUsers;
    }

    // Filter out deprecated demo accounts, guest accounts, and deleted accounts
    const validUsers = storedUsers.filter(u => {
      if (!u || !u.email) return false;
      const email = u.email.trim().toLowerCase();
      const id = (u.id || '').trim().toLowerCase();
      
      if (email === 'admin@nexora.com' || email === 'user@nexora.com' || email === 'guest@nexoratechs.com') {
        return false;
      }
      if (deletedUserKeys.includes(email) || (id && deletedUserKeys.includes(id))) {
        return false;
      }
      return true;
    });

    // Deduplicate by clean lowercase email
    const uniqueMap = new Map<string, User>();
    validUsers.forEach(u => {
      const key = u.email.trim().toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, u);
      }
    });

    const uniqueUsers = Array.from(uniqueMap.values());
    setStorageItem('nexora_users', uniqueUsers);
    return uniqueUsers;
  }

  getUser(email: string): User | undefined {
    if (!email) return undefined;
    const cleanEmail = email.trim().toLowerCase();
    return this.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
  }

  updateUser(user: User): void {
    const users = this.getUsers().map(u => u.id === user.id ? user : u);
    setStorageItem('nexora_users', users);
    if (this.supabase) {
      this.supabase.from('users').upsert(mapUserToDb(user)).then(({ error }) => {
        if (error) console.error('[SUPABASE] updateUser error:', error);
      });
    }
  }

  deleteUser(userId: string): void {
    const cleanId = (userId || '').trim().toLowerCase();
    if (!cleanId) return;

    // Track in deleted keys list
    const deletedUserKeys = getStorageItem<string[]>('nexora_deleted_users', []);
    if (!deletedUserKeys.includes(cleanId)) {
      deletedUserKeys.push(cleanId);
    }
    
    // Find the user to also blacklist by email and id
    const currentList = getStorageItem<User[]>('nexora_users', defaultUsers);
    const targetUser = currentList.find(u => 
      (u.id && u.id.toLowerCase() === cleanId) || 
      (u.email && u.email.toLowerCase() === cleanId)
    );
    if (targetUser) {
      const targetEmail = (targetUser.email || '').toLowerCase();
      const targetId = (targetUser.id || '').toLowerCase();
      if (targetEmail && !deletedUserKeys.includes(targetEmail)) deletedUserKeys.push(targetEmail);
      if (targetId && !deletedUserKeys.includes(targetId)) deletedUserKeys.push(targetId);
    }
    setStorageItem('nexora_deleted_users', deletedUserKeys);

    // Filter active users list
    const updatedUsers = currentList.filter(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uId = (u.id || '').toLowerCase();
      return uEmail !== cleanId && uId !== cleanId && !deletedUserKeys.includes(uEmail) && !deletedUserKeys.includes(uId);
    });
    setStorageItem('nexora_users', updatedUsers);

    // Supabase sync
    if (this.supabase) {
      this.supabase.from('users').delete().eq('id', userId).then(({ error }) => {
        if (error) {
          this.supabase?.from('users').delete().eq('email', userId);
        }
      });
    }
  }

  // Webinars
  getWebinars(): Webinar[] {
    return getStorageItem<Webinar[]>('nexora_webinars', defaultWebinars);
  }

  createWebinar(webinar: Omit<Webinar, 'id'>, actingUserEmail: string, actingUserName: string): Webinar {
    const id = `web-${Date.now()}`;
    const newWebinar: Webinar = { ...webinar, id };
    const webinars = [...this.getWebinars(), newWebinar];
    setStorageItem('nexora_webinars', webinars);

    this.createAuditLog(actingUserEmail, actingUserName, 'CREATE_WEBINAR', 'Webinar', id);
    if (this.supabase) {
      this.supabase.from('webinars').upsert(mapWebinarToDb(newWebinar)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createWebinar error:', error);
      });
    }
    return newWebinar;
  }

  updateWebinar(webinar: Webinar, actingUserEmail: string, actingUserName: string): void {
    const webinars = this.getWebinars().map(w => w.id === webinar.id ? webinar : w);
    setStorageItem('nexora_webinars', webinars);
    this.createAuditLog(actingUserEmail, actingUserName, 'UPDATE_WEBINAR', 'Webinar', webinar.id);
    if (this.supabase) {
      this.supabase.from('webinars').upsert(mapWebinarToDb(webinar)).then(({ error }) => {
        if (error) console.error('[SUPABASE] updateWebinar error:', error);
      });
    }
  }

  // Registrations
  getWebinarRegistrations(): WebinarRegistration[] {
    return getStorageItem<WebinarRegistration[]>('nexora_webinar_registrations', defaultRegistrations);
  }

  registerForWebinar(webinarId: string, userId: string): WebinarRegistration {
    const id = `reg-${Date.now()}`;
    const newReg = { id, webinarId, userId, registeredAt: new Date().toISOString() };
    const regs = [...this.getWebinarRegistrations(), newReg];
    setStorageItem('nexora_webinar_registrations', regs);

    // Create system notification
    const webinar = this.getWebinars().find(w => w.id === webinarId);
    if (webinar) {
      this.createNotification(
        userId,
        'Webinar Registered',
        `Registration confirmed for webinar "${webinar.title}".`,
        'WEBINAR_REMINDER'
      );
    }
    if (this.supabase) {
      this.supabase.from('webinar_registrations').upsert(mapRegistrationToDb(newReg)).then(({ error }) => {
        if (error) console.error('[SUPABASE] registerForWebinar error:', error);
      });
    }
    return newReg;
  }

  unregisterForWebinar(webinarId: string, userId: string): void {
    const regs = this.getWebinarRegistrations().filter(r => !(r.webinarId === webinarId && r.userId === userId));
    setStorageItem('nexora_webinar_registrations', regs);
    if (this.supabase) {
      this.supabase.from('webinar_registrations').delete().eq('webinar_id', webinarId).eq('user_id', userId).then(({ error }) => {
        if (error) console.error('[SUPABASE] unregisterForWebinar error:', error);
      });
    }
  }

  // Meetings
  getMeetings(): Meeting[] {
    return getStorageItem<Meeting[]>('nexora_meetings', defaultMeetings);
  }

  createMeeting(meeting: Omit<Meeting, 'id'>, actingUserEmail: string, actingUserName: string): Meeting {
    const id = `meet-${Date.now()}`;
    const newMeeting = { ...meeting, id };
    const meetings = [...this.getMeetings(), newMeeting];
    setStorageItem('nexora_meetings', meetings);

    this.createAuditLog(actingUserEmail, actingUserName, 'CREATE_MEETING', 'Meeting', id);

    // Notify all participants
    meeting.participants.forEach(p => {
      this.createNotification(
        p,
        'Meeting Invitation',
        `You have been invited to "${meeting.title}" scheduled for ${meeting.date} at ${meeting.startTime}.`,
        'MEETING_REMINDER'
      );
    });

    if (this.supabase) {
      this.supabase.from('meetings').upsert(mapMeetingToDb(newMeeting)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createMeeting error:', error);
      });
    }
    return newMeeting;
  }

  updateMeeting(meeting: Meeting, actingUserEmail: string, actingUserName: string): void {
    const meetings = this.getMeetings().map(m => m.id === meeting.id ? meeting : m);
    setStorageItem('nexora_meetings', meetings);
    this.createAuditLog(actingUserEmail, actingUserName, 'UPDATE_MEETING', 'Meeting', meeting.id);

    // Notify participants
    meeting.participants.forEach(p => {
      this.createNotification(
        p,
        'Meeting Updated',
        `Meeting "${meeting.title}" details have been updated. Please verify time and link.`,
        'MEETING_REMINDER'
      );
    });

    if (this.supabase) {
      this.supabase.from('meetings').upsert(mapMeetingToDb(meeting)).then(({ error }) => {
        if (error) console.error('[SUPABASE] updateMeeting error:', error);
      });
    }
  }

  deleteMeeting(meetingId: string, actingUserEmail: string, actingUserName: string): void {
    const meetings = this.getMeetings().filter(m => m.id !== meetingId);
    setStorageItem('nexora_meetings', meetings);
    this.createAuditLog(actingUserEmail, actingUserName, 'DELETE_MEETING', 'Meeting', meetingId);
    if (this.supabase) {
      this.supabase.from('meetings').delete().eq('id', meetingId).then(({ error }) => {
        if (error) console.error('[SUPABASE] deleteMeeting error:', error);
      });
    }
  }

  // Recordings
  getRecordings(): Recording[] {
    return getStorageItem<Recording[]>('nexora_recordings', defaultRecordings);
  }

  createRecording(recording: Omit<Recording, 'id'>, actingUserEmail: string, actingUserName: string): Recording {
    const id = `rec-${Date.now()}`;
    const newRec = { ...recording, id };
    const recordings = [...this.getRecordings(), newRec];
    setStorageItem('nexora_recordings', recordings);
    this.createAuditLog(actingUserEmail, actingUserName, 'UPLOAD_RECORDING', 'Recording', id);
    if (this.supabase) {
      this.supabase.from('recordings').upsert(mapRecordingToDb(newRec)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createRecording error:', error);
      });
    }
    return newRec;
  }

  deleteRecording(recordingId: string, actingUserEmail: string, actingUserName: string): void {
    const recordings = this.getRecordings().filter(r => r.id !== recordingId);
    setStorageItem('nexora_recordings', recordings);
    this.createAuditLog(actingUserEmail, actingUserName, 'DELETE_RECORDING', 'Recording', recordingId);
    if (this.supabase) {
      this.supabase.from('recordings').delete().eq('id', recordingId).then(({ error }) => {
        if (error) console.error('[SUPABASE] deleteRecording error:', error);
      });
    }
  }

  // Feedbacks
  getFeedbacks(): Feedback[] {
    return getStorageItem<Feedback[]>('nexora_feedbacks', defaultFeedbacks);
  }

  submitFeedback(feedback: Omit<Feedback, 'id' | 'submittedAt'>): Feedback {
    const id = `fb-${Date.now()}`;
    const newFb = { ...feedback, id, submittedAt: new Date().toISOString() };
    const feedbacks = [...this.getFeedbacks(), newFb];
    setStorageItem('nexora_feedbacks', feedbacks);
    if (this.supabase) {
      this.supabase.from('feedbacks').upsert(mapFeedbackToDb(newFb)).then(({ error }) => {
        if (error) console.error('[SUPABASE] submitFeedback error:', error);
      });
    }
    return newFb;
  }

  // Tickets
  getTickets(): Ticket[] {
    return getStorageItem<Ticket[]>('nexora_tickets', defaultTickets);
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>, actingUserEmail: string, actingUserName: string): Ticket {
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const id = `NX-${randNum}`;
    const newTicket: Ticket = {
      ...ticket,
      id,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const tickets = [...this.getTickets(), newTicket];
    setStorageItem('nexora_tickets', tickets);

    this.createAuditLog(actingUserEmail, actingUserName, 'CREATE_TICKET', 'Ticket', id);

    // Notify administrators
    const admins = this.getUsers().filter(u => u.role === 'ADMIN');
    admins.forEach(admin => {
      this.createNotification(
        admin.email,
        'Support Ticket Raised',
        `New ticket ${id}: "${ticket.subject}" raised by ${actingUserName}.`,
        'TICKET_UPDATE'
      );
    });

    if (this.supabase) {
      this.supabase.from('tickets').upsert(mapTicketToDb(newTicket)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createTicket error:', error);
      });
    }
    return newTicket;
  }

  updateTicket(ticket: Ticket, actingUserEmail: string, actingUserName: string): void {
    const oldTicket = this.getTickets().find(t => t.id === ticket.id);
    const updatedTicket = { ...ticket, updatedAt: new Date().toISOString() };
    const tickets = this.getTickets().map(t => t.id === ticket.id ? updatedTicket : t);
    setStorageItem('nexora_tickets', tickets);

    this.createAuditLog(actingUserEmail, actingUserName, 'UPDATE_TICKET', 'Ticket', ticket.id);

    // Notify ticket owner
    if (oldTicket && oldTicket.status !== ticket.status) {
      this.createNotification(
        ticket.createdById,
        'Ticket Status Updated',
        `Ticket ${ticket.id} status changed from ${oldTicket.status} to ${ticket.status}.`,
        'TICKET_UPDATE'
      );
    }
    if (this.supabase) {
      this.supabase.from('tickets').upsert(mapTicketToDb(updatedTicket)).then(({ error }) => {
        if (error) console.error('[SUPABASE] updateTicket error:', error);
      });
    }
  }

  assignTicket(ticketId: string, assignToId: string, actingUserEmail: string, actingUserName: string): void {
    const tickets = this.getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex > -1) {
      const oldTicket = tickets[ticketIndex];
      const updatedTicket: Ticket = {
        ...oldTicket,
        assignedToId: assignToId,
        status: oldTicket.status === 'OPEN' ? 'ASSIGNED' : oldTicket.status,
        updatedAt: new Date().toISOString()
      };
      tickets[ticketIndex] = updatedTicket;
      setStorageItem('nexora_tickets', tickets);

      this.createAuditLog(actingUserEmail, actingUserName, 'ASSIGN_TICKET', 'Ticket', ticketId);

      // Notify assignee
      const assignee = this.getUser(assignToId);
      if (assignee) {
        this.createNotification(
          assignToId,
          'Support Ticket Assigned',
          `Ticket ${ticketId} has been assigned to you by ${actingUserName}.`,
          'TICKET_UPDATE'
        );
      }

      // Notify owner
      this.createNotification(
        updatedTicket.createdById,
        'Ticket Owner Update',
        `Ticket ${ticketId} has been assigned to support engineer "${assignee ? assignee.name : assignToId}".`,
        'TICKET_UPDATE'
      );

      if (this.supabase) {
        this.supabase.from('tickets').upsert(mapTicketToDb(updatedTicket)).then(({ error }) => {
          if (error) console.error('[SUPABASE] assignTicket error:', error);
        });
      }
    }
  }

  // Comments
  getTicketComments(): TicketComment[] {
    return getStorageItem<TicketComment[]>('nexora_comments', defaultComments);
  }

  addTicketComment(ticketId: string, userId: string, userName: string, userRole: string, comment: string): TicketComment {
    const id = `c-${Date.now()}`;
    const newComment = { id, ticketId, userId, userName, userRole, comment, createdAt: new Date().toISOString() };
    const comments = [...this.getTicketComments(), newComment];
    setStorageItem('nexora_comments', comments);

    // Notify parties
    const ticket = this.getTickets().find(t => t.id === ticketId);
    if (ticket) {
      const recipient = userId === ticket.createdById ? ticket.assignedToId : ticket.createdById;
      if (recipient) {
        this.createNotification(
          recipient,
          'New Ticket Comment',
          `New comment added on ${ticketId} by ${userName}.`,
          'TICKET_UPDATE'
        );
      }
    }

    if (this.supabase) {
      this.supabase.from('ticket_comments').upsert(mapCommentToDb(newComment)).then(({ error }) => {
        if (error) console.error('[SUPABASE] addTicketComment error:', error);
      });
    }
    return newComment;
  }

  // Knowledge Notes
  getKnowledgeNotes(): KnowledgeNote[] {
    return getStorageItem<KnowledgeNote[]>('nexora_notes', defaultKnowledgeNotes);
  }

  createKnowledgeNote(note: Omit<KnowledgeNote, 'id' | 'views' | 'helpfulVotes' | 'bookmarksCount' | 'createdAt' | 'updatedAt'>, actingUserEmail: string, actingUserName: string): KnowledgeNote {
    const id = `note-${Date.now()}`;
    const newNote: KnowledgeNote = {
      ...note,
      id,
      views: 0,
      helpfulVotes: 0,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const notes = [...this.getKnowledgeNotes(), newNote];
    setStorageItem('nexora_notes', notes);

    this.createAuditLog(actingUserEmail, actingUserName, 'CREATE_KNOWLEDGE_NOTE', 'KnowledgeNote', id);

    // If moderation is required (e.g. Intern/Employee submissions require admin approval)
    if (newNote.status === 'PENDING_APPROVAL') {
      const admins = this.getUsers().filter(u => u.role === 'ADMIN');
      admins.forEach(admin => {
        this.createNotification(
          admin.email,
          'Knowledge Note Moderation Required',
          `New note "${newNote.title}" submitted by ${newNote.authorName} requires approval.`,
          'ANNOUNCEMENT'
        );
      });
    } else if (newNote.status === 'PUBLISHED') {
      // Notify globally
      this.getUsers().forEach(u => {
        if (u.email !== actingUserEmail) {
          this.createNotification(
            u.email,
            'New Knowledge Note',
            `${newNote.authorName} published: "${newNote.title}".`,
            'NEW_KNOWLEDGE_NOTE'
          );
        }
      });
    }

    if (this.supabase) {
      this.supabase.from('knowledge_notes').upsert(mapNoteToDb(newNote)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createKnowledgeNote error:', error);
      });
    }
    return newNote;
  }

  updateKnowledgeNote(note: KnowledgeNote, actingUserEmail: string, actingUserName: string): void {
    const oldNote = this.getKnowledgeNotes().find(n => n.id === note.id);
    const updatedNote = { ...note, updatedAt: new Date().toISOString() };
    const notes = this.getKnowledgeNotes().map(n => n.id === note.id ? updatedNote : n);
    setStorageItem('nexora_notes', notes);

    this.createAuditLog(actingUserEmail, actingUserName, 'UPDATE_KNOWLEDGE_NOTE', 'KnowledgeNote', note.id);

    // Trigger notification if published
    if (oldNote && oldNote.status !== 'PUBLISHED' && note.status === 'PUBLISHED') {
      this.getUsers().forEach(u => {
        if (u.email !== actingUserEmail) {
          this.createNotification(
            u.email,
            'New Knowledge Note',
            `${note.authorName} published: "${note.title}".`,
            'NEW_KNOWLEDGE_NOTE'
          );
        }
      });
    }

    if (this.supabase) {
      this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
        if (error) console.error('[SUPABASE] updateKnowledgeNote error:', error);
      });
    }
  }

  approveKnowledgeNote(noteId: string, actingUserEmail: string, actingUserName: string): void {
    const notes = this.getKnowledgeNotes();
    const noteIdx = notes.findIndex(n => n.id === noteId);
    if (noteIdx > -1) {
      const oldNote = notes[noteIdx];
      const updatedNote: KnowledgeNote = { ...oldNote, status: 'PUBLISHED', updatedAt: new Date().toISOString() };
      notes[noteIdx] = updatedNote;
      setStorageItem('nexora_notes', notes);

      this.createAuditLog(actingUserEmail, actingUserName, 'APPROVE_KNOWLEDGE_NOTE', 'KnowledgeNote', noteId);

      // Notify Author
      this.createNotification(
        updatedNote.authorId,
        'Knowledge Note Approved',
        `Your article "${updatedNote.title}" was approved by Admin ${actingUserName} and is now live!`,
        'ANNOUNCEMENT'
      );

      // Notify Everyone else
      this.getUsers().forEach(u => {
        if (u.email !== updatedNote.authorId) {
          this.createNotification(
            u.email,
            'New Knowledge Note',
            `${updatedNote.authorName} published: "${updatedNote.title}".`,
            'NEW_KNOWLEDGE_NOTE'
          );
        }
      });

      if (this.supabase) {
        this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
          if (error) console.error('[SUPABASE] approveKnowledgeNote error:', error);
        });
      }
    }
  }

  deleteKnowledgeNote(noteId: string, actingUserEmail: string, actingUserName: string): void {
    const notes = this.getKnowledgeNotes().filter(n => n.id !== noteId);
    setStorageItem('nexora_notes', notes);
    this.createAuditLog(actingUserEmail, actingUserName, 'DELETE_KNOWLEDGE_NOTE', 'KnowledgeNote', noteId);
    if (this.supabase) {
      this.supabase.from('knowledge_notes').delete().eq('id', noteId).then(({ error }) => {
        if (error) console.error('[SUPABASE] deleteKnowledgeNote error:', error);
      });
    }
  }

  incrementNoteViews(noteId: string): void {
    const notes = this.getKnowledgeNotes().map(n => n.id === noteId ? { ...n, views: n.views + 1 } : n);
    setStorageItem('nexora_notes', notes);
    const updatedNote = notes.find(n => n.id === noteId);
    if (updatedNote && this.supabase) {
      this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
        if (error) console.error('[SUPABASE] incrementViews error:', error);
      });
    }
  }

  voteHelpful(noteId: string, _userId: string): void {
    const notes = this.getKnowledgeNotes().map(n => n.id === noteId ? { ...n, helpfulVotes: n.helpfulVotes + 1 } : n);
    setStorageItem('nexora_notes', notes);
    const updatedNote = notes.find(n => n.id === noteId);
    if (updatedNote && this.supabase) {
      this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
        if (error) console.error('[SUPABASE] voteHelpful error:', error);
      });
    }
  }

  // Bookmarks
  getBookmarks(): Bookmark[] {
    return getStorageItem<Bookmark[]>('nexora_bookmarks', defaultBookmarks);
  }

  toggleBookmark(userId: string, noteId: string): boolean {
    const bookmarks = this.getBookmarks();
    const existingIdx = bookmarks.findIndex(b => b.userId === userId && b.noteId === noteId);
    let added = false;
    const newBookmarkId = `b-${Date.now()}`;

    if (existingIdx > -1) {
      bookmarks.splice(existingIdx, 1);
      // Decrement note bookmarks count
      const notes = this.getKnowledgeNotes().map(n => n.id === noteId ? { ...n, bookmarksCount: Math.max(0, n.bookmarksCount - 1) } : n);
      setStorageItem('nexora_notes', notes);
      
      const updatedNote = notes.find(n => n.id === noteId);
      if (updatedNote && this.supabase) {
        this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
          if (error) console.error('[SUPABASE] toggleBookmark dec error:', error);
        });
      }
      if (this.supabase) {
        this.supabase.from('bookmarks').delete().eq('user_id', userId).eq('note_id', noteId).then(({ error }) => {
          if (error) console.error('[SUPABASE] deleteBookmark error:', error);
        });
      }
    } else {
      const newB = { id: newBookmarkId, userId, noteId };
      bookmarks.push(newB);
      added = true;
      // Increment note bookmarks count
      const notes = this.getKnowledgeNotes().map(n => n.id === noteId ? { ...n, bookmarksCount: n.bookmarksCount + 1 } : n);
      setStorageItem('nexora_notes', notes);

      const updatedNote = notes.find(n => n.id === noteId);
      if (updatedNote && this.supabase) {
        this.supabase.from('knowledge_notes').upsert(mapNoteToDb(updatedNote)).then(({ error }) => {
          if (error) console.error('[SUPABASE] toggleBookmark inc error:', error);
        });
      }
      if (this.supabase) {
        this.supabase.from('bookmarks').upsert(mapBookmarkToDb(newB)).then(({ error }) => {
          if (error) console.error('[SUPABASE] insertBookmark error:', error);
        });
      }
    }

    setStorageItem('nexora_bookmarks', bookmarks);
    return added;
  }

  // Bookmarks and Notifications
  getNotifications(): Notification[] {
    return getStorageItem<Notification[]>('nexora_notifications', defaultNotifications);
  }

  createNotification(userId: string, title: string, message: string, type: Notification['type']): Notification {
    const id = `n-${Date.now()}`;
    const newNotif = { id, userId, title, message, type, read: false, createdAt: new Date().toISOString() };
    const notifications = [newNotif, ...this.getNotifications()];
    setStorageItem('nexora_notifications', notifications);
    if (this.supabase) {
      this.supabase.from('notifications').upsert(mapNotificationToDb(newNotif)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createNotification error:', error);
      });
    }
    return newNotif;
  }

  markNotificationRead(id: string): void {
    const notifications = this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    setStorageItem('nexora_notifications', notifications);
    const updated = notifications.find(n => n.id === id);
    if (updated && this.supabase) {
      this.supabase.from('notifications').upsert(mapNotificationToDb(updated)).then(({ error }) => {
        if (error) console.error('[SUPABASE] markRead error:', error);
      });
    }
  }

  markAllNotificationsRead(userId: string): void {
    const notifications = this.getNotifications().map(n => n.userId === userId ? { ...n, read: true } : n);
    setStorageItem('nexora_notifications', notifications);
    if (this.supabase) {
      this.supabase.from('notifications').update({ read: true }).eq('user_id', userId).then(({ error }) => {
        if (error) console.error('[SUPABASE] markAllRead error:', error);
      });
    }
  }

  clearNotifications(userId: string): void {
    const notifications = this.getNotifications().filter(n => n.userId !== userId);
    setStorageItem('nexora_notifications', notifications);
    if (this.supabase) {
      this.supabase.from('notifications').delete().eq('user_id', userId).then(({ error }) => {
        if (error) console.error('[SUPABASE] clearNotifications error:', error);
      });
    }
  }

  // Notification Preferences
  getNotificationPreferences(): NotificationPreference[] {
    return getStorageItem<NotificationPreference[]>('nexora_notif_prefs', defaultPreferences);
  }

  getUserPreferences(userId: string): NotificationPreference {
    const prefs = this.getNotificationPreferences().find(p => p.userId === userId);
    if (!prefs) {
      const defaultPref: NotificationPreference = {
        userId,
        emailEnabled: true,
        inAppEnabled: true,
        meetingReminders: ['24H', '1H', '15M'],
        webinarReminders: ['24H', '1H']
      };
      const allPrefs = [...this.getNotificationPreferences(), defaultPref];
      setStorageItem('nexora_notif_prefs', allPrefs);
      return defaultPref;
    }
    return prefs;
  }

  updateUserPreferences(pref: NotificationPreference): void {
    const prefs = this.getNotificationPreferences().map(p => p.userId === pref.userId ? pref : p);
    setStorageItem('nexora_notif_prefs', prefs);
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStorageItem<AuditLog[]>('nexora_audit_logs', defaultAuditLogs);
  }

  createAuditLog(userId: string, userName: string, action: string, entity: string, entityId: string): void {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      action,
      entity,
      entityId,
      timestamp: new Date().toISOString()
    };
    const logs = [log, ...this.getAuditLogs()];
    setStorageItem('nexora_audit_logs', logs);
    if (this.supabase) {
      this.supabase.from('audit_logs').upsert(mapAuditLogToDb(log)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createAuditLog error:', error);
      });
    }
  }

  // Company Broadcast Messages
  getCompanyMessages(): CompanyMessage[] {
    const raw = getStorageItem<CompanyMessage[]>('nexora_company_messages', defaultCompanyMessages);
    if (!raw || raw.length === 0) {
      setStorageItem('nexora_company_messages', defaultCompanyMessages);
      return defaultCompanyMessages;
    }
    return raw;
  }

  createCompanyMessage(message: Omit<CompanyMessage, 'id' | 'createdAt'>): CompanyMessage {
    const id = `msg-${Date.now()}`;
    const newMsg: CompanyMessage = {
      ...message,
      id,
      createdAt: new Date().toISOString(),
      acknowledgments: message.acknowledgments || [],
      tags: message.tags || []
    };
    const messages = [newMsg, ...this.getCompanyMessages()];
    setStorageItem('nexora_company_messages', messages);
    if (this.supabase) {
      this.supabase.from('company_messages').upsert(mapCompanyMessageToDb(newMsg)).then(({ error }) => {
        if (error) console.error('[SUPABASE] createCompanyMessage error:', error);
      });
    }
    return newMsg;
  }

  acknowledgeCompanyMessage(messageId: string, userEmail: string): void {
    const messages = this.getCompanyMessages().map(m => {
      if (m.id === messageId) {
        const acks = m.acknowledgments || [];
        const alreadyAcked = acks.includes(userEmail);
        const updatedAcks = alreadyAcked 
          ? acks.filter(email => email !== userEmail) 
          : [...acks, userEmail];
        return { ...m, acknowledgments: updatedAcks };
      }
      return m;
    });
    setStorageItem('nexora_company_messages', messages);
    const updated = messages.find(m => m.id === messageId);
    if (updated && this.supabase) {
      this.supabase.from('company_messages').upsert(mapCompanyMessageToDb(updated)).then(({ error }) => {
        if (error) console.error('[SUPABASE] acknowledgeCompanyMessage error:', error);
      });
    }
  }

  deleteCompanyMessage(messageId: string): void {
    const messages = this.getCompanyMessages().filter(m => m.id !== messageId);
    setStorageItem('nexora_company_messages', messages);
    if (this.supabase) {
      this.supabase.from('company_messages').delete().eq('id', messageId).then(({ error }) => {
        if (error) console.error('[SUPABASE] deleteCompanyMessage error:', error);
      });
    }
  }
}
