/* ===================================================================
   Practice test page.

   Answer checking is entirely local: the API returns the correct answer
   with each question, so marking a 100-question paper costs no requests.
   =================================================================== */

const $ = id => document.getElementById(id);

const els = {
  setup:        $('setupScreen'),
  loading:      $('loadingScreen'),
  loadingNote:  $('loadingNote'),
  quiz:         $('quizScreen'),

  category:     $('categorySelect'),
  organization: $('organizationSelect'),
  exam:         $('examSelect'),
  stage:        $('stageSelect'),
  subject:      $('subjectSelect'),
  topic:        $('topicSelect'),

  levelRow:     $('levelRow'),
  countRow:     $('countRow'),
  scopeSummary: $('scopeSummary'),
  generateBtn:  $('generateBtn'),
  errorBox:     $('errorBox'),

  quizMeta:     $('quizMeta'),
  progressText: $('progressText'),
  progressFill: $('progressFill'),
  questionList: $('questionList'),

  scoreCard:    $('scoreCard'),
  scoreValue:   $('scoreValue'),
  scorePercent: $('scorePercent'),
  scoreRemark:  $('scoreRemark'),
  anotherBtn:   $('anotherQuizBtn')
};

const state = {
  level: 'Medium',
  count: 25,
  questions: [],
  answers: [],     // index chosen per question, null until answered
  score: 0
};

const LETTERS = ['A', 'B', 'C', 'D'];
const CHOOSE = '— choose —';
const ALL_SUBJECTS = 'All subjects (full syllabus)';
const ALL_TOPICS = 'All topics';

/* ------------------------------------------------------------------
   Select helpers
------------------------------------------------------------------ */

function setOptions(select, rows, { placeholder, enabled = true }) {
  select.innerHTML = '';

  const ph = document.createElement('option');
  ph.value = '';
  ph.textContent = placeholder;
  select.appendChild(ph);

  rows.forEach(row => {
    const opt = document.createElement('option');
    opt.value = row.id;
    opt.textContent = row.name;
    if (row.has_stages !== undefined) opt.dataset.hasStages = row.has_stages;
    select.appendChild(opt);
  });

  select.value = '';
  select.disabled = !enabled || rows.length === 0;
}

function clearSelect(select, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  select.value = '';
  select.disabled = true;
}

/** The exam id used downstream — the stage when one is chosen, else the exam. */
function effectiveExamId() {
  return els.stage.value || els.exam.value || '';
}

function showError(message) {
  els.errorBox.textContent = message;
  els.errorBox.classList.remove('hidden');
}
function hideError() {
  els.errorBox.classList.add('hidden');
}

/* ------------------------------------------------------------------
   Cascade
------------------------------------------------------------------ */

async function init() {
  try {
    const options = await Api.quizOptions();
    renderChoiceButtons(els.levelRow, options.levels, 'level');
    renderChoiceButtons(els.countRow, options.counts, 'count');

    const categories = await Api.categories();
    setOptions(els.category, categories, { placeholder: CHOOSE });
  } catch (err) {
    showError('Could not load the exam catalogue. Is the server running and the database set up?');
  }
  updateScopeSummary();
}

els.category.addEventListener('change', async () => {
  hideError();
  clearSelect(els.organization, CHOOSE);
  clearSelect(els.exam, CHOOSE);
  clearSelect(els.stage, 'Not applicable');
  clearSelect(els.subject, ALL_SUBJECTS);
  clearSelect(els.topic, ALL_TOPICS);
  updateScopeSummary();

  if (!els.category.value) return;
  try {
    setOptions(els.organization, await Api.organizations(els.category.value), { placeholder: CHOOSE });
  } catch (err) { showError(err.message); }
});

els.organization.addEventListener('change', async () => {
  hideError();
  clearSelect(els.exam, CHOOSE);
  clearSelect(els.stage, 'Not applicable');
  clearSelect(els.subject, ALL_SUBJECTS);
  clearSelect(els.topic, ALL_TOPICS);
  updateScopeSummary();

  if (!els.organization.value) return;
  try {
    setOptions(els.exam, await Api.exams(els.organization.value), { placeholder: CHOOSE });
  } catch (err) { showError(err.message); }
});

els.exam.addEventListener('change', async () => {
  hideError();
  clearSelect(els.stage, 'Not applicable');
  clearSelect(els.subject, ALL_SUBJECTS);
  clearSelect(els.topic, ALL_TOPICS);

  if (!els.exam.value) { updateScopeSummary(); return; }

  const chosen = els.exam.options[els.exam.selectedIndex];
  const hasStages = parseInt(chosen.dataset.hasStages || '0', 10);

  try {
    if (hasStages > 0) {
      // Stages exist — the student must pick one before subjects load.
      setOptions(els.stage, await Api.stages(els.exam.value), { placeholder: CHOOSE });
    } else {
      await loadSubjects(els.exam.value);
    }
  } catch (err) { showError(err.message); }

  updateScopeSummary();
});

