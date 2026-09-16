/**
 * Quiz service.
 *
 * Builds a full paper (50–200 questions) by splitting the work into batches,
 * spreading the topics across those batches, and merging the results.
 *
 * Answers are returned to the browser WITH the questions. Marking happens
 * client-side with no further network calls — a 200-question paper costs
 * zero API requests to grade.
 */
const { config } = require('../config');
const catalog = require('./catalog.service');
const gemini = require('./gemini.service');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/** Fisher-Yates. Used for question order and topic rotation. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Splits a total into batches of at most `size`. 200 → [25 × 8] */
function splitIntoBatches(total, size) {
  const batches = [];
  let left = total;
  while (left > 0) {
    batches.push(Math.min(size, left));
    left -= size;
  }
  return batches;
}

/**
 * Gives each batch its own slice of topics, rotating through the full list so
 * every topic gets covered rather than the first few dominating.
 */
function assignTopics(topics, batchCount) {
  const pool = shuffle(topics);
  const perBatch = Math.max(1, Math.ceil(pool.length / batchCount));
  const assignments = [];

  for (let i = 0; i < batchCount; i++) {
    const slice = [];
    for (let j = 0; j < perBatch; j++) {
      slice.push(pool[(i * perBatch + j) % pool.length]);
    }
    // De-duplicate in case the list is shorter than the batch count.
    assignments.push([...new Map(slice.map(t => [t.topic_id, t])).values()]);
  }
  return assignments;
}

function buildSystemPrompt({ exam, level, topics, count }) {
  const topicLines = topics
    .map(t => `- ${t.subject_name} › ${t.topic_name}`)
    .join('\n');

  return `You are a senior question setter for Indian competitive and recruitment exams.

EXAM: ${exam.name}
CONDUCTING BODY: ${exam.organization} (${exam.category} sector)
DIFFICULTY: ${level}

Write exactly ${count} multiple-choice questions spread across these topics:
${topicLines}

Rules:
- Match the real style, pattern and difficulty of this specific exam.
- Distribute the questions as evenly as you can across the listed topics.
- Exactly 4 options per question, exactly one correct.
- Options must be plausible; wrong answers should reflect common mistakes.
- Keep each explanation to one clear sentence.
- Do not repeat a question or reuse the same numbers twice.

Respond with ONLY a raw JSON array — no markdown, no preamble:
[{"question":"...","options":["a","b","c","d"],"answer":0,"explanation":"...","topic":"topic name"}]
"answer" is the zero-based index of the correct option.`;
}

/** Keeps only well-formed questions. Guards against a malformed model reply. */
function sanitize(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(q =>
      q &&
      typeof q.question === 'string' && q.question.trim().length > 0 &&
      Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every(o => typeof o === 'string' && o.trim().length > 0) &&
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3
    )
    .map(q => ({
      question: q.question.trim(),
      options: q.options.map(o => String(o).trim()),
      answer: q.answer,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
      topic: typeof q.topic === 'string' ? q.topic.trim() : ''
    }));
}

/** Drops near-identical questions that different batches may both produce. */
function dedupe(questions) {
  const seen = new Set();
  return questions.filter(q => {
    const key = q.question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Runs tasks with a concurrency cap so free-tier rate limits aren't tripped. */
async function runPooled(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker)
  );
  return results;
}

/**
 * Generates a complete quiz.
 * @param {{examId:number, subjectId?:number, topicId?:number, level:string, count:number}} input
 */
async function generateQuiz({ examId, subjectId, topicId, level, count }) {
  if (!config.quiz.allowedLevels.includes(level)) {
    throw ApiError.badRequest('Invalid difficulty level.');
  }
  if (!config.quiz.allowedCounts.includes(count)) {
    throw ApiError.badRequest(
      `Question count must be one of: ${config.quiz.allowedCounts.join(', ')}`
    );
  }

  const scope = await catalog.resolveScope({ examId, subjectId, topicId });

  const batchSizes = splitIntoBatches(count, config.quiz.batchSize);
  const topicSlices = assignTopics(scope.topics, batchSizes.length);

  logger.info(
    `Generating ${count} questions for "${scope.exam.name}" ` +
    `(${scope.scopeLabel}, ${level}) in ${batchSizes.length} batches ` +
    `across ${scope.topics.length} topics`
  );

  const tasks = batchSizes.map((size, i) => async () => {
    const systemPrompt = buildSystemPrompt({
      exam: scope.exam,
      level,
      topics: topicSlices[i],
      count: size
    });
    try {
      const raw = await gemini.generateJson(
        systemPrompt,
        `Generate the ${size} questions now as the JSON array described. Set ${i + 1} of ${batchSizes.length} — make them different from any typical set.`
      );
      return sanitize(raw);
    } catch (err) {
      // One failed batch shouldn't lose the whole paper.
      logger.warn(`Batch ${i + 1}/${batchSizes.length} failed:`, err.message);
      return { __error: err };
    }
  });

  const settled = await runPooled(tasks, config.quiz.batchConcurrency);

  const batchResults = settled.filter(r => !r.__error);
  const failures = settled.filter(r => r.__error);

  if (batchResults.length === 0) {
    // Everything failed — surface the first real reason (often a rate limit).
    throw failures[0].__error;
  }

  let questions = dedupe(batchResults.flat());
  questions = shuffle(questions).slice(0, count);

  if (questions.length === 0) {
    throw ApiError.upstream('No valid questions were generated. Please try again.');
  }

  // Stable ids let the client track answers without relying on array position.
  questions = questions.map((q, i) => ({ id: i + 1, ...q }));

  return {
    questions,
    meta: {
      organization: scope.exam.organization,
      exam: scope.exam.name,
      subject: scope.subjectName,
      topic: scope.topicName,
      scope: scope.scopeLabel,
      level,
      requested: count,
      delivered: questions.length,
      partial: questions.length < count
    }
  };
}

module.exports = { generateQuiz };
