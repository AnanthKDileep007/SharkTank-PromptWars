import { GoogleGenAI, Type } from '@google/genai';
import {
  ChatMessage,
  ChatTurnResponse,
  DifficultyLevel,
  FinalVerdictResponse,
  PitchData,
  ScoringParameters,
  SharkReactionType,
  StartupContextSummary
} from '../types/session.ts';
import { INVESTORS, InvestorId, InvestorProfile } from '../types/investor.ts';
import {
  calculateOverallScore,
  calculateRiskScore,
  calculateConfidenceScore,
  getScoreInterpretation,
  clamp
} from '../utils/scoring.ts';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Active Gemini Models supported by current SDK and project quota
// Note: gemini-2.5-flash is 404 deprecated for new users; gemini-3.8-flash has free-tier quota exhausted.
// gemini-3.1-flash-lite is the active, verified responsive model.
const MODEL_CANDIDATES = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

function getDifficultyConfig(difficulty?: DifficultyLevel) {
  switch (difficulty) {
    case 'Friendly Angel':
      return {
        temperature: 0.7,
        tone: 'Encouraging yet discerning angel investor. Forgives early gaps, asks supportive questions, patient with early-stage founders.'
      };
    case 'Hardcore Shark':
      return {
        temperature: 1.0,
        tone: 'Ruthless, aggressive Shark Tank investor. Zero tolerance for vague answers or hand-waving. Calls out missing metrics, cuts valuations, aggressively counters weak logic, and is quick to declare "I\'m Out".'
      };
    case 'Standard VC':
    default:
      return {
        temperature: 0.85,
        tone: 'Disciplined, sharp institutional venture capitalist. Demands concrete unit economics, defensibility, and market validation.'
      };
  }
}

export interface PitchTurnRequest {
  startupData: {
    startupName: string;
    startupNiche: string;
    startupPitch: string;
    targetAudience?: string;
    revenueAsk?: string;
    founderName?: string;
  };
  chatHistory?: Array<{
    sender: 'user' | 'shark';
    text: string;
    sharkName?: string;
    sharkId?: string;
    reactionType?: string;
  }>;
  userLatestMessage?: string;
  selectedSharks?: InvestorId[];
  difficulty?: DifficultyLevel;
}

/**
 * Orchestrates multi-turn Shark dialogue using live startup data and chat history
 */
export async function orchestrateSharkChat(
  _roomId: string,
  selectedSharks: InvestorId[] = ['tony', 'bill', 'priya', 'raj', 'maya'],
  difficulty: DifficultyLevel = 'Standard VC',
  startupContext: StartupContextSummary,
  messages: ChatMessage[] = [],
  userMessage?: string
): Promise<ChatTurnResponse> {
  return executePitchTurn({
    startupData: {
      startupName: startupContext.name,
      startupNiche: startupContext.niche,
      startupPitch: startupContext.elevatorPitch,
      targetAudience: startupContext.targetAudience,
      revenueAsk: startupContext.financialsAsk,
      founderName: startupContext.founderName
    },
    chatHistory: messages.map((m) => ({
      sender: m.sender,
      text: m.text,
      sharkName: m.sharkName,
      sharkId: m.sharkId,
      reactionType: m.reactionType
    })),
    userLatestMessage: userMessage,
    selectedSharks,
    difficulty
  });
}

/**
 * Dynamic Multi-Turn Shark Chat Engine using ai.chats.create()
 */
