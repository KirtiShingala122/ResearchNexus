import re
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from app.services.data_service import data_service

# Download necessary NLTK data if not already present
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

class NLPAnalyzer:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLPAnalyzer, cls).__new__(cls)
            cls._instance.is_processed = False
            cls._instance.df = None
            cls._instance.tfidf_results = None
            cls._instance.lda_models = {} # Cache LDA by n_topics
        return cls._instance

    def preprocess_text(self, text: str) -> str:
        if not isinstance(text, str) or not text.strip():
            return ""
            
        # Lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove punctuation and numbers
        text = re.sub(r'[^a-z\s]', ' ', text)
        
        # Tokenize (simple split by whitespace)
        tokens = text.split()
        
        # Remove stopwords and lemmatize
        tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words and len(word) > 2]
        
        return " ".join(tokens)

    def process_dataset(self):
        if self.is_processed:
            return
            
        df = data_service.get_dataframe()
        if df.empty:
            return
            
        # We need a copy or to work with the service's df directly
        # Let's add a derived column to the original dataframe
        if 'cleaned_abstract' not in df.columns:
            df['cleaned_abstract'] = df['abstract'].apply(self.preprocess_text)
            
        self.df = df
        self.is_processed = True
        
        # Pre-compute TF-IDF
        self._compute_tfidf()

    def _compute_tfidf(self):
        valid_docs = self.df[self.df['cleaned_abstract'] != '']
        if valid_docs.empty:
            self.tfidf_results = []
            return
            
        vectorizer = TfidfVectorizer(max_features=100)
        tfidf_matrix = vectorizer.fit_transform(valid_docs['cleaned_abstract'])
        
        feature_names = vectorizer.get_feature_names_out()
        
        # Sum tfidf scores across all documents
        sums = tfidf_matrix.sum(axis=0)
        
        # Map words to their scores
        data = []
        for col, term in enumerate(feature_names):
            data.append((term, sums[0, col]))
            
        data = sorted(data, key=lambda x: x[1], reverse=True)
        
        self.tfidf_results = [{"term": term, "score": float(score)} for term, score in data]

    def get_tfidf(self) -> Dict[str, Any]:
        self.process_dataset()
        if not self.is_processed or not self.tfidf_results:
            return {"terms": []}
            
        return {"terms": self.tfidf_results[:50]}

    def get_topics(self, n_topics: int = 8) -> Dict[str, Any]:
        self.process_dataset()
        if not self.is_processed:
            return {"topics": [], "error": "Dataset empty or not processed"}
            
        valid_docs = self.df[self.df['cleaned_abstract'] != '']
        if valid_docs.empty:
            return {"topics": [], "error": "No valid abstracts"}
            
        # Use cache if available
        if n_topics in self.lda_models:
            return self.lda_models[n_topics]
            
        # Otherwise compute LDA
        vectorizer = CountVectorizer(max_df=0.95, min_df=2, max_features=1000)
        tf = vectorizer.fit_transform(valid_docs['cleaned_abstract'])
        feature_names = vectorizer.get_feature_names_out()
        
        lda = LatentDirichletAllocation(n_components=n_topics, random_state=42, max_iter=10)
        lda.fit(tf)
        
        # Get document topics
        doc_topic_dist = lda.transform(tf)
        dominant_topics = doc_topic_dist.argmax(axis=1)
        
        # Count papers per topic
        topic_counts = pd.Series(dominant_topics).value_counts().to_dict()
        
        # Calculate perplexity (a measure of model quality; lower is better)
        perplexity = lda.perplexity(tf)
        
        topics = []
        for topic_idx, topic in enumerate(lda.components_):
            top_features_ind = topic.argsort()[:-11:-1]
            top_features = [feature_names[i] for i in top_features_ind]
            
            topics.append({
                "id": topic_idx,
                "terms": top_features,
                "paper_count": int(topic_counts.get(topic_idx, 0))
            })
            
        # Save dominant topics to dataframe for temporal analysis & paper explorer
        self.df[f'dominant_topic_{n_topics}'] = -1
        self.df[f'topic_prob_{n_topics}'] = 0.0
        
        self.df.loc[valid_docs.index, f'dominant_topic_{n_topics}'] = dominant_topics
        self.df.loc[valid_docs.index, f'topic_prob_{n_topics}'] = doc_topic_dist.max(axis=1)
        
        result = {
            "topics": topics,
            "total_analyzed": len(valid_docs),
            "total_skipped": len(self.df) - len(valid_docs),
            "n_topics": n_topics,
            "quality": {
                "metric": "Perplexity",
                "score": float(perplexity),
                "note": "Perplexity is a statistical measure of how well a probability model predicts a sample. A lower perplexity score indicates better generalization performance. Note that scikit-learn does not natively support UMass or CV coherence metrics out-of-the-box."
            }
        }
        
        self.lda_models[n_topics] = result
        return result

    def get_topic_trends(self, n_topics: int = 8) -> Dict[str, Any]:
        # Ensure topics are computed
        topics_res = self.get_topics(n_topics)
        if "error" in topics_res:
            return {"trends": []}
            
        col = f'dominant_topic_{n_topics}'
        
        valid_docs = self.df[self.df[col] != -1].copy()
        valid_docs['publication_year'] = pd.to_numeric(valid_docs['publication_year'], errors='coerce')
        valid_docs = valid_docs.dropna(subset=['publication_year'])
        valid_docs['publication_year'] = valid_docs['publication_year'].astype(int)
        
        # Group by year and topic
        trends = valid_docs.groupby(['publication_year', col]).size().unstack(fill_value=0)
        
        # Convert to percentage per year
        trends_pct = trends.div(trends.sum(axis=1), axis=0) * 100
        
        result = []
        for year in trends_pct.index:
            year_data = {"year": int(year)}
            for topic_id in trends_pct.columns:
                year_data[f"Topic {topic_id}"] = round(float(trends_pct.loc[year, topic_id]), 2)
            result.append(year_data)
            
        return {"trends": result}

nlp_analyzer = NLPAnalyzer()
