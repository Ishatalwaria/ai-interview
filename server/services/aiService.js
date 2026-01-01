import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/* -------------------------------------------------------------------------- */
/* 🌐 Initialize Gemini API                                                  */
/* -------------------------------------------------------------------------- */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Priorities for free tier: Flash is fastest/cheapest. Pro is valid but slower.
const MODEL_CANDIDATES = [

  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",

];

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not set. Falling back to offline logic.");
}

/* -------------------------------------------------------------------------- */
/* 🧩 Helpers & Fallbacks (CRITICAL FOR OFFLINE MODE)                        */
/* -------------------------------------------------------------------------- */

const normalizeText = (t) => (t || "").replace(/\s+/g, " ").trim();
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const limitWords = (text = "", maxWords = 50) => {
  const words = normalizeText(text).split(/\s+/);
  if (words.length <= maxWords) return words.join(" ");
  return words.slice(0, maxWords).join(" ") + "…";
};

const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const pickKeywords = (source = "", limit = 5) => {
  return normalizeText(source)
    .split(/[ ,\n\t]+/)
    .filter((word) => word.length > 3)
    .slice(0, limit);
};

const fallbackSummary = (rawText) => {
  const text = normalizeText(rawText).slice(0, 1500);
  if (!text) {
    return "- Education: Not mentioned\n- Projects: Not mentioned\n- Experience: Not mentioned\n- Skills: Not mentioned\n- Achievements: Not mentioned";
  }
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 6);
  return [
    `- Education: ${sentences[0] || "Not mentioned"}`,
    `- Projects: ${sentences[1] || "Not mentioned"}`,
    `- Experience: ${sentences[2] || "Not mentioned"}`,
    `- Skills: ${sentences[3] || "Not mentioned"}`,
    `- Achievements: ${sentences[4] || "Not mentioned"}`,
  ].join("\n");
};

const fallbackQuestions = ({
  num_of_questions,
  interview_type,
  role,
  experience_level,
  company_name,
  focus_area,
  job_description,
}) => {
  const count = Math.max(1, Number(num_of_questions) || 3);
  const type = interview_type?.toLowerCase() || "mixed";
  const lvl = experience_level || "professional";
  const targetRole = role || "candidate";
  const focusKeywords = pickKeywords(focus_area, 15);
  const jobKeywords = pickKeywords(job_description, 15);
  const roleKeywords = pickKeywords(role, 10);
  const company = company_name || "this organization";

  const technicalFocusWords = focusKeywords.length ? focusKeywords : [
    "scalable architecture",
    "fault tolerance",
    "system performance",
    "deployment automation",
  ];

  const competencyWords = jobKeywords.length ? jobKeywords : [
    "reliability",
    "latency",
    "user experience",
    "cost efficiency",
  ];

  const behavioralScenarios = [
    "navigating conflicting stakeholder expectations",
    "leading a project through ambiguity",
    "mentoring a teammate who was struggling",
    "handling a high-pressure production issue",
    "aligning remote collaborators toward a deadline",
  ];

  const domainKeywords = [...new Set([...roleKeywords, ...focusKeywords, ...jobKeywords])];
  const topicPool = domainKeywords.length
    ? shuffle(domainKeywords)
    : [
      "microservices",
      "data pipelines",
      "system observability",
      "incident response",
      "customer onboarding",
    ];

  const behavioralFocus = domainKeywords.length
    ? shuffle(domainKeywords)
    : [
      "cross-team collaboration",
      "customer empathy",
      "delivery accountability",
      "stakeholder trust",
    ];

  const preferredAnswers = {
    technical:
      "Structure the answer using context, solution approach, alternatives, trade-offs, and measurable outcomes that demonstrate engineering judgment.",
    behavioral:
      "Use the STAR format, highlight your decision making, communication, and the impact your actions had on the team or product.",
  };

  const buildTechnicalQuestion = (seed) => {
    const topic = topicPool[seed % topicPool.length] || technicalFocusWords[seed % technicalFocusWords.length];
    const metric = competencyWords[(seed * 3 + 1) % competencyWords.length];
    const stageOptions = [
      "design",
      "architect",
      "refine",
      "scale",
      "stress-test",
      "secure",
    ];
    const stage = stageOptions[seed % stageOptions.length];
    const collaborationMode = [
      "with product managers",
      "with data partners",
      "with SREs",
      "with compliance stakeholders",
    ][seed % 4];
    const prompt = `How would you ${stage} ${topic} for ${company} ${collaborationMode}, what trade-offs would you consider, and how would you track ${metric}?`;
    return limitWords(prompt, 50);
  };

  const buildBehavioralQuestion = (seed) => {
    const scenario = behavioralScenarios[seed % behavioralScenarios.length];
    const focus = behavioralFocus[seed % behavioralFocus.length];
    const prompt = `Describe a time you owned ${scenario} while focusing on ${focus} as a ${lvl} ${targetRole}. How did you influence the outcome?`;
    return limitWords(prompt, 50);
  };

  const chosenQuestions = [];
  const seen = new Set();
  let attempts = 0;

  while (chosenQuestions.length < count && attempts < count * 6) {
    const seed = attempts;
    const useTechnical = type === "technical" ? true : type === "behavioral" ? false : seed % 2 === 0;
    const questionText = useTechnical
      ? buildTechnicalQuestion(seed)
      : buildBehavioralQuestion(seed);
    const fingerprint = questionText.toLowerCase();
    if (!seen.has(fingerprint)) {
      seen.add(fingerprint);
      chosenQuestions.push({
        question: questionText,
        preferred_answer: useTechnical
          ? preferredAnswers.technical
          : preferredAnswers.behavioral,
      });
    }
    attempts += 1;
  }

  if (chosenQuestions.length < count) {
    while (chosenQuestions.length < count) {
      const filler = limitWords(
        `Describe a challenge you have solved recently that is relevant to this ${targetRole} role and what you would improve next time.`,
        50
      );
      const fingerprint = filler.toLowerCase() + chosenQuestions.length;
      if (!seen.has(fingerprint)) {
        chosenQuestions.push({
          question: filler,
          preferred_answer: preferredAnswers.behavioral,
        });
        seen.add(fingerprint);
      } else {
        break;
      }
    }
  }

  return chosenQuestions.slice(0, count);
};

