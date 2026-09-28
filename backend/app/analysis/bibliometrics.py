import pandas as pd
import networkx as nx
from typing import Dict, Any, List
from collections import Counter
import itertools
from app.services.data_service import data_service

def get_dashboard_summary() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {"error": "Dataset is empty"}
    
    total_papers = len(df)
    total_citations = int(df['citation_count'].sum())
    
    # Calculate unique authors
    all_authors = []
    for authors_str in df['authors']:
        if authors_str:
            all_authors.extend(authors_str.split('|'))
    unique_authors = len(set(all_authors))
    
    # Calculate unique institutions
    all_institutions = []
    for inst_str in df['institutions']:
        if inst_str:
            all_institutions.extend(inst_str.split('|'))
    unique_institutions = len(set(all_institutions))
    
    # Year range
    years = df['publication_year'].dropna().astype(int)
    year_range = f"{years.min()} - {years.max()}" if not years.empty else ""
    
    # Publications per year
    pubs_per_year = years.value_counts().sort_index().reset_index()
    pubs_per_year.columns = ['year', 'count']
    pubs_per_year_list = pubs_per_year.to_dict('records')
    
    # Top 10 most cited papers
    top_papers = df.nlargest(10, 'citation_count')[['title', 'citation_count', 'publication_year']].to_dict('records')
    
    # Top 10 authors
    author_counts = Counter(all_authors)
    top_authors = [{"author": k, "count": v} for k, v in author_counts.most_common(10)]
    
    return {
        "total_papers": total_papers,
        "total_citations": total_citations,
        "unique_authors": unique_authors,
        "unique_institutions": unique_institutions,
        "year_range": year_range,
        "publications_per_year": pubs_per_year_list,
        "top_papers": top_papers,
        "top_authors": top_authors
    }

def get_publications_analysis() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {"data": []}
        
    years = df['publication_year'].dropna().astype(int)
    pubs_per_year = years.value_counts().sort_index().reset_index()
    pubs_per_year.columns = ['year', 'count']
    return {"data": pubs_per_year.to_dict('records')}

def get_citations_analysis() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {}
        
    total_citations = int(df['citation_count'].sum())
    avg_citations = float(df['citation_count'].mean())
    
    top_cited = df.nlargest(20, 'citation_count')[['title', 'citation_count', 'authors', 'publication_year']].to_dict('records')
    
    # Distribution: bins of citations
    bins = [-1, 0, 10, 50, 100, 500, float('inf')]
    labels = ['0', '1-10', '11-50', '51-100', '101-500', '>500']
    dist = pd.cut(df['citation_count'], bins=bins, labels=labels).value_counts().sort_index()
    distribution = [{"range": k, "count": v} for k, v in dist.items()]
    
    return {
        "total_citations": total_citations,
        "average_citations": round(avg_citations, 2),
        "top_cited_papers": top_cited,
        "citation_distribution": distribution
    }

def get_authors_analysis() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {}
        
    author_stats = {}
    
    for _, row in df.iterrows():
        authors = str(row['authors']).split('|') if row['authors'] else []
        ids = str(row['author_ids']).split('|') if row['author_ids'] else []
        citations = int(row['citation_count']) if pd.notna(row['citation_count']) else 0
        
        # fallback if ids missing
        if len(ids) != len(authors):
            ids = authors
            
        for name, aid in zip(authors, ids):
            if not name:
                continue
            if aid not in author_stats:
                author_stats[aid] = {"name": name, "publications": 0, "citations": 0}
            author_stats[aid]["publications"] += 1
            author_stats[aid]["citations"] += citations
            
    sorted_authors = sorted(author_stats.values(), key=lambda x: x['publications'], reverse=True)
    
    return {
        "top_authors_by_publications": sorted_authors[:20],
        "top_authors_by_citations": sorted(author_stats.values(), key=lambda x: x['citations'], reverse=True)[:20]
    }

