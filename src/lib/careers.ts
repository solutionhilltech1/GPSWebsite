import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { db } from "./mongo";
import {
  DEPARTMENTS,
  JOB_TYPES,
  JOB_STATUSES,
  APPLICATION_STATUSES,
  slugifyJob,
  type JobDepartment,
  type JobType,
  type JobStatus,
  type ApplicationStatus,
  type JobDoc,
  type JobApplicationDoc,
} from "./career-fields";

export {
  DEPARTMENTS,
  JOB_TYPES,
  JOB_STATUSES,
  APPLICATION_STATUSES,
  slugifyJob,
  type JobDepartment,
  type JobType,
  type JobStatus,
  type ApplicationStatus,
  type JobDoc,
  type JobApplicationDoc,
};

export const CAREERS_TAG = "careers_jobs";

export const jobsCollection = async () => (await db()).collection<JobDoc>("jobs");
export const applicationsCollection = async () => (await db()).collection<JobApplicationDoc>("job_applications");

const DEFAULT_JOBS: Omit<JobDoc, "createdAt" | "updatedAt">[] = [
  {
    id: "job-1",
    title: "Senior Site Engineer (Civil)",
    slug: "senior-site-engineer-civil",
    department: "Civil Engineering",
    location: "Etah, Uttar Pradesh",
    type: "Full-Time",
    experience: "4-7 years",
    salary: "Competitive & commensurate with experience",
    tagline: "Lead high-precision on-site civil works for landmark commercial and residential developments.",
    description:
      "We are seeking an experienced Senior Site Engineer to oversee structural concrete, foundation execution, quality control, and contractor coordination across our flagship projects in Etah and Western UP.",
    responsibilities: [
      "Supervise daily RCC casting, structural steel layout, and earthwork operations.",
      "Verify bar bending schedules (BBS), structural drawings, and architectural milestones.",
      "Liaise with project managers, consultants, and safety officers to maintain zero-incident job sites.",
      "Track daily material consumption (cement, TMT steel, ready-mix concrete) and report progress logs.",
    ],
    requirements: [
      "B.Tech / B.E. / Diploma in Civil Engineering from a recognized institution.",
      "4+ years of hands-on site experience in RCC frame structures, commercial, or residential townships.",
      "Proficiency in reading AutoCAD structural layouts and using total station survey equipment.",
      "Strong leadership and contractor management capabilities.",
    ],
    status: "Active",
    featured: true,
    order: 1,
  },
  {
    id: "job-2",
    title: "Project Construction Manager",
    slug: "project-construction-manager",
    department: "Project Management",
    location: "Etah, Uttar Pradesh",
    type: "Full-Time",
    experience: "7-12 years",
    salary: "Best in industry + performance incentives",
    tagline: "Direct full-cycle turnkey construction from site mobilization to final occupancy handover.",
    description:
      "Drive milestone-driven construction execution for GPS Projects Private Limited. Responsible for multi-site project scheduling, budget controls, vendor procurement, and engineering compliance.",
    responsibilities: [
      "Create master project execution plans, resource allocation schedules, and cash-flow projections.",
      "Coordinate with municipal authorities, RERA inspectors, and MEP consultants for statutory approvals.",
      "Drive contractor accountability, timeline adherence, and ISO safety standards.",
      "Provide executive leadership to site engineers, surveyors, and procurement personnel.",
    ],
    requirements: [
      "B.Tech in Civil Engineering; MBA in Construction / NICMAR qualification preferred.",
      "7+ years of progressive project management experience in high-rise or major infrastructure works.",
      "Working knowledge of Primavera P6, MS Project, and modern site ERP tools.",
    ],
    status: "Active",
    featured: true,
    order: 2,
  },
  {
    id: "job-3",
    title: "Quality Assurance & Concrete Safety Officer",
    slug: "qa-qc-concrete-safety-officer",
    department: "Safety & Quality Control",
    location: "Etah & Western UP Sites",
    type: "Full-Time",
    experience: "3-6 years",
    salary: "Industry standard + site allowances",
    tagline: "Uphold uncompromising structural integrity, batching lab tests, and safety compliance.",
    description:
      "Manage quality auditing for on-site batching plants, cube compression tests, slump testing, and overall safety protocols across GPS job sites.",
    responsibilities: [
      "Perform concrete slump tests, 7-day/28-day cube compressive strength verification, and soil compaction logs.",
      "Inspect reinforcing steel bars, formwork stability, and waterproofing membranes prior to casting.",
      "Conduct regular safety drills, PPE compliance audits, and scaffold load certifications.",
    ],
    requirements: [
      "Diploma or Degree in Civil Engineering / Materials Science.",
      "Prior experience with NABL lab testing standards and IS codes for reinforced concrete (IS 456, IS 10262).",
      "Certifications in OSHA / NEBOSH or site safety are a distinct plus.",
    ],
    status: "Active",
    featured: false,
    order: 3,
  },
  {
    id: "job-4",
    title: "Heavy Machinery & Fleet Supervisor",
    slug: "heavy-machinery-fleet-supervisor",
    department: "Heavy Machinery & Fleet",
    location: "Etah Equipment Yard",
    type: "Full-Time",
    experience: "3-8 years",
    salary: "Competitive + site allowances",
    tagline: "Maintain and deploy GPS's proprietary fleet of tower cranes, batching plants, and earthmovers.",
    description:
      "Ensure peak operational readiness of GPS Projects' owned heavy construction machinery, scheduled maintenance, and skilled operator assignments.",
    responsibilities: [
      "Supervise daily operation, fuel logs, and preventive maintenance of transit mixers, excavators, and cranes.",
      "Manage our central equipment yard in Etah and coordinate logistics for active project mobilizations.",
      "Diagnose hydraulic and mechanical faults with technicians and order genuine OEM replacement parts.",
    ],
    requirements: [
      "Diploma in Mechanical / Automobile Engineering or proven 5+ years experience managing construction equipment.",
      "Deep practical familiarity with JCB, ACE cranes, Schwing Stetter concrete pumps, and diesel generators.",
    ],
    status: "Active",
    featured: false,
    order: 4,
  },
  {
    id: "job-5",
    title: "Junior Architectural CAD / BIM Draftsman",
    slug: "junior-architectural-cad-bim-draftsman",
    department: "Architecture & Planning",
    location: "Etah Office",
    type: "Full-Time",
    experience: "1-3 years",
    salary: "Commensurate with drafting portfolio",
    tagline: "Translate architectural concepts and working drawings into accurate site construction sheets.",
    description:
      "Join our in-house planning cell to develop detailed 2D architectural sheets, structural rebar detailing, elevation profiles, and 3D modeling for client reviews.",
    responsibilities: [
      "Prepare architectural working drawings, section cuts, stair details, and door/window schedules.",
      "Draft bar bending detail drawings from consulting structural engineer notes.",
      "Assist in creating 3D rendering presentations for ongoing luxury and commercial projects.",
    ],
    requirements: [
      "Diploma in Civil Draftsmanship / Architecture or B.Arch / Civil degree.",
      "Proficiency in AutoCAD, Revit, and SketchUp / 3ds Max.",
      "High attention to architectural dimensions and structural clarity.",
    ],
    status: "Active",
    featured: false,
    order: 5,
  },
];

