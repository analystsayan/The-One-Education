/** Catalog controllers — parse input, call the service, send JSON. */
const catalog = require('../services/catalog.service');
const ApiError = require('../utils/ApiError');

const intOrNull = v => {
  const n = parseInt(v, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const require_ = (value, name) => {
  const n = intOrNull(value);
  if (!n) throw ApiError.badRequest(`${name} is required and must be a positive number.`);
  return n;
};

exports.getCategories = async (req, res) => {
  res.json(await catalog.listCategories());
};

exports.getOrganizations = async (req, res) => {
  const categoryId = require_(req.query.category_id, 'category_id');
  res.json(await catalog.listOrganizations(categoryId));
};

exports.getExams = async (req, res) => {
  const organizationId = require_(req.query.organization_id, 'organization_id');
  res.json(await catalog.listExams(organizationId));
};

exports.getStages = async (req, res) => {
  const examId = require_(req.query.exam_id, 'exam_id');
  res.json(await catalog.listStages(examId));
};

exports.getSubjects = async (req, res) => {
  const examId = require_(req.query.exam_id, 'exam_id');
  res.json(await catalog.listSubjects(examId));
};

exports.getTopics = async (req, res) => {
  const examId = require_(req.query.exam_id, 'exam_id');
  const subjectId = require_(req.query.subject_id, 'subject_id');
  res.json(await catalog.listTopics(examId, subjectId));
};
