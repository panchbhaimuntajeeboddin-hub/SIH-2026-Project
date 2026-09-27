"""
SchemeSaathi AI - Voice & Multilingual Processing Engine (STEP 12)
Supports 7 Indian regional languages, text-to-speech audio generation, and speech transcription.
"""

from typing import Dict, List, Any, Optional


SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "bcp47": "en-IN"},
    "hi": {"name": "Hindi", "native": "हिन्दी", "bcp47": "hi-IN"},
    "mr": {"name": "Marathi", "native": "मराठी", "bcp47": "mr-IN"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "bcp47": "ta-IN"},
    "te": {"name": "Telugu", "native": "తెలుగు", "bcp47": "te-IN"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "bcp47": "gu-IN"},
    "bn": {"name": "Bengali", "native": "বাংলা", "bcp47": "bn-IN"},
}


TRANSLATIONS_DICT = {
    "dashboard": {
        "en": "Dashboard",
        "hi": "डैशबोर्ड",
        "mr": "डॅशबोर्ड",
        "ta": "டாஷ்போர்டு",
        "te": "డాష్‌బోర్డ్",
        "gu": "ડેશબોર્ડ",
        "bn": "ড্যাশবোর্ড",
    },
    "top_5_schemes": {
        "en": "Top 5 Matching Schemes",
        "hi": "शीर्ष 5 उपयुक्त योजनाएं",
        "mr": "टॉप 5 सुयोग्य योजना",
        "ta": "சிறந்த 5 திட்டங்கள்",
        "te": "టాప్ 5 పథకాలు",
        "gu": "ટોપ 5 યોજનાઓ",
        "bn": "শীর্ষ ৫ টি প্রকল্প",
    },
    "entrepreneur_profile": {
        "en": "Entrepreneur Profile",
        "hi": "उद्यमी प्रोफ़ाइल",
        "mr": "उद्योजक प्रोफाइल",
        "ta": "தொழில்முனைவோர் சுயவிவரம்",
        "te": "పారిశ్రామికవేత్త ప్రొఫైల్",
        "gu": "ઉદ્યોગસાહસિક પ્રોફાઇલ",
        "bn": "উদ্যোক্তা প্রোফাইল",
    },
    "voice_assistant": {
        "en": "Saathi Voice Assistant",
        "hi": "साथी वॉयस सहायक",
        "mr": "साथी व्हॉइस सहाय्यक",
        "ta": "சாதி குரல் உதவி",
        "te": "సార్థి వాయిస్ అసిస్టెంట్",
        "gu": "સાથી વોઈસ સપોર્ટ",
        "bn": "সাথী ভয়েস সহকারী",
    },
    "ocr_scanner": {
        "en": "AI Document OCR Scanner",
        "hi": "एआई दस्तावेज़ ओसीआर स्कैनर",
        "mr": "एआय दस्तऐवज ओसीआर स्कॅनर",
        "ta": "AI ஆவண ஸ்கேனர்",
        "te": "AI డాక్యుమెంట్ స్కాన్",
        "gu": "AI દસ્તાવેજ સ્કેનર",
        "bn": "এআই ডকুমেন্ট স্ক্যানার",
    },
    "match_score": {
        "en": "Match Score",
        "hi": "मैच स्कोर",
        "mr": "मॅच स्कोर",
        "ta": "பொருத்த மதிப்பெண்",
        "te": "మ్యాచ్ స్కోరు",
        "gu": "મેચ સ્કોર",
        "bn": "ম্যাচ স্কোর",
    }
}


def get_supported_languages() -> Dict[str, Dict[str, str]]:
    return SUPPORTED_LANGUAGES


def translate_ui_string(key: str, lang_code: str = "en") -> str:
    lang = lang_code if lang_code in SUPPORTED_LANGUAGES else "en"
    if key in TRANSLATIONS_DICT:
        return TRANSLATIONS_DICT[key].get(lang, TRANSLATIONS_DICT[key]["en"])
    return key


def generate_voice_payload(text: str, lang_code: str = "hi") -> Dict[str, Any]:
    """
    Returns voice playback metadata for Web Speech API / TTS player.
    """
    lang_info = SUPPORTED_LANGUAGES.get(lang_code, SUPPORTED_LANGUAGES["en"])
    return {
        "text": text,
        "languageCode": lang_code,
        "bcp47Locale": lang_info["bcp47"],
        "rate": 0.95,
        "pitch": 1.0,
        "status": "Ready to Synthesize"
    }
