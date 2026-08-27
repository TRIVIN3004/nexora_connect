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
    const apiKey = (import.meta as any).env?.VITE_RESEND_API_KEY || localStorage.getItem('nexora_email_api_key');
    let fromAddress = (import.meta as any).env?.VITE_RESEND_FROM_EMAIL || localStorage.getItem('nexora_email_from') || 'connect@mail.nexoratechs.xyz';
    
    // Resend requires verified sending domains (e.g. mail.nexoratechs.xyz). If user entered a @gmail.com or invalid fromAddress, fallback to verified domain
    if (!fromAddress || fromAddress.endsWith('@gmail.com') || fromAddress.endsWith('@yahoo.com') || fromAddress.endsWith('@outlook.com') || fromAddress.endsWith('@hotmail.com')) {
      fromAddress = 'connect@mail.nexoratechs.xyz';
    }

    if (apiKey) {
      const recipient = fromAddress === 'onboarding@resend.dev' ? 'contactnexoratechs@gmail.com' : to;

      const emailPayload = {
        from: `Nexora Connect <${fromAddress}>`,
        to: [recipient],
        reply_to: 'contactnexoratechs@gmail.com',
        subject: subject,
        html: fullHtml,
        apiKey: apiKey
      };

      // 1. Try local / Vercel serverless proxy endpoint to avoid browser CORS
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      })
      .then(async res => {
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          console.log(`[SMTP RESEND API] Real email successfully sent to ${recipient}! ID:`, data.id || 'ok');
        } else {
          // 2. Fallback to direct fetch if proxy unavailable
          return fetch('https://api.resend.com/emails', {
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
          }).then(async r => {
            if (r.ok) {
              console.log(`[SMTP RESEND API] Fallback email sent to ${recipient}!`);
            } else {
              const err = await r.json().catch(() => ({}));
              console.error('[SMTP RESEND API] Fallback error from Resend:', err);
            }
          });
        }
      })
      .catch(err => {
        console.error('[SMTP RESEND API] Dispatch failed:', err);
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
}

