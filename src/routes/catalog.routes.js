const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const c = require('../controllers/catalog.controller');

router.get('/categories',    asyncHandler(c.getCategories));
router.get('/organizations', asyncHandler(c.getOrganizations));
router.get('/exams',         asyncHandler(c.getExams));
router.get('/exam-stages',   asyncHandler(c.getStages));
router.get('/subjects',      asyncHandler(c.getSubjects));
router.get('/topics',        asyncHandler(c.getTopics));

module.exports = router;
