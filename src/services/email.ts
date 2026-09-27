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

  // Async Real Send function with return promise
  static async sendRealEmailAsync(
    to: string,
    subject: string,
    templateType: string,
    bodyContent: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const fullHtml = this.renderTemplate(subject, bodyContent);
    const mockEmail: SentEmail = {
      id: `mail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      to: to.trim(),
      subject,
      body: fullHtml,
      sentAt: new Date().toISOString(),
      templateType
    };
    saveSentEmail(mockEmail);

    const apiKey = (import.meta as any).env?.VITE_RESEND_API_KEY || localStorage.getItem('nexora_email_api_key') || '';
    let fromAddress = (import.meta as any).env?.VITE_RESEND_FROM_EMAIL || localStorage.getItem('nexora_email_from');
    if (!fromAddress || fromAddress === 'onboarding@resend.dev' || fromAddress.includes('@gmail.com') || fromAddress.includes('@yahoo.com') || fromAddress.includes('@outlook.com') || fromAddress.includes('@hotmail.com')) {
      fromAddress = 'connect@mail.nexoratechs.xyz';
    }

    const recipient = to.trim();
    const emailPayload = {
      from: `Nexora Connect <${fromAddress}>`,
      to: [recipient],
      reply_to: 'contactnexoratechs@gmail.com',
      subject: subject,
      html: fullHtml,
      apiKey: apiKey
    };

    try {
      // 1. Try local dev proxy endpoint
      const proxyRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      }).catch(() => null);

      if (proxyRes && proxyRes.ok) {
        const data = await proxyRes.json().catch(() => ({}));
        console.log(`[SMTP RESEND API] Real email successfully sent to ${recipient}! ID:`, data.id || 'ok');
        return { success: true, id: data.id || 'sent-proxy' };
      }

      // 2. Direct fallback
      const directRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Nexora Connect <${fromAddress}>`,
          to: [recipient],
          reply_to: 'contactnexoratechs@gmail.com',
          subject: subject,
          html: fullHtml
        })
      });

      if (directRes.ok) {
        const data = await directRes.json().catch(() => ({}));
        console.log(`[SMTP RESEND API] Direct fallback email sent to ${recipient}!`);
        return { success: true, id: data.id || 'sent-direct' };
      } else {
        const err = await directRes.json().catch(() => ({ error: 'HTTP error ' + directRes.status }));
        console.warn('[SMTP RESEND API] Direct error:', err);
        return { success: false, error: JSON.stringify(err) };
      }
    } catch (err: any) {
      console.error('[SMTP RESEND API] Dispatch error for ' + recipient, err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  // Synchronous wrapper
  static sendMockEmail(to: string, subject: string, templateType: string, bodyContent: string) {
    this.sendRealEmailAsync(to, subject, templateType, bodyContent);
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

  // 2. Webinar Meeting Link Broadcast to ALL Employees (All Persons)
  static sendWebinarMeetingLinkBroadcast(
    to: string,
    userName: string,
    webinarTitle: string,
    dateTime: string,
    platform: string,
    speaker: string,
    speakerDesignation: string,
    speakerOrganization: string,
    joinLink: string,
    senderName: string = 'Nexora Administrator',
    customMessage?: string
  ) {
    const subject = `📢 Live Webinar Link: "${webinarTitle}" — ${dateTime}`;
    const body = `
      <div class="welcome">Hello ${userName}, 👋</div>
      <p>You are invited to attend our upcoming live company webinar hosted on <strong>${platform}</strong>.</p>
      
      ${customMessage ? `
      <div style="background-color: #EFF6FF; border-left: 4px solid #0878C9; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #1E3A8A;">
        <strong>Message from ${senderName}:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customMessage}</span>
      </div>
      ` : ''}

      <div class="details-card">
        <div class="details-row">
          <div class="label">Webinar Topic</div>
          <div class="value" style="font-size: 15px; font-weight: bold; color: #0F172A;">${webinarTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Keynote Speaker</div>
          <div class="value">${speaker} <span style="font-size: 12px; color: #64748B;">(${speakerDesignation}${speakerOrganization ? `, ${speakerOrganization}` : ''})</span></div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Date & Time</div>
          <div class="value">${dateTime}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Virtual Meeting Platform</div>
          <div class="value" style="font-weight: 600; color: #0878C9;">${platform}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Direct Meeting Link</div>
          <div class="value" style="word-break: break-all;"><a href="${joinLink}" target="_blank" style="color: #0878C9; font-weight: 600;">${joinLink}</a></div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank" style="background-color: #0878C9; font-size: 15px; padding: 14px 34px;">
          🚀 Click Here to Join Live Webinar (${platform})
        </a>
      </div>

      <p style="font-size: 12px; color: #64748B; text-align: center; margin-top: 15px;">
        <em>Note: This meeting link has been broadcast to all team members across the company. You can join directly at the scheduled time.</em>
      </p>
    `;
    this.sendMockEmail(to, subject, 'WEBINAR_MEETING_LINK_BROADCAST', body);
  }

  // 3. Instant / Sudden Email to All Employees
  static sendInstantEmailToAll(
    to: string,
    userName: string,
    title: string,
    content: string,
    senderName: string,
    priority: 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL',
    actionUrl?: string,
    actionLabel?: string
  ) {
    const priorityColor = priority === 'URGENT' ? '#DC2626' : priority === 'HIGH' ? '#D97706' : '#0878C9';
    const priorityBadge = priority === 'URGENT' ? '🚨 URGENT' : priority === 'HIGH' ? '⚠️ HIGH PRIORITY' : '📢 NOTICE';
    const subject = `[${priorityBadge}] ${title}`;
    
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>An immediate broadcast communication has been dispatched by <strong>${senderName}</strong> to all employees:</p>
      
      <div class="details-card" style="border-left-color: ${priorityColor};">
        <div style="margin-bottom: 10px;">
          <span style="font-size: 10px; font-weight: bold; background-color: ${priorityColor}; color: #ffffff; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
            ${priority} PRIORITY
          </span>
        </div>
        <div class="details-row">
          <div class="label">Subject</div>
          <div class="value" style="font-size: 16px; font-weight: bold; color: #0F172A;">${title}</div>
        </div>
        <div class="details-row" style="margin-top: 14px;">
          <div class="label">Message</div>
          <div class="value" style="margin-top: 6px; line-height: 1.7; white-space: pre-wrap; font-size: 13.5px;">${content}</div>
        </div>
      </div>

      ${actionUrl ? `
      <div class="btn-container">
        <a href="${actionUrl}" class="btn" target="_blank" style="background-color: ${priorityColor};">
          ${actionLabel || 'View Details / Join Now'}
        </a>
      </div>
      ` : ''}

      <p style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 20px;">
        This message was delivered immediately to all registered company members on Nexora Connect.
      </p>
    `;
    this.sendMockEmail(to, subject, 'INSTANT_EMAIL_BROADCAST', body);
  }

  // 4. Webinar Reminder
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

  // 3b. Instant Meeting Invitation
  static sendInstantMeetingInvitation(
    to: string,
    userName: string,
    meetingTitle: string,
    joinLink: string,
    platform: string = 'Google Meet',
    organizerName: string = 'Host',
    customNote?: string
  ) {
    const subject = `⚡ Live Now: "${meetingTitle}" — Join Instant Meeting`;
    const body = `
      <div class="welcome">Hello ${userName}, 👋</div>
      <p>An instant team meeting has just started and you are invited to join live right now!</p>
      
      ${customNote ? `
      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #92400E;">
        <strong>Host Note / Instructions:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customNote}</span>
      </div>
      ` : ''}

      <div class="details-card" style="border-left-color: #F59E0B;">
        <div style="margin-bottom: 10px;">
          <span style="font-size: 10px; font-weight: bold; background-color: #F59E0B; color: #ffffff; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase;">
            ⚡ LIVE INSTANT SYNC
          </span>
        </div>
        <div class="details-row">
          <div class="label">Meeting Topic</div>
          <div class="value" style="font-size: 16px; font-weight: bold; color: #0F172A;">${meetingTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Host / Organizer</div>
          <div class="value">👤 ${organizerName}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Platform</div>
          <div class="value" style="font-weight: 600; color: #0878C9;">📹 ${platform}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Direct Join Link</div>
          <div class="value" style="word-break: break-all;"><a href="${joinLink}" target="_blank" style="color: #0878C9; font-weight: 600;">${joinLink}</a></div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); font-size: 15px; padding: 14px 34px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);">
          ⚡ Join Instant Meeting Now
        </a>
      </div>

      <p style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 20px;">
        Please click above to enter the conference room immediately.
      </p>
    `;
    this.sendMockEmail(to, subject, 'INSTANT_MEETING_INVITE', body);
  }

  // 4. Meeting Reminder
  static sendMeetingReminder(
    to: string,
    userName: string,
    meetingTitle: string,
    dateTime: string,
    joinLink: string,
    platform: string = 'Google Meet',
    organizerName: string = 'Nexora Organizer',
    customNote?: string
  ) {
    const subject = `⏰ Reminder: Meeting "${meetingTitle}" is starting soon`;
    const body = `
      <div class="welcome">Hello ${userName}, 👋</div>
      <p>This is a reminder that your scheduled team meeting: <strong>"${meetingTitle}"</strong> is starting soon.</p>
      
      ${customNote ? `
      <div style="background-color: #EFF6FF; border-left: 4px solid #0878C9; padding: 12px 16px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #1E3A8A;">
        <strong>Note from organizer:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customNote}</span>
      </div>
      ` : ''}

      <div class="details-card">
        <div class="details-row">
          <div class="label">Meeting Topic</div>
          <div class="value" style="font-size: 15px; font-weight: bold; color: #0F172A;">${meetingTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Organizer / Host</div>
          <div class="value">👤 ${organizerName}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Date & Time</div>
          <div class="value">⏰ ${dateTime}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Platform</div>
          <div class="value" style="font-weight: 600; color: #0878C9;">📹 ${platform}</div>
        </div>
        <div class="details-row" style="margin-top: 12px;">
          <div class="label">Meeting Link</div>
          <div class="value" style="word-break: break-all;"><a href="${joinLink}" target="_blank" style="color: #0878C9; font-weight: 600;">${joinLink}</a></div>
        </div>
      </div>

      <div class="btn-container">
        <a href="${joinLink}" class="btn" target="_blank" style="font-size: 15px; padding: 14px 34px;">
          🚀 Join ${platform} Room Now
        </a>
      </div>

      <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 20px;">
        <em>Tip: Please join on time and verify your microphone and webcam settings.</em>
      </p>
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

  // 8. Company-Wide Broadcast Message
  static sendCompanyBroadcast(
    to: string,
    userName: string,
    title: string,
    content: string,
    senderName: string,
    category: string,
    priority: string
  ) {
    const priorityColor = priority === 'URGENT' ? '#EF4444' : priority === 'HIGH' ? '#F59E0B' : '#0878C9';
    const subject = `[Company Notice] ${title}`;
    const body = `
      <div class="welcome">Hello ${userName},</div>
      <p>A new company-wide message has been broadcast to all team members by <strong>${senderName}</strong>:</p>
      
      <div class="details-card" style="border-left-color: ${priorityColor};">
        <div style="margin-bottom: 8px;">
          <span style="font-size: 10px; font-weight: bold; background-color: ${priorityColor}; color: #ffffff; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
            ${priority} PRIORITY
          </span>
          <span style="font-size: 11px; color: #64748B; margin-left: 8px; font-weight: 600;">
            ${category}
          </span>
        </div>
        <div class="details-row">
          <div class="label">Subject</div>
          <div class="value" style="font-size: 16px; font-weight: bold; color: #0F172A; margin-top: 4px;">${title}</div>
        </div>
        <div class="details-row" style="margin-top: 14px;">
          <div class="label">Message Content</div>
          <div class="value" style="margin-top: 6px; line-height: 1.6; white-space: pre-wrap; font-size: 13px;">${content}</div>
        </div>
      </div>
      
      <div class="btn-container">
        <a href="#broadcasts" class="btn">View on Nexora Connect</a>
      </div>
      <p style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 20px;">
        This communication was delivered to all registered personnel across Nexora Technologies.
      </p>
    `;
    this.sendMockEmail(to, subject, 'COMPANY_BROADCAST', body);
  }

  // 9. User Welcome & Onboarding Credentials
  static sendWelcomeUserEmail(
    to: string,
    userName: string,
    password: string = 'Nexora@123',
    designation: string = 'Software Associate',
    organization: string = 'Nexora Technologies'
  ) {
    const subject = `Welcome to Nexora Connect — Your Account Details & Access Portal`;
    const body = `
      <div class="welcome">Welcome to Nexora Connect, ${userName}! 👋</div>
      <p>We are delighted to welcome you to the <strong>${organization}</strong> workspace. Your official corporate account on <strong>Nexora Connect</strong> has been provisioned and is ready for use.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Portal Access</div>
          <div class="value">Nexora Connect Team Hub</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Registered Email</div>
          <div class="value" style="font-family: monospace; color: #0878C9; font-weight: bold;">${to}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Default Password</div>
          <div class="value" style="font-family: monospace; color: #0878C9; font-weight: bold;">${password}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Designation</div>
          <div class="value">${designation}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Organization</div>
          <div class="value">${organization}</div>
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
        <div style="font-weight: bold; color: #1E293B; font-size: 13px; margin-bottom: 6px;">Available Workspace Modules:</div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">• 📅 <strong>Webinars:</strong> Register & attend technical live sessions.</div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">• ⏰ <strong>Meetings:</strong> Direct scheduling with Google Meet & Teams.</div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">• 📚 <strong>Knowledge Wiki:</strong> Search and publish tech documentation.</div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">• 📹 <strong>Recordings:</strong> Catch up with previous session archives.</div>
        <div style="font-size: 12px; color: #475569;">• 🎫 <strong>Support Desk:</strong> Raise internal queries & IT tickets.</div>
      </div>

      <div class="btn-container">
        <a href="https://nexora-connect.vercel.app" class="btn" target="_blank">Login to Nexora Connect</a>
      </div>
      
      <p style="font-size: 11px; color: #94A3B8; text-align: center;">
        <em>Security Tip: Please update your password in Profile Settings after your first login.</em>
      </p>
    `;
    this.sendMockEmail(to, subject, 'USER_ONBOARDING', body);
  }

  // 17. Experience Certificate & Relieving Letter Email
  static sendExperienceCertificateEmail(
    to: string,
    employeeName: string,
    designation: string,
    period: string,
    certId: string,
    verifyUrl: string,
    signatoryName: string = 'Trivin'
  ) {
    const subject = `Official Experience Certificate & Relieving Letter — ${employeeName} [Ref: ${certId}]`;
    const body = `
      <div class="welcome">Dear ${employeeName},</div>
      <p>We are pleased to issue your official <strong>Work Experience Certificate & Relieving Letter</strong> from <strong>Nexora Technologies</strong>.</p>
      
      <p>We sincerely appreciate your dedicated service, technical contributions, and professionalism during your tenure with us.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Document Ref No.</div>
          <div class="value" style="font-family: monospace; font-weight: bold; color: #0878C9;">${certId}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Employee Name</div>
          <div class="value" style="font-weight: 700; color: #06152F;">${employeeName}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Designation</div>
          <div class="value">${designation}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Tenure Duration</div>
          <div class="value" style="font-weight: 600;">${period} (2 Months)</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Authorized Signatory</div>
          <div class="value">${signatoryName} (Founder & Managing Director, Nexora Technologies)</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Verification Status</div>
          <div class="value" style="color: #059669; font-weight: bold;">✔ Digitally Signed & Authenticated</div>
        </div>
      </div>

      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center;">
        <div style="font-weight: 700; color: #0F172A; font-size: 14px; margin-bottom: 6px;">Official Digital Certificate</div>
        <div style="font-size: 12.5px; color: #64748B; margin-bottom: 16px;">
          Your certificate includes the official company seal, founder signature, and a dynamic QR code for instant third-party authenticity verification.
        </div>
        <div class="btn-container" style="margin: 10px 0;">
          <a href="${verifyUrl}" class="btn" target="_blank" style="background-color: #0878C9; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 6px; display: inline-block;">
            View & Download Certificate (PDF)
          </a>
        </div>
        <div style="font-size: 11px; color: #94A3B8; margin-top: 8px;">
          Direct Verification Link: <a href="${verifyUrl}" style="color: #0878C9;">${verifyUrl}</a>
        </div>
      </div>

      <p>All official obligations, company handovers, and clearance formalities have been completed. We wish you immense success, continuous growth, and fulfillment in all your future endeavors.</p>
      
      <p style="margin-top: 20px;">
        Warm regards,<br>
        <strong>Nexora Technologies Human Resources & Executive Office</strong><br>
        <span style="font-size: 12px; color: #64748B;">Email: contactnexoratechs@gmail.com | connect@mail.nexoratechs.xyz</span>
      </p>
    `;
    this.sendMockEmail(to, subject, 'EXPERIENCE_CERTIFICATE', body);
  }

  // 18. Attendance Present Confirmation Email
  static async sendAttendancePresentEmail(
    to: string,
    userName: string,
    dateStr: string,
    sessionTitle: string = 'Daily Technical Training & Internship Standup',
    customNote?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const subject = `✅ Attendance Confirmed: Present Today (${dateStr}) — Nexora Technologies`;
    const body = `
      <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 800; color: #15803D; margin-bottom: 4px;">
          ✓ Status: PRESENT & CONFIRMED
        </div>
        <p style="margin: 0; font-size: 13.5px; color: #166534; line-height: 1.5;">
          Your attendance for today's session has been officially recorded in the company registry.
        </p>
      </div>

      <div class="welcome">Dear <strong>${userName}</strong>, 👋</div>
      <p>Thank you for your active participation, punctuality, and commitment to the technical training sessions and project milestones at <strong>Nexora Technologies</strong>.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Session Topic</div>
          <div class="value" style="font-weight: 700; color: #0F172A;">${sessionTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Session Date</div>
          <div class="value">${dateStr}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Attendance Status</div>
          <div class="value" style="color: #15803D; font-weight: 700;">Present & Engaged</div>
        </div>
      </div>

      ${customNote ? `
      <div style="background-color: #EFF6FF; border-left: 4px solid #0878C9; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #1E3A8A;">
        <strong>Instructor Remarks:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customNote}</span>
      </div>
      ` : ''}

      <p>Keep up the great consistency! Please ensure you submit your daily progress notes in the <strong>Knowledge Wiki</strong> and check upcoming technical webinars on <strong>Nexora Connect</strong>.</p>

      <div class="btn-container">
        <a href="https://nexora-connect.vercel.app" class="btn" target="_blank">Open Nexora Connect Portal</a>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #475569;">
        Best regards,<br/>
        <strong>Nexora Operations & Technical Training Team</strong><br/>
        <span style="font-size: 11px; color: #94A3B8;">Nexora Technologies • connect@mail.nexoratechs.xyz</span>
      </p>
    `;
    return this.sendRealEmailAsync(to, subject, 'ATTENDANCE_PRESENT', body);
  }

  // 19. Attendance Absent Warning Notice Email
  static async sendAttendanceAbsentWarningEmail(
    to: string,
    userName: string,
    dateStr: string,
    sessionTitle: string = 'Daily Technical Training & Internship Standup',
    customNote?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const subject = `⚠️ Notice: Absence Recorded Today (${dateStr}) — Nexora Technologies`;
    const body = `
      <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 16px; font-weight: 800; color: #B91C1C; margin-bottom: 4px;">
          ⚠️ Official Warning: ABSENT
        </div>
        <p style="margin: 0; font-size: 13.5px; color: #991B1B; line-height: 1.5;">
          You were marked <strong>ABSENT</strong> for today's mandatory scheduled session.
        </p>
      </div>

      <div class="welcome">Dear <strong>${userName}</strong>,</div>
      <p>This is an automated notification from Nexora Administration to inform you that your absence was marked for the session on <strong>${dateStr}</strong>.</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Session Topic</div>
          <div class="value" style="font-weight: 700; color: #0F172A;">${sessionTitle}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Session Date</div>
          <div class="value">${dateStr}</div>
        </div>
        <div class="details-row" style="margin-top: 10px;">
          <div class="label">Recorded Status</div>
          <div class="value" style="color: #DC2626; font-weight: 700;">Absent (Unexcused)</div>
        </div>
      </div>

      <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
        <strong style="color: #92400E; font-size: 13.5px;">⚠️ Mandatory Policy Compliance Notice:</strong>
        <p style="font-size: 12.5px; color: #78350F; margin: 6px 0 0 0; line-height: 1.55;">
          Maintaining a minimum of <strong>85% attendance</strong> is strictly mandatory to successfully qualify for the <strong>Internship Completion Certificate</strong>, Experience Letter, and performance recommendations.
        </p>
      </div>

      ${customNote ? `
      <div style="background-color: #F8FAFC; border-left: 4px solid #64748B; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #334155;">
        <strong>Note from Administration:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customNote}</span>
      </div>
      ` : ''}

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 18px; margin: 20px 0;">
        <strong style="color: #334155; font-size: 13px;">Immediate Next Steps:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12.5px; color: #475569; line-height: 1.6;">
          <li>If your absence was due to an emergency or medical reason, email administrative proof immediately to <a href="mailto:contactnexoratechs@gmail.com" style="color: #0878C9; font-weight: 600;">contactnexoratechs@gmail.com</a>.</li>
          <li>Review missed topics and lecture recordings on the <strong>Nexora Connect Portal</strong>.</li>
          <li>Ensure 100% punctuality for tomorrow's scheduled session.</li>
        </ul>
      </div>

      <div class="btn-container">
        <a href="https://nexora-connect.vercel.app" class="btn" target="_blank">Access Recordings on Nexora Connect</a>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #475569;">
        Sincerely,<br/>
        <strong>Department of Human Resources & Training</strong><br/>
        <span style="font-size: 11px; color: #94A3B8;">Nexora Technologies • contactnexoratechs@gmail.com</span>
      </p>
    `;
    return this.sendRealEmailAsync(to, subject, 'ATTENDANCE_ABSENT_WARNING', body);
  }

  // 20. Executive Attendance Report to Administrators
  static async sendAttendanceAdminReport(
    adminEmail: string,
    adminName: string,
    dateStr: string,
    sessionTitle: string,
    presentList: { name: string; email: string }[],
    absentList: { name: string; email: string }[],
    customNote?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const totalStudents = presentList.length + absentList.length;
    const rate = totalStudents > 0 ? ((presentList.length / totalStudents) * 100).toFixed(1) : '0.0';
    const subject = `📊 Executive Attendance Summary (${dateStr}) — Nexora Technologies`;

    const presentRows = presentList.map((s, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 11px; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${s.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #475569; font-family: monospace;">${s.email}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9;"><span style="background-color: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 10.5px;">PRESENT</span></td>
      </tr>
    `).join('');

    const absentRows = absentList.map((s, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-size: 11px; color: #64748b;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${s.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #475569; font-family: monospace;">${s.email}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9;"><span style="background-color: #fee2e2; color: #b91c1c; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 10.5px;">ABSENT (Warning Sent)</span></td>
      </tr>
    `).join('');

    const body = `
      <div class="welcome">Dear <strong>${adminName}</strong>,</div>
      <p>Here is the official executive attendance summary report for <strong>${sessionTitle}</strong> on <strong>${dateStr}</strong>:</p>
      
      <div style="display: table; width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 8px;">
        <div style="display: table-row;">
          <div style="display: table-cell; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Students</div>
            <div style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">${totalStudents}</div>
          </div>
          <div style="display: table-cell; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Present</div>
            <div style="font-size: 22px; font-weight: 800; color: #15803d; margin-top: 4px;">${presentList.length}</div>
          </div>
          <div style="display: table-cell; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Absent</div>
            <div style="font-size: 22px; font-weight: 800; color: #b91c1c; margin-top: 4px;">${absentList.length}</div>
          </div>
          <div style="display: table-cell; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; text-align: center;">
            <div style="font-size: 11px; font-weight: 700; color: #0369a1; text-transform: uppercase;">Turnout Rate</div>
            <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin-top: 4px;">${rate}%</div>
          </div>
        </div>
      </div>

      ${customNote ? `
      <div style="background-color: #EFF6FF; border-left: 4px solid #0878C9; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #1E3A8A;">
        <strong>Session Notes / Remarks:</strong><br/>
        <span style="white-space: pre-wrap; margin-top: 4px; display: inline-block;">${customNote}</span>
      </div>
      ` : ''}

      <h3 style="color: #0f172a; font-size: 14px; margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        ✅ Present Students (${presentList.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; font-weight: 700; text-align: left;">
            <th style="padding: 8px 12px; width: 40px; border-bottom: 2px solid #e2e8f0;">#</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Student Name</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Email</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${presentRows}
        </tbody>
      </table>

      <h3 style="color: #0f172a; font-size: 14px; margin-top: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
        ⚠️ Absent Students — Warning Notices Dispatched (${absentList.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12.5px;">
        <thead>
          <tr style="background-color: #f8fafc; color: #475569; font-weight: 700; text-align: left;">
            <th style="padding: 8px 12px; width: 40px; border-bottom: 2px solid #e2e8f0;">#</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Student Name</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Email</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e2e8f0;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${absentRows}
        </tbody>
      </table>

      <div class="btn-container">
        <a href="https://nexora-connect.vercel.app" class="btn" target="_blank">Open Nexora Connect Portal</a>
      </div>

      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
        <em>Dispatch Summary: Confirmation emails were dispatched to all ${presentList.length} present students, and formal warning notices were sent to all ${absentList.length} absent students.</em>
      </p>
      
      <p style="margin-top: 20px;">
        Generated automatically by,<br/>
        <strong>Nexora Connect Automated Operations Protocol</strong><br/>
        <span style="font-size: 11px; color: #94A3B8;">Nexora Technologies Executive System</span>
      </p>
    `;
    return this.sendRealEmailAsync(adminEmail, subject, 'ATTENDANCE_ADMIN_REPORT', body);
  }
}


