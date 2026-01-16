import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sampleJobs = [
  {
    jobId: 'JOB-001',
    title: 'Senior Software Engineer',
    company: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    salary: '$120,000 - $180,000',
    description: 'We are seeking an experienced Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications.',
    requirements: '- 5+ years of experience in software development\n- Proficiency in JavaScript, TypeScript, React, and Node.js\n- Experience with cloud platforms (AWS, Azure, or GCP)\n- Strong problem-solving skills',
    benefits: '- Competitive salary and equity\n- Health, dental, and vision insurance\n- 401(k) matching\n- Flexible work hours\n- Remote work options',
    status: 'active',
    postedBy: 1
  },
  {
    jobId: 'JOB-002',
    title: 'Product Manager',
    company: 'Digital Solutions Corp',
    location: 'New York, NY',
    jobType: 'full-time',
    salary: '$100,000 - $150,000',
    description: 'Join our product team to drive the vision and strategy for our flagship products. You will work closely with engineering, design, and marketing teams.',
    requirements: '- 3+ years of product management experience\n- Strong analytical and communication skills\n- Experience with Agile methodologies\n- Technical background preferred',
    benefits: '- Competitive compensation\n- Comprehensive benefits package\n- Professional development opportunities\n- Modern office in downtown Manhattan',
    status: 'active',
    postedBy: 1
  },
  {
    jobId: 'JOB-003',
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    location: 'Remote',
    jobType: 'remote',
    salary: '$80,000 - $120,000',
    description: 'We are looking for a talented UX/UI Designer to create beautiful and intuitive user experiences for our clients.',
    requirements: '- 3+ years of UX/UI design experience\n- Proficiency in Figma, Sketch, or Adobe XD\n- Strong portfolio demonstrating design thinking\n- Experience with user research and testing',
    benefits: '- Fully remote position\n- Flexible schedule\n- Health insurance\n- Annual design conference budget',
    status: 'active',
    postedBy: 1
  },
  {
    jobId: 'JOB-004',
    title: 'Data Analyst Intern',
    company: 'Analytics Pro',
    location: 'Boston, MA',
    jobType: 'internship',
    salary: '$25/hour',
    description: 'Summer internship opportunity for aspiring data analysts. Gain hands-on experience with real-world data projects.',
    requirements: '- Currently pursuing degree in Data Science, Statistics, or related field\n- Knowledge of SQL and Python\n- Strong analytical mindset\n- Excellent communication skills',
    benefits: '- Mentorship from senior analysts\n- Networking opportunities\n- Potential for full-time conversion\n- Stipend for housing',
    status: 'active',
    postedBy: 1
  },
  {
    jobId: 'JOB-005',
    title: 'Marketing Specialist',
    company: 'Growth Marketing Agency',
    location: 'Austin, TX',
    jobType: 'contract',
    salary: '$60,000 - $80,000',
    description: '6-month contract position for a Marketing Specialist to support our client acquisition campaigns.',
    requirements: '- 2+ years of digital marketing experience\n- Experience with SEO, SEM, and social media marketing\n- Proficiency in Google Analytics and marketing automation tools\n- Creative and data-driven mindset',
    benefits: '- Competitive hourly rate\n- Flexible work arrangement\n- Opportunity for extension\n- Collaborative team environment',
    status: 'active',
    postedBy: 1
  }
];

async function seedJobs() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    console.log('Seeding jobs...');
    
    for (const job of sampleJobs) {
      await connection.execute(
        `INSERT INTO jobs (jobId, title, company, location, jobType, salary, description, requirements, benefits, status, postedBy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [job.jobId, job.title, job.company, job.location, job.jobType, job.salary, job.description, job.requirements, job.benefits, job.status, job.postedBy]
      );
      console.log(`✓ Added job: ${job.title}`);
    }
    
    console.log('\nSuccessfully seeded all jobs!');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  } finally {
    await connection.end();
  }
}

seedJobs();