def get_keyword_cooccurrence() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {"nodes": [], "links": []}
        
    keyword_freq = Counter()
    co_occurrences = Counter()
    
    for _, row in df.iterrows():
        # Use concepts as they are consistently populated by OpenAlex
        kw_str = str(row['concepts']) if pd.notna(row['concepts']) else ""
        if not kw_str:
            continue
            
        # Normalize: lower, strip
        kws = [k.strip().lower() for k in kw_str.split('|') if k.strip()]
        kws = list(set(kws)) # unique per paper
        
        for kw in kws:
            keyword_freq[kw] += 1
            
        for pair in itertools.combinations(sorted(kws), 2):
            co_occurrences[pair] += 1
            
    # Keep top 50 keywords for performance and readability
    top_keywords = set([k for k, v in keyword_freq.most_common(50)])
    
    nodes = [{"id": kw, "name": kw, "val": keyword_freq[kw]} for kw in top_keywords]
    links = [{"source": u, "target": v, "weight": count} 
             for (u, v), count in co_occurrences.items() 
             if u in top_keywords and v in top_keywords and count > 1]
             
    return {"nodes": nodes, "links": links}

def get_coauthorship_network() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {"nodes": [], "links": [], "metrics": {}}
        
    co_occurrences = Counter()
    author_info = {}
    
    for _, row in df.iterrows():
        authors = str(row['authors']).split('|') if row['authors'] else []
        ids = str(row['author_ids']).split('|') if row['author_ids'] else []
        
        if len(ids) != len(authors):
            ids = authors
            
        valid_authors = []
        for name, aid in zip(authors, ids):
            if name and aid:
                author_info[aid] = name
                valid_authors.append(aid)
                
        for pair in itertools.combinations(sorted(valid_authors), 2):
            co_occurrences[pair] += 1
            
    # Filter to most connected authors to avoid huge graphs
    G = nx.Graph()
    for (u, v), count in co_occurrences.items():
        G.add_edge(u, v, weight=count)
        
    # Get top nodes by degree
    degrees = dict(G.degree())
    top_nodes = sorted(degrees.keys(), key=lambda x: degrees[x], reverse=True)[:100]
    
    subgraph = G.subgraph(top_nodes)
    
    nodes = [{"id": n, "name": author_info.get(n, n), "val": degrees[n]} for n in subgraph.nodes()]
    links = [{"source": u, "target": v, "weight": d['weight']} for u, v, d in subgraph.edges(data=True)]
    
    return {
        "nodes": nodes, 
        "links": links,
        "metrics": {
            "total_collaborations": sum(co_occurrences.values()),
            "most_connected": [{"name": author_info.get(n, n), "connections": degrees[n]} for n in top_nodes[:5]]
        }
    }

def get_bibliographic_coupling() -> Dict[str, Any]:
    df = data_service.get_dataframe()
    if df.empty:
        return {"nodes": [], "links": []}
        
    # We only care about papers that have referenced works
    papers_with_refs = []
    
    for _, row in df.iterrows():
        refs = str(row['referenced_works']).split('|') if row['referenced_works'] else []
        if refs and len(refs) > 0:
            papers_with_refs.append({
                "id": row['id'],
                "title": row['title'],
                "refs": set(refs)
            })
            
    # Limit to top 200 cited papers to keep network size reasonable
    top_papers_df = df.nlargest(200, 'citation_count')
    top_ids = set(top_papers_df['id'])
    
    filtered_papers = [p for p in papers_with_refs if p['id'] in top_ids]
    
    nodes = []
    links = []
    
    for p in filtered_papers:
        nodes.append({
            "id": p['id'],
            "name": p['title'][:50] + "..." if len(p['title']) > 50 else p['title'],
            "val": 1
        })
        
    for p1, p2 in itertools.combinations(filtered_papers, 2):
        shared = len(p1['refs'].intersection(p2['refs']))
        if shared > 2: # Threshold to reduce noise
            links.append({
                "source": p1['id'],
                "target": p2['id'],
                "weight": shared
            })
            
    return {"nodes": nodes, "links": links}
