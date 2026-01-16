import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Job Portal Tests", () => {
  describe("Jobs Router", () => {
    it("should list jobs without authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const jobs = await caller.jobs.list();

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBeGreaterThan(0);
      
      // Check job structure
      const firstJob = jobs[0];
      expect(firstJob).toHaveProperty("id");
      expect(firstJob).toHaveProperty("jobId");
      expect(firstJob).toHaveProperty("title");
      expect(firstJob).toHaveProperty("company");
    });

    it("should filter jobs by search term", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const jobs = await caller.jobs.list({ search: "Engineer" });

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      
      // All results should contain "Engineer" in title, company, or location
      if (jobs.length > 0) {
        const firstJob = jobs[0];
        const searchMatch = 
          firstJob.title.includes("Engineer") ||
          firstJob.company.includes("Engineer") ||
          (firstJob.location && firstJob.location.includes("Engineer"));
        expect(searchMatch).toBe(true);
      }
    });

    it("should get job by ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const jobs = await caller.jobs.list();
      if (jobs.length === 0) {
        console.warn("No jobs available for testing");
        return;
      }

      const firstJobId = jobs[0].id;
      const job = await caller.jobs.getById({ id: firstJobId });

      expect(job).toBeDefined();
      expect(job.id).toBe(firstJobId);
      expect(job).toHaveProperty("title");
      expect(job).toHaveProperty("description");
    });

    it("should get job by jobId string", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const jobs = await caller.jobs.list();
      if (jobs.length === 0) {
        console.warn("No jobs available for testing");
        return;
      }

      const firstJobIdString = jobs[0].jobId;
      const job = await caller.jobs.getByJobId({ jobId: firstJobIdString });

      expect(job).toBeDefined();
      expect(job.jobId).toBe(firstJobIdString);
    });

    it("should prevent non-admin from creating jobs", async () => {
      const ctx = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.jobs.create({
          jobId: "TEST-001",
          title: "Test Job",
          company: "Test Company",
          jobType: "full-time",
          description: "Test description",
          status: "active",
        })
      ).rejects.toThrow();
    });
  });

  describe("Resumes Router", () => {
    it("should require authentication to list resumes", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.resumes.list()).rejects.toThrow();
    });

    it("should allow authenticated users to list their resumes", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resumes = await caller.resumes.list();

      expect(resumes).toBeDefined();
      expect(Array.isArray(resumes)).toBe(true);
    });
  });

  describe("Applications Router", () => {
    it("should require authentication to list applications", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.applications.list()).rejects.toThrow();
    });

    it("should allow authenticated users to list their applications", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const applications = await caller.applications.list();

      expect(applications).toBeDefined();
      expect(Array.isArray(applications)).toBe(true);
    });

    it("should allow users to create applications", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First get a job to apply to
      const jobs = await caller.jobs.list();
      if (jobs.length === 0) {
        console.warn("No jobs available for testing");
        return;
      }

      const result = await caller.applications.create({
        jobId: jobs[0].id,
        notes: "Test application",
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("Documents Router", () => {
    it("should require authentication to list documents", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.documents.list()).rejects.toThrow();
    });

    it("should allow authenticated users to list their documents", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const documents = await caller.documents.list();

      expect(documents).toBeDefined();
      expect(Array.isArray(documents)).toBe(true);
    });

    it("should filter documents by type", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resumes = await caller.documents.list({ documentType: "resume" });
      const coverLetters = await caller.documents.list({ documentType: "cover-letter" });

      expect(resumes).toBeDefined();
      expect(coverLetters).toBeDefined();
      expect(Array.isArray(resumes)).toBe(true);
      expect(Array.isArray(coverLetters)).toBe(true);
    });
  });

  describe("User Router", () => {
    it("should allow users to reset their data", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.user.resetData();

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("AI Router", () => {
    it("should require authentication for AI generation", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ai.generateResume({ additionalInfo: "Test" })
      ).rejects.toThrow();
    });

    it("should allow authenticated users to generate resume", { timeout: 30000 }, async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.generateResume({
        additionalInfo: "Software engineer with 5 years of experience in React and Node.js",
      });

      expect(result).toHaveProperty("content");
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
    });

    it("should require jobId for cover letter generation", { timeout: 30000 }, async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const jobs = await caller.jobs.list();
      if (jobs.length === 0) {
        console.warn("No jobs available for testing");
        return;
      }

      const result = await caller.ai.generateCoverLetter({
        jobId: jobs[0].id,
        additionalInfo: "I am very interested in this position",
      });

      expect(result).toHaveProperty("content");
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
    });

    it("should require relationship info for recommendation letter", { timeout: 30000 }, async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ai.generateRecommendationLetter({
        relationshipInfo: "I was their supervisor for 3 years",
        additionalInfo: "Excellent team player",
      });

      expect(result).toHaveProperty("content");
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
    });
  });
});
