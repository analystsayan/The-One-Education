-- =====================================================================
--  AI MCQ Generator — Seed Data
--  Run AFTER 01_schema.sql
-- =====================================================================
USE mcq_app;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE exam_subject_topics;
TRUNCATE TABLE exam_subjects;
TRUNCATE TABLE topics;
TRUNCATE TABLE subjects;
TRUNCATE TABLE exams;
TRUNCATE TABLE organizations;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;


-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
INSERT INTO categories (id, name, slug, display_order) VALUES
 (1, 'Government', 'government', 1),
 (2, 'Private',    'private',    2);


-- ---------------------------------------------------------------------
-- ORGANIZATIONS
-- ---------------------------------------------------------------------
INSERT INTO organizations (id, category_id, name, short_name, slug, display_order) VALUES
 -- Government
 (1,  1, 'Staff Selection Commission',                  'SSC',            'ssc',            1),
 (2,  1, 'Railway Recruitment Board',                   'RRB',            'rrb',            2),
 (3,  1, 'Institute of Banking Personnel Selection',    'IBPS',           'ibps',           3),
 (4,  1, 'Union Public Service Commission',             'UPSC',           'upsc',           4),
 (5,  1, 'Indian Navy',                                 'Indian Navy',    'indian-navy',    5),
 (6,  1, 'Indian Army',                                 'Indian Army',    'indian-army',    6),
 (7,  1, 'Indian Air Force',                            'Indian Air Force','indian-air-force',7),
 (8,  1, 'State Bank of India',                         'SBI',            'sbi',            8),
 (9,  1, 'Life Insurance Corporation of India',         'LIC',            'lic',            9),
 (10, 1, 'State Public Service Commission',             'State PSC',      'state-psc',      10),
 (11, 1, 'Delhi Police',                                'Delhi Police',   'delhi-police',   11),
 -- Private
 (12, 2, 'Tata Consultancy Services',                   'TCS',            'tcs',            1),
 (13, 2, 'Infosys',                                     'Infosys',        'infosys',        2),
 (14, 2, 'Wipro',                                       'Wipro',          'wipro',          3),
 (15, 2, 'Cognizant',                                   'Cognizant',      'cognizant',      4),
 (16, 2, 'Accenture',                                   'Accenture',      'accenture',      5),
 (17, 2, 'Capgemini',                                   'Capgemini',      'capgemini',      6),
 (18, 2, 'HCLTech',                                     'HCLTech',        'hcltech',        7);