const fallbackScore = ({ userAnswer = "", preferredAnswer = "" }) => {
  const answer = normalizeText(userAnswer);
  if (!answer) {
    return {
      score: 0,
      feedback: "No answer was provided. Walk through your thought process and provide a concrete example next time.",
    };
  }

  const preferredKeywords = pickKeywords(preferredAnswer, 8);
  const answerTokens = answer.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  const uniqueAnswerTokens = new Set(answerTokens);
  const matches = preferredKeywords.filter((kw) => uniqueAnswerTokens.has(kw.toLowerCase()));
  const missing = preferredKeywords.filter((kw) => !uniqueAnswerTokens.has(kw.toLowerCase()));

  const wordCount = answerTokens.length;
  const lengthScore = clamp(wordCount * 2.2, 10, 45);
  const coverageScore = preferredKeywords.length
    ? clamp((matches.length / preferredKeywords.length) * 40, 5, 40)
    : clamp(matches.length * 8, 5, 30);
  const structureScore = answer.includes("because") || answer.includes("so that") || answer.includes("result") ? 8 : 0;
  const score = clamp(Math.round(20 + lengthScore + coverageScore + structureScore), 20, 95);

  let feedback;
  if (matches.length === 0) {
    feedback = "Answer not correct . Address the core concepts explicitly and relate them to outcomes or metrics.";
  } else if (missing.length > 0) {
    feedback = `Good start covering ${matches.join(", ")}. Strengthen it by touching on ${missing.slice(0, 2).join(" and ")}.`;
  } else {
    feedback = "Strong answer with relevant detail. Consider adding measurable impact or reflections to make it even sharper.";
  }

  return { score, feedback };
};

const buildInterviewInsights = (answers = []) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      summary: "No responses were recorded. Complete the interview to receive feedback.",
      strengths: "- Provide at least one complete answer so we can highlight your strengths.",
      areas: "- Provide answers for each question to uncover focus areas.",
      averageScore: 0,
    };
  }

  const sanitizedAnswers = answers.map((ans) => ({
    question: limitWords(ans.question || "", 25),
    score: Number(ans.score) || 0,
    feedback: normalizeText(ans.feedback || ""),
  }));

  const totalScore = sanitizedAnswers.reduce((acc, item) => acc + item.score, 0);
  const averageScore = Number((totalScore / sanitizedAnswers.length).toFixed(1));
  const ordered = [...sanitizedAnswers].sort((a, b) => b.score - a.score);
  const strengthsRaw = ordered.filter((item) => item.score >= Math.min(80, averageScore + 5)).slice(0, 3);
  const improvementsRaw = ordered
    .filter((item) => item.score <= Math.max(65, averageScore - 5))
    .slice(0, 3);

  const toBulletList = (items, fallbackMessage, positive = true) => {
    if (!items.length) return [fallbackMessage];
    return items.map((item) => {
      const sentiment = positive ? "Highlight" : "Improve";
      const guidance = positive
        ? item.feedback || "Keep replicating this structured explanation."
        : item.feedback || "Add detail on your decision making and tangible results.";
      return `${sentiment} on “${item.question}” (${item.score}/100): ${limitWords(guidance, 40)}`;
    });
  };

  let summary;
  if (averageScore >= 85) {
    summary = `Excellent overall performance (${averageScore}/100). Keep leaning on the thoughtful structure you demonstrated in your strongest answers.`;
  } else if (averageScore >= 70) {
    summary = `Solid interview (${averageScore}/100). You covered the fundamentals—focus now on sharpening depth and measurable outcomes in every response.`;
  } else {
    summary = `Foundational performance (${averageScore}/100). Invest time in rehearsing structured responses and weaving in impact to boost confidence.`;
  }

  const topTopic = ordered[0];
  if (topTopic) {
    summary += ` Top highlight: “${topTopic.question}” scored ${topTopic.score}/100.`;
  }
  const lowestTopic = ordered[ordered.length - 1];
  if (lowestTopic && lowestTopic !== topTopic) {
    summary += ` Biggest opportunity: “${lowestTopic.question}” came in at ${lowestTopic.score}/100 — revisit that scenario with more structure.`;
  }

  return {
    summary,
    strengths: toBulletList(strengthsRaw, "Call out how you applied your strengths in at least one answer."),
    areas: toBulletList(
      improvementsRaw,
      "Focus on bringing in concrete examples, metrics, and reflections to lift your weaker answers.",
      false
    ),
    averageScore,
  };
};


