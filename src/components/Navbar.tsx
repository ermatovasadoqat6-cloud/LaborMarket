import React from 'react';
import { Briefcase, Building, Sun, Moon, LogIn, LogOut, PlusCircle, FileText, UserCheck, Sparkles, Layers } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentRole: UserRole;
  activeTab: 'jobs' | 'dashboard' | 'resume_builder' | 'post_job';
  setActiveTab: (tab: 'jobs' | 'dashboard' | 'resume_builder' | 'post_job') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToggleRole: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
  onToggleRole,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 border-b ${
        darkMode
          ? 'bg-slate-950/80 border-slate-800/80 backdrop-blur-xl text-slate-100'
          : 'bg-white/80 border-slate-200/80 backdrop-blur-xl text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-75" />
          </div>

          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              LaborMarket
            </span>
            <div className="flex items-center gap-1.5 -mt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Ish Portali
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-500/10 border border-slate-700/20">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'jobs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Vakansiyalar
          </button>

          {/* Role specific tab */}
          {currentRole === 'employer' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building className="w-4 h-4" />
                Ish beruvchi kabineti
              </button>
              <button
                onClick={() => setActiveTab('post_job')}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'post_job'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                E'lon berish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Ish izlovchi kabineti
              </button>
              <button
                onClick={() => setActiveTab('resume_builder')}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'resume_builder'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                Rezyume ustaxonasi
              </button>
            </>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Quick Role Toggle button */}
          <button
            onClick={onToggleRole}
            title="Rolni o'zgartirish (Ish beruvchi / Ish izlovchi)"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              currentRole === 'employer'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            {currentRole === 'employer' ? (
              <>
                <Building className="w-3.5 h-3.5" />
                <span>Ish beruvchi</span>
              </>
            ) : (
              <>
                <Briefcase className="w-3.5 h-3.5" />
                <span>Ish izlovchi</span>
              </>
            )}
            <span className="text-[10px] opacity-70 underline ml-0.5">O'zgartirish</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2.5 rounded-full border transition-all ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={darkMode ? "Yorug' rejim (Light mode)" : "Qorong'i rejim (Dark mode)"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/30">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 cursor-pointer group"
                title="Mening profilim"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-rose-500 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xs text-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold leading-tight group-hover:text-rose-400 transition-colors">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'employer' ? 'Ish beruvchi' : 'Ish izlovchi'}
                  </p>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Chiqish"
                className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-md hover:shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Kirish / Ro'yxatdan o'tish
            </button>
          )}
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-700/20 px-2 text-xs">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`py-1 px-2.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'jobs' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Vakansiyalar
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-1 px-2.5 rounded-lg flex items-center gap-1 ${
            activeTab === 'dashboard' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          {currentRole === 'employer' ? <Building className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          Kabinet
        </button>
        {currentRole === 'employer' ? (
          <button
            onClick={() => setActiveTab('post_job')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'post_job' ? 'text-rose-400 font-bold' : 'text-rose-400/80'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            E'lon berish
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('resume_builder')}
            className={`py-1 px-2.5 rounded-lg flex items-center gap-1 ${
              activeTab === 'resume_builder' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Rezyume
          </button>
        )}
        <button
          onClick={onToggleRole}
          className="py-1 px-2 rounded-lg text-slate-400 text-[11px] underline"
        >
          Rolni almashtirish
        </button>
      </div>
    </header>
  );
};
