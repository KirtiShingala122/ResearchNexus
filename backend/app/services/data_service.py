import pandas as pd
from pathlib import Path
import os

class DataService:
    _instance = None
    df = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataService, cls).__new__(cls)
            cls._instance.load_data()
        return cls._instance

    def load_data(self):
        # Path to processed csv
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        csv_path = base_dir / "data" / "processed" / "ir_nlp_papers.csv"
        
        if csv_path.exists():
            self.df = pd.read_csv(csv_path)
            # Handle NaNs
            self.df = self.df.fillna({
                'title': '',
                'abstract': '',
                'authors': '',
                'author_ids': '',
                'institutions': '',
                'countries': '',
                'concepts': '',
                'keywords': '',
                'referenced_works': '',
                'source': '',
                'citation_count': 0,
                'reference_count': 0
            })
        else:
            self.df = pd.DataFrame()

    def get_dataframe(self):
        return self.df

data_service = DataService()
