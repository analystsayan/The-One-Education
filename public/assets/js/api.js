/* ===================================================================
   Thin API wrapper. Every network call in the app goes through here.
   =================================================================== */
const Api = {
  async get(path) {
    const res = await fetch(path);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  },

  async post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
  },

  // Catalog
  categories:    ()                  => Api.get('/api/catalog/categories'),
  organizations: categoryId          => Api.get(`/api/catalog/organizations?category_id=${categoryId}`),
  exams:         organizationId      => Api.get(`/api/catalog/exams?organization_id=${organizationId}`),
  stages:        examId              => Api.get(`/api/catalog/exam-stages?exam_id=${examId}`),
  subjects:      examId              => Api.get(`/api/catalog/subjects?exam_id=${examId}`),
  topics:        (examId, subjectId) => Api.get(`/api/catalog/topics?exam_id=${examId}&subject_id=${subjectId}`),

  // Quiz
  quizOptions:   ()      => Api.get('/api/quiz/options'),
  generateQuiz:  payload => Api.post('/api/quiz/generate', payload)
};

window.Api = Api;
