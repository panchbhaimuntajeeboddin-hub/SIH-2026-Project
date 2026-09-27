"""
SchemeSaathi AI - FastAPI Microservice Backend (STEP 2)
Production-grade FastAPI server integrating 20 schemes, rule engine, matching score,
Top 5 recommendations, LLM/NLP, RAG, OCR, and Voice/Multilingual support.
"""

from fastapi import FastAPI, HTTPException, Query, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from fastapi_app.dataset import get_all_schemes, get_scheme_by_id, SCHEMES_DATASET, SchemeModel
from fastapi_app.rule_engine import evaluate_hard_rules
from fastapi_app.matching_engine import calculate_scheme_score, get_recommendations_and_top5
from fastapi_app.ocr_engine import process_document_ocr
from fastapi_app.rag_engine import search_rag_knowledge
from fastapi_app.llm_engine import parse_nlp_intent, generate_llm_explanation, generate_dpr_outline
from fastapi_app.voice_engine import get_supported_languages, generate_voice_payload, translate_ui_string

app = FastAPI(
    title="SchemeSaathi-AI Industrial API Engine",
    description="Automated AI Platform for Government Scheme Discovery, Matching, RAG, OCR & Voice Assistance",
    version="2.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Models
class ProfileSchema(BaseModel):
    name: str = "Ananya Shah"
    age: int = 29
    gender: str = "Female"
    category: str = "OBC"
    womanEntrepreneur: str = "Yes"
    youthEntrepreneur: str = "Yes"
    state: str = "Maharashtra"
    district: str = "Pune"
    annualIncome: float = 300000.0
    annualFamilyIncome: float = 300000.0
    investmentAvailable: float = 200000.0
    investmentPlantMachinery: float = 700000.0
    projectCost: float = 1200000.0
    loanRequirement: float = 900000.0
    businessType: str = "Manufacturing"
    industry: str = "Food Processing"
    businessSector: str = "Food Processing"
    businessStatus: str = "Growing business"
    location: str = "Rural"
    ruralUrban: str = "Rural"
    expectedTurnover: float = 2400000.0
    employees: int = 4
    education: str = "Graduate"
    experience: str = "3 Years"
    training: str = "Basic entrepreneurship"
    previousLoan: str = "No"
    previousAssistance: str = "No"


class AskAssistantSchema(BaseModel):
    query: str
    language: str = "en"
    schemeId: Optional[str] = None


class OCRUploadSchema(BaseModel):
    documentName: str
    documentType: str


# Root Health Check
@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "SchemeSaathi-AI FastAPI Engine",
        "version": "2.0.0",
        "schemesLoaded": len(SCHEMES_DATASET)
    }


import math

# STEP 4: Get All 20 Schemes
@app.get("/api/v1/schemes")
def list_schemes(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    page: Optional[int] = Query(None),
    pageSize: Optional[int] = Query(None)
):
    schemes = get_all_schemes()
    if search:
        s_lower = search.lower()
        schemes = [
            s for s in schemes
            if s_lower in f"{s.name} {s.shortName} {s.description} {s.category} {s.sector}".lower()
        ]
    if category:
        schemes = [s for s in schemes if s.category.lower() == category.lower()]
    if sector:
        schemes = [s for s in schemes if sector.lower() in s.sector.lower()]

    total = len(schemes)
    if page is not None or pageSize is not None:
        p = max(1, page or 1)
        ps = max(1, pageSize or 20)
        total_pages = math.ceil(total / ps) or 1
        start_idx = (p - 1) * ps
        paginated_schemes = schemes[start_idx:start_idx + ps]
        return {
            "success": True,
            "page": p,
            "pageSize": ps,
            "total": total,
            "totalPages": total_pages,
            "data": paginated_schemes,
            "schemes": paginated_schemes
        }

    return schemes


# Get Scheme Detail by ID
@app.get("/api/v1/schemes/{scheme_id}")
def get_scheme(scheme_id: str):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


