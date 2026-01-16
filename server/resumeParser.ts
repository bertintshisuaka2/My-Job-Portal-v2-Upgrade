import * as pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { invokeLLM } from "./_core/llm";

/**
 * Parse resume content from URL
 * Supports PDF and DOCX formats
 */
export async function parseResumeFromUrl(fileUrl: string, mimeType: string): Promise<string> {
  try {
    // Fetch file from URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse based on file type
    if (mimeType === "application/pdf") {
      const data = await (pdfParse as any)(buffer);
      return data.text;
    } else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume content");
  }
}

/**
 * Extract key information from resume text
 */
export function extractResumeInfo(text: string): {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
} {
  const info: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
  } = {};

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }

  // Try to extract name (usually first line or near contact info)
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length > 0) {
    // First non-empty line is often the name
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.includes("@")) {
      info.name = firstLine;
    }
  }

  // Extract summary/objective (usually after "Summary", "Objective", "Profile", etc.)
  const summaryMatch = text.match(
    /(?:Summary|Objective|Profile|About|Professional Summary)[:\s]*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  );
  if (summaryMatch && summaryMatch[1]) {
    info.summary = summaryMatch[1].trim().substring(0, 500);
  }

  return info;
}

/**
 * Extract structured data from resume text using LLM
 */
export async function extractStructuredData(resumeText: string): Promise<any> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a resume parser. Extract structured information from resumes and return it as JSON."
      },
      {
        role: "user",
        content: `Parse the following resume and extract structured information. Return ONLY valid JSON with this exact structure:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, State/Country",
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Location",
      "startDate": "Start date",
      "endDate": "End date or Present",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University name",
      "location": "Location",
      "graduationDate": "Graduation date",
      "gpa": "GPA if mentioned"
    }
  ],
  "certifications": ["cert1", "cert2", ...],
  "languages": ["language1", "language2", ...]
}

Resume text:
${resumeText}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resume_data",
        strict: true,
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            summary: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  company: { type: "string" },
                  location: { type: "string" },
                  startDate: { type: "string" },
                  endDate: { type: "string" },
                  description: { type: "string" }
                },
                required: ["title", "company", "startDate", "endDate", "description"],
                additionalProperties: false
              }
            },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  degree: { type: "string" },
                  institution: { type: "string" },
                  location: { type: "string" },
                  graduationDate: { type: "string" },
                  gpa: { type: "string" }
                },
                required: ["degree", "institution", "graduationDate"],
                additionalProperties: false
              }
            },
            certifications: { type: "array", items: { type: "string" } },
            languages: { type: "array", items: { type: "string" } }
          },
          required: ["name", "email", "skills", "experience", "education"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error("Failed to extract structured data from resume");
  }

  return JSON.parse(content);
}
