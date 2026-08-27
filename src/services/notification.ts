import { NexoraDatabase } from './database';
import type { CompanyMessage } from './database';
import { EmailService } from './email';

export class NotificationDispatcher {
  private db: NexoraDatabase;

  constructor(db: NexoraDatabase) {
    this.db = db;
  }

  /**
   * Dispatches a notification to a user.
   * Creates an in-app notification, and check preferences to send a simulated email.
   */
  private notifyUser(
    targetUserId: string,
    title: string,
    message: string,
    type: 'MEETING_REMINDER' | 'WEBINAR_REMINDER' | 'TICKET_UPDATE' | 'NEW_KNOWLEDGE_NOTE' | 'ANNOUNCEMENT',
    sendEmailCallback: () => void
  ) {
    // 1. Create In-App Notification in DB
    this.db.createNotification(targetUserId, title, message, type);

    // 2. Read preferences to determine email simulation
    const prefs = this.db.getUserPreferences(targetUserId);
    if (prefs.emailEnabled) {
      sendEmailCallback();
    }
  }

  // 1. Webinar Registration Confirmation
  dispatchWebinarRegistration(userId: string, webinarId: string) {
    const user = this.db.getUser(userId);
    const webinar = this.db.getWebinars().find(w => w.id === webinarId);

    if (user && webinar) {
      const dateTimeStr = `${webinar.date} at ${webinar.startTime}`;
      this.notifyUser(
        userId,
        'Webinar Registration Confirmed',
        `You have successfully registered for the webinar: "${webinar.title}".`,
        'WEBINAR_REMINDER',
        () => {
          EmailService.sendWebinarRegistrationConfirm(
            user.email,
            user.name,
            webinar.title,
            dateTimeStr,
            webinar.url
          );
        }
      );
    }
  }

  // 2. Meeting Creation Invitation
  dispatchMeetingInvitation(meetingId: string) {
    const meetings = this.db.getMeetings();
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const organizer = this.db.getUser(meeting.organizerId) || { name: meeting.organizerId };
    const dateTimeStr = `${meeting.date} at ${meeting.startTime}`;

    meeting.participants.forEach(participantEmail => {
      const participant = this.db.getUser(participantEmail);
      if (participant) {
        this.notifyUser(
          participant.email,
          'New Meeting Scheduled',
          `You have been invited to a meeting: "${meeting.title}" by ${organizer.name}.`,
          'MEETING_REMINDER',
          () => {
            EmailService.sendMeetingInvitation(
              participant.email,
              participant.name,
              meeting.title,
              dateTimeStr,
              organizer.name,
              meeting.url
            );
          }
        );
      }
    });
  }

  // 3. Meeting Reminders (24H, 1H, 15M before)
  dispatchMeetingReminder(meetingId: string, alertType: '24H' | '1H' | '15M') {
    const meeting = this.db.getMeetings().find(m => m.id === meetingId);
    if (!meeting) return;

    let timeText = 'soon';
    if (alertType === '24H') timeText = 'tomorrow at ' + meeting.startTime;
    if (alertType === '1H') timeText = 'in 1 hour';
    if (alertType === '15M') timeText = 'in 15 minutes';

    const title = alertType === '15M' ? 'Meeting Starting in 15 Minutes' : 'Upcoming Meeting Reminder';
    const message = `Reminder: Meeting "${meeting.title}" starts ${timeText}.`;

    meeting.participants.forEach(participantEmail => {
      const participant = this.db.getUser(participantEmail);
      if (participant) {
        // Verify preference allows this specific timeline
        const prefs = this.db.getUserPreferences(participant.email);
        if (prefs.meetingReminders.includes(alertType)) {
          this.notifyUser(
            participant.email,
            title,
            message,
            'MEETING_REMINDER',
            () => {
              EmailService.sendMeetingReminder(
                participant.email,
                participant.name,
                meeting.title,
                `${meeting.date} at ${meeting.startTime}`,
                meeting.url
              );
            }
          );
        }
      }
    });
  }

