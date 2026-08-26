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
    name: 'Admin',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    designation: 'Nexora Administrator',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'admin@nexora.com',
    email: 'admin@nexora.com',
    name: 'Sarah Connor',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    designation: 'Senior Operations Director',
    organization: 'Nexora Technologies'
  },
  {
    id: 'mentor@nexora.com',
    email: 'mentor@nexora.com',
    name: 'Dr. Alan Grant',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    designation: 'Lead AI Researcher',
    organization: 'Nexora Technologies'
  },
  {
    id: 'employee@nexora.com',
    email: 'employee@nexora.com',
    name: 'Alex Mercer',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    designation: 'Senior Backend Engineer',
    organization: 'Nexora Technologies'
  },
  {
    id: 'intern@nexora.com',
    email: 'intern@nexora.com',
    name: 'Peter Parker',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    designation: 'Frontend Intern',
    organization: 'Nexora Technologies'
  },
  {
    id: 'user@nexora.com',
    email: 'user@nexora.com',
    name: 'John Doe',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    designation: 'Guest Associate',
    organization: 'Nexora Technologies'
  }
];

const defaultWebinars: Webinar[] = [
  {
    id: 'web-1',
    title: 'AI in Modern Business & Enterprise Workflows',
    description: 'Explore the shift from narrow models to agentic AI workflows. We will examine how multi-agent frameworks are deployed in enterprise infrastructure to coordinate complex API actions, analyze performance bottlenecks, and automate knowledge lookup.',
    speaker: 'Dr. Alan Grant',
    speakerDesignation: 'Lead AI Researcher',
    speakerOrganization: 'Nexora Technologies',
    date: '2026-08-28',
    startTime: '19:00',
    endTime: '20:30',
    duration: 90,
    platform: 'Google Meet',
    url: 'https://meet.google.com/nex-ai-webinar',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'AI / ML',
    tags: ['AI', 'Business', 'Strategy', 'Agentic'],
    registrationDeadline: '2026-08-27',
    maxParticipants: 100,
    status: 'UPCOMING'
  },
  {
    id: 'web-2',
    title: 'Advanced React 19 Design Patterns',
    description: 'Learn how to leverage React Server Components, the new React Compiler, and hooks like useActionState, useFormStatus, and use. We will build a modular frontend dashboard showing practical use cases.',
    speaker: 'Akshaya Kumar',
    speakerDesignation: 'Tech Lead',
    speakerOrganization: 'Nexora Technologies',
    date: '2026-08-26',
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    platform: 'Zoom',
    url: 'https://zoom.us/j/nexora-react-19',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    category: 'Web Development',
    tags: ['React', 'Frontend', 'TypeScript', 'State'],
    registrationDeadline: '2026-08-25',
    maxParticipants: 150,
    status: 'LIVE'
  },
  {
    id: 'web-3',
    title: 'Cloud Security & Zero Trust Architecture',
    description: 'A comprehensive session covering security posture management, IAM policies, VPC design, and implementation of zero-trust authorization systems across serverless and container systems.',
    speaker: 'Sarah Connor',
    speakerDesignation: 'Senior Operations Director',
    speakerOrganization: 'Nexora Technologies',
    date: '2026-08-20',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    platform: 'MS Teams',
    url: 'https://teams.microsoft.com/nex-cloud-sec',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
    category: 'Cloud',
    tags: ['Security', 'AWS', 'Cloud', 'Zero Trust'],
    registrationDeadline: '2026-08-19',
    maxParticipants: 80,
    status: 'COMPLETED'
  },
  {
    id: 'web-4',
    title: 'Introduction to Rust Systems Programming',
    description: 'A deep-dive overview of Rust syntax, ownership model, borrowing guidelines, threads, concurrency safety, and building fast system binaries.',
    speaker: 'Linus Torvalds',
    speakerDesignation: 'Guest Kernel Maintainer',
    speakerOrganization: 'Linux Foundation',
    date: '2026-09-05',
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    platform: 'MS Teams',
    url: 'https://teams.microsoft.com/nex-rust-intro',
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600',
    category: 'Programming',
    tags: ['Rust', 'Systems', 'Backend'],
    registrationDeadline: '2026-09-04',
    maxParticipants: 200,
    status: 'CANCELLED'
  },
  {
    id: 'web-5',
    title: 'Kubernetes Orchestration & Scaling at Scale',
    description: 'This webinar focuses on advanced replica scaling, pod autoscaling (HPA/VPA), cluster architecture, networking interfaces, and load balancing configurations.',
    speaker: 'Devops Dave',
    speakerDesignation: 'Infrastructure Lead',
    speakerOrganization: 'Nexora Technologies',
    date: '2026-08-30',
    startTime: '11:00',
    endTime: '12:30',
    duration: 90,
    platform: 'Google Meet',
    url: 'https://meet.google.com/nex-k8s-scale',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600',
    category: 'DevOps',
    tags: ['Kubernetes', 'Docker', 'DevOps', 'Cloud'],
    registrationDeadline: '2026-08-29',
    maxParticipants: 120,
    status: 'UPCOMING'
  }
];

