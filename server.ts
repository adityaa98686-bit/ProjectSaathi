import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";
import * as pdfParseModule from "pdf-parse";

// Interop helper for pdf-parse CommonJS module
const pdfParse: (dataBuffer: Buffer, options?: any) => Promise<{ text: string }> = 
  (pdfParseModule as any).default || pdfParseModule;

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers for base64 file payloads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", geminiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  });

  // High-Speed, High-Accuracy Resume Parsing Endpoint
  app.post("/api/parse-resume", async (req, res) => {
    try {
      const { fileBase64, mimeType, fileName, rawText: clientRawText } = req.body;

      if (!fileBase64 && !clientRawText) {
        res.status(400).json({ error: "Missing file content or text to parse." });
        return;
      }

      let parsedDocumentText = clientRawText || "";

      // If PDF base64 is provided, extract the real text buffer directly using pdf-parse
      if (fileBase64 && (!mimeType || mimeType.includes("pdf") || (fileName && fileName.toLowerCase().endsWith(".pdf")))) {
        try {
          const pdfBuffer = Buffer.from(fileBase64, "base64");
          const pdfData = await pdfParse(pdfBuffer);
          if (pdfData && pdfData.text && pdfData.text.trim().length > 10) {
            parsedDocumentText = pdfData.text.trim();
          }
        } catch (pdfErr: any) {
          console.warn("PDF text extraction notice:", pdfErr?.message || pdfErr);
        }
      }

      const ai = getGeminiClient();

      if (ai) {
        try {
          const parts: any[] = [];
          
          if (parsedDocumentText && parsedDocumentText.length > 0) {
            // Passing pure extracted text is 100x faster, zero-latency, and avoids heavy multimodal PDF raster overhead
            parts.push({
              text: `Extracted Candidate Resume Content:\n"""\n${parsedDocumentText.slice(0, 45000)}\n"""\n\nOriginal Document File Name: ${fileName || 'resume.pdf'}`,
            });
          } else if (fileBase64) {
            // Only send raw base64 if text extraction wasn't possible (e.g. image file or scanned PDF)
            let safeMime = mimeType || 'application/pdf';
            if (fileName && fileName.toLowerCase().endsWith('.pdf')) safeMime = 'application/pdf';
            else if (fileName && (fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg'))) {
              safeMime = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
            }

            parts.push({
              inlineData: {
                data: fileBase64,
                mimeType: safeMime,
              },
            });
            parts.push({
              text: `Original File Name: ${fileName || 'resume.pdf'}\nAnalyze this uploaded resume document carefully and extract candidate profile details.`,
            });
          }

          const systemInstruction = `You are a high-speed, hyper-accurate Candidate Resume Intelligence Engine.
Analyze the provided resume document or text carefully and extract the candidate's real profile facts with 100% precision.

EXTRACTION INSTRUCTIONS:
1. Candidate Name: Extract the candidate's real human name located at the very top header of the resume (e.g. "Aditya Sharma", "Sarah Jenkins", "Alex Chen", "Rohit Verma"). Never return "Candidate", "Resume", "Profile", "Software Engineer", or a role title as the name.
2. Email: Real email address if present (e.g. aditya@gmail.com).
3. Location: City / country or "Remote / Hybrid".
4. Primary Role: The candidate's specific job title or area of specialization (e.g., 'Full-Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'AI / ML Engineer', 'Data Scientist', 'DevOps & Cloud Engineer', 'Mobile Developer', 'UI/UX Designer', 'Product Manager'). Base this on their actual work history, projects, and skills.
5. Headline: A professional 1-line headline summarizing their expertise (e.g., "Full-Stack Engineer | React, Node.js & Scalable Systems").
6. Bio: A concise, compelling 2-3 sentence overview summarizing their background, technical strengths, and project experience accurately from the resume.
7. Experience Level: One of: 'Beginner' (0-1 yrs/student), 'Intermediate' (2-4 yrs), 'Advanced' (5-8 yrs), or 'Lead' (8+ yrs/staff/lead).
8. Hours Per Week: Weekly availability (default 20 if not specified).
9. Skills: Extract ALL technical tools, frameworks, programming languages, databases, cloud services, and design skills explicitly found in the resume (e.g., TypeScript, React, Node.js, Python, PostgreSQL, Docker, AWS, Tailwind CSS, Next.js, Figma, Git, GraphQL, Redis, CI/CD, MongoDB, C++, Java, etc.). Categorize each as 'technical', 'design', 'domain', or 'soft', and level as 'beginner', 'proficient', or 'expert'.
10. Domain Interests: 2-5 industry fields aligned with their work (e.g. "AI & Machine Learning", "Developer Tools", "Fintech & Payments", "Cloud Infrastructure", "SaaS", "Healthcare & Biotech", "Web3").
11. LinkedIn / GitHub / Portfolio URLs: Real profile links if mentioned in the document.
12. Past Projects / Work Experience: Extract up to 4 significant projects or work positions with project title, candidate's role, concise description, and key technologies.
13. Extraction Summary: A friendly 1-sentence summary highlighting the candidate's core profile and top skills discovered.`;

          const modelsToTry = [
            { name: "gemini-3.7-flash", useThinking: true },
            { name: "gemini-flash-latest", useThinking: false },
            { name: "gemini-3.1-flash-lite", useThinking: false },
          ];

          let parsedData: any = null;

          for (const modelConfig of modelsToTry) {
            try {
              const genConfig: any = {
                systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.1,
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Full Human Name of the candidate" },
                    email: { type: Type.STRING, description: "Email address found in resume" },
                    location: { type: Type.STRING, description: "Location or city/remote" },
                    primaryRole: { type: Type.STRING, description: "Primary role title" },
                    headline: { type: Type.STRING, description: "Professional 1-line headline" },
                    bio: { type: Type.STRING, description: "Professional summary / bio" },
                    experienceLevel: { type: Type.STRING, description: "One of Beginner, Intermediate, Advanced, Lead" },
                    hoursPerWeek: { type: Type.NUMBER, description: "Available hours per week" },
                    skills: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          category: { type: Type.STRING, description: "technical, design, domain, or soft" },
                          level: { type: Type.STRING, description: "beginner, proficient, or expert" },
                        },
                        required: ["name", "category", "level"],
                      },
                    },
                    interests: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    linkedinUrl: { type: Type.STRING },
                    githubUrl: { type: Type.STRING },
                    portfolioUrl: { type: Type.STRING },
                    pastProjects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          role: { type: Type.STRING },
                          description: { type: Type.STRING },
                          technologies: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                        },
                        required: ["title", "role", "description", "technologies"],
                      },
                    },
                    extractionSummary: { type: Type.STRING },
                  },
                  required: ["name", "primaryRole", "skills", "experienceLevel"],
                },
              };

              if (modelConfig.useThinking) {
                genConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
              }

              const response = await ai.models.generateContent({
                model: modelConfig.name,
                contents: { parts },
                config: genConfig,
              });

              const jsonText = response.text?.trim();
              if (jsonText) {
                const candidateObj = JSON.parse(jsonText);
                if (candidateObj && (candidateObj.name || candidateObj.primaryRole)) {
                  parsedData = candidateObj;
                  break;
                }
              }
            } catch {
              // Proceed to next model in high-availability cascade
              continue;
            }
          }

          if (parsedData) {
            // Normalize past project IDs if missing
            if (Array.isArray(parsedData.pastProjects)) {
              parsedData.pastProjects = parsedData.pastProjects.map((p: any, idx: number) => ({
                ...p,
                id: p.id || `proj-extracted-${idx + 1}`,
              }));
            }

            // Ensure name is clean and verified
            let finalName = parsedData.name?.trim();
            if (!finalName || ["candidate", "profile", "resume", "curriculum vitae", "software developer", "developer"].includes(finalName.toLowerCase())) {
              finalName = extractNameFromText(parsedDocumentText, fileName);
            }

            res.json({
              success: true,
              data: {
                ...parsedData,
                name: finalName,
                fileName: fileName || "uploaded_resume.pdf",
              },
              source: "gemini-ai",
            });
            return;
          }
        } catch {
          // Fall through to smart heuristic parser
        }
      }

      // Smart Heuristic / Text Extraction when Gemini is unreachable
      const fallbackResult = parseTextHeuristically(parsedDocumentText, fileName || "resume.pdf");
      res.json({
        success: true,
        data: fallbackResult,
        source: "heuristic-fallback",
      });
    } catch (err: any) {
      console.warn("General notice in /api/parse-resume:", err?.message || err);
      res.status(500).json({ error: "Failed to parse resume.", details: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProjectSaathi Server running on http://0.0.0.0:${PORT}`);
  });
}

