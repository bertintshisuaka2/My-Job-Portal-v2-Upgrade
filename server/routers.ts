import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { aiRouter } from "./aiRouter";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jobs: router({
    list: publicProcedure
      .input(z.object({
        status: z.string().optional(),
        jobType: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllJobs(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const job = await db.getJobById(input.id);
        if (!job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
        }
        return job;
      }),
    
    getByJobId: publicProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ input }) => {
        const job = await db.getJobByJobId(input.jobId);
        if (!job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
        }
        return job;
      }),
    
    create: protectedProcedure
      .input(z.object({
        jobId: z.string(),
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']),
        salary: z.string().optional(),
        description: z.string(),
        requirements: z.string().optional(),
        benefits: z.string().optional(),
        status: z.enum(['active', 'closed', 'draft']).default('active'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can create jobs
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can create jobs' });
        }
        
        await db.createJob({
          ...input,
          postedBy: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
        salary: z.string().optional(),
        description: z.string().optional(),
        requirements: z.string().optional(),
        benefits: z.string().optional(),
        status: z.enum(['active', 'closed', 'draft']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can update jobs' });
        }
        
        const { id, ...updates } = input;
        await db.updateJob(id, updates);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only admins can delete jobs' });
        }
        
        await db.deleteJob(input.id);
        
        return { success: true };
      }),
  }),

  resumes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserResumes(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const resume = await db.getResumeById(input.id);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
        }
        return resume;
      }),
    
    create: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        extractedText: z.string().optional(),
        autoGenerate: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { autoGenerate, ...resumeData } = input;
        
        // Create resume record
        await db.createResume({
          ...resumeData,
          userId: ctx.user.id,
        });
        
        // Auto-generate documents if requested
        if (autoGenerate) {
          try {
            const { parseResumeFromUrl, extractStructuredData } = await import("./resumeParser");
            const { invokeLLM } = await import("./_core/llm");
            
            // Parse resume content
            const resumeText = await parseResumeFromUrl(input.fileUrl, input.mimeType);
            
            // Extract structured data using LLM
            const structuredData = await extractStructuredData(resumeText);
            
            // Update resume with extracted data
            await db.updateResumeExtractedData(ctx.user.id, input.fileName, {
              extractedText: resumeText,
              extractedData: JSON.stringify(structuredData)
            });
            
               // Generate formatted resume using structured data
            const resumePrompt = `Create a professional, ATS-friendly resume in markdown format using this structured data:

${JSON.stringify(structuredData, null, 2)}

Format it with clear sections: Contact Information, Professional Summary, Work Experience (with bullet points for achievements), Education, Skills, Certifications, and Languages. Make it visually appealing and professional.`;
            
            const resumeResponse = await invokeLLM({
              messages: [
                { role: "system", content: "You are an expert resume writer." },
                { role: "user", content: resumePrompt }
              ]
            });
            
            const formattedResume = typeof resumeResponse.choices[0]?.message?.content === 'string' 
              ? resumeResponse.choices[0].message.content 
              : "";
            
            // Generate general cover letter
            const coverLetterPrompt = `Based on this resume, create a professional, general-purpose cover letter template in markdown format. The letter should highlight the candidate's key strengths and be adaptable to various job applications. Include placeholders for [Company Name] and [Position Title].\n\nResume Content:\n${resumeText}`;
            
            const coverLetterResponse = await invokeLLM({
              messages: [
                { role: "system", content: "You are an expert cover letter writer." },
                { role: "user", content: coverLetterPrompt }
              ]
            });
            
            const coverLetter = typeof coverLetterResponse.choices[0]?.message?.content === 'string' 
              ? coverLetterResponse.choices[0].message.content 
              : "";
            
            // Generate recommendation letter template
            const recLetterPrompt = `Based on this resume, create a professional recommendation letter template in markdown format. The letter should be written from a supervisor's perspective, highlighting the candidate's skills, achievements, and work ethic. Include placeholders for [Recommender Name], [Recommender Title], and [Relationship].\n\nResume Content:\n${resumeText}`;
            
            const recLetterResponse = await invokeLLM({
              messages: [
                { role: "system", content: "You are an expert at writing professional recommendation letters." },
                { role: "user", content: recLetterPrompt }
              ]
            });
            
            const recLetter = typeof recLetterResponse.choices[0]?.message?.content === 'string' 
              ? recLetterResponse.choices[0].message.content 
              : "";
            
            // Save generated documents
            const userName = structuredData.name || ctx.user.name || "User";
            
            await db.createGeneratedDocument({
              userId: ctx.user.id,
              documentType: "resume",
              title: `Professional Resume - ${userName}`,
              content: formattedResume,
            });
            
            await db.createGeneratedDocument({
              userId: ctx.user.id,
              documentType: "cover-letter",
              title: `General Cover Letter - ${userName}`,
              content: coverLetter,
            });
            
            await db.createGeneratedDocument({
              userId: ctx.user.id,
              documentType: "recommendation-letter",
              title: `Recommendation Letter Template - ${userName}`,
              content: recLetter,
            });
          } catch (error) {
            console.error("Auto-generation error:", error);
            // Don't fail the resume upload if auto-generation fails
          }
        }
        
        return { success: true };
      }),
    
    setPrimary: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const resume = await db.getResumeById(input.id);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
        }
        
        await db.setPrimaryResume(ctx.user.id, input.id);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const resume = await db.getResumeById(input.id);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
        }
        
        await db.deleteResume(input.id);
        
        return { success: true };
      }),
  }),

  applications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserApplications(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.id);
        if (!application || application.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
        }
        return application;
      }),
    
    create: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        resumeId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if job exists
        const job = await db.getJobById(input.jobId);
        if (!job) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
        }
        
        await db.createApplication({
          ...input,
          userId: ctx.user.id,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'reviewing', 'accepted', 'rejected']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.id);
        if (!application || application.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
        }
        
        const { id, ...updates } = input;
        await db.updateApplication(id, updates);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getApplicationById(input.id);
        if (!application || application.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Application not found' });
        }
        
        await db.deleteApplication(input.id);
        
        return { success: true };
      }),
  }),

  documents: router({
    list: protectedProcedure
      .input(z.object({
        documentType: z.enum(['resume', 'cover-letter', 'recommendation-letter']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserGeneratedDocuments(ctx.user.id, input?.documentType);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const document = await db.getGeneratedDocumentById(input.id);
        if (!document || document.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        return document;
      }),
    
    create: protectedProcedure
      .input(z.object({
        documentType: z.enum(['resume', 'cover-letter', 'recommendation-letter']),
        jobId: z.number().optional(),
        applicationId: z.number().optional(),
        title: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
      await db.createGeneratedDocument({
        ...input,
        userId: ctx.user.id,
      });
      
      return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const document = await db.getGeneratedDocumentById(input.id);
        if (!document || document.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        
        const { id, ...updates } = input;
        await db.updateGeneratedDocument(id, updates);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const document = await db.getGeneratedDocumentById(input.id);
        if (!document || document.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
        }
        
        await db.deleteGeneratedDocument(input.id);
        
        return { success: true };
      }),
  }),

  user: router({
    resetData: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteAllUserData(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
