/**
 * Catalog service — every read against the exam catalogue lives here.
 * Controllers stay thin; SQL never leaks into route files.
 */
const { pool } = require('../db/pool');
const ApiError = require('../utils/ApiError');

async function listCategories() {
  const [rows] = await pool.query(
    `SELECT id, name, slug
       FROM categories
      WHERE is_active = 1
      ORDER BY display_order, name`
  );
  return rows;
}

async function listOrganizations(categoryId) {
  const [rows] = await pool.query(
    `SELECT id, short_name AS name, name AS full_name, slug
       FROM organizations
      WHERE category_id = ? AND is_active = 1
      ORDER BY display_order, short_name`,
    [categoryId]
  );
  return rows;
}

async function listExams(organizationId) {
  const [rows] = await pool.query(
    `SELECT e.id, e.name, e.slug,
            (SELECT COUNT(*) FROM exams c
              WHERE c.parent_exam_id = e.id AND c.is_active = 1) AS has_stages
       FROM exams e
      WHERE e.organization_id = ?
        AND e.parent_exam_id IS NULL
        AND e.is_active = 1
      ORDER BY e.display_order, e.name`,
    [organizationId]
  );
  return rows;
}

async function listStages(examId) {
  const [rows] = await pool.query(
    `SELECT id, name, slug
       FROM exams
      WHERE parent_exam_id = ? AND is_active = 1
      ORDER BY display_order, name`,
    [examId]
  );
  return rows;
}

async function listSubjects(examId) {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.slug
       FROM exam_subjects es
       JOIN subjects s ON s.id = es.subject_id
      WHERE es.exam_id = ? AND s.is_active = 1
      ORDER BY es.display_order, s.name`,
    [examId]
  );
  return rows;
}

async function listTopics(examId, subjectId) {
  const [rows] = await pool.query(
    `SELECT t.id, t.name, t.slug
       FROM exam_subject_topics est
       JOIN topics t ON t.id = est.topic_id
      WHERE est.exam_id = ? AND est.subject_id = ? AND t.is_active = 1
      ORDER BY est.display_order, t.name`,
    [examId, subjectId]
  );
  return rows;
}

/**
 * Resolves what a quiz should cover.
 *
 * Subject and topic are both optional, which is what makes whole-exam and
 * whole-subject practice possible:
 *   exam only             → every topic of every subject in that exam
 *   exam + subject        → every topic of that subject
 *   exam + subject + topic → that one topic
 *
 * Returns exam metadata plus the flat list of topics in scope.
 */
async function resolveScope({ examId, subjectId = null, topicId = null }) {
  const [examRows] = await pool.query(
    `SELECT e.id, e.name AS exam_name, p.name AS parent_exam_name,
            o.short_name AS organization_name, c.name AS category_name
       FROM exams e
       LEFT JOIN exams p    ON p.id = e.parent_exam_id
       JOIN organizations o ON o.id = e.organization_id
       JOIN categories c    ON c.id = o.category_id
      WHERE e.id = ? AND e.is_active = 1
      LIMIT 1`,
    [examId]
  );

  if (examRows.length === 0) throw ApiError.badRequest('That exam does not exist.');
  const exam = examRows[0];

  const params = [examId];
  let where = 'est.exam_id = ?';

  if (subjectId) {
    where += ' AND est.subject_id = ?';
    params.push(subjectId);
  }
  if (topicId) {
    where += ' AND est.topic_id = ?';
    params.push(topicId);
  }

  const [topics] = await pool.query(
    `SELECT t.id AS topic_id, t.name AS topic_name,
            s.id AS subject_id, s.name AS subject_name
       FROM exam_subject_topics est
       JOIN topics t   ON t.id = est.topic_id
       JOIN subjects s ON s.id = est.subject_id
      WHERE ${where} AND t.is_active = 1 AND s.is_active = 1
      ORDER BY est.display_order, t.name`,
    params
  );

  if (topics.length === 0) {
    throw ApiError.badRequest('No topics found for that selection.');
  }

  const fullExamName = exam.parent_exam_name
    ? `${exam.parent_exam_name} — ${exam.exam_name}`
    : exam.exam_name;

  // A human-readable label describing how wide the quiz is.
  let scopeLabel;
  if (topicId)        scopeLabel = topics[0].topic_name;
  else if (subjectId) scopeLabel = `${topics[0].subject_name} — all topics`;
  else                scopeLabel = 'Full syllabus — all subjects';

  return {
    exam: {
      id: exam.id,
      name: fullExamName,
      organization: exam.organization_name,
      category: exam.category_name
    },
    scopeLabel,
    subjectName: subjectId ? topics[0].subject_name : null,
    topicName:   topicId ? topics[0].topic_name : null,
    topics
  };
}

module.exports = {
  listCategories,
  listOrganizations,
  listExams,
  listStages,
  listSubjects,
  listTopics,
  resolveScope
};