els.stage.addEventListener('change', async () => {
  hideError();
  clearSelect(els.subject, ALL_SUBJECTS);
  clearSelect(els.topic, ALL_TOPICS);

  if (els.stage.value) {
    try { await loadSubjects(els.stage.value); }
    catch (err) { showError(err.message); }
  }
  updateScopeSummary();
});

/** Subject is optional — the blank option means "all subjects". */
async function loadSubjects(examId) {
  const subjects = await Api.subjects(examId);
  setOptions(els.subject, subjects, { placeholder: ALL_SUBJECTS });
  els.subject.disabled = false;
}

els.subject.addEventListener('change', async () => {
  hideError();
  clearSelect(els.topic, ALL_TOPICS);

  if (els.subject.value) {
    try {
      const topics = await Api.topics(effectiveExamId(), els.subject.value);
      setOptions(els.topic, topics, { placeholder: ALL_TOPICS });
      els.topic.disabled = false;
    } catch (err) { showError(err.message); }
  }
  updateScopeSummary();
});

els.topic.addEventListener('change', updateScopeSummary);

/* ------------------------------------------------------------------
   Difficulty / count buttons
------------------------------------------------------------------ */

function renderChoiceButtons(container, values, key) {
  container.innerHTML = '';
  values.forEach(value => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.value = value;
    btn.textContent = value;
    btn.className = choiceClass(state[key] === value);
    btn.addEventListener('click', () => {
      state[key] = value;
      [...container.children].forEach(b =>
        b.className = choiceClass(b.dataset.value == value)
      );
      updateScopeSummary();
    });
    container.appendChild(btn);
  });
}

function choiceClass(active) {
  return [
    'px-3 py-3 rounded-xl text-sm font-medium border transition-colors',
    active
      ? 'bg-ink-900 dark:bg-amber-500 text-white dark:text-ink-950 border-ink-900 dark:border-amber-500'
      : 'bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500'
  ].join(' ');
}

/* ------------------------------------------------------------------
   Scope summary + generate button state
------------------------------------------------------------------ */

function updateScopeSummary() {
  const examChosen = !!effectiveExamId();
  const examLabel = els.stage.value
    ? els.stage.options[els.stage.selectedIndex].textContent
    : (els.exam.value ? els.exam.options[els.exam.selectedIndex].textContent : null);

  // If the exam has stages, one must be picked.
  const stagePending = !els.stage.disabled && !els.stage.value;

  els.generateBtn.disabled = !examChosen || stagePending;

  if (!examLabel) {
    els.scopeSummary.innerHTML =
      `<span class="text-ink-400 dark:text-ink-500">Choose an exam to begin.</span>`;
    return;
  }
  if (stagePending) {
    els.scopeSummary.innerHTML =
      `<span class="text-ink-400 dark:text-ink-500">This exam has stages — pick one to continue.</span>`;
    return;
  }

  let scope;
  if (els.topic.value) {
    scope = `the topic <strong class="font-semibold text-ink-900 dark:text-white">${els.topic.options[els.topic.selectedIndex].textContent}</strong>`;
  } else if (els.subject.value) {
    scope = `all topics in <strong class="font-semibold text-ink-900 dark:text-white">${els.subject.options[els.subject.selectedIndex].textContent}</strong>`;
  } else {
    scope = `<strong class="font-semibold text-ink-900 dark:text-white">the full syllabus</strong> — every subject and topic`;
  }

  els.scopeSummary.innerHTML =
    `<strong class="font-semibold text-ink-900 dark:text-white">${state.count}</strong> ` +
    `${state.level.toLowerCase()} questions from ${scope}, for ` +
    `<strong class="font-semibold text-ink-900 dark:text-white">${examLabel}</strong>.`;
}

/* ------------------------------------------------------------------
   Generation
------------------------------------------------------------------ */

