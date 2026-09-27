"""
SchemeSaathi AI - 5-Factor Matching Score & Top 5 Engine (STEP 7 & 8)
Calculates multi-dimensional weighted scores for schemes and ranks Top 5 recommendations.
"""

from typing import Dict, List, Any, Optional
from fastapi_app.dataset import SchemeModel, SCHEMES_DATASET, get_all_schemes
from fastapi_app.rule_engine import evaluate_hard_rules


def calculate_scheme_score(
    profile: Dict[str, Any],
    scheme: SchemeModel,
    user_documents: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Computes a 5-factor weighted score (0-100%) for a scheme:
    Factor 1: Personal / Demographic Fit (20%)
    Factor 2: Business & Sector Fit (30%)
    Factor 3: Financial & Loan Fit (20%)
    Factor 4: Location & Regional Fit (15%)
    Factor 5: Document Readiness Fit (15%)
    """
    if user_documents is None:
        user_documents = []

    # Run hard rules first
    is_eligible, disqualification_reasons, rule_status = evaluate_hard_rules(profile, scheme)

    age = int(profile.get("age", 25))
    user_category = str(profile.get("category", "General"))
    user_gender = str(profile.get("gender", "Female"))
    is_woman = profile.get("womanEntrepreneur") == "Yes" or user_gender.lower() == "female"
    user_location = str(profile.get("location") or profile.get("ruralUrban") or "Rural")
    user_sector = str(profile.get("businessSector") or profile.get("industry") or "")
    user_biz_type = str(profile.get("businessType") or "")
    project_cost = float(profile.get("projectCost") or 0)
    loan_req = float(profile.get("loanRequirement") or 0)

    # 1. Personal Fit (Max 20 pts)
    age_match = (scheme.minAge <= age <= scheme.maxAge)
    cat_match = (user_category in scheme.targetGroups or "General" in scheme.targetGroups or (is_woman and "Women" in scheme.targetGroups))
    personal_score = (10 if age_match else 2) + (10 if cat_match else 5)

    # 2. Business & Sector Fit (Max 30 pts)
    biz_type_match = any(b.lower() in user_biz_type.lower() or user_biz_type.lower() in b.lower() for b in scheme.businessTypes)
    sector_match = (user_sector.lower() in scheme.sector.lower() or scheme.sector.lower() in user_sector.lower() or biz_type_match)
    business_score = (15 if biz_type_match else 5) + (15 if sector_match else 8)

    # 3. Financial & Loan Fit (Max 20 pts)
    cost_match = (not scheme.maxProjectCost or project_cost <= scheme.maxProjectCost)
    loan_match = (not scheme.maxLoanAmount or loan_req <= scheme.maxLoanAmount)
    financial_score = (10 if cost_match else 4) + (10 if loan_match else 4)

    # 4. Location & Regional Fit (Max 15 pts)
    loc_match = any(loc.lower() in user_location.lower() or user_location.lower() in loc.lower() for loc in scheme.locations)
    location_score = 15 if loc_match else 7

    # 5. Document Readiness Fit (Max 15 pts)
    uploaded_doc_names = set(d.get("name", "") for d in user_documents)
    doc_matches = sum(1 for req_doc in scheme.documents if req_doc in uploaded_doc_names)
    doc_ratio = doc_matches / max(1, len(scheme.documents))
    document_score = round(doc_ratio * 15)

    # Raw total calculation
    raw_total = personal_score + business_score + financial_score + location_score + document_score

    # Scale total score: if eligible, score is between 55% and 98%; if ineligible, capped at 45%
    if is_eligible:
        final_score = min(98, max(58, raw_total))
    else:
        final_score = min(45, raw_total)

    # Classification badge
    if not is_eligible:
        match_classification = "Not Eligible"
    elif final_score >= 90:
        match_classification = "Excellent Match"
    elif final_score >= 75:
        match_classification = "Strong Match"
    elif final_score >= 60:
        match_classification = "Possible Match"
    else:
        match_classification = "Low Match"

    satisfied_criteria = (5 if is_eligible else 2) + doc_matches
    total_criteria = len(scheme.documents) + 5
    confidence_level = "High" if satisfied_criteria >= 7 else "Medium" if satisfied_criteria >= 4 else "Low"

    # Criteria comparison table
    criteria_table = [
        {"criteria": "Applicant Age", "userValue": f"{age} Yrs", "requirement": f"{scheme.minAge}–{scheme.maxAge} Yrs", "isSatisfied": age_match},
        {"criteria": "Business Type", "userValue": user_biz_type, "requirement": ", ".join(scheme.businessTypes), "isSatisfied": biz_type_match},
        {"criteria": "Target Sector", "userValue": user_sector or "General", "requirement": scheme.sector, "isSatisfied": sector_match},
        {"criteria": "Location / Region", "userValue": f"{profile.get('state', 'State')} ({user_location})", "requirement": ", ".join(scheme.locations), "isSatisfied": loc_match},
        {"criteria": "Loan Requirement", "userValue": f"₹{loan_req/100000:.1f} Lakh", "requirement": f"Up to ₹{scheme.maxLoanAmount/100000:.1f} Lakh" if scheme.maxLoanAmount else "No Limit", "isSatisfied": loan_match},
        {"criteria": "Social Category", "userValue": f"{user_category} / {user_gender}", "requirement": ", ".join(scheme.targetGroups) if scheme.targetGroups else "All Categories", "isSatisfied": cat_match},
    ]

    missing_docs = [d for d in scheme.documents if d not in uploaded_doc_names]
    missing_info = []
    if not profile.get("annualFamilyIncome") and not profile.get("annualIncome"):
        missing_info.append("Annual Household Income")
    if not profile.get("expectedTurnover"):
        missing_info.append("Expected Annual Turnover")
    if not profile.get("investmentPlantMachinery"):
        missing_info.append("Plant & Machinery Investment")

    if is_eligible:
        explanation = (
            f"Recommended because your enterprise operates as a {user_biz_type} unit in {profile.get('state', 'India')}, "
            f"your sector ({user_sector or 'General'}) fits scheme scope, location ({user_location}) satisfies guidelines, "
            f"and requested loan (₹{loan_req/100000:.1f} L) is within permitted limits."
        )
    else:
        explanation = f"Applicant does not meet mandatory guidelines. {disqualification_reasons[0]}"

    reasons = [
        f"{user_biz_type} sector eligible" if biz_type_match else "Sector verification suggested",
        "Mandatory hard rules satisfied" if is_eligible else disqualification_reasons[0],
        f"{user_location} region eligible" if loc_match else "Regional criteria apply"
    ]

    return {
        "scheme": scheme.dict(),
        "score": final_score,
        "matchClassification": match_classification,
        "isEligible": is_eligible,
        "disqualificationReasons": disqualification_reasons,
        "confidenceLevel": confidence_level,
        "verifiedCriteriaCount": satisfied_criteria,
        "totalCriteriaCount": total_criteria,
        "explanation": explanation,
        "status": match_classification,
        "reasons": reasons,
        "criteriaTable": criteria_table,
        "missingDocuments": missing_docs,
        "missingInformation": missing_info,
        "eligibility": rule_status,
        "documentReady": round(doc_ratio * 100),
    }


def get_recommendations_and_top5(
    profile: Dict[str, Any],
    user_documents: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates all 20 schemes for the given profile and returns:
    - top5: Top 5 eligible schemes ordered by score.
    - eligible: All eligible schemes sorted by score.
    - ineligible: Excluded schemes with disqualification reasons.
    """
    schemes = get_all_schemes()
    scored_list = [calculate_scheme_score(profile, s, user_documents) for s in schemes]

    eligible = [item for item in scored_list if item["isEligible"]]
    eligible.sort(key=lambda x: x["score"], reverse=True)

    ineligible = [item for item in scored_list if not item["isEligible"]]

    # Top 5 schemes
    top5 = eligible[:5]

    return {
        "top5": top5,
        "eligible": eligible,
        "ineligible": ineligible,
        "totalEvaluated": len(schemes)
    }
