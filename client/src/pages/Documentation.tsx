import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, BookOpen, Database, Code, Zap, Users, FileText, Layers } from "lucide-react";

export default function Documentation() {
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "0222") {
      setIsUnlocked(true);
      setError("");
    } else {
      setError("Invalid PIN. Access denied.");
      setPin("");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-yellow-500/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-yellow-500">Protected Documentation</CardTitle>
            <CardDescription className="text-gray-400">
              Enter 4-digit PIN to access system documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter PIN"
                  className="text-center text-2xl tracking-widest bg-gray-800 border-yellow-500/30 text-yellow-500"
                  autoFocus
                />
              </div>
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Unlock Documentation
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-yellow-500">
      {/* Header */}
      <div className="bg-gray-900 border-b border-yellow-500/20 py-6">
        <div className="container">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">📚 Beginner's Guide to the Job Portal</h1>
          <p className="text-gray-400">Understanding how everything works - explained simply!</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 space-y-8">
        
        {/* What is This Website? */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <BookOpen className="w-6 h-6" />
              🎯 What is This Website?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4 text-lg">
            <p className="leading-relaxed">
              <strong className="text-yellow-400">Think of this website like a smart assistant for finding jobs!</strong>
            </p>
            <p className="leading-relaxed">
              Imagine you have a magic notebook that:
            </p>
            <div className="bg-gray-800 p-6 rounded-lg space-y-3 border border-yellow-500/10">
              <p>✅ <strong>Reads your resume</strong> and remembers everything about you</p>
              <p>✅ <strong>Finds jobs</strong> that match your skills</p>
              <p>✅ <strong>Writes cover letters</strong> for you automatically</p>
              <p>✅ <strong>Keeps track</strong> of all the jobs you applied to</p>
              <p>✅ <strong>Helps you organize</strong> your job search</p>
            </div>
            <p className="leading-relaxed">
              That's exactly what this website does! It's like having a personal job-hunting robot helper. 🤖
            </p>
          </CardContent>
        </Card>

        {/* How Does It Work? The Big Picture */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Layers className="w-6 h-6" />
              🏗️ How Does It Work? The Big Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6 text-lg">
            <p className="leading-relaxed">
              <strong className="text-yellow-400">Let's use a simple analogy:</strong> Think of this website like a restaurant!
            </p>
            
            <div className="space-y-6">
              {/* Frontend */}
              <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">🎨 The Dining Room (Frontend)</h4>
                <p className="mb-3">This is what you see and interact with - the pretty part!</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong>Files:</strong> <code className="text-green-400">client/src/pages/*.tsx</code></p>
                  <p><strong>What it does:</strong> Shows buttons, forms, job listings - everything you click and see</p>
                  <p><strong>Like in a restaurant:</strong> The menu, tables, decorations, and waiters</p>
                  <p><strong>Technology:</strong> React (makes the website interactive and fast)</p>
                </div>
              </div>

              {/* Backend */}
              <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-xl font-bold text-blue-400 mb-3">⚙️ The Kitchen (Backend)</h4>
                <p className="mb-3">This is where the real work happens - you don't see it, but it's important!</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong>Files:</strong> <code className="text-green-400">server/*.ts</code></p>
                  <p><strong>What it does:</strong> Processes your requests, talks to the database, runs AI</p>
                  <p><strong>Like in a restaurant:</strong> The chefs cooking your food</p>
                  <p><strong>Technology:</strong> Express + tRPC (handles requests safely)</p>
                </div>
              </div>

              {/* Database */}
              <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-bold text-purple-400 mb-3">📦 The Storage Room (Database)</h4>
                <p className="mb-3">This is where all your information is saved!</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong>Files:</strong> <code className="text-green-400">drizzle/schema.ts</code></p>
                  <p><strong>What it does:</strong> Remembers your resumes, applications, jobs, documents</p>
                  <p><strong>Like in a restaurant:</strong> The refrigerator and pantry storing ingredients</p>
                  <p><strong>Technology:</strong> MySQL (a type of database)</p>
                </div>
              </div>

              {/* AI */}
              <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-pink-500">
                <h4 className="text-xl font-bold text-pink-400 mb-3">🧠 The Smart Chef (AI)</h4>
                <p className="mb-3">This is the magic part that writes documents for you!</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong>Files:</strong> <code className="text-green-400">server/_core/llm.ts</code></p>
                  <p><strong>What it does:</strong> Reads your resume and writes cover letters, finds matching jobs</p>
                  <p><strong>Like in a restaurant:</strong> A master chef who can create new recipes</p>
                  <p><strong>Technology:</strong> OpenAI (artificial intelligence)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step by Step: What Happens When You Upload a Resume */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <FileText className="w-6 h-6" />
              📤 Step by Step: What Happens When You Upload a Resume
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4 text-lg">
            <p className="leading-relaxed">
              <strong className="text-yellow-400">Let's follow your resume on its journey through the system:</strong>
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">You Click "Upload Resume"</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">client/src/pages/MyResumes.tsx</code></p>
                    <p className="text-base">The website shows you a button. When you click it and choose a file, the frontend (dining room) prepares to send it to the backend (kitchen).</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">File Goes to the Server</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">server/uploadHandler.ts</code></p>
                    <p className="text-base">Your resume file travels through the internet to our server. Think of it like mailing a letter - it goes from your computer to our computer.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">File Saved to Cloud Storage (S3)</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">server/storage.ts</code></p>
                    <p className="text-base">We don't keep your file on our computer - we send it to Amazon's cloud storage (like Dropbox or Google Drive). This way it's safe and you can access it anytime.</p>
                    <div className="bg-gray-900 p-3 rounded mt-2 text-sm">
                      <p className="text-gray-400">💡 <strong>Why cloud storage?</strong> Imagine if you kept all your photos on your phone - it would run out of space! Cloud storage is like having unlimited photo albums in the sky. ☁️</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">4️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">AI Reads Your Resume</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">server/resumeParser.ts</code></p>
                    <p className="text-base">Now the magic happens! Our AI (artificial intelligence) reads your resume like a human would. It finds:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-base ml-4">
                      <li>Your name and contact info</li>
                      <li>Your skills (like "Python programming" or "Customer service")</li>
                      <li>Your work experience and dates</li>
                      <li>Your education and degrees</li>
                      <li>Languages you speak</li>
                    </ul>
                    <div className="bg-gray-900 p-3 rounded mt-2 text-sm">
                      <p className="text-gray-400">💡 <strong>How does AI read?</strong> Imagine a really smart robot that went to school for reading. It can look at text and understand what it means, just like you can read a book and understand the story!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">5️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">Information Saved to Database</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">server/db.ts</code> → <code className="text-green-400">resumes table</code></p>
                    <p className="text-base">All the information the AI found gets organized and saved in our database. Think of it like filling out an index card with all your details, then putting it in a filing cabinet.</p>
                    <div className="bg-gray-900 p-3 rounded mt-2 text-sm font-mono text-xs text-green-400">
                      <p>Database Record Example:</p>
                      <p className="mt-1">id: 1</p>
                      <p>userId: 1 (your account)</p>
                      <p>fileName: "john_resume.pdf"</p>
                      <p>fileUrl: "https://s3.amazonaws.com/..."</p>
                      <p>extractedData: {`{name: "John", skills: ["Python", "React"]}`}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">6️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">AI Generates Documents (if you checked the box)</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> <code className="text-green-400">server/aiRouter.ts</code></p>
                    <p className="text-base">If you enabled auto-generation, the AI now writes three documents for you:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 text-base ml-4">
                      <li><strong>Professional Resume:</strong> A clean, formatted version</li>
                      <li><strong>Cover Letter:</strong> A general letter you can customize</li>
                      <li><strong>Recommendation Letter Template:</strong> For references to use</li>
                    </ul>
                    <div className="bg-gray-900 p-3 rounded mt-2 text-sm">
                      <p className="text-gray-400">💡 <strong>How does AI write?</strong> The AI has read millions of resumes and cover letters before. It's like having a friend who's written 1000 cover letters - they know exactly what to say!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">7️⃣</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 mb-2">You See Everything on Your Screen</h4>
                    <p className="text-base mb-2">📍 <strong>Where:</strong> Back to <code className="text-green-400">client/src/pages/MyResumes.tsx</code></p>
                    <p className="text-base">The frontend refreshes and shows you your uploaded resume and generated documents. All of this happens in just a few seconds!</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Understanding the Database */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Database className="w-6 h-6" />
              🗄️ Understanding the Database (Your Digital Filing Cabinet)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6 text-lg">
            <p className="leading-relaxed">
              <strong className="text-yellow-400">A database is like a super-organized filing cabinet.</strong> Each drawer holds different types of information.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-800 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">📁 Drawer 1: users (Who you are)</h4>
                <p className="mb-3">This drawer has a folder for each person who signs up.</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong className="text-yellow-400">What's inside:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>id:</strong> Your unique number (like a student ID)</li>
                    <li><strong>name:</strong> Your name</li>
                    <li><strong>email:</strong> Your email address</li>
                    <li><strong>role:</strong> Are you a regular user or admin?</li>
                  </ul>
                  <p className="mt-3 text-gray-400">💡 <strong>Why we need this:</strong> So the website knows who you are when you log in!</p>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">📁 Drawer 2: jobs (All available jobs)</h4>
                <p className="mb-3">This drawer has a folder for each job posting.</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong className="text-yellow-400">What's inside:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>jobId:</strong> A unique code like "JOB-001" (easy to search!)</li>
                    <li><strong>title:</strong> Job name (like "Software Engineer")</li>
                    <li><strong>company:</strong> Company name</li>
                    <li><strong>salary:</strong> How much it pays</li>
                    <li><strong>description:</strong> What the job is about</li>
                  </ul>
                  <p className="mt-3 text-gray-400">💡 <strong>Why we need this:</strong> So you can browse and search for jobs!</p>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">📁 Drawer 3: resumes (Your uploaded resumes)</h4>
                <p className="mb-3">This drawer keeps track of all resumes you've uploaded.</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong className="text-yellow-400">What's inside:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>userId:</strong> Links to YOUR user account</li>
                    <li><strong>fileName:</strong> What you named the file</li>
                    <li><strong>fileUrl:</strong> Where it's stored in the cloud</li>
                    <li><strong>extractedData:</strong> All the info AI found (skills, experience, etc.)</li>
                  </ul>
                  <p className="mt-3 text-gray-400">💡 <strong>Why we need this:</strong> So we can remember your resume and use it to generate documents!</p>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">📁 Drawer 4: applications (Jobs you applied to)</h4>
                <p className="mb-3">This drawer tracks which jobs you've applied for.</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong className="text-yellow-400">What's inside:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>userId:</strong> Links to YOUR account</li>
                    <li><strong>jobId:</strong> Links to the JOB you applied for</li>
                    <li><strong>resumeId:</strong> Which resume you used</li>
                    <li><strong>status:</strong> "pending", "accepted", or "rejected"</li>
                    <li><strong>appliedAt:</strong> When you applied</li>
                  </ul>
                  <p className="mt-3 text-gray-400">💡 <strong>Why we need this:</strong> So you can see your application history!</p>
                </div>
              </div>

              <div className="bg-gray-800 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">📁 Drawer 5: generatedDocuments (AI-written documents)</h4>
                <p className="mb-3">This drawer stores all the documents AI created for you.</p>
                <div className="bg-gray-900 p-4 rounded space-y-2 text-base">
                  <p><strong className="text-yellow-400">What's inside:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>userId:</strong> Links to YOUR account</li>
                    <li><strong>documentType:</strong> "resume", "cover-letter", or "recommendation"</li>
                    <li><strong>title:</strong> Name of the document</li>
                    <li><strong>content:</strong> The actual text (in markdown format)</li>
                  </ul>
                  <p className="mt-3 text-gray-400">💡 <strong>Why we need this:</strong> So you can view, edit, and download your documents anytime!</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-lg">
              <h4 className="text-xl font-bold text-blue-400 mb-3">🔗 How the Drawers Connect</h4>
              <p className="mb-3">The drawers are connected by special numbers (IDs). It's like having a reference system:</p>
              <div className="bg-gray-900 p-4 rounded text-base space-y-2">
                <p>• Your <strong>user ID</strong> appears in resumes, applications, and documents</p>
                <p>• A <strong>job ID</strong> appears in applications (so we know which job you applied to)</p>
                <p>• A <strong>resume ID</strong> appears in applications and documents (so we know which resume you used)</p>
              </div>
              <p className="mt-3 text-gray-400">💡 <strong>Think of it like:</strong> Your student ID connects your library card, cafeteria account, and class schedule - they all know it's YOU!</p>
            </div>
          </CardContent>
        </Card>

        {/* How the Code Connects */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Code className="w-6 h-6" />
              🔌 How All the Code Connects Together
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6 text-lg">
            <p className="leading-relaxed">
              <strong className="text-yellow-400">Let's understand how the different parts talk to each other:</strong>
            </p>

            <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500">
              <h4 className="text-xl font-bold text-green-400 mb-3">1️⃣ Frontend → Backend (Making Requests)</h4>
              <p className="mb-3">When you click a button on the website, the frontend needs to ask the backend to do something.</p>
              <div className="bg-gray-900 p-4 rounded space-y-3 text-base">
                <p><strong className="text-yellow-400">Example: Getting all jobs</strong></p>
                <div className="bg-black p-3 rounded font-mono text-xs text-green-400">
                  <p>// In the frontend (client/src/pages/Home.tsx)</p>
                  <p className="mt-1">const {`{ data: jobs } = trpc.jobs.list.useQuery();`}</p>
                  <p className="mt-3 text-gray-400">// This line says: "Hey backend, please give me the list of jobs!"</p>
                </div>
                <p className="mt-3 text-gray-400">💡 <strong>What's tRPC?</strong> It's like a phone line between frontend and backend. Instead of shouting across the room, they can call each other!</p>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
              <h4 className="text-xl font-bold text-blue-400 mb-3">2️⃣ Backend Receives Request (Processing)</h4>
              <p className="mb-3">The backend receives the request and decides what to do.</p>
              <div className="bg-gray-900 p-4 rounded space-y-3 text-base">
                <p><strong className="text-yellow-400">Example: Backend handling the request</strong></p>
                <div className="bg-black p-3 rounded font-mono text-xs text-green-400">
                  <p>// In the backend (server/routers.ts)</p>
                  <p className="mt-1">jobs: router({`{`}</p>
                  <p className="ml-4">list: publicProcedure.query(async () =&gt; {`{`}</p>
                  <p className="ml-8">return await getJobs(); // Get jobs from database</p>
                  <p className="ml-4">{`}`}),</p>
                  <p>{`}`})</p>
                  <p className="mt-3 text-gray-400">// This says: "When someone asks for jobs, I'll get them from the database"</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-purple-500">
              <h4 className="text-xl font-bold text-purple-400 mb-3">3️⃣ Backend → Database (Getting Data)</h4>
              <p className="mb-3">The backend asks the database for information.</p>
              <div className="bg-gray-900 p-4 rounded space-y-3 text-base">
                <p><strong className="text-yellow-400">Example: Getting jobs from database</strong></p>
                <div className="bg-black p-3 rounded font-mono text-xs text-green-400">
                  <p>// In the database file (server/db.ts)</p>
                  <p className="mt-1">export async function getJobs() {`{`}</p>
                  <p className="ml-4">const db = await getDb();</p>
                  <p className="ml-4">return await db.select().from(jobs); // Get all jobs</p>
                  <p>{`}`}</p>
                  <p className="mt-3 text-gray-400">// This opens the "jobs" drawer and gets all the job folders</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
              <h4 className="text-xl font-bold text-yellow-400 mb-3">4️⃣ Database → Backend → Frontend (Sending Response)</h4>
              <p className="mb-3">The data travels back through the chain.</p>
              <div className="bg-gray-900 p-4 rounded space-y-3 text-base">
                <p>The journey back:</p>
                <div className="space-y-2 ml-4">
                  <p>1. Database sends jobs to Backend</p>
                  <p>2. Backend sends jobs to Frontend</p>
                  <p>3. Frontend displays jobs on your screen</p>
                </div>
                <p className="mt-3 text-gray-400">💡 <strong>It's like:</strong> You ask a librarian for a book → Librarian goes to shelf → Gets book → Brings it back to you!</p>
              </div>
            </div>

            <div className="bg-pink-900/20 border border-pink-500/30 p-6 rounded-lg">
              <h4 className="text-xl font-bold text-pink-400 mb-3">🧠 Special: When AI Gets Involved</h4>
              <p className="mb-3">For AI features (like generating documents), there's an extra step:</p>
              <div className="bg-gray-900 p-4 rounded space-y-3 text-base">
                <p><strong className="text-yellow-400">The AI Journey:</strong></p>
                <div className="space-y-2 ml-4">
                  <p>1. Frontend asks: "Generate a cover letter"</p>
                  <p>2. Backend gets your resume from database</p>
                  <p>3. Backend sends resume to AI (OpenAI)</p>
                  <p>4. AI reads it and writes a cover letter</p>
                  <p>5. Backend saves the cover letter to database</p>
                  <p>6. Backend sends it back to Frontend</p>
                  <p>7. You see your new cover letter!</p>
                </div>
                <div className="bg-black p-3 rounded font-mono text-xs text-green-400 mt-3">
                  <p>// In AI router (server/aiRouter.ts)</p>
                  <p className="mt-1">const response = await invokeLLM({`{`}</p>
                  <p className="ml-4">messages: [{`{ role: "user", content: "Write a cover letter..." }`}]</p>
                  <p>{`}`});</p>
                  <p className="mt-3 text-gray-400">// This sends your request to the AI brain!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Guide */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Users className="w-6 h-6" />
              👤 How to Use the Website (Step by Step)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4 text-lg">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-900/20 to-transparent border-l-4 border-green-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-green-400 mb-2">Step 1: Sign Up / Log In</h4>
                <p>Click the yellow "BERTIN" button (your name) to log in with Google or email.</p>
              </div>

              <div className="bg-gradient-to-r from-blue-900/20 to-transparent border-l-4 border-blue-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-blue-400 mb-2">Step 2: Upload Your Resume</h4>
                <p>Go to "My Resumes" → Click "Upload Resume" → Choose your PDF or Word file → Check "Auto-generate documents" if you want AI to create documents for you.</p>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-transparent border-l-4 border-purple-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-purple-400 mb-2">Step 3: Browse Jobs</h4>
                <p>Go back to home page → Scroll down to see all jobs → Use the search box to find specific jobs → Click "View Details" to see more about a job.</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-yellow-400 mb-2">Step 4: Find Matching Jobs (AI Magic!)</h4>
                <p>Go to "Job Matching" → Select a resume → Choose how many matches you want → Click "Find Matches" → AI will show you the best jobs for your skills!</p>
              </div>

              <div className="bg-gradient-to-r from-pink-900/20 to-transparent border-l-4 border-pink-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-pink-400 mb-2">Step 5: Apply for Jobs</h4>
                <p>On a job detail page → Click "Apply Now" → Choose which resume to use → Add notes if you want → Submit!</p>
              </div>

              <div className="bg-gradient-to-r from-red-900/20 to-transparent border-l-4 border-red-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-red-400 mb-2">Step 6: Check Your Documents</h4>
                <p>Go to "Documents" → See all AI-generated resumes, cover letters, and recommendations → Click "Edit" to customize them → Click "Save" when done.</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-900/20 to-transparent border-l-4 border-indigo-500 p-5 rounded-lg">
                <h4 className="text-xl font-bold text-indigo-400 mb-2">Step 7: Track Your Applications</h4>
                <p>Go to "Applications" → See all jobs you applied to → Check status (pending, accepted, rejected) → Keep track of your job hunt progress!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Technologies Explained */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Zap className="w-6 h-6" />
              ⚡ Technologies Used (What Makes It Work)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4 text-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">React</h4>
                <p className="text-base">Makes the website fast and interactive. When you click something, it updates instantly without reloading the whole page!</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">TypeScript</h4>
                <p className="text-base">A safer version of JavaScript. It catches mistakes before they become bugs - like spell-check for code!</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">tRPC</h4>
                <p className="text-base">The "phone line" between frontend and backend. Makes sure they understand each other perfectly!</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">MySQL</h4>
                <p className="text-base">The database system. Like a super-organized filing cabinet that can find any information in milliseconds!</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">AWS S3</h4>
                <p className="text-base">Cloud storage for your resume files. Like Dropbox, but for our website!</p>
              </div>
              
              <div className="bg-gray-800 p-5 rounded-lg border border-yellow-500/10">
                <h4 className="font-bold text-yellow-400 mb-2">OpenAI</h4>
                <p className="text-base">The AI brain that reads resumes and writes documents. It's like having a professional writer as your assistant!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Code Reference */}
        <Card className="bg-gray-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500 text-2xl">
              <Code className="w-6 h-6" />
              📂 Complete Folder Structure & Code Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-6 text-base">
            <p className="leading-relaxed text-lg">
              <strong className="text-yellow-400">Here's the complete project structure with all files and their code:</strong>
            </p>

            {/* Folder Tree */}
            <div className="bg-gray-800 p-5 rounded-lg">
              <h4 className="text-xl font-bold text-yellow-400 mb-3">🌳 Project Folder Tree</h4>
              <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto font-mono">
{`my-job-portal-v2-upgrade/
├── client/                    (Frontend - What you see)
│   ├── public/               (Static files: images, logos)
│   │   ├── divalaser-logo.png
│   │   └── profile-photo.jpg
│   ├── src/
│   │   ├── pages/           (All the pages you visit)
│   │   │   ├── Home.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   ├── MyResumes.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── MyApplications.tsx
│   │   │   ├── MatchedJobs.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Documentation.tsx
│   │   ├── components/      (Reusable UI pieces)
│   │   │   └── ui/         (Buttons, cards, forms)
│   │   ├── lib/            (Helper functions)
│   │   │   └── trpc.ts    (Connects to backend)
│   │   ├── App.tsx         (Main app & routes)
│   │   ├── index.css       (Styles & colors)
│   │   └── main.tsx        (App entry point)
│   └── index.html           (HTML template)
│
├── server/                    (Backend - The brain)
│   ├── _core/                (Framework code)
│   │   ├── llm.ts           (AI integration)
│   │   ├── oauth.ts         (Login system)
│   │   ├── trpc.ts          (API setup)
│   │   └── index.ts         (Server startup)
│   ├── routers.ts            (API endpoints)
│   ├── aiRouter.ts           (AI features)
│   ├── db.ts                 (Database queries)
│   ├── storage.ts            (File storage)
│   ├── uploadHandler.ts      (File uploads)
│   ├── resumeParser.ts       (Resume reading)
│   └── *.test.ts             (Tests)
│
├── drizzle/                   (Database)
│   ├── schema.ts             (Table definitions)
│   └── *.sql                 (Database migrations)
│
├── shared/                    (Code used by both)
│   ├── const.ts              (Constants)
│   └── types.ts              (Type definitions)
│
└── Configuration files
    ├── package.json          (Dependencies list)
    ├── tsconfig.json         (TypeScript settings)
    └── vite.config.ts        (Build settings)`}
              </pre>
            </div>

            {/* Key Files with Code */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-yellow-400">📝 Key Files & Their Code</h3>

              {/* Database Schema */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-purple-500">
                <h4 className="text-xl font-bold text-purple-400 mb-3">1. Database Schema (drizzle/schema.ts)</h4>
                <p className="mb-3 text-gray-300">This file defines all the "drawers" (tables) in our database.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// drizzle/schema.ts - Database Tables

// Users table - Who you are
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Jobs table - All job postings
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobId: varchar("jobId", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  salary: varchar("salary", { length: 100 }),
  type: varchar("type", { length: 50 }),
  description: text("description"),
  requirements: text("requirements"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Resumes table - Your uploaded resumes
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  extractedData: json("extractedData"), // AI extracted info
  uploadedAt: timestamp("uploadedAt").defaultNow(),
});

// Applications table - Jobs you applied to
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobId: int("jobId").notNull(),
  resumeId: int("resumeId"),
  status: varchar("status", { length: 50 }).default("pending"),
  notes: text("notes"),
  appliedAt: timestamp("appliedAt").defaultNow(),
});

// Generated Documents table - AI-created documents
export const generatedDocuments = mysqlTable("generatedDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resumeId: int("resumeId"),
  documentType: varchar("documentType", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});`}
                </pre>
              </div>

              {/* Backend Router */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-blue-500">
                <h4 className="text-xl font-bold text-blue-400 mb-3">2. Backend Router (server/routers.ts)</h4>
                <p className="mb-3 text-gray-300">This file handles all requests from the frontend.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// server/routers.ts - API Endpoints

export const appRouter = router({
  // Authentication
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME);
      return { success: true };
    }),
  }),

  // Jobs
  jobs: router({
    // Get all jobs
    list: publicProcedure.query(async () => {
      return await getJobs();
    }),
    
    // Get one job by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getJobById(input.id);
      }),
    
    // Search jobs
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await searchJobs(input.query);
      }),
  }),

  // Resumes
  resumes: router({
    // Get user's resumes
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserResumes(ctx.user.id);
    }),
    
    // Create resume record
    create: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Save to database
        const resumeId = await createResume({
          userId: ctx.user.id,
          ...input,
        });
        
        // Parse resume with AI
        const extracted = await parseResume(input.fileUrl);
        await updateResumeExtractedData(resumeId, extracted);
        
        return { success: true, resumeId };
      }),
  }),

  // Applications
  applications: router({
    // Get user's applications
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserApplications(ctx.user.id);
    }),
    
    // Apply for a job
    create: protectedProcedure
      .input(z.object({
        jobId: z.number(),
        resumeId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createApplication({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),
});`}
                </pre>
              </div>

              {/* AI Router */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-pink-500">
                <h4 className="text-xl font-bold text-pink-400 mb-3">3. AI Router (server/aiRouter.ts)</h4>
                <p className="mb-3 text-gray-300">This file handles all AI-powered features.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// server/aiRouter.ts - AI Features

export const aiRouter = router({
  // Generate resume from uploaded file
  generateResume: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get resume data
      const resume = await getResumeById(input.resumeId);
      const data = resume.extractedData;
      
      // Ask AI to write a professional resume
      const response = await invokeLLM({
        messages: [{
          role: "user",
          content: \`Create a professional resume for:
            Name: \${data.name}
            Skills: \${data.skills.join(", ")}
            Experience: \${JSON.stringify(data.experience)}
            Education: \${JSON.stringify(data.education)}\`
        }]
      });
      
      // Save generated document
      await createGeneratedDocument({
        userId: ctx.user.id,
        resumeId: input.resumeId,
        documentType: "resume",
        title: "Professional Resume",
        content: response.choices[0].message.content,
      });
      
      return { success: true };
    }),

  // Generate cover letter
  generateCoverLetter: protectedProcedure
    .input(z.object({ 
      resumeId: z.number(),
      jobId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const resume = await getResumeById(input.resumeId);
      const job = input.jobId ? await getJobById(input.jobId) : null;
      
      const response = await invokeLLM({
        messages: [{
          role: "user",
          content: \`Write a cover letter for \${resume.extractedData.name}
            applying to \${job?.title || "a position"}\`
        }]
      });
      
      await createGeneratedDocument({
        userId: ctx.user.id,
        documentType: "cover-letter",
        title: "Cover Letter",
        content: response.choices[0].message.content,
      });
      
      return { success: true };
    }),

  // Find matching jobs
  findMatchingJobs: protectedProcedure
    .input(z.object({
      resumeId: z.number(),
      limit: z.number().min(3).max(20),
    }))
    .mutation(async ({ input }) => {
      const resume = await getResumeById(input.resumeId);
      const allJobs = await getJobs();
      
      // Ask AI to match jobs
      const response = await invokeLLM({
        messages: [{
          role: "user",
          content: \`Given this resume: \${JSON.stringify(resume.extractedData)}
            and these jobs: \${JSON.stringify(allJobs)}
            Return the top \${input.limit} matching jobs with scores.\`
        }],
        response_format: { type: "json_object" }
      });
      
      return JSON.parse(response.choices[0].message.content);
    }),
});`}
                </pre>
              </div>

              {/* Frontend Page */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-green-500">
                <h4 className="text-xl font-bold text-green-400 mb-3">4. Frontend Page (client/src/pages/Home.tsx)</h4>
                <p className="mb-3 text-gray-300">This file shows the homepage you see.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// client/src/pages/Home.tsx - Homepage

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  // Get jobs from backend
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const searchMutation = trpc.jobs.search.useMutation();
  
  const handleSearch = () => {
    searchMutation.mutate({ query: searchQuery });
  };
  
  return (
    <div className="min-h-screen bg-black text-yellow-500">
      {/* Header with logo */}
      <header className="bg-gray-900 p-6">
        <img src="/divalaser-logo.png" alt="Logo" />
        <h1>DIVALASER Software Solution</h1>
      </header>
      
      {/* Search bar */}
      <div className="container py-8">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs..."
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      {/* Job listings */}
      <div className="container grid gap-4">
        {isLoading ? (
          <p>Loading jobs...</p>
        ) : (
          jobs?.map(job => (
            <Card key={job.id}>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p>ID: {job.jobId}</p>
              <Button>View Details</Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}`}
                </pre>
              </div>

              {/* tRPC Connection */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-yellow-500">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">5. Frontend-Backend Connection (client/src/lib/trpc.ts)</h4>
                <p className="mb-3 text-gray-300">This tiny file connects frontend to backend.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// client/src/lib/trpc.ts - The Phone Line

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

// Create the "phone" that frontend uses to call backend
export const trpc = createTRPCReact<AppRouter>();

// Usage in any page:
// const { data } = trpc.jobs.list.useQuery();
// This calls the backend's jobs.list endpoint!`}
                </pre>
              </div>

              {/* Resume Parser */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-indigo-500">
                <h4 className="text-xl font-bold text-indigo-400 mb-3">6. Resume Parser (server/resumeParser.ts)</h4>
                <p className="mb-3 text-gray-300">This file reads PDF/DOCX resumes using AI.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// server/resumeParser.ts - Resume Reading

import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { invokeLLM } from "./_core/llm";

export async function parseResume(fileUrl: string) {
  // Download file from S3
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  
  // Extract text based on file type
  let text = "";
  if (fileUrl.endsWith(".pdf")) {
    const pdf = await pdfParse(Buffer.from(buffer));
    text = pdf.text;
  } else if (fileUrl.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  }
  
  // Ask AI to extract structured data
  const response = await invokeLLM({
    messages: [{
      role: "user",
      content: \`Extract structured data from this resume:
        \${text}
        
        Return JSON with: name, email, phone, skills (array),
        experience (array of {title, company, dates}),
        education (array of {degree, school, year})\`
    }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "resume_data",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            experience: { type: "array" },
            education: { type: "array" },
          }
        }
      }
    }
  });
  
  return JSON.parse(response.choices[0].message.content);
}`}
                </pre>
              </div>

              {/* File Upload */}
              <div className="bg-gray-800 p-5 rounded-lg border-l-4 border-red-500">
                <h4 className="text-xl font-bold text-red-400 mb-3">7. File Upload Handler (server/uploadHandler.ts)</h4>
                <p className="mb-3 text-gray-300">This file handles resume file uploads to S3.</p>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-x-auto">
{`// server/uploadHandler.ts - File Uploads

import multer from "multer";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

export function setupUploadRoute(app: Express) {
  app.post("/api/upload/resume", upload.single("file"), async (req, res) => {
    try {
      // Get uploaded file
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Generate unique filename
      const fileKey = \`resumes/\${nanoid()}-\${file.originalname}\`;
      
      // Upload to S3
      const { url } = await storagePut(
        fileKey,
        file.buffer,
        file.mimetype
      );
      
      // Return file info
      res.json({
        success: true,
        fileName: file.originalname,
        fileUrl: url,
        fileKey: fileKey,
      });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  });
}`}
                </pre>
              </div>
            </div>

            {/* How Files Import Each Other */}
            <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg mt-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">🔗 How Files Connect (Import Chain)</h3>
              <div className="space-y-4 text-base">
                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-bold text-yellow-400 mb-2">Frontend → Backend Connection:</p>
                  <pre className="text-green-400 text-xs">
{`Home.tsx
  ↓ imports
lib/trpc.ts (creates connection)
  ↓ uses type from
server/routers.ts (backend API)
  ↓ calls functions from
server/db.ts (database queries)
  ↓ queries
drizzle/schema.ts (table definitions)`}
                  </pre>
                </div>

                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-bold text-yellow-400 mb-2">AI Features Chain:</p>
                  <pre className="text-green-400 text-xs">
{`Documents.tsx (user clicks "Generate")
  ↓ calls
trpc.ai.generateResume.useMutation()
  ↓ goes to
server/aiRouter.ts
  ↓ uses
server/_core/llm.ts (AI connection)
  ↓ calls
OpenAI API (external service)
  ↓ returns to
server/aiRouter.ts
  ↓ saves via
server/db.ts
  ↓ updates
Database`}
                  </pre>
                </div>

                <div className="bg-gray-900 p-4 rounded">
                  <p className="font-bold text-yellow-400 mb-2">File Upload Chain:</p>
                  <pre className="text-green-400 text-xs">
{`MyResumes.tsx (user selects file)
  ↓ sends file to
server/uploadHandler.ts
  ↓ uploads via
server/storage.ts
  ↓ stores in
AWS S3 (cloud)
  ↓ returns URL to
server/uploadHandler.ts
  ↓ parses with
server/resumeParser.ts
  ↓ extracts data using
server/_core/llm.ts
  ↓ saves to database via
server/db.ts`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p className="text-lg">🎉 Congratulations! You now understand how the Job Portal works!</p>
          <p className="mt-4">Divalaser Software Solution © 2026 | Beginner-Friendly Documentation v3.0</p>
        </div>
      </div>
    </div>
  );
}
