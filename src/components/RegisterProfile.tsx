import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  Briefcase, 
  Camera, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import type { User } from '../services/database';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
];

export const RegisterProfile: React.FC = () => {
  const { db, setCurrentUser, setCurrentTab, triggerRefresh } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [organization, setOrganization] = useState('Nexora Technologies');
  const [role, setRole] = useState<'EMPLOYEE' | 'ADMIN'>('EMPLOYEE');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState('');

  // Status states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg(false);

    // Basic Validation
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already exists
      const existingUser = db.getUser(email.trim().toLowerCase());
      if (existingUser) {
        setErrorMsg('This email address is already registered.');
        setIsSubmitting(false);
        return;
      }

      // Determine final avatar URL
      const finalAvatarUrl = customAvatar.trim() || avatarUrl;

      // Construct new user
      const newUser: User = {
        id: email.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: role,
        avatarUrl: finalAvatarUrl,
        designation: designation.trim() || 'Associate Engineer',
        organization: organization.trim() || 'Nexora Technologies',
        password: password
      };

      // Add to database & local storage
      db.updateUser(newUser);

      // Create log
      db.createAuditLog(
        newUser.email,
        newUser.name,
        'REGISTER_NEW_USER',
        'User',
        newUser.id
      );

      // Create welcome notification
      db.createNotification(
        newUser.email,
        'Welcome to Nexora Connect!',
        `Hello ${newUser.name}, your account has been successfully registered. Explore webinars, schedule meetings, and connect with team members.`,
        'ANNOUNCEMENT'
      );

      setSuccessMsg(true);
      setIsSubmitting(false);

      // Wait a short moment for the user to see the success message, then sign them in and redirect
      setTimeout(() => {
        setCurrentUser(newUser);
        setCurrentTab('dashboard');
        triggerRefresh();
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-slide-up">
      {/* Page Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          Register New Account
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Create your employee profile to get started with Nexora Connect.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-6 md:p-8 premium-shadow">
        
        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center space-x-2 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Success! Profile created. Signing you in...</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Section 1: Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b pb-1.5 border-slate-100 dark:border-slate-800">
              Account Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Connor"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@nexora.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Profile Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b pb-1.5 border-slate-100 dark:border-slate-800">
              Workplace Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                  Designation / Role Title
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase size={15} />
                  </span>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Senior Frontend Developer"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                  Company / Organization
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building size={15} />
                  </span>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Nexora Technologies"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* System Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                System Role Access
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('EMPLOYEE')}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    role === 'EMPLOYEE'
                      ? 'border-nexora-blue bg-nexora-blue/5 text-nexora-blue dark:text-nexora-electric dark:border-nexora-electric/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <span>EMPLOYEE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    role === 'ADMIN'
                      ? 'border-nexora-blue bg-nexora-blue/5 text-nexora-blue dark:text-nexora-electric dark:border-nexora-electric/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                  }`}
                >
                  <span>ADMINISTRATOR</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Avatar Selector */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b pb-1.5 border-slate-100 dark:border-slate-800">
              Profile Avatar
            </h3>
            
            {/* Quick Avatar selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
                Choose a pre-set avatar
              </label>
              <div className="flex flex-wrap gap-3">
                {PRESET_AVATARS.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setCustomAvatar('');
                    }}
                    className={`relative w-12 h-12 rounded-full border-2 overflow-hidden transition-all hover:scale-105 active:scale-95 ${
                      avatarUrl === url && !customAvatar
                        ? 'border-nexora-blue dark:border-nexora-electric scale-105 ring-2 ring-nexora-blue/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Avatar URL option */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                Or enter custom Avatar URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Camera size={15} />
                </span>
                <input
                  type="url"
                  value={customAvatar}
                  onChange={(e) => {
                    setCustomAvatar(e.target.value);
                  }}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-dark-bg/40 text-slate-900 dark:text-slate-150 focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-150 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold flex items-center space-x-1.5 shadow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{isSubmitting ? 'Registering...' : 'Register Profile'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
