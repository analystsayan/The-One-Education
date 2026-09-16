/** Quiz controller. */
const quizService = require('../services/quiz.service');
const { config } = require('../config');
const ApiError = require('../utils/ApiError');

exports.generate = async (req, res) => {
  const examId = parseInt(req.body.exam_id, 10);
  if (!Number.isInteger(examId) || examId <= 0) {
    throw ApiError.badRequest('Please choose an exam.');
  }

  // Subject and topic are optional — that's what enables whole-exam practice.
  const subjectId = parseInt(req.body.subject_id, 10) || null;
  const topicId   = parseInt(req.body.topic_id, 10) || null;

  if (topicId && !subjectId) {
    throw ApiError.badRequest('A topic cannot be chosen without a subject.');
  }

  const result = await quizService.generateQuiz({
    examId,
    subjectId,
    topicId,
    level: req.body.level,
    count: parseInt(req.body.count, 10)
  });

  res.json(result);
};

/** Lets the frontend render the option buttons from server config. */
exports.getOptions = async (req, res) => {
  res.json({
    levels: config.quiz.allowedLevels,
    counts: config.quiz.allowedCounts
  });
};