const defaultRegistrations: WebinarRegistration[] = [
  { id: 'reg-1', webinarId: 'web-1', userId: 'intern@nexora.com', registeredAt: '2026-08-25T10:00:00Z' },
  { id: 'reg-2', webinarId: 'web-1', userId: 'employee@nexora.com', registeredAt: '2026-08-25T11:00:00Z' },
  { id: 'reg-3', webinarId: 'web-2', userId: 'intern@nexora.com', registeredAt: '2026-08-25T09:30:00Z' },
  { id: 'reg-4', webinarId: 'web-3', userId: 'employee@nexora.com', registeredAt: '2026-08-18T14:00:00Z' }
];

const defaultMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Project Architecture Review',
    description: 'Detailed analysis of database entities, mock services, and component layout for Nexora Connect.',
    organizerId: 'mentor@nexora.com',
    participants: ['intern@nexora.com', 'employee@nexora.com'],
    date: '2026-08-26',
    startTime: '10:00',
    endTime: '11:00',
    platform: 'MS Teams',
    url: 'https://teams.microsoft.com/meet-1',
    agenda: '1. Relational schema walkthrough\n2. Service layers API design\n3. Front-end modules interaction',
    type: 'Mentor Meeting'
  },
  {
    id: 'meet-2',
    title: 'Sprint Planning & Backlog Grooming',
    description: 'Review backlog, estimate issues, and define the roadmap for the Nexora dashboard enhancements.',
    organizerId: 'admin@nexora.com',
    participants: ['employee@nexora.com', 'mentor@nexora.com', 'intern@nexora.com'],
    date: '2026-08-25',
    startTime: '15:00',
    endTime: '16:30',
    platform: 'Google Meet',
    url: 'https://meet.google.com/meet-2',
    agenda: '1. Review current velocity\n2. Story point backlog tasks\n3. Finalize sprint goal',
    type: 'Project Meeting'
  },
  {
    id: 'meet-3',
    title: 'Weekly Team Sync',
    description: 'Check progress across frontend modules and discuss devops infrastructure deployments.',
    organizerId: 'employee@nexora.com',
    participants: ['intern@nexora.com', 'mentor@nexora.com', 'admin@nexora.com'],
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '10:00',
    platform: 'Zoom',
    url: 'https://zoom.us/meet-3',
    agenda: '1. Standup updates\n2. Blocking items discussion\n3. Staging releases verification',
    type: 'Team Meeting'
  },
  {
    id: 'meet-4',
    title: 'Client Requirements Gathering',
    description: 'Onboard stakeholder requests and review final wireframes for client portal dashboard.',
    organizerId: 'admin@nexora.com',
    participants: ['employee@nexora.com'],
    date: '2026-08-27',
    startTime: '16:00',
    endTime: '17:00',
    platform: 'Zoom',
    url: 'https://zoom.us/meet-4',
    agenda: '1. Wireframe feedback review\n2. Integration scopes identification\n3. Milestones drafting',
    type: 'Client Meeting'
  },
  {
    id: 'meet-5',
    title: 'Internship Mid-Term Review',
    description: 'Detailed check-in to evaluate progress on assigned projects, mentorship milestones, and growth tracks.',
    organizerId: 'mentor@nexora.com',
    participants: ['intern@nexora.com'],
    date: '2026-08-29',
    startTime: '14:00',
    endTime: '15:00',
    platform: 'Google Meet',
    url: 'https://meet.google.com/meet-5',
    agenda: '1. Evaluation of completed features\n2. Feedback collection\n3. Task allocation for next 4 weeks',
    type: 'Review'
  }
];