-- ---------------------------------------------------------------------
-- EXAMS  (parent_exam_id = NULL means top-level)
-- ---------------------------------------------------------------------
INSERT INTO exams (id, organization_id, parent_exam_id, name, slug, display_order) VALUES
 -- SSC
 (1,  1, NULL, 'SSC CGL',                    'ssc-cgl',                 1),
 (2,  1, 1,    'SSC CGL Tier 1',             'ssc-cgl-tier-1',          1),
 (3,  1, 1,    'SSC CGL Tier 2',             'ssc-cgl-tier-2',          2),
 (4,  1, NULL, 'SSC CHSL',                   'ssc-chsl',                2),
 (5,  1, 4,    'SSC CHSL Tier 1',            'ssc-chsl-tier-1',         1),
 (6,  1, 4,    'SSC CHSL Tier 2',            'ssc-chsl-tier-2',         2),
 (7,  1, NULL, 'SSC MTS',                    'ssc-mts',                 3),
 (8,  1, NULL, 'SSC CPO',                    'ssc-cpo',                 4),
 (9,  1, NULL, 'SSC GD Constable',           'ssc-gd-constable',        5),
 (10, 1, NULL, 'SSC JE',                     'ssc-je',                  6),
 (11, 1, NULL, 'SSC Stenographer',           'ssc-stenographer',        7),
 -- RRB
 (12, 2, NULL, 'RRB NTPC',                   'rrb-ntpc',                1),
 (13, 2, 12,   'RRB NTPC CBT 1',             'rrb-ntpc-cbt-1',          1),
 (14, 2, 12,   'RRB NTPC CBT 2',             'rrb-ntpc-cbt-2',          2),
 (15, 2, NULL, 'RRB Group D',                'rrb-group-d',             2),
 (16, 2, NULL, 'RRB ALP',                    'rrb-alp',                 3),
 (17, 2, NULL, 'RRB JE',                     'rrb-je',                  4),
 (18, 2, NULL, 'RRB RPF Constable',          'rrb-rpf-constable',       5),
 -- IBPS
 (19, 3, NULL, 'IBPS PO',                    'ibps-po',                 1),
 (20, 3, 19,   'IBPS PO Prelims',            'ibps-po-prelims',         1),
 (21, 3, 19,   'IBPS PO Mains',              'ibps-po-mains',           2),
 (22, 3, NULL, 'IBPS Clerk',                 'ibps-clerk',              2),
 (23, 3, 22,   'IBPS Clerk Prelims',         'ibps-clerk-prelims',      1),
 (24, 3, 22,   'IBPS Clerk Mains',           'ibps-clerk-mains',        2),
 (25, 3, NULL, 'IBPS SO',                    'ibps-so',                 3),
 (26, 3, NULL, 'IBPS RRB Office Assistant',  'ibps-rrb-office-assistant',4),
 -- UPSC
 (27, 4, NULL, 'UPSC Civil Services Prelims','upsc-cse-prelims',        1),
 (28, 4, NULL, 'UPSC CDS',                   'upsc-cds',                2),
 (29, 4, NULL, 'UPSC NDA',                   'upsc-nda',                3),
 (30, 4, NULL, 'UPSC CAPF AC',               'upsc-capf-ac',            4),
 -- Indian Navy
 (31, 5, NULL, 'Navy Agniveer SSR',          'navy-agniveer-ssr',       1),
 (32, 5, NULL, 'Navy Agniveer MR',           'navy-agniveer-mr',        2),
 (33, 5, NULL, 'Navy INET',                  'navy-inet',               3),
 (34, 5, NULL, 'Navy Tradesman Mate',        'navy-tradesman-mate',     4),
 -- Indian Army
 (35, 6, NULL, 'Agniveer General Duty (GD)', 'agniveer-gd',             1),
 (36, 6, NULL, 'Agniveer Technical',         'agniveer-technical',      2),
 (37, 6, NULL, 'Agniveer Clerk / SKT',       'agniveer-clerk-skt',      3),
 (38, 6, NULL, 'Agniveer Tradesman',         'agniveer-tradesman',      4),
 -- Indian Air Force
 (39, 7, NULL, 'Agniveer Vayu',              'agniveer-vayu',           1),
 (40, 7, NULL, 'AFCAT',                      'afcat',                   2),
 (41, 7, NULL, 'Airmen Group X',             'airmen-group-x',          3),
 (42, 7, NULL, 'Airmen Group Y',             'airmen-group-y',          4),
 -- SBI
 (43, 8, NULL, 'SBI PO',                     'sbi-po',                  1),
 (44, 8, 43,   'SBI PO Prelims',             'sbi-po-prelims',          1),
 (45, 8, 43,   'SBI PO Mains',               'sbi-po-mains',            2),
 (46, 8, NULL, 'SBI Clerk',                  'sbi-clerk',               2),
 -- LIC
 (47, 9, NULL, 'LIC AAO',                    'lic-aao',                 1),
 (48, 9, NULL, 'LIC ADO',                    'lic-ado',                 2),
 -- State PSC
 (49, 10, NULL,'State PSC Prelims',          'state-psc-prelims',       1),
 (50, 10, NULL,'State PSC Mains',            'state-psc-mains',         2),
 -- Delhi Police
 (51, 11, NULL,'Delhi Police Constable',     'delhi-police-constable',  1),
 (52, 11, NULL,'Delhi Police Head Constable','delhi-police-head-constable',2),
 -- TCS
 (53, 12, NULL,'TCS NQT',                    'tcs-nqt',                 1),
 (54, 12, NULL,'TCS Digital',                'tcs-digital',             2),
 (55, 12, NULL,'TCS CodeVita',               'tcs-codevita',            3),
 -- Infosys
 (56, 13, NULL,'Infosys SP & DSE',           'infosys-sp-dse',          1),
 (57, 13, NULL,'Infosys Power Programmer',   'infosys-power-programmer',2),
 -- Wipro
 (58, 14, NULL,'Wipro Elite NTH',            'wipro-elite-nth',         1),
 (59, 14, NULL,'Wipro Turbo',                'wipro-turbo',             2),
 -- Cognizant
 (60, 15, NULL,'Cognizant GenC',             'cognizant-genc',          1),
 (61, 15, NULL,'Cognizant GenC Next',        'cognizant-genc-next',     2),
 -- Accenture
 (62, 16, NULL,'Accenture ASE',              'accenture-ase',           1),
 -- Capgemini
 (63, 17, NULL,'Capgemini Analyst',          'capgemini-analyst',       1),
 -- HCLTech
 (64, 18, NULL,'HCLTech TechBee',            'hcltech-techbee',         1);


