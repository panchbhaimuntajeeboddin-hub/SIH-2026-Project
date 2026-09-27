"""
SchemeSaathi AI - Deterministic Eligibility Rule Engine (STEP 6)
Evaluates mandatory eligibility criteria and provides transparent pass/fail breakdowns.
"""

from typing import Dict, List, Any, Tuple
from fastapi_app.dataset import SchemeModel, SCHEMES_DATASET


class ProfileInputModel(BaseModel if 'BaseModel' in globals() else object):
    name: str = "Entrepreneur"
    age: int = 28
    gender: str = "Female"
    category: str = "General"
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


def evaluate_hard_rules(profile: Dict[str, Any], scheme: SchemeModel) -> Tuple[bool, List[str], Dict[str, str]]:
    """
    Evaluates mandatory hard rules for a given profile and scheme.
    Returns:
      is_eligible (bool)
      disqualification_reasons (List[str])
      rule_status_map (Dict[str, str]) — {"age": "PASS", "income": "FAIL", ...}
    """
    disqualifications: List[str] = []
    status_map: Dict[str, str] = {}

    age = int(profile.get("age", 25))
    family_income = float(profile.get("annualFamilyIncome") or profile.get("annualIncome") or 0)
    annual_income = float(profile.get("annualIncome") or 0)
    turnover = float(profile.get("expectedTurnover") or 0)
    plant_machinery = float(profile.get("investmentPlantMachinery") or 0)
    user_category = str(profile.get("category", "General"))
    user_gender = str(profile.get("gender", "Female"))
    is_woman = profile.get("womanEntrepreneur") == "Yes" or user_gender.lower() == "female"
    user_location = str(profile.get("location") or profile.get("ruralUrban") or "Rural")
    user_sector = str(profile.get("businessSector") or profile.get("industry") or "")
    user_biz_type = str(profile.get("businessType") or "")

    # 1. Rule: Age Range
    min_age = scheme.minAge or 18
    max_age = scheme.maxAge or 65
    if age < min_age or age > max_age:
        disqualifications.append(
            f"Applicant age ({age} yrs) outside permissible range ({min_age}–{max_age} yrs)."
        )
        status_map["age"] = "FAIL"
    else:
        status_map["age"] = "PASS"

    # 2. Rule: Annual Family Income Ceiling
    if scheme.maxAnnualIncome and (family_income > scheme.maxAnnualIncome or annual_income > scheme.maxAnnualIncome):
        max_in_lakhs = scheme.maxAnnualIncome / 100000.0
        disqualifications.append(
            f"Annual income exceeds scheme maximum cap of ₹{max_in_lakhs:.1f} Lakh."
        )
        status_map["income"] = "FAIL"
    else:
        status_map["income"] = "PASS"

    # 3. Rule: Expected Turnover Cap
    if scheme.maxTurnover and turnover > scheme.maxTurnover:
        max_t_lakhs = scheme.maxTurnover / 100000.0
        disqualifications.append(
            f"Expected turnover (₹{turnover/100000:.1f} L) exceeds scheme cap (₹{max_t_lakhs:.1f} L)."
        )
        status_map["turnover"] = "FAIL"
    else:
        status_map["turnover"] = "PASS"

    # 4. Rule: Plant & Machinery Investment Limit
    if scheme.maxInvestment and plant_machinery > scheme.maxInvestment:
        max_inv_lakhs = scheme.maxInvestment / 100000.0
        disqualifications.append(
            f"Plant & machinery investment (₹{plant_machinery/100000:.1f} L) exceeds cap of ₹{max_inv_lakhs:.1f} L."
        )
        status_map["investment"] = "FAIL"
    else:
        status_map["investment"] = "PASS"

    # 5. Rule: Target Social Category / Demographics
    if scheme.targetGroups and len(scheme.targetGroups) > 0:
        matches_cat = user_category in scheme.targetGroups or "General" in scheme.targetGroups
        matches_gender = user_gender in scheme.targetGroups
        matches_woman = is_woman and "Women" in scheme.targetGroups
        if not (matches_cat or matches_gender or matches_woman):
            disqualifications.append(
                f"Target group restriction: scheme requires candidate from {', '.join(scheme.targetGroups)}."
            )
            status_map["demographics"] = "FAIL"
        else:
            status_map["demographics"] = "PASS"
    else:
        status_map["demographics"] = "PASS"

    # 6. Rule: Location (Rural/Urban)
    if scheme.locations and len(scheme.locations) > 0:
        loc_match = any(loc.lower() in user_location.lower() or user_location.lower() in loc.lower() for loc in scheme.locations)
        if not loc_match:
            disqualifications.append(
                f"Location restriction: scheme is available for {', '.join(scheme.locations)} regions."
            )
            status_map["location"] = "FAIL"
        else:
            status_map["location"] = "PASS"
    else:
        status_map["location"] = "PASS"

    # 7. Rule: Business Type / Sector Fit
    biz_match = any(b.lower() in user_biz_type.lower() or user_biz_type.lower() in b.lower() for b in scheme.businessTypes)
    if not biz_match and "General" not in scheme.businessTypes:
        # Check if sector matches loosely
        sector_match = (
            user_sector.lower() in scheme.sector.lower()
            or scheme.sector.lower() in user_sector.lower()
        )
        if not sector_match:
            disqualifications.append(
                f"Business type ({user_biz_type}) not eligible for scheme business scope ({', '.join(scheme.businessTypes)})."
            )
            status_map["businessType"] = "FAIL"
        else:
            status_map["businessType"] = "PASS"
    else:
        status_map["businessType"] = "PASS"

    is_eligible = len(disqualifications) == 0
    return is_eligible, disqualifications, status_map
