import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// 1. Read configuration from .env
const envContent = fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
let resendApiKey = '';
let resendFrom = 'connect@mail.nexoratechs.xyz';

envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k === 'VITE_SUPABASE_URL') {
    supabaseUrl = v.join('=').trim().replace(/['"]/g, '').replace(/\/rest\/v1\/?$/, '');
  }
  if (k === 'VITE_SUPABASE_ANON_KEY') {
    supabaseKey = v.join('=').trim().replace(/['"]/g, '');
  }
  if (k === 'VITE_RESEND_API_KEY') {
    resendApiKey = v.join('=').trim().replace(/['"]/g, '');
  }
  if (k === 'VITE_RESEND_FROM_EMAIL') {
    resendFrom = v.join('=').trim().replace(/['"]/g, '');
  }
});

console.log('----------------------------------------------------');
console.log('🚀 NEXORA CONNECT — MEETING REMINDER EMAIL BROADCAST');
console.log('----------------------------------------------------');
console.log('Supabase URL:', supabaseUrl);
console.log('Resend From:', resendFrom);
console.log('Resend Key Active:', !!resendApiKey);

const client = createClient(supabaseUrl, supabaseKey);

// Meeting Details
const meetingDetails = {
  title: 'Nexora Technologies — General Team Meeting & Roadmap Sync',
  date: 'Thursday, August 27, 2026',
  time: '08:30 PM – 09:30 PM IST (20:30 – 21:30)',
  platform: 'Google Meet',
  url: 'https://meet.google.com/vua-zhnr-dcq',
  organizer: 'TRIVIN S (Founder & Lead)',
  organizerEmail: 'trivintrivin2005@gmail.com',
  agenda: [
    'Company growth milestones and upcoming product roadmaps',
    'Employee feedback, project reviews, and team collaboration updates',
    'Internship program plans and mentoring tracks',
    'Open Q&A and upcoming release announcements'
  ]
};

function renderMeetingReminderHtml(user) {
  const agendaList = meetingDetails.agenda
    .map(item => `<li style="margin-bottom: 6px; color: #334155; font-size: 13px;">${item}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Reminder — Nexora Technologies</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 30px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #06152F 0%, #0A2540 100%);
      padding: 36px 30px 28px;
      text-align: center;
      border-bottom: 3px solid #0878C9;
    }
    .badge {
      display: inline-block;
      background: rgba(22, 185, 255, 0.15);
      border: 1px solid #16B9FF;
      color: #16B9FF;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .content {
      padding: 32px 30px;
      color: #334155;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 14px;
    }
    .intro-text {
      font-size: 14px;
      color: #475569;
      margin-bottom: 20px;
    }
    .meeting-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #0878C9;
      border-radius: 8px;
      padding: 20px;
      margin: 22px 0;
    }
    .card-row {
      margin-bottom: 14px;
    }
    .card-row:last-child {
      margin-bottom: 0;
    }
    .label {
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .value {
      color: #0F172A;
      font-size: 14px;
      font-weight: 600;
    }
    .value.highlight {
      color: #0878C9;
      font-weight: 700;
      font-size: 15px;
    }
    .agenda-card {
      background: #F1F5F9;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 22px 0;
    }
    .agenda-title {
      font-weight: 700;
      color: #0F172A;
      font-size: 13px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .agenda-card ul {
      margin: 0;
      padding-left: 20px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 20px;
    }
    .btn {
      background: linear-gradient(135deg, #0878C9 0%, #0660A3 100%);
      color: #FFFFFF !important;
      padding: 15px 38px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(8, 120, 201, 0.35);
      letter-spacing: 0.3px;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748B;
      text-align: center;
      margin-top: 14px;
      word-break: break-all;
    }
    .footer {
      background-color: #F8FAFC;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
      color: #64748B;
      font-size: 12px;
    }
    .footer-logo {
      font-weight: 800;
      color: #06152F;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">⏰ Meeting Reminder</div>
        <h1>Nexora Technologies</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello ${user.name || 'Team Member'}, 👋</div>
        <p class="intro-text">
          This is a friendly reminder that today's scheduled company-wide general meeting is starting soon. Please find the meeting schedule and Google Meet joining details below:
        </p>

        <div class="meeting-card">
          <div class="card-row">
            <div class="label">Meeting Topic</div>
            <div class="value highlight">${meetingDetails.title}</div>
          </div>
          <div class="card-row">
            <div class="label">Date & Time</div>
            <div class="value">📅 ${meetingDetails.date} <br/>⏰ <strong>${meetingDetails.time}</strong></div>
          </div>
          <div class="card-row">
            <div class="label">Organizer / Host</div>
            <div class="value">👤 ${meetingDetails.organizer}</div>
          </div>
          <div class="card-row">
            <div class="label">Virtual Platform</div>
            <div class="value">📹 ${meetingDetails.platform}</div>
          </div>
        </div>

        <div class="agenda-card">
          <div class="agenda-title">📋 Meeting Agenda & Discussion Points:</div>
          <ul>
            ${agendaList}
          </ul>
        </div>

        <div class="btn-container">
          <a href="${meetingDetails.url}" class="btn" target="_blank">
            🚀 Join Google Meet Room Now
          </a>
        </div>

        <div class="link-fallback">
          Direct Link: <a href="${meetingDetails.url}" style="color: #0878C9; font-weight: 600;">${meetingDetails.url}</a>
        </div>

        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 24px;">
          <em>Tip: Please join a few minutes early to test your audio and video connection.</em>
        </p>
      </div>

      <div class="footer">
        <div class="footer-logo">NEXORA TECHNOLOGIES</div>
        <div>Empowering Next-Generation Innovation & Collaboration.</div>
        <div style="margin-top: 10px; font-size: 11px; color: #94A3B8;">
          Nexora Connect Automated Notification • Please do not reply directly to this email.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendMeetingReminders() {
  // 1. Fetch all users from Supabase
  console.log('\n📥 Step 1: Fetching all users from Supabase...');
  const { data: users, error: userError } = await client.from('users').select('*');
  
  if (userError || !users || users.length === 0) {
    console.error('❌ Failed to fetch users from Supabase:', userError);
    return;
  }

  console.log(`✅ Found ${users.length} registered users.`);

  // 2. Dispatch email to each user
  console.log('\n📧 Step 2: Sending Meeting Reminder emails via Resend API...');
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    const subject = `⏰ Reminder: Nexora Technologies General Meeting Today at 08:30 PM IST`;
    const html = renderMeetingReminderHtml(user);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Nexora Connect <${resendFrom}>`,
          to: [user.email],
          reply_to: 'contactnexoratechs@gmail.com',
          subject: subject,
          html: html
        })
      });

      const resData = await response.json();
      if (response.ok) {
        successCount++;
        console.log(`[${successCount}/${users.length}] ✅ Email delivered to ${user.name} <${user.email}> (Resend ID: ${resData.id})`);
      } else {
        failCount++;
        console.error(`❌ Failed sending to ${user.name} <${user.email}>:`, resData);
      }
    } catch (err) {
      failCount++;
      console.error(`❌ Network error sending to ${user.email}:`, err.message);
    }
  }

  // 3. Create in-app notifications in Supabase
  console.log('\n🔔 Step 3: Upserting in-app notifications for all users in Supabase...');
  const now = new Date().toISOString();
  const notifRecords = users.map((user, idx) => ({
    id: `n-meet-remind-${Date.now()}-${idx}`,
    user_id: user.id || user.email,
    title: `⏰ Meeting Reminder: Nexora Technologies General Meeting`,
    message: `General Team Meeting today at 08:30 PM IST. Join via Google Meet: ${meetingDetails.url}`,
    type: 'MEETING_REMINDER',
    read: false,
    created_at: now
  }));

  const { data: notifData, error: notifError } = await client
    .from('notifications')
    .upsert(notifRecords);

  if (notifError) {
    console.error('⚠️ Warning: Failed to insert in-app notifications:', notifError.message);
  } else {
    console.log(`✅ Successfully logged ${notifRecords.length} in-app notifications in Supabase!`);
  }

  console.log('\n====================================================');
  console.log(`🎉 BROADCAST COMPLETED!`);
  console.log(`   Total Users: ${users.length}`);
  console.log(`   Successful Emails: ${successCount}`);
  console.log(`   Failed Emails: ${failCount}`);
  console.log(`   In-App Notifications: ${notifRecords.length}`);
  console.log('====================================================\n');
}

sendMeetingReminders();
