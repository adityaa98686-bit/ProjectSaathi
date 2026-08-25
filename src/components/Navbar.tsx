import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Layers, 
  Compass, 
  FileText, 
  UserCheck, 
  ChevronDown, 
  Sparkles, 
  Edit3,
  UserPlus, 
  LogIn, 
  LogOut, 
  Mail,
  User,
  Users,
  Check,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { Logo } from './Logo';
import { StatusDot } from './StatusDot';
import { ThemeToggle } from './ThemeToggle';
import { UserProfile, AvailabilityStatus } from '../types';

interface NavbarProps {
  isLoggedIn: boolean;
  currentMode: 'building' | 'joining';
  onModeChange: (mode: 'building' | 'joining') => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  authMode: 'demo' | 'registered';
  onSwitchUser: (user: UserProfile) => void;
  onUpdateAvailability: (status: AvailabilityStatus) => void;
  onOpenPostProject: () => void;
  onOpenProfile: () => void;
  onOpenEditProfile: () => void;
  onOpenApplications: () => void;
  onOpenInvitations?: () => void;
  onGoHome: () => void;
  onOpenAuth: (tab?: 'register' | 'login' | 'demo') => void;
  onLogout: () => void;
  pendingApplicationsCount: number;
  pendingInvitationsCount?: number;
  onExploreProjects?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  currentMode,
  onModeChange,
  currentUser,
  allUsers,
  authMode,
  onSwitchUser,
  onUpdateAvailability,
  onOpenPostProject,
  onOpenProfile,
  onOpenEditProfile,
  onOpenApplications,
  onOpenInvitations,
  onGoHome,
  onOpenAuth,
  onLogout,
  pendingApplicationsCount,
  pendingInvitationsCount = 0,
  onExploreProjects,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPersonaSubmenu, setShowPersonaSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowPersonaSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080A]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        
        {/* Left: Apple-Style Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={onGoHome} 
            className="flex items-center text-left cursor-pointer focus:outline-none transition-opacity hover:opacity-90 active:scale-98"
            title="ProjectSaathi Home"
          >
            <Logo size="md" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STATE 1: BEFORE LOGIN (Visitor / Public Landing)                          */}
        {/* Minimalist navigation links + Clean Apple-style Auth Buttons              */}
        {/* ========================================================================= */}
        {!isLoggedIn ? (
          <>
            {/* Center: Apple-style Minimal Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-white/60">
              <button 
                onClick={onExploreProjects || onGoHome}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Explore Projects
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Find Teammates
              </button>
              <button 
                onClick={() => onOpenAuth('demo')}
                className="hover:text-white transition-colors cursor-pointer text-indigo-300/80 hover:text-indigo-200"
              >
                Try Demo Persona
              </button>
            </nav>

            {/* Right: Clean Minimal Auth Buttons & Theme Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <ThemeToggle variant="icon" />

              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 rounded-full bg-white hover:bg-white/90 text-black text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 text-black" />
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* STATE 2: AFTER LOGIN (Authenticated Workspace)                            */
          /* Clean Segmented Mode Switcher + Refined Notifications + Profile Menu      */
          /* (No cluttering 'Demo Version' or 'Create Account' banners)               */
          /* ========================================================================= */
          <>
            {/* Center: Apple-style Segmented Mode Switcher */}
            <div className="flex items-center justify-center">
              <div className="p-0.5 sm:p-1 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center shadow-inner">
                <button
                  onClick={() => onModeChange('joining')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    currentMode === 'joining'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Want to Contribute</span>
                </button>

                <button
                  onClick={() => onModeChange('building')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    currentMode === 'building'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>I'm Building</span>
                </button>
              </div>
            </div>

            {/* Right: Quick Action Controls & Sleek Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* If Building Mode: Sleek Post Project Button */}
              {currentMode === 'building' && (
                <button
                  onClick={onOpenPostProject}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Post Project</span>
                </button>
              )}

              {/* Quick Activity Buttons: Invitations, Applications & Theme */}
              <div className="flex items-center gap-1.5">
                <ThemeToggle variant="icon" />

                {/* Invitations Icon */}
                {onOpenInvitations && (
                  <button
                    onClick={onOpenInvitations}
                    className="relative p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white transition-all cursor-pointer"
                    title="Direct Invitations"
                  >
                    <Mail className="w-4 h-4 text-sky-400" />
                    {pendingInvitationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-sky-500 text-black text-[10px] font-black flex items-center justify-center shadow-md">
                        {pendingInvitationsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Applications Icon */}
                <button
                  onClick={onOpenApplications}
                  className="relative p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Applications Status"
                >
                  <FileText className="w-4 h-4 text-[#14b8a6]" />
                  {pendingApplicationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#14b8a6] text-black text-[10px] font-black flex items-center justify-center shadow-md">
                      {pendingApplicationsCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Apple-style User Avatar & Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1 pl-1 pr-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer focus:outline-none"
                  title="Account menu"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <StatusDot
                      status={currentUser.availability}
                      size="sm"
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  </div>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>

                {/* Refined Glass Profile Popover */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0C0C12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* User Header */}
                    <div className="p-2.5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={currentUser.avatar} 
                          alt={currentUser.name} 
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/20" 
                        />
                        <div className="truncate flex-1">
                          <div className="font-semibold text-xs text-white truncate flex items-center gap-1">
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-white/50 truncate">{currentUser.primaryRole}</div>
                        </div>
                      </div>

                      {/* Availability Quick Switcher */}
                      <div className="mt-3 pt-2 border-t border-white/[0.06]">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                          Status
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {(['available', 'open_to_explore', 'occupied'] as AvailabilityStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => onUpdateAvailability(st)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all text-center cursor-pointer ${
                                currentUser.availability === st
                                  ? 'bg-white/15 text-white shadow-xs'
                                  : 'text-white/50 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="capitalize">{st === 'open_to_explore' ? 'Exploring' : st}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Theme Mode Switcher in Profile Menu */}
                      <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] font-medium text-white/70">Appearance</span>
                        <ThemeToggle variant="switch" />
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1 space-y-0.5 border-b border-white/[0.06]">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#14b8a6]" />
                        <span>Public Profile Card</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenEditProfile();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Profile & Skills</span>
                      </button>

                      {onOpenInvitations && (
                        <button
                          onClick={() => {
                            onOpenInvitations();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Mail className="w-3.5 h-3.5 text-sky-400" />
                            <span>Direct Invitations</span>
                          </div>
                          {pendingInvitationsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-black font-extrabold text-[10px]">
                              {pendingInvitationsCount}
                            </span>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onOpenApplications();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-3.5 h-3.5 text-[#14b8a6]" />
                          <span>Applications Status</span>
                        </div>
                        {pendingApplicationsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#14b8a6] text-black font-bold text-[10px]">
                            {pendingApplicationsCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Persona Switcher / Account Settings */}
                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => setShowPersonaSubmenu(!showPersonaSubmenu)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>Switch Persona</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showPersonaSubmenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showPersonaSubmenu && (
                        <div className="p-1 rounded-xl bg-black/40 border border-white/5 space-y-1 my-1">
                          {allUsers.slice(0, 4).map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u);
                                setShowProfileMenu(false);
                                setShowPersonaSubmenu(false);
                              }}
                              className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                                currentUser.id === u.id
                                  ? 'bg-white/10 text-white font-medium'
                                  : 'text-white/60 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                              <div className="truncate flex-1">
                                <div className="text-[11px] truncate">{u.name}</div>
                              </div>
                              {currentUser.id === u.id && <Check className="w-3 h-3 text-[#14b8a6]" />}
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 transition-colors text-left cursor-pointer mt-1 pt-1.5 border-t border-white/[0.06]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </header>
  );
};
