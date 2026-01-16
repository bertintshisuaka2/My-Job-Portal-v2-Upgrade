import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const aiRouter = router({
  generateResume: protectedProcedure
    .input(z.object({
      resumeId: z.number().optional(),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let resumeData = "";
      let structuredData: any = null;
      
      if (input.resumeId) {
        const resume = await db.getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
        }
        resumeData = resume.extractedText || "";
        
        // Try to use structured data if available
        if (resume.extractedData) {
          try {
            structuredData = JSON.parse(resume.extractedData);
          } catch (e) {
            console.error("Failed to parse extractedData", e);
          }
        }
      }

      const prompt = structuredData
        ? `Create a professional, ATS-friendly resume in markdown format using this structured data:

${JSON.stringify(structuredData, null, 2)}

${input.additionalInfo ? `Additional Information:\n${input.additionalInfo}\n\n` : ""}

Format it with clear sections: Contact Information, Professional Summary, Work Experience (with bullet points for achievements), Education, Skills, Certifications, and Languages. Make it visually appealing and professional.`
        : `You are a professional resume writer. Generate a well-formatted, professional resume based on the following information.

${resumeData ? `Existing Resume Content:\n${resumeData}\n\n` : ""}
${input.additionalInfo ? `Additional Information:\n${input.additionalInfo}\n\n` : ""}

Create a comprehensive resume with the following sections:
- Contact Information
- Professional Summary
- Work Experience
- Education
- Skills
- Certifications (if applicable)

Format the resume in a clean, professional manner using markdown. Make it ATS-friendly and highlight key achievements with metrics where possible.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert resume writer who creates professional, ATS-friendly resumes." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : "";

      // Save to database
      await db.createGeneratedDocument({
        userId: ctx.user.id,
        documentType: "resume",
        title: `Generated Resume - ${new Date().toLocaleDateString()}`,
        content,
      });

      return { content };
    }),

  generateCoverLetter: protectedProcedure
    .input(z.object({
      jobId: z.number(),
      resumeId: z.number().optional(),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get job details
      const job = await db.getJobById(input.jobId);
      if (!job) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      }

      let resumeData = "";
      if (input.resumeId) {
        const resume = await db.getResumeById(input.resumeId);
        if (resume && resume.userId === ctx.user.id) {
          resumeData = resume.extractedText || "";
        }
      }

      const prompt = `You are a professional career coach. Generate a compelling cover letter for the following job application.

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location || "Remote"}
- Job Type: ${job.jobType}
- Description: ${job.description}
${job.requirements ? `- Requirements: ${job.requirements}` : ""}

${resumeData ? `Applicant's Background:\n${resumeData}\n\n` : ""}
${input.additionalInfo ? `Additional Information:\n${input.additionalInfo}\n\n` : ""}

Create a professional cover letter that:
1. Opens with a strong introduction expressing interest in the position
2. Highlights relevant skills and experiences that match the job requirements
3. Demonstrates knowledge of the company and enthusiasm for the role
4. Closes with a call to action

Format the letter professionally with proper business letter structure. Make it personalized and compelling.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert career coach who writes compelling, personalized cover letters." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : "";

      // Save to database
      await db.createGeneratedDocument({
        userId: ctx.user.id,
        documentType: "cover-letter",
        jobId: input.jobId,
        title: `Cover Letter - ${job.title} at ${job.company}`,
        content,
      });

      return { content };
    }),

  generateRecommendationLetter: protectedProcedure
    .input(z.object({
      resumeId: z.number().optional(),
      jobId: z.number().optional(),
      relationshipInfo: z.string(),
      additionalInfo: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      let resumeData = "";
      if (input.resumeId) {
        const resume = await db.getResumeById(input.resumeId);
        if (resume && resume.userId === ctx.user.id) {
          resumeData = resume.extractedText || "";
        }
      }

      let jobData = "";
      if (input.jobId) {
        const job = await db.getJobById(input.jobId);
        if (job) {
          jobData = `Target Position: ${job.title} at ${job.company}`;
        }
      }

      const prompt = `You are a professional reference writer. Generate a strong letter of recommendation based on the following information.

${input.relationshipInfo ? `Relationship Context:\n${input.relationshipInfo}\n\n` : ""}
${resumeData ? `Candidate's Background:\n${resumeData}\n\n` : ""}
${jobData ? `${jobData}\n\n` : ""}
${input.additionalInfo ? `Additional Information:\n${input.additionalInfo}\n\n` : ""}

Create a professional letter of recommendation that:
1. Introduces the recommender and their relationship to the candidate
2. Highlights specific achievements, skills, and qualities
3. Provides concrete examples of the candidate's work and character
4. Gives a strong endorsement for the position or opportunity
5. Closes with contact information and willingness to discuss further

Format the letter professionally with proper business letter structure.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an experienced professional who writes compelling letters of recommendation." },
          { role: "user", content: prompt }
        ],
      });

      const content = typeof response.choices[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : "";

      // Save to database
      await db.createGeneratedDocument({
        userId: ctx.user.id,
        documentType: "recommendation-letter",
        jobId: input.jobId,
        title: `Recommendation Letter - ${new Date().toLocaleDateString()}`,
        content,
      });

      return { content };
    }),

  generateFromResume: protectedProcedure
    .input(z.object({
      resumeId: z.number(),
      documentType: z.enum(["resume", "cover-letter", "recommendation-letter"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { parseResumeFromUrl, extractResumeInfo } = await import("./resumeParser");
      
      // Get resume
      const resume = await db.getResumeById(input.resumeId);
      if (!resume || resume.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
      }

      // Parse resume content
      const resumeText = await parseResumeFromUrl(resume.fileUrl, resume.mimeType);
      const resumeInfo = extractResumeInfo(resumeText);

      let content = "";
      let title = "";

      if (input.documentType === "resume") {
        const prompt = `You are a professional resume writer. Based on the following resume content, create a well-formatted, professional resume in markdown format. Include sections for contact information, professional summary, work experience, education, and skills. Make it ATS-friendly and visually appealing.\n\nResume Content:\n${resumeText}`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert resume writer." },
            { role: "user", content: prompt }
          ]
        });
        
        content = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "";
        
        const userName = resumeInfo.name || ctx.user.name || "User";
        title = `Professional Resume - ${userName}`;
      } else if (input.documentType === "cover-letter") {
        const prompt = `Based on this resume, create a professional, general-purpose cover letter template in markdown format. The letter should highlight the candidate's key strengths and be adaptable to various job applications. Include placeholders for [Company Name] and [Position Title].\n\nResume Content:\n${resumeText}`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert cover letter writer." },
            { role: "user", content: prompt }
          ]
        });
        
        content = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "";
        
        const userName = resumeInfo.name || ctx.user.name || "User";
        title = `General Cover Letter - ${userName}`;
      } else if (input.documentType === "recommendation-letter") {
        const prompt = `Based on this resume, create a professional recommendation letter template in markdown format. The letter should be written from a supervisor's perspective, highlighting the candidate's skills, achievements, and work ethic. Include placeholders for [Recommender Name], [Recommender Title], and [Relationship].\n\nResume Content:\n${resumeText}`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert at writing professional recommendation letters." },
            { role: "user", content: prompt }
          ]
        });
        
        content = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : "";
        
        const userName = resumeInfo.name || ctx.user.name || "User";
        title = `Recommendation Letter Template - ${userName}`;
      }

      // Save to database
      await db.createGeneratedDocument({
        userId: ctx.user.id,
        documentType: input.documentType,
        title,
        content,
      });

      return { content };
    }),

  findMatchingJobs: protectedProcedure
    .input(z.object({
      resumeId: z.number(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const { parseResumeFromUrl, extractResumeInfo } = await import("./resumeParser");
      
      // Get resume
      const resume = await db.getResumeById(input.resumeId);
      if (!resume || resume.userId !== ctx.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Resume not found' });
      }

      // Parse resume content
      const resumeText = await parseResumeFromUrl(resume.fileUrl, resume.mimeType);
      const resumeInfo = extractResumeInfo(resumeText);

      // Get all active jobs
      const allJobs = await db.getAllJobs({ status: "active" });
      
      if (allJobs.length === 0) {
        return { matches: [] };
      }

      // Use AI to analyze and match jobs
      const jobsText = allJobs.map((job: any, idx: number) => 
        `Job ${idx + 1} (ID: ${job.jobId}):\nTitle: ${job.title}\nCompany: ${job.company}\nDescription: ${job.description}\nRequirements: ${job.requirements || "N/A"}\nSkills: ${job.skills || "N/A"}\n`
      ).join("\n---\n\n");

      const prompt = `You are a job matching expert. Analyze the following resume and match it with the most relevant jobs from the list below. Return ONLY a JSON array of job matches, ordered by relevance (most relevant first).\n\nResume Content:\n${resumeText}\n\n---\n\nAvailable Jobs:\n${jobsText}\n\n---\n\nReturn exactly ${input.limit} matches in this JSON format (no additional text):\n[\n  {\n    "jobId": "JOB-XXX",\n    "relevanceScore": 95,\n    "matchReasons": ["reason 1", "reason 2", "reason 3"]\n  }\n]\n\nRelevance score should be 0-100. Match reasons should be specific and concise.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a job matching AI that returns only valid JSON arrays." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "job_matches",
            strict: true,
            schema: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      jobId: { type: "string" },
                      relevanceScore: { type: "number" },
                      matchReasons: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["jobId", "relevanceScore", "matchReasons"],
                    additionalProperties: false
                  }
                }
              },
              required: ["matches"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        return { matches: [] };
      }

      const result = JSON.parse(content);
      const matches = result.matches || [];

      // Enrich matches with full job details
      const enrichedMatches = matches.map((match: any) => {
        const job = allJobs.find((j: any) => j.jobId === match.jobId);
        return {
          ...match,
          job: job || null
        };
      }).filter((m: any) => m.job !== null);

      return { matches: enrichedMatches };
    }),
});
