import React from 'react';
import { Search, MapPin, Briefcase, Sparkles, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { JobCategory } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  categories: JobCategory[];
  darkMode: boolean;
  onPostJobClick: () => void;
  onExploreJobsClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  categories,
  darkMode,
  onPostJobClick,
  onExploreJobsClick,
}) => {
  const quickTags = ['React', 'Python', 'UI/UX Dizayn', 'Targeting', 'Bosh hisobchi', 'Masofaviy', 'Junior'];

  const locations = [
    'Barcha hududlar',
    'Toshkent shahar',
    'Samarqand',
    'Buxoro',
    'Andijon',
    'Farg\'ona',
    'Masofaviy (Remote)',
  ];

  return (
    <div className="relative pt-8 pb-12 sm:pt-14 sm:pb-18 overflow-hidden">
      {/* Decorative cyber ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-blue-600/15 via-indigo-600/20 to-rose-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Floating pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-6 backdrop-blur-md shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
          <span>LaborMarket AI 2.0 bilan kelajak kasblarini kashf eting</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight mb-4">
          Kelajagingizni{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
            LaborMarket
          </span>{' '}
          bilan quring
        </h1>

        <p className={`max-w-2xl mx-auto text-sm sm:text-lg mb-8 font-normal leading-relaxed ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>
          Ish beruvchilar va iqtidorli mutaxassislarni bog'lovchi milliy platforma. Rezyume yarating, vakansiyalar e'lon qiling va sun'iy intellekt yordamida tezroq maqsadga erishing.
        </p>

        {/* Search Bar Container */}
        <div
          className={`p-3 rounded-3xl sm:rounded-full shadow-2xl transition-all border ${
            darkMode
              ? 'bg-slate-900/90 border-slate-700/80 backdrop-blur-xl'
              : 'bg-white/95 border-slate-300 backdrop-blur-xl'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Keyword Input */}
            <div className="flex items-center gap-2 px-4 py-2.5 w-full sm:w-2/5">
              <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Lavozim, soha yoki kompaniya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-700/40" />

            {/* Category Select */}
            <div className="flex items-center gap-2 px-4 py-2.5 w-full sm:w-1/4">
              <Briefcase className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full bg-transparent text-xs sm:text-sm outline-none cursor-pointer font-medium ${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <option value="all" className={darkMode ? 'bg-slate-900' : 'bg-white'}>
                  Barcha sohalar
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className={darkMode ? 'bg-slate-900' : 'bg-white'}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-700/40" />

            {/* Location Select */}
            <div className="flex items-center gap-2 px-4 py-2.5 w-full sm:w-1/4">
              <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={`w-full bg-transparent text-xs sm:text-sm outline-none cursor-pointer font-medium ${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc} className={darkMode ? 'bg-slate-900' : 'bg-white'}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit / Filter Button */}
            <button
              onClick={onExploreJobsClick}
              className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              Qidirish
            </button>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Ommabop so'rovlar:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag === 'Masofaviy' ? 'Remote' : tag)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-indigo-500 hover:text-white'
                  : 'bg-white/80 border-slate-300 text-slate-700 hover:border-indigo-500 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/60 border-slate-200'}`}>
            <p className="text-2xl font-black font-heading text-blue-400">12,400+</p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bo'sh ish o'rinlari</p>
          </div>
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/60 border-slate-200'}`}>
            <p className="text-2xl font-black font-heading text-indigo-400">4,500+</p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kompaniyalar</p>
          </div>
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/60 border-slate-200'}`}>
            <p className="text-2xl font-black font-heading text-rose-400">98,000+</p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nomzodlar</p>
          </div>
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/60 border-slate-200'}`}>
            <p className="text-2xl font-black font-heading text-emerald-400">94.8%</p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Muvaffaqiyatli ishga joylashuv</p>
          </div>
        </div>
      </div>
    </div>
  );
};
