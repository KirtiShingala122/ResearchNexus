from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from app.core.config import settings
from app.services.data_service import data_service
from app.analysis import bibliometrics
import math

router = APIRouter(tags=["api"])

@router.get("/health")
async def health_check():
    """Return service health status."""
    return {
        "status": "ok",
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/dashboard/summary")
async def get_dashboard_summary():
    return bibliometrics.get_dashboard_summary()

@router.get("/papers")
async def get_papers(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    year: int = Query(None),
    sort_by: str = Query("citation_count")
):
    df = data_service.get_dataframe()
    if df.empty:
        return {"papers": [], "total": 0, "page": page, "total_pages": 0}
        
    filtered = df.copy()
    
    if search:
        # Case insensitive substring match in title
        filtered = filtered[filtered['title'].str.contains(search, case=False, na=False)]
        
    if year:
        filtered = filtered[filtered['publication_year'] == year]
        
    if sort_by in filtered.columns:
        filtered = filtered.sort_values(by=sort_by, ascending=False)
        
    total = len(filtered)
    total_pages = math.ceil(total / limit)
    
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated = filtered.iloc[start_idx:end_idx]
    
    # Fill Nans for JSON serialization
    paginated = paginated.fillna('')
    
    return {
        "papers": paginated.to_dict('records'),
        "total": total,
        "page": page,
        "total_pages": total_pages
    }

@router.get("/papers/{paper_id}")
async def get_paper(paper_id: str):
    df = data_service.get_dataframe()
    if df.empty:
        raise HTTPException(status_code=404, detail="Dataset is empty")
        
    paper = df[df['id'] == paper_id]
    if paper.empty:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    result = paper.iloc[0].fillna('').to_dict()
    return result

@router.get("/analysis/publications")
async def get_analysis_publications():
    return bibliometrics.get_publications_analysis()

@router.get("/analysis/citations")
async def get_analysis_citations():
    return bibliometrics.get_citations_analysis()

@router.get("/analysis/authors")
async def get_analysis_authors():
    return bibliometrics.get_authors_analysis()

@router.get("/analysis/keywords")
async def get_analysis_keywords():
    return bibliometrics.get_keyword_cooccurrence()

@router.get("/analysis/coauthors")
async def get_analysis_coauthors():
    return bibliometrics.get_coauthorship_network()

@router.get("/analysis/coupling")
async def get_analysis_coupling():
    return bibliometrics.get_bibliographic_coupling()

# --- NLP Endpoints ---
from app.analysis.nlp import nlp_analyzer

@router.get("/nlp/tfidf")
async def get_nlp_tfidf():
    return nlp_analyzer.get_tfidf()

@router.get("/nlp/topics")
async def get_nlp_topics(n_topics: int = Query(8, ge=2, le=20)):
    return nlp_analyzer.get_topics(n_topics)

@router.get("/nlp/topic-trends")
async def get_nlp_topic_trends(n_topics: int = Query(8, ge=2, le=20)):
    return nlp_analyzer.get_topic_trends(n_topics)
