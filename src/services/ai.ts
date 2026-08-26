import type { KnowledgeNote, Webinar } from './database';

export interface AICategorization {
  category: 'Technical' | 'Access Issue' | 'Internship' | 'Project' | 'HR' | 'Training' | 'Meeting' | 'Webinar' | 'Other';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  confidence: number;
  reasoning: string;
}

export interface AISummary {
  summary: string;
  actionItems: string[];
  keyTopics: string[];
}

export class AIService {
  /**
   * Automatically classify support tickets based on title and description.
   * This is a mock AI classification pipeline demonstrating natural text parsing.
   */
  static async classifyTicket(subject: string, description: string): Promise<AICategorization> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const text = (subject + ' ' + description).toLowerCase();
    let category: AICategorization['category'] = 'Other';
    let priority: AICategorization['priority'] = 'MEDIUM';
    let reasoning = 'The request was classified based on standard text keyword routing maps.';
    let confidence = 0.85;

    // Categorization rules
    if (text.includes('vpn') || text.includes('access') || text.includes('forbidden') || text.includes('permission') || text.includes('login') || text.includes('credentials') || text.includes('password') || text.includes('license')) {
      category = 'Access Issue';
      reasoning = 'Detected credential, permission, or login access descriptors.';
      priority = text.includes('expired') || text.includes('urgent') ? 'HIGH' : 'MEDIUM';
    } else if (text.includes('db') || text.includes('database') || text.includes('timeout') || text.includes('crash') || text.includes('slow') || text.includes('server') || text.includes('docker') || text.includes('connection')) {
      category = 'Technical';
      reasoning = 'Detected infrastructure, database, server runtime, or docker container terms.';
      priority = text.includes('timeout') || text.includes('prod') || text.includes('down') ? 'URGENT' : 'HIGH';
    } else if (text.includes('salary') || text.includes('health') || text.includes('onboard') || text.includes('benefits') || text.includes('leave') || text.includes('hr')) {
      category = 'HR';
      reasoning = 'Corresponds to internal HR onboarding, benefits, or employee resources.';
      priority = 'LOW';
    } else if (text.includes('intern') || text.includes('mentor') || text.includes('grade') || text.includes('evaluation')) {
      category = 'Internship';
      reasoning = 'Mapped to intern evaluation guidelines and mentor checkins.';
      priority = 'MEDIUM';
    } else if (text.includes('figma') || text.includes('wireframe') || text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('project')) {
      category = 'Project';
      reasoning = 'Matches client wireframe styling or project sprint scopes.';
      priority = 'MEDIUM';
    }

    // Urgent keyword triggers
    if (text.includes('urgent') || text.includes('critical') || text.includes('immediate') || text.includes('production down') || text.includes('timeout')) {
      priority = 'URGENT';
      confidence = 0.94;
      reasoning += ' Priority boosted due to critical timing keywords (urgent/critical/down).';
    }

    return { category, priority, confidence, reasoning };
  }

  /**
   * Simulates AI meeting notes and action items extractor.
   */
  static async generateMeetingSummary(transcriptText: string): Promise<AISummary> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // If transcript is small or empty, return standard template
    if (!transcriptText || transcriptText.trim().length < 20) {
      return {
        summary: 'Review of project roadmap, sprint deliverables, and testing procedures. Team aligned on upcoming release tags.',
        keyTopics: ['Sprint Milestones', 'Code Quality & Linting', 'Deployment Schedules'],
        actionItems: [
          'Alex to upgrade PostgreSQL database index maps by Friday.',
          'Peter to resolve frontend dashboard layout issues before staging demo.',
          'Sarah to audit user onboarding credentials lists.'
        ]
      };
    }

    // Mock parsing based on words
    const lower = transcriptText.toLowerCase();
    const topics: string[] = ['General Project Alignment'];
    const actions: string[] = ['Assign ownership tasks for pending blockers.'];

    if (lower.includes('database') || lower.includes('postgres') || lower.includes('query')) {
      topics.push('Database Index Optimization');
      actions.push('Schedule query analyzer profile scan (Alex).');
    }
    if (lower.includes('react') || lower.includes('frontend') || lower.includes('css')) {
      topics.push('React Component Layout refactor');
      actions.push('Implement responsive dashboard layout components (Peter).');
    }
    if (lower.includes('security') || lower.includes('vpn') || lower.includes('key')) {
      topics.push('Zero-Trust Token Security');
      actions.push('Renew corporate VPN access keys (Sarah).');
    }

    return {
      summary: `Automated summary of session notes: The team discussed critical items including ${topics.join(', ').toLowerCase()}. Blockers were identified and individual task owners were assigned to maintain velocity.`,
      keyTopics: topics,
      actionItems: actions
    };
  }

  /**
   * Simulates Vector Embeddings semantic search across knowledge base notes.
   */
  static async searchKnowledgeBase(query: string, notes: KnowledgeNote[]): Promise<KnowledgeNote[]> {
    if (!query || query.trim() === '') return notes;
    
    // Simulate embeddings search delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) {
      return notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()));
    }

    const scoredNotes = notes.map(note => {
      let score = 0;
      const title = note.title.toLowerCase();
      const content = note.content.toLowerCase();
      const cat = note.category.toLowerCase();
      const tags = note.tags.map(t => t.toLowerCase());

      words.forEach(word => {
        if (title.includes(word)) score += 10;
        if (content.includes(word)) score += 2;
        if (cat.includes(word)) score += 5;
        if (tags.some(t => t.includes(word))) score += 5;
      });

      return { note, score };
    });

    return scoredNotes
      .filter(sn => sn.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(sn => sn.note);
  }

  /**
   * Generates AI based learning recommendations for a user based on categories they read most.
   */
  static async generateWebinarRecommendation(
    userEmail: string,
    _webNotes: KnowledgeNote[],
    webinars: Webinar[]
  ): Promise<Webinar[]> {
    // Recommend upcoming webinars matching categories in user notes or general interests.
    // In our simulator: ADMIN/MENTOR -> AI and DevOps. INTERN/EMPLOYEE -> Frontend/Backend.
    const upcoming = webinars.filter(w => w.status === 'UPCOMING');
    
    if (userEmail.includes('admin') || userEmail.includes('mentor')) {
      return upcoming.filter(w => w.category === 'AI / ML' || w.category === 'DevOps');
    }
    
    return upcoming.filter(w => w.category === 'Web Development' || w.category === 'AI / ML' || w.category === 'Programming');
  }
}
