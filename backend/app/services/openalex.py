import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenAlexService:
    BASE_URL = "https://api.openalex.org/works"

    def __init__(self):
        self.headers = {}
        if settings.OPENALEX_EMAIL:
            self.headers["mailto"] = settings.OPENALEX_EMAIL
        
        # httpx client with reasonable timeouts
        self.client = httpx.Client(headers=self.headers, timeout=30.0)

    def _build_filter_string(self, search_term: str, start_year: int, end_year: int) -> str:
        """
        Builds the filter string for OpenAlex.
        """
        filters = []
        
        # Add year range
        if start_year and end_year:
            filters.append(f"publication_year:{start_year}-{end_year}")
        elif start_year:
            filters.append(f"publication_year:>{start_year-1}")
        elif end_year:
            filters.append(f"publication_year:<{end_year+1}")
            
        return ",".join(filters)

    def fetch_papers(self, search_term: str, start_year: int, end_year: int, max_results: int = 100, page_size: int = 50) -> List[Dict[str, Any]]:
        """
        Fetches papers from OpenAlex matching the search term and publication year range.
        Handles pagination and rate limits.
        """
        papers = []
        page = 1
        
        # Build filter string
        filter_str = self._build_filter_string(search_term, start_year, end_year)
        
        while len(papers) < max_results:
            params = {
                "search": search_term,
                "filter": filter_str,
                "per-page": page_size,
                "page": page
            }
            
            try:
                response = self.client.get(self.BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
                
                results = data.get("results", [])
                if not results:
                    break # No more results
                    
                papers.extend(results)
                
                # Check if we've retrieved all available results
                meta = data.get("meta", {})
                count = meta.get("count", 0)
                if len(papers) >= count:
                    break
                
                page += 1
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error occurred: {e}")
                if e.response.status_code == 429:
                    logger.error("Rate limit exceeded.")
                break
            except httpx.RequestError as e:
                logger.error(f"An error occurred while requesting: {e}")
                break
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                break
                
        # Trim to max_results if we overshot
        return papers[:max_results]
        
    def extract_metadata(self, raw_paper: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts useful metadata from a raw OpenAlex work record.
        """
        # Safe extraction of nested fields
        primary_location = raw_paper.get("primary_location") or {}
        source = primary_location.get("source") or {}
        
        authors = []
        author_ids = []
        institutions = []
        countries = []
        
        for authorship in raw_paper.get("authorships", []):
            author = authorship.get("author", {})
            if author.get("display_name"):
                authors.append(author.get("display_name"))
            if author.get("id"):
                author_ids.append(author.get("id"))
                
            for inst in authorship.get("institutions", []):
                if inst.get("display_name"):
                    institutions.append(inst.get("display_name"))
                if inst.get("country_code"):
                    countries.append(inst.get("country_code"))
        
        # Deduplicate institutions and countries
        institutions = list(set(institutions))
        countries = list(set(countries))
        
        concepts = [c.get("display_name") for c in raw_paper.get("concepts", []) if c.get("display_name")]
        keywords = [k.get("keyword") for k in raw_paper.get("keywords", []) if k.get("keyword")]
        
        # Handle open access
        open_access = raw_paper.get("open_access", {})
        
        return {
            "id": raw_paper.get("id"),
            "doi": raw_paper.get("doi"),
            "title": raw_paper.get("title"),
            "abstract_inverted_index": raw_paper.get("abstract_inverted_index"), # Keep raw for reconstruction or leave as is
            "publication_year": raw_paper.get("publication_year"),
            "publication_date": raw_paper.get("publication_date"),
            "authors": "|".join(authors), # Serialize lists for CSV
            "author_ids": "|".join(author_ids),
            "institutions": "|".join(institutions),
            "countries": "|".join(countries),
            "concepts": "|".join(concepts),
            "keywords": "|".join(keywords),
            "citation_count": raw_paper.get("cited_by_count", 0),
            "reference_count": raw_paper.get("referenced_works_count", 0),
            "referenced_works": "|".join(raw_paper.get("referenced_works", [])),
            "source": source.get("display_name"),
            "is_oa": open_access.get("is_oa", False)
        }

    def close(self):
        self.client.close()

