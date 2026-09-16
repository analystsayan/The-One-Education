-- =====================================================================
--  AI MCQ Generator — Dropdown Queries
--  One query per dropdown. Each takes the previous selection as input.
--  '?' marks a bound parameter (never concatenate values into SQL).
-- =====================================================================
USE mcq_app;

-- ---------------------------------------------------------------------
-- DROPDOWN 1: Category  (Government / Private)
-- ---------------------------------------------------------------------
SELECT id, name, slug
FROM categories
WHERE is_active = 1
ORDER BY display_order, name;


-- ---------------------------------------------------------------------
-- DROPDOWN 2: Organization  — depends on category
-- ---------------------------------------------------------------------
SELECT id, short_name AS name, name AS full_name, slug
FROM organizations
WHERE category_id = ? AND is_active = 1
ORDER BY display_order, short_name;


-- ---------------------------------------------------------------------
-- DROPDOWN 3: Exam  — depends on organization.
-- Only TOP-LEVEL exams (parent_exam_id IS NULL).
-- has_stages tells the frontend whether to render dropdown 3b.
-- ---------------------------------------------------------------------
SELECT
  e.id, e.name, e.slug,
  (SELECT COUNT(*) FROM exams c
    WHERE c.parent_exam_id = e.id AND c.is_active = 1) AS has_stages
FROM exams e
WHERE e.organization_id = ?
  AND e.parent_exam_id IS NULL
  AND e.is_active = 1
ORDER BY e.display_order, e.name;


-- ---------------------------------------------------------------------
-- DROPDOWN 3b (OPTIONAL): Stage / Tier — only if has_stages > 0
-- This is the dropdown that makes the chain 5 long instead of 4.
-- ---------------------------------------------------------------------
SELECT id, name, slug
FROM exams
WHERE parent_exam_id = ? AND is_active = 1
ORDER BY display_order, name;


-- ---------------------------------------------------------------------
-- DROPDOWN 4: Subject — depends on the FINAL exam id chosen
-- (either the top-level exam, or the stage if one was picked)
-- ---------------------------------------------------------------------
SELECT s.id, s.name, s.slug
FROM exam_subjects es
JOIN subjects s ON s.id = es.subject_id
WHERE es.exam_id = ? AND s.is_active = 1
ORDER BY es.display_order, s.name;


-- ---------------------------------------------------------------------
-- DROPDOWN 5: Topic — depends on exam AND subject
-- ---------------------------------------------------------------------
SELECT t.id, t.name, t.slug
FROM exam_subject_topics est
JOIN topics t ON t.id = est.topic_id
WHERE est.exam_id = ? AND est.subject_id = ? AND t.is_active = 1
ORDER BY est.display_order, t.name;


-- =====================================================================
--  ONE-SHOT ALTERNATIVE
--  If you'd rather load the whole tree once on page load and do the
--  cascading in JavaScript (fast, no repeated DB round-trips), use this:
-- =====================================================================
SELECT
  category_id, category_name,
  organization_id, organization_name,
  exam_id, exam_name, parent_exam_id,
  subject_id, subject_name,
  topic_id, topic_name
FROM v_full_syllabus
ORDER BY category_id, organization_id, exam_id, subject_id, topic_id;


-- =====================================================================
--  USEFUL CHECKS
-- =====================================================================

-- Row counts across the catalogue
SELECT 'categories' AS tbl, COUNT(*) AS rows_count FROM categories
UNION ALL SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL SELECT 'exams',         COUNT(*) FROM exams
UNION ALL SELECT 'subjects',      COUNT(*) FROM subjects
UNION ALL SELECT 'topics',        COUNT(*) FROM topics
UNION ALL SELECT 'exam_subjects', COUNT(*) FROM exam_subjects
UNION ALL SELECT 'exam_subject_topics', COUNT(*) FROM exam_subject_topics;

-- Any exam missing subjects? (should return nothing)
SELECT e.id, e.name
FROM exams e
LEFT JOIN exam_subjects es ON es.exam_id = e.id
WHERE es.exam_id IS NULL;

-- Full syllabus for one exam, human-readable
SELECT subject_name, topic_name
FROM v_full_syllabus
WHERE exam_slug = 'ssc-cgl-tier-1'
ORDER BY subject_name, topic_name;