# STEP 6 & STEP 7 & STEP 8: Match Profile & Return Top 5 + All Recommendations
@app.post("/api/v1/matching/recommendations")
def get_matching_recommendations(profile: ProfileSchema, documents: Optional[List[Dict[str, Any]]] = Body(default=[])):
    profile_dict = profile.dict()
    recommendations = get_recommendations_and_top5(profile_dict, documents)
    return recommendations


# STEP 8: Top 5 Display Endpoint
@app.post("/api/v1/matching/top5")
def get_top5_schemes(profile: ProfileSchema):
    profile_dict = profile.dict()
    result = get_recommendations_and_top5(profile_dict)
    return {
        "top5": result["top5"],
        "totalEligible": len(result["eligible"])
    }


# STEP 9: LLM Rationale & NLP Intent Parser
@app.post("/api/v1/llm/explain/{scheme_id}")
def explain_scheme_eligibility(scheme_id: str, profile: ProfileSchema):
    profile_dict = profile.dict()
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    is_eligible, disqualifications, _ = evaluate_hard_rules(profile_dict, scheme)
    explanation = generate_llm_explanation(scheme_id, profile_dict, is_eligible, disqualifications)

    return {
        "schemeId": scheme_id,
        "isEligible": is_eligible,
        "explanation": explanation
    }


# STEP 9: Detailed Project Report (DPR) Generator
@app.post("/api/v1/llm/dpr/{scheme_id}")
def generate_dpr(scheme_id: str, profile: ProfileSchema):
    profile_dict = profile.dict()
    return generate_dpr_outline(scheme_id, profile_dict)


# STEP 10: RAG Guideline Search Endpoint
@app.get("/api/v1/rag/search")
def rag_search(query: str = Query(...)):
    return search_rag_knowledge(query)


# STEP 11: OCR Document AI Scanner Endpoint
@app.post("/api/v1/ocr/process")
def process_ocr(data: OCRUploadSchema, profile: Optional[ProfileSchema] = Body(default=None)):
    prof_dict = profile.dict() if profile else {}
    result = process_document_ocr(data.documentName, data.documentType, prof_dict)
    return result


# STEP 9 & 10 & 12: Interactive Voice & AI Scheme Assistant
@app.post("/api/v1/assistant/ask")
def ask_assistant(body: AskAssistantSchema, profile: Optional[ProfileSchema] = Body(default=None)):
    prof_dict = profile.dict() if profile else {}
    query = body.query
    lang = body.language or "en"

    # Run NLP intent parser
    intent = parse_nlp_intent(query)
    # Run RAG knowledge lookup
    rag = search_rag_knowledge(query)

    user_name = prof_dict.get("name", "Entrepreneur")
    answer = (
        f"Namaste {user_name}! {rag['summary']}\n\n"
        f"Based on your query, we parsed sector interest in **{intent['detectedSector']}** "
        f"and location **{intent['detectedLocation']}**. Check our Top 5 recommendation tab for customized scheme rankings."
    )

    voice_payload = generate_voice_payload(answer, lang)

    return {
        "query": query,
        "answer": answer,
        "intent": intent,
        "ragSources": rag["sources"],
        "voice": voice_payload
    }


# STEP 12: Multilingual Support Languages Endpoint
@app.get("/api/v1/multilingual/languages")
def list_languages():
    return get_supported_languages()


# STEP 13: data.gov.in UDYAM API Endpoint
import os
import urllib.request
import urllib.parse
import json

