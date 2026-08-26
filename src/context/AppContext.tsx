import React, { createContext, useContext, useState, useEffect } from 'react';
import { NexoraDatabase } from '../services/database';
import type { User } from '../services/database';
import { NotificationDispatcher } from '../services/notification';

export interface AppContextType {
  db: NexoraDatabase;
  dispatcher: NotificationDispatcher;
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  refreshKey: number;
  triggerRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const nexoraDb = new NexoraDatabase();
const nexoraDispatcher = new NotificationDispatcher(nexoraDb);

export const guestUser: User = {
  id: 'guest',
  email: 'guest@nexoratechs.com',
  name: 'Guest User',
  role: 'EMPLOYEE',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  designation: 'Guest',
  organization: 'Nexora Technologies'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem('nexora_current_user_email');
    if (!saved) return guestUser;
    return nexoraDb.getUser(saved) || guestUser;
  });
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexora_theme');
    if (saved === 'dark' && localStorage.getItem('nexora_theme_explicit_choice') === 'dark') {
      return 'dark';
    }
    return 'light'; // Default theme is light
  });
  const [searchQuery, setSearchQuery] = useState('');

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    localStorage.setItem('nexora_theme_explicit_choice', newTheme);
    localStorage.setItem('nexora_theme', newTheme);
    setTheme(newTheme);
  };

  const setCurrentUser = (user: User | null) => {
    const targetUser = user || guestUser;
    setCurrentUserState(targetUser);
    if (user && user.email !== guestUser.email) {
      localStorage.setItem('nexora_current_user_email', user.email);
    } else {
      localStorage.removeItem('nexora_current_user_email');
      localStorage.setItem('nexora_theme', 'light');
      localStorage.removeItem('nexora_theme_explicit_choice');
      setTheme('light');
      const root = window.document.documentElement;
      root.classList.remove('dark');
      root.style.backgroundColor = '#F8FAFC';
    }
    triggerRefresh();
  };

  // Sync theme with body class for dark mode styling
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0A1220'; // Nexora Dark background color
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#F8FAFC'; // Light background slate-50
    }
    localStorage.setItem('nexora_theme', theme);
  }, [theme]);

  // Periodic meeting reminder trigger simulator
  // Since we are running in the browser, we can simulate check-ins
  useEffect(() => {
    const checkReminders = () => {
      const meetings = nexoraDb.getMeetings();
      // Simulating a random meeting check: finding the first meeting today/tomorrow and triggering reminder
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const upcomingMeet = meetings.find(m => m.date === tomorrowStr);
      if (upcomingMeet) {
        // Trigger a 24H reminder if not already sent (we track sent reminders locally to avoid flooding)
        const trackerKey = `reminder_sent_${upcomingMeet.id}_24H`;
        if (!localStorage.getItem(trackerKey)) {
          nexoraDispatcher.dispatchMeetingReminder(upcomingMeet.id, '24H');
          localStorage.setItem(trackerKey, 'true');
          triggerRefresh();
        }
      }
    };
    
    // Check reminders on mount and every 60 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Pre-load default Resend configuration keys
  useEffect(() => {
    if (!localStorage.getItem('nexora_email_provider')) {
      localStorage.setItem('nexora_email_provider', 'Resend');
    }
    if (!localStorage.getItem('nexora_email_api_key')) {
      localStorage.setItem('nexora_email_api_key', (import.meta.env.VITE_RESEND_API_KEY as string) || 're_placeholder_key_for_development');
    }
    if (!localStorage.getItem('nexora_email_from')) {
      localStorage.setItem('nexora_email_from', 'onboarding@resend.dev');
    }
  }, []);

  return (
    <AppContext.Provider value={{
      db: nexoraDb,
      dispatcher: nexoraDispatcher,
      currentUser,
      setCurrentUser,
      currentTab,
      setCurrentTab,
      theme,
      setTheme: handleSetTheme,
      refreshKey,
      triggerRefresh,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
