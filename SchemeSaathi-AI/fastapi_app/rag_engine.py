"""
SchemeSaathi AI - RAG Knowledge Base & Guideline Search Engine (STEP 10)
Indexes official scheme guidelines, circulars, and FAQs for grounded semantic search with citations.
"""

from typing import Dict, List, Any, Optional
from fastapi_app.dataset import SCHEMES_DATASET, get_all_schemes
import re


# Knowledge base chunks initialized from official scheme guidelines
RAG_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "id": "rag-pmegp-subsidy",
        "schemeId": "pmegp",
        "title": "PMEGP Subsidy Rates & Rural vs Urban Criteria",
        "content": "Under PMEGP, the margin money subsidy is 15% for General category in Urban areas, 25% for General in Rural areas. For Special categories (SC/ST/OBC/Minorities/Women/Ex-servicemen/PH), the subsidy is 25% in Urban areas and 35% in Rural areas. Maximum project cost is ₹50 Lakhs for manufacturing and ₹20 Lakhs for service sector.",
        "sourceUrl": "https://www.kviconline.gov.in/pmegpeportal/",
        "tags": ["pmegp", "subsidy", "rural", "urban", "kvic", "margin money"]
    },
    {
        "id": "rag-pm-vishwakarma-trades",
        "schemeId": "pm-vishwakarma",
        "title": "PM Vishwakarma Eligible Artisans & Toolkit Grant",
        "content": "PM Vishwakarma scheme covers 18 traditional trades: Carpenter, Boat Maker, Armourer, Blacksmith, Hammer and Tool Kit Maker, Locksmith, Goldsmith, Potter, Sculptor, Cobbler, Mason, Basket/Mat/Broom Maker, Doll & Toy Maker, Barber, Garland Maker, Washerman, Tailor, and Fishing Net Maker. Provides ₹15,000 digital voucher for toolkits and loans up to ₹3 Lakh at 5% interest.",
        "sourceUrl": "https://pmvishwakarma.gov.in",
        "tags": ["pm vishwakarma", "artisans", "toolkit", "interest subvention", "loans"]
    },
    {
        "id": "rag-mudra-categories",
        "schemeId": "mudra",
        "title": "MUDRA Loan Categories - Shishu, Kishor & Tarun",
        "content": "Pradhan Mantri MUDRA Yojana divides credit into three tiers based on stage of growth: Shishu covers loans up to ₹50,000 for nascent entrepreneurs. Kishor covers loans from ₹50,000 up to ₹5 Lakhs for expanding units. Tarun covers loans above ₹5 Lakhs up to ₹10 Lakhs. No collateral or third-party guarantee is required.",
        "sourceUrl": "https://mudra.org.in",
        "tags": ["mudra", "shishu", "kishor", "tarun", "collateral free", "working capital"]
    },
    {
        "id": "rag-cgtmse-guarantee",
        "schemeId": "cgtmse",
        "title": "CGTMSE Guarantee Coverage & Upper Limits",
        "content": "CGTMSE offers credit guarantee coverage up to ₹5 Crore for credit facilities extended by Member Lending Institutions (MLIs) to Micro and Small Enterprises. Guarantee cover extends up to 85% for micro enterprises, women entrepreneurs, and units located in SC/ST or North Eastern Region.",
        "sourceUrl": "https://cgtmse.in",
        "tags": ["cgtmse", "credit guarantee", "collateral free", "msme finance", "women"]
    },
    {
        "id": "rag-pmfme-odop",
        "schemeId": "pmfme",
        "title": "PMFME One District One Product (ODOP) Guidelines",
        "content": "PMFME scheme provides credit-linked capital subsidy @ 35% of eligible project cost with a maximum ceiling of ₹10 Lakh per unit. The scheme prioritizes units adopting the One District One Product (ODOP) framework, supporting cold chain, branding, and packaging.",
        "sourceUrl": "https://pmfme.mofpi.gov.in",
        "tags": ["pmfme", "food processing", "odop", "subsidy", "fssai"]
    },
    {
        "id": "rag-standup-women",
        "schemeId": "stand-up-india",
        "title": "Stand-Up India Eligibility for Women & SC/ST",
        "content": "Stand-Up India facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower and at least one Woman borrower per bank branch for setting up greenfield enterprises in manufacturing, services, or trading.",
        "sourceUrl": "https://standupmitra.in",
        "tags": ["stand-up india", "women entrepreneurs", "sc st", "greenfield", "sidbi"]
    },
    {
        "id": "rag-sisfs-grants",
        "schemeId": "startup-india-seed",
        "title": "Startup India Seed Fund Scheme (SISFS) Grant vs Debt",
        "content": "SISFS provides grants up to ₹20 Lakhs for validation of proof of concept, prototype development, and product trials. Startups can also receive up to ₹50 Lakhs for market entry and commercialization through convertible debentures or debt.",
        "sourceUrl": "https://seedfund.startupindia.gov.in",
        "tags": ["sisfs", "seed fund", "startup india", "dpiit", "prototype", "grant"]
    }
]


def search_rag_knowledge(query: str, top_k: int = 4) -> Dict[str, Any]:
    """
    Performs keyword & semantic relevance ranking over RAG knowledge chunks.
    Returns matched chunks, grounding summaries, and source citations.
    """
    query_words = set(re.findall(r"\w+", query.lower()))

    results = []
    for chunk in RAG_KNOWLEDGE_BASE:
        text_to_search = f"{chunk['title']} {chunk['content']} {' '.join(chunk['tags'])}".lower()
        score = sum(1 for word in query_words if word in text_to_search and len(word) > 2)

        # Extra weight for exact tag matches
        for tag in chunk["tags"]:
            if tag in query.lower():
                score += 3

        if score > 0:
            results.append((score, chunk))

    # Also search scheme dataset summaries
    for scheme in SCHEMES_DATASET:
        text_to_search = f"{scheme.name} {scheme.shortName} {scheme.description} {scheme.category} {scheme.guidelineSummary}".lower()
        score = sum(1 for word in query_words if word in text_to_search and len(word) > 2)
        if score > 0:
            results.append((
                score,
                {
                    "id": f"rag-scheme-{scheme.id}",
                    "schemeId": scheme.id,
                    "title": f"{scheme.name} Official Summary",
                    "content": scheme.guidelineSummary or scheme.description,
                    "sourceUrl": scheme.source,
                    "tags": [scheme.shortName.lower(), scheme.category.lower(), scheme.sector.lower()]
                }
            ))

    results.sort(key=lambda x: x[0], reverse=True)
    top_chunks = [item[1] for item in results[:top_k]]

    if not top_chunks:
        # Fallback to top 2 general chunks
        top_chunks = RAG_KNOWLEDGE_BASE[:2]

    sources = list(set(chunk["sourceUrl"] for chunk in top_chunks))
    summary = "\n\n".join([f"• **{c['title']}**: {c['content']}" for c in top_chunks])

    return {
        "query": query,
        "summary": summary,
        "chunks": top_chunks,
        "sources": sources
    }
