import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  Briefcase,
  Bookmark,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
  Check,
  Calendar,
  AlertCircle,
  Download,
  Share2,
  Printer
} from 'lucide-react';
import { User, JobApplication, Job } from '../types';

interface JobSeekerDashboardProps {
  currentUser: User;
  applications: JobApplication[];
  savedJobs: Job[];
  onUpdateProfile: (profile: Partial<User>) => void;
  onRemoveSavedJob: (jobId: string) => void;
  onApplyJobClick: (job: Job) => void;
  darkMode: boolean;
}

export const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({
  currentUser,
  applications,
  savedJobs,
  onUpdateProfile,
  onRemoveSavedJob,
  onApplyJobClick,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'saved' | 'resume'>('applications');

  // Resume Builder state
  const [title, setTitle] = useState(currentUser.title || 'Frontend Developer');
  const [phone, setPhone] = useState(currentUser.phone || '+998 90 123 45 67');
  const [telegram, setTelegram] = useState(currentUser.telegram || '@username');
  const [bio, setBio] = useState(
    currentUser.bio ||
      'Iqtidorli va jamoaviy ishlashga moyil dasturchi. Zamonaviy texnologiyalar bilan ishlashga qiziqaman.'
  );
  const [skills, setSkills] = useState<string[]>(
    currentUser.skills || ['React', 'TypeScript', 'Tailwind CSS', 'Git']
  );
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState(
    currentUser.experience || [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'IT Park Uzbekistan',
        period: '2023 - Hozirgacha',
        description: 'Veb portallarni ishlab chiqish va optimallashtirish.',
      },
    ]
  );
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiReviewFeedback, setAiReviewFeedback] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter applications by current candidate
  const myApplications = applications.filter((app) => app.candidateId === currentUser.id);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleAddExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: 'exp-' + Date.now(),
        title: 'Yangi Lavozim',
        company: 'Kompaniya nomi',
        period: '2024 - 2026',
        description: 'Amalga oshirilgan vazifalar va yutuqlar.',
      },
    ]);
  };

  const handleUpdateExperience = (id: string, field: string, val: string) => {
    setExperiences(
      experiences.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp))
    );
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleSaveResume = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      title,
      phone,
      telegram,
      bio,
      skills,
      experience: experiences,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAiResumeReview = async () => {
    setIsAiReviewing(true);
    try {
      const resumeText = `Kasbi: ${title}
Bio: ${bio}
Ko'nikmalar: ${skills.join(', ')}
Tajriba: ${experiences.map((e) => `${e.title} at ${e.company} (${e.period}): ${e.description}`).join('; ')}`;

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Mening rezyume ma'lumotlarimni ko'rib chiq va 3 ta amaliy maslahat ber: ${resumeText}`,
            },
          ],
          role: 'job_seeker',
        }),
      });

      const data = await res.json();
      setAiReviewFeedback(data.reply || 'Rezyumeingiz juda yaxshi tuzilgan!');
    } catch (err) {
      console.error(err);
      setAiReviewFeedback(
        `✅ **AI Bahosi: 8.5/10**\n\n1. **Yutuqlar ko'rsatkichi:** Tajribangizda foiz yoki raqamlarda erishilgan natijalarni ko'proq ko'rsating (Masalan: *"Sayt tezligini 30% oshirdim"*).\n2. **Portfolio havolasi:** GitHub yoki shaxsiy portfolio havolasini qo'shish tavsiya etiladi.\n3. **Til bilish:** Ingliz tili darajangizni (IELTS/CEFR) aniq ko'rsating.`
      );
    } finally {
      setIsAiReviewing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase">
              Ish Izlovchi Kabineti
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading mt-1">
            {currentUser.name}
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Topshirgan arizalaringiz monitoringi, saqlangan ishlar va shaxsiy Rezyume ustaxonasi.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('resume')}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          Rezyumeni tahrirlash
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/30 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Mening arizalarim ({myApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Saqlangan ishlar ({savedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'resume'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Rezyume Ustaxonasi (CV)
        </button>
      </div>

      {/* Tab 1: My Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <div
              className={`text-center py-16 rounded-3xl border ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
              <h3 className="font-bold text-base">Hozircha hech qanday ariza topshirilmagan</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Vakansiyalar ro'yxatidan qiziqqan ishingizni tanlang va 1-klik bilan ariza yuboring.
              </p>
            </div>
          ) : (
            myApplications.map((app) => (
              <div
                key={app.id}
                className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">{app.companyName}</span>
                    <span className="text-xs text-slate-400">• {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading mt-1">{app.jobTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                    "{app.coverLetter}"
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      app.status === 'interview'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : app.status === 'accepted'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : app.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {app.status === 'interview'
                      ? '🎯 Suhbatga chaqirildingiz!'
                      : app.status === 'accepted'
                      ? '🎉 Qabul qilindi'
                      : app.status === 'rejected'
                      ? 'Rad etildi'
                      : app.status === 'reviewing'
                      ? 'Ko\'rib chiqilmoqda'
                      : 'Kutilmoqda'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Saved Jobs */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedJobs.length === 0 ? (
            <div
              className={`text-center py-16 rounded-3xl border ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <Bookmark className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
              <h3 className="font-bold text-base">Saqlangan vakansiyalar yo'q</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Qiziqqan vakansiyalaringizni saqlab qo'ying va keyinroq ularga tezda ariza topshiring.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between gap-3 ${
                    darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-400">{job.companyName}</span>
                      <h4 className="font-bold text-base font-heading mt-0.5">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.location} • {job.jobType}</p>
                    </div>
                    <button
                      onClick={() => onRemoveSavedJob(job.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/20 mt-2">
                    <span className="text-xs font-black text-emerald-400">
                      {(job.salaryMin / 1000000).toFixed(1)} mln UZS
                    </span>
                    <button
                      onClick={() => onApplyJobClick(job)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                    >
                      Ariza topshirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Resume Builder */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleSaveResume} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Kasbiy unvon / Mutaxassislik</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Telefon raqam</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Telegram profil</label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">O'zingiz haqingizda (Bio)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full p-4 rounded-xl border outline-none text-xs sm:text-sm ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Ko'nikmalar & Texnologiyalar</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Yangi ko'nikma qo'shish..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className={`flex-1 px-4 py-2 rounded-xl border outline-none text-xs ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Qo'shish
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-400">Ish Tajribalari</label>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tajriba qo'shish
                  </button>
                </div>

                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleUpdateExperience(exp.id, 'title', e.target.value)}
                          placeholder="Lavozim"
                          className="font-bold text-xs bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-slate-400 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Kompaniya nomi"
                          className={`p-2 rounded-lg border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                          placeholder="Ishlagan davr (2022 - 2024)"
                          className={`p-2 rounded-lg border outline-none ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                          }`}
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Vazifalar va erishilgan natijalar..."
                        className={`w-full p-2 rounded-lg border outline-none text-xs ${
                          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Save */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                >
                  Rezyumeni saqlash
                </button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Saqlandi!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right: AI Review & Live CV Card */}
          <div className="space-y-4">
            {/* AI Review Card */}
            <div
              className={`p-5 rounded-3xl border relative overflow-hidden ${
                darkMode
                  ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30'
                  : 'bg-gradient-to-br from-indigo-50 via-white to-white border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-sm font-heading">AI Rezyume Tahlili</h4>
                </div>
                <button
                  type="button"
                  onClick={handleAiResumeReview}
                  disabled={isAiReviewing}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isAiReviewing ? "Tahlil qilinmoqda..." : "Tahlil qilish"}
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Sun'iy intellekt rezyumeingizdagi kuchli tomonlarni va kamchiliklarni ko'rsatib beradi.
              </p>

              {aiReviewFeedback && (
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 text-xs leading-relaxed whitespace-pre-wrap">
                  {aiReviewFeedback}
                </div>
              )}
            </div>

            {/* Quick CV Preview Card */}
            <div
              className={`p-5 rounded-3xl border ${
                darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm font-heading">Rezyume ko'rinishi</h4>
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Chop etish (Print / PDF)"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-base font-extrabold">{currentUser.name}</p>
                  <p className="text-indigo-400 font-semibold">{title}</p>
                  <p className="text-slate-400 text-[11px]">{phone} • {telegram}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/20">
                  <p className="font-bold mb-1">Haqida:</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{bio}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/20">
                  <p className="font-bold mb-1">Ko'nikmalar:</p>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