-- ---------------------------------------------------------------------
-- SUBJECTS (shared master list)
-- ---------------------------------------------------------------------
INSERT INTO subjects (id, name, slug) VALUES
 (1,  'English Language',                 'english-language'),
 (2,  'Quantitative Aptitude',            'quantitative-aptitude'),
 (3,  'General Intelligence & Reasoning', 'general-intelligence-reasoning'),
 (4,  'General Awareness',                'general-awareness'),
 (5,  'General Science',                  'general-science'),
 (6,  'Computer Knowledge',               'computer-knowledge'),
 (7,  'Banking & Financial Awareness',    'banking-financial-awareness'),
 (8,  'Current Affairs',                  'current-affairs'),
 (9,  'Mathematics',                      'mathematics'),
 (10, 'Physics',                          'physics'),
 (11, 'Chemistry',                        'chemistry'),
 (12, 'Biology',                          'biology'),
 (13, 'Indian History',                   'indian-history'),
 (14, 'Indian Polity',                    'indian-polity'),
 (15, 'Geography',                        'geography'),
 (16, 'Indian Economy',                   'indian-economy'),
 (17, 'Verbal Ability',                   'verbal-ability'),
 (18, 'Logical Reasoning',                'logical-reasoning'),
 (19, 'Programming Fundamentals',         'programming-fundamentals'),
 (20, 'Data Structures & Algorithms',     'data-structures-algorithms'),
 (21, 'Database Management (DBMS)',       'dbms'),
 (22, 'Operating Systems',                'operating-systems'),
 (23, 'Computer Networks',                'computer-networks'),
 (24, 'Object Oriented Programming',      'oops'),
 (25, 'General Engineering — Civil',      'engineering-civil'),
 (26, 'General Engineering — Electrical', 'engineering-electrical'),
 (27, 'General Engineering — Mechanical', 'engineering-mechanical'),
 (28, 'Hindi Language',                   'hindi-language'),
 (29, 'Data Interpretation',              'data-interpretation'),
 (30, 'Static GK',                        'static-gk');


