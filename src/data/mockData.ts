import { UserProfile, Project, Application, ProjectInvitation } from '../types';
import { computeMatchScore } from '../utils/matchingEngine';

export const INITIAL_CURRENT_USER: UserProfile = {
  id: 'user-me',
  name: 'Aarav Mehta',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  headline: 'Full-Stack Developer & AI Systems Tinkerer',
  bio: 'Building delightful, human-centered products. Love working at the intersection of TypeScript, Gemini LLMs, and real-time state machines.',
  email: 'aarav.mehta@example.com',
  location: 'Bengaluru / Remote',
  availability: 'available',
  hoursPerWeek: 20,
  experienceLevel: 'Intermediate',
  primaryRole: 'Full-Stack Engineer',
  linkedinUrl: 'https://linkedin.com/in/aarav-mehta-demo',
  isLinkedinVerified: true,
  githubUrl: 'https://github.com/aaravmehta',
  portfolioUrl: 'https://aarav.dev',
  joinedDate: 'Joined March 2026',
  resumeParsed: true,
  resumeFileName: 'Aarav_Mehta_Resume_2026.pdf',
  skills: [
    { name: 'TypeScript', category: 'technical', level: 'expert' },
    { name: 'React', category: 'technical', level: 'expert' },
    { name: 'Node.js', category: 'technical', level: 'proficient' },
    { name: 'Python', category: 'technical', level: 'proficient' },
    { name: 'Gemini API', category: 'technical', level: 'expert' },
    { name: 'Tailwind CSS', category: 'design', level: 'expert' },
    { name: 'Figma', category: 'design', level: 'proficient' },
    { name: 'PostgreSQL', category: 'technical', level: 'proficient' },
    { name: 'AI & Machine Learning', category: 'domain', level: 'proficient' },
    { name: 'Rapid Prototyping', category: 'soft', level: 'expert' },
    { name: 'Team Collaboration', category: 'soft', level: 'expert' },
  ],
  interests: ['AI & Machine Learning', 'Developer Tools', 'Healthcare & Biotech', 'Climate & CleanTech'],
  pastProjects: [
    {
      id: 'proj-p1',
      title: 'PromptFlow Studio',
      role: 'Lead Developer',
      description: 'Interactive visual workflow builder for multi-agent LLM chains with latency heatmaps.',
      technologies: ['React', 'TypeScript', 'Node.js', 'WebSockets'],
      link: 'https://github.com/example/promptflow'
    },
    {
      id: 'proj-p2',
      title: 'PulseClean Energy Tracker',
      role: 'Full-Stack Contributor',
      description: 'Smart meter analytics dashboard predicting localized renewable output for residential microgrids.',
      technologies: ['Python', 'FastAPI', 'Tailwind', 'PostgreSQL'],
    }
  ]
};

