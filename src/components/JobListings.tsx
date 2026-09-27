import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Sparkles,
  ChevronRight,
  Building,
  CheckCircle2,
  X,
  FileText,
  Send,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Job, JobType, ExperienceLevel, User, JobApplication } from '../types';

interface JobListingsProps {
  jobs: Job[];
  currentUser: User | null;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
  onApplyJob: (applicationData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>) => void;
  onRequireAuth: () => void;
  darkMode: boolean;
}

export const JobListings: React.FC<JobListingsProps> = ({
  jobs,
  currentUser,
  savedJobIds,
  onToggleSaveJob,
  onApplyJob,
  onRequireAuth,
  darkMode,
}) => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedExp, setSelectedExp] = useState<string>('all');
  const [salarySort, setSalarySort] = useState<'default' | 'asc' | 'desc'>('default');

  // Application form fields
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '+998 90 123 45 67');
  const [applicantTelegram, setApplicantTelegram] = useState(currentUser?.telegram || '@telegram_user');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Sync user info if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setApplicantName(currentUser.name);
      setApplicantEmail(currentUser.email);
      if (currentUser.phone) setApplicantPhone(currentUser.phone);
      if (currentUser.telegram) setApplicantTelegram(currentUser.telegram);
    }
  }, [currentUser]);

  // Filters
  const filteredJobs = jobs.filter((job) => {
    if (selectedJobType !== 'all' && job.jobType !== selectedJobType) return false;
    if (selectedExp !== 'all' && job.experienceLevel !== selectedExp) return false;
    return true;
  }).sort((a, b) => {
    if (salarySort === 'asc') return a.salaryMin - b.salaryMin;
    if (salarySort === 'desc') return b.salaryMin - a.salaryMin;
    return 0;
  });

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob) return;
    setIsGeneratingCoverLetter(true);
    try {
      const prompt = `Lavozim: ${selectedJob.title}, Kompaniya: ${selectedJob.companyName}.
Nomzod: ${applicantName || 'Malakali mutaxassis'}. Ko'nikmalar: ${currentUser?.skills?.join(', ') || 'Frontend, jamoaviy ishlash'}.
Ushbu vakansiya uchun o'zbek tilida juda professional, xushmuomala va ishonchli 3 xatboshili Motivatsion xat (Cover Letter) yozib ber.`;

      const res = await fetch('/api/gemini/quick-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cover_letter', prompt }),
      });
      const data = await res.json();
      if (data.text) {
        setCoverLetter(data.text);
      }
    } catch (err) {
      console.error(err);
      setCoverLetter(
        `Hurmatli ${selectedJob.companyName} jamoasi!\n\nMen sizning e'loningizdagi ${selectedJob.title} lavozimiga katta qiziqish bilan ariza topshirmoqdaman. Ushbu sohadagi bilimlarim va yangi marralarni zabt etishga bo'lgan ishtiyoqim sizning jamoangizga ijobiy ta'sir ko'rsatishiga ishonaman.\n\nSuhbatda batafsil ko'rishishga umid qilaman!`
      );
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    onApplyJob({
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      companyName: selectedJob.companyName,
      candidateId: currentUser.id,
      candidateName: applicantName || currentUser.name,
      candidateEmail: applicantEmail || currentUser.email,
      candidatePhone: applicantPhone,
      candidateTelegram: applicantTelegram,
      candidateTitle: currentUser.title || 'Mutaxassis',
      coverLetter: coverLetter || "Ushbu vakansiyaga rezyumeimni topshirmoqdaman.",
      resumeSummary: currentUser.skills?.join(', ') || 'Dasturlash, tahlil',
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
      setIsApplying(false);
      setSelectedJob(null);
    }, 2200);
  };

  const formatSalary = (min: number, max?: number, currency = 'UZS') => {
    const minF = (min / 1000000).toFixed(1).replace('.0', '');
    if (max) {
      const maxF = (max / 1000000).toFixed(1).replace('.0', '');
      return `${minF} - ${maxF} mln ${currency}`;
    }
    return `dan ${minF} mln ${currency}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sub Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Bo'sh ish o'rinlari ({filteredJobs.length})
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Barcha takliflar tekshirilgan va ishonchli kompaniyalar tomonidan taqdim etilgan.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Job Type Selector */}
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer border ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Barcha ish turlari</option>
            <option value="Full-time">Full-time (To'liq)</option>
            <option value="Remote">Remote (Masofaviy)</option>
            <option value="Part-time">Part-time (Yarim stavka)</option>
            <option value="Contract">Contract (Shartnoma)</option>
            <option value="Internship">Internship (Amaliyot)</option>
          </select>

          {/* Experience Selector */}
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer border ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">Har qanday tajriba</option>
            <option value="Tajriba shart emas">Tajriba shart emas</option>
            <option value="Junior (0-1 yil)">Junior (0-1 yil)</option>
            <option value="Middle (1-3 yil)">Middle (1-3 yil)</option>
            <option value="Senior (3+ yil)">Senior (3+ yil)</option>
          </select>

          {/* Salary Sorting */}
          <select
            value={salarySort}
            onChange={(e) => setSalarySort(e.target.value as any)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer border ${
              darkMode
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="default">Saralash: Standart</option>
            <option value="desc">Maosh: Yuqoridan pastga</option>
            <option value="asc">Maosh: Pastdan yuqoriga</option>
          </select>
        </div>
      </div>

      {/* Grid of Job Cards */}
      {filteredJobs.length === 0 ? (
        <div
          className={`text-center py-16 px-4 rounded-3xl border ${
            darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white/60 border-slate-200'
          }`}
        >
          <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-lg font-bold">Hech qanday vakansiya topilmadi</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring yoki boshqa sohani tanlang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);

            return (
              <motion.div
                key={job.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`group rounded-3xl p-6 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30 backdrop-blur-sm'
                    : 'bg-white/80 border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 backdrop-blur-sm'
                }`}
              >
                {/* Featured Badge */}
                {job.isFeatured && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-500 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Top Vakansiya
                  </div>
                )}

                <div>
                  {/* Top Bar: Company Logo & Bookmark */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 overflow-hidden p-1 flex-shrink-0 shadow-sm">
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-snug group-hover:text-indigo-400 transition-colors">
                          {job.companyName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveJob(job.id);
                      }}
                      className={`p-2 rounded-full border transition-all ${
                        isSaved
                          ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                          : 'text-slate-400 border-slate-700/40 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isSaved ? "Saqlanganlardan o'chirish" : "Saqlash"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg font-bold font-heading mb-2 leading-snug">
                    {job.title}
                  </h3>

                  {/* Category & Type Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {job.category}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {job.jobType}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      {job.experienceLevel}
                    </span>
                  </div>

                  {/* Requirements preview */}
                  <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {job.description}
                  </p>
                </div>

                {/* Bottom Bar: Salary and Action Button */}
                <div className="pt-4 border-t border-slate-700/20 flex items-center justify-between gap-2 mt-auto">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Maosh
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplying(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    Batafsil
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Vacancy Detail & Fast Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 sm:p-8 overflow-y-auto border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setIsApplying(false);
                }}
                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success celebration state */}
              {applySuccess ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading">Arizangiz muvaffaqiyatli yuborildi!</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Kompaniya HR mutaxassislari sizning rezyumeingizni ko'rib chiqib, ko'rsatilgan telefon yoki Telegram orqali bog'lanishadi.
                  </p>
                </div>
              ) : isApplying ? (
                /* Fast 1-Click Application View */
                <div>
                  <div className="mb-6">
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                      Tezkor Ariza topshirish
                    </span>
                    <h3 className="text-xl font-bold font-heading mt-1">
                      {selectedJob.title} — {selectedJob.companyName}
                    </h3>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-4 text-xs sm:text-sm">
                    {/* Candidate Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">To'liq ism</label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">Elektron pochta</label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">Telefon raqam</label>
                        <input
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-400">Telegram username</label>
                        <input
                          type="text"
                          value={applicantTelegram}
                          onChange={(e) => setApplicantTelegram(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Attached Resume Summary */}
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-2 font-semibold">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Biriktirilgan Rezyume ma'lumotlari</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {currentUser?.skills?.length
                          ? `Asosiy ko'nikmalar: ${currentUser.skills.join(', ')}`
                          : "Profil rezyumeingiz avtomatik tarzda ish beruvchiga yuboriladi."}
                      </p>
                    </div>

                    {/* Cover Letter with AI Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400">
                          Motivatsion xat (Cover Letter)
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateCoverLetter}
                          disabled={isGeneratingCoverLetter}
                          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-spin" />
                          {isGeneratingCoverLetter ? "AI yaratmoqda..." : "AI bilan avtomatik yozish"}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Nima uchun ushbu lavozimga aynan siz mos kelasiz? (AI bilan yozishingiz mumkin)"
                        className={`w-full p-3 rounded-xl border outline-none text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                        }`}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:shadow-lg hover:shadow-rose-700/40 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Arizani yuborish
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Vacancy Detail View */
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.companyName}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700/60 p-1 bg-white"
                    />
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black font-heading">{selectedJob.title}</h3>
                      <p className="text-sm font-semibold text-indigo-400 mt-0.5">{selectedJob.companyName}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedJob.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedJob.jobType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          E'lon: {selectedJob.postedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Highlight Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 mb-6 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                        Taklif etilayotgan oylik maosh
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-400">
                        {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryCurrency)}
                      </span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      {selectedJob.experienceLevel}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-5 text-xs sm:text-sm">
                    <div>
                      <h4 className="font-bold text-sm font-heading mb-2">Vakansiya haqida</h4>
                      <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="font-bold text-sm font-heading mb-2">Talablar:</h4>
                      <ul className="space-y-1.5">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="font-bold text-sm font-heading mb-2">Taklif etamiz (Qulayliklar):</h4>
                      <ul className="space-y-1.5">
                        {selectedJob.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                            <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 mt-6 border-t border-slate-700/30 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onToggleSaveJob(selectedJob.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                        savedJobIds.includes(selectedJob.id)
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : 'border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      {savedJobIds.includes(selectedJob.id) ? "Saqlangan" : "Saqlash"}
                    </button>

                    <button
                      onClick={() => setIsApplying(true)}
                      className="px-7 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:shadow-lg hover:shadow-rose-600/40 transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Ariza topshirish (1-klik)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
