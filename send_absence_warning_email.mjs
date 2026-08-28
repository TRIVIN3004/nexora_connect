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

console.log('====================================================');
console.log('⚠️  NEXORA TECHNOLOGIES — ABSENCE WARNING NOTICES');
console.log('====================================================');
console.log('Supabase URL:', supabaseUrl);
console.log('Resend From:', resendFrom);
console.log('Resend Key Active:', !!resendApiKey);

const client = createClient(supabaseUrl, supabaseKey);

// Meeting Information for Context
const missedMeetingDetails = {
  title: 'Nexora Technologies — General Team Meeting & Roadmap Sync',
  date: 'Thursday, August 27, 2026',
  time: '08:30 PM – 09:30 PM IST',
  organizer: 'TRIVIN S (Founder & Lead)',
  portalUrl: 'https://nexora-connect.pages.dev' // or local portal
};

// Target list of students / members who were ABSENT from today's meeting
const absentUsersList = [
  { name: 'M. Srijith', email: 'srikreekszoldych@gmail.com', designation: 'Software Associate' },
  { name: 'Sivaranjani', email: 'sivaranjanisumathi75@gmail.com', designation: 'Software Associate' },
  { name: 'Pavithraa S', email: 'pavithraayohan@gmail.com', designation: 'Software Associate' },
  { name: 'Raghul Prasath A', email: 'justinsam1902@gmail.com', designation: 'Software Associate' },
  { name: 'Sankar R', email: 'sankarleo23@gmail.com', designation: 'Software Associate' },
  { name: 'Santhoshraj V', email: 'santho06raj@gmail.com', designation: 'Software Associate' },
  { name: 'M. Dinesh Kumar', email: 'dineshkumar.muthuvel2011@gmail.com', designation: 'Technical Associate' },
  { name: 'Pathmavathi S', email: 'pathmavathis2005@gmail.com', designation: 'Software Associate' },
  { name: 'Pooja V', email: 'poojavellingiri15@gmail.com', designation: 'Software Associate' },
  { name: 'Mohammad Farman Ahmed Naujawan H', email: 'naujawanf@gmail.com', designation: 'Software Associate' },
  { name: 'Yani Muizz H', email: 'yani.muizz2008@gmail.com', designation: 'Software Associate' },
  { name: 'Sanjay S', email: 'sanjayselvakumar550@gmail.com', designation: 'Software Associate' },
  { name: 'Sanjay c', email: 'sanjayvijay20051512@gmail.com', designation: 'Software Associate' },
  { name: 'Aaryan', email: 'aaryanjain950@gmail.com', designation: 'Software Associate' },
  { name: 'M Gokulashri', email: 'mgokulashri944@gmail.com', designation: 'Software Associate' },
  { name: 'ROHITH M', email: 'mrohith0089@gmail.com', designation: 'Software Associate' },
  { name: 'Dharsha raj S R', email: 'srdharshanraj@gmail.com', designation: 'Software Associate' },
  { name: 'Bharath G', email: 'bharathgandhi92@gmail.com', designation: 'Software Associate' },
  { name: 'Anish K', email: 'anish30092007@gmail.com', designation: 'Software Associate' }
];

