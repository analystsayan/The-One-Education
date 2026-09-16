-- =====================================================================
--  AI MCQ Generator — Exam Catalogue Schema (MySQL 8.0+)
--  Hierarchy:  Category → Organization → Exam → Subject → Topic
-- =====================================================================

DROP DATABASE IF EXISTS mcq_app;
CREATE DATABASE mcq_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE mcq_app;


-- ---------------------------------------------------------------------
-- 1. CATEGORIES  — the top level: Government / Private
-- ---------------------------------------------------------------------
CREATE TABLE categories (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80)  NOT NULL,
  slug         VARCHAR(80)  NOT NULL,
  display_order SMALLINT    NOT NULL DEFAULT 0,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 2. ORGANIZATIONS — SSC, RRB, Indian Navy, TCS, Infosys ...
-- ---------------------------------------------------------------------
CREATE TABLE organizations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id   INT UNSIGNED NOT NULL,
  name          VARCHAR(150) NOT NULL,   -- 'Staff Selection Commission'
  short_name    VARCHAR(40)  NOT NULL,   -- 'SSC'  (what the dropdown shows)
  slug          VARCHAR(80)  NOT NULL,
  display_order SMALLINT     NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_org_slug (slug),
  KEY idx_org_category (category_id, is_active, display_order),
  CONSTRAINT fk_org_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 3. EXAMS — 'SSC CGL', 'RRB NTPC', 'TCS NQT' ...
--    parent_exam_id supports tiers/phases: 'SSC CGL' → 'SSC CGL Tier 1'
--    This is what lets the UI show a 4th or 5th dropdown ONLY when the
--    selected exam actually has sub-stages.
-- ---------------------------------------------------------------------
CREATE TABLE exams (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id INT UNSIGNED NOT NULL,
  parent_exam_id  INT UNSIGNED NULL,      -- NULL = top-level exam
  name            VARCHAR(150) NOT NULL,
  slug            VARCHAR(120) NOT NULL,
  description     VARCHAR(255) NULL,
  display_order   SMALLINT     NOT NULL DEFAULT 0,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_exam_slug (slug),
  KEY idx_exam_org (organization_id, is_active, display_order),
  KEY idx_exam_parent (parent_exam_id),
  CONSTRAINT fk_exam_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_parent FOREIGN KEY (parent_exam_id)
    REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 4. SUBJECTS — a shared master list.
--    'English' is ONE row, reused by SSC CGL, RRB NTPC, IBPS PO, etc.
--    Avoids duplicating the same subject hundreds of times.
-- ---------------------------------------------------------------------
CREATE TABLE subjects (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  slug       VARCHAR(120) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_subject_slug (slug)
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 5. TOPICS — belong to a subject. Also a shared master list.
-- ---------------------------------------------------------------------
CREATE TABLE topics (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT UNSIGNED NOT NULL,
  name          VARCHAR(150) NOT NULL,
  slug          VARCHAR(150) NOT NULL,
  display_order SMALLINT     NOT NULL DEFAULT 0,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_topic_slug (subject_id, slug),
  KEY idx_topic_subject (subject_id, is_active, display_order),
  CONSTRAINT fk_topic_subject FOREIGN KEY (subject_id)
    REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 6. EXAM_SUBJECTS — which subjects appear in which exam (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE exam_subjects (
  exam_id       INT UNSIGNED NOT NULL,
  subject_id    INT UNSIGNED NOT NULL,
  display_order SMALLINT     NOT NULL DEFAULT 0,
  total_marks   SMALLINT     NULL,   -- optional: exam-specific weightage
  total_questions SMALLINT   NULL,
  PRIMARY KEY (exam_id, subject_id),
  KEY idx_es_subject (subject_id),
  CONSTRAINT fk_es_exam FOREIGN KEY (exam_id)
    REFERENCES exams(id) ON DELETE CASCADE,
  CONSTRAINT fk_es_subject FOREIGN KEY (subject_id)
    REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 7. EXAM_SUBJECT_TOPICS — which topics are in scope for THIS exam's
--    version of THIS subject.
--    Why this table exists: 'English' in SSC CGL includes 'Cloze Test',
--    but 'English' in an Indian Navy exam may not. Same subject, a
--    different syllabus. This table stores that difference.
-- ---------------------------------------------------------------------
CREATE TABLE exam_subject_topics (
  exam_id       INT UNSIGNED NOT NULL,
  subject_id    INT UNSIGNED NOT NULL,
  topic_id      INT UNSIGNED NOT NULL,
  display_order SMALLINT     NOT NULL DEFAULT 0,
  PRIMARY KEY (exam_id, subject_id, topic_id),
  KEY idx_est_topic (topic_id),
  CONSTRAINT fk_est_es FOREIGN KEY (exam_id, subject_id)
    REFERENCES exam_subjects(exam_id, subject_id) ON DELETE CASCADE,
  CONSTRAINT fk_est_topic FOREIGN KEY (topic_id)
    REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ---------------------------------------------------------------------
-- 8. VIEWS — convenience for the API layer
-- ---------------------------------------------------------------------

-- Full flattened syllabus: one row per category→org→exam→subject→topic
CREATE OR REPLACE VIEW v_full_syllabus AS
SELECT
  c.id   AS category_id,   c.name  AS category_name,  c.slug AS category_slug,
  o.id   AS organization_id, o.short_name AS organization_name, o.slug AS organization_slug,
  e.id   AS exam_id,       e.name  AS exam_name,      e.slug AS exam_slug,
  e.parent_exam_id,
  s.id   AS subject_id,    s.name  AS subject_name,   s.slug AS subject_slug,
  t.id   AS topic_id,      t.name  AS topic_name,     t.slug AS topic_slug
FROM categories c
JOIN organizations o        ON o.category_id = c.id
JOIN exams e                ON e.organization_id = o.id
JOIN exam_subjects es       ON es.exam_id = e.id
JOIN subjects s             ON s.id = es.subject_id
JOIN exam_subject_topics est ON est.exam_id = e.id AND est.subject_id = s.id
JOIN topics t               ON t.id = est.topic_id
WHERE c.is_active = 1 AND o.is_active = 1 AND e.is_active = 1
  AND s.is_active = 1 AND t.is_active = 1;


-- Tells the UI whether an exam has sub-stages (→ show an extra dropdown)
CREATE OR REPLACE VIEW v_exam_has_children AS
SELECT
  e.id AS exam_id,
  e.name AS exam_name,
  (SELECT COUNT(*) FROM exams c WHERE c.parent_exam_id = e.id AND c.is_active = 1) AS child_count
FROM exams e
WHERE e.is_active = 1;
