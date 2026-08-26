import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Bell, 
  ShieldAlert, 
  CheckCircle,
  Server
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
  const [emailApiKey, setEmailApiKey] = useState(() => localStorage.getItem('nexora_email_api_key') || '');
  const [emailFrom, setEmailFrom] = useState(() => localStorage.getItem('nexora_email_from') || 'onboarding@resend.dev');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('nexora_supabase_url') || (import.meta.env.VITE_SUPABASE_URL as string) || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('nexora_supabase_anon_key') || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '');
  const [syncingStatus, setSyncingStatus] = useState<'idle' | 'testing' | 'syncing' | 'success' | 'error'>('idle');
  const [connectionResult, setConnectionResult] = useState<string>('');

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
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sender Email ("From Address")</label>
                        <input
                          type="text"
                          value={emailFrom}
                          onChange={(e) => setEmailFrom(e.target.value)}
                          placeholder="onboarding@resend.dev"
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                        />
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

        </div>

      </div>

    </div>
  );
};