const defaultRecordings: Recording[] = [
  {
    id: 'rec-1',
    title: 'Database Optimization Techniques',
    date: '2026-08-15',
    duration: '45:00',
    organizer: 'Alex Mercer',
    participants: ['Interns', 'Devs'],
    recordingUrl: 'https://demo.nexora.com/recordings/db-opt.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    description: 'Learn how to index tables, optimize queries, and analyze explain plans in PostgreSQL. Excellent for backend tuning.',
    topics: ['PostgreSQL', 'Indexing', 'Query Planning', 'EXPLAIN ANALYZE'],
    tags: ['Database', 'Backend', 'Performance']
  },
  {
    id: 'rec-2',
    title: 'Microservices Architecture Deep Dive',
    date: '2026-08-18',
    duration: '1:15:30',
    organizer: 'Dr. Alan Grant',
    participants: ['Engineering Team'],
    recordingUrl: 'https://demo.nexora.com/recordings/microservices.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    description: 'Deep dive into service discovery, API gateways, event sourcing, and Apache Kafka integration for real-time messaging.',
    topics: ['Microservices', 'Kafka', 'API Gateway', 'Event Sourcing'],
    tags: ['Architecture', 'Backend', 'DevOps']
  },
  {
    id: 'rec-3',
    title: 'UX Design Principles for Developers',
    date: '2026-08-10',
    duration: '50:15',
    organizer: 'Sarah Connor',
    participants: ['Frontend Team', 'Interns'],
    recordingUrl: 'https://demo.nexora.com/recordings/ux-devs.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400',
    description: 'A guide to grid alignments, typography hierarchy, contrast ratios, and building intuitive user dashboards.',
    topics: ['Design Systems', 'UX', 'Typography', 'Aesthetics'],
    tags: ['Frontend', 'UI/UX', 'Design']
  },
  {
    id: 'rec-4',
    title: 'Tailwind CSS Best Practices',
    date: '2026-08-22',
    duration: '35:40',
    organizer: 'Alex Mercer',
    participants: ['All Developers'],
    recordingUrl: 'https://demo.nexora.com/recordings/tailwind.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400',
    description: 'How to use custom configurations, arbitrary variants, container queries, and keeping bundle sizes minimal.',
    topics: ['Tailwind CSS', 'Vite', 'CSS variables', 'Optimization'],
    tags: ['CSS', 'Frontend', 'Styling']
  },
  {
    id: 'rec-5',
    title: 'Intro to Docker & Containers',
    date: '2026-08-05',
    duration: '1:02:10',
    organizer: 'Devops Dave',
    participants: ['Interns'],
    recordingUrl: 'https://demo.nexora.com/recordings/docker-intro.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400',
    description: 'Understanding Dockerfiles, image caching, volume mounting, network bridges, and Docker Compose workflows.',
    topics: ['Docker', 'Containers', 'Volumes', 'Docker Compose'],
    tags: ['DevOps', 'Docker', 'Containers']
  }
];