  // 4. Ticket Created Confirmation
  dispatchTicketCreated(ticketId: string) {
    const ticket = this.db.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;

    const creator = this.db.getUser(ticket.createdById);
    if (creator) {
      // 1. Notify Creator (Email Confirmation)
      this.notifyUser(
        creator.email,
        'Support Ticket Created',
        `Your ticket ${ticket.id} was logged successfully.`,
        'TICKET_UPDATE',
        () => {
          EmailService.sendTicketCreated(
            creator.email,
            creator.name,
            ticket.id,
            ticket.subject,
            ticket.priority
          );
        }
      );
    }

    // 2. Notify Admins in-app
    const admins = this.db.getUsers().filter(u => u.role === 'ADMIN');
    admins.forEach(admin => {
      this.db.createNotification(
        admin.email,
        'New Ticket Raised',
        `Ticket ${ticket.id} has been raised by ${creator ? creator.name : ticket.createdById}.`,
        'TICKET_UPDATE'
      );
    });
  }

  // 5. Ticket Status Changed
  dispatchTicketStatusUpdate(ticketId: string, oldStatus: string, newStatus: string, actingUserName: string) {
    const ticket = this.db.getTickets().find(t => t.id === ticketId);
    if (!ticket) return;

    const owner = this.db.getUser(ticket.createdById);
    if (owner) {
      this.notifyUser(
        owner.email,
        'Ticket Status Updated',
        `Ticket ${ticket.id} changed status to ${newStatus} (updated by ${actingUserName}).`,
        'TICKET_UPDATE',
        () => {
          EmailService.sendTicketStatusUpdate(
            owner.email,
            owner.name,
            ticket.id,
            ticket.subject,
            oldStatus,
            newStatus
          );
        }
      );
    }

    // If assigned to someone, notify them too
    if (ticket.assignedToId && ticket.assignedToId !== owner?.email) {
      this.db.createNotification(
        ticket.assignedToId,
        'Assigned Ticket Updated',
        `Ticket ${ticket.id} assigned to you was updated to ${newStatus}.`,
        'TICKET_UPDATE'
      );
    }
  }

  // 6. Support Ticket Assignment
  dispatchTicketAssignment(ticketId: string, assignToId: string, actingUserName: string) {
    const ticket = this.db.getTickets().find(t => t.id === ticketId);
    const assignee = this.db.getUser(assignToId);
    if (!ticket || !assignee) return;

    this.notifyUser(
      assignToId,
      'Ticket Assigned to You',
      `Ticket ${ticketId} has been assigned to you by ${actingUserName}.`,
      'TICKET_UPDATE',
      () => {
        // Send email to assignee
        EmailService.sendMockEmail(
          assignee.email,
          `Ticket Assigned: [${ticketId}] — ${ticket.subject}`,
          'TICKET_ASSIGNMENT',
          `
            <div class="welcome">Hello ${assignee.name},</div>
            <p>You have been assigned to handle support ticket <strong>${ticketId}</strong>.</p>
            <div class="details-card">
              <div class="details-row">
                <div class="label">Ticket Subject</div>
                <div class="value">${ticket.subject}</div>
              </div>
              <div class="details-row" style="margin-top: 12px;">
                <div class="label">Priority</div>
                <div class="value">${ticket.priority}</div>
              </div>
              <div class="details-row" style="margin-top: 12px;">
                <div class="label">Created By</div>
                <div class="value">${ticket.createdById}</div>
              </div>
            </div>
            <p>Please review the details in the Support dashboard and update the ticket status.</p>
          `
        );
      }
    );
  }

  // 7. Knowledge Note Submitted for Approval
  dispatchKnowledgeNoteSubmitted(noteId: string) {
    const note = this.db.getKnowledgeNotes().find(n => n.id === noteId);
    if (!note || note.status !== 'PENDING_APPROVAL') return;

    const admins = this.db.getUsers().filter(u => u.role === 'ADMIN');
    admins.forEach(admin => {
      this.notifyUser(
        admin.email,
        'Moderation Required',
        `Knowledge article "${note.title}" submitted by ${note.authorName} needs review.`,
        'ANNOUNCEMENT',
        () => {
          EmailService.sendKnowledgeNoteModeration(
            admin.email,
            admin.name,
            note.authorName,
            note.title
          );
        }
      );
    });
  }

