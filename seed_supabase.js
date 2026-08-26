import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.trim().split('=');
  if (key === 'VITE_SUPABASE_URL') {
    supabaseUrl = valueParts.join('=').trim().replace(/['"]/g, '');
  } else if (key === 'VITE_SUPABASE_ANON_KEY') {
    supabaseKey = valueParts.join('=').trim().replace(/['"]/g, '');
  }
});

let correctedUrl = supabaseUrl;
if (supabaseUrl.includes('/rest/v1')) {
  correctedUrl = supabaseUrl.split('/rest/v1')[0];
}

const client = createClient(correctedUrl, supabaseKey);

// Define Mock Data matching original app defaults
const mockUsers = [
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

const mockWebinars = [
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
  }
];

const mockMeetings = [
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
    organizerId: 'contact@nexoratechs.com',
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
    participants: ['intern@nexora.com', 'mentor@nexora.com', 'contact@nexoratechs.com'],
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '10:00',
    platform: 'Zoom',
    url: 'https://zoom.us/meet-3',
    agenda: '1. Standup updates\n2. Blocking items discussion\n3. Staging releases verification',
    type: 'Team Meeting'
  }
];

const mockTickets = [
  {
    id: 'NX-10025',
    subject: 'OAuth2 Authentication Flow Malfunctioning',
    description: 'The OAuth flow fails to resolve code exchange on redirected domains. Getting a 400 Bad Request error intermittently.',
    category: 'Security / IAM',
    priority: 'HIGH',
    status: 'ASSIGNED',
    createdById: 'intern@nexora.com',
    assignedToId: 'contact@nexoratechs.com',
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-25T10:30:00Z'
  },
  {
    id: 'NX-10026',
    subject: 'Kubernetes HPA replica scaling delays',
    description: 'Horizontal Pod Autoscaler takes more than 5 minutes to trigger scaling metrics. Pod CPU thresholds are hit too early.',
    category: 'DevOps',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdById: 'employee@nexora.com',
    createdAt: '2026-08-25T09:30:00Z',
    updatedAt: '2026-08-25T09:30:00Z'
  }
];

const mockComments = [
  {
    id: 'c-1',
    ticketId: 'NX-10025',
    userId: 'contact@nexoratechs.com',
    userName: 'Administrator',
    userRole: 'ADMIN',
    comment: 'Looking into this. It appears your AD account was not mapped to the internship evaluation group. Will correct this shortly.',
    createdAt: '2026-08-25T10:15:00Z'
  },
  {
    id: 'c-2',
    ticketId: 'NX-10025',
    userId: 'intern@nexora.com',
    userName: 'Peter Parker',
    userRole: 'EMPLOYEE',
    comment: 'Thanks Sarah! Let me know if you need my student registration ID.',
    createdAt: '2026-08-25T10:30:00Z'
  }
];

const mockNotes = [
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
  }
];

const mockFeedbacks = [
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
  }
];

const mockAuditLogs = [
  {
    id: 'log-1',
    userId: 'contact@nexoratechs.com',
    userName: 'Administrator',
    action: 'CREATE_WEBINAR',
    entity: 'Webinar',
    entityId: 'web-3',
    timestamp: '2026-08-18T09:00:00Z'
  }
];

const mockCompanyMessages = [
  {
    id: 'msg-welcome-all',
    senderEmail: 'contact@nexoratechs.com',
    senderName: 'Administrator',
    senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    senderRole: 'ADMIN',
    title: '🌟 Welcome to Nexora Connect – Company-Wide Collaboration & Updates',
    content: 'Welcome to our centralized Nexora Connect company portal! All team members can now access interactive tech webinars, project calendars, recorded workshops, internal knowledge base, stress-relief mini-games, and company-wide broadcast alerts.',
    category: 'Company News',
    priority: 'NORMAL',
    targetAudience: 'ALL_EMPLOYEES',
    createdAt: new Date().toISOString(),
    pinned: true,
    acknowledgments: ['contact@nexoratechs.com', 'mentor@nexora.com', 'employee@nexora.com'],
    tags: ['Welcome', 'Company Update', 'Nexora Connect']
  }
];