const defaultTickets: Ticket[] = [
  {
    id: 'NX-10025',
    subject: 'Unable to access internship portal evaluation panel',
    description: 'Getting a 403 Forbidden error screen when trying to access the internal evaluations boards. I need to review task grades.',
    category: 'Access Issue',
    priority: 'HIGH',
    status: 'IN PROGRESS',
    createdById: 'intern@nexora.com',
    assignedToId: 'admin@nexora.com',
    createdAt: '2026-08-24T09:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'NX-10026',
    subject: 'Docker Desktop corporate license subscription issue',
    description: 'My Docker Desktop application subscription shows expired today. Need an updated corporate enterprise key or renewal authorization.',
    category: 'Technical',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    createdById: 'employee@nexora.com',
    assignedToId: 'admin@nexora.com',
    createdAt: '2026-08-25T08:30:00Z',
    updatedAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'NX-10027',
    subject: 'Database connection timeout on staging env',
    description: 'The staging DB cluster is throwing connection timeout exceptions during automated load simulations (1000 requests/sec). Needs scaling check.',
    category: 'Technical',
    priority: 'URGENT',
    status: 'OPEN',
    createdById: 'employee@nexora.com',
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-08-25T14:00:00Z'
  },
  {
    id: 'NX-10028',
    subject: 'VPN access configuration for remote workspace',
    description: 'Requesting VPN certificate renewal for the new office laptop. Old certificate expires this weekend.',
    category: 'Access Issue',
    priority: 'LOW',
    status: 'RESOLVED',
    createdById: 'employee@nexora.com',
    assignedToId: 'admin@nexora.com',
    createdAt: '2026-08-22T10:00:00Z',
    updatedAt: '2026-08-24T16:00:00Z'
  },
  {
    id: 'NX-10029',
    subject: 'HR health benefits onboarding documents missing',
    description: 'Please send the health benefits enrollment form. I did not receive it in my onboarding packet when I joined as an intern last week.',
    category: 'HR',
    priority: 'LOW',
    status: 'CLOSED',
    createdById: 'intern@nexora.com',
    assignedToId: 'admin@nexora.com',
    createdAt: '2026-08-19T09:00:00Z',
    updatedAt: '2026-08-22T11:00:00Z'
  },
  {
    id: 'NX-10030',
    subject: 'Figma editor seat permission request',
    description: 'Need edit access to the main dashboard design file on Figma. Currently my account only has view permissions.',
    category: 'Project',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdById: 'employee@nexora.com',
    createdAt: '2026-08-25T19:30:00Z',
    updatedAt: '2026-08-25T19:30:00Z'
  },
  {
    id: 'NX-10031',
    subject: 'Webinar link expired or invalid on dashboard',
    description: 'The link to join the "Advanced React 19 Patterns" webinar says link expired or not started, even though it is active now. Please verify URL.',
    category: 'Webinar',
    priority: 'HIGH',
    status: 'WAITING FOR USER',
    createdById: 'user@nexora.com',
    assignedToId: 'mentor@nexora.com',
    createdAt: '2026-08-25T14:15:00Z',
    updatedAt: '2026-08-25T15:30:00Z'
  },
  {
    id: 'NX-10032',
    subject: 'Requesting Mentor review on final project plan',
    description: 'Please check the final schema design and flowcharts for the Connect API. I uploaded them in the documentation folder.',
    category: 'Internship',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdById: 'intern@nexora.com',
    assignedToId: 'mentor@nexora.com',
    createdAt: '2026-08-23T11:00:00Z',
    updatedAt: '2026-08-25T09:00:00Z'
  }
];

