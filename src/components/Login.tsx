import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface LoginProps {
  onToggleView: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView }) => {
  const { db, setCurrentUser, setCurrentTab, triggerRefresh } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg(false);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate login verification
    setTimeout(() => {
      const user = db.getUser(email.trim().toLowerCase());
      
      if (!user) {
        setErrorMsg('No account found with this email address.');
        setIsSubmitting(false);
        return;
      }

      // Check password
      const savedPassword = user.password || 'Nexora@123'; // Default fallback
      if (password !== savedPassword) {
        setErrorMsg('Incorrect password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(true);
      setIsSubmitting(false);

      // Sign user in and redirect to dashboard
      setTimeout(() => {
        setCurrentUser(user);
        setCurrentTab('dashboard');
        triggerRefresh();
      }, 1000);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto my-12 animate-slide-up">
      {/* Brand logo & header */}
      <div className="mb-8 text-center">
        <div className="inline-flex bg-gradient-to-r from-nexora-blue to-nexora-electric text-white p-3.5 rounded-2xl font-bold text-2xl shadow-lg mb-4 animate-pulse-subtle">
          N
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Sign in to access your Nexora Connect dashboard.
        </p>
      </div>

      {/* Login Card */}
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
            <span>Successfully authenticated! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
              Email Address
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

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                Password
              </label>
              <a href="#forgot" className="text-[10px] text-nexora-blue dark:text-nexora-electric hover:underline font-semibold">
                Forgot password?
              </a>
            </div>
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

          {/* Remember me & Secure banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-455 py-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-slate-300 dark:border-slate-800 dark:bg-dark-bg text-nexora-blue focus:ring-0 focus:ring-offset-0" />
              <span>Remember this device</span>
            </label>
            <span className="flex items-center text-[10px] text-emerald-500 font-medium">
              <ShieldCheck size={12} className="mr-1" /> SSL Secured
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ChevronRight size={14} />
          </button>
        </form>

        {/* Toggle to register */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-455 border-t border-slate-150 dark:border-slate-800/80 pt-5">
          <span>Don't have an account? </span>
          <button
            onClick={onToggleView}
            className="text-nexora-blue dark:text-nexora-electric hover:underline font-bold"
          >
            Register Profile
          </button>
        </div>

      </div>
    </div>
  );
};