export const SEED_CANDIDATES: UserProfile[] = [
  INITIAL_CURRENT_USER,
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    headline: 'Senior UI/UX Designer & Design Systems Lead',
    bio: 'Obsessed with micro-interactions, clean typographic hierarchy, and transforming complex data into intuitive consumer interfaces.',
    email: 'priya.s@example.com',
    location: 'Mumbai / Remote',
    availability: 'available',
    hoursPerWeek: 15,
    experienceLevel: 'Advanced',
    primaryRole: 'UI/UX Designer',
    linkedinUrl: 'https://linkedin.com/in/priyasharma-ux',
    isLinkedinVerified: true,
    githubUrl: 'https://github.com/priyadesign',
    portfolioUrl: 'https://priyaux.design',
    joinedDate: 'Joined January 2026',
    resumeParsed: true,
    resumeFileName: 'Priya_Sharma_ProductDesign.pdf',
    skills: [
      { name: 'Figma', category: 'design', level: 'expert' },
      { name: 'Design Systems', category: 'design', level: 'expert' },
      { name: 'User Research', category: 'design', level: 'expert' },
      { name: 'Wireframing', category: 'design', level: 'expert' },
      { name: 'Tailwind CSS', category: 'design', level: 'proficient' },
      { name: 'Prototyping', category: 'design', level: 'expert' },
      { name: 'Accessibility', category: 'soft', level: 'expert' },
      { name: 'Design Thinking', category: 'soft', level: 'expert' },
    ],
    interests: ['Healthcare & Biotech', 'Developer Tools', 'Education & EdTech'],
    pastProjects: [
      {
        id: 'p-ux1',
        title: 'HealSync Patient Portal',
        role: 'Lead Product Designer',
        description: 'Redesigned the outpatient scheduling experience, reducing friction drop-off by 42%.',
        technologies: ['Figma', 'Design Systems', 'Usability Testing'],
      }
    ]
  },
  {
    id: 'user-dev',
    name: 'Devanagari "Dev" Raman',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    headline: 'Machine Learning Researcher & PyTorch Specialist',
    bio: 'MS in Computational Linguistics. Focus on low-latency audio LLMs, multimodal embedding models, and edge quantization.',
    email: 'dev.raman@example.com',
    location: 'Hyderabad / Hybrid',
    availability: 'open_to_explore',
    hoursPerWeek: 10,
    experienceLevel: 'Advanced',
    primaryRole: 'AI / ML Engineer',
    linkedinUrl: 'https://linkedin.com/in/devraman-ai',
    isLinkedinVerified: true,
    githubUrl: 'https://github.com/devraman',
    joinedDate: 'Joined February 2026',
    resumeParsed: true,
    skills: [
      { name: 'Python', category: 'technical', level: 'expert' },
      { name: 'PyTorch', category: 'technical', level: 'expert' },
      { name: 'Gemini API', category: 'technical', level: 'expert' },
      { name: 'FastAPI', category: 'technical', level: 'proficient' },
      { name: 'Audio Processing', category: 'domain', level: 'expert' },
      { name: 'Transformers', category: 'technical', level: 'expert' },
      { name: 'Docker', category: 'technical', level: 'proficient' },
    ],
    interests: ['AI & Machine Learning', 'Healthcare & Biotech', 'Robotics & IoT'],
    pastProjects: [
      {
        id: 'p-ai1',
        title: 'WhisperLite Edge',
        role: 'Research Contributor',
        description: 'Quantized speech recognition engine running 4x faster on local mobile chips.',
        technologies: ['PyTorch', 'C++', 'ONNX'],
      }
    ]
  },
  {
    id: 'user-sara',
    name: 'Sara Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    headline: 'Product Strategist & Growth Architect',
    bio: 'Ex-startup operator. I bridge user telemetry, product positioning, and go-to-market execution for high-growth tech ventures.',
    email: 'sara.chen@example.com',
    location: 'Singapore / Remote',
    availability: 'available',
    hoursPerWeek: 25,
    experienceLevel: 'Lead',
    primaryRole: 'Product Manager',
    linkedinUrl: 'https://linkedin.com/in/sarachen-growth',
    isLinkedinVerified: true,
    joinedDate: 'Joined April 2026',
    resumeParsed: true,
    skills: [
      { name: 'Product Strategy', category: 'domain', level: 'expert' },
      { name: 'Agile & Scrum', category: 'soft', level: 'expert' },
      { name: 'User Metrics', category: 'technical', level: 'expert' },
      { name: 'Go-to-Market', category: 'domain', level: 'expert' },
      { name: 'Wireframing', category: 'design', level: 'proficient' },
      { name: 'Financial Modeling', category: 'domain', level: 'expert' },
    ],
    interests: ['Fintech & Payments', 'Climate & CleanTech', 'Developer Tools'],
    pastProjects: [
      {
        id: 'p-pm1',
        title: 'CarbonLedger GTM',
        role: 'Head of Product',
        description: 'Launched B2B sustainability reporting tool from 0 to 50 enterprise pilots in 6 months.',
        technologies: ['Mixpanel', 'Linear', 'Notion'],
      }
    ]
  },
  {
    id: 'user-kavya',
    name: 'Kavya Nair',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    headline: 'Backend Architect & Distributed Systems Engineer',
    bio: 'Rust, Go, and high-throughput transactional backends. Enthusiastic about microservices, zero-knowledge proofs, and database engines.',
    email: 'kavya.nair@example.com',
    location: 'Bengaluru / Remote',
    availability: 'occupied',
    hoursPerWeek: 8,
    experienceLevel: 'Advanced',
    primaryRole: 'Backend Engineer',
    linkedinUrl: 'https://linkedin.com/in/kavyanair-backend',
    isLinkedinVerified: true,
    githubUrl: 'https://github.com/kavyanair',
    joinedDate: 'Joined December 2025',
    resumeParsed: true,
    skills: [
      { name: 'Go', category: 'technical', level: 'expert' },
      { name: 'Rust', category: 'technical', level: 'proficient' },
      { name: 'PostgreSQL', category: 'technical', level: 'expert' },
      { name: 'Docker', category: 'technical', level: 'expert' },
      { name: 'Kubernetes', category: 'technical', level: 'proficient' },
      { name: 'GraphQL', category: 'technical', level: 'proficient' },
      { name: 'Distributed Systems', category: 'technical', level: 'expert' },
    ],
    interests: ['Fintech & Payments', 'Web3 & Decentralized', 'Developer Tools'],
    pastProjects: [
      {
        id: 'p-be1',
        title: 'SettlementMesh Engine',
        role: 'Core Backend Architect',
        description: 'Engineered sub-50ms transaction ledger processing 10,000 requests/second.',
        technologies: ['Go', 'gRPC', 'PostgreSQL', 'Redis'],
      }
    ]
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-medecho',
    title: 'MedEcho AI Diagnostic Companion',
    tagline: 'Real-time acoustic biomarker analysis for respiratory health screening during telehealth consults.',
    description: 'MedEcho integrates multimodal audio processing with Gemini models to provide instant preliminary diagnostic indicators for asthma, COPD, and bronchitis during remote medical consultations. We are entering the Global HealthTech Hackathon 2026 and looking for dedicated teammates to build the interactive clinician interface and backend audio pipeline.',
    ownerId: 'user-dev',
    owner: SEED_CANDIDATES[2], // Dev Raman
    domain: 'Healthcare & Biotech',
    projectType: 'Hackathon',
    difficulty: 'Intermediate',
    requiredSkills: ['TypeScript', 'React', 'Python', 'FastAPI', 'Gemini API', 'Tailwind CSS', 'Audio Processing'],
    desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
    openRoles: [
      {
        id: 'role-fe-med',
        title: 'Frontend & UI Lead',
        category: 'Frontend',
        description: 'Build responsive waveform visualizations, clinician consultation dashboard, and patient intake workflow.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
        spots: 1,
        filled: 0,
      },
      {
        id: 'role-ux-med',
        title: 'Clinical UX Designer',
        category: 'UI / UX',
        description: 'Design accessible, high-trust visual language tailored for elderly patients and busy doctors.',
        requiredSkills: ['Figma', 'Design Systems', 'User Research'],
        spots: 1,
        filled: 1,
      }
    ],
    team: [
      {
        userId: 'user-priya',
        user: SEED_CANDIDATES[1], // Priya Sharma
        roleTitle: 'Clinical UX Designer',
        joinedAt: '2 days ago'
      }
    ],
    maxTeamSize: 4,
    commitmentHours: 15,
    deadline: 'Hackathon Demo Day in 18 days',
    createdAt: '3 days ago',
    githubRepo: 'https://github.com/medecho-ai/workspace',
    isFeatured: true,
  },
  {
    id: 'proj-solaris',
    title: 'Solaris Community Microgrid',
    tagline: 'Decentralized peer-to-peer solar energy trading and smart battery orchestration for housing collectives.',
    description: 'We are creating an automated local energy market where neighbors with rooftop solar panels can trade surplus electricity with neighbors needing charging power, using dynamic pricing and localized smart meter telemetry. Preparing for our pre-seed accelerator application.',
    ownerId: 'user-sara',
    owner: SEED_CANDIDATES[3], // Sara Chen
    domain: 'Climate & CleanTech',
    projectType: 'Startup',
    difficulty: 'Advanced',
    requiredSkills: ['Go', 'PostgreSQL', 'React', 'TypeScript', 'Docker', 'IoT & Sensors', 'Financial Modeling'],
    desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
    openRoles: [
      {
        id: 'role-be-solaris',
        title: 'Backend & Ledger Architect',
        category: 'Backend',
        description: 'Develop high-throughput telemetry ingestion pipeline and credit settlement engine.',
        requiredSkills: ['Go', 'PostgreSQL', 'Docker', 'Distributed Systems'],
        spots: 1,
        filled: 0,
      },
      {
        id: 'role-fe-solaris',
        title: 'Dashboard Engineer',
        category: 'Frontend',
        description: 'Build real-time power flow graphs and household billing controls.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
        spots: 1,
        filled: 0,
      }
    ],
    team: [],
    maxTeamSize: 4,
    commitmentHours: 20,
    deadline: 'MVP launch Target: Q3 2026',
    createdAt: '5 days ago',
    isFeatured: true,
  },
  {
    id: 'proj-neuroprompt',
    title: 'NeuroPrompt Studio',
    tagline: 'Open-source visual canvas for orchestrating, debugging, and benchmarking autonomous AI agent swarms.',
    description: 'A developer-first playground that lets developers visually connect AI agents, inspect intermediate memory states in real time, and evaluate hallucination rates across diverse models. Fully open-source with 600+ GitHub stars.',
    ownerId: 'user-me',
    owner: INITIAL_CURRENT_USER, // Aarav Mehta
    domain: 'Developer Tools',
    projectType: 'Open Source',
    difficulty: 'Intermediate',
    requiredSkills: ['TypeScript', 'React', 'Tailwind CSS', 'Node.js', 'Gemini API', 'Figma'],
    desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
    openRoles: [
      {
        id: 'role-ai-neuro',
        title: 'AI Evaluator & Prompt Engineer',
        category: 'AI / ML',
        description: 'Develop automated benchmarking pipelines and agent memory replay modules.',
        requiredSkills: ['Python', 'Gemini API', 'PyTorch'],
        spots: 1,
        filled: 0,
      },
      {
        id: 'role-ux-neuro',
        title: 'Product Designer',
        category: 'UI / UX',
        description: 'Craft node-graph canvas interactions, minimap navigations, and dark-mode developer palettes.',
        requiredSkills: ['Figma', 'Design Systems', 'Prototyping'],
        spots: 1,
        filled: 0,
      }
    ],
    team: [],
    maxTeamSize: 3,
    commitmentHours: 12,
    createdAt: '1 week ago',
    githubRepo: 'https://github.com/aaravmehta/neuroprompt-studio',
    isFeatured: true,
  },
  {
    id: 'proj-biosynth',
    title: 'BioSynth Protein Sequence Visualizer',
    tagline: 'High-performance WebGL 3D molecular viewer and generative protein folding workbench.',
    description: 'BioSynth accelerates computational biology research by rendering complex 3D macromolecular structures directly in browser canvases with real-time binding affinity predictions.',
    ownerId: 'user-priya',
    owner: SEED_CANDIDATES[1], // Priya Sharma
    domain: 'Healthcare & Biotech',
    projectType: 'Open Source',
    difficulty: 'Advanced',
    requiredSkills: ['TypeScript', 'React', 'Three.js', 'Python', 'Tailwind CSS', 'WebGL'],
    desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
    openRoles: [
      {
        id: 'role-fe-bio',
        title: 'Lead Interactive Frontend Engineer',
        category: 'Frontend',
        description: 'Architect WebGL 3D canvas viewport, shader controls, and residue selection palette.',
        requiredSkills: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS'],
        spots: 1,
        filled: 1,
      },
      {
        id: 'role-be-bio',
        title: 'Bioinformatics Pipeline Engineer',
        category: 'Backend',
        description: 'PDB structure parser, AlphaFold coordinate stream pipeline, and caching layer.',
        requiredSkills: ['Python', 'FastAPI', 'Docker'],
        spots: 1,
        filled: 1,
      }
    ],
    team: [
      {
        userId: 'user-me',
        user: INITIAL_CURRENT_USER,
        roleTitle: 'Lead Interactive Frontend Engineer',
        joinedAt: '1 week ago'
      },
      {
        userId: 'user-dev',
        user: SEED_CANDIDATES[2],
        roleTitle: 'Bioinformatics Pipeline Engineer',
        joinedAt: '2 weeks ago'
      }
    ],
    maxTeamSize: 4,
    commitmentHours: 10,
    deadline: 'v1.0 Milestone in 12 days',
    createdAt: '3 weeks ago',
    githubRepo: 'https://github.com/biosynth-open/viewer',
    isFeatured: true,
  },
  {
    id: 'proj-payflow',
    title: 'PayFlow Crossborder Settlement',
    tagline: 'Instant, compliance-safe crossborder supplier payments for Southeast Asian and Indian SMB exporters.',
    description: 'Traditional wire transfers cost 4-7% and take 3-5 business days. PayFlow utilizes liquidity routing protocols to settle invoice payouts under 2 minutes at 0.3% flat fee with automated FX locking.',
    ownerId: 'user-kavya',
    owner: SEED_CANDIDATES[4], // Kavya Nair
    domain: 'Fintech & Payments',
    projectType: 'Competition',
    difficulty: 'Lead',
    requiredSkills: ['Go', 'PostgreSQL', 'TypeScript', 'React', 'Financial Modeling', 'Security'],
    desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
    openRoles: [
      {
        id: 'role-growth-pay',
        title: 'Product Growth & Fintech Strategy',
        category: 'Product',
        description: 'Map SMB merchant banking user journeys, FX compliance requirements, and launch funnel.',
        requiredSkills: ['Product Strategy', 'Financial Modeling', 'Go-to-Market'],
        spots: 1,
        filled: 0,
      }
    ],
    team: [],
    maxTeamSize: 3,
    commitmentHours: 15,
    createdAt: '4 days ago',
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    projectId: 'proj-medecho',
    projectTitle: 'MedEcho AI Diagnostic Companion',
    projectDomain: 'Healthcare & Biotech',
    applicantId: 'user-me',
    applicant: INITIAL_CURRENT_USER,
    roleId: 'role-fe-med',
    roleTitle: 'Frontend & UI Lead',
    note: 'Hey Dev! I saw your work on audio quantization. I have deep experience building live audio visualizers and full-stack React/Gemini apps. Would love to partner up for the hackathon!',
    status: 'pending',
    appliedAt: 'Yesterday at 3:45 PM',
    updatedAt: 'Yesterday at 3:45 PM',
    matchScore: 92,
    matchBreakdown: computeMatchScore(INITIAL_CURRENT_USER, INITIAL_PROJECTS[0], 'role-fe-med')
  },
  {
    id: 'app-solaris-me',
    projectId: 'proj-solaris',
    projectTitle: 'Solaris Community Microgrid',
    projectDomain: 'Climate & CleanTech',
    applicantId: 'user-me',
    applicant: INITIAL_CURRENT_USER,
    roleId: 'role-fe-solaris',
    roleTitle: 'Dashboard Engineer',
    note: 'Hi Sara! CleanTech telemetry and decentralized energy trading is a passion of mine. I built renewable microgrid monitoring dashboards before with React/FastAPI.',
    status: 'viewed',
    appliedAt: '2 days ago',
    updatedAt: '18 hours ago',
    matchScore: 86,
    matchBreakdown: computeMatchScore(INITIAL_CURRENT_USER, INITIAL_PROJECTS[1], 'role-fe-solaris')
  },
  {
    id: 'app-bio-me',
    projectId: 'proj-biosynth',
    projectTitle: 'BioSynth Protein Sequence Visualizer',
    projectDomain: 'Healthcare & Biotech',
    applicantId: 'user-me',
    applicant: INITIAL_CURRENT_USER,
    roleId: 'role-fe-bio',
    roleTitle: 'Lead Interactive Frontend Engineer',
    note: 'Thrilled to collaborate on WebGL 3D molecular structures!',
    status: 'accepted',
    appliedAt: '1 week ago',
    updatedAt: '1 week ago',
    matchScore: 95,
    matchBreakdown: computeMatchScore(INITIAL_CURRENT_USER, INITIAL_PROJECTS[3], 'role-fe-bio')
  },
  {
    id: 'app-2',
    projectId: 'proj-neuroprompt',
    projectTitle: 'NeuroPrompt Studio',
    projectDomain: 'Developer Tools',
    applicantId: 'user-priya',
    applicant: SEED_CANDIDATES[1], // Priya Sharma
    roleId: 'role-ux-neuro',
    roleTitle: 'Product Designer',
    note: 'Hi Aarav! Love what you are building with node-based agent tooling. I designed similar visual canvas systems at HealSync and can refine the UI layout and interaction models.',
    status: 'pending',
    appliedAt: '2 hours ago',
    updatedAt: '2 hours ago',
    matchScore: 88,
    matchBreakdown: computeMatchScore(SEED_CANDIDATES[1], INITIAL_PROJECTS[2], 'role-ux-neuro')
  },
  {
    id: 'app-3',
    projectId: 'proj-neuroprompt',
    projectTitle: 'NeuroPrompt Studio',
    projectDomain: 'Developer Tools',
    applicantId: 'user-dev',
    applicant: SEED_CANDIDATES[2], // Dev Raman
    roleId: 'role-ai-neuro',
    roleTitle: 'AI Evaluator & Prompt Engineer',
    note: 'Hey Aarav, I can build out the automated evaluation suite for Gemini model latency and token efficiency.',
    status: 'viewed',
    appliedAt: '1 day ago',
    updatedAt: '12 hours ago',
    matchScore: 94,
    matchBreakdown: computeMatchScore(SEED_CANDIDATES[2], INITIAL_PROJECTS[2], 'role-ai-neuro')
  }
];

