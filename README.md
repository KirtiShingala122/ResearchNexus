# ResearchNexus

**AI-Powered Bibliometric and Research Discovery Platform**

> Based on the research paper: *"Bibliographic Analysis of Scientific Papers: A Methodological Review with Illustrative Applications to Information Retrieval and Natural Language Processing Research."*

ResearchNexus transforms a conceptual/methodological research paper into an **experimental system** that collects and analyses real scientific-paper datasets using the OpenAlex API.

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- MongoDB (optional for Phase 1)

### 1. Configure
```bash
cp .env.example .env
# Edit .env with your settings
```

### 2. Backend Server
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API runs at **http://localhost:8000** (Health check: `/api/health`)

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at **http://localhost:5173**

### 4. Data Collection
```bash
# In the project root, using the backend venv
backend\venv\Scripts\python.exe scripts\collect_openalex.py
```

## License
This project is part of an academic research experiment.