els.generateBtn.addEventListener('click', generate);
els.anotherBtn.addEventListener('click', () => {
  els.quiz.classList.add('hidden');
  els.setup.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

async function generate() {
  hideError();
  els.setup.classList.add('hidden');
  els.quiz.classList.add('hidden');
  els.loading.classList.remove('hidden');
  els.loadingNote.textContent =
    `${state.count} questions can take a moment — they're written in batches.`;
  window.scrollTo({ top: 0 });

  try {
    const payload = {
      exam_id: effectiveExamId(),
      level: state.level,
      count: state.count
    };
    if (els.subject.value) payload.subject_id = els.subject.value;
    if (els.topic.value)   payload.topic_id = els.topic.value;

    const data = await Api.generateQuiz(payload);

    // Answers arrive with the questions and stay in memory. No further
    // network calls are made while the student works through the paper.
    state.questions = data.questions;
    state.answers = new Array(data.questions.length).fill(null);
    state.score = 0;

    const m = data.meta;
    els.quizMeta.textContent = `${m.organization} · ${m.exam} · ${m.scope} · ${m.level}`;

    renderQuestions();
    updateProgress();

    els.loading.classList.add('hidden');
    els.quiz.classList.remove('hidden');

    if (m.partial) {
      showToastBanner(`The AI returned ${m.delivered} of ${m.requested} questions. You can still take the paper.`);
    }

  } catch (err) {
    els.loading.classList.add('hidden');
    els.setup.classList.remove('hidden');
    showError(err.message);
  }
}

function showToastBanner(message) {
  const div = document.createElement('div');
  div.className = 'mb-6 rounded-xl border border-amber-300 dark:border-amber-700 ' +
                  'bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm ' +
                  'text-amber-800 dark:text-amber-200';
  div.textContent = message;
  els.questionList.prepend(div);
}

/* ------------------------------------------------------------------
   Rendering + local marking
------------------------------------------------------------------ */

function renderQuestions() {
  els.questionList.innerHTML = '';
  els.scoreCard.classList.add('hidden');

  state.questions.forEach((q, qi) => {
    const card = document.createElement('article');
    card.className = 'rounded-2xl border border-ink-200/80 dark:border-ink-800 ' +
                     'bg-white dark:bg-ink-900/40 p-5 sm:p-6';

    const topicTag = q.topic
      ? `<span class="inline-block mb-2 text-[11px] font-medium tracking-wide
                      text-amber-700 dark:text-amber-400
                      bg-amber-500/10 rounded-full px-2.5 py-1">${escapeHtml(q.topic)}</span>`
      : '';

    card.innerHTML = `
      ${topicTag}
      <div class="flex gap-3">
        <span class="font-display font-semibold text-ink-400 dark:text-ink-500 shrink-0">${qi + 1}.</span>
        <p class="text-[15px] leading-relaxed text-ink-900 dark:text-white">${escapeHtml(q.question)}</p>
      </div>
      <div class="mt-4 space-y-2" data-options></div>
      <p class="mt-3 text-sm hidden" data-feedback></p>
    `;

    const optionsWrap = card.querySelector('[data-options]');
    const feedback = card.querySelector('[data-feedback]');

    q.options.forEach((option, oi) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = optionClass('idle');
      btn.innerHTML =
        `<span class="font-semibold text-ink-400 dark:text-ink-500 w-5 shrink-0">${LETTERS[oi]}</span>` +
        `<span>${escapeHtml(option)}</span>`;
      btn.addEventListener('click', () => answer(qi, oi, optionsWrap, feedback));
      optionsWrap.appendChild(btn);
    });

    els.questionList.appendChild(card);
  });
}

function optionClass(kind) {
  const base = 'w-full flex items-start gap-3 text-left px-4 py-3 rounded-xl ' +
               'border text-[15px] transition-colors';
  const variants = {
    idle:    'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 ' +
             'text-ink-800 dark:text-ink-100 hover:border-ink-400 dark:hover:border-ink-500',
    correct: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ' +
             'text-emerald-800 dark:text-emerald-300 font-medium',
    wrong:   'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ' +
             'text-rose-800 dark:text-rose-300 font-medium',
    dim:     'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 ' +
             'text-ink-400 dark:text-ink-500 opacity-60'
  };
  return `${base} ${variants[kind]}`;
}

/** Marks an answer using the stored correct index — no network call. */
function answer(qi, chosen, optionsWrap, feedback) {
  if (state.answers[qi] !== null) return;

  state.answers[qi] = chosen;
  const q = state.questions[qi];
  const correct = q.answer;

  [...optionsWrap.children].forEach((btn, oi) => {
    btn.disabled = true;
    if (oi === correct)      btn.className = optionClass('correct');
    else if (oi === chosen)  btn.className = optionClass('wrong');
    else                     btn.className = optionClass('dim');
  });

  const isRight = chosen === correct;
  if (isRight) state.score++;

  feedback.classList.remove('hidden');
  feedback.className = 'mt-3 text-sm ' +
    (isRight ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400');
  feedback.textContent =
    (isRight ? '✓ Correct' : `✗ Correct answer: ${LETTERS[correct]}`) +
    (q.explanation ? ` — ${q.explanation}` : '');

  updateProgress();
}

function updateProgress() {
  const done = state.answers.filter(a => a !== null).length;
  const total = state.questions.length;

  els.progressText.textContent = `${done} / ${total}`;
  els.progressFill.style.width = total ? `${(done / total) * 100}%` : '0%';

  if (done === total && total > 0) showScore();
}

function showScore() {
  const total = state.questions.length;
  const pct = Math.round((state.score / total) * 100);

  els.scoreValue.textContent = `${state.score} / ${total}`;
  els.scorePercent.textContent = `${pct}% correct`;

  let remark;
  if (pct >= 85)      remark = 'Excellent — you are well prepared for this paper.';
  else if (pct >= 70) remark = 'Strong result. Review the ones you missed and go again.';
  else if (pct >= 50) remark = 'A reasonable base. Focused topic practice will lift this quickly.';
  else                remark = 'Worth revisiting the fundamentals — try a topic-wise paper next.';
  els.scoreRemark.textContent = remark;

  els.scoreCard.classList.remove('hidden');
  els.scoreCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** Model output is inserted as text, never as HTML. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', init);
