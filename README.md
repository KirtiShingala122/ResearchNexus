# ResearchLens

**AI-Powered Bibliometric and Research Discovery Platform**

> Based on the research paper: *"Bibliographic Analysis of Scientific Papers: A Methodological Review with Illustrative Applications to Information Retrieval and Natural Language Processing Research."*

ResearchLens transforms a conceptual/methodological research paper into an **experimental system** that collects and analyses real scientific-paper datasets using the OpenAlex API.

---

## Architecture

```
ResearchNexus/
│
├── frontend/                 # React + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── layouts/          # Layout wrappers (sidebar + header)
│   │   ├── services/         # Axios API client
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Shared helper functions
│   │   ├── App.jsx           # Router & route definitions
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles & design tokens
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Python FastAPI
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── core/             # Configuration & settings
│   │   ├── models/           # MongoDB document schemas
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # Business logic layer
│   │   ├── analysis/         # Bibliometric analysis modules
│   │   ├── database/         # MongoDB connection manager
│   │   ├── utils/            # Shared helper functions
│   │   └── main.py           # FastAPI application entry point
│   └── requirements.txt
│
├── data/
│   ├── raw/                  # Raw data from OpenAlex
│   ├── processed/            # Cleaned & transformed data
│   └── exports/              # Analysis exports (CSV, JSON, XLSX)
│
├── notebooks/                # Jupyter notebooks for exploration
├── scripts/                  # Utility scripts
│
├── .env.example              # Environment variable template
├── .gitignore
└── README.md
```

## Technology Stack

| Layer        | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS v4, React Router, Recharts, Axios |
| Backend     | Python, FastAPI, Uvicorn                             |
| Database    | MongoDB (via Motor async driver)                     |
| Data Source | OpenAlex API                                         |
| NLP (planned) | scikit-learn, spaCy, sentence-transformers, NetworkX |

## Planned Analysis Modules

- **Publication Trend Analysis** — yearly output over time
- **Citation Analysis** — impact metrics and citation distributions
- **Author Analysis** — prolific authors, h-index, collaboration
- **Institution Analysis** — top institutions by output/citations
- **Country Analysis** — geographic distribution of research
- **Keyword Co-occurrence** — term networks and emerging topics
- **Co-authorship Network** — collaboration graph visualization
- **Bibliographic Coupling** — shared-reference similarity
- **Topic Modeling** — LDA / BERTopic latent topic discovery
- **Semantic Search** — sentence-transformer-powered retrieval
- **Temporal Research Trends** — how topics evolve over time

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB (optional for Phase 1)

### 1. Clone & configure

```bash
cp .env.example .env
# Edit .env with your settings
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**
Health check: `GET http://localhost:8000/api/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Current Status

**Phase 1 — Project Setup** ✅
- Clean folder structure
- FastAPI backend with health-check endpoint
- React frontend with dashboard layout, sidebar navigation, and placeholder pages
- Tailwind CSS v4 dark-theme design system
- MongoDB connection (gracefully skips if not running)

**Phase 2 — Data Collection** (next)
- OpenAlex API integration
- Paper ingestion pipeline
- MongoDB storage

## License

This project is part of an academic research experiment.