export async function executePitchTurn(
  request: PitchTurnRequest
): Promise<ChatTurnResponse> {
  const {
    startupData,
    chatHistory = [],
    userLatestMessage,
    selectedSharks = ['tony', 'bill', 'priya', 'raj', 'maya'],
    difficulty = 'Standard VC'
  } = request;

  const activeSharks = INVESTORS.filter((inv) => selectedSharks.includes(inv.id));
  const fallbackShark = activeSharks[0] || INVESTORS[0];
  const diffConfig = getDifficultyConfig(difficulty);

  const sharksDescriptions = activeSharks
    .map(
      (s) =>
        `- ${s.name.toUpperCase()} (id: "${s.id}", role: "${s.role}"): ${s.personalityPrompt}`
    )
    .join('\n');

  // Dynamic Contextual System Prompt strictly tailored to the startup's niche
  const systemInstruction = `SYSTEM ROLE:
You are orchestrating a real-time panel of Venture Capital Investors ("Sharks") in an intense Shark Tank pitch room.

ACTIVE SHARKS IN ROOM:
${sharksDescriptions}

EVALUATION SCRUTINY: ${difficulty} (${diffConfig.tone})

LIVE STARTUP CONTEXT:
- Startup Name: ${startupData.startupName}
- Industry / Specific Niche: ${startupData.startupNiche}
- Core Product Pitch: ${startupData.startupPitch}
- Target Audience / ICP: ${startupData.targetAudience || 'Not specified by user'}
- Financials & Valuation Ask: ${startupData.revenueAsk || 'Not specified by user'}

---

### STRICT NICHE-TAILORING & MEMORY RULES:

1. ABSOLUTE ZERO GENERIC BOILERPLATE:
You are strictly forbidden from asking boilerplate questions like "What is your business model?", "Who are your competitors?", or "What is your market size?".
Every challenge MUST deeply interrogate the EXACT mechanics of ${startupData.startupNiche}:
- If it's a car/mobility startup: Grill on crash-safety certifications, stamping tooling costs, warranty liability, and why commuters wouldn't simply use e-bikes or trains.
- If it's a medical/healthcare robot: Grill on FDA 510(k) clinical trial liability, malpractice insurance, sterilization, and cost-per-procedure vs surgeon salaries.
- If it's B2B SaaS: Grill on API latency, SOC2 enterprise compliance, procurement red tape, and churn against incumbent ERPs.
- If it's D2C food/beverage: Grill on slotting fees, cold-chain distribution spoilage, co-packer minimum order quantities, and retailer margin clawbacks.
- If it's consumer hardware: Grill on injection mold tooling, lithium battery customs clearance, and cash trapped in ocean freight.

2. MULTI-TURN MEMORY & COUNTER-QUESTIONING:
- Actively review the previous turns. If the founder dodged a metric, called competition zero, or gave an unrealistic projection, CALL IT OUT IMMEDIATELY.
- The next speaking Shark must evaluate whether the founder's latest answer was satisfactory or logically flawed before introducing new concerns.
- NEVER repeat a question or topic already explored in previous turns.

3. DYNAMIC SHARK SELECTION:
Pick 1 active Shark from the panel whose domain expertise is MOST relevant to the user's latest statement:
- Tony Starks: Software architecture, proprietary AI, engineering complexity, IP copyability.
- Bill Gator: CAC vs LTV, gross margin reality, payback velocity, financial burn, pricing power.
- Priya Capital: Consumer psychology, user onboarding friction, organic word-of-mouth adoption.
- Raj Growth: Supply chain bottlenecks, fulfillment, manufacturing scale, operational execution speed.
- Maya Impact: Societal trust, ethics, regulatory compliance, durable stakeholder value.
Sharks must speak naturally based on expertise—NEVER in a predictable or turn-based loop.

4. ACCESSIBLE ANALOGIES:
Frame complex operational, technical, or financial flaws using relatable real-world consumer analogies so general audiences immediately understand the risk.

---

### REQUIRED OUTPUT FORMAT (JSON):
{
  "responding_shark_id": "string (matching one of: tony, bill, priya, raj, maya)",
  "shark_name": "string (matching the chosen Shark's full name)",
  "reaction_type": "Challenging | Curious | Skeptical | Interested | Out",
  "message_text": "string (The Shark's direct, spoken dialogue. High punch, non-generic, 1-3 sentences)"
}`;

  if (!ai || !apiKey) {
    // Dynamic context-based fallback (zero static question arrays)
    return generateDynamicFallbackTurn(activeSharks, startupData, userLatestMessage, chatHistory);
  }

  try {
    // Construct multi-turn history for ai.chats.create()
    // History must alternate user and model turns
    const historyForChat: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of chatHistory) {
      if (msg.sender === 'user') {
        historyForChat.push({
          role: 'user',
          parts: [{ text: `[FOUNDER]: ${msg.text}` }]
        });
      } else {
        historyForChat.push({
          role: 'model',
          parts: [
            {
              text: JSON.stringify({
                responding_shark_id: msg.sharkId || 'tony',
                shark_name: msg.sharkName || 'Tony Starks',
                reaction_type: msg.reactionType || 'Skeptical',
                message_text: msg.text
              })
            }
          ]
        });
      }
    }

    // Initialize multi-turn chat session with official Google Gen AI SDK
    let chatResponseText: string | null = null;

    for (const modelToTry of MODEL_CANDIDATES) {
      try {
        const chat = ai.chats.create({
          model: modelToTry,
          history: historyForChat,
          config: {
            systemInstruction,
            temperature: diffConfig.temperature,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                responding_shark_id: { type: Type.STRING },
                shark_name: { type: Type.STRING },
                reaction_type: {
                  type: Type.STRING,
                  description: 'One of: Challenging, Curious, Skeptical, Interested, Out'
                },
                message_text: { type: Type.STRING }
              },
              required: ['responding_shark_id', 'shark_name', 'reaction_type', 'message_text']
            }
          }
        });

        const isFirstTurn = !userLatestMessage && chatHistory.length === 0;
        const promptMessage = isFirstTurn
          ? `The founder has just walked into the Shark Tank and delivered their initial pitch:
Startup: "${startupData.startupName}"
Niche: "${startupData.startupNiche}"
Pitch: "${startupData.startupPitch}"
Financial Ask: "${startupData.revenueAsk || '$500,000 for 10%'}"
Target Customer: "${startupData.targetAudience || 'Target market'}"

Select the best active Shark to challenge the foundational risk or operational vulnerability of this exact niche.`
          : `FOUNDER REPLY TO CHALLENGE:
"${userLatestMessage}"

Evaluate if the founder gave real data or hand-waved. Select the most relevant active Shark to counter them and demand immediate proof on a new critical vulnerability.`;

        const res = await chat.sendMessage({
          message: promptMessage
        });
        if (res.text) {
          chatResponseText = res.text;
          break;
        }
      } catch (modelErr) {
        console.warn(`Model ${modelToTry} attempt failed, trying next candidate:`, modelErr);
      }
    }

    if (!chatResponseText) {
      return generateDynamicFallbackTurn(activeSharks, startupData, userLatestMessage, chatHistory);
    }

    const parsed = JSON.parse(chatResponseText || '{}');

    const matchedShark =
      activeSharks.find(
        (s) =>
          s.id === parsed.responding_shark_id ||
          s.name.toLowerCase() === (parsed.shark_name || '').toLowerCase()
      ) || fallbackShark;

    const validReactions: Array<'Challenging' | 'Curious' | 'Skeptical' | 'Interested' | 'Out'> = [
      'Challenging',
      'Curious',
      'Skeptical',
      'Interested',
      'Out'
    ];
    const reactionType = validReactions.includes(parsed.reaction_type)
      ? parsed.reaction_type
      : 'Skeptical';

    return {
      responding_shark_id: matchedShark.id,
      shark_name: matchedShark.name,
      reaction_type: reactionType,
      message_text: parsed.message_text || `${matchedShark.name}: Can you substantiate those claims with real unit economics?`
    };
  } catch (err) {
    console.error('Error in executePitchTurn with Google Gen AI SDK:', err);
    return generateDynamicFallbackTurn(activeSharks, startupData, userLatestMessage, chatHistory);
  }
}

