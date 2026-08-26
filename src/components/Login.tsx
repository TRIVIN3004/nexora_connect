import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface LoginProps {
  onToggleView: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleView }) => {
  const { db, setCurrentUser, setCurrentTab, triggerRefresh, setTheme } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

      // Sign user in and redirect to dashboard in light theme
      setTimeout(() => {
        setTheme('light');
        localStorage.setItem('nexora_theme', 'light');
        const root = window.document.documentElement;
        root.classList.remove('dark');
        root.style.backgroundColor = '#F8FAFC';
        setCurrentUser(user);
        setCurrentTab('dashboard');
        triggerRefresh();
      }, 800);
    }, 600);
  };

  const fillQuickLogin = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg('');
  };

  return (
    <div className="max-w-md w-full mx-auto my-6 animate-slide-up">
      {/* Brand logo & header */}
      <div className="mb-6 text-center flex flex-col items-center">
        <div className="relative mb-3">
          <img 
            src="/logo.jpg" 
            alt="Nexora Connect Logo" 
            className="w-16 h-16 object-contain rounded-2xl shadow-md border border-slate-200 bg-white p-1" 
          />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to access your Nexora Connect workspace
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-200/60">
        
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2 animate-shake">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>Successfully authenticated! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
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
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-nexora-blue/20 focus:border-nexora-blue focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a href="#forgot" className="text-[10px] text-nexora-blue hover:text-nexora-blue/80 hover:underline font-semibold">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-nexora-blue/20 focus:border-nexora-blue focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember me & Secure banner */}
          <div className="flex items-center justify-between text-xs text-slate-600 py-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-nexora-blue focus:ring-nexora-blue/20" 
              />
              <span>Remember this device</span>
            </label>
            <span className="flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck size={12} className="mr-1 text-emerald-600" /> SSL Secured
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-nexora-blue to-nexora-electric text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-nexora-blue/25 hover:shadow-lg hover:shadow-nexora-blue/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Nexora'}</span>
            <ChevronRight size={14} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              <Sparkles size={11} className="mr-1 text-amber-500" /> Quick Demo Accounts:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Pass: Nexora@123</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickLogin('contact@nexoratechs.com', 'Nexora@123')}
              className="px-2.5 py-2 rounded-xl text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            >
              <div className="font-semibold text-slate-800">👑 Admin</div>
              <div className="text-[9px] text-slate-400 truncate">contact@nexoratechs.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin('admin@nexora.com', 'Nexora@123')}
              className="px-2.5 py-2 rounded-xl text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            >
              <div className="font-semibold text-slate-800">⭐ Director</div>
              <div className="text-[9px] text-slate-400 truncate">admin@nexora.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin('employee@nexora.com', 'Nexora@123')}
              className="px-2.5 py-2 rounded-xl text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            >
              <div className="font-semibold text-slate-800">💼 Engineer</div>
              <div className="text-[9px] text-slate-400 truncate">employee@nexora.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickLogin('intern@nexora.com', 'Nexora@123')}
              className="px-2.5 py-2 rounded-xl text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-left transition-all hover:border-slate-300 active:scale-95 cursor-pointer"
            >
              <div className="font-semibold text-slate-800">🎓 Intern</div>
              <div className="text-[9px] text-slate-400 truncate">intern@nexora.com</div>
            </button>
          </div>
        </div>

        {/* Toggle to register */}
        <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          <span>Don't have an account? </span>
          <button
            onClick={onToggleView}
            className="text-nexora-blue hover:text-nexora-blue/80 hover:underline font-bold cursor-pointer"
          >
            Register Profile
          </button>
        </div>

      </div>
    </div>
  );
};
