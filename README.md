# The One Education — Practice Portal

`practice.theoneeducation.com`

AI-generated practice papers for Indian government and private-sector
recruitment exams. Node.js + Express + MySQL backend, Tailwind frontend with a
light/dark theme switcher.

This project covers the practice subdomain only. The main site is separate.

---

## Quick start

```bash
npm install                 # 1. dependencies
cp .env.example .env        # 2. add your keys (see below)
npm run db:setup            # 3. build the database (once)
npm start                   # 4. run it
```
Then open http://localhost:3000

---

## Setup in detail

### 1. Node.js
Install the LTS build from https://nodejs.org, then check with `node -v`.

### 2. MySQL

**Windows** — installer at https://dev.mysql.com/downloads/installer/ ; choose
*Server only*, and note the root password you set.
**Mac** — `brew install mysql && brew services start mysql`
**Linux** — `sudo apt install mysql-server && sudo systemctl start mysql`

You don't create the database by hand; step 4 does it.

### 3. Gemini API key
Free, no credit card: https://aistudio.google.com/apikey → **Create API key**.

### 4. Your `.env`
Copy `.env.example` to `.env` and fill in:

```
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.6-flash
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=mcq_app
PORT=3000
```

`.env` is gitignored. Never commit it.

### 5. Build the database
```bash
npm run db:setup
```
Loads 18 organizations, 64 exams, 30 subjects, 296 topics. Run once.

---

## Project structure

Layered so each file has one job. Routes don't contain SQL; services don't
contain HTTP.

```
toe-practice/
├── server.js                    Entry point — verifies config, starts listening
├── src/
│   ├── app.js                   Express app (middleware, routes, static files)
│   ├── config/index.js          All configuration, read from .env
│   ├── db/pool.js               MySQL connection pool
│   ├── routes/                  URL → controller mapping only
│   │   ├── index.js             Mounts everything under /api
│   │   ├── catalog.routes.js
│   │   └── quiz.routes.js
│   ├── controllers/             Parse input, call a service, send JSON
│   │   ├── catalog.controller.js
│   │   └── quiz.controller.js
│   ├── services/                Business logic
│   │   ├── catalog.service.js   All catalogue SQL + scope resolution
│   │   ├── quiz.service.js      Batching, topic spread, dedupe, shuffle
│   │   └── gemini.service.js    The only file that knows about Google's API
│   ├── middleware/
│   │   ├── asyncHandler.js      Async errors reach the error handler
│   │   └── errorHandler.js      The single place errors become responses
│   └── utils/
│       ├── ApiError.js          Errors carrying an HTTP status
│       └── logger.js            Timestamped logging
├── db/                          SQL schema and seed data
├── scripts/setup-db.js          What `npm run db:setup` runs
└── public/
    ├── index.html               Landing page
    ├── quiz.html                Practice test page
    └── assets/
        ├── css/main.css
        └── js/
            ├── theme.js         Tailwind config + theme switcher
            ├── api.js           Every network call
            ├── quiz.js          Test page logic
            └── components/chrome.js   Shared header + footer
```

**Where to make a change**

| Task | File |
|---|---|
| Change the prompt sent to the AI | `src/services/quiz.service.js` |
| Swap Gemini for another provider | `src/services/gemini.service.js` |
| Add an API endpoint | `routes/` + `controllers/` + `services/` |
| Change nav links, logo, footer | `public/assets/js/components/chrome.js` |
| Change colours or fonts | `public/assets/js/theme.js` |
| Change question counts or difficulty levels | `src/config/index.js` |
| Add exams, subjects or topics | `db/` SQL files |

---

## How the app works

### Answers never need a second request
The API returns each question's correct answer and explanation *with* the
question. The browser stores them and marks answers locally, so a 100-question
paper costs exactly zero API calls to grade. This is in `quiz.js` → `answer()`.

### Practise a whole exam, a subject, or one topic
Subject and topic are both optional:

| Selection | Result |
|---|---|
| Exam only | Mixed questions from every subject and topic — a full mock |
| Exam + subject | Mixed questions from every topic in that subject |
| Exam + subject + topic | Focused single-topic practice |

`catalog.service.js` → `resolveScope()` turns the selection into a topic list;
`quiz.service.js` spreads the questions across it.

### Large papers are generated in batches
100 questions is too much for one API call, so the work is split into batches of
25 (configurable in `src/config/index.js`). Topics are rotated across batches so
coverage is even, results are de-duplicated and shuffled.

Batches run two at a time to stay inside free-tier rate limits. If one batch
fails, the rest still come through and the student sees a notice rather than an
error.

### Stage-aware exams
SSC CGL has Tier 1 and Tier 2; SSC MTS has no stages. The exam list returns a
`has_stages` count, and the Stage dropdown enables only when it's needed.

---

## Configuration

Edit `src/config/index.js`:

```js
quiz: {
  allowedCounts: [25, 50, 100],   // buttons on the quiz page
  allowedLevels: ['Easy', 'Medium', 'Hard'],
  batchSize: 25,                   // questions per API call
  batchConcurrency: 2              // parallel calls — raise only on a paid tier
}
```

The frontend reads these from `/api/quiz/options`, so changing the array here
updates the buttons with no frontend edit.

---

## Theme switcher

Light and dark, remembered in `localStorage`, defaulting to the operating system
setting. The correct theme is applied by a small inline script in each page's
`<head>` so the wrong one is never briefly visible.

---

## API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service check |
| GET | `/api/catalog/categories` | Government / Private |
| GET | `/api/catalog/organizations?category_id=` | Organizations |
| GET | `/api/catalog/exams?organization_id=` | Exams, with `has_stages` |
| GET | `/api/catalog/exam-stages?exam_id=` | Tiers of an exam |
| GET | `/api/catalog/subjects?exam_id=` | Subjects |
| GET | `/api/catalog/topics?exam_id=&subject_id=` | Topics |
| GET | `/api/quiz/options` | Allowed counts and levels |
| POST | `/api/quiz/generate` | Generate a paper |

`POST /api/quiz/generate`
```json
{ "exam_id": 3, "subject_id": 1, "topic_id": 12, "level": "Medium", "count": 50 }
```
`subject_id` and `topic_id` are optional. Omit both for a full-syllabus paper.

---

## Deploying to practice.theoneeducation.com

1. Host the Node app (Render, Railway, a VPS — anything running Node 18+).
2. Use a managed MySQL database and load the files in `db/` into it.
3. Set `GEMINI_API_KEY`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` and
   `NODE_ENV=production` as environment variables in the host's dashboard —
   don't upload `.env`.
4. Point the `practice` DNS record at the host and enable HTTPS.

Two things to plan for before opening it to students:

**Quota.** Every visitor's paper draws on your single Gemini key. A 100-question
paper is 4 API calls. The free tier's daily cap will go quickly with real
traffic — consider caching generated papers in the database and reusing them, or
moving to a paid tier.

**Rate limits.** `batchConcurrency: 2` suits the free tier. Raise it only after
upgrading, or concurrent users will trigger 429s for each other.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `DATABASE CONNECTION FAILED` | MySQL not running, or wrong `DB_PASSWORD` in `.env` |
| Dropdowns empty | `npm run db:setup` hasn't been run |
| "Free-tier rate limit reached" | Gemini per-minute or per-day cap; wait and retry |
| `Model "..." is unavailable` | Model retired — update `GEMINI_MODEL`, current list at https://ai.google.dev/gemini-api/docs/models |
| Fewer questions than requested | Some batches failed; the notice above the paper says how many arrived |

The terminal running `npm start` prints the real underlying error for anything
the browser shows generically.