/**
 * Purely algorithmic, dynamic contextual engine that constructs tailored challenges
 * based strictly on the user's live inputs and statements without any static question banks.
 */
function generateDynamicFallbackTurn(
  activeSharks: InvestorProfile[],
  startupData: PitchTurnRequest['startupData'],
  latestUserAnswer?: string,
  history: PitchTurnRequest['chatHistory'] = []
): ChatTurnResponse {
  // Opening turn
  if (!latestUserAnswer) {
    const niche = startupData.startupNiche || 'this space';
    const name = startupData.startupName || 'this business';
    const leadShark = activeSharks[0] || INVESTORS[0];

    let question = '';
    if (leadShark.id === 'tony') {
      question = `You're entering ${niche} with ${name}. What is the proprietary technical moat or algorithmic barrier preventing an established player from replicating this core capability in 90 days?`;
    } else if (leadShark.id === 'bill') {
      question = `You're asking for ${startupData.revenueAsk || 'capital'} for ${name} in ${niche}. What is your blended customer acquisition cost today, and what is your hard customer payback period in months?`;
    } else if (leadShark.id === 'priya') {
      question = `Targeting ${startupData.targetAudience || 'customers'} in ${niche} requires breaking deep daily consumer habits. Why will everyday users leave their current alternatives to use ${name}?`;
    } else if (leadShark.id === 'raj') {
      question = `In ${niche}, operational bottlenecks kill young companies. What is the single biggest supply chain, tooling, or fulfillment point of failure if your orders 5x next month?`;
    } else {
      question = `In ${niche}, regulatory scrutiny and consumer trust can make or break you. What is your clinical or regulatory liability protection, and how do you prevent race-to-the-bottom price compression?`;
    }

    return {
      responding_shark_id: leadShark.id,
      shark_name: leadShark.name,
      reaction_type: 'Challenging',
      message_text: question
    };
  }

  // Multi-turn response analysis:
  // Extract numbers and specific claims from founder's answer
  const extractedNumbers = latestUserAnswer.match(/\b(\$\d+[\d,.]*(?:k|m|b)?|\d+[\d,.]*%(?:k|m|b)?|\d+\s*(?:trials|patents|months|users|clients|units|hospitals|cad|orders))\b/gi) || [];
  
  // Identify the core topic of the user's defense
  const mentionsTech = /\b(patent|patents|algorithm|ai|software|stack|code|api|hardware|sensor|actuator|precision|tech|ip)\b/i.test(latestUserAnswer);
  const mentionsFinance = /\b(runway|cash|margin|cac|ltv|revenue|loi|sales|pricing|burn|dollar|\$|unit economic|cost)\b/i.test(latestUserAnswer);
  const mentionsCustomer = /\b(user|customer|doctor|patient|retention|churn|habit|pilot|adoption|inertia|buyer|clinic)\b/i.test(latestUserAnswer);
  const mentionsOps = /\b(supply|manufacturer|manufacturing|clinical|trial|cadaver|hospital|fulfillment|production|lead time|factory)\b/i.test(latestUserAnswer);
  const mentionsRisk = /\b(fda|compliance|regulatory|liability|safety|lawsuit|insurance|ethical|audit)\b/i.test(latestUserAnswer);

  // Pick an active Shark whose domain matches, avoiding repeating the last speaker
  const lastSpeakerId = history.length > 0 ? history[history.length - 1].sharkId : null;
  const eligibleSharks = activeSharks.filter((s) => s.id !== lastSpeakerId);
  const pool = eligibleSharks.length > 0 ? eligibleSharks : activeSharks;

  let chosenShark: InvestorProfile;
  if (mentionsFinance && pool.some((s) => s.id === 'bill')) {
    chosenShark = pool.find((s) => s.id === 'bill')!;
  } else if (mentionsTech && pool.some((s) => s.id === 'tony')) {
    chosenShark = pool.find((s) => s.id === 'tony')!;
  } else if (mentionsOps && pool.some((s) => s.id === 'raj')) {
    chosenShark = pool.find((s) => s.id === 'raj')!;
  } else if (mentionsCustomer && pool.some((s) => s.id === 'priya')) {
    chosenShark = pool.find((s) => s.id === 'priya')!;
  } else if (mentionsRisk && pool.some((s) => s.id === 'maya')) {
    chosenShark = pool.find((s) => s.id === 'maya')!;
  } else {
    chosenShark = pool[history.length % pool.length] || INVESTORS[0];
  }

  // Construct a sharp, direct counter-question citing their exact statements
  let counterText = '';
  let reaction: SharkReactionType = 'Skeptical';
  const numbersSnippet = extractedNumbers.length > 0 ? extractedNumbers.slice(0, 2).join(' and ') : '';

  if (chosenShark.id === 'tony') {
    if (numbersSnippet) {
      reaction = 'Curious';
      counterText = `You pointed to ${numbersSnippet} in your defense. But having lab validation or provisional filings is very different from production hardening. What stops Big Tech from training an open-source equivalent and giving it away for free?`;
    } else {
      reaction = 'Challenging';
      counterText = `You described the vision for ${startupData.startupName}, but you didn't define a proprietary technical barrier. Why can't a competitor with 20 skilled engineers replicate your core pipeline in 90 days?`;
    }
  } else if (chosenShark.id === 'bill') {
    if (numbersSnippet) {
      reaction = 'Curious';
      counterText = `You highlighted ${numbersSnippet}. But let's look at enterprise sales cycles: between pilot deployment and cash in your bank, how many months of operational burn do you absorb before an account pays for itself?`;
    } else {
      reaction = 'Skeptical';
      counterText = `You spoke in broad concepts for ${startupData.startupName}, but I need raw math. What are your exact gross margins after fulfillment, licensing, and direct customer onboarding costs?`;
    }
  } else if (chosenShark.id === 'priya') {
    if (numbersSnippet) {
      reaction = 'Interested';
      counterText = `Those validation points (${numbersSnippet}) indicate early momentum. But customer inertia is brutal. How long does end-user onboarding take before your buyers reach an active daily habit?`;
    } else {
      reaction = 'Challenging';
      counterText = `Your pitch for ${startupData.startupName} assumes target buyers are actively looking to switch. But inertia kills 80% of startups in ${startupData.startupNiche}. What is the irresistible hook that compels them to abandon their current routine?`;
    }
  } else if (chosenShark.id === 'raj') {
    if (numbersSnippet) {
      reaction = 'Challenging';
      counterText = `You noted ${numbersSnippet}. But scaling operations in ${startupData.startupNiche} creates severe logistics strain. If your account volume triples next month, where does your fulfillment or supply chain bottleneck first?`;
    } else {
      reaction = 'Skeptical';
      counterText = `Ideas are cheap; execution is where margins are won or lost. If three major accounts sign this quarter for ${startupData.startupName}, what breaks first in your operational delivery infrastructure?`;
    }
  } else {
    if (numbersSnippet) {
      reaction = 'Curious';
      counterText = `You brought concrete data points (${numbersSnippet}) to the room. But in ${startupData.startupNiche}, regulatory compliance and customer liability are severe. What is your downside protection against clinical or legal risk?`;
    } else {
      reaction = 'Challenging';
      counterText = `I appreciate your passion for ${startupData.startupName}, but building a durable company requires stakeholder trust. How do you protect customer data and maintain standards if price competition gets vicious?`;
    }
  }

  return {
    responding_shark_id: chosenShark.id,
    shark_name: chosenShark.name,
    reaction_type: reaction,
    message_text: counterText
  };
}