export const INITIAL_INVITATIONS: ProjectInvitation[] = [
  {
    id: 'inv-1',
    projectId: 'proj-payflow',
    projectTitle: 'PayFlow Crossborder Settlement',
    projectDomain: 'Fintech & Payments',
    candidateId: 'user-me',
    candidate: INITIAL_CURRENT_USER,
    ownerId: 'user-kavya',
    owner: SEED_CANDIDATES[4], // Kavya Nair
    roleTitle: 'Product Growth & Fintech Strategy',
    roleId: 'role-growth-pay',
    initialNote: 'Hi Aarav! We reviewed your background with TypeScript & Gemini prototypes and would love to invite you to join PayFlow as our Growth & Tech Strategy partner. Your rapid prototyping skills would be huge for our hackathon demo!',
    status: 'pending',
    createdAt: '3 hours ago',
    updatedAt: '3 hours ago',
    matchScore: 89,
    matchBreakdown: computeMatchScore(INITIAL_CURRENT_USER, INITIAL_PROJECTS[3]),
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-kavya',
        senderName: 'Kavya Nair',
        senderAvatar: SEED_CANDIDATES[4].avatar,
        text: 'Hi Aarav! We reviewed your background with TypeScript & Gemini prototypes and would love to invite you to join PayFlow as our Growth & Tech Strategy partner. Your rapid prototyping skills would be huge for our hackathon demo!',
        timestamp: '3 hours ago',
        isOwner: true,
      }
    ]
  },
  {
    id: 'inv-2',
    projectId: 'proj-medecho',
    projectTitle: 'MedEcho AI Diagnostic Companion',
    projectDomain: 'Healthcare & Biotech',
    candidateId: 'user-me',
    candidate: INITIAL_CURRENT_USER,
    ownerId: 'user-dev',
    owner: SEED_CANDIDATES[2], // Dev Raman
    roleTitle: 'Frontend & UI Lead',
    roleId: 'role-fe-med',
    initialNote: 'Hey Aarav! We have an opening for Frontend Lead on MedEcho. Your experience with real-time visualizers and UI polish would be a perfect fit.',
    status: 'saved_for_later',
    createdAt: '1 day ago',
    updatedAt: '4 hours ago',
    matchScore: 92,
    matchBreakdown: computeMatchScore(INITIAL_CURRENT_USER, INITIAL_PROJECTS[0]),
    messages: [
      {
        id: 'msg-2-1',
        senderId: 'user-dev',
        senderName: 'Dev Raman',
        senderAvatar: SEED_CANDIDATES[2].avatar,
        text: 'Hey Aarav! We have an opening for Frontend Lead on MedEcho. Your experience with real-time visualizers and UI polish would be a perfect fit.',
        timestamp: '1 day ago',
        isOwner: true,
      },
      {
        id: 'msg-2-2',
        senderId: 'user-me',
        senderName: 'Aarav Mehta',
        senderAvatar: INITIAL_CURRENT_USER.avatar,
        text: 'Hey Dev! Thanks for the invite. Quick question: what are the expected sprint sync times, and will we be streaming audio over WebSockets or REST chunks?',
        timestamp: '8 hours ago',
        isOwner: false,
      },
      {
        id: 'msg-2-3',
        senderId: 'user-dev',
        senderName: 'Dev Raman',
        senderAvatar: SEED_CANDIDATES[2].avatar,
        text: 'Great question! We sync on Discord Mon/Thu at 7 PM IST, otherwise everything is async. And yes, we use WebSockets for low-latency audio streaming.',
        timestamp: '4 hours ago',
        isOwner: true,
      }
    ]
  }
];

