import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Read .env
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

console.log('Supabase URL:', supabaseUrl);
console.log('Resend From:', resendFrom);
console.log('Resend Key Available:', !!resendApiKey);

const client = createClient(supabaseUrl, supabaseKey);

const newUsers = [
  {
    id: 'cathrinemary0208@gmail.com',
    email: 'cathrinemary0208@gmail.com',
    name: 'Rubena Catherine Mary',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  },
  {
    id: 'vishwakrish2006@gmail.com',
    email: 'vishwakrish2006@gmail.com',
    name: 'Vishwa K',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    designation: 'Software Associate',
    organization: 'Nexora Technologies',
    password: 'Nexora@123'
  }
];

function mapUserToDb(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatar_url: u.avatarUrl || null,
    designation: u.designation || 'Software Associate',
    organization: u.organization || 'Nexora Technologies',
    password: u.password || 'Nexora@123'
  };
}

function renderWelcomeEmail(user) {
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
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #06152F 0%, #0A2540 100%);
      padding: 36px 30px;
      text-align: center;
      border-bottom: 3px solid #0878C9;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .header p {
      color: #16B9FF;
      margin: 8px 0 0 0;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
    }
    .content {
      padding: 36px 30px;
      color: #334155;
      line-height: 1.6;
    }
    .welcome-title {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 16px;
    }
    .details-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #0878C9;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .details-row {
      margin-bottom: 12px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .label {
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .value {
      color: #0F172A;
      font-size: 14px;
      margin-top: 3px;
      font-weight: 600;
    }
    .value.mono {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      color: #0878C9;
      background: #EBF5FF;
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
    .feature-grid {
      background: #F1F5F9;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .feature-item {
      font-size: 13px;
      color: #334155;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      background: linear-gradient(135deg, #0878C9 0%, #0660A3 100%);
      color: #FFFFFF !important;
      padding: 14px 36px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(8, 120, 201, 0.3);
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
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NEXORA CONNECT</h1>
      <p>Official Employee Portal</p>
    </div>
    <div class="content">
      <div class="welcome-title">Welcome aboard, ${user.name}! 👋</div>
      <p>Your official employee portal account on <strong>Nexora Connect</strong> is provisioned and ready for access. Please use your credentials below to log in:</p>
      
      <div class="details-card">
        <div class="details-row">
          <div class="label">Portal Web Address</div>
          <div class="value"><a href="https://nexora-connect.vercel.app" style="color: #0878C9; text-decoration: none;">https://nexora-connect.vercel.app</a></div>
        </div>
        <div class="details-row">
          <div class="label">Registered Email</div>
          <div class="value mono">${user.email}</div>
        </div>
        <div class="details-row">
          <div class="label">Default Password</div>
          <div class="value mono">${user.password}</div>
        </div>
        <div class="details-row">
          <div class="label">Role & Designation</div>
          <div class="value">${user.designation} (${user.role})</div>
        </div>
        <div class="details-row">
          <div class="label">Organization</div>
          <div class="value">${user.organization}</div>
        </div>
      </div>

      <div class="feature-grid">
        <div style="font-weight: 700; color: #1E293B; font-size: 13px; margin-bottom: 8px;">What you can do on Nexora Connect:</div>
        <div class="feature-item">📅 <strong>Interactive Webinars:</strong> Register & attend masterclasses hosted by industry leaders.</div>
        <div class="feature-item">⏰ <strong>Meeting Scheduler:</strong> Schedule & join team meetings via Google Meet, Zoom, or MS Teams.</div>
        <div class="feature-item">📚 <strong>Knowledge Wiki:</strong> Access tech notes, architecture documents & best practices.</div>
        <div class="feature-item">📹 <strong>Recordings Archive:</strong> Access replays of webinars, trainings, and technical discussions.</div>
        <div class="feature-item">🎫 <strong>Support Desk:</strong> Raise and track support tickets with the team.</div>
        <div class="feature-item">📢 <strong>Company Broadcasts:</strong> Stay updated with important organizational announcements.</div>
      </div>

      <div class="btn-container">
        <a href="https://nexora-connect.vercel.app" class="btn" target="_blank">Access Nexora Connect</a>
      </div>
      
      <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">
        <em>Security Tip: We recommend updating your default password after your first login by navigating to Settings &gt; Profile in your dashboard.</em>
      </p>
    </div>
    <div class="footer">
      <div class="footer-logo">NEXORA TECHNOLOGIES</div>
      <div>Empowering Next-Generation Innovation & Collaboration.</div>
      <div style="margin-top: 10px; font-size: 11px; color: #94A3B8;">This is an automated notification. Please do not reply directly to this email.</div>
    </div>
  </div>
</body>
</html>
  `;
}

async function run() {
  console.log('\n--- 1. Upserting Users into Supabase ---');
  for (const user of newUsers) {
    const dbUser = mapUserToDb(user);
    const { data, error } = await client.from('users').upsert(dbUser, { onConflict: 'email' });
    if (error) {
      console.error(`Error adding user ${user.email} to Supabase:`, error.message);
    } else {
      console.log(`[Supabase] Successfully added/updated: ${user.name} (${user.email})`);
    }
  }

  console.log('\n--- 2. Sending Welcome Emails via Resend API ---');
  for (const user of newUsers) {
    const subject = `Welcome to Nexora Connect — Your Account Details & Access Portal`;
    const html = renderWelcomeEmail(user);
    
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
          subject: subject,
          html: html
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`[Resend API Success] Email sent to ${user.name} <${user.email}>. Resend ID: ${resData.id}`);
      } else {
        console.error(`[Resend API Error] Failed sending to ${user.email}:`, resData);
      }
    } catch (err) {
      console.error(`[Network Error] Failed sending to ${user.email}:`, err);
    }
  }

  console.log('\n--- 3. Verifying Users in Supabase ---');
  const { data: allUsers, error: listError } = await client.from('users').select('*');
  if (listError) {
    console.error('Error fetching users:', listError.message);
  } else {
    console.log(`Total users in Supabase: ${allUsers.length}`);
    const added = allUsers.filter(u => newUsers.some(nu => nu.email === u.email));
    console.log('Confirmed added users:', added.map(u => `${u.name} (${u.email})`));
  }
}

run();