/**
 * AI-Powered Comprehensive Final Verdict Generator using gemini-2.5-flash
 * Dynamically evaluates the actual chat transcript without hardcoded scores.
 */
export async function generateFinalVerdict(
  state: any,
  pitchData?: PitchData
): Promise<FinalVerdictResponse> {
  const startupName = pitchData?.startupName || state.startupName || 'Startup';
  const pitchText = pitchData?.pitch || pitchData?.revenueAsk || state.startupPitch || 'N/A';
  const askText = pitchData?.revenueAsk || pitchData?.funding || state.financialsAsk || '$500,000 for 10%';
  const messages: ChatMessage[] = state.messages || [];

  const transcript = messages.length > 0
    ? messages
        .map((m) => {
          if (m.sender === 'user') {
            return `FOUNDER: "${m.text}"`;
          } else {
            return `${(m.sharkName || 'SHARK').toUpperCase()} (${m.reactionType || 'Skeptical'}): "${m.text}"`;
          }
        })
        .join('\n\n')
    : `(Pitch presented: "${pitchText}")`;

  const verdictPrompt = `You are evaluating a startup after a live pitch session in the Shark Tank.
STARTUP: ${startupName}
PITCH SUMMARY: ${pitchText}
FINANCIAL ASK: ${askText}

---

COMPLETE CONVERSATION TRANSCRIPT WITH SHARKS:
${transcript}

---

MANDATE:
Carefully and rigorously evaluate how the founder ACTUALLY defended their startup in the transcript above.
DO NOT return static or pre-determined scores:
- If the founder defended with real metrics, answered directly, and proved defensibility: Reward with high scores (75 - 92) and real investment term sheet offers.
- If the founder was evasive, lacked unit economics, or claimed zero competition: Give tough scores (35 - 58) and PASS / HARD PASS decisions.
- If promising but unproven: Give medium scores (60 - 74) and WATCHLIST / INTERESTED decisions.

CRITICAL GROUNDING & CONTEXT REQUIREMENTS:
1. In each Shark's "whatILiked" and "biggestConcern", you MUST explicitly reference actual claims, statements, or dodges made by the founder during the live dialogue.
2. In each Shark's "quote", speak directly to the founder referencing their actual arguments from the session.
3. In "aiBusinessVerdict.summary", write a tailored 2-3 sentence executive synthesis that evaluates their performance under Shark scrutiny.
4. In "whatWorks" and "whatKillsIt", provide sharp, niche-specific points directly referencing the transcript mechanics.

Return a complete evaluation in JSON with parameterScores (problemStrength, marketOpportunity, solutionQuality, productMarketFit, businessModel, competitiveAdvantage, moat, scalability, execution, traction, founderPitch), individual investorVerdicts for Tony Starks, Bill Gator, Priya Capital, Raj Growth, and Maya Impact, aiBusinessVerdict (category, finalJudgment, summary, whatWorks, whatKillsIt, whatMustBeProven, targetCustomerMatch, actionableRoadmap), and strongerPitch.`;

  if (!ai || !apiKey) {
    return generateDynamicFallbackVerdict(startupName, pitchText, askText, messages);
  }

  let verdictResponseText: string | null = null;

  for (const modelToTry of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model: modelToTry,
        contents: verdictPrompt,
        config: {
          systemInstruction:
            'You are issuing the official, data-backed Shark Tank final investment decisions. Evaluate the transcript realistically.',
          temperature: 0.75,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              parameterScores: {
                type: Type.OBJECT,
                properties: {
                  problemStrength: { type: Type.NUMBER },
                  marketOpportunity: { type: Type.NUMBER },
                  solutionQuality: { type: Type.NUMBER },
                  productMarketFit: { type: Type.NUMBER },
                  businessModel: { type: Type.NUMBER },
                  competitiveAdvantage: { type: Type.NUMBER },
                  moat: { type: Type.NUMBER },
                  scalability: { type: Type.NUMBER },
                  execution: { type: Type.NUMBER },
                  traction: { type: Type.NUMBER },
                  founderPitch: { type: Type.NUMBER }
                },
                required: [
                  'problemStrength',
                  'marketOpportunity',
                  'solutionQuality',
                  'productMarketFit',
                  'businessModel',
                  'competitiveAdvantage',
                  'moat',
                  'scalability',
                  'execution',
                  'traction',
                  'founderPitch'
                ]
              },
              investorVerdicts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    investorId: { type: Type.STRING },
                    decision: { type: Type.STRING },
                    offer: {
                      type: Type.OBJECT,
                      properties: {
                        funding: { type: Type.STRING },
                        equity: { type: Type.STRING },
                        conditions: { type: Type.STRING }
                      }
                    },
                    score: { type: Type.NUMBER },
                    whatILiked: { type: Type.STRING },
                    biggestConcern: { type: Type.STRING },
                    whatWouldChangeMyMind: { type: Type.STRING },
                    quote: { type: Type.STRING }
                  },
                  required: [
                    'investorId',
                    'decision',
                    'score',
                    'whatILiked',
                    'biggestConcern',
                    'whatWouldChangeMyMind',
                    'quote'
                  ]
                }
              },
              aiBusinessVerdict: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  finalJudgment: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  whatWorks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whatKillsIt: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whatMustBeProven: { type: Type.ARRAY, items: { type: Type.STRING } },
                  targetCustomerMatch: { type: Type.STRING },
                  actionableRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: [
                  'category',
                  'finalJudgment',
                  'summary',
                  'whatWorks',
                  'whatKillsIt',
                  'whatMustBeProven',
                  'targetCustomerMatch',
                  'actionableRoadmap'
                ]
              },
              strongerPitch: {
                type: Type.OBJECT,
                properties: {
                  restructuredPitch: { type: Type.STRING },
                  keyChangesMade: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hookSentence: { type: Type.STRING }
                },
                required: ['restructuredPitch', 'keyChangesMade', 'hookSentence']
              }
            },
            required: ['parameterScores', 'investorVerdicts', 'aiBusinessVerdict', 'strongerPitch']
          }
        }
      });

      if (response.text) {
        verdictResponseText = response.text;
        break;
      }
    } catch (modelErr) {
      console.warn(`Verdict generation with ${modelToTry} failed, trying candidate fallback:`, modelErr);
    }
  }

  if (!verdictResponseText) {
    return generateDynamicFallbackVerdict(startupName, pitchText, askText, messages);
  }

  try {
    const parsed = JSON.parse(verdictResponseText);
    const rawScores: ScoringParameters = parsed.parameterScores;
    const calculatedOverallScore = calculateOverallScore(rawScores);
    const interpretation = getScoreInterpretation(calculatedOverallScore);
    const riskScore = calculateRiskScore(rawScores, 0, 'REALISTIC');
    const confidenceScore = calculateConfidenceScore(
      Math.max(3, messages.length),
      3,
      0
    );

    const investorVerdicts = INVESTORS.map((inv) => {
      const match = (parsed.investorVerdicts || []).find(
        (v: any) => v.investorId === inv.id || (v.name || '').toLowerCase().includes(inv.name.toLowerCase())
      );

      if (match) {
        return {
          investorId: inv.id,
          name: inv.name,
          decision: match.decision,
          offer: match.offer || null,
          score: clamp(match.score ?? calculatedOverallScore),
          whatILiked: match.whatILiked,
          biggestConcern: match.biggestConcern,
          whatWouldChangeMyMind: match.whatWouldChangeMyMind || 'Show sustained retention.',
          quote: match.quote
        };
      }

      return {
        investorId: inv.id,
        name: inv.name,
        decision: (calculatedOverallScore >= 75 ? 'INTERESTED' : 'PASS') as any,
        offer: null,
        score: calculatedOverallScore,
        whatILiked: 'Understood the core thesis.',
        biggestConcern: 'Needs validation on defensibility.',
        whatWouldChangeMyMind: 'Show verifiable customer retention.',
        quote: "I'm passing for now, but keep executing."
      };
    });

    return {
      overallScore: calculatedOverallScore,
      investmentPotential: clamp(Math.round(calculatedOverallScore * 0.95)),
      riskScore,
      confidenceScore,
      scoreInterpretation: interpretation,
      parameterScores: rawScores,
      investorVerdicts,
      aiBusinessVerdict: parsed.aiBusinessVerdict,
      strongerPitch: {
        originalExcerpt: pitchText,
        restructuredPitch: parsed.strongerPitch.restructuredPitch,
        keyChangesMade: parsed.strongerPitch.keyChangesMade,
        hookSentence: parsed.strongerPitch.hookSentence
      },
      totalContradictionsFound: 0,
      pitchDurationRounds: Math.max(1, Math.round(messages.length / 2))
    };
  } catch (err) {
    console.error('Error parsing final verdict response:', err);
    return generateDynamicFallbackVerdict(startupName, pitchText, askText, messages);
  }
}

