export type InvestorId = 'tony' | 'bill' | 'priya' | 'raj' | 'maya';

export interface InvestorProfile {
  id: InvestorId;
  name: string;
  role: string;
  title: string;
  description: string;
  focusAreas: string[];
  personalityPrompt: string;
  avatar: string; // emoji or fallback
  photoKey: 'tony' | 'bill' | 'priya' | 'raj' | 'maya';
  quote: string;
  archetype: string;
  accentColor: string;
}

export type InvestorMood = 'SKEPTICAL' | 'CURIOUS' | 'IMPRESSED' | 'CONCERNED' | 'UNCONVINCED';

export type InvestorDecision = 'INVEST' | 'INTERESTED' | 'WATCHLIST' | 'PASS' | 'HARD PASS';

export interface IndividualInvestorVerdict {
  investorId: InvestorId;
  name: string;
  decision: InvestorDecision;
  offer?: {
    funding: string;
    equity: string;
    conditions: string;
  } | null;
  score: number;
  whatILiked: string;
  biggestConcern: string;
  whatWouldChangeMyMind: string;
  quote: string;
}

export const INVESTORS: InvestorProfile[] = [
  {
    id: 'tony',
    name: 'Tony Starks',
    role: 'Tech Visionary',
    title: 'Tech Visionary',
    description: 'Looks for deep tech, innovation and scalable solutions. Challenges superficial AI usage.',
    archetype: 'Deep Tech, Innovation & AI Architecture',
    avatar: '⚡',
    photoKey: 'tony',
    quote: "If your software can be cloned over a weekend hackathon, you don't have a business—you have a feature.",
    accentColor: '#3B82F6',
    focusAreas: ['Technology', 'Scalability', 'Technical Moat', 'Innovation'],
    personalityPrompt: 'TONY STARKS (Tech Visionary): Focuses on technical defensibility, proprietary algorithms, engineering moat, and AI necessity. Challenges whether this is a real breakthrough or just an off-the-shelf wrapper. Demands to know what prevents Big Tech or open source from copying this in 6 months.'
  },
  {
    id: 'bill',
    name: 'Bill Gator',
    role: 'Analytical Investor',
    title: 'Analytical Investor',
    description: 'Obsessed with market sizing, unit economics, CAC/LTV, and cold hard data.',
    archetype: 'SaaS Metrics, Unit Economics & Market Size',
    avatar: '📊',
    photoKey: 'bill',
    quote: "Show me the unit economics. Hope isn't a customer acquisition strategy.",
    accentColor: '#10B981',
    focusAreas: ['Market Size', 'Unit Economics', 'Business Model', 'Data Validation'],
    personalityPrompt: 'BILL GATOR (Analytical Investor): Focuses on TAM, CAC, LTV, payback periods, and unit economics. Questions overly optimistic projections and calculates whether the company is losing money on every order or subscription.'
  },
  {
    id: 'priya',
    name: 'Priya Capital',
    role: 'Consumer Expert',
    title: 'Consumer Expert',
    description: 'Focuses on customer delight, brand resonance, organic word-of-mouth, and frictionless go-to-market.',
    archetype: 'D2C, Consumer Experience & Viral Growth',
    avatar: '✨',
    photoKey: 'priya',
    quote: "If a normal human being can't understand why they need this in five seconds, your conversion rate will bleed you dry.",
    accentColor: '#F43F5E',
    focusAreas: ['Customer Experience', 'Brand & Growth', 'Go To Market', 'Customer Retention'],
    personalityPrompt: 'PRIYA CAPITAL (Consumer Expert): Evaluates customer friction, brand appeal, everyday usability, retention, and word-of-mouth. Demands to know why an ordinary buyer would switch from an established alternative.'
  },
  {
    id: 'raj',
    name: 'Raj Growth',
    role: 'Operations Expert',
    title: 'Operations Expert',
    description: 'Tests execution velocity, supply chain resiliency, unit margin discipline, and operational bottlenecks.',
    archetype: 'Scaling, Execution & Supply Chain',
    avatar: '⚙️',
    photoKey: 'raj',
    quote: "Ideas are cheap. Executing with tight margins and bulletproof logistics is what separates real businesses from money pits.",
    accentColor: '#059669',
    focusAreas: ['Execution', 'Financial Discipline', 'Scalability', 'Operations'],
    personalityPrompt: 'RAJ GROWTH (Operations Expert): Focuses on logistical bottlenecks, day-to-day complexity, supplier lock-in, working capital drain, and scaling without burning through all venture capital.'
  },
  {
    id: 'maya',
    name: 'Maya Impact',
    role: 'Social Impact Investor',
    title: 'Social Impact Investor',
    description: 'Evaluates mission alignment, stakeholder trust, ethical sustainability, and long-term societal value.',
    archetype: 'Sustainability, Social Value & Long-Term Trust',
    avatar: '🌱',
    photoKey: 'maya',
    quote: "Great companies build lasting shareholder value by solving real societal friction, not creating predatory lock-in.",
    accentColor: '#14B8A6',
    focusAreas: ['Social Impact', 'Sustainability', 'Long Term Value', 'Ethics & Trust'],
    personalityPrompt: 'MAYA IMPACT (Social Impact Investor): Focuses on sustainable long-term value, ethical AI and data use, environmental or social externalities, and customer trust as a durable competitive advantage.'
  }
];
