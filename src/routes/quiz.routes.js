const router = require('express').Router();
const asyncHandler = require('../middleware/asyncHandler');
const c = require('../controllers/quiz.controller');

router.get('/options',   asyncHandler(c.getOptions));
router.post('/generate', asyncHandler(c.generate));

module.exports = router;
