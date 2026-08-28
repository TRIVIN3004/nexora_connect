import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  Search, 
  Check, 
  X, 
  Plus, 
  Shield, 
  Briefcase,
  CheckCheck
} from 'lucide-react';
import type { User } from '../services/database';

export interface PersonSelectorProps {
  selectedEmails: string[];
  onChange: (selectedEmails: string[]) => void;
  targetMode: 'ALL' | 'SPECIFIC';
  onTargetModeChange: (mode: 'ALL' | 'SPECIFIC') => void;
  allOptionLabel?: string;
  specificOptionLabel?: string;
  allOptionDescription?: string;
  specificOptionDescription?: string;
  themeColor?: 'blue' | 'amber' | 'purple' | 'emerald';
  allowCustomEmail?: boolean;
  maxListHeight?: string;
}

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  selectedEmails,
  onChange,
  targetMode,
  onTargetModeChange,
  allOptionLabel = 'All Company Members',
  specificOptionLabel = 'Selected Persons (Specific)',
  allOptionDescription = 'Send / invite all registered employees & team members',
  specificOptionDescription = 'Choose specific individual team members or custom attendees',
  themeColor = 'blue',
  allowCustomEmail = true,
  maxListHeight = 'max-h-48'
}) => {
  const { db } = useApp();
  const allUsers: User[] = db.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'EMPLOYEE' | 'ADMIN'>('ALL');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [customEmailError, setCustomEmailError] = useState<string | null>(null);

  // Normalize array for case-insensitive lookup
  const normalizedSelected = useMemo(() => {
    return new Set(selectedEmails.map(e => e.toLowerCase().trim()));
  }, [selectedEmails]);

  // Color styles
  const colorMap = {
    blue: {
      borderActive: 'border-nexora-blue bg-nexora-blue/10 text-nexora-blue dark:text-sky-300',
      badge: 'bg-nexora-blue text-white',
      checkBg: 'bg-nexora-blue border-nexora-blue text-white',
      chip: 'bg-nexora-blue/15 text-nexora-blue dark:text-sky-300 border-nexora-blue/30',
      ring: 'focus:ring-nexora-blue',
      btn: 'bg-nexora-blue hover:bg-nexora-blue/90 text-white'
    },
    amber: {
      borderActive: 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200',
      badge: 'bg-amber-500 text-white',
      checkBg: 'bg-amber-500 border-amber-500 text-white',
      chip: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      ring: 'focus:ring-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    purple: {
      borderActive: 'border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-200',
      badge: 'bg-purple-500 text-white',
      checkBg: 'bg-purple-500 border-purple-500 text-white',
      chip: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
      ring: 'focus:ring-purple-500',
      btn: 'bg-purple-500 hover:bg-purple-600 text-white'
    },
    emerald: {
      borderActive: 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
      badge: 'bg-emerald-500 text-white',
      checkBg: 'bg-emerald-500 border-emerald-500 text-white',
      chip: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      ring: 'focus:ring-emerald-500',
      btn: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    }
  };

  const currentTheme = colorMap[themeColor];

  // Filtering users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRole;
      const matchesQuery = 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.organization && u.organization.toLowerCase().includes(q));
      return matchesRole && matchesQuery;
    });
  }, [allUsers, searchQuery, roleFilter]);

  const toggleUserSelection = (email: string) => {
    const norm = email.toLowerCase().trim();
    if (normalizedSelected.has(norm)) {
      onChange(selectedEmails.filter(e => e.toLowerCase().trim() !== norm));
    } else {
      onChange([...selectedEmails, norm]);
    }
  };

  const handleSelectAll = () => {
    const all = allUsers.map(u => u.email.toLowerCase().trim());
    onChange(Array.from(new Set([...selectedEmails, ...all])));
  };

  const handleSelectAdminsOnly = () => {
    const admins = allUsers.filter(u => u.role === 'ADMIN').map(u => u.email.toLowerCase().trim());
    onChange(admins);
  };

  const handleSelectEmployeesOnly = () => {
    const employees = allUsers.filter(u => u.role === 'EMPLOYEE').map(u => u.email.toLowerCase().trim());
    onChange(employees);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleAddCustomEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomEmailError(null);
    const email = customEmailInput.trim().toLowerCase();
    
    if (!email) return;

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setCustomEmailError('Please enter a valid email address');
      return;
    }

    if (normalizedSelected.has(email)) {
      setCustomEmailError('Email is already selected');
      return;
    }

    onChange([...selectedEmails, email]);
    setCustomEmailInput('');
  };

  return (
    <div className="space-y-3">
      {/* 1. Selection Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onTargetModeChange('ALL')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            targetMode === 'ALL'
              ? currentTheme.borderActive + ' shadow-xs ring-1 ring-inset'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <Users size={15} />
              <span>{allOptionLabel}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
              targetMode === 'ALL' ? currentTheme.badge : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {allUsers.length} Persons
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {allOptionDescription}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onTargetModeChange('SPECIFIC')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            targetMode === 'SPECIFIC'
              ? currentTheme.borderActive + ' shadow-xs ring-1 ring-inset'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <UserCheck size={15} />
              <span>{specificOptionLabel}</span>
            </div>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
              selectedEmails.length > 0 ? currentTheme.badge : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {selectedEmails.length} Selected
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {specificOptionDescription}
          </p>
        </button>
      </div>

      {/* 2. Specific Person Selection Interface */}
      {targetMode === 'SPECIFIC' && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-fade-in">
          
          {/* Quick Filter Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/70 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <CheckCheck size={11} className="inline mr-1 -mt-0.5" />
                Select All ({allUsers.length})
              </button>
              <button
                type="button"
                onClick={handleSelectEmployeesOnly}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Briefcase size={11} className="inline mr-1 -mt-0.5" />
                Employees
              </button>
              <button
                type="button"
                onClick={handleSelectAdminsOnly}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Shield size={11} className="inline mr-1 -mt-0.5" />
                Admins
              </button>
              {selectedEmails.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <span className="font-extrabold text-slate-900 dark:text-white">{selectedEmails.length}</span> of {allUsers.length} Chosen
            </div>
          </div>

          {/* Selected Users Chips */}
          {selectedEmails.length > 0 && (
            <div className="p-2 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700/60 max-h-24 overflow-y-auto flex flex-wrap gap-1.5">
              {selectedEmails.map(email => {
                const norm = email.toLowerCase().trim();
                const userObj = allUsers.find(u => u.email.toLowerCase().trim() === norm);
                return (
                  <span
                    key={email}
                    className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentTheme.chip}`}
                  >
                    <span>{userObj ? userObj.name : email}</span>
                    <button
                      type="button"
                      onClick={() => toggleUserSelection(email)}
                      className="hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove attendee"
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search Box & Role Filter Tabs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendee by name, email, designation..."
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none ${currentTheme.ring}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
              {(['ALL', 'EMPLOYEE', 'ADMIN'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleFilter(tab)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-all ${
                    roleFilter === tab
                      ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab === 'EMPLOYEE' ? 'Employees' : 'Admins'}
                </button>
              ))}
            </div>
          </div>

          {/* User List with Checkboxes */}
          <div className={`${maxListHeight} overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg bg-white dark:bg-slate-850`}>
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching members found for "{searchQuery}"
              </div>
            ) : (
              filteredUsers.map(u => {
                const isSelected = normalizedSelected.has(u.email.toLowerCase().trim());
                return (
                  <div
                    key={u.id || u.email}
                    onClick={() => toggleUserSelection(u.email)}
                    className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? currentTheme.borderActive
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden flex-1">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? currentTheme.checkBg
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate leading-tight text-xs">
                            {u.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate font-mono">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      {u.designation && (
                        <span className="hidden sm:inline-block text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                          {u.designation}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Custom Email Address Input */}
          {allowCustomEmail && (
            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmailInput}
                  onChange={(e) => {
                    setCustomEmailInput(e.target.value);
                    if (customEmailError) setCustomEmailError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomEmail();
                    }
                  }}
                  placeholder="Invite external email (e.g. guest@client.com)..."
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none ${
                    customEmailError 
                      ? 'border-red-400 ring-1 ring-red-400' 
                      : `border-slate-200 dark:border-slate-700 ${currentTheme.ring}`
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomEmail()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center shrink-0 ${currentTheme.btn}`}
                >
                  <Plus size={14} className="mr-1" /> Add Guest
                </button>
              </div>
              {customEmailError && (
                <p className="text-[10px] text-red-500 mt-1 font-semibold">{customEmailError}</p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
