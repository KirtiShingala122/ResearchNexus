import sys
import os
import json
import logging
from pathlib import Path
import pandas as pd

# Add the backend directory to sys.path so we can import from app
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.services.openalex import OpenAlexService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def reconstruct_abstract(inverted_index: dict) -> str:
    """Reconstructs the abstract from OpenAlex's abstract_inverted_index."""
    if not inverted_index:
        return ""
    
    # Inverted index format: {"Word": [pos1, pos2], ...}
    # We need to find the max position to know the length of the abstract
    max_pos = 0
    for positions in inverted_index.values():
        if positions:
            max_pos = max(max_pos, max(positions))
            
    abstract_words = [""] * (max_pos + 1)
    
    for word, positions in inverted_index.items():
        for pos in positions:
            abstract_words[pos] = word
            
    return " ".join(abstract_words).strip()

def main():
    logger.info("Starting OpenAlex data collection...")
    
    service = OpenAlexService()
    
    all_raw_papers = []
    all_processed_papers = []
    
    # Base paths
    base_dir = Path(__file__).resolve().parent.parent
    raw_dir = base_dir / "data" / "raw"
    processed_dir = base_dir / "data" / "processed"
    
    # Ensure directories exist
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        for term in settings.SEARCH_TERMS:
            logger.info(f"Fetching papers for search term: '{term}' ({settings.START_YEAR}-{settings.END_YEAR})")
            
            # Since we have multiple terms, let's divide max papers or fetch MAX_PAPERS per term.
            # Let's fetch MAX_PAPERS per term to be safe, or MAX_PAPERS total.
            # We'll do MAX_PAPERS per term.
            raw_papers = service.fetch_papers(
                search_term=term,
                start_year=settings.START_YEAR,
                end_year=settings.END_YEAR,
                max_results=settings.MAX_PAPERS,
                page_size=settings.API_PAGE_SIZE
            )
            
            logger.info(f"Retrieved {len(raw_papers)} raw records for '{term}'.")
            all_raw_papers.extend(raw_papers)
            
            # Process papers
            for raw_paper in raw_papers:
                processed_paper = service.extract_metadata(raw_paper)
                # Reconstruct abstract
                inverted_index = processed_paper.pop("abstract_inverted_index", None)
                processed_paper["abstract"] = reconstruct_abstract(inverted_index)
                
                # Add a column for the search term to track provenance
                processed_paper["search_term"] = term
                
                all_processed_papers.append(processed_paper)
                
    finally:
        service.close()
        
    if not all_raw_papers:
        logger.warning("No records retrieved. Exiting.")
        return

    # Deduplicate processed papers by ID in case of overlap between search terms
    df = pd.DataFrame(all_processed_papers)
    initial_count = len(df)
    df.drop_duplicates(subset=['id'], inplace=True)
    dedup_count = len(df)
    
    logger.info(f"Deduplication: removed {initial_count - dedup_count} overlapping records.")
    
    # Output file paths
    timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
    raw_file = raw_dir / f"openalex_raw_{timestamp}.json"
    csv_file = processed_dir / f"ir_nlp_papers.csv"
    
    # Save raw JSON
    with open(raw_file, 'w', encoding='utf-8') as f:
        json.dump(all_raw_papers, f, ensure_ascii=False, indent=2)
        
    # Save processed CSV
    df.to_csv(csv_file, index=False, encoding='utf-8')
    
    # Print progress summary
    print("\n" + "="*50)
    print("OPENALEX DATA COLLECTION SUMMARY")
    print("="*50)
    print(f"Search Terms:    {', '.join(settings.SEARCH_TERMS)}")
    print(f"Date Range:      {settings.START_YEAR} - {settings.END_YEAR}")
    print(f"Target Max:      {settings.MAX_PAPERS} per term")
    print("-" * 50)
    print(f"Raw Records:     {len(all_raw_papers)} (Saved to {raw_file.relative_to(base_dir)})")
    print(f"Valid/Unique:    {dedup_count} (Saved to {csv_file.relative_to(base_dir)})")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