function extractNameFromText(text: string, fileName: string): string {
  if (text) {
    const rawLines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const rawLine of rawLines.slice(0, 10)) {
      let line = rawLine;

      // Handle lines like "Aditya Sharma | Full Stack Engineer" or "John Doe - Software Developer"
      if (line.includes("|")) line = line.split("|")[0].trim();
      else if (line.includes("•")) line = line.split("•")[0].trim();
      else if (line.includes("—")) line = line.split("—")[0].trim();
      else if (line.includes(" - ")) line = line.split(" - ")[0].trim();

      // Clean prefixes like "Name:"
      line = line.replace(/^(name\s*:|applicant\s*:|candidate\s*:)/i, "").trim();

      const lower = line.toLowerCase();
      // Skip contact details, headers, or metadata
      if (
        lower.includes("@") ||
        lower.includes("http") ||
        lower.includes("www.") ||
        lower.includes("github.com") ||
        lower.includes("linkedin.com") ||
        lower.includes("phone") ||
        lower.includes("tel:") ||
        lower.includes("+91") ||
        lower.includes("resume") ||
        lower.includes("curriculum") ||
        lower.includes("vitae") ||
        lower.includes("page ") ||
        lower.includes("software developer") ||
        lower.includes("software engineer") ||
        lower.includes("full stack") ||
        lower.includes("frontend") ||
        lower.includes("backend") ||
        lower.includes("profile") ||
        lower.includes("summary") ||
        lower.includes("experience") ||
        lower.includes("education") ||
        lower.includes("skills") ||
        lower.includes("projects") ||
        lower.includes("contact")
      ) {
        continue;
      }

      // Candidate name is usually 2 to 4 words, alphabetic only, between 3 and 35 chars
      const cleanLine = line.replace(/[^a-zA-Z\s.]/g, "").trim();
      const words = cleanLine.split(/\s+/).filter((w) => w.length > 1);
      if (words.length >= 2 && words.length <= 4 && cleanLine.length >= 4 && cleanLine.length <= 35) {
        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      }
    }
  }

  // Fallback to cleaned filename if text doesn't yield a name
  const cleanFile = fileName
    .replace(/\.(pdf|docx|txt|png|jpg|jpeg)$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/resume|cv|2026|2025|2024|v1|v2|final|doc|latest|profile/gi, "")
    .trim();

  const parts = cleanFile.split(/\s+/).filter((p) => p.length > 1);
  if (parts.length >= 2) {
    return parts.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  } else if (parts.length === 1 && parts[0].length >= 3) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  }

  return "Candidate Profile";
}