/**
 * Algorithmic fallback evaluation that deeply analyzes the conversation transcript
 * Cites actual claims, metrics, and defenses without any generic boilerplate.
 */
function generateDynamicFallbackVerdict(
  startupName: string,
  pitchText: string,
  askText: string,
  messages: ChatMessage[]
): FinalVerdictResponse {
  const userMessages = messages.filter((m) => m.sender === 'user').map((m) => m.text);
  const combinedUserText = userMessages.join(' ');
  const userTurnsCount = userMessages.length;

  // Extract all numbers, metrics, contracts, entities mentioned by founder
  const numbersMentioned = combinedUserText.match(/\b(\$\d+[\d,.]*(?:k|m|b)?|\d+[\d,.]*%(?:k|m|b)?|\d+\s*(?:trials|patents|months|users|clients|units|hospitals|cad|orders|days|hours))\b/gi) || [];
  const metricsCount = numbersMentioned.length;

  const hasPatentsOrIP = /\b(patent|provisional|ip|proprietary|algorithm|custom|exclusive)\b/i.test(combinedUserText);
  const hasPilotOrContract = /\b(loi|contract|pilot|clinic|hospital|enterprise|client|signed|partner)\b/i.test(combinedUserText);
  const hasRunwayOrFinances = /\b(runway|cash|margin|burn|cac|ltv|revenue|cost)\b/i.test(combinedUserText);
  const isEvasive = (combinedUserText.match(/\b(hope|believe|plan to|soon|someday|eventually)\b/gi) || []).length > 2;
  const wordCount = combinedUserText.split(/\s+/).length;

  // Calculate dynamic baseline score based on founder's actual answers:
  let baseScore = 52;
  if (metricsCount >= 2) baseScore += 16;
  else if (metricsCount === 1) baseScore += 8;

  if (hasPatentsOrIP) baseScore += 10;
  if (hasPilotOrContract) baseScore += 8;
  if (hasRunwayOrFinances) baseScore += 6;
  if (userTurnsCount >= 3) baseScore += 6;
  if (isEvasive) baseScore -= 12;

  baseScore = Math.max(38, Math.min(88, baseScore));

  const dynamicScores: ScoringParameters = {
    problemStrength: clamp(baseScore + 6),
    marketOpportunity: clamp(baseScore + 4),
    solutionQuality: clamp(baseScore + (hasPatentsOrIP ? 8 : 2)),
    productMarketFit: clamp(baseScore + (hasPilotOrContract ? 6 : -2)),
    businessModel: clamp(baseScore + (hasRunwayOrFinances ? 4 : -6)),
    competitiveAdvantage: clamp(baseScore + (hasPatentsOrIP ? 8 : -4)),
    moat: clamp(baseScore + (hasPatentsOrIP ? 10 : -8)),
    scalability: clamp(baseScore + 2),
    execution: clamp(baseScore + (hasPilotOrContract ? 7 : -4)),
    traction: clamp(metricsCount > 0 ? baseScore + 6 : baseScore - 10),
    founderPitch: clamp(wordCount > 40 ? baseScore + 5 : baseScore - 5)
  };

  const calculatedOverallScore = calculateOverallScore(dynamicScores);
  const interpretation = getScoreInterpretation(calculatedOverallScore);
  const riskScore = calculateRiskScore(dynamicScores, 0, 'REALISTIC');
  const confidenceScore = calculateConfidenceScore(Math.max(2, messages.length), metricsCount, 0);

  const investorVerdicts = INVESTORS.map((inv) => {
    let score = calculatedOverallScore;
    let whatILiked = '';
    let biggestConcern = '';
    let whatWouldChangeMyMind = '';
    let quote = '';

    if (inv.id === 'tony') {
      score += hasPatentsOrIP ? 8 : -6;
      whatILiked = hasPatentsOrIP
        ? `Appreciated that you defended with tangible intellectual property (${numbersMentioned.find((n) => /patent|trial/i.test(n)) || 'proprietary engineering assets'}).`
        : `Clear understanding of the core technical problem in ${startupName}.`;
      biggestConcern = hasPatentsOrIP
        ? `Ensuring patent claims survive clinical or enterprise invalidation challenges.`
        : `Absence of a deep defensive moat; vulnerable to fast cloning by established tech teams.`;
      whatWouldChangeMyMind = `Demonstrate full proprietary architectural lock-in with zero dependence on off-the-shelf wrappers.`;
      quote = score >= 75
        ? `You came prepared with actual proprietary defensibility. I'm making you an offer, but I want strong board advisory rights.`
        : `If 20 engineers can copy your pipeline over a holiday weekend, you don't have a business. I'm out.`;
    } else if (inv.id === 'bill') {
      score += hasRunwayOrFinances && metricsCount >= 2 ? 8 : -8;
      whatILiked = metricsCount > 0
        ? `You defended with hard numbers on the record: ${numbersMentioned.slice(0, 2).join(' and ')}.`
        : `Understood the broad market sizing potential.`;
      biggestConcern = isEvasive
        ? `Evasive answers on acquisition payback and customer collection cycles.`
        : `Long sales cycles burning runway before net cash collections turn positive.`;
      whatWouldChangeMyMind = `Show 3 consecutive quarters of gross margins above 65% with sub-4-month customer payback.`;
      quote = score >= 75
        ? `The numbers and unit economics held up under my grill session. Here's a term sheet with protective equity.`
        : `Hope is not a business model. Until I see audited unit economics, I cannot invest. I'm out.`;
    } else if (inv.id === 'priya') {
      score += hasPilotOrContract ? 6 : -3;
      whatILiked = `Recognized authentic customer workflow friction and articulated the user problem clearly.`;
      biggestConcern = `Customer inertia and high behavioral switching costs for target buyers.`;
      whatWouldChangeMyMind = `Prove that buyers organically refer peers with a viral coefficient above 0.35.`;
      quote = score >= 75
        ? `You convinced me that your buyers won't just test this—they'll stay hooked. I'm in.`
        : `Breaking existing consumer or enterprise habits will bleed your marketing budget dry. I pass.`;
    } else if (inv.id === 'raj') {
      score += hasPilotOrContract ? 7 : -4;
      whatILiked = hasPilotOrContract
        ? `Securing early commitments (${numbersMentioned.find((n) => /loi|pilot|clinic|unit/i.test(n)) || 'commercial letters of intent'}) demonstrates execution grit.`
        : `Solid grasp of the delivery challenge in ${startupName}.`;
      biggestConcern = `Operational throughput, vendor reliability, and quality control under sudden volume surges.`;
      whatWouldChangeMyMind = `Lock down binding SLA agreements with primary suppliers to cap cost spikes.`;
      quote = score >= 75
        ? `You have operational tenacity and practical milestone discipline. I'm in with growth capital.`
        : `Scaling this operational infrastructure will create massive margin friction. I'm out.`;
    } else {
      score += hasPatentsOrIP && hasPilotOrContract ? 6 : -2;
      whatILiked = `Mission-driven focus on solving high-stakes problems with durable real-world impact.`;
      biggestConcern = `Downside compliance liability and stakeholder trust if market competition escalates.`;
      whatWouldChangeMyMind = `Establish a dedicated clinical and ethical advisory board with independent oversight.`;
      quote = score >= 75
        ? `You are building a solution with durable societal value and commercial legs. Count me in.`
        : `The liability exposure and regulatory hurdles are too high for my risk tolerance today. I pass.`;
    }

    score = clamp(score);

    let decision: 'INVEST' | 'INTERESTED' | 'WATCHLIST' | 'PASS' | 'HARD PASS' = 'PASS';
    let offer = null;

    if (score >= 76) {
      decision = 'INVEST';
      offer = {
        funding: askText.includes('$') ? askText.split('for')[0].trim() : '$500,000',
        equity: '12%',
        conditions: 'Subject to quarterly milestone audits and customer retention benchmarks.'
      };
    } else if (score >= 66) {
      decision = 'INTERESTED';
    } else if (score >= 52) {
      decision = 'WATCHLIST';
    } else {
      decision = 'PASS';
    }

    return {
      investorId: inv.id,
      name: inv.name,
      decision,
      offer,
      score,
      whatILiked,
      biggestConcern,
      whatWouldChangeMyMind,
      quote
    };
  });

  const category = calculatedOverallScore >= 75
    ? 'STRONG BUSINESS IDEA'
    : calculatedOverallScore >= 64
    ? 'PROMISING BUT NEEDS VALIDATION'
    : calculatedOverallScore >= 50
    ? 'GOOD PRODUCT WEAK BUSINESS'
    : 'NEEDS MAJOR REWORK';

  const finalJudgment = calculatedOverallScore >= 75
    ? 'BUILD IT'
    : calculatedOverallScore >= 64
    ? 'VALIDATE IT FIRST'
    : calculatedOverallScore >= 50
    ? 'REWORK THE BUSINESS MODEL'
    : 'PIVOT IT';

  const summary = `In your live defense of ${startupName}, ${
    calculatedOverallScore >= 75
      ? 'you convincingly defended your defensibility, backed up claims with tangible validation metrics, and earned term sheet interest from the panel.'
      : calculatedOverallScore >= 64
      ? 'you demonstrated authentic market resonance, but the Sharks flagged critical questions on unit payback and competitive durability before issuing checks.'
      : 'the Sharks uncovered substantial execution vulnerabilities, pressuring your unvalidated unit economics and questioning customer switching velocity.'
  }`;

  return {
    overallScore: calculatedOverallScore,
    investmentPotential: clamp(Math.round(calculatedOverallScore * 0.95)),
    riskScore,
    confidenceScore,
    scoreInterpretation: interpretation,
    parameterScores: dynamicScores,
    investorVerdicts,
    aiBusinessVerdict: {
      category: category as any,
      finalJudgment: finalJudgment as any,
      summary,
      whatWorks: [
        `Direct focus on the acute problem in ${startupName}`,
        numbersMentioned.length > 0
          ? `Brought concrete validation data to dialogue (${numbersMentioned.slice(0, 2).join(', ')})`
          : 'Clear articulation of the customer workflow friction',
        hasPatentsOrIP ? 'Protected technical defensibility & intellectual property assets' : 'Focused positioning in target customer niche',
        'Large addressable market opportunity'
      ],
      whatKillsIt: [
        hasPatentsOrIP ? 'Risk of established incumbents building workarounds' : 'Lack of certified proprietary moat against well-funded clones',
        hasRunwayOrFinances ? 'Working capital drag during enterprise deployment cycles' : 'Uncertain unit margin payback and customer acquisition burn',
        'Customer inertia and friction in replacing incumbent workflows',
        'Potential procurement delays stretching cash runway'
      ],
      whatMustBeProven: [
        'Audited 90-day customer retention cohort data',
        hasRunwayOrFinances ? 'Verified cash collection cycles under 45 days' : 'Blended Customer Acquisition Cost payback under 3 months',
        'Binding multi-year contracts rather than non-binding exploratory trials'
      ],
      targetCustomerMatch: 'Target audience has acute pain, but commercial willingness-to-pay must be converted into recurring revenue.',
      actionableRoadmap: [
        'Convert existing pilot interest into signed, prepaid contractual commitments',
        'Harden proprietary IP and formalize defensibility documentation',
        'Tighten gross margins before raising venture capital at higher dilution'
      ]
    },
    strongerPitch: {
      originalExcerpt: pitchText,
      restructuredPitch: `${startupName} solves critical friction by delivering guaranteed outcomes—commanding defensible unit economics and verified retention (${numbersMentioned[0] || 'proven benchmarks'}) while replacing slow incumbent workflows with certified ROI.`,
      keyChangesMade: [
        'Grounds claims in verified outcomes rather than speculative feature lists',
        'Directly addresses technical defensibility and customer retention upfront',
        'Frames the business model as high-margin, scalable enterprise infrastructure'
      ],
      hookSentence: `We do not sell software features; we guarantee quantifiable operational ROI.`
    },
    totalContradictionsFound: 0,
    pitchDurationRounds: Math.max(1, Math.round(messages.length / 2))
  };
}
