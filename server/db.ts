import { eq, desc, like, or, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, InsertJob, Job, resumes, InsertResume, Resume, applications, InsertApplication, Application, generatedDocuments, InsertGeneratedDocument, GeneratedDocument } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= JOB QUERIES =============

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(jobs).values(job);
  return result;
}

export async function getAllJobs(filters?: { status?: string; jobType?: string; search?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(jobs.status, filters.status as any));
  }
  if (filters?.jobType) {
    conditions.push(eq(jobs.jobType, filters.jobType as any));
  }
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(jobs.title, searchTerm),
        like(jobs.company, searchTerm),
        like(jobs.location, searchTerm),
        like(jobs.jobId, searchTerm)
      )
    );
  }
  
  const query = conditions.length > 0 
    ? db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt))
    : db.select().from(jobs).orderBy(desc(jobs.createdAt));
  
  return await query;
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getJobByJobId(jobId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(jobs).where(eq(jobs.jobId, jobId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateJob(id: number, updates: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(jobs).set(updates).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(jobs).where(eq(jobs.id, id));
}

// ============= RESUME QUERIES =============

export async function createResume(resume: InsertResume) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(resumes).values(resume);
  return result;
}

export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
}

export async function getResumeById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function setPrimaryResume(userId: number, resumeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, unset all primary resumes for this user
  await db.update(resumes).set({ isPrimary: 0 }).where(eq(resumes.userId, userId));
  
  // Then set the selected resume as primary
  await db.update(resumes).set({ isPrimary: 1 }).where(eq(resumes.id, resumeId));
}

export async function deleteResume(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(resumes).where(eq(resumes.id, id));
}

export async function updateResumeExtractedData(userId: number, fileName: string, data: { extractedText?: string; extractedData?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(resumes)
    .set(data)
    .where(and(eq(resumes.userId, userId), eq(resumes.fileName, fileName)));
}

// ============= APPLICATION QUERIES =============

export async function createApplication(application: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(applications).values(application);
  return result;
}

export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.appliedAt));
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateApplication(id: number, updates: Partial<InsertApplication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(applications).set(updates).where(eq(applications.id, id));
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(applications).where(eq(applications.id, id));
}

// ============= GENERATED DOCUMENT QUERIES =============

export async function createGeneratedDocument(document: InsertGeneratedDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedDocuments).values(document);
  return result;
}

export async function getUserGeneratedDocuments(userId: number, documentType?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (documentType) {
    return await db.select().from(generatedDocuments)
      .where(and(eq(generatedDocuments.userId, userId), eq(generatedDocuments.documentType, documentType as any)))
      .orderBy(desc(generatedDocuments.createdAt));
  }
  
  return await db.select().from(generatedDocuments)
    .where(eq(generatedDocuments.userId, userId))
    .orderBy(desc(generatedDocuments.createdAt));
}

export async function getGeneratedDocumentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGeneratedDocument(id: number, updates: Partial<InsertGeneratedDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(generatedDocuments).set(updates).where(eq(generatedDocuments.id, id));
}

export async function deleteGeneratedDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(generatedDocuments).where(eq(generatedDocuments.id, id));
}

export async function deleteAllUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete in order to respect potential constraints
  await db.delete(generatedDocuments).where(eq(generatedDocuments.userId, userId));
  await db.delete(applications).where(eq(applications.userId, userId));
  await db.delete(resumes).where(eq(resumes.userId, userId));
}
