# SkillSetu

## Discover what to learn next. Prove that you improved.

SkillSetu is an AI-powered competency coach that helps learners identify their skill gaps, discover relevant international public learning resources, practice with source-grounded quizzes, and measure real improvement over time.

---

## Demo

- Live demo: `ADD_YOUR_DEPLOYED_APP_URL`
- Demo video: `ADD_YOUR_VIDEO_URL`
- Hackathon submission: AI Builders Hackathon 2026

> Replace the placeholder links above before publishing the repository.

---

## Problem

Learners have access to thousands of courses, videos, articles, and documents, but they often do not know:

- Which skills they currently have.
- Which competencies they are missing.
- What they should learn next.
- Which resource matches their current level.
- Whether their learning actually improved their ability.

Most learning platforms focus on content delivery or course completion. They do not always connect assessment, resource discovery, practice, and measurable improvement in one workflow.

---

## Solution

SkillSetu converts a learning goal into an evidence-based learning journey.

The learner:

1. Selects a target role and learning goal.
2. Completes a competency-based diagnostic assessment.
3. Receives a skill-gap analysis.
4. Gets personalized learning recommendations.
5. Opens relevant international public resources.
6. Uploads permitted learning material.
7. Receives source-grounded practice questions.
8. Completes the generated quiz.
9. Sees updated competency scores.
10. Receives the next recommended learning action.

### Core loop

```text
Assess → Identify gaps → Recommend → Learn → Practice → Reassess → Improve
```

---

## Target user

The current prototype focuses on students and junior professionals preparing for a junior data analyst role.

### Demo persona

```text
Name: Alex
Target role: Junior Data Analyst
Goal: Become job-ready for data-analysis projects
```

---

## Competency framework

The MVP evaluates five competencies:

| Competency | Description |
|---|---|
| Python basics | Programming fundamentals required for data work |
| Data handling | Cleaning, transforming, and working with tabular data |
| Statistics | Descriptive statistics, distributions, and probability |
| Data visualization | Charts, dashboards, and visual interpretation |
| Data privacy | Responsible, secure, and ethical data use |

### Competency levels

```text
0–39   Beginner
40–64  Developing
65–84  Proficient
85–100 Advanced
```

### Gap classification

```text
0–49   High gap
50–69  Medium gap
70–100 Low gap
```

---

## Main features

### Competency assessment

SkillSetu uses competency-based questions to calculate a separate score for every skill instead of returning only one overall score.

Example:

```text
Python basics: 78%
Data handling: 55%
Statistics: 38%
Data visualization: 42%
Data privacy: 61%
```

### Explainable gap analysis

The platform identifies the learner’s highest-priority gaps and explains why they require attention.

Example:

```text
Statistics is a high-priority gap because the learner scored
38% in the diagnostic assessment and the skill is important
for the selected data-analyst goal.
```

### International public-resource discovery

SkillSetu searches international public educational resources, with OER Commons used as the primary public-resource source for the prototype.

The resource system:

- Converts competency gaps into search queries.
- Retrieves public-resource metadata.
- Removes duplicate results.
- Ranks resources by learner relevance.
- Displays provider, level, duration, and licence information.
- Links users to the original resource.

SkillSetu does not copy or republish external course content.

### Personalized recommendations

Each recommendation includes:

- Match score.
- Provider.
- Resource type.
- Competencies covered.
- Difficulty level.
- Estimated duration.
- Original resource link.
- Explanation of why it was recommended.

### Source-grounded quiz generation

Learners can upload permitted PDF learning material.

SkillSetu:

1. Extracts text page by page.
2. Splits the text into chunks.
3. Creates embeddings.
4. Retrieves relevant passages.
5. Generates multiple-choice questions using retrieved source material.
6. Validates the generated questions.
7. Stores source text and page references.

Every generated question contains:

- Question.
- Four answer choices.
- Correct answer.
- Explanation.
- Competency.
- Difficulty.
- Supporting source passage.
- Source page number.

### Measurable improvement

After completing a generated quiz, the learner receives an updated competency score.

Example:

```text
Statistics before practice: 38%
Quiz performance: 70%
Updated score: 57%
```

The dashboard displays the previous score, quiz result, updated score, improvement, and next action.

---

## Why AI is used

AI is used for tasks that require language understanding and personalization:

- Understanding learner goals.
- Explaining competency gaps.
- Creating resource-search queries.
- Ranking semantically relevant resources.
- Explaining recommendations.
- Generating practice questions from learning material.
- Producing answer explanations.
- Suggesting the next learning action.

Important scoring and validation operations remain deterministic:

- Assessment scoring.
- Competency-level mapping.
- Gap classification.
- Recommendation weighting.
- Quiz scoring.
- Progress updates.

This combination makes the product more reliable than a generic chatbot.

---

## Technical architecture