/* -------------------------------------------------------------------------- */
/* 🧠 Universal Gemini Caller (Retry Logic + Fallback)                       */
/* -------------------------------------------------------------------------- */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callGemini = async (prompt) => {
  if (!genAI) throw new Error("Gemini API not configured");

  let lastErr;

  for (const modelName of MODEL_CANDIDATES) {
    // Retry logic for 429 (Rate Limit) on the same model before switching
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text) return text.trim();
        throw new Error(`No text output from ${modelName}`);

      } catch (err) {
        const msg = err?.message || String(err);

        // If 429 (Too Many Requests), wait and retry
        if (msg.includes("429") || msg.includes("Too Many Requests")) {
          console.warn(`429 on ${modelName}, retrying (${attempt + 1}/3)...`);
          await wait(2000 * (attempt + 1)); // Linear/Exponential backoff
          lastErr = err;
          continue; // Retry same model
        }

        // If 404 (Not Found) or other fatal errors, break to next model
        if (/not found|not supported|model/i.test(msg)) {
          // 404 means this model alias isn't valid, try next candidate immediately
          lastErr = err;
          break;
        }

        // Other errors? Break and try next model or fail
        lastErr = err;
        break;
      }
    }
  }

  console.error("All Gemini models/retries failed. Last error:", lastErr);
  throw lastErr || new Error("All Gemini models failed.");
};

/* -------------------------------------------------------------------------- */
/* 🧾 Resume Summarization                                                   */
/* -------------------------------------------------------------------------- */

const summarizeResumeText = async (rawText) => {
  const prompt = `
You are an expert resume reviewer.

Extract and summarize this resume in the following structure:

- Education: <highest degree, major, college name, year>
- Projects: <2–3 notable projects with tech stack and outcomes>
- Experience: <Key roles, company names, durations, responsibilities>
- Skills: <Relevant technical and soft skills>
- Achievements: <Awards or recognitions>

If something is missing, say "Not mentioned".
Resume:
"""
${rawText}
"""`;

  if (!genAI) return fallbackSummary(rawText);

  try {
    const summary = await callGemini(prompt);
    return summary;
  } catch (err) {
    console.error("Resume summarization failed:", err?.message || err);
    return fallbackSummary(rawText);
  }
};

/* -------------------------------------------------------------------------- */
/* 🎯 Question Generation                                                    */
/* -------------------------------------------------------------------------- */

const generateQuestions = async ({
  num_of_questions,
  interview_type,
  role,
  experience_level,
  company_name,
  company_description,
  job_description,
  focus_area,
}) => {
  const prompt = `
You are an experienced interviewer.

Generate ${num_of_questions} unique ${interview_type || "mixed"} interview questions 
for a ${experience_level || "professional"} ${role || "candidate"} at ${company_name || "a company"}.

Reference:
- Job Description: ${job_description || "N/A"}
- Focus Area: ${focus_area || "N/A"}

Format:
1. [Question]
Preferred Answer: [Answer]
`;

  if (!genAI) return fallbackQuestions({ num_of_questions, interview_type, role, experience_level, company_name, focus_area, job_description });

  try {
    const generatedText = await callGemini(prompt);

    // Parse logic
    const questions = [];
    const lines = generatedText.split("\n");
    let currentQuestion = null;
    let collectingAnswer = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (/^\d+\.\s/.test(line)) {
        if (currentQuestion && currentQuestion.preferred_answer) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line.replace(/^\d+\.\s/, "").trim(),
          preferred_answer: "",
        };
        collectingAnswer = true;
      } else if (collectingAnswer && line.startsWith("Preferred Answer:")) {
        currentQuestion.preferred_answer = line
          .replace("Preferred Answer:", "")
          .trim();
        collectingAnswer = false;
      } else if (
        collectingAnswer &&
        currentQuestion &&
        !currentQuestion.preferred_answer &&
        line.trim()
      ) {
        currentQuestion.preferred_answer += (currentQuestion.preferred_answer
          ? " "
          : "") + line.trim();
      }

      if (
        questions.length === num_of_questions - 1 &&
        currentQuestion &&
        currentQuestion.preferred_answer
      ) {
        questions.push(currentQuestion);
        break;
      }
    }

    if (currentQuestion && !questions.includes(currentQuestion) && currentQuestion.preferred_answer) {
      questions.push(currentQuestion);
    }

    if (questions.length === 0) throw new Error("No parsed questions");
    return questions;

  } catch (err) {
    console.error("Question generation failed:", err?.message || err);
    return fallbackQuestions({ num_of_questions, interview_type, role, experience_level, company_name, focus_area, job_description });
  }
};

