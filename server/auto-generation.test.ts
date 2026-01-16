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

describe("Automatic Document Generation Tests", () => {
  it("should accept autoGenerate parameter in resume creation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // This test just verifies the parameter is accepted
    // Actual generation would require a real resume file
    const result = await caller.resumes.create({
      fileName: "test-resume.pdf",
      fileUrl: "https://example.com/resume.pdf",
      fileKey: "resumes/1/test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
      autoGenerate: false, // Set to false to avoid actual generation
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should have generateFromResume procedure in AI router", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Verify the procedure exists
    expect(caller.ai.generateFromResume).toBeDefined();
  });

  it("should list resumes for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const resumes = await caller.resumes.list();

    expect(Array.isArray(resumes)).toBe(true);
  });

  it("should list documents for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const documents = await caller.documents.list();

    expect(Array.isArray(documents)).toBe(true);
  });
});
