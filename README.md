# ResearchNexus

## AI-Powered Bibliometric Analysis and Research Discovery Platform for IR and NLP

ResearchNexus is an experimental research platform developed for the **Information Retrieval and Natural Language Processing (IR/NLP)** domain. It combines traditional bibliometric analysis with NLP-based text analysis to study the growth, structure, relationships, and evolving research themes within scientific literature.

The project is an experimental implementation based on the research paper:

> **"Bibliographic Analysis of Scientific Papers: A Methodological Review with Illustrative Applications to Information Retrieval and Natural Language Processing Research."**

The accompanying research paper presents the theoretical and methodological foundations of bibliographic analysis, including citation analysis, co-citation analysis, bibliographic coupling, co-word analysis, co-authorship analysis, performance analysis, and science mapping.

ResearchNexus extends those concepts into a working experimental system by collecting real scientific-paper metadata from **OpenAlex**, preprocessing the collected literature, performing bibliometric analysis, and applying Natural Language Processing techniques to scientific paper abstracts.

The purpose of the project is not simply to visualize publication statistics, but to investigate how bibliometric methods and NLP-based text analysis can work together to understand a rapidly evolving research domain.

---

# 1. Project Overview

Scientific research produces a continuously increasing number of publications, making it difficult for researchers to manually understand the development and structure of an entire research field.

Traditional literature reviews provide detailed qualitative understanding, but analyzing thousands of scientific publications manually is time-consuming.

Bibliometric analysis addresses this problem by applying quantitative methods to scientific publication metadata such as:

- Publications
- Authors
- Citations
- Keywords
- References
- Institutions
- Countries
- Publication sources

ResearchNexus builds on this approach and introduces an additional NLP layer that analyzes the textual content of scientific paper abstracts.

The system therefore combines two complementary perspectives:

```text
Scientific Literature
        |
        v
   OpenAlex Dataset
        |
        v
  Data Preprocessing
        |
        +-----------------------+
        |                       |
        v                       v
Bibliometric Analysis      NLP Analysis
        |                       |
        |                  Abstract Processing
        |                       |
        |                  TF-IDF Analysis
        |                       |
        |                  Topic Modeling
        |                       |
        +-----------+-----------+
                    |
                    v
            Research Insights
                    |
                    v
        Research Trend Analysis