-- ---------------------------------------------------------------------
-- TOPICS
-- ---------------------------------------------------------------------
INSERT INTO topics (subject_id, name, slug, display_order) VALUES
 -- 1. English Language
 (1, 'Modal Verbs',                 'modal-verbs',              1),
 (1, 'Tenses',                      'tenses',                   2),
 (1, 'Subject-Verb Agreement',      'subject-verb-agreement',   3),
 (1, 'Active & Passive Voice',      'active-passive-voice',     4),
 (1, 'Direct & Indirect Speech',    'direct-indirect-speech',   5),
 (1, 'Articles & Prepositions',     'articles-prepositions',    6),
 (1, 'Idioms & Phrases',            'idioms-phrases',           7),
 (1, 'One Word Substitution',       'one-word-substitution',    8),
 (1, 'Synonyms & Antonyms',         'synonyms-antonyms',        9),
 (1, 'Spotting Errors',             'spotting-errors',         10),
 (1, 'Sentence Improvement',        'sentence-improvement',    11),
 (1, 'Cloze Test',                  'cloze-test',              12),
 (1, 'Para Jumbles',                'para-jumbles',            13),
 (1, 'Reading Comprehension',       'reading-comprehension',   14),
 (1, 'Spelling Correction',         'spelling-correction',     15),

 -- 2. Quantitative Aptitude
 (2, 'Number System',               'number-system',            1),
 (2, 'Simplification & Approximation','simplification',         2),
 (2, 'Percentage',                  'percentage',               3),
 (2, 'Profit & Loss',               'profit-loss',              4),
 (2, 'Simple Interest',             'simple-interest',          5),
 (2, 'Compound Interest',           'compound-interest',        6),
 (2, 'Ratio & Proportion',          'ratio-proportion',         7),
 (2, 'Average',                     'average',                  8),
 (2, 'Time & Work',                 'time-work',                9),
 (2, 'Time, Speed & Distance',      'time-speed-distance',     10),
 (2, 'Mixture & Alligation',        'mixture-alligation',      11),
 (2, 'Mensuration',                 'mensuration',             12),
 (2, 'Algebra',                     'algebra',                 13),
 (2, 'Geometry',                    'geometry',                14),
 (2, 'Trigonometry',                'trigonometry',            15),
 (2, 'Permutation & Combination',   'permutation-combination', 16),
 (2, 'Probability',                 'probability',             17),
 (2, 'Number Series',               'number-series',           18),

 -- 3. General Intelligence & Reasoning
 (3, 'Analogy',                     'analogy',                  1),
 (3, 'Classification / Odd One Out','classification',           2),
 (3, 'Series Completion',           'series-completion',        3),
 (3, 'Coding-Decoding',             'coding-decoding',          4),
 (3, 'Blood Relations',             'blood-relations',          5),
 (3, 'Direction Sense',             'direction-sense',          6),
 (3, 'Ranking & Order',             'ranking-order',            7),
 (3, 'Seating Arrangement',         'seating-arrangement',      8),
 (3, 'Puzzle',                      'puzzle',                   9),
 (3, 'Syllogism',                   'syllogism',               10),
 (3, 'Venn Diagram',                'venn-diagram',            11),
 (3, 'Statement & Conclusion',      'statement-conclusion',    12),
 (3, 'Inequality',                  'inequality',              13),
 (3, 'Mirror & Water Image',        'mirror-water-image',      14),
 (3, 'Paper Folding & Cutting',     'paper-folding-cutting',   15),
 (3, 'Non-Verbal Reasoning',        'non-verbal-reasoning',    16),

 -- 4. General Awareness
 (4, 'Indian History',              'ga-indian-history',        1),
 (4, 'Indian Polity',               'ga-indian-polity',         2),
 (4, 'Geography',                   'ga-geography',             3),
 (4, 'Indian Economy',              'ga-indian-economy',        4),
 (4, 'General Science',             'ga-general-science',       5),
 (4, 'Current Affairs',             'ga-current-affairs',       6),
 (4, 'Books & Authors',             'books-authors',            7),
 (4, 'Awards & Honours',            'awards-honours',           8),
 (4, 'Sports',                      'sports',                   9),
 (4, 'Important Days',              'important-days',          10),

 -- 5. General Science
 (5, 'Physics Basics',              'physics-basics',           1),
 (5, 'Chemistry Basics',            'chemistry-basics',         2),
 (5, 'Biology Basics',              'biology-basics',           3),
 (5, 'Human Body Systems',          'human-body-systems',       4),
 (5, 'Nutrition & Diseases',        'nutrition-diseases',       5),
 (5, 'Environment & Ecology',       'environment-ecology',      6),
 (5, 'Everyday Science',            'everyday-science',         7),
 (5, 'Science & Technology',        'science-technology',       8),

 -- 6. Computer Knowledge
 (6, 'Computer Fundamentals',       'computer-fundamentals',    1),
 (6, 'Input & Output Devices',      'input-output-devices',     2),
 (6, 'Memory & Storage',            'memory-storage',           3),
 (6, 'MS Word',                     'ms-word',                  4),
 (6, 'MS Excel',                    'ms-excel',                 5),
 (6, 'MS PowerPoint',               'ms-powerpoint',            6),
 (6, 'Operating System Basics',     'os-basics',                7),
 (6, 'Internet & Email',            'internet-email',           8),
 (6, 'Computer Networks Basics',    'networks-basics',          9),
 (6, 'Computer Security',           'computer-security',       10),
 (6, 'Shortcut Keys',               'shortcut-keys',           11),
 (6, 'Computer Abbreviations',      'computer-abbreviations',  12),

 -- 7. Banking & Financial Awareness
 (7, 'Banking Terminology',         'banking-terminology',      1),
 (7, 'RBI & Its Functions',         'rbi-functions',            2),
 (7, 'Monetary Policy',             'monetary-policy',          3),
 (7, 'Types of Banks',              'types-of-banks',           4),
 (7, 'Money Market & Capital Market','money-capital-market',    5),
 (7, 'Financial Institutions',      'financial-institutions',   6),
 (7, 'Government Schemes',          'government-schemes',       7),
 (7, 'Banking Abbreviations',       'banking-abbreviations',    8),
 (7, 'Insurance Basics',            'insurance-basics',         9),

 -- 8. Current Affairs
 (8, 'National Affairs',            'national-affairs',         1),
 (8, 'International Affairs',       'international-affairs',    2),
 (8, 'Economy & Business News',     'economy-business-news',    3),
 (8, 'Science & Tech News',         'science-tech-news',        4),
 (8, 'Sports News',                 'sports-news',              5),
 (8, 'Awards & Appointments',       'awards-appointments',      6),
 (8, 'Summits & Conferences',       'summits-conferences',      7),
 (8, 'Defence News',                'defence-news',             8),

 -- 9. Mathematics
 (9, 'Real Numbers',                'real-numbers',             1),
 (9, 'Polynomials',                 'polynomials',              2),
 (9, 'Linear Equations',            'linear-equations',         3),
 (9, 'Quadratic Equations',         'quadratic-equations',      4),
 (9, 'Arithmetic Progression',      'arithmetic-progression',   5),
 (9, 'Triangles',                   'triangles',                6),
 (9, 'Circles',                     'circles',                  7),
 (9, 'Coordinate Geometry',         'coordinate-geometry',      8),
 (9, 'Trigonometry',                'maths-trigonometry',       9),
 (9, 'Mensuration',                 'maths-mensuration',       10),
 (9, 'Statistics',                  'statistics',              11),
 (9, 'Probability',                 'maths-probability',       12),
 (9, 'Matrices & Determinants',     'matrices-determinants',   13),
 (9, 'Sets, Relations & Functions', 'sets-relations-functions',14),

 -- 10. Physics
 (10, 'Units & Measurements',       'units-measurements',       1),
 (10, 'Motion & Laws of Motion',    'motion-laws',              2),
 (10, 'Work, Energy & Power',       'work-energy-power',        3),
 (10, 'Gravitation',                'gravitation',              4),
 (10, 'Heat & Thermodynamics',      'heat-thermodynamics',      5),
 (10, 'Light & Optics',             'light-optics',             6),
 (10, 'Sound & Waves',              'sound-waves',              7),
 (10, 'Electricity',                'electricity',              8),
 (10, 'Magnetism',                  'magnetism',                9),
 (10, 'Modern Physics',             'modern-physics',          10),

 -- 11. Chemistry
 (11, 'Matter & Its States',        'matter-states',            1),
 (11, 'Atomic Structure',           'atomic-structure',         2),
 (11, 'Periodic Table',             'periodic-table',           3),
 (11, 'Chemical Bonding',           'chemical-bonding',         4),
 (11, 'Chemical Reactions',         'chemical-reactions',       5),
 (11, 'Acids, Bases & Salts',       'acids-bases-salts',        6),
 (11, 'Metals & Non-Metals',        'metals-non-metals',        7),
 (11, 'Carbon Compounds',           'carbon-compounds',         8),
 (11, 'Chemistry in Everyday Life', 'chemistry-everyday-life',  9),

 -- 12. Biology
 (12, 'Cell Structure',             'cell-structure',           1),
 (12, 'Life Processes',             'life-processes',           2),
 (12, 'Human Body Systems',         'bio-human-body-systems',   3),
 (12, 'Plant Physiology',           'plant-physiology',         4),
 (12, 'Heredity & Evolution',       'heredity-evolution',       5),
 (12, 'Diseases & Immunity',        'diseases-immunity',        6),
 (12, 'Nutrition & Vitamins',       'nutrition-vitamins',       7),
 (12, 'Ecology & Environment',      'bio-ecology-environment',  8),

 -- 13. Indian History
 (13, 'Indus Valley Civilization',  'indus-valley',             1),
 (13, 'Vedic Period',               'vedic-period',             2),
 (13, 'Mauryan Empire',             'mauryan-empire',           3),
 (13, 'Gupta Empire',               'gupta-empire',             4),
 (13, 'Delhi Sultanate',            'delhi-sultanate',          5),
 (13, 'Mughal Empire',              'mughal-empire',            6),
 (13, 'Maratha Empire',             'maratha-empire',           7),
 (13, 'British Rule in India',      'british-rule',             8),
 (13, 'Revolt of 1857',             'revolt-1857',              9),
 (13, 'Indian National Movement',   'national-movement',       10),
 (13, 'Freedom Struggle & Partition','freedom-struggle',       11),

 -- 14. Indian Polity
 (14, 'Making of the Constitution', 'making-constitution',      1),
 (14, 'Preamble',                   'preamble',                 2),
 (14, 'Fundamental Rights',         'fundamental-rights',       3),
 (14, 'Directive Principles',       'directive-principles',     4),
 (14, 'Fundamental Duties',         'fundamental-duties',       5),
 (14, 'President & Vice President', 'president-vice-president', 6),
 (14, 'Parliament',                 'parliament',               7),
 (14, 'Prime Minister & Council of Ministers','pm-council',     8),
 (14, 'Supreme Court & Judiciary',  'judiciary',                9),
 (14, 'State Government',           'state-government',        10),
 (14, 'Panchayati Raj',             'panchayati-raj',          11),
 (14, 'Constitutional Amendments',  'constitutional-amendments',12),
 (14, 'Election Commission',        'election-commission',     13),

 -- 15. Geography
 (15, 'Solar System & Universe',    'solar-system',             1),
 (15, 'Latitude & Longitude',       'latitude-longitude',       2),
 (15, 'Earth Structure',            'earth-structure',          3),
 (15, 'Atmosphere & Climate',       'atmosphere-climate',       4),
 (15, 'Indian Physiography',        'indian-physiography',      5),
 (15, 'Indian Rivers',              'indian-rivers',            6),
 (15, 'Soils & Agriculture',        'soils-agriculture',        7),
 (15, 'Minerals & Industries',      'minerals-industries',      8),
 (15, 'Forests & Wildlife',         'forests-wildlife',         9),
 (15, 'World Geography',            'world-geography',         10),

 -- 16. Indian Economy
 (16, 'Basic Economic Concepts',    'basic-economics',          1),
 (16, 'National Income',            'national-income',          2),
 (16, 'Inflation',                  'inflation',                3),
 (16, 'Banking System',             'eco-banking-system',       4),
 (16, 'Budget & Taxation',          'budget-taxation',          5),
 (16, 'Five Year Plans',            'five-year-plans',          6),
 (16, 'Poverty & Unemployment',     'poverty-unemployment',     7),
 (16, 'Agriculture & Industry',     'agriculture-industry',     8),
 (16, 'International Trade',        'international-trade',      9),

 -- 17. Verbal Ability
 (17, 'Vocabulary',                 'vocabulary',               1),
 (17, 'Grammar',                    'va-grammar',               2),
 (17, 'Sentence Completion',        'sentence-completion',      3),
 (17, 'Para Jumbles',               'va-para-jumbles',          4),
 (17, 'Reading Comprehension',      'va-reading-comprehension', 5),
 (17, 'Error Identification',       'va-error-identification',  6),
 (17, 'Synonyms & Antonyms',        'va-synonyms-antonyms',     7),

 -- 18. Logical Reasoning
 (18, 'Number Series',              'lr-number-series',         1),
 (18, 'Letter Series',              'lr-letter-series',         2),
 (18, 'Coding-Decoding',            'lr-coding-decoding',       3),
 (18, 'Blood Relations',            'lr-blood-relations',       4),
 (18, 'Seating Arrangement',        'lr-seating-arrangement',   5),
 (18, 'Syllogism',                  'lr-syllogism',             6),
 (18, 'Data Sufficiency',           'data-sufficiency',         7),
 (18, 'Statement & Assumption',     'statement-assumption',     8),
 (18, 'Cubes & Dice',               'cubes-dice',               9),
 (18, 'Clocks & Calendars',         'clocks-calendars',        10),

 -- 19. Programming Fundamentals
 (19, 'Variables & Data Types',     'variables-data-types',     1),
 (19, 'Operators',                  'operators',                2),
 (19, 'Conditional Statements',     'conditional-statements',   3),
 (19, 'Loops',                      'loops',                    4),
 (19, 'Functions',                  'functions',                5),
 (19, 'Arrays',                     'arrays',                   6),
 (19, 'Strings',                    'strings',                  7),
 (19, 'Pointers',                   'pointers',                 8),
 (19, 'Recursion',                  'recursion',                9),
 (19, 'File Handling',              'file-handling',           10),

 -- 20. Data Structures & Algorithms
 (20, 'Arrays & Matrices',          'dsa-arrays',               1),
 (20, 'Linked List',                'linked-list',              2),
 (20, 'Stack',                      'stack',                    3),
 (20, 'Queue',                      'queue',                    4),
 (20, 'Trees',                      'trees',                    5),
 (20, 'Graphs',                     'graphs',                   6),
 (20, 'Hashing',                    'hashing',                  7),
 (20, 'Sorting Algorithms',         'sorting',                  8),
 (20, 'Searching Algorithms',       'searching',                9),
 (20, 'Time & Space Complexity',    'complexity',              10),
 (20, 'Dynamic Programming',        'dynamic-programming',     11),
 (20, 'Greedy Algorithms',          'greedy',                  12),

 -- 21. DBMS
 (21, 'DBMS Basics',                'dbms-basics',              1),
 (21, 'ER Model',                   'er-model',                 2),
 (21, 'Relational Model',           'relational-model',         3),
 (21, 'Normalization',              'normalization',            4),
 (21, 'SQL Queries',                'sql-queries',              5),
 (21, 'Joins',                      'joins',                    6),
 (21, 'Indexing',                   'indexing',                 7),
 (21, 'Transactions & ACID',        'transactions-acid',        8),
 (21, 'Keys & Constraints',         'keys-constraints',         9),

 -- 22. Operating Systems
 (22, 'OS Basics',                  'os-fundamentals',          1),
 (22, 'Process Management',         'process-management',       2),
 (22, 'CPU Scheduling',             'cpu-scheduling',           3),
 (22, 'Deadlock',                   'deadlock',                 4),
 (22, 'Memory Management',          'memory-management',        5),
 (22, 'Paging & Segmentation',      'paging-segmentation',      6),
 (22, 'File Systems',               'file-systems',             7),
 (22, 'Threads & Concurrency',      'threads-concurrency',      8),

 -- 23. Computer Networks
 (23, 'Network Basics',             'network-basics',           1),
 (23, 'OSI Model',                  'osi-model',                2),
 (23, 'TCP/IP Model',               'tcp-ip-model',             3),
 (23, 'IP Addressing & Subnetting', 'ip-addressing',            4),
 (23, 'Routing',                    'routing',                  5),
 (23, 'Transport Layer Protocols',  'transport-protocols',      6),
 (23, 'Application Layer Protocols','application-protocols',    7),
 (23, 'Network Security',           'network-security',         8),

 -- 24. OOPs
 (24, 'Classes & Objects',          'classes-objects',          1),
 (24, 'Encapsulation',              'encapsulation',            2),
 (24, 'Inheritance',                'inheritance',              3),
 (24, 'Polymorphism',               'polymorphism',             4),
 (24, 'Abstraction',                'abstraction',              5),
 (24, 'Constructors & Destructors', 'constructors-destructors', 6),
 (24, 'Interfaces & Abstract Classes','interfaces-abstract',    7),
 (24, 'Exception Handling',         'exception-handling',       8),

 -- 25. General Engineering — Civil
 (25, 'Building Materials',         'building-materials',       1),
 (25, 'Surveying',                  'surveying',                2),
 (25, 'Soil Mechanics',             'soil-mechanics',           3),
 (25, 'Fluid Mechanics',            'civil-fluid-mechanics',    4),
 (25, 'Structural Analysis',        'structural-analysis',      5),
 (25, 'Concrete Technology',        'concrete-technology',      6),
 (25, 'Estimation & Costing',       'estimation-costing',       7),
 (25, 'Transportation Engineering', 'transportation-engineering',8),

 -- 26. General Engineering — Electrical
 (26, 'Basic Electrical Concepts',  'basic-electrical',         1),
 (26, 'Circuit Theory',             'circuit-theory',           2),
 (26, 'AC Fundamentals',            'ac-fundamentals',          3),
 (26, 'Electrical Machines',        'electrical-machines',      4),
 (26, 'Transformers',               'transformers',             5),
 (26, 'Power Systems',              'power-systems',            6),
 (26, 'Measurement & Instruments',  'measurement-instruments',  7),
 (26, 'Electronics Basics',         'electronics-basics',       8),

 -- 27. General Engineering — Mechanical
 (27, 'Engineering Mechanics',      'engineering-mechanics',    1),
 (27, 'Strength of Materials',      'strength-materials',       2),
 (27, 'Thermodynamics',             'mech-thermodynamics',      3),
 (27, 'Fluid Mechanics',            'mech-fluid-mechanics',     4),
 (27, 'Theory of Machines',         'theory-machines',          5),
 (27, 'Machine Design',             'machine-design',           6),
 (27, 'Manufacturing Processes',    'manufacturing-processes',  7),
 (27, 'Heat Transfer',              'heat-transfer',            8),

 -- 28. Hindi Language
 (28, 'व्याकरण (Grammar)',           'hindi-grammar',            1),
 (28, 'संधि और समास',                'sandhi-samas',             2),
 (28, 'पर्यायवाची व विलोम शब्द',      'paryayvachi-vilom',        3),
 (28, 'मुहावरे व लोकोक्तियाँ',        'muhavare-lokoktiyan',      4),
 (28, 'वाक्य शुद्धि',                 'vakya-shuddhi',            5),
 (28, 'अपठित गद्यांश',                'apathit-gadyansh',         6),

 -- 29. Data Interpretation
 (29, 'Table Chart',                'table-chart',              1),
 (29, 'Bar Graph',                  'bar-graph',                2),
 (29, 'Line Graph',                 'line-graph',               3),
 (29, 'Pie Chart',                  'pie-chart',                4),
 (29, 'Caselet DI',                 'caselet-di',               5),
 (29, 'Mixed & Missing DI',         'mixed-missing-di',         6),

 -- 30. Static GK
 (30, 'Capitals & Currencies',      'capitals-currencies',      1),
 (30, 'National Parks & Sanctuaries','national-parks',          2),
 (30, 'Dams & Rivers',              'dams-rivers',              3),
 (30, 'Dance & Festivals',          'dance-festivals',          4),
 (30, 'Temples & Monuments',        'temples-monuments',        5),
 (30, 'First in India',             'first-in-india',           6),
 (30, 'Nicknames of Cities',        'city-nicknames',           7),
 (30, 'Organisations & Headquarters','organisations-hq',        8);