/* -------------------------------------------------------------------------- */
/* 📝 Answer Analysis                                                        */
/* -------------------------------------------------------------------------- */

const analyzeAnswer = async ({ question, userAnswer, preferredAnswer, role, experience_level, interview_type }) => {
  const prompt = `
  You are an expert interviewer. Evaluate the candidate's answer for the following question.

  Question: "${question}"
  Candidate Answer: "${userAnswer}"
  Ideal Answer / Key Points: "${preferredAnswer}"
  Context: Role: ${role}, Level: ${experience_level}, Type: ${interview_type}

  Instructions:
  1. Score the answer from 0 to 100.
  2. If the answer is blank, "I don't know", "skip", or completely irrelevant, Score must be 0.
  3. Provide constructive Feedback (max 2 sentences).

  Output format:
  Score: <number>
  Feedback: <text>
  `;

  if (!genAI) return fallbackScore({ userAnswer, preferredAnswer });

  try {
    const text = await callGemini(prompt);

    // Parse using regex for robustness
    const scoreMatch = text.match(/Score:\s*(\d+)/i);
    const feedbackMatch = text.match(/Feedback:\s*([\s\S]+)/i);

    let score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
    let feedback = feedbackMatch ? feedbackMatch[1].trim() : text;

    if (score === null) {
      if (!userAnswer || userAnswer.length < 5 || /don'?t know|skip|pass/i.test(userAnswer)) {
        score = 0;
      } else {
        score = fallbackScore({ userAnswer, preferredAnswer }).score;
      }
    }

    return { score, feedback };
  } catch (err) {
    console.error("Analysis failed:", err);
    return fallbackScore({ userAnswer, preferredAnswer });
  }
};

/* -------------------------------------------------------------------------- */
/* 📊 Interview Summary                                                      */
/* -------------------------------------------------------------------------- */

const interviewSummary = async (allAnswers = []) => {
  if (!genAI) {
    const insights = buildInterviewInsights(allAnswers);
    return `**Overall Summary:**\n${insights.summary}\n\n**Strengths:**\n- ${insights.strengths.join("\n- ")}\n\n**Areas of Improvement:**\n- ${insights.areas.join("\n- ")}`;
  }

  try {
    const summaryPrompt = `
    Analyze these interview question scores and logic.
    Scores: ${allAnswers.map(a => `Q: ${limitWords(a.question, 10)}... | Score: ${a.score} | Feedback: ${limitWords(a.feedback, 15)}...`).join("\n")}
    
    Generate a markdown summary with exactly these 3 sections headers:
    **Overall Summary:** (3 sentences on performance)
    **Strengths:** (Bullet points of key strong areas)
    **Areas of Improvement:** (Bullet points of weak areas)
    `;

    const generatedSummary = await callGemini(summaryPrompt);

    if (generatedSummary && generatedSummary.includes("**Strengths:**") && generatedSummary.includes("**Areas of Improvement:**")) {
      return generatedSummary;
    }

    const insights = buildInterviewInsights(allAnswers);
    return `**Overall Summary:**\n${insights.summary}\n\n**Strengths:**\n- ${insights.strengths.join("\n- ")}\n\n**Areas of Improvement:**\n- ${insights.areas.join("\n- ")}`;

  } catch (err) {
    const insights = buildInterviewInsights(allAnswers);
    return `**Overall Summary:**\n${insights.summary}\n\n**Strengths:**\n- ${insights.strengths.join("\n- ")}\n\n**Areas of Improvement:**\n- ${insights.areas.join("\n- ")}`;
  }
};

export { summarizeResumeText, generateQuestions, analyzeAnswer, interviewSummary, buildInterviewInsights };
