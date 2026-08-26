export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string; // HTML format
  sentAt: string;
  templateType: string;
}

const getSentEmails = (): SentEmail[] => {
  const data = localStorage.getItem('nexora_sent_emails');
  return data ? JSON.parse(data) : [];
};

const saveSentEmail = (email: SentEmail) => {
  const emails = [email, ...getSentEmails()];
  localStorage.setItem('nexora_sent_emails', JSON.stringify(emails));
};

export class EmailService {
  private static renderTemplate(_title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #F8FAFC;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #FFFFFF;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            border: 1px solid #E2E8F0;
          }
          .header {
            background-color: #06152F;
            padding: 30px;
            text-align: center;
            border-bottom: 3px solid #0878C9;
          }
          .header h1 {
            color: #FFFFFF;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .header p {
            color: #16B9FF;
            margin: 5px 0 0 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .content {
            padding: 40px 30px;
            color: #334155;
            line-height: 1.6;
          }
          .welcome {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #0F172A;
          }
          .details-card {
            background-color: #F1F5F9;
            border-left: 4px solid #0878C9;
            border-radius: 4px;
            padding: 20px;
            margin: 25px 0;
          }
          .details-row {
            margin-bottom: 10px;
          }
          .details-row:last-child {
            margin-bottom: 0;
          }
          .label {
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .value {
            color: #0F172A;
            font-size: 14px;
            margin-top: 2px;
          }
          .btn-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn {
            background-color: #0878C9;
            color: #FFFFFF !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #0660A3;
          }
          .footer {
            background-color: #F8FAFC;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
            color: #64748B;
            font-size: 12px;
          }
          .footer-logo {
            font-weight: bold;
            color: #06152F;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEXORA CONNECT</h1>
            <p>Learn. Collaborate. Share. Grow.</p>
          </div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            <div class="footer-logo">NEXORA TECHNOLOGIES</div>
            <div>Building Tomorrow, Today.</div>
            <div style="margin-top: 10px;">This is an automated notification. Please do not reply directly to this email.</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send function
  static sendMockEmail(to: string, subject: string, templateType: string, bodyContent: string) {
    const fullHtml = this.renderTemplate(subject, bodyContent);
    const mockEmail: SentEmail = {
      id: `mail-${Date.now()}`,
      to,
      subject,
      body: fullHtml,
      sentAt: new Date().toISOString(),
      templateType
    };
    saveSentEmail(mockEmail);
    console.log(`[SMTP SIMULATOR] Email logged to sandbox for ${to}. Subject: ${subject}.`);

    // Real email dispatch if Resend API Key is configured
    const provider = localStorage.getItem('nexora_email_provider');
    const apiKey = localStorage.getItem('nexora_email_api_key');
    const fromAddress = localStorage.getItem('nexora_email_from') || 'onboarding@resend.dev';

    if (provider === 'Resend' && apiKey) {
      // Free onboarding sender can only deliver to the verified address (contactnexoratechs@gmail.com)
      const recipient = fromAddress === 'onboarding@resend.dev' ? 'contactnexoratechs@gmail.com' : to;

      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Nexora Connect <${fromAddress}>`,
          to: [recipient],
          subject: subject,
          html: fullHtml
        })
      })
      .then(res => {
        if (res.ok) {
          console.log(`[SMTP RESEND API] Real email successfully sent to ${recipient} via Resend!`);
        } else {
          res.json().then(err => console.error('[SMTP RESEND API] Error response from Resend:', err));
        }
      })
      .catch(err => {
        console.error('[SMTP RESEND API] Connection failed:', err);
      });
    }
  }

  static getSentEmailsList(): SentEmail[] {
    return getSentEmails();
  }

  static clearEmailLogs() {
    localStorage.removeItem('nexora_sent_emails');
  }

  // 1. Webinar Registration Confirmation
  static sendWebinarRegistrationConfirm(to: string, userName: string, webinarTitle: string, dateTime: string, joinLink: string) {
    const subject = `Nexora Connect — Webinar Registration Confirmed`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>Your registration for the upcoming webinar has been successfully confirmed. Please save the details below to your calendar.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Webinar Title</div>
          <div class="value">${webinarTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Date & Time</div>
          <div class="value">${dateTime}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Platform</div>
          <div class="value">Virtual Live Meeting</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank">Join Webinar Room</a>
      </div>
      
      <p>We look forward to seeing you at the session!</p>
    `;
    this.sendMockEmail(to, subject, 'WEBINAR_REGISTRATION_CONFIRM', body);
  }

  // 2. Webinar Reminder
  static sendWebinarReminder(to: string, userName: string, webinarTitle: string, timeString: string, joinLink: string) {
    const subject = `Reminder: "${webinarTitle}" starts in ${timeString}`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>This is a quick reminder that the webinar you registered for: <strong>${webinarTitle}</strong> is scheduled to start in <strong>${timeString}</strong>.</p>
      
      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank">Launch Webinar Session</a>
      </div>
      
      <p>Make sure you have a stable internet connection and quiet environment.</p>
    `;
    this.sendMockEmail(to, subject, 'WEBINAR_REMINDER', body);
  }

  // 3. Meeting Invitation
  static sendMeetingInvitation(to: string, userName: string, meetingTitle: string, dateTime: string, organizerName: string, joinLink: string) {
    const subject = `Nexora Connect — Meeting Invite: "${meetingTitle}"`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>You have been invited to a meeting scheduled on Nexora Connect.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Meeting Topic</div>
          <div class="value">${meetingTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Scheduled Time</div>
          <div class="value">${dateTime}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Organizer</div>
          <div class="value">${organizerName}</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank">Accept & Join Meeting</a>
      </div>
    `;
    this.sendMockEmail(to, subject, 'MEETING_INVITATION', body);
  }

  // 4. Meeting Reminder
  static sendMeetingReminder(to: string, userName: string, meetingTitle: string, dateTime: string, joinLink: string) {
    const subject = `Reminder: Meeting "${meetingTitle}" is starting soon`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>This is a reminder that your scheduled meeting: <strong>${meetingTitle}</strong> is starting soon.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Meeting Topic</div>
          <div class="value">${meetingTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Start Time</div>
          <div class="value">${dateTime}</div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank">Join Meeting Now</a>
      </div>
    `;
    this.sendMockEmail(to, subject, 'MEETING_REMINDER', body);
  }

  // 5. Ticket Created
  static sendTicketCreated(to: string, userName: string, ticketId: string, subjectLine: string, priority: string) {
    const subject = `Ticket Raised: [${ticketId}] — ${subjectLine}`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>We have successfully logged your internal support ticket. A support engineer or administrator will review it shortly.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Ticket ID</div>
          <div class="value"><strong>${ticketId}</strong></div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Subject</div>
          <div class="value">${subjectLine}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Priority</div>
          <div class="value" style="color: ${priority === 'URGENT' || priority === 'HIGH' ? '#DC2626' : '#475569'}">${priority}</div>
        </div>
      </div>
      
      <p>You can track the progress, update attachments, or reply to comments inside the Tickets dashboard in Nexora Connect.</p>
    `;
    this.sendMockEmail(to, subject, 'TICKET_CREATION', body);
  }

  // 6. Ticket Status Update
  static sendTicketStatusUpdate(to: string, userName: string, ticketId: string, subjectLine: string, oldStatus: string, newStatus: string) {
    const subject = `Ticket [${ticketId}] Updated: Status Changed to ${newStatus}`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>The status of your support ticket <strong>${ticketId}</strong> has been updated.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Ticket Topic</div>
          <div class="value">${subjectLine}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Previous Status</div>
          <div class="value">${oldStatus}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">New Status</div>
          <div class="value" style="font-weight: bold; color: #0878C9;">${newStatus}</div>
        </div>
      </div>
      
      <p>Log in to view comments or close the ticket if this resolves your query.</p>
    `;
    this.sendMockEmail(to, subject, 'TICKET_STATUS_UPDATE', body);
  }

  // 7. Knowledge Note Approval Request
  static sendKnowledgeNoteModeration(to: string, adminName: string, authorName: string, noteTitle: string) {
    const subject = `Moderation Required: Knowledge note "${noteTitle}"`;
    const body = `
      <div class="welcome">Hello ${adminName},</div>
      <p>A new knowledge Note has been submitted by <strong>${authorName}</strong> and requires administrator moderation before publishing.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Note Title</div>
          <div class="value">${noteTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Submitted By</div>
          <div class="value">${authorName}</div>
        </div>
      </div>
      
      <p>Please open the Nexora Connect Admin Panel under <em>Pending Note approvals</em> to review the content and either approve or request drafts edits.</p>
    `;
    this.sendMockEmail(to, subject, 'KNOWLEDGE_NOTE_APPROVAL', body);
  }
}
