import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Job Matching Tests", () => {
  it("should have findMatchingJobs procedure in AI router", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    expect(caller.ai.findMatchingJobs).toBeDefined();
  });

  it("should accept resumeId and limit parameters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This will fail because resume doesn't exist, but verifies parameter acceptance
    try {
      await caller.ai.findMatchingJobs({
        resumeId: 999,
        limit: 5,
      });
    } catch (error: any) {
      // Should fail with NOT_FOUND, not parameter validation error
      expect(error.code).toBe("NOT_FOUND");
    }
  });

  it("should validate limit parameter range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test limit too high
    try {
      await caller.ai.findMatchingJobs({
        resumeId: 1,
        limit: 25, // Max is 20
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too big");
    }

    // Test limit too low
    try {
      await caller.ai.findMatchingJobs({
        resumeId: 1,
        limit: 0, // Min is 1
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });

  it("should list all jobs for matching", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const jobs = await caller.jobs.list({ status: "active" });

    expect(Array.isArray(jobs)).toBe(true);
    // Should have sample jobs from seed data
    expect(jobs.length).toBeGreaterThan(0);
  });
});