const defaultComments: TicketComment[] = [
  {
    id: 'c-1',
    ticketId: 'NX-10025',
    userId: 'admin@nexora.com',
    userName: 'Sarah Connor',
    userRole: 'ADMIN',
    comment: 'Looking into this. It appears your AD account was not mapped to the internship evaluation group. Will correct this shortly.',
    createdAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'c-2',
    ticketId: 'NX-10025',
    userId: 'intern@nexora.com',
    userName: 'Peter Parker',
    userRole: 'INTERN',
    comment: 'Thanks Sarah! Let me know if you need my student registration ID.',
    createdAt: '2026-08-25T10:30:00Z'
  },
  {
    id: 'c-3',
    ticketId: 'NX-10025',
    userId: 'admin@nexora.com',
    userName: 'Sarah Connor',
    userRole: 'ADMIN',
    comment: 'I mapped the roles. Can you sign out and sign back in to verify?',
    createdAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'c-4',
    ticketId: 'NX-10031',
    userId: 'mentor@nexora.com',
    userName: 'Dr. Alan Grant',
    userRole: 'MENTOR',
    comment: 'Apologies. The host key had to be reset. I updated the join link details. Please click the join button again.',
    createdAt: '2026-08-25T15:00:00Z'
  },
  {
    id: 'c-5',
    ticketId: 'NX-10031',
    userId: 'user@nexora.com',
    userName: 'John Doe',
    userRole: 'USER',
    comment: 'It still shows an empty screen. Do I need to enter a meeting passcode?',
    createdAt: '2026-08-25T15:30:00Z'
  }
];