```text
┌─────────────────────────────────┐
│ React Frontend                  │
│ Profile, Assessment, Dashboard  │
│ Resources, Upload, Quiz         │
└────────────────┬────────────────┘
                 │ HTTPS / JSON
┌────────────────▼────────────────┐
│ FastAPI Backend                 │
│ REST API, validation, logic     │
└────────────────┬────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
┌─────▼─────┐ ┌──▼──────┐ ┌─▼──────────────┐
│Assessment │ │Resource │ │Document/RAG    │
│Engine     │ │Engine   │ │Pipeline        │
└─────┬─────┘ └──┬──────┘ └─┬──────────────┘
      │          │          │
      │      ┌───▼────┐ ┌───▼─────────────┐
      │      │ OER    │ │ LLM + Embeddings│
      │      │ Commons│ │                 │
      │      └────────┘ └─────────────────┘
      │
┌─────▼────────────────────────┐
│ PostgreSQL + pgvector         │
│ Users, scores, resources,     │
│ documents, chunks, quizzes    │
└───────────────────────────────┘
```

---

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Vector search | pgvector with in-memory fallback |
| PDF extraction | PyMuPDF |
| Embeddings | Sentence Transformers or configurable embedding API |
| AI output validation | Pydantic |
| Public resources | OER Commons API and local fallback catalogue |
| Deployment | Docker and cloud hosting |
| Testing | Pytest and frontend tests |

---

## Resource-provider architecture

SkillSetu uses a provider-neutral resource layer.

```text
Recommendation Engine
        ↓
Public Resource Provider Interface
        ├── OER Commons Provider
        ├── Local Catalogue Fallback
        ├── Open edX Provider — future
        ├── University Catalogue — future
        └── Organization LMS — future
```

The current prototype uses:

- OER Commons for public-resource search.
- A local seeded catalogue as a fallback.
- Uploaded documents for source-grounded quiz generation.

The provider interface allows new public catalogues and learning platforms to be added without changing the core recommendation engine.

---

## AI and RAG pipeline

```text
PDF upload
    ↓
Page-level text extraction
    ↓
Text cleaning and chunking
    ↓
Embedding generation
    ↓
Vector storage
    ↓
Relevant chunk retrieval
    ↓
Structured LLM question generation
    ↓
Question validation
    ↓
Quiz display
```

The model receives only the relevant retrieved passages when generating questions.

Each accepted question must have:

- A valid structure.
- Exactly four options.
- One correct answer.
- A supporting source passage.
- A source page.
- A matching competency.
- A consistent explanation.

Unsupported or malformed questions are rejected or regenerated.

---

## Recommendation scoring

Resources are ranked using a transparent scoring model:

\[
\text{Recommendation Score} =
0.45(\text{competency relevance}) +
0.20(\text{level match}) +
0.15(\text{role relevance}) +
0.10(\text{metadata quality}) +
0.10(\text{language match})
\]

This makes the recommendation process understandable and easier to improve.

---

## Progress scoring

The prototype combines previous competency evidence with new quiz evidence:

\[
\text{New Score} =
0.40(\text{Previous Score}) +
0.60(\text{Quiz Score})
\]

This formula is a prototype strategy and can be replaced with a more advanced assessment model in future versions.

The system stores evidence for score updates, including:

- Assessment attempt.
- Quiz ID.
- Questions attempted.
- Correct answers.
- Quiz score.
- Previous competency score.
- Updated competency score.

---

## Project structure

```text
skillsetu/
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   ├── services/
│   │   ├── providers/
│   │   ├── prompts/
│   │   └── seed/
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── styles/
│   └── public/
├── data/
│   ├── competencies.json
│   ├── assessment_questions.json
│   ├── fallback_resources.json
│   └── sample_document.pdf
└── docs/
    ├── architecture.md
    ├── api.md
    └── demo-script.md
```

---

## Getting started

### Prerequisites

Install:

- Python 3.11 or later.
- Node.js 20 or later.
- npm.
- Docker Desktop.
- Git.

### Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd skillsetu
```

Replace `YOUR_REPOSITORY_URL` with your public GitHub repository URL.

### Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skillsetu
OER_COMMONS_API_URL=YOUR_OER_COMMONS_API_URL
OER_COMMONS_API_TOKEN=YOUR_OER_COMMONS_API_TOKEN
LLM_API_KEY=YOUR_LLM_API_KEY
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_UPLOAD_MB=10
```

Do not commit `.env` to GitHub.

If external API credentials are not available, the application should use the local fallback resource catalogue and mock AI provider.

### Start PostgreSQL

```bash
docker compose up -d db
```

### Start the backend