// Mapping helper functions
function mapUserToDb(u) {
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

function mapWebinarToDb(w) {
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
    url: w.url,
    thumbnail: w.thumbnail,
    category: w.category,
    tags: JSON.stringify(w.tags),
    registration_deadline: w.registrationDeadline,
    max_participants: w.maxParticipants,
    status: w.status
  };
}

function mapMeetingToDb(m) {
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
    url: m.url,
    agenda: m.agenda,
    type: m.type
  };
}

function mapFeedbackToDb(f) {
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

function mapTicketToDb(t) {
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

function mapCommentToDb(c) {
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

function mapNoteToDb(n) {
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

function mapAuditLogToDb(a) {
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

function mapCompanyMessageToDb(m) {
  return {
    id: m.id,
    sender_email: m.senderEmail,
    sender_name: m.senderName,
    sender_avatar: m.senderAvatar || null,
    sender_role: m.senderRole || 'EMPLOYEE',
    title: m.title,
    content: m.content,
    category: m.category || 'General Update',
    priority: m.priority || 'NORMAL',
    target_audience: m.targetAudience || 'ALL_EMPLOYEES',
    created_at: m.createdAt,
    pinned: m.pinned || false,
    acknowledgments: JSON.stringify(m.acknowledgments || []),
    tags: JSON.stringify(m.tags || [])
  };
}

async function seed() {
  console.log('Starting Supabase Seeding...');

  // 1. Seed Users
  console.log('Seeding users...');
  const { error: usersError } = await client.from('users').upsert(mockUsers.map(mapUserToDb));
  if (usersError) console.error('Error seeding users:', usersError.message);
  else console.log('Successfully seeded users!');

  // 2. Seed Webinars
  console.log('Seeding webinars...');
  const { error: webError } = await client.from('webinars').upsert(mockWebinars.map(mapWebinarToDb));
  if (webError) console.error('Error seeding webinars:', webError.message);
  else console.log('Successfully seeded webinars!');

  // 3. Seed Meetings
  console.log('Seeding meetings...');
  const { error: meetError } = await client.from('meetings').upsert(mockMeetings.map(mapMeetingToDb));
  if (meetError) console.error('Error seeding meetings:', meetError.message);
  else console.log('Successfully seeded meetings!');

  // 4. Seed Tickets
  console.log('Seeding tickets...');
  const { error: ticketError } = await client.from('tickets').upsert(mockTickets.map(mapTicketToDb));
  if (ticketError) console.error('Error seeding tickets:', ticketError.message);
  else console.log('Successfully seeded tickets!');

  // 5. Seed Ticket Comments
  console.log('Seeding ticket comments...');
  const { error: commentError } = await client.from('ticket_comments').upsert(mockComments.map(mapCommentToDb));
  if (commentError) console.error('Error seeding comments:', commentError.message);
  else console.log('Successfully seeded comments!');

  // 6. Seed Knowledge Notes
  console.log('Seeding knowledge notes...');
  const { error: noteError } = await client.from('knowledge_notes').upsert(mockNotes.map(mapNoteToDb));
  if (noteError) console.error('Error seeding knowledge notes:', noteError.message);
  else console.log('Successfully seeded knowledge notes!');

  // 7. Seed Feedbacks
  console.log('Seeding feedbacks...');
  const { error: fbError } = await client.from('feedbacks').upsert(mockFeedbacks.map(mapFeedbackToDb));
  if (fbError) console.error('Error seeding feedbacks:', fbError.message);
  else console.log('Successfully seeded feedbacks!');

  // 8. Seed Audit Logs
  console.log('Seeding audit logs...');
  const { error: logError } = await client.from('audit_logs').upsert(mockAuditLogs.map(mapAuditLogToDb));
  if (logError) console.error('Error seeding audit logs:', logError.message);
  else console.log('Successfully seeded audit logs!');

  // 9. Seed Company Broadcast Messages
  console.log('Seeding company broadcast messages...');
  const { error: cmError } = await client.from('company_messages').upsert(mockCompanyMessages.map(mapCompanyMessageToDb));
  if (cmError) console.error('Error seeding company messages:', cmError.message);
  else console.log('Successfully seeded company messages!');

  console.log('Seeding completed!');
}

seed();