const defaultKnowledgeNotes: KnowledgeNote[] = [
  {
    id: 'note-1',
    title: 'Building REST APIs with Node.js & Express',
    content: 'A comprehensive guide to structured API architecture in corporate apps.\n\n### 1. Project Organization\nKeep your route handlers, business logic, and database layer separated:\n* `/routes` - Declares HTTP paths\n* `/controllers` - Orchestrates input verification & response codes\n* `/services` - Executes queries & communicates with DB\n\n### 2. Express Error Middleware\nAlways catch errors using global middleware:\n```javascript\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({ error: "Something broke!" });\n});\n```',
    authorId: 'employee@nexora.com',
    authorName: 'Alex Mercer',
    category: 'Backend',
    tags: ['Node.js', 'API', 'Express', 'JavaScript'],
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    status: 'PUBLISHED',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-21T09:00:00Z',
    views: 154,
    helpfulVotes: 32,
    bookmarksCount: 12
  },
  {
    id: 'note-2',
    title: 'React 19: What\'s New and How to Use It',
    content: 'An internal summary of React 19 features relevant to Nexora frontend projects.\n\n### Core Features\n* **React Compiler**: Automatically memoizes component trees without `useMemo` or `useCallback`!\n* **Form Actions**: Simplifies form submissions using actions passed directly to `<form action={handleSubmit}>`.\n* **The use() Hook**: Resolves promises and read context dynamically during rendering.',
    authorId: 'intern@nexora.com',
    authorName: 'Peter Parker',
    category: 'Frontend',
    tags: ['React', 'Frontend', 'TypeScript', 'Web'],
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    status: 'PUBLISHED',
    createdAt: '2026-08-25T09:30:00Z',
    updatedAt: '2026-08-25T09:30:00Z',
    views: 98,
    helpfulVotes: 18,
    bookmarksCount: 7
  },
  {
    id: 'note-3',
    title: 'Introduction to LLMs and RAG Systems',
    content: 'How Retrieval Augmented Generation is key for enterprise AI integrations.\n\n### Context Limitation\nLLMs cannot know about internal company PDFs and secrets. RAG solves this by:\n1. Chunking documents.\n2. Converting text chunks into embedding vectors using OpenAI or Cohere.\n3. Storing vectors in databases like pgvector or Pinecone.\n4. When a user asks a question, we run semantic similarity matches, extract the most relevant chunks, and inject them as context into the prompt.',
    authorId: 'mentor@nexora.com',
    authorName: 'Dr. Alan Grant',
    category: 'AI / ML',
    tags: ['AI', 'LLM', 'RAG', 'Vector Database'],
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    status: 'PUBLISHED',
    createdAt: '2026-08-25T10:15:00Z',
    updatedAt: '2026-08-25T10:15:00Z',
    views: 210,
    helpfulVotes: 56,
    bookmarksCount: 25
  },
  {
    id: 'note-4',
    title: 'Git Rebase vs. Merge: A Visual Guideline',
    content: 'Clear explanation of when to merge vs. when to rebase.\n\n* **Merge**: Preserves complete history showing exact branches. Good for releases and main lines.\n* **Rebase**: Rewrites project history to create a clean, linear chain of commits. Excellent for feature branch cleanups before PR approval.',
    authorId: 'employee@nexora.com',
    authorName: 'Alex Mercer',
    category: 'Programming',
    tags: ['Git', 'Workflow', 'VCS'],
    status: 'PUBLISHED',
    createdAt: '2026-08-24T14:22:00Z',
    updatedAt: '2026-08-24T14:22:00Z',
    views: 142,
    helpfulVotes: 40,
    bookmarksCount: 18
  },
  {
    id: 'note-5',
    title: 'Dockerizing a Node.js Application',
    content: 'Best practices for writing multi-stage Dockerfiles, optimizing image sizes, and using non-root users for production deployment.\n\n```dockerfile\n# Stage 1: Build\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n```',
    authorId: 'employee@nexora.com',
    authorName: 'Alex Mercer',
    category: 'DevOps',
    tags: ['Docker', 'DevOps', 'Node.js'],
    status: 'PUBLISHED',
    createdAt: '2026-08-15T12:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z',
    views: 76,
    helpfulVotes: 12,
    bookmarksCount: 5
  },
  {
    id: 'note-6',
    title: 'Modern CSS Grid & Flexbox Layouts',
    content: 'Interactive grid alignments and custom styles. Draft note detailing CSS tricks for cards grids.',
    authorId: 'intern@nexora.com',
    authorName: 'Peter Parker',
    category: 'Frontend',
    tags: ['CSS', 'Layout', 'Flexbox'],
    status: 'DRAFT',
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z',
    views: 0,
    helpfulVotes: 0,
    bookmarksCount: 0
  },
  {
    id: 'note-7',
    title: 'AWS Lambda: Serverless Architecture Guide',
    content: 'Getting started with micro-functions on AWS. Managing cold starts, environment variables, API Gateway integrations, and IAM execution roles.',
    authorId: 'mentor@nexora.com',
    authorName: 'Dr. Alan Grant',
    category: 'Cloud',
    tags: ['AWS', 'Serverless', 'Lambda'],
    status: 'PUBLISHED',
    createdAt: '2026-08-21T15:30:00Z',
    updatedAt: '2026-08-21T15:30:00Z',
    views: 89,
    helpfulVotes: 22,
    bookmarksCount: 9
  },
  {
    id: 'note-8',
    title: 'Cybersecurity 101: Securing Internal API Gateways',
    content: 'Essential tips for rate limiting, JWT token verification, secret rotation, and avoiding SQL injection vectors.',
    authorId: 'employee@nexora.com',
    authorName: 'Alex Mercer',
    category: 'Cybersecurity',
    tags: ['Security', 'API', 'OAuth', 'JWT'],
    status: 'PENDING_APPROVAL',
    createdAt: '2026-08-25T18:00:00Z',
    updatedAt: '2026-08-25T18:00:00Z',
    views: 0,
    helpfulVotes: 0,
    bookmarksCount: 0
  },
  {
    id: 'note-9',
    title: 'Preparing for Frontend Intern Interviews',
    content: 'Common DOM manipulation questions, closure puzzles, and building custom hooks in React. A checklist for incoming guidelines.',
    authorId: 'intern@nexora.com',
    authorName: 'Peter Parker',
    category: 'Career',
    tags: ['Career', 'Interview', 'JavaScript', 'React'],
    status: 'PUBLISHED',
    createdAt: '2026-08-24T16:00:00Z',
    updatedAt: '2026-08-24T16:00:00Z',
    views: 120,
    helpfulVotes: 45,
    bookmarksCount: 22
  },
  {
    id: 'note-10',
    title: 'Nexora Onboarding & Coding Standards',
    content: 'Welcome! Standard directory structures, naming conventions, ESLint configs, Git commit message conventions (Conventional Commits), and staging deployment pipelines at Nexora Technologies.',
    authorId: 'admin@nexora.com',
    authorName: 'Sarah Connor',
    category: 'Company Knowledge',
    tags: ['Onboarding', 'Standards', 'Nexora', 'Guidelines'],
    status: 'PUBLISHED',
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-18T09:00:00Z',
    views: 340,
    helpfulVotes: 89,
    bookmarksCount: 54
  }
];