@app.get("/api/v1/udyam")
@app.get("/api/udyam")
def fetch_udyam_data(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    api_key = os.getenv("DATA_GOV_API_KEY")
    resource_id = os.getenv("DATA_GOV_RESOURCE_ID")

    if not api_key or not resource_id:
        # Check if .env file exists and try to read it
        for env_file in [".env", "../.env", "../../.env"]:
            if os.path.exists(env_file):
                try:
                    with open(env_file, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith("#") and "=" in line:
                                k, v = line.split("=", 1)
                                k = k.strip()
                                v = v.strip().strip("'\"")
                                if not os.getenv(k):
                                    os.environ[k] = v
                except Exception:
                    pass

    api_key = os.getenv("DATA_GOV_API_KEY")
    resource_id = os.getenv("DATA_GOV_RESOURCE_ID")

    if not api_key or not resource_id:
        raise HTTPException(
            status_code=500,
            detail="DATA_GOV_API_KEY or DATA_GOV_RESOURCE_ID is not set in backend environment variables (.env)."
        )

    # Build data.gov.in API URL
    base_url = f"https://api.data.gov.in/resource/{resource_id}"
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(limit),
        "offset": str(offset),
    }
    if state:
        params["filters[state_name]"] = state
        params["filters[state]"] = state
    if district:
        params["filters[district_name]"] = district
        params["filters[district]"] = district

    query_str = urllib.parse.urlencode(params)
    full_url = f"{base_url}?{query_str}"

    try:
        req = urllib.request.Request(full_url, headers={"User-Agent": "SchemeSaathi-AI/1.0", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8")
            data = json.loads(body)

        records = data.get("records", [])

        # Post-filtering for state/district
        if state or district:
            filtered = []
            for r in records:
                state_match = True
                district_match = True
                if state:
                    s_vals = " ".join([str(v) for k, v in r.items() if "state" in k.lower()])
                    state_match = state.lower() in s_vals.lower()
                if district:
                    d_vals = " ".join([str(v) for k, v in r.items() if "district" in k.lower()])
                    district_match = district.lower() in d_vals.lower()
                if state_match and district_match:
                    filtered.append(r)
            records = filtered

        return {
            "success": True,
            "isMock": False,
            "resourceId": data.get("index_name", resource_id),
            "title": data.get("title", "UDYAM Registration Dataset"),
            "total": data.get("total", len(records)),
            "count": len(records),
            "limit": limit,
            "offset": offset,
            "filters": {"state": state, "district": district},
            "records": records
        }
    except Exception as e:
        # Fallback dataset if data.gov.in returns error or key is not active
        mock_data = [
            {"state_name": "Maharashtra", "district_name": "Pune", "micro_enterprises": "45210", "small_enterprises": "8940", "medium_enterprises": "1230", "total_udyam_registrations": "55380", "manufacturing_units": "28400", "service_units": "26980"},
            {"state_name": "Maharashtra", "district_name": "Mumbai", "micro_enterprises": "62400", "small_enterprises": "14200", "medium_enterprises": "2100", "total_udyam_registrations": "78700", "manufacturing_units": "21500", "service_units": "57200"},
            {"state_name": "Maharashtra", "district_name": "Thane", "micro_enterprises": "38900", "small_enterprises": "7100", "medium_enterprises": "980", "total_udyam_registrations": "46980", "manufacturing_units": "24100", "service_units": "22880"},
            {"state_name": "Gujarat", "district_name": "Ahmedabad", "micro_enterprises": "51200", "small_enterprises": "11400", "medium_enterprises": "1850", "total_udyam_registrations": "64450", "manufacturing_units": "41000", "service_units": "23450"},
            {"state_name": "Karnataka", "district_name": "Bengaluru Urban", "micro_enterprises": "71500", "small_enterprises": "16800", "medium_enterprises": "2890", "total_udyam_registrations": "91190", "manufacturing_units": "29100", "service_units": "62090"}
        ]
        filtered = mock_data
        if state:
            filtered = [r for r in filtered if state.lower() in r["state_name"].lower()]
        if district:
            filtered = [r for r in filtered if district.lower() in r["district_name"].lower()]

        return {
            "success": True,
            "isMock": True,
            "notice": f"Upstream data.gov.in API response: {str(e)}. Displaying backend UDYAM dataset records.",
            "resourceId": resource_id,
            "total": len(filtered),
            "count": len(filtered[offset:offset+limit]),
            "limit": limit,
            "offset": offset,
            "filters": {"state": state, "district": district},
            "records": filtered[offset:offset+limit]
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