/**
 * Public method to get active published jobs.
 */
export async function getActiveJobs(): Promise<JobDoc[]> {
  "use cache";
  cacheTag(CAREERS_TAG);
  cacheLife("max");

  try {
    const col = await jobsCollection();
    const count = await col.countDocuments();
    if (count === 0) {
      const now = new Date();
      const seedData: JobDoc[] = DEFAULT_JOBS.map((j) => ({
        ...j,
        createdAt: now,
        updatedAt: now,
      }));
      await col.insertMany(seedData);
      return seedData.filter((j) => j.status === "Active").sort((a, b) => a.order - b.order);
    }

    const docs = await col.find({ status: "Active" }).sort({ order: 1, createdAt: -1 }).toArray();
    return docs.map((d) => ({
      id: d.id || String(d._id),
      title: d.title,
      slug: d.slug,
      department: d.department,
      location: d.location,
      type: d.type,
      experience: d.experience,
      salary: d.salary,
      tagline: d.tagline,
      description: d.description,
      responsibilities: d.responsibilities || [],
      requirements: d.requirements || [],
      status: d.status,
      featured: Boolean(d.featured),
      order: d.order,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  } catch (err) {
    console.warn("Could not fetch jobs from DB, returning fallback default positions:", err);
    return DEFAULT_JOBS.filter((j) => j.status === "Active").map((j) => ({
      ...j,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

/**
 * Admin method to fetch all jobs.
 */
export async function getAllJobsForAdmin(): Promise<JobDoc[]> {
  try {
    const col = await jobsCollection();
    const count = await col.countDocuments();
    if (count === 0) {
      const now = new Date();
      const seedData: JobDoc[] = DEFAULT_JOBS.map((j) => ({
        ...j,
        createdAt: now,
        updatedAt: now,
      }));
      await col.insertMany(seedData);
      return seedData.sort((a, b) => a.order - b.order);
    }

    const docs = await col.find().sort({ order: 1, createdAt: -1 }).toArray();
    return docs.map((d) => ({
      id: d.id || String(d._id),
      title: d.title,
      slug: d.slug,
      department: d.department,
      location: d.location,
      type: d.type,
      experience: d.experience,
      salary: d.salary,
      tagline: d.tagline,
      description: d.description,
      responsibilities: d.responsibilities || [],
      requirements: d.requirements || [],
      status: d.status,
      featured: Boolean(d.featured),
      order: d.order,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  } catch (err) {
    console.error("Error fetching jobs for admin:", err);
    return DEFAULT_JOBS.map((j) => ({
      ...j,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

/**
 * Admin method to save/update a job.
 */
export async function saveJob(data: Partial<JobDoc> & { id?: string; title: string }): Promise<JobDoc> {
  const col = await jobsCollection();
  const now = new Date();
  const id = data.id || `job-${Date.now()}`;
  const slug = data.slug || slugifyJob(data.title);

  const doc: JobDoc = {
    id,
    title: data.title.trim(),
    slug,
    department: (data.department as JobDepartment) || "Civil Engineering",
    location: data.location?.trim() || "Etah, Uttar Pradesh",
    type: (data.type as JobType) || "Full-Time",
    experience: data.experience?.trim() || "2-5 years",
    salary: data.salary?.trim() || "Competitive",
    tagline: data.tagline?.trim() || "",
    description: data.description?.trim() || "",
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    requirements: Array.isArray(data.requirements) ? data.requirements : [],
    status: (data.status as JobStatus) || "Active",
    featured: Boolean(data.featured),
    order: Number(data.order) || 1,
    createdAt: data.createdAt ? new Date(data.createdAt) : now,
    updatedAt: now,
  };

  await col.updateOne({ id }, { $set: doc }, { upsert: true });
  try {
    revalidateTag(CAREERS_TAG, { expire: 0 });
  } catch (e) {
    // revalidateTag outside request scope
  }
  return doc;
}

/**
 * Admin method to delete a job.
 */
export async function deleteJob(id: string): Promise<boolean> {
  const col = await jobsCollection();
  const res = await col.deleteOne({ id });
  try {
    revalidateTag(CAREERS_TAG, { expire: 0 });
  } catch (e) {
    // revalidateTag outside request scope
  }
  return res.deletedCount > 0;
}

/**
 * Candidate submits application.
 */
export async function createJobApplication(data: Omit<JobApplicationDoc, "id" | "status" | "createdAt" | "updatedAt">): Promise<JobApplicationDoc> {
  const col = await applicationsCollection();
  const now = new Date();
  const id = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const doc: JobApplicationDoc = {
    ...data,
    id,
    status: "New",
    createdAt: now,
    updatedAt: now,
  };

  await col.insertOne(doc);
  return doc;
}

/**
 * Admin method to fetch received applications.
 */
export async function getApplications(): Promise<JobApplicationDoc[]> {
  try {
    const col = await applicationsCollection();
    const docs = await col.find().sort({ createdAt: -1 }).toArray();
    return docs.map((d) => ({
      id: d.id || String(d._id),
      jobId: d.jobId,
      jobTitle: d.jobTitle,
      department: d.department,
      name: d.name,
      email: d.email,
      phone: d.phone,
      experience: d.experience,
      currentCompany: d.currentCompany,
      resumeUrl: d.resumeUrl,
      coverLetter: d.coverLetter,
      status: d.status,
      notes: d.notes,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  } catch (err) {
    console.error("Error loading candidate applications:", err);
    return [];
  }
}

/**
 * Admin method to update candidate application status or notes.
 */
export async function updateApplication(id: string, updates: { status?: ApplicationStatus; notes?: string }): Promise<boolean> {
  const col = await applicationsCollection();
  const res = await col.updateOne(
    { id },
    {
      $set: {
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
        updatedAt: new Date(),
      },
    }
  );
  return res.matchedCount > 0;
}