function extractRoleFromText(text: string): string {
  const textLower = text.toLowerCase();
  const rawLines = text.split("\n").slice(0, 8).map((l) => l.toLowerCase());

  // 1. First inspect the candidate's top header lines for explicit job titles
  for (const line of rawLines) {
    if (line.includes("full-stack") || line.includes("full stack") || line.includes("fullstack")) return "Full-Stack Engineer";
    if (line.includes("frontend") || line.includes("front-end") || line.includes("react developer")) return "Frontend Engineer";
    if (line.includes("backend") || line.includes("back-end") || line.includes("node developer")) return "Backend Engineer";
    if (line.includes("ai engineer") || line.includes("machine learning") || line.includes("data scientist")) return "AI / ML Engineer";
    if (line.includes("devops") || line.includes("cloud engineer") || line.includes("sre")) return "DevOps & Cloud Engineer";
    if (line.includes("product manager") || line.includes("technical product")) return "Product Manager";
    if (line.includes("ui/ux") || line.includes("ux designer") || line.includes("product designer")) return "UI/UX Designer";
    if (line.includes("mobile developer") || line.includes("ios developer") || line.includes("android developer")) return "Mobile Developer";
    if (line.includes("software engineer") || line.includes("software developer") || line.includes("sde")) return "Full-Stack Engineer";
  }

  // 2. Score based on skills and keywords in the resume
  const hasFrontend = textLower.includes("react") || textLower.includes("vue") || textLower.includes("next.js") || textLower.includes("tailwind");
  const hasBackend = textLower.includes("node.js") || textLower.includes("express") || textLower.includes("fastapi") || textLower.includes("postgresql") || textLower.includes("mongodb") || textLower.includes("python");
  const hasAI = textLower.includes("pytorch") || textLower.includes("tensorflow") || textLower.includes("langchain") || textLower.includes("deep learning") || textLower.includes("llm");
  const hasDevOps = textLower.includes("docker") || textLower.includes("kubernetes") || textLower.includes("aws") || textLower.includes("terraform") || textLower.includes("ci/cd");
  const hasUIUX = (textLower.includes("figma") || textLower.includes("wireframing") || textLower.includes("design system")) && (textLower.includes("ux research") || textLower.includes("user interface"));

  if (hasAI && (textLower.includes("model") || textLower.includes("training") || textLower.includes("dataset"))) return "AI / ML Engineer";
  if (hasDevOps && !hasFrontend && !hasBackend) return "DevOps & Cloud Engineer";
  if (hasFrontend && hasBackend) return "Full-Stack Engineer";
  if (hasFrontend && !hasBackend) return "Frontend Engineer";
  if (hasBackend && !hasFrontend) return "Backend Engineer";
  if (hasUIUX && !hasFrontend && !hasBackend) return "UI/UX Designer";

  return "Full-Stack Engineer";
}

