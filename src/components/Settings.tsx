import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Bell, 
  ShieldAlert, 
  CheckCircle,
  Server,
  Lock,
  Key,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle
} from 'lucide-react';
import type { NotificationPreference } from '../services/database';

export const Settings: React.FC = () => {
  const { db, currentUser, setCurrentUser, refreshKey, triggerRefresh } = useApp();

  const [successMsg, setSuccessMsg] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileDesig, setProfileDesig] = useState(currentUser.designation || '');
  const [profileOrg, setProfileOrg] = useState(currentUser.organization || 'Nexora Technologies');
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatarUrl || '');

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Notifications preferences
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [remind24h, setRemind24h] = useState(true);
  const [remind1h, setRemind1h] = useState(true);
  const [remind15m, setRemind15m] = useState(true);

  // System Settings (Admin Only)
  const [smtpHost, setSmtpHost] = useState(() => localStorage.getItem('nexora_smtp_host') || 'smtp.nexora.com');
  const [smtpPort, setSmtpPort] = useState(() => localStorage.getItem('nexora_smtp_port') || '587');
  const [emailProvider, setEmailProvider] = useState(() => localStorage.getItem('nexora_email_provider') || 'Resend');
  const [moderationEnabled, setModerationEnabled] = useState(() => {
    const saved = localStorage.getItem('nexora_note_moderation');
    return saved === 'false' ? false : true; // Default to true
  });
  const [emailApiKey, setEmailApiKey] = useState(() => localStorage.getItem('nexora_email_api_key') || (import.meta.env.VITE_RESEND_API_KEY as string) || '');
  const [emailFrom, setEmailFrom] = useState(() => localStorage.getItem('nexora_email_from') || (import.meta.env.VITE_RESEND_FROM_EMAIL as string) || 'connect@mail.nexoratechs.xyz');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('nexora_supabase_url') || (import.meta.env.VITE_SUPABASE_URL as string) || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('nexora_supabase_anon_key') || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '');
  const [syncingStatus, setSyncingStatus] = useState<'idle' | 'testing' | 'syncing' | 'success' | 'error'>('idle');
  const [connectionResult, setConnectionResult] = useState<string>('');
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailTestMsg, setEmailTestMsg] = useState<string>('');

  // Load preferences
  useEffect(() => {
    const prefs = db.getUserPreferences(currentUser.email);
    setEmailEnabled(prefs.emailEnabled);
    setInAppEnabled(prefs.inAppEnabled);
    setRemind24h(prefs.meetingReminders.includes('24H'));
    setRemind1h(prefs.meetingReminders.includes('1H'));
    setRemind15m(prefs.meetingReminders.includes('15M'));

    // Sync profile states
    setProfileName(currentUser.name);
    setProfileDesig(currentUser.designation || '');
    setProfileOrg(currentUser.organization || 'Nexora Technologies');
    setProfileAvatar(currentUser.avatarUrl || '');
  }, [currentUser, refreshKey]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save Profile Updates
    const updatedUser = {
      ...currentUser,
      name: profileName,
      designation: profileDesig,
      organization: profileOrg,
      avatarUrl: profileAvatar
    };
    db.updateUser(updatedUser);
    setCurrentUser(updatedUser);

    // 2. Save Notification Preferences
    const meetingReminders: ('24H' | '1H' | '15M')[] = [];
    if (remind24h) meetingReminders.push('24H');
    if (remind1h) meetingReminders.push('1H');
    if (remind15m) meetingReminders.push('15M');

    const updatedPrefs: NotificationPreference = {
      userId: currentUser.email,
      emailEnabled,
      inAppEnabled,
      meetingReminders,
      webinarReminders: remind24h ? ['24H', '1H'] : ['1H']
    };
    db.updateUserPreferences(updatedPrefs);

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
    triggerRefresh();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    const actualPassword = currentUser.password || 'Nexora@123';
    if (currentPassword !== actualPassword) {
      setPassError('Current password is incorrect. Please enter your existing password.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError('New password and confirmation password do not match.');
      return;
    }

    const updatedUser = {
      ...currentUser,
      password: newPassword
    };

    db.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setPassSuccess('Password updated successfully! Please use your new password on your next sign in.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    triggerRefresh();
  };

  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nexora_smtp_host', smtpHost);
    localStorage.setItem('nexora_smtp_port', smtpPort);
    localStorage.setItem('nexora_email_provider', emailProvider);
    localStorage.setItem('nexora_email_api_key', emailApiKey);
    localStorage.setItem('nexora_email_from', emailFrom);
    localStorage.setItem('nexora_supabase_url', supabaseUrl);
    localStorage.setItem('nexora_supabase_anon_key', supabaseAnonKey);
    localStorage.setItem('nexora_note_moderation', String(moderationEnabled));

    db.initSupabase();
    db.syncFromSupabase();

    db.createAuditLog(currentUser.email, currentUser.name, 'UPDATE_SYSTEM_SETTINGS', 'SystemConfig', 'global');
    
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
    triggerRefresh();
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionResult('Please enter both Supabase URL and Anon Key first.');
      return;
    }
    setSyncingStatus('testing');
    setConnectionResult('Connecting to Supabase...');
    try {
      const normalizedUrl = supabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
      const tempClient = createClient(normalizedUrl, supabaseAnonKey);
      const { error } = await tempClient.from('users').select('id').limit(1);
      if (error) {
        setConnectionResult(`Connection failed: ${error.message}`);
        setSyncingStatus('error');
      } else {
        setConnectionResult('Connection successful! Connected to Supabase backend.');
        setSyncingStatus('success');
      }
    } catch (e: any) {
      setConnectionResult(`Connection failed: ${e.message || e}`);
      setSyncingStatus('error');
    }
  };

  const handleForceSync = async () => {
    setSyncingStatus('syncing');
    setConnectionResult('Syncing with Supabase...');
    try {
      await db.syncFromSupabase();
      setSyncingStatus('success');
      setConnectionResult('Database synced successfully with Supabase!');
      triggerRefresh();
    } catch (e: any) {
      setSyncingStatus('error');
      setConnectionResult(`Sync failed: ${e.message || e}`);
    }
  };

  const handleTestEmail = async () => {
    setEmailTestStatus('sending');
    setEmailTestMsg('Dispatching test message through Resend API...');
    try {
      const fromAddr = emailFrom && !emailFrom.includes('@gmail.com') && !emailFrom.includes('onboarding@resend.dev')
        ? emailFrom
        : 'connect@mail.nexoratechs.xyz';

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `Nexora Connect <${fromAddr}>`,
          to: [currentUser.email],
          reply_to: 'contactnexoratechs@gmail.com',
          subject: '[🧪 Resend Test] Nexora Connect Mail Relay Verification',
          html: `<div style="font-family:sans-serif;padding:20px;border-radius:8px;background:#F8FAFC;border:1px solid #E2E8F0;">
            <h2 style="color:#0878C9;margin:0 0 10px 0;">Nexora Connect Mail Relay Live Test</h2>
            <p>Your Resend email configuration is active and communicating properly!</p>
            <p><strong>Recipient:</strong> ${currentUser.email}</p>
            <p><strong>Sender Domain:</strong> ${fromAddr}</p>
            <p style="font-size:11px;color:#94A3B8;margin-top:20px;">Sent via Nexora Connect Admin Panel.</p>
          </div>`,
          apiKey: emailApiKey
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        setEmailTestStatus('success');
        setEmailTestMsg(`✅ Test email delivered to ${currentUser.email}! (Resend ID: ${data.id})`);
      } else {
        setEmailTestStatus('error');
        setEmailTestMsg(`❌ Delivery error: ${data.error || data.message || JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setEmailTestStatus('error');
      setEmailTestMsg(`❌ Network dispatch failed: ${err?.message || err}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      
      {/* Subheader */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Adjust profile info, customize calendar alert timings, and check system configurations.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center animate-fade-in">
          <CheckCircle size={16} className="mr-2" /> Configurations saved successfully!
        </div>
      )}

      {/* Grid of Settings sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Card: Profile Details Form (2/3) */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-4 flex items-center">
              <User className="w-4 h-4 mr-1 text-slate-400" /> Profile Configurations
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Work Email</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={profileDesig}
                    onChange={(e) => setProfileDesig(e.target.value)}
                    placeholder="e.g. Frontend Intern"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Organization</label>
                  <input
                    type="text"
                    value={profileOrg}
                    onChange={(e) => setProfileOrg(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>

              {/* Notification Preferences Sub-form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center">
                  <Bell className="w-3.5 h-3.5 mr-1" /> Alert Preferences
                </h4>
                
                <div className="space-y-3.5">
                  <label className="flex items-center space-x-2.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-nexora-blue focus:ring-nexora-blue w-4 h-4"
                    />
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200">Email Notifications Sandbox Logs</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Route copy alerts into Admin console sandbox logs inbox.</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inAppEnabled}
                      onChange={(e) => setInAppEnabled(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-nexora-blue focus:ring-nexora-blue w-4 h-4"
                    />
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-200">In-App Notification Center</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Show notifications unread badges alerts in header bell.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Timings checklists */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Meeting Reminders Timeline</span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remind24h}
                      onChange={(e) => setRemind24h(e.target.checked)}
                      className="rounded text-nexora-blue focus:ring-nexora-blue"
                    />
                    <span>24 hours before</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remind1h}
                      onChange={(e) => setRemind1h(e.target.checked)}
                      className="rounded text-nexora-blue"
                    />
                    <span>1 hour before</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remind15m}
                      onChange={(e) => setRemind15m(e.target.checked)}
                      className="rounded text-nexora-blue"
                    />
                    <span>15 minutes before</span>
                  </label>
                </div>
              </div>

              {/* Save profile */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
                >
                  Save Profile Settings
                </button>
              </div>

            </form>
          </div>

          {/* Security & Password Change Card */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-4 flex items-center">
              <Lock className="w-4 h-4 mr-1 text-nexora-blue" /> Security & Password
            </h3>

            {passSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center animate-fade-in">
                <CheckCircle size={16} className="mr-2 shrink-0 text-emerald-500" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center animate-fade-in">
                <AlertCircle size={16} className="mr-2 shrink-0 text-red-500" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-3 pr-10 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    New Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-3 pr-10 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-nexora-blue font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Default initial company password is <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px] text-slate-600 dark:text-slate-300">Nexora@123</code>
                </p>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-nexora-blue to-sky-600 hover:from-nexora-blue/90 hover:to-sky-700 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Key size={13} />
                  <span>Update Password</span>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right Card: Admin SMTP Settings (1/3) */}
        <div className="space-y-6">
          
          {currentUser.role === 'ADMIN' ? (
            <div className="space-y-6">
              {/* Admin SMTP Settings */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-4 flex items-center">
                  <Server className="w-4 h-4 mr-1 text-slate-400" /> Admin Mail Relay (SMTP)
                </h3>

                <form onSubmit={handleSaveAdminSettings} className="space-y-4">
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Service API</label>
                    <select
                      value={emailProvider}
                      onChange={(e) => setEmailProvider(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    >
                      <option value="Resend">Resend (Corporate Preferred)</option>
                      <option value="SendGrid">SendGrid API</option>
                      <option value="Amazon SES">Amazon SES</option>
                      <option value="Local SMTP Relay">Custom SMTP Port</option>
                    </select>
                  </div>

                  {emailProvider === 'Resend' && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resend API Key</label>
                        <input
                          type="password"
                          value={emailApiKey}
                          onChange={(e) => setEmailApiKey(e.target.value)}
                          placeholder="re_xxxxxxxxxxxxxxxx"
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">Configured in production via <code className="text-nexora-blue font-mono">VITE_RESEND_API_KEY</code></p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sender Email ("From Address")</label>
                        <input
                          type="text"
                          value={emailFrom}
                          onChange={(e) => setEmailFrom(e.target.value)}
                          placeholder="connect@mail.nexoratechs.xyz"
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                        />
                        <p className="text-[9px] text-amber-500/90 mt-1">Verified sender domain: <strong>connect@mail.nexoratechs.xyz</strong></p>
                      </div>

                      {/* Live Test Email Button */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Test Connection</span>
                          <button
                            type="button"
                            onClick={handleTestEmail}
                            disabled={emailTestStatus === 'sending'}
                            className="px-2.5 py-1 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {emailTestStatus === 'sending' ? 'Sending...' : '🧪 Send Test Email'}
                          </button>
                        </div>
                        {emailTestMsg && (
                          <div className={`p-2 rounded text-[10px] font-semibold leading-relaxed ${
                            emailTestStatus === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : emailTestStatus === 'error'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          }`}>
                            {emailTestMsg}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SMTP Host URL</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SMTP Port</label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Note Moderation Setting */}
                  <div className="pt-2">
                    <label className="flex items-center space-x-2.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={moderationEnabled}
                        onChange={(e) => setModerationEnabled(e.target.checked)}
                        className="rounded text-nexora-blue focus:ring-nexora-blue w-4 h-4"
                      />
                      <div>
                        <strong className="block text-slate-800 dark:text-slate-200">Moderate Knowledge Notes</strong>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Submitted notes require approval prior to publishing.</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
                    >
                      Save System Settings
                    </button>
                  </div>

                </form>
              </div>

              {/* Supabase Cloud Database Config */}
              <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-4 flex items-center">
                  <Server className="w-4 h-4 mr-1 text-slate-400" /> Supabase Database Config
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Supabase Project URL</label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xxxxxxxxxxxxx.supabase.co"
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Supabase Anon API Key</label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOi..."
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                    />
                  </div>

                  {connectionResult && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${
                      syncingStatus === 'success'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : syncingStatus === 'error'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                    }`}>
                      {connectionResult}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={syncingStatus === 'testing'}
                      className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all text-center"
                    >
                      Test Connection
                    </button>
                    <button
                      type="button"
                      onClick={handleForceSync}
                      disabled={!db.isSupabaseConnected() || syncingStatus === 'syncing'}
                      className="flex-1 py-2 bg-nexora-blue hover:bg-nexora-blue/90 disabled:opacity-40 disabled:hover:bg-nexora-blue text-white rounded-lg text-xs font-semibold flex justify-center items-center shadow-md active:scale-95 transition-all text-center"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-950/20 p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 text-center text-slate-400">
              <ShieldAlert className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Client Console System</h4>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                Relay API credentials and moderation hooks can only be verified by ADMIN staff accounts.
              </p>
            </div>
          )}

          {/* Account Session & Sign Out Card */}
          <div className="bg-white dark:bg-dark-card rounded-xl border border-slate-200 dark:border-dark-border premium-shadow p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center">
              <LogOut className="w-4 h-4 mr-1.5 text-red-500" /> Account Session
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 object-cover shrink-0" 
              />
              <div className="truncate min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                <div className="text-[9px] text-slate-400 capitalize">{currentUser.role} Account</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Need to end your current workspace session on this device?
            </p>

            <button
              type="button"
              onClick={() => setCurrentUser(null)}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut size={14} />
              <span>Sign Out of Nexora Connect</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
