export type JobDepartment =
  | "Civil Engineering"
  | "Project Management"
  | "Architecture & Planning"
  | "Safety & Quality Control"
  | "Heavy Machinery & Fleet"
  | "Administration & Accounts";

export const DEPARTMENTS: JobDepartment[] = [
  "Civil Engineering",
  "Project Management",
  "Architecture & Planning",
  "Safety & Quality Control",
  "Heavy Machinery & Fleet",
  "Administration & Accounts",
];

export type JobType = "Full-Time" | "Part-Time" | "Contract" | "Internship";
export const JOB_TYPES: JobType[] = ["Full-Time", "Contract", "Internship", "Part-Time"];

export type JobStatus = "Active" | "Closed" | "Draft";
export const JOB_STATUSES: JobStatus[] = ["Active", "Draft", "Closed"];

export type ApplicationStatus =
  | "New"
  | "Under Review"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Offered"
  | "Rejected";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Offered",
  "Rejected",
];

export type JobDoc = {
  id: string;
  title: string;
  slug: string;
  department: JobDepartment;
  location: string;
  type: JobType;
  experience: string;
  salary?: string;
  tagline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: JobStatus;
  featured?: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type JobApplicationDoc = {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export function slugifyJob(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
