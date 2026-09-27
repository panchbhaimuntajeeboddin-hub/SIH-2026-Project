"""
SchemeSaathi AI - LLM & NLP Intelligence Engine (STEP 9)
Parses natural language prompts, synthesizes explainable eligibility responses, and drafts DPR project reports.
"""

from typing import Dict, List, Any, Optional
from fastapi_app.dataset import get_scheme_by_id, SCHEMES_DATASET
from fastapi_app.rag_engine import search_rag_knowledge
import re


def parse_nlp_intent(query: str) -> Dict[str, Any]:
    """
    Parses user natural language query to extract intent parameters:
    loan requirement, sector, category, location, state.
    """
    query_lower = query.lower()

    # Extract loan amount if specified (e.g. 10 lakhs, 5L, 50000)
    loan_match = re.search(r"(\d+)\s*(lakh|lakhs|l|lac|cr|crore|k|thousand)?", query_lower)
    loan_amount = None
    if loan_match:
        val = float(loan_match.group(1))
        unit = loan_match.group(2) or ""
        if "cr" in unit:
            loan_amount = val * 10000000
        elif "l" in unit or "lac" in unit:
            loan_amount = val * 100000
        elif "k" in unit or "thousand" in unit:
            loan_amount = val * 1000
        elif val > 100:
            loan_amount = val

    # Sector detection
    sector = "General"
    if "food" in query_lower or "bakery" in query_lower or "pickle" in query_lower:
        sector = "Food Processing"
    elif "artisan" in query_lower or "craft" in query_lower or "carpenter" in query_lower or "tailor" in query_lower:
        sector = "Traditional Artisans"
    elif "tech" in query_lower or "software" in query_lower or "startup" in query_lower:
        sector = "Technology & Innovation"
    elif "agri" in query_lower or "farm" in query_lower or "dairy" in query_lower:
        sector = "Agri-Business & Rural Development"
    elif "manufactur" in query_lower or "factory" in query_lower or "unit" in query_lower:
        sector = "Manufacturing & Services"

    # Location detection
    location = "Rural" if "rural" in query_lower or "village" in query_lower else "Urban" if "urban" in query_lower or "city" in query_lower else "Both"

    return {
        "query": query,
        "detectedLoanAmount": loan_amount,
        "detectedSector": sector,
        "detectedLocation": location
    }


def generate_llm_explanation(
    scheme_id: str,
    user_profile: Dict[str, Any],
    is_eligible: bool,
    disqualifications: List[str] = None
) -> str:
    """
    Generates a personalized human-readable eligibility explanation.
    """
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return "Scheme details unavailable."

    name = user_profile.get("name", "Entrepreneur")
    biz_type = user_profile.get("businessType", "Enterprise")
    state = user_profile.get("state", "India")
    loan_req = float(user_profile.get("loanRequirement", 0))

    if is_eligible:
        loan_str = f"₹{loan_req/100000:.1f} Lakh" if loan_req > 0 else "working capital"
        subsidy_str = f"up to {scheme.subsidyRatePercent:.0f}% margin money subsidy" if scheme.subsidyRatePercent > 0 else "collateral-free credit guarantee cover"
        return (
            f"Great news, {name}! Your proposed {biz_type} unit in {state} satisfies all mandatory guidelines for {scheme.name} ({scheme.shortName}). "
            f"Under this scheme, you are eligible to apply for {loan_str} with {subsidy_str}. "
            f"Your operating sector and profile score place you in the top tier for bank recommendation."
        )
    else:
        disqual_msg = disqualifications[0] if disqualifications else "Eligibility criteria missing."
        return (
            f"Hello {name}, your profile currently does not satisfy mandatory eligibility rules for {scheme.name}. "
            f"Primary reason: {disqual_msg} We recommend reviewing alternative schemes or adjusting your profile parameters."
        )


def generate_dpr_outline(
    scheme_id: str,
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generates a 6-section Detailed Project Report (DPR) summary for bank loan submissions.
    """
    scheme = get_scheme_by_id(scheme_id)
    scheme_name = scheme.name if scheme else "Government Scheme"
    
    biz_name = user_profile.get("businessName", "Proposed Micro Enterprise")
    owner_name = user_profile.get("name", "Entrepreneur")
    state = user_profile.get("state", "Maharashtra")
    district = user_profile.get("district", "Pune")
    sector = user_profile.get("businessSector") or user_profile.get("industry") or "Manufacturing"
    project_cost = float(user_profile.get("projectCost", 1200000))
    loan_req = float(user_profile.get("loanRequirement", 900000))
    margin_money = project_cost - loan_req
    subsidy_amount = (project_cost * (scheme.subsidyRatePercent/100.0)) if scheme and scheme.subsidyRatePercent > 0 else 0
    employees = user_profile.get("employees", 4)
    expected_turnover = float(user_profile.get("expectedTurnover", 2400000))

    sections = [
        {
            "sectionTitle": "1. Executive Summary & Promoter Profile",
            "content": f"Project Proposal for setting up '{biz_name}' by promoter {owner_name} located at District {district}, {state}. The unit will operate in the {sector} sector targeting local and regional markets."
        },
        {
            "sectionTitle": "2. Scheme Alignment & Benefit Estimation",
            "content": f"Applied Scheme: {scheme_name}. Total Estimated Project Cost: ₹{project_cost:,.0f}. Requested Bank Term Loan: ₹{loan_req:,.0f} ({round(loan_req/project_cost*100)}% of cost). Expected Govt Subsidy / Guarantee: ₹{subsidy_amount:,.0f}."
        },
        {
            "sectionTitle": "3. Capital Investment & Means of Finance",
            "content": f"Plant & Machinery Investment: ₹{project_cost*0.6:,.0f}. Working Capital Requirement: ₹{project_cost*0.4:,.0f}. Promoter Own Contribution: ₹{margin_money:,.0f} ({round(margin_money/project_cost*100)}%)."
        },
        {
            "sectionTitle": "4. Operational & Production Plan",
            "content": f"Daily operational capacity estimated to yield annual gross revenue of ₹{expected_turnover:,.0f}. Direct local employment generated: {employees} persons."
        },
        {
            "sectionTitle": "5. Financial Viability & Repayment Schedule",
            "content": f"Estimated Net Profit Margin: 18-22%. Debt Service Coverage Ratio (DSCR): 1.85. Projected loan repayment tenure: 60 months with 6-month moratorium."
        },
        {
            "sectionTitle": "6. Statutory Compliance & Document Checklist",
            "content": "Attached Compliance Documents: Aadhaar Card, PAN Card, Udyam Registration Certificate, Bank Statements, Premises Lease Agreement, and Detailed Equipment Quotation."
        }
    ]

    return {
        "dprTitle": f"Detailed Project Report (DPR) - {biz_name}",
        "schemeName": scheme_name,
        "promoterName": owner_name,
        "projectCost": project_cost,
        "loanRequirement": loan_req,
        "subsidyEstimated": subsidy_amount,
        "sections": sections
    }
