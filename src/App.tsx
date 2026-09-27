import React, { useState, useEffect } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { JobListings } from './components/JobListings';
import { EmployerDashboard } from './components/EmployerDashboard';
import { JobSeekerDashboard } from './components/JobSeekerDashboard';
import { CircularAuthModal } from './components/CircularAuthModal';
import { AiAssistant } from './components/AiAssistant';
import { INITIAL_USERS, INITIAL_JOBS, INITIAL_APPLICATIONS } from './data/mockData';
import { User, Job, JobApplication, UserRole, JobCategory, ApplicationStatus } from './types';
import {
  auth,
  db,
  onAuthStateChanged,
  signOut,
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from './firebase';

const CATEGORIES: JobCategory[] = [
  'IT & Dasturlash',
  'Marketing & SMM',
  'Dizayn & Grafika',
  'Moliya & Buxgalteriya',
  'Savdo & Mijozlar',
  'Ta\'lim & Fan',
  'HR & Boshqaruv',
  'Logistika & Ta\'minot',
];

export default function App() {
  // Theme state: defaults to dark mode as requested by user
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lm_theme');
    return saved ? saved === 'dark' : true;
  });

  // Current active user & role
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentRole, setCurrentRole] = useState<UserRole>('job_seeker');

  // Auth Modal State: Open initially before entering site
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Navigation tab: 'jobs' | 'dashboard' | 'resume_builder' | 'post_job'
  const [activeTab, setActiveTab] = useState<'jobs' | 'dashboard' | 'resume_builder' | 'post_job'>('jobs');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Barcha hududlar');

  // Live Firestore Jobs state
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  // Live Firestore Applications state
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);

  // Saved jobs state
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lm_saved_jobs');
    return saved ? JSON.parse(saved) : ['job-1', 'job-4'];
  });

  // Persist Theme
  useEffect(() => {
    localStorage.setItem('lm_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist Saved Jobs
  useEffect(() => {
    localStorage.setItem('lm_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  // 1. Real Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            setCurrentUser(userData);
            setCurrentRole(userData.role);
          } else {
            const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Foydalanuvchi',
              email: fbUser.email || '',
              avatar: fbUser.photoURL || undefined,
              role: currentRole,
            };
            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.warn('Error reading user profile from Firestore:', err);
        }
      } else {
        // If logged out from Firebase, check if demo user was saved
        const localSaved = localStorage.getItem('lm_user');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setCurrentUser(parsed);
          setCurrentRole(parsed.role);
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, [currentRole]);

  // 2. Real-time Live Jobs Listener from Firestore
  useEffect(() => {
    const jobsCol = collection(db, 'jobs');
    const unsubscribe = onSnapshot(
      jobsCol,
      async (snapshot) => {
        if (!snapshot.empty) {
          const loadedJobs: Job[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loadedJobs.push({
              id: docSnap.id,
              employerId: data.employerId || '',
              companyName: data.companyName || 'Kompaniya',
              companyLogo: data.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
              companyLocation: data.companyLocation || 'Toshkent',
              title: data.title || 'Vakansiya',
              category: data.category || 'IT & Dasturlash',
              location: data.location || 'Toshkent',
              jobType: data.jobType || 'Full-time',
              salaryMin: data.salaryMin || 10000000,
              salaryMax: data.salaryMax,
              salaryCurrency: data.salaryCurrency || 'UZS',
              salaryPeriod: data.salaryPeriod || 'oy',
              experienceLevel: data.experienceLevel || 'Middle (1-3 yil)',
              description: data.description || '',
              requirements: data.requirements || [],
              benefits: data.benefits || [],
              postedDate: data.postedDate || new Date().toISOString().split('T')[0],
              status: data.status || 'active',
              viewsCount: data.viewsCount || 1,
              applicantsCount: data.applicantsCount || 0,
              isFeatured: data.isFeatured || false,
            });
          });
          setJobs(loadedJobs);
        } else {
          // Seed initial jobs to Firestore on first run so the site starts with realistic vacancies!
          try {
            for (const initJob of INITIAL_JOBS) {
              await setDoc(doc(db, 'jobs', initJob.id), initJob);
            }
          } catch (seedErr) {
            console.warn('Initial seeding note:', seedErr);
            setJobs(INITIAL_JOBS);
          }
        }
      },
      (error) => {
        console.warn('Jobs snapshot listener note (offline/rules):', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Real-time Live Applications Listener from Firestore
  useEffect(() => {
    const appsCol = collection(db, 'applications');
    const unsubscribe = onSnapshot(
      appsCol,
      async (snapshot) => {
        if (!snapshot.empty) {
          const loadedApps: JobApplication[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loadedApps.push({
              id: docSnap.id,
              jobId: data.jobId,
              jobTitle: data.jobTitle,
              companyName: data.companyName,
              candidateId: data.candidateId,
              candidateName: data.candidateName,
              candidateEmail: data.candidateEmail,
              candidatePhone: data.candidatePhone,
              candidateTelegram: data.candidateTelegram,
              candidateTitle: data.candidateTitle,
              coverLetter: data.coverLetter || '',
              resumeSummary: data.resumeSummary || '',
              status: data.status || 'pending',
              appliedAt: data.appliedAt || new Date().toISOString(),
              notes: data.notes,
            });
          });
          setApplications(loadedApps);
        } else {
          // If empty, seed initial sample applications
          try {
            for (const initApp of INITIAL_APPLICATIONS) {
              await setDoc(doc(db, 'applications', initApp.id), initApp);
            }
          } catch (appSeedErr) {
            console.warn('Applications seeding note:', appSeedErr);
            setApplications(INITIAL_APPLICATIONS);
          }
        }
      },
      (error) => {
        console.warn('Applications snapshot listener note:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('lm_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    localStorage.removeItem('lm_user');
    setActiveTab('jobs');
  };

  const handleToggleRole = async () => {
    const nextRole: UserRole = currentRole === 'employer' ? 'job_seeker' : 'employer';
    setCurrentRole(nextRole);
    if (currentUser) {
      const updated = { ...currentUser, role: nextRole };
      setCurrentUser(updated);
      localStorage.setItem('lm_user', JSON.stringify(updated));
      try {
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', currentUser.id), { role: nextRole });
        }
      } catch (err) {
        console.warn('Role update sync:', err);
      }
    }
  };

  const handleToggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // Real Application Submission into Firestore
  const handleApplyJob = async (appData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>) => {
    const candidateId = currentUser?.id || auth.currentUser?.uid || 'seeker-' + Date.now();
    const newAppPayload = {
      ...appData,
      candidateId,
      appliedAt: new Date().toISOString(),
      status: 'pending' as ApplicationStatus,
    };

    try {
      // 1. Add application to Firestore
      const docRef = await addDoc(collection(db, 'applications'), newAppPayload);
      
      // Local optimistic update
      setApplications((prev) => [{ ...newAppPayload, id: docRef.id }, ...prev]);

      // 2. Increment applicant counter on job in Firestore
      const targetJob = jobs.find((j) => j.id === appData.jobId);
      if (targetJob) {
        const newCount = (targetJob.applicantsCount || 0) + 1;
        try {
          await updateDoc(doc(db, 'jobs', appData.jobId), { applicantsCount: newCount });
        } catch (e) {
          // ignore if non-critical
        }
      }
    } catch (error) {
      console.error('Error submitting application to Firestore:', error);
      // Fallback local update
      const fallbackApp: JobApplication = {
        ...newAppPayload,
        id: 'app-' + Date.now(),
      };
      setApplications((prev) => [fallbackApp, ...prev]);
    }
  };

  // Real Job Creation into Firestore by Employer
  const handleAddJob = async (newJobData: Omit<Job, 'id' | 'viewsCount' | 'applicantsCount' | 'postedDate'>) => {
    const employerId = currentUser?.id || auth.currentUser?.uid || 'emp-' + Date.now();
    const createdPayload = {
      ...newJobData,
      employerId,
      postedDate: new Date().toISOString().split('T')[0],
      viewsCount: 1,
      applicantsCount: 0,
      status: 'active' as const,
    };

    try {
      const docRef = await addDoc(collection(db, 'jobs'), createdPayload);
      setJobs((prev) => [{ ...createdPayload, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error('Error adding job to Firestore:', error);
      const fallbackJob: Job = {
        ...createdPayload,
        id: 'job-' + Date.now(),
      };
      setJobs((prev) => [fallbackJob, ...prev]);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Ushbu vakansiyani o'chirmoqchimisiz?")) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      } catch (error) {
        console.error('Error deleting job from Firestore:', error);
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    }
  };

  // Real Status Update in Firestore (e.g. Invite to Interview, Accept, Reject)
  const handleUpdateApplicationStatus = async (appId: string, status: ApplicationStatus) => {
    try {
      await updateDoc(doc(db, 'applications', appId), { status });
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
    } catch (error) {
      console.error('Error updating application status in Firestore:', error);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status } : app))
      );
    }
  };

  const handleUpdateProfile = async (profileUpdate: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...profileUpdate };
      setCurrentUser(updated);
      localStorage.setItem('lm_user', JSON.stringify(updated));
      try {
        await setDoc(doc(db, 'users', currentUser.id), updated, { merge: true });
      } catch (error) {
        console.warn('Profile sync:', error);
      }
    }
  };

  // Filtered jobs for listings view
  const displayJobs = jobs.filter((job) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchComp = job.companyName.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const matchReq = job.requirements.some((r) => r.toLowerCase().includes(q));
      if (!matchTitle && !matchComp && !matchDesc && !matchReq) return false;
    }
    if (selectedCategory !== 'all' && job.category !== selectedCategory) {
      return false;
    }
    if (selectedLocation !== 'Barcha hududlar' && !job.location.includes(selectedLocation.split(' ')[0])) {
      return false;
    }
    return true;
  });

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Interactive Cyber Particle Background with constellations */}
      <ParticleBackground darkMode={darkMode} />

      {/* Main Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onToggleRole={handleToggleRole}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'jobs' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              categories={CATEGORIES}
              darkMode={darkMode}
              onPostJobClick={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else {
                  setCurrentRole('employer');
                  setActiveTab('dashboard');
                }
              }}
              onExploreJobsClick={() => {
                const el = document.getElementById('jobs-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <div id="jobs-section">
              <JobListings
                jobs={displayJobs}
                currentUser={currentUser}
                savedJobIds={savedJobIds}
                onToggleSaveJob={handleToggleSaveJob}
                onApplyJob={handleApplyJob}
                onRequireAuth={() => setIsAuthModalOpen(true)}
                darkMode={darkMode}
              />
            </div>
          </>
        )}

        {/* Employer Portal */}
        {(activeTab === 'dashboard' || activeTab === 'post_job') && currentRole === 'employer' && (
          <EmployerDashboard
            currentUser={
              currentUser || {
                id: 'emp-demo',
                name: 'Kompaniya HR Bo\'limi',
                email: 'hr@example.uz',
                role: 'employer',
                companyName: 'TechCorp Innovation',
                companyLocation: 'Toshkent shahar',
              }
            }
            jobs={jobs}
            applications={applications}
            onAddJob={handleAddJob}
            onDeleteJob={handleDeleteJob}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateCompanyProfile={handleUpdateProfile}
            darkMode={darkMode}
            categories={CATEGORIES}
          />
        )}

        {/* Job Seeker Portal */}
        {(activeTab === 'dashboard' || activeTab === 'resume_builder') && currentRole === 'job_seeker' && (
          <JobSeekerDashboard
            currentUser={
              currentUser || {
                id: 'seeker-demo',
                name: 'Sardorbek Rahimov',
                email: 'sardor.dev@gmail.com',
                role: 'job_seeker',
                title: 'Senior Frontend Developer',
                phone: '+998 90 123 45 67',
                telegram: '@sardor_dev',
                skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
              }
            }
            applications={applications}
            savedJobs={jobs.filter((j) => savedJobIds.includes(j.id))}
            onUpdateProfile={handleUpdateProfile}
            onRemoveSavedJob={handleToggleSaveJob}
            onApplyJobClick={(job) => {
              setActiveTab('jobs');
              setSearchQuery(job.title);
            }}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 py-10 border-t transition-colors ${
          darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-heading text-sm bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400 bg-clip-text text-transparent">
              LaborMarket
            </span>
            <span>— O'zbekistondagi zamonaviy ish va karyera platformasi.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-rose-400">
              Kirish / Ro'yxatdan o'tish
            </button>
            <span>•</span>
            <button onClick={handleToggleRole} className="hover:text-indigo-400">
              {currentRole === 'employer' ? "Ish izlovchi rejimiga o'tish" : "Ish beruvchi rejimiga o'tish"}
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">2026 LaborMarket Ekosistemasi</span>
          </div>
        </div>
      </footer>

      {/* Circular Neumorphic Auth Gateway Modal */}
      <CircularAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        darkMode={darkMode}
        demoUsers={INITIAL_USERS}
        defaultRole={currentRole}
      />

      {/* Floating AI Assistant in the bottom right corner */}
      <AiAssistant
        userRole={currentRole}
        darkMode={darkMode}
        userName={currentUser?.name}
      />
    </div>
  );
}