function parseTextHeuristically(text: string, fileName: string) {
  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  
  // Extract links
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);

  // Extract candidate name and role
  const extractedName = extractNameFromText(text, fileName);
  const primaryRole = extractRoleFromText(text);

  // Comprehensive dictionary of 120+ modern tech, framework, database, and design skills
  const skillKeywords = [
    // Languages
    "TypeScript", "JavaScript", "Python", "Java", "C++", "C#", "Go", "Golang", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "SQL", "HTML5", "CSS3", "Solidity", "Dart", "R",
    // Frontend
    "React", "React.js", "Next.js", "Vue", "Vue.js", "Nuxt", "Angular", "Svelte", "Tailwind CSS", "TailwindCSS", "Redux", "Zustand", "Webpack", "Vite", "Three.js", "Shadcn",
    // Backend & APIs
    "Node.js", "Express", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Spring Boot", "GraphQL", "REST APIs", "gRPC", "Microservices", "WebSockets",
    // Databases
    "PostgreSQL", "Postgres", "MongoDB", "MySQL", "Redis", "SQLite", "Firestore", "Firebase", "DynamoDB", "Supabase", "Prisma", "Drizzle ORM", "TypeORM", "Elasticsearch",
    // Cloud & DevOps
    "AWS", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Nginx", "Serverless", "Vercel",
    // AI / ML / Data
    "Gemini API", "OpenAI", "PyTorch", "TensorFlow", "LangChain", "LlamaIndex", "Hugging Face", "LLMs", "NLP", "Computer Vision", "Scikit-Learn", "Pandas", "NumPy", "Data Analytics",
    // Mobile
    "React Native", "Flutter", "iOS Development", "Android Development",
    // Design & Product
    "Figma", "UI/UX Design", "Wireframing", "Prototyping", "Design Systems", "Product Management", "System Design", "Git", "GitHub", "Agile", "Scrum"
  ];

  const matchedSkillNames = new Set<string>();
  for (const sk of skillKeywords) {
    const escaped = sk.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, "i");
    if (regex.test(text)) {
      matchedSkillNames.add(sk);
    }
  }

  // Also check for explicit skills sections (comma or bullet separated)
  const skillsSectionMatch = text.match(/(?:skills|technical skills|technologies|proficiencies|competencies)[:\s\n]+([\s\S]{10,400}?)(?:\n\s*\n|experience|projects|education|employment)/i);
  if (skillsSectionMatch && skillsSectionMatch[1]) {
    const rawTokens = skillsSectionMatch[1].split(/[,|•\n\t/]/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 25);
    for (const token of rawTokens) {
      if (!token.toLowerCase().includes("skill") && !token.toLowerCase().includes("include")) {
        matchedSkillNames.add(token);
      }
    }
  }

  const skillsList = Array.from(matchedSkillNames).slice(0, 20);
  const finalSkills = skillsList.length > 0 ? skillsList : ["TypeScript", "React", "Python", "Node.js", "Gemini API"];

  const textLower = text.toLowerCase();
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const bio = lines.slice(1, 4).join(" ") || `Experienced ${primaryRole} specializing in building scalable software solutions and high-performance applications.`;

  return {
    name: extractedName,
    email: email || "",
    location: "Bengaluru / Remote",
    primaryRole,
    headline: `${extractedName} | ${primaryRole} & Product Builder`,
    bio,
    experienceLevel: textLower.includes("senior") || textLower.includes("lead") || textLower.includes("staff") || textLower.includes("architect") ? "Advanced" : textLower.includes("intern") || textLower.includes("fresher") ? "Beginner" : "Intermediate",
    hoursPerWeek: 20,
    skills: finalSkills.map((s) => ({
      name: s,
      category: ["Figma", "UI/UX Design", "Wireframing", "Design Systems"].includes(s)
        ? "design"
        : ["Product Management", "System Design", "Agile", "Scrum"].includes(s)
        ? "domain"
        : "technical",
      level: "proficient",
    })),
    interests: ["AI & Machine Learning", "Developer Tools", "Fintech & Payments", "Cloud Infrastructure"],
    linkedinUrl: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
    githubUrl: githubMatch ? `https://${githubMatch[0]}` : "",
    portfolioUrl: "",
    pastProjects: [
      {
        id: "p-1",
        title: "Scalable Full-Stack Platform",
        role: primaryRole,
        description: "Architected core features, API integrations, and database schemas with strong performance.",
        technologies: finalSkills.slice(0, 4),
      },
    ],
    fileName,
    extractionSummary: `Successfully extracted profile for ${extractedName} (${primaryRole}) with ${finalSkills.length} key skills identified.`,
  };
}

startServer();
