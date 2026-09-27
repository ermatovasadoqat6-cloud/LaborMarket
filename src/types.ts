export type UserRole = 'employer' | 'job_seeker';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  telegram?: string;
  // Employer fields
  companyName?: string;
  companyLogo?: string;
  companyIndustry?: string;
  companyLocation?: string;
  companyBio?: string;
  companyWebsite?: string;
  companyEmployeesCount?: string;
  // Job seeker fields
  title?: string;
  bio?: string;
  resumeUrl?: string;
  skills?: string[];
  experience?: {
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education?: {
    id: string;
    degree: string;
    institution: string;
    year: string;
  }[];
  languages?: string[];
}

export type JobCategory =
  | 'IT & Dasturlash'
  | 'Marketing & SMM'
  | 'Dizayn & Grafika'
  | 'Moliya & Buxgalteriya'
  | 'Savdo & Mijozlar'
  | 'Ta\'lim & Fan'
  | 'HR & Boshqaruv'
  | 'Logistika & Ta\'minot';

export type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Internship';

export type ExperienceLevel =
  | 'Tajriba shart emas'
  | 'Junior (0-1 yil)'
  | 'Middle (1-3 yil)'
  | 'Senior (3+ yil)'
  | 'Lead / Boshqaruvchi';

export interface Job {
  id: string;
  employerId: string;
  companyName: string;
  companyLogo: string;
  companyLocation: string;
  title: string;
  category: JobCategory;
  location: string;
  jobType: JobType;
  salaryMin: number;
  salaryMax?: number;
  salaryCurrency: 'UZS' | 'USD';
  salaryPeriod: 'oy' | 'loyiha';
  experienceLevel: ExperienceLevel;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline?: string;
  status: 'active' | 'closed';
  viewsCount: number;
  applicantsCount: number;
  isFeatured?: boolean;
}

export type ApplicationStatus =
  | 'pending' // Kutilmoqda
  | 'reviewing' // Ko'rib chiqilmoqda
  | 'interview' // Suhbatga chaqirildi
  | 'accepted' // Qabul qilindi
  | 'rejected'; // Rad etildi

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateTelegram?: string;
  candidateTitle?: string;
  coverLetter: string;
  resumeSummary?: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
