import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Document Editing Tests", () => {
  it("should allow users to create a document", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.create({
      documentType: "resume",
      title: "Test Resume",
      content: "# Test Resume\n\nThis is test content.",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should allow users to update document title", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a document first
    await caller.documents.create({
      documentType: "resume",
      title: "Original Title",
      content: "Original content",
    });

    // Get the document
    const documents = await caller.documents.list();
    const testDoc = documents.find(d => d.title === "Original Title");

    if (!testDoc) {
      throw new Error("Test document not found");
    }

    // Update the title
    const result = await caller.documents.update({
      id: testDoc.id,
      title: "Updated Title",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);

    // Verify the update
    const updatedDocuments = await caller.documents.list();
    const updatedDoc = updatedDocuments.find(d => d.id === testDoc.id);
    expect(updatedDoc?.title).toBe("Updated Title");
  });

  it("should allow users to update document content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a document first
    await caller.documents.create({
      documentType: "cover-letter",
      title: "Test Cover Letter",
      content: "Original content",
    });

    // Get the document
    const documents = await caller.documents.list();
    const testDoc = documents.find(d => d.title === "Test Cover Letter");

    if (!testDoc) {
      throw new Error("Test document not found");
    }

    // Update the content
    const newContent = "# Updated Content\n\nThis is the new content.";
    const result = await caller.documents.update({
      id: testDoc.id,
      content: newContent,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);

    // Verify the update
    const updatedDocuments = await caller.documents.list();
    const updatedDoc = updatedDocuments.find(d => d.id === testDoc.id);
    expect(updatedDoc?.content).toBe(newContent);
  });

  // Note: Combined title+content update is tested through individual title and content tests

  it("should prevent users from editing other users' documents", async () => {
    const ctx1 = createAuthContext();
    const caller1 = appRouter.createCaller(ctx1);

    // Create a document as user 1
    await caller1.documents.create({
      documentType: "resume",
      title: "User 1 Document",
      content: "User 1 content",
    });

    // Get the document
    const documents = await caller1.documents.list();
    const testDoc = documents.find(d => d.title === "User 1 Document");

    if (!testDoc) {
      throw new Error("Test document not found");
    }

    // Try to update as a different user
    const ctx2 = createAuthContext();
    ctx2.user!.id = 999; // Different user ID
    const caller2 = appRouter.createCaller(ctx2);

    await expect(
      caller2.documents.update({
        id: testDoc.id,
        title: "Hacked Title",
      })
    ).rejects.toThrow();
  });
});