```bash
cd backend

python -m venv .venv
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Seed the database:

```bash
python -m app.seed.seed_data
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OER_COMMONS_API_URL` | OER Commons API base URL |
| `OER_COMMONS_API_TOKEN` | Backend-only OER Commons token |
| `LLM_API_KEY` | AI model provider key |
| `EMBEDDING_MODEL` | Embedding model name |
| `MAX_UPLOAD_MB` | Maximum upload size |
| `CORS_ORIGINS` | Allowed frontend origins |

Keep all credentials private.

---

## API overview

### Assessment

```http
GET /api/assessment/questions
POST /api/assessment/attempts
POST /api/assessment/attempts/{attempt_id}/answers
POST /api/assessment/attempts/{attempt_id}/complete
GET /api/users/{user_id}/competencies
```

### Public resources

```http
GET /api/public-resources/search?q=statistics
GET /api/public-resources/recommendations/{user_id}
```

### Documents

```http
POST /api/documents/upload
GET /api/documents/{document_id}/status
```

### Quizzes

```http
POST /api/documents/{document_id}/generate-quiz
GET /api/quizzes/{quiz_id}
POST /api/quizzes/{quiz_id}/submit
```

---

## Example user journey

```text
1. Alex selects Junior Data Analyst.
2. Alex completes the diagnostic assessment.
3. SkillSetu identifies Statistics and Visualization as high-priority gaps.
4. SkillSetu searches public learning resources.
5. SkillSetu ranks resources and explains the recommendations.
6. Alex opens a recommended resource.
7. Alex uploads permitted study material.
8. SkillSetu generates source-grounded MCQs.
9. Alex completes the quiz.
10. SkillSetu updates the competency profile.
11. Alex sees before-and-after progress.
12. SkillSetu recommends the next learning action.
```

---

## Responsible AI and privacy

SkillSetu includes the following safeguards:

- Learner scores are calculated from assessment evidence.
- AI-generated questions are grounded in retrieved source passages.
- Generated questions include page references.
- Malformed or unsupported AI output is rejected.
- Correct answers are hidden before quiz submission.
- Uploaded files are validated by type and size.
- API keys remain on the backend.
- External course content is linked rather than republished.
- Users should upload only material they are permitted to process.
- The platform does not claim external course completion without an authorized integration.
- SkillSetu is a learning-support tool, not a high-stakes automated evaluator.

For high-stakes education or employment decisions, AI-generated questions and competency results should receive human review.

---

## Limitations

The current prototype has several limitations:

- It focuses on one target role: junior data analyst.
- It uses five competencies.
- The progress formula is a prototype calculation.
- Public-resource API availability may vary.
- Cached or fallback resources may be used when the external API is unavailable.
- Live course-enrolment and completion synchronization is not implemented.
- AI-generated questions should receive human review for high-stakes use.
- The prototype currently focuses on PDF input.

These limitations are intentional trade-offs for building a reliable hackathon MVP.

---

## Future roadmap

### Short term

- Add more target roles.
- Add adaptive question difficulty.
- Support DOCX and PPTX files.
- Add trainer approval for generated questions.
- Add multilingual interfaces.
- Improve competency calibration.

### Medium term

- Add Open edX and university catalogue connectors.
- Add organization-specific learning resources.
- Add reminders and learning schedules.
- Add project-based assessments.
- Add learner portfolios.

### Long term

- Add authorized LMS progress synchronization.
- Add verified learning records.
- Add team competency dashboards.
- Add privacy-preserving learning analytics.
- Add role-specific competency frameworks.
- Add multilingual and multimodal learning support.

---

## Testing

Run backend tests:

```bash
cd backend
pytest
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

Important test cases include:

- Assessment score calculation.
- Competency-level mapping.
- Gap classification.
- Recommendation ranking.
- Resource deduplication.
- OER response normalization.
- Cache fallback.
- Invalid PDF rejection.
- Empty document rejection.
- Text chunking.
- Retrieval.
- Structured AI output validation.
- Unsupported-question rejection.
- Quiz scoring.
- Progress updates.
- Duplicate quiz-submission prevention.

---

## Hackathon context

SkillSetu was built for the AI Builders Hackathon 2026.

The project focuses on:

- Meaningful AI implementation.
- Real-world learning needs.
- Explainable recommendations.
- Retrieval-augmented generation.
- Source-grounded assessments.
- Measurable user outcomes.
- Scalable resource-provider architecture.

The project is designed as a working AI product rather than a concept-only demonstration.

---

## Team

- Team member: `ADD_NAME`
- Role: `ADD_ROLE`
- GitHub: `ADD_GITHUB_PROFILE`

---

## License

Choose and add a suitable open-source license before publishing.

For example:

```text
MIT License
```

If the repository contains third-party assets or datasets, check their licence terms separately.

---

## Acknowledgements

SkillSetu uses open-source technologies and public educational-resource metadata.

We thank the maintainers of:

- React
- Vite
- FastAPI
- PostgreSQL
- pgvector
- PyMuPDF
- Sentence Transformers
- OER Commons
- Other open-source libraries used in this project