function renderAbsenceWarningHtml(user) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Notice: Meeting Absence & Mandatory Attendance — Nexora Technologies</title>
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
      padding: 35px 15px;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #06152F 0%, #0F2744 100%);
      padding: 36px 30px 28px;
      text-align: center;
      border-bottom: 4px solid #DC2626;
    }
    .badge-warning {
      display: inline-block;
      background: rgba(220, 38, 38, 0.18);
      border: 1px solid #EF4444;
      color: #FCA5A5;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 5px 16px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .content {
      padding: 32px 30px;
      color: #334155;
      line-height: 1.65;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 14px;
    }
    .alert-box {
      background-color: #FEF2F2;
      border-left: 4px solid #DC2626;
      border-radius: 6px;
      padding: 16px 18px;
      margin: 18px 0 24px;
      color: #991B1B;
      font-size: 14px;
      font-weight: 500;
    }
    .details-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .card-row {
      margin-bottom: 12px;
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
    .directive-card {
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
      border: 1px solid #FCD34D;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .directive-title {
      font-weight: 800;
      color: #92400E;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    .directive-list {
      margin: 0;
      padding-left: 20px;
      color: #78350F;
      font-size: 13.5px;
    }
    .directive-list li {
      margin-bottom: 8px;
    }
    .directive-list li:last-child {
      margin-bottom: 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 16px;
    }
    .btn {
      background: linear-gradient(135deg, #0878C9 0%, #0660A3 100%);
      color: #FFFFFF !important;
      padding: 14px 34px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(8, 120, 201, 0.35);
      letter-spacing: 0.3px;
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
    .footer-warning {
      color: #94A3B8;
      font-size: 11px;
      margin-top: 10px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      
      <!-- Top Header -->
      <div class="header">
        <div class="badge-warning">⚠️ Official Attendance Notice</div>
        <h1>Nexora Technologies</h1>
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="greeting">Dear ${user.name || 'Team Member'},</div>
        
        <div class="alert-box">
          <strong>Notice:</strong> Records indicate that you were <strong>ABSENT</strong> during today's scheduled mandatory General Team Meeting without prior approved leave or intimation.
        </div>

        <p style="font-size: 14px; color: #475569;">
          This official communication serves as a formal notice regarding your non-attendance. General syncs, team discussions, and roadmap reviews are vital for our engineering workflows, project progress tracking, and performance assessments.
        </p>

        <!-- Missed Meeting Overview -->
        <div class="details-card">
          <div class="card-row">
            <div class="label">Missed Session</div>
            <div class="value">${missedMeetingDetails.title}</div>
          </div>
          <div class="card-row">
            <div class="label">Date & Time</div>
            <div class="value">📅 ${missedMeetingDetails.date} &nbsp;•&nbsp; ⏰ ${missedMeetingDetails.time}</div>
          </div>
          <div class="card-row">
            <div class="label">Session Host</div>
            <div class="value">👤 ${missedMeetingDetails.organizer}</div>
          </div>
        </div>

        <!-- Mandatory Action Directives -->
        <div class="directive-card">
          <div class="directive-title">📌 MANDATORY DIRECTIVES & NEXT STEPS:</div>
          <ol class="directive-list">
            <li><strong>Compulsory Attendance:</strong> Your presence in all upcoming team meetings, standups, and review calls is strictly <strong>mandatory</strong>. Repeated unexcused absences will impact your internship / employment standing and evaluation records.</li>
            <li><strong>Provide Explanation:</strong> Please reply directly to this email or reach out to the Team Lead (<a href="mailto:contactnexoratechs@gmail.com" style="color: #92400E; font-weight: 700;">contactnexoratechs@gmail.com</a>) within 24 hours detailing the reason for your absence today.</li>
            <li><strong>Sync Missed Updates:</strong> Log in to the Nexora Connect portal to review recent announcements, updates, and upcoming calendar schedules.</li>
            <li><strong>Prior Notice:</strong> If an unforeseen emergency arises in the future, you are required to submit an official intimation in advance.</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #475569; margin-top: 20px;">
          Please treat this matter with immediate priority and ensure punctuality and full participation in our upcoming sessions.
        </p>

        <div class="btn-container">
          <a href="mailto:contactnexoratechs@gmail.com?subject=Explanation%20for%20Meeting%20Absence%20-%20${encodeURIComponent(user.name)}" class="btn" target="_blank">
            ✉️ Submit Reason for Absence
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-logo">NEXORA TECHNOLOGIES</div>
        <div>Engineering Excellence & Collaborative Innovation</div>
        <div class="footer-warning">
          This is an official automated notification from Nexora Connect Administration.<br/>
          For inquiries or assistance, reach out to <a href="mailto:contactnexoratechs@gmail.com" style="color: #0878C9;">contactnexoratechs@gmail.com</a>.
        </div>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

async function sendAbsenceWarnings() {
  console.log(`\n📋 Preparing to send official absence warnings to ${absentUsersList.length} members:\n`);
  absentUsersList.forEach((u, i) => console.log(`   ${i + 1}. ${u.name} <${u.email}> (${u.designation})`));

  let successCount = 0;
  let failCount = 0;

  console.log('\n📧 Dispatching emails via Resend API...\n');

  for (let i = 0; i < absentUsersList.length; i++) {
    const user = absentUsersList[i];
    const subject = `⚠️ Official Notice: Absence from Scheduled Team Meeting & Mandatory Attendance — Nexora Technologies`;
    const html = renderAbsenceWarningHtml(user);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `Nexora Administration <${resendFrom}>`,
          to: [user.email],
          reply_to: 'contactnexoratechs@gmail.com',
          subject: subject,
          html: html
        })
      });

      const resData = await response.json();
      if (response.ok) {
        successCount++;
        console.log(`[${i + 1}/${absentUsersList.length}] ✅ Delivered to ${user.name} <${user.email}> (ID: ${resData.id})`);
      } else {
        failCount++;
        console.error(`[${i + 1}/${absentUsersList.length}] ❌ Failed for ${user.name} <${user.email}>:`, resData);
      }
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${absentUsersList.length}] ❌ Network error for ${user.email}:`, err.message);
    }

    // Rate-limiting delay (150ms between requests to avoid API burst limits)
    await new Promise(r => setTimeout(r, 150));
  }

  // Also log in-app warnings in Supabase
  console.log('\n🔔 Logging in-app warning notifications in Supabase...');
  const now = new Date().toISOString();
  const notifRecords = absentUsersList.map((user, idx) => ({
    id: `n-absent-warn-${Date.now()}-${idx}`,
    user_id: user.email,
    title: `⚠️ Notice of Non-Attendance: General Team Meeting`,
    message: `You were marked absent for today's scheduled General Team Meeting. Attendance is compulsory for all upcoming meetings. Please submit your reason for absence.`,
    type: 'WARNING',
    read: false,
    created_at: now
  }));

  try {
    const { error: notifError } = await client
      .from('notifications')
      .upsert(notifRecords);

    if (notifError) {
      console.error('⚠️ Supabase in-app notifications warning:', notifError.message);
    } else {
      console.log(`✅ Successfully logged ${notifRecords.length} in-app warning notifications in Supabase.`);
    }
  } catch (err) {
    console.error('⚠️ Supabase notification insert error:', err.message);
  }

  console.log('\n====================================================');
  console.log(`🏁 ABSENCE NOTICE BROADCAST SUMMARY:`);
  console.log(`   Total Absent Recipients: ${absentUsersList.length}`);
  console.log(`   Successfully Delivered:  ${successCount}`);
  console.log(`   Failed Deliveries:       ${failCount}`);
  console.log(`   In-App Notices Logged:   ${notifRecords.length}`);
  console.log('====================================================\n');
}

sendAbsenceWarnings();
