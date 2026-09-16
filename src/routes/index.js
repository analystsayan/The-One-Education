/** Mounts every API route group under /api */
const router = require('express').Router();
const { config } = require('../config');

router.get('/health', (req, res) => res.json({ ok: true, site: config.site.name }));
router.get('/site',   (req, res) => res.json(config.site));

router.use('/catalog', require('./catalog.routes'));
router.use('/quiz',    require('./quiz.routes'));

module.exports = router;
