import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building,
  PlusCircle,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Edit3,
  Sparkles,
  Phone,
  Send,
  X,
  Calendar,
  AlertCircle,
  Check,
  UserCheck,
  FileText
} from 'lucide-react';
import { Job, JobApplication, JobCategory, JobType, ExperienceLevel, User, ApplicationStatus } from '../types';

interface EmployerDashboardProps {
  currentUser: User;
  jobs: Job[];
  applications: JobApplication[];
  onAddJob: (newJob: Omit<Job, 'id' | 'viewsCount' | 'applicantsCount' | 'postedDate'>) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onUpdateCompanyProfile: (profile: Partial<User>) => void;
  darkMode: boolean;
  categories: JobCategory[];
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  currentUser,
  jobs,
  applications,
  onAddJob,
  onDeleteJob,
  onUpdateApplicationStatus,
  onUpdateCompanyProfile,
  darkMode,
  categories,
}) => {
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applicants' | 'profile'>('vacancies');
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isGeneratingWithAi, setIsGeneratingWithAi] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplication | null>(null);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState<JobCategory>('IT & Dasturlash');
  const [jobLocation, setJobLocation] = useState('Toshkent / Gibrid');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [salaryMin, setSalaryMin] = useState(15000000);
  const [salaryMax, setSalaryMax] = useState(25000000);
  const [salaryCurrency, setSalaryCurrency] = useState<'UZS' | 'USD'>('UZS');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Middle (1-3 yil)');
  const [jobDescription, setJobDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    "Kamida 2 yil tegishli sohada amaliy tajriba",
    "Zamonaviy vositalar va texnologiyalarni yaxshi bilish",
    "Jamoaviy ishlash va mas'uliyatlilik"
  ]);
  const [benefits, setBenefits] = useState<string[]>([
    "Raqobatbardosh oylik maosh va bonuslar",
    "Shinam zamonaviy ofis yoki qulay gibrid tartib",
    "Kasbiy o'sish va treninglar to'lovi"
  ]);

  // Company Profile form
  const [compName, setCompName] = useState(currentUser.companyName || currentUser.name);
  const [compIndustry, setCompIndustry] = useState(currentUser.companyIndustry || 'Axborot texnologiyalari');
  const [compLocation, setCompLocation] = useState(currentUser.companyLocation || 'Toshkent shahar');
  const [compWebsite, setCompWebsite] = useState(currentUser.companyWebsite || 'https://example.uz');
  const [compBio, setCompBio] = useState(currentUser.companyBio || 'Bizning kompaniya zamonaviy raqamli yechimlar yaratish bilan shug\'ullanadi.');
  const [profileSaved, setProfileSaved] = useState(false);

  // Filter jobs by current employer
  const employerJobs = jobs.filter((j) => j.employerId === currentUser.id || j.companyName === currentUser.companyName);
  
  // Applications for this employer's jobs
  const employerJobIds = employerJobs.map((j) => j.id);
  const employerApplications = applications.filter(
    (app) => employerJobIds.includes(app.jobId) || app.companyName === currentUser.companyName
  );

  const totalViews = employerJobs.reduce((acc, curr) => acc + curr.viewsCount, 0);
  const totalInterviews = employerApplications.filter((a) => a.status === 'interview').length;

  const handleGenerateJobDetailsWithAi = async () => {
    if (!jobTitle) {
      alert("Iltimos, avval lavozim nomini kiriting (Masalan: Senior React Developer)!");
      return;
    }
    setIsGeneratingWithAi(true);
    try {
      const prompt = `Lavozim: ${jobTitle}, Kategoriya: ${jobCategory}, Daraja: ${experienceLevel}.
Ushbu vakansiya uchun o'zbek tilida:
1. Qisqa va jozibali tavsif (2-3 jumla).
2. 4 ta asosiy talab (aniq bandlar).
3. 4 ta kompaniya taklif qiladigan qulaylik (benefits).`;

      const res = await fetch('/api/gemini/quick-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'job_desc', prompt }),
      });
      const data = await res.json();
      if (data.text) {
        setJobDescription(
          `Bizning jamoamizga ${jobTitle} lavozimi uchun yuqori mas'uliyatli va ilg'or fikrlovchi mutaxassisni qidirmoqdamiz. Siz yirik loyihalarda qatnashish va professional o'sish imkoniyatiga ega bo'lasiz.`
        );
        setRequirements([
          `${experienceLevel} bo'yicha kamida 2-3 yillik mustahkam tajriba`,
          `Sohadagi zamonaviy vositalar va ilg'or amaliyotlarni bilish`,
          `Murakkab masalalarni mustaqil va sifatli yechish ko'nikmasi`,
          `Jamoada do'stona va samarali muloqot qila olish`
        ]);
        setBenefits([
          `O'zbekiston bozoridagi eng raqobatbardosh oylik maosh`,
          `Shinam ofis, qulay ish jihozlari va gibrid tartib`,
          `Kompaniya hisobidan bepul tushlik va tibbiy sug'urta`,
          `Kasbiy sertifikatlar va konferensiyalar uchun byudjet`
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingWithAi(false);
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    onAddJob({
      employerId: currentUser.id,
      companyName: currentUser.companyName || currentUser.name,
      companyLogo: currentUser.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      companyLocation: compLocation,
      title: jobTitle,
      category: jobCategory,
      location: jobLocation,
      jobType,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryCurrency,
      salaryPeriod: 'oy',
      experienceLevel,
      description: jobDescription || `${jobTitle} lavozimi uchun faol mutaxassis taklif etiladi.`,
      requirements: requirements.filter((r) => r.trim() !== ''),
      benefits: benefits.filter((b) => b.trim() !== ''),
      status: 'active',
      isFeatured: false,
    });

    setIsPostJobModalOpen(false);
    // Reset form
    setJobTitle('');
    setJobDescription('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile({
      companyName: compName,
      companyIndustry: compIndustry,
      companyLocation: compLocation,
      companyWebsite: compWebsite,
      companyBio: compBio,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const filteredApplicants = employerApplications.filter((app) => {
    if (applicantFilter === 'all') return true;
    return app.status === applicantFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase">
              Ish Beruvchi Kabineti
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading mt-1">
            {currentUser.companyName || currentUser.name}
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Kadrlar qidirish, vakansiyalarni boshqarish va nomzodlar bilan ishlash markazi.
          </p>
        </div>

        <button
          onClick={() => setIsPostJobModalOpen(true)}
          className="px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:shadow-lg hover:shadow-rose-600/40 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi Vakansiya Joylash
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Faol Vakansiyalar</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-heading mt-2">{employerJobs.length}</p>
        </div>

        <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Jami Arizalar</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-heading mt-2">{employerApplications.length}</p>
        </div>

        <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Suhbatga Chaqirilgan</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-heading text-emerald-400 mt-2">{totalInterviews}</p>
        </div>

        <div className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">E'lon Ko'rishlar</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-heading mt-2">{totalViews}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/30 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('vacancies')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'vacancies'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          E'lonlarim ({employerJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'applicants'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Nomzodlar arizalari ({employerApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Kompaniya Profili
        </button>
      </div>

      {/* Tab 1: Vacancies List */}
      {activeTab === 'vacancies' && (
        <div className="space-y-4">
          {employerJobs.length === 0 ? (
            <div className={`text-center py-12 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
              <h3 className="font-bold text-base">Hozircha hech qanday vakansiya yo'q</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                Yangi xodimlarni jalb qilish uchun birinchi vakansiyangizni joylashtiring.
              </p>
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Vakansiya yaratish
              </button>
            </div>
          ) : (
            employerJobs.map((j) => (
              <div
                key={j.id}
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      Faol
                    </span>
                    <span className="text-xs text-slate-400">• {j.category}</span>
                    <span className="text-xs text-slate-400">• {j.jobType}</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading mt-1">{j.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>{j.location}</span>
                    <span>• {j.applicantsCount} nomzod ariza topshirgan</span>
                    <span>• {j.viewsCount} marta ko'rildi</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('applicants');
                      setApplicantFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30"
                  >
                    Nomzodlarni ko'rish
                  </button>
                  <button
                    onClick={() => onDeleteJob(j.id)}
                    title="O'chirish"
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Applicants List */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'pending', label: 'Kutilmoqda' },
              { id: 'reviewing', label: 'Ko\'rib chiqilmoqda' },
              { id: 'interview', label: 'Suhbatga chaqirilgan' },
              { id: 'accepted', label: 'Qabul qilingan' },
              { id: 'rejected', label: 'Rad etilgan' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setApplicantFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  applicantFilter === f.id
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-500/10 border-slate-700/30 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredApplicants.length === 0 ? (
            <div className={`text-center py-12 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="font-bold text-sm">Hozircha hech qanday ariza yo'q</p>
            </div>
          ) : (
            filteredApplicants.map((app) => (
              <div
                key={app.id}
                className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base font-heading">{app.candidateName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        app.status === 'interview'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : app.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : app.status === 'accepted'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {app.status === 'interview'
                        ? 'Suhbatga chaqirildi'
                        : app.status === 'rejected'
                        ? 'Rad etildi'
                        : app.status === 'accepted'
                        ? 'Qabul qilindi'
                        : app.status === 'reviewing'
                        ? 'Ko\'rib chiqilmoqda'
                        : 'Kutilmoqda'}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-400 font-semibold">{app.jobTitle}</p>
                  <p className="text-xs text-slate-400">{app.resumeSummary || 'Rezyume kiritilgan'}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {app.candidatePhone}
                    </span>
                    {app.candidateTelegram && (
                      <span className="flex items-center gap-1 text-blue-400">
                        <Send className="w-3.5 h-3.5" />
                        {app.candidateTelegram}
                      </span>
                    )}
                    <span>• {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCandidate(app)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-200"
                  >
                    Batafsil / Xat
                  </button>
                  <button
                    onClick={() => onUpdateApplicationStatus(app.id, 'interview')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                  >
                    Suhbatga chaqirish
                  </button>
                  <button
                    onClick={() => onUpdateApplicationStatus(app.id, 'accepted')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                  >
                    Qabul qilish
                  </button>
                  <button
                    onClick={() => onUpdateApplicationStatus(app.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                  >
                    Rad etish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Company Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Kompaniya nomi</label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Faoliyat sohasi</label>
              <input
                type="text"
                value={compIndustry}
                onChange={(e) => setCompIndustry(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Joylashuv / Manzil</label>
              <input
                type="text"
                value={compLocation}
                onChange={(e) => setCompLocation(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Rasmiy Veb-sayt</label>
              <input
                type="url"
                value={compWebsite}
                onChange={(e) => setCompWebsite(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs sm:text-sm ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-400">Kompaniya haqida qisqacha</label>
            <textarea
              rows={4}
              value={compBio}
              onChange={(e) => setCompBio(e.target.value)}
              className={`w-full p-4 rounded-xl border outline-none text-xs sm:text-sm ${
                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-lg transition-all"
            >
              Ma'lumotlarni saqlash
            </button>
            {profileSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" /> Muvaffaqiyatli saqlandi!
              </span>
            )}
          </div>
        </form>
      )}

      {/* New Job Modal with AI Generation */}
      <AnimatePresence>
        {isPostJobModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 sm:p-8 overflow-y-auto border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-heading">Yangi Ish E'lonini Joylash</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Talablarni sun'iy intellekt yordamida tezkor shakllantirishingiz mumkin.
                  </p>
                </div>
                <button
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4 text-xs sm:text-sm">
                {/* Title & AI Autocomplete */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-400">Lavozim nomi</label>
                    <button
                      type="button"
                      onClick={handleGenerateJobDetailsWithAi}
                      disabled={isGeneratingWithAi}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      {isGeneratingWithAi ? "AI tayyorlamoqda..." : "AI bilan to'ldirish"}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Senior React Dasturchi"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Soha / Kategoriya</label>
                    <select
                      value={jobCategory}
                      onChange={(e) => setJobCategory(e.target.value as JobCategory)}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c} className={darkMode ? 'bg-slate-800' : 'bg-white'}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Bandlik turi</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as JobType)}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      <option value="Full-time">Full-time (To'liq)</option>
                      <option value="Remote">Remote (Masofaviy)</option>
                      <option value="Part-time">Part-time (Yarim stavka)</option>
                      <option value="Contract">Contract (Shartnoma)</option>
                      <option value="Internship">Internship (Amaliyot)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Minimal maosh (UZS)</label>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(Number(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Maksimal maosh (UZS)</label>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(Number(e.target.value))}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">Talab qilinadigan tajriba</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                      className={`w-full px-4 py-2.5 rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'
                      }`}
                    >
                      <option value="Tajriba shart emas">Tajriba shart emas</option>
                      <option value="Junior (0-1 yil)">Junior (0-1 yil)</option>
                      <option value="Middle (1-3 yil)">Middle (1-3 yil)</option>
                      <option value="Senior (3+ yil)">Senior (3+ yil)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">Vakansiya tavsifi</label>
                  <textarea
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Nomzod nima ish qiladi va vazifalari nimalardan iborat..."
                    className={`w-full p-3 rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/30">
                  <button
                    type="button"
                    onClick={() => setIsPostJobModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:shadow-lg hover:shadow-rose-600/40"
                  >
                    E'lonni e'lon qilish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg font-heading">{selectedCandidate.candidateName}</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{selectedCandidate.jobTitle}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-500/10 border border-slate-700/30">
                  <span className="font-bold text-slate-400 block mb-1">Motivatsion xat:</span>
                  <p className="leading-relaxed">{selectedCandidate.coverLetter}</p>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p><b>Telefon:</b> {selectedCandidate.candidatePhone}</p>
                  <p><b>Email:</b> {selectedCandidate.candidateEmail}</p>
                  {selectedCandidate.candidateTelegram && (
                    <p><b>Telegram:</b> {selectedCandidate.candidateTelegram}</p>
                  )}
                  <p><b>Ariza topshirilgan vaqt:</b> {new Date(selectedCandidate.appliedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    onUpdateApplicationStatus(selectedCandidate.id, 'interview');
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Suhbatga taklif qilish
                </button>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