  // 8. Knowledge Note Approved
  dispatchKnowledgeNoteApproved(noteId: string, moderatorName: string) {
    const note = this.db.getKnowledgeNotes().find(n => n.id === noteId);
    if (!note) return;

    // Notify author
    const author = this.db.getUser(note.authorId);
    if (author) {
      this.notifyUser(
        author.email,
        'Knowledge Note Approved',
        `Your article "${note.title}" was approved by ${moderatorName}.`,
        'ANNOUNCEMENT',
        () => {
          EmailService.sendMockEmail(
            author.email,
            `Knowledge Note Approved: "${note.title}"`,
            'KNOWLEDGE_NOTE_APPROVED',
            `
              <div class="welcome">Hello ${author.name},</div>
              <p>Congratulations! Your knowledge note: <strong>"${note.title}"</strong> has been approved by ${moderatorName} and is now published in the internal Knowledge Library.</p>
              <div class="btn-container">
                <a href="#library" class="btn">View Knowledge Library</a>
              </div>
            `
          );
        }
      );
    }

    // Notify other users
    this.db.getUsers().forEach(u => {
      if (u.email !== note.authorId) {
        this.db.createNotification(
          u.email,
          'New Knowledge Resource Available',
          `${note.authorName} published: "${note.title}".`,
          'NEW_KNOWLEDGE_NOTE'
        );
      }
    });
  }

  // 9. Company-Wide Broadcast Message
  dispatchCompanyBroadcast(message: CompanyMessage) {
    const allUsers = this.db.getUsers();
    const summary = message.content.length > 120 ? message.content.slice(0, 117) + '...' : message.content;

    allUsers.forEach(user => {
      this.notifyUser(
        user.email,
        `📢 ${message.title}`,
        summary,
        'ANNOUNCEMENT',
        () => {
          EmailService.sendCompanyBroadcast(
            user.email,
            user.name,
            message.title,
            message.content,
            message.senderName,
            message.category,
            message.priority
          );
        }
      );
    });
  }

  // 10. Broadcast Webinar Meeting Link to ALL Employees (All Persons)
  dispatchWebinarLinkToAllEmployees(webinarId: string, senderName: string = 'Nexora Administrator', customNote?: string) {
    const webinar = this.db.getWebinars().find(w => w.id === webinarId);
    if (!webinar) return;

    const allUsers = this.db.getUsers();
    const dateTimeStr = `${webinar.date} at ${webinar.startTime}`;

    allUsers.forEach(user => {
      this.notifyUser(
        user.email,
        `📢 Webinar Link: ${webinar.title}`,
        `Live Webinar link for "${webinar.title}" (${webinar.platform}) on ${dateTimeStr}. Click to join!`,
        'WEBINAR_REMINDER',
        () => {
          EmailService.sendWebinarMeetingLinkBroadcast(
            user.email,
            user.name,
            webinar.title,
            dateTimeStr,
            webinar.platform,
            webinar.speaker,
            webinar.speakerDesignation,
            webinar.speakerOrganization,
            webinar.url,
            senderName,
            customNote
          );
        }
      );
    });
  }

  // 11. Instant Sudden Email Broadcast to ALL Employees
  dispatchInstantEmailToAll(
    title: string,
    content: string,
    senderName: string,
    priority: 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL',
    actionUrl?: string,
    actionLabel?: string
  ) {
    const allUsers = this.db.getUsers();
    const summary = content.length > 120 ? content.slice(0, 117) + '...' : content;

    allUsers.forEach(user => {
      this.notifyUser(
        user.email,
        `⚡ ${title}`,
        summary,
        'ANNOUNCEMENT',
        () => {
          EmailService.sendInstantEmailToAll(
            user.email,
            user.name,
            title,
            content,
            senderName,
            priority,
            actionUrl,
            actionLabel
          );
        }
      );
    });
  }

  // 12. Instant Email to Particular / Specific Person(s)
  dispatchInstantEmailToTarget(
    targetEmails: string[],
    title: string,
    content: string,
    senderName: string,
    priority: 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL',
    actionUrl?: string,
    actionLabel?: string
  ) {
    const allUsers = this.db.getUsers();
    const userMap = new Map(allUsers.map(u => [u.email.toLowerCase(), u]));
    const summary = content.length > 120 ? content.slice(0, 117) + '...' : content;

    targetEmails.forEach(email => {
      const normalized = email.trim().toLowerCase();
      const existingUser = userMap.get(normalized);
      const recipientName = existingUser ? existingUser.name : normalized.split('@')[0];

      this.notifyUser(
        normalized,
        `⚡ ${title}`,
        summary,
        'ANNOUNCEMENT',
        () => {
          EmailService.sendInstantEmailToAll(
            normalized,
            recipientName,
            title,
            content,
            senderName,
            priority,
            actionUrl,
            actionLabel
          );
        }
      );
    });
  }
}

