import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Video,
  BookOpen,
  Ticket,
  Bell,
  Activity,
  Settings,
  Shield,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  Trash2,
  Check,
  MessageSquare,
  Gamepad2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentUser,
    setCurrentUser,
    currentTab,
    setCurrentTab,
    theme,
    setTheme,
    searchQuery,
    setSearchQuery,
    db,
    triggerRefresh
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Retrieve user notifications
  const allNotifs = db.getNotifications();
  const userNotifs = allNotifs.filter(n => n.userId === currentUser.email);
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const usersList = db.getUsers();

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEmail = e.target.value;
    const selectedUser = db.getUser(selectedEmail);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      // Reset search
      setSearchQuery('');
    }
  };

  const markRead = (notifId: string) => {
    db.markNotificationRead(notifId);
    triggerRefresh();
  };

  const markAllRead = () => {
    db.markAllNotificationsRead(currentUser.email);
    triggerRefresh();
  };

  const clearAllNotifs = () => {
    db.clearNotifications(currentUser.email);
    triggerRefresh();
  };

  // Nav items configuration
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, role: 'USER' },
    { id: 'webinars', name: 'Webinars', icon: Calendar, role: 'USER' },
    { id: 'meetings', name: 'Meetings', icon: Calendar, role: 'USER' },
    { id: 'recordings', name: 'Recordings', icon: Video, role: 'USER' },
    { id: 'library', name: 'Knowledge Library', icon: BookOpen, role: 'USER' },
    { id: 'tickets', name: 'Tickets', icon: Ticket, role: 'USER' },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare, role: 'USER' },
    { id: 'games', name: 'Stress Relief', icon: Gamepad2, role: 'USER' },
    { id: 'activity', name: 'My Activity', icon: Activity, role: 'USER' },
    { id: 'settings', name: 'Settings', icon: Settings, role: 'USER' },
    { id: 'admin', name: 'Admin Panel', icon: Shield, role: 'ADMIN' }
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.role === 'ADMIN') {
      return currentUser.role === 'ADMIN';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* ====================================================
          SIDEBAR (DESKTOP / TABLET)
          ==================================================== */}
      <aside className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-[#06152F] text-slate-800 dark:text-white flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 premium-shadow md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:block'
      }`}>
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo Brand */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.jpg" 
                alt="Nexora Connect Logo" 
                className="w-10 h-10 object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800 bg-white p-0.5" 
              />
              <div>
                <span className="font-heading font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">
                  NEXORA
                </span>
                <span className="font-heading font-semibold text-xs block text-nexora-blue dark:text-nexora-electric tracking-widest mt-[-2px]">
                  CONNECT
                </span>
              </div>
            </div>
            {/* Close Button on Mobile */}
            <button 
              className="md:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {filteredNavItems.map(item => {
              const IconComponent = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                    // Reset global search query on tab change
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-nexora-blue to-nexora-blue/80 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <IconComponent size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-100'} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card inside Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nexora-blue/10 dark:bg-nexora-blue/20 text-nexora-blue dark:text-nexora-electric border border-nexora-blue/20 dark:border-nexora-blue/30 font-medium">
                  {currentUser.role}
                </span>
              </div>
            </div>
            
            {/* Sign Out Button */}
            <button
              onClick={() => setCurrentUser(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ====================================================
          MAIN APP PANEL WINDOW
          ==================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-dark-card/85 backdrop-blur-md border-b border-slate-200 dark:border-dark-border premium-shadow transition-colors duration-300">
          
          {/* Mobile menu trigger + Search input */}
          <div className="flex items-center space-x-4 flex-1 mr-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Input */}
            <div className="relative max-w-md w-full hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search webinars, meetings, notes..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-dark-bg/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-nexora-blue focus:border-nexora-blue transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Header Panel Actions */}
          <div className="flex items-center space-x-3.5">

            {/* Role Simulation Switcher Widget */}
            <div className="flex items-center space-x-2 border-r border-slate-200 dark:border-slate-800 pr-3.5">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden lg:inline">
                Test Role:
              </span>
              <select
                value={currentUser.email}
                onChange={handleRoleChange}
                className="text-xs font-semibold px-2 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                {usersList.map(u => (
                  <option key={u.email} value={u.email}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setCurrentTab('register');
                  setSearchQuery('');
                }}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  currentTab === 'register'
                    ? 'bg-nexora-blue text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700/85'
                }`}
                title="Register a new employee profile"
              >
                <span>+ Register</span>
              </button>
            </div>

            {/* Theme Toggle Widget */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notification Tray Bell Widget */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 relative transition-all duration-200"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Tray */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl premium-shadow overflow-hidden z-50 animate-slide-up">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Notifications ({userNotifs.length})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold text-nexora-blue dark:text-nexora-electric hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                    {userNotifs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifs.map(n => (
                        <div key={n.id} className={`p-3.5 text-xs transition-colors duration-150 ${n.read ? 'bg-transparent' : 'bg-nexora-blue/5 dark:bg-nexora-blue/10'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`font-semibold ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-950 dark:text-slate-100'}`}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <button
                                onClick={() => markRead(n.id)}
                                className="text-[10px] text-nexora-blue dark:text-nexora-electric hover:underline flex items-center"
                                title="Mark read"
                              >
                                <Check size={12} className="mr-0.5" /> Read
                              </button>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1.5">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {userNotifs.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-200 dark:border-dark-border text-center bg-slate-50 dark:bg-slate-900/40">
                      <button
                        onClick={clearAllNotifs}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center justify-center mx-auto"
                      >
                        <Trash2 size={12} className="mr-1" /> Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Global Search Input on Small screens */}
        <div className="px-6 pt-4 pb-0 block sm:hidden">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portal..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-dark-bg/60 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Main Content Workspace viewport */}
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* ====================================================
          BOTTOM TAB NAVIGATION (MOBILE PORTRAIT ONLY)
          ==================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#06152F] border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-around items-center z-50 premium-shadow">
        {navigationItems.slice(0, 5).map(item => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setSearchQuery('');
              }}
              className={`flex flex-col items-center justify-center p-1.5 transition-colors duration-150 cursor-pointer ${
                isActive ? 'text-nexora-blue dark:text-nexora-electric' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <IconComponent size={20} />
              <span className="text-[10px] mt-1 font-medium">{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
        {/* Simple More menu trigger linking to settings */}
        <button
          onClick={() => {
            setCurrentTab('settings');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center justify-center p-1.5 cursor-pointer ${
            currentTab === 'settings' || currentTab === 'admin' ? 'text-nexora-blue dark:text-nexora-electric' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Settings size={20} />
          <span className="text-[10px] mt-1 font-medium">More</span>
        </button>
      </nav>
    </div>
  );
};