const defaultBookmarks: Bookmark[] = [
  { id: 'b-1', userId: 'intern@nexora.com', noteId: 'note-1' },
  { id: 'b-2', userId: 'intern@nexora.com', noteId: 'note-3' },
  { id: 'b-3', userId: 'employee@nexora.com', noteId: 'note-10' }
];

const defaultNotifications: Notification[] = [
  {
    id: 'n-1',
    userId: 'intern@nexora.com',
    title: 'Upcoming Meeting Reminder',
    message: 'Reminder: Project Architecture Review starts tomorrow at 10:00 AM.',
    type: 'MEETING_REMINDER',
    read: false,
    createdAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'n-2',
    userId: 'intern@nexora.com',
    title: 'Meeting Alert',
    message: 'Your Weekly Team Sync starts in 15 minutes.',
    type: 'MEETING_REMINDER',
    read: true,
    createdAt: '2026-08-24T08:45:00Z'
  },
  {
    id: 'n-3',
    userId: 'employee@nexora.com',
    title: 'Webinar Alert',
    message: 'Webinar "Advanced React 19 Patterns" starts in 1 hour.',
    type: 'WEBINAR_REMINDER',
    read: false,
    createdAt: '2026-08-26T13:00:00Z'
  },
  {
    id: 'n-4',
    userId: 'intern@nexora.com',
    title: 'Ticket Priority Escalated',
    message: 'Ticket NX-10025 priority updated to HIGH by Admin Sarah Connor.',
    type: 'TICKET_UPDATE',
    read: false,
    createdAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'n-5',
    userId: 'employee@nexora.com',
    title: 'New Knowledge Note Published',
    message: 'Dr. Alan Grant published a new note: Introduction to LLMs and RAG Systems.',
    type: 'NEW_KNOWLEDGE_NOTE',
    read: true,
    createdAt: '2026-08-25T10:15:00Z'
  },
  {
    id: 'n-6',
    userId: 'admin@nexora.com',
    title: 'Announcement',
    message: 'Nexora Connect internal portal is now live! Learn, Collaborate, Share, and Grow.',
    type: 'ANNOUNCEMENT',
    read: true,
    createdAt: '2026-08-25T08:00:00Z'
  },
  {
    id: 'n-7',
    userId: 'employee@nexora.com',
    title: 'Ticket Marked Resolved',
    message: 'Ticket NX-10028 marked as RESOLVED by Admin.',
    type: 'TICKET_UPDATE',
    read: true,
    createdAt: '2026-08-24T16:00:00Z'
  },
  {
    id: 'n-8',
    userId: 'intern@nexora.com',
    title: 'Webinar Registered',
    message: 'Registration confirmed for webinar "AI in Modern Business & Enterprise Workflows".',
    type: 'WEBINAR_REMINDER',
    read: false,
    createdAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'n-9',
    userId: 'admin@nexora.com',
    title: 'Support Ticket Assigned',
    message: 'Ticket NX-10026 assigned to Sarah Connor.',
    type: 'TICKET_UPDATE',
    read: true,
    createdAt: '2026-08-25T10:00:00Z'
  },
  {
    id: 'n-10',
    userId: 'intern@nexora.com',
    title: 'New Knowledge Note Published',
    message: 'Sarah Connor published: Nexora Onboarding & Coding Standards.',
    type: 'NEW_KNOWLEDGE_NOTE',
    read: false,
    createdAt: '2026-08-18T09:00:00Z'
  }
];

const defaultPreferences: NotificationPreference[] = [
  {
    userId: 'intern@nexora.com',
    emailEnabled: true,
    inAppEnabled: true,
    meetingReminders: ['24H', '1H', '15M'],
    webinarReminders: ['24H', '1H']
  },
  {
    userId: 'employee@nexora.com',
    emailEnabled: true,
    inAppEnabled: true,
    meetingReminders: ['24H', '1H'],
    webinarReminders: ['24H', '1H']
  },
  {
    userId: 'admin@nexora.com',
    emailEnabled: true,
    inAppEnabled: true,
    meetingReminders: ['24H'],
    webinarReminders: ['24H']
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'admin@nexora.com',
    userName: 'Sarah Connor',
    action: 'CREATE_WEBINAR',
    entity: 'Webinar',
    entityId: 'web-3',
    timestamp: '2026-08-18T09:00:00Z'
  },
  {
    id: 'log-2',
    userId: 'mentor@nexora.com',
    userName: 'Dr. Alan Grant',
    action: 'CREATE_MEETING',
    entity: 'Meeting',
    entityId: 'meet-1',
    timestamp: '2026-08-25T09:00:00Z'
  },
  {
    id: 'log-3',
    userId: 'admin@nexora.com',
    userName: 'Sarah Connor',
    action: 'ASSIGN_TICKET',
    entity: 'Ticket',
    entityId: 'NX-10025',
    timestamp: '2026-08-25T10:00:00Z'
  },
  {
    id: 'log-4',
    userId: 'admin@nexora.com',
    userName: 'Sarah Connor',
    action: 'APPROVE_KNOWLEDGE_NOTE',
    entity: 'KnowledgeNote',
    entityId: 'note-2',
    timestamp: '2026-08-25T09:30:00Z'
  }
];

const defaultFeedbacks: Feedback[] = [
  {
    id: 'fb-1',
    targetId: 'web-3',
    targetType: 'webinar',
    userId: 'employee@nexora.com',
    ratingOverall: 5,
    ratingContent: 5,
    ratingSpeaker: 5,
    ratingUsefulness: 5,
    commentUseful: 'The zero trust IAM models were very clearly explained with templates.',
    commentImprove: 'Could include more cloud platform comparisons.',
    recommend: true,
    submittedAt: '2026-08-20T12:00:00Z'
  },
  {
    id: 'fb-2',
    targetId: 'meet-3',
    targetType: 'meeting',
    userId: 'intern@nexora.com',
    ratingOverall: 4,
    ratingContent: 4,
    ratingSpeaker: 4,
    ratingUsefulness: 4,
    commentUseful: 'Aligning frontend timelines helped unblock my dashboard features.',
    commentImprove: 'Meeting could have been slightly shorter.',
    recommend: true,
    submittedAt: '2026-08-24T10:15:00Z'
  }
];

// ----------------------------------------------------
// STORAGE HELPER METHODS
// ----------------------------------------------------

function getStorageItem<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data) as T;
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
    organization: u.organization || 'Nexora Technologies'
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

// ----------------------------------------------------
// DATABASE SERVICE CLASS
// ----------------------------------------------------

export class NexoraDatabase {
  private supabaseUrl: string | null = null;
  private supabaseKey: string | null = null;
  private supabase: SupabaseClient | null = null;
  private onSyncCallback: (() => void) | null = null;

  constructor() {
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

      console.log('[SUPABASE] Sync success! Client local cache updated.');
      if (this.onSyncCallback) {
        this.onSyncCallback();
      }
    } catch (e) {
      console.error('[SUPABASE] Sync query error:', e);
    }
  }

  // Users
  getUsers(): User[] {
    const rawUsers = getStorageItem<User[]>('nexora_users', defaultUsers);
    // Merge defaults to ensure new defaults are present, then deduplicate by email
    const merged = [...defaultUsers, ...rawUsers];
    const uniqueMap = new Map<string, User>();
    merged.forEach(u => {
      if (u.email) {
        uniqueMap.set(u.email.toLowerCase(), u);
      }
    });
    const uniqueUsers = Array.from(uniqueMap.values());
    setStorageItem('nexora_users', uniqueUsers);
    return uniqueUsers;
  }

  getUser(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
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
}
