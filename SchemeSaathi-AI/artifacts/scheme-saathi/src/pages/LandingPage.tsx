import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
  Mic,
  MicOff,
  Menu,
  X,
  FileCheck2,
  Calculator,
  ShieldCheck,
  Building2,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Search,
  Check,
  Info,
  ExternalLink,
  Layers,
  Zap,
  ArrowUpRight,
  Filter,
  UserCheck,
  FileText,
  RotateCcw,
  Sliders,
  Scale
} from 'lucide-react';

// Data types
export interface SchemeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  matchScore: number;
  popular?: boolean;
  subsidy?: string;
  maxFunding?: string;
  targetAudience: string[];
  reasons: string[];
  missingDocs: string[];
}

const FEATURED_SCHEMES: SchemeItem[] = [
  {
    id: 'pmegp',
    name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
    category: 'Entrepreneurship & Credit Support',
    description: 'Credit-linked subsidy program for establishing new micro-enterprises in manufacturing and service sectors.',
    matchScore: 94,
    popular: true,
    subsidy: 'Up to 35%',
    maxFunding: '₹50 Lakh',
    targetAudience: ['SC/ST', 'OBC', 'Women', 'Rural', 'First-time Entrepreneurs'],
    reasons: ['New micro-enterprise activity', 'Category qualifies for 35% rural subsidy', 'Project cost within ₹50L cap', 'Age 18+ requirement met'],
    missingDocs: ['Detailed Project Report (DPR)']
  },
  {
    id: 'cgtmse',
    name: 'Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)',
    category: 'Credit Guarantee',
    description: 'Collateral-free credit facility ecosystem for eligible existing and new micro & small enterprises.',
    matchScore: 89,
    popular: true,
    subsidy: 'Collateral-Free',
    maxFunding: '₹5 Crore',
    targetAudience: ['Micro Enterprises', 'Small Business Owners', 'Women Entrepreneurs'],
    reasons: ['No third-party collateral required', 'Covers manufacturing and service units', 'Financial support for working capital'],
    missingDocs: ['Audited Financial Statement / Bank Statement']
  },
  {
    id: 'standup-india',
    name: 'Stand Up India Scheme for SC/ST & Women',
    category: 'Women Entrepreneurs',
    description: 'Bank loans between ₹10 lakh and ₹1 crore for setting up greenfield enterprises by SC, ST or Women borrowers.',
    matchScore: 91,
    popular: true,
    subsidy: 'Low Interest Rate',
    maxFunding: '₹1 Crore',
    targetAudience: ['SC/ST Entrepreneurs', 'Women Entrepreneurs', 'Greenfield Projects'],
    reasons: ['Targeted social category match', 'Greenfield business setup', 'Credit guarantee backup'],
    missingDocs: ['Category Certificate', 'Land/Lease Agreement']
  },
  {
    id: 'msme-support',
    name: 'MSME Innovative & Credit Support Scheme',
    category: 'MSME Development',
    description: 'Financial assistance for technology adoption, incubation, IP support, and quality certifications for MSMEs.',
    matchScore: 87,
    popular: false,
    subsidy: 'Up to 80% Reimbursement',
    maxFunding: '₹15 Lakh',
    targetAudience: ['Tech MSMEs', 'Food Processing', 'Manufacturing', 'Rural Units'],
    reasons: ['Subsidized patent and trademark filing', 'Design and technical incubation support', 'Cluster development assistance'],
    missingDocs: ['Udyam Registration Certificate']
  },
  {
    id: 'pm-mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    category: 'Training & Development',
    description: 'Collateral-free loans up to ₹10 lakh under Shishu, Kishor and Tarun categories for non-farm small/micro enterprises.',
    matchScore: 82,
    popular: true,
    subsidy: 'Zero Collateral',
    maxFunding: '₹10 Lakh',
    targetAudience: ['Micro Business Owners', 'Artisans', 'Vendors', 'Small Traders'],
    reasons: ['Ideal for working capital needs', 'Simple documentation', 'No processing fee for Shishu loans'],
    missingDocs: ['Business Proposal Outline']
  },
  {
    id: 'pm-formalisation-fpe',
    name: 'PM Formalisation of Micro Food Processing Enterprises (PMFME)',
    category: 'Food Processing & Rural',
    description: 'Financial, technical and business support for micro food processing units with 35% credit-linked capital subsidy.',
    matchScore: 93,
    popular: true,
    subsidy: '35% Capital Subsidy',
    maxFunding: '₹10 Lakh',
    targetAudience: ['Food Processing', 'Self Help Groups', 'Farmer Producer Orgs', 'Rural Entrepreneurs'],
    reasons: ['Matches food processing industry preference', 'Subsidized branding and packaging', 'ODOP product alignment'],
    missingDocs: ['FSSAI Basic License Draft']
  }
];

export function LandingPage() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  
  // What-If Simulator State
  const [simProjectCost, setSimProjectCost] = useState(10);
  const [simCategory, setSimCategory] = useState('SC');
  const [simLocation, setSimLocation] = useState('Rural');
  const [simCalculated, setSimCalculated] = useState(false);

  // Profile Questionnaire Form State
  const [quizState, setQuizState] = useState({
    name: '',
    category: 'SC',
    businessType: 'Food Processing',
    location: 'Rural Maharashtra',
    projectCost: '12',
    stage: 'New Enterprise'
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Language Dictionary
  const content = {
    en: {
      tagline: 'Find the Right Government Scheme for Your Entrepreneurial Journey',
      heroBadge: 'AI-POWERED SCHEME DISCOVERY',
      heroTitle1: 'Your Business.',
      heroTitle2: 'Your Future.',
      heroTitle3: 'The Right Scheme.',
      heroDesc: 'SchemeSaathi AI analyzes your personal, financial, business and location profile to recommend government schemes that best match your entrepreneurial journey.',
      findSchemesCTA: 'Find Schemes For Me →',
      exploreCTA: 'Explore Schemes',
      heroSubBadges: 'Personalized • Explainable • Multilingual',
      trustHeading: 'Government support made easier to discover.',
      navHome: 'Home',
      navWorks: 'How It Works',
      navSchemes: 'Schemes',
      navBenefits: 'Benefits',
      navAbout: 'About',
      login: 'Login',
      signup: 'Find My Schemes',
    },
    hi: {
      tagline: 'आपकी व्यावसायिक यात्रा के लिए सही सरकारी योजना खोजें',
      heroBadge: 'एआई-संचालित योजना खोज',
      heroTitle1: 'आपका व्यवसाय।',
      heroTitle2: 'आपका भविष्य।',
      heroTitle3: 'सही योजना।',
      heroDesc: 'स्कीमसाथी AI आपकी व्यक्तिगत, वित्तीय, व्यावसायिक और क्षेत्रीय प्रोफ़ाइल का विश्लेषण करके उन सरकारी योजनाओं की सिफारिश करता है जो आपके उद्यमिता यात्रा के लिए सबसे उपयुक्त हैं।',
      findSchemesCTA: 'मेरे लिए योजनाएं खोजें →',
      exploreCTA: 'योजनाएं देखें',
      heroSubBadges: 'व्यक्तिगत • स्पष्ट व्याख्या • बहुभाषी',
      trustHeading: 'सरकारी सहायता की खोज अब हुई आसान।',
      navHome: 'मुख्य पृष्ठ',
      navWorks: 'यह कैसे काम करता है',
      navSchemes: 'योजनाएं',
      navBenefits: 'लाभ',
      navAbout: 'हमारे बारे में',
      login: 'लॉग इन',
      signup: 'मेरी योजनाएं खोजें',
    },
    mr: {
      tagline: 'तुमच्या व्यावसायिक प्रवासासाठी योग्य शासकीय योजना शोधा',
      heroBadge: 'AI-आधारित योजना शोध',
      heroTitle1: 'तुमचा व्यवसाय.',
      heroTitle2: 'तुमचे भविष्य.',
      heroTitle3: 'योग्य योजना.',
      heroDesc: 'स्कीमसाथी AI तुमच्या वैयक्तिक, आर्थिक, व्यावसायिक आणि प्रादेशिक प्रोफाईलचे विश्लेषण करून तुम्हाला सर्वात योग्य असणाऱ्या शासकीय योजना सुचवते.',
      findSchemesCTA: 'माझ्यासाठी योजना शोधा →',
      exploreCTA: 'योजना एक्सप्लोर करा',
      heroSubBadges: 'व्यक्तिगत • स्पष्टीकरणयोग्य • बहुभाषिक',
      trustHeading: 'शासकीय योजना शोधणे आता झाले सोपे.',
      navHome: 'मुख्य',
      navWorks: 'कसे कार्य करते',
      navSchemes: 'योजना',
      navBenefits: 'फायदे',
      navAbout: 'माहिती',
      login: 'लॉगिन',
      signup: 'माझ्या योजना शोधा',
    }
  }[selectedLanguage];

  // Carousel manual scrolling ref
  const carousel1Ref = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carousel1Ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carousel1Ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Recalculate simulation values
  const handleRecalculate = () => {
    setSimCalculated(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* ==================================================
          1. NAVIGATION BAR
      ================================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          
          {/* Left Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition duration-200">
              <Sparkles className="h-5 w-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-display">SchemeSaathi</span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300/50">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Government Scheme Assistant</p>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#hero" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">
              {content.navHome}
            </a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">
              {content.navWorks}
            </a>
            <a href="#schemes" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">
              {content.navSchemes}
            </a>
            <a href="#why-different" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">
              {content.navBenefits}
            </a>
            <a href="#footer" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">
              {content.navAbout}
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Language Selector */}
            <div className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-emerald-300">
              <Globe className="h-4 w-4 text-emerald-600" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="bg-transparent font-semibold text-xs text-slate-800 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Login Button -> goes to existing /auth */}
            <Link
              href="/auth?mode=login"
              className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-emerald-800 transition"
            >
              {content.login}
            </Link>

            {/* Primary CTA */}
            <button
              onClick={() => setQuestionnaireOpen(true)}
              className="group flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800 transition duration-200 active:scale-[0.98]"
            >
              <span>{content.signup}</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4 text-sm font-semibold">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 hover:text-emerald-700">
                {content.navHome}
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 hover:text-emerald-700">
                {content.navWorks}
              </a>
              <a href="#schemes" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 hover:text-emerald-700">
                {content.navSchemes}
              </a>
              <a href="#why-different" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 hover:text-emerald-700">
                {content.navBenefits}
              </a>
              <div className="my-2 h-px bg-slate-200" />
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">Language</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="mr">मराठी</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/auth?mode=login"
                  className="w-full rounded-xl border border-slate-300 py-2.5 text-center font-bold text-slate-800 hover:bg-slate-50"
                >
                  {content.login}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setQuestionnaireOpen(true);
                  }}
                  className="w-full rounded-xl bg-emerald-700 py-2.5 text-center font-bold text-white shadow"
                >
                  {content.signup}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================
          2. HERO SECTION
      ================================================== */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-[#F8FAF8] pt-12 pb-20 md:pt-20 md:pb-28">
        
        {/* Soft Background Accent Elements */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-40 right-10 -z-10 h-72 w-72 rounded-full bg-teal-300/20 blur-2xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>{content.heroBadge}</span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                {content.heroTitle1} <br />
                {content.heroTitle2} <br />
                <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 bg-clip-text text-transparent underline decoration-emerald-300 decoration-wavy underline-offset-8">
                  {content.heroTitle3}
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg sm:leading-relaxed font-medium">
                {content.heroDesc}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={() => setQuestionnaireOpen(true)}
                  className="group flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/30 transition duration-200 active:scale-[0.98]"
                >
                  <span>{content.findSchemesCTA}</span>
                </button>

                <a
                  href="#schemes"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-bold text-slate-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-800 transition duration-200"
                >
                  <span>{content.exploreCTA}</span>
                </a>
              </div>

              {/* Sub-Badges */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{content.heroSubBadges}</span>
              </div>

            </div>

            {/* Right Hero Illustration & Floating Cards */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Main Visual Box */}
              <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200/70 bg-gradient-to-b from-white to-emerald-50/40 p-6 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl">
                
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-emerald-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg">
                      S
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Entrepreneur Recommendation Engine</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Real-time Profile Matching</p>
                    </div>
                  </div>
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                {/* Simulated Visual Illustration Graphic */}
                <div className="relative rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 p-6 text-white overflow-hidden shadow-inner min-h-[260px] flex flex-col justify-between">
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl" />
                  
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
                      <Sparkles className="h-3 w-3" /> SC/ST & Micro-Enterprise Support
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold leading-snug">
                      PMEGP Margin Money Subsidy
                    </h3>
                    <p className="mt-1.5 text-xs text-emerald-100/80 leading-relaxed">
                      Assistance up to 35% of project cost for setting up new manufacturing or service units.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-emerald-700/60 pt-4 text-xs">
                    <div>
                      <span className="block text-[10px] text-emerald-300 font-medium uppercase">Max Project Cost</span>
                      <span className="font-extrabold text-sm">₹50,00,000</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-emerald-300 font-medium uppercase">Subsidy Rate</span>
                      <span className="font-extrabold text-sm text-amber-300">15% - 35%</span>
                    </div>
                  </div>
                </div>

                {/* Floating AI Insight Card 1: 94% Match */}
                <div className="absolute -top-5 -left-4 sm:-left-6 rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-xl animate-float flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-sm">
                    94%
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">AI Fit Score</p>
                    <p className="text-xs font-extrabold text-slate-800">High Eligibility Match</p>
                  </div>
                </div>

                {/* Floating Card 2: PMEGP Tag */}
                <div className="absolute top-1/2 -right-4 sm:-right-6 -translate-y-1/2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl animate-float-delayed flex items-center gap-2.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">PMEGP Scheme</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">Recommended</p>
                  </div>
                </div>

                {/* Floating Card 3: ₹12L Project */}
                <div className="absolute -bottom-5 left-4 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl animate-float flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-800">₹12L Project Budget</span>
                </div>

                {/* Floating Card 4: 3 Docs Missing */}
                <div className="absolute -bottom-5 right-4 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 shadow-xl animate-float-delayed flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">3 Docs Required</span>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          3. TRUST / STATISTICS SECTION
      ================================================== */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Public Service AI Discovery</p>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl mt-1">
              {content.trustHeading}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            
            {/* Stat 1 */}
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/40 p-6 text-center shadow-sm hover:border-emerald-200 transition">
              <p className="font-display text-3xl font-black text-emerald-700 sm:text-4xl">4,700+</p>
              <p className="mt-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Government Schemes</p>
            </div>

            {/* Stat 2 */}
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/40 p-6 text-center shadow-sm hover:border-emerald-200 transition">
              <p className="font-display text-3xl font-black text-emerald-700 sm:text-4xl">AI-Powered</p>
              <p className="mt-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Personalized Matching</p>
            </div>

            {/* Stat 3 */}
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/40 p-6 text-center shadow-sm hover:border-emerald-200 transition">
              <p className="font-display text-3xl font-black text-emerald-700 sm:text-4xl">Multi-Language</p>
              <p className="mt-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">Accessible Support</p>
            </div>

            {/* Stat 4 */}
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/40 p-6 text-center shadow-sm hover:border-emerald-200 transition">
              <p className="font-display text-3xl font-black text-emerald-700 sm:text-4xl">24/7</p>
              <p className="mt-1.5 text-xs font-bold text-slate-600 uppercase tracking-wide">AI Assistance</p>
            </div>

          </div>

          {/* Non-claim Disclaimer */}
          <p className="mt-6 text-center text-xs text-slate-400 font-medium">
            * SchemeSaathi AI provides algorithmic matching & informational aid. Scheme ownership & final approval rests with respective government departments.
          </p>

        </div>
      </section>

      {/* ==================================================
          4. FEATURED SCHEMES SECTION (HORIZONTAL AUTO-SCROLL)
      ================================================== */}
      <section id="schemes" className="py-20 bg-[#F8FAF8] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-3">
                <Building2 className="h-3.5 w-3.5" /> Featured Opportunities
              </div>
              <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Explore Schemes That Could Support Your Journey
              </h2>
              <p className="mt-2 text-slate-600 text-sm max-w-2xl">
                Discover funding, credit, training and entrepreneurship support based on your profile.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollCarousel('left')}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-sm transition"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700 shadow-sm transition"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <a
                href="#schemes"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
              >
                Explore All Schemes <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Continuous Infinite Horizontal Scroll Marquee */}
          <div className="relative w-full overflow-hidden">
            <div className="animate-marquee hover:[animation-play-state:paused] flex gap-6 py-4">
              
              {/* Duplicate array for seamless continuous loop */}
              {[...FEATURED_SCHEMES, ...FEATURED_SCHEMES].map((scheme, idx) => (
                <div
                  key={`${scheme.id}-${idx}`}
                  className="w-[310px] sm:w-[340px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200/60">
                        {scheme.category}
                      </span>
                      {scheme.popular && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-extrabold text-slate-900 leading-snug line-clamp-2">
                      {scheme.name}
                    </h3>

                    <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Card Bottom */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase">Estimated Fit</span>
                      <span className="text-sm font-extrabold text-emerald-700">{scheme.matchScore}% Match</span>
                    </div>
                    
                    <button
                      onClick={() => setSelectedScheme(scheme)}
                      className="rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-700 hover:text-white transition"
                    >
                      View Scheme
                    </button>
                  </div>
                </div>
              ))}

            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            * Demonstration cards only. Final eligibility & subsidy limits subject to official scheme rules.
          </p>

        </div>
      </section>

      {/* ==================================================
          5. AI MATCHING SECTION
      ================================================== */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
              Smart Algorithm Workflow
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl mt-3">
              Stop Searching. Start Matching.
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              Instead of searching through hundreds of schemes, let AI understand your entrepreneurial profile and identify the opportunities most relevant to you.
            </p>
          </div>

          {/* Visual Pipeline Diagram */}
          <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-5 text-center">
            
            {['Your Profile', 'AI Analysis', 'Eligibility Check', 'Scheme Matching', 'Personalized Recommendations'].map((step, idx) => (
              <div key={step} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-extrabold text-white">
                  {idx + 1}
                </div>
                <p className="text-xs font-extrabold text-slate-800">{step}</p>
                {idx < 4 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5 z-10" />
                )}
              </div>
            ))}

          </div>

          {/* Profile vs Recommendations Visual Demo */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Left Profile Card */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-extrabold text-slate-900 text-base">Entrepreneur Profile</h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">Sample</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Entrepreneur Age:</span>
                  <span className="font-bold text-slate-800">29 Years</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">State / Region:</span>
                  <span className="font-bold text-slate-800">Rural Maharashtra</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Social Category:</span>
                  <span className="font-bold text-slate-800">SC Entrepreneur</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Business Activity:</span>
                  <span className="font-bold text-slate-800">Food Processing Unit</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Project Cost:</span>
                  <span className="font-bold text-slate-800">₹12 Lakh</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Enterprise Stage:</span>
                  <span className="font-bold text-slate-800">New Greenfield Unit</span>
                </div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-700/30">
                <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
            </div>

            {/* Right Recommendation Match List */}
            <div className="lg:col-span-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-4">
                <h3 className="font-extrabold text-slate-900 text-base">AI Top Recommendations</h3>
                <span className="text-xs font-bold text-emerald-800">Ranked by Match %</span>
              </div>

              {/* Match item 1 */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PMEGP Scheme</h4>
                  <p className="text-[11px] text-slate-500">35% Subsidy • Micro Enterprise</p>
                </div>
                <span className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
                  94% Match
                </span>
              </div>

              {/* Match item 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Stand Up India</h4>
                  <p className="text-[11px] text-slate-500">SC/ST Loan Support</p>
                </div>
                <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                  87% Match
                </span>
              </div>

              {/* Match item 3 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PMFME Food Processing</h4>
                  <p className="text-[11px] text-slate-500">35% Capital Grant</p>
                </div>
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                  81% Match
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          6. WHY SCHEME MATCHING IS DIFFERENT
      ================================================== */}
      <section id="why-different" className="py-20 bg-[#F8FAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Key Platform Advantages</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">
              Why SchemeSaathi AI is Built Differently
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">1. AI-Powered Matching</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Analyze your personal profile, financial details, and business plan to discover relevant government schemes instantly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">2. Explainable Recommendations</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Understand exactly why a scheme matches your profile with transparent criteria breakdowns instead of black-box output.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">3. Eligibility Analysis</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Identify satisfied, failed and missing eligibility information before spending time applying.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">4. Document Readiness</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Know which documents you already have and what is missing to avoid loan sanction delays.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">5. Multilingual Assistance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Access scheme information and voice guidance in English, Hindi, Marathi, and regional Indian languages.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:border-emerald-300 transition duration-300">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <ArrowRight className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">6. Application Guidance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Understand the next steps required to apply, node agencies to contact, and DPR preparation advice.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          7. "WHY THIS SCHEME?" FEATURE (EXPLAINABLE AI)
      ================================================== */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                Transparent & Trustworthy AI
              </span>
              <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
                Don’t Just Get a Recommendation. <br />
                <span className="text-emerald-700">Understand It.</span>
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                SchemeSaathi AI explains the math and rule-checks behind every match so you can apply with confidence.
              </p>
            </div>

            {/* Large Interactive Recommendation Card */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 shadow-xl">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sample Scheme Analysis</span>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">PMEGP Scheme</h3>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-700 px-4 py-2 text-white font-extrabold text-sm">
                  <Check className="h-4 w-4" /> 94% Match Score
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* WHY THIS MATCH? */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2.5">
                  <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> WHY THIS MATCH?
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> New micro-enterprise
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Business activity matches manufacturing
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Location matches rural subsidy rate
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Entrepreneur category matches special 35% tier
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Project requirements match cap limits
                    </li>
                  </ul>
                </div>

                {/* MISSING INFORMATION */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2.5">
                  <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> MISSING INFORMATION
                  </h4>
                  <div className="rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
                    <p className="font-bold text-amber-900">⚠ Project Report (DPR)</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Needed by bank for margin money release.</p>
                  </div>
                </div>

              </div>

              {/* Progress & Action */}
              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>APPLICATION READINESS</span>
                    <span className="text-emerald-700 font-extrabold">82%</span>
                  </div>
                  <div className="h-2.5 w-48 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedScheme(FEATURED_SCHEMES[0])}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  View Full Analysis
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          8. WHAT-IF AI SIMULATOR
      ================================================== */}
      <section className="py-20 bg-[#F8FAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
              Interactive Scenario Tool
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl mt-3">
              What If Your Situation Changes?
            </h2>
            <p className="mt-2 text-slate-600 text-base">
              Explore how changes in your business profile can affect your scheme recommendations in real-time.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg">
            
            <div className="grid gap-8 md:grid-cols-12 items-center">
              
              {/* Controls Form */}
              <div className="md:col-span-6 space-y-5">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-emerald-700" /> Simulate Profile Adjustment
                </h3>

                {/* Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Project Cost Budget</span>
                    <span className="text-emerald-700">₹{simProjectCost} Lakh</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={simProjectCost}
                    onChange={(e) => setSimProjectCost(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>₹5L</span>
                    <span>₹25L</span>
                    <span>₹50L</span>
                  </div>
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entrepreneur Category</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="OBC">OBC</option>
                    <option value="Women">Women Entrepreneur</option>
                    <option value="General">General Category</option>
                  </select>
                </div>

                {/* Location Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Location</label>
                  <select
                    value={simLocation}
                    onChange={(e) => setSimLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-800"
                  >
                    <option value="Rural">Rural Region (Higher Subsidy)</option>
                    <option value="Urban">Urban Region</option>
                  </select>
                </div>

                <button
                  onClick={handleRecalculate}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  <RotateCcw className="h-4 w-4" /> Recalculate Matches
                </button>
              </div>

              {/* Simulation Result Comparison */}
              <div className="md:col-span-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">Live Recalculation Results</h4>

                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-200 bg-white p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800">PMEGP Subsidy Match</p>
                      <p className="text-[10px] text-slate-500">
                        {simLocation === 'Rural' ? '35% Rural Subsidy Applicable' : '25% Urban Subsidy Applicable'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Match Score</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {simProjectCost > 25 ? '91%' : '95%'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800">Stand Up India Loan</p>
                      <p className="text-[10px] text-slate-500">
                        {simCategory === 'General' ? 'Requires Women / SC/ST Co-applicant' : 'Eligible Direct Category'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Match Score</span>
                      <span className="text-sm font-extrabold text-slate-700">
                        {simCategory === 'General' ? '74%' : '91%'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">
                  * Demonstration only — final eligibility depends on current official scheme rules.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          9. DOCUMENT READINESS SECTION
      ================================================== */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                Pre-Application Checklist
              </span>
              <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl leading-tight">
                Know What You Need Before You Apply
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Avoid rejected applications and bank sanction delays by verifying your document readiness beforehand.
              </p>
              <button
                onClick={() => setDocModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition"
              >
                <FileCheck2 className="h-4 w-4" /> Check My Documents
              </button>
            </div>

            {/* Document Readiness Card */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 shadow-md">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Application Readiness Dashboard</h3>
                  <p className="text-xs text-slate-500">Required for PMEGP / CGTMSE Sanction</p>
                </div>
                <span className="font-display font-black text-2xl text-emerald-700">82%</span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden mb-6">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '82%' }} />
              </div>

              {/* Documents grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Aadhaar Card
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> PAN Card
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bank Details
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-3 text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Udyam Registration
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Project Report (DPR)
                  </span>
                  <span className="text-[10px] text-amber-700 font-extrabold">Missing</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Required Category Cert.
                  </span>
                  <span className="text-[10px] text-amber-700 font-extrabold">Missing</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          10. MULTILINGUAL / VOICE AI SECTION
      ================================================== */}
      <section className="py-20 bg-[#F8FAF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-widest">
              Inclusive Accessibility
            </span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl mt-3">
              Government Support in Your Language
            </h2>
            <p className="mt-2 text-slate-600 text-base">
              Ask about schemes in the language you are most comfortable with.
            </p>
          </div>

          {/* Language Chips */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto mb-12">
            {['English', 'हिंदी', 'मराठी', 'বাংলা', 'தமிழ்', 'తెలుగు', 'ગુજરાતી'].map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 transition cursor-pointer"
              >
                {lang}
              </span>
            ))}
          </div>

          {/* Simulated Voice UI Box */}
          <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl text-center relative overflow-hidden">
            
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-700/30 animate-pulse">
              <Mic className="h-8 w-8" />
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Simulated Voice Assistant Demo</p>

            <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60 max-w-md mx-auto mb-4">
              <p className="text-sm font-bold text-emerald-900">
                “मुझे फूड प्रोसेसिंग का छोटा बिजनेस शुरू करना है।”
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4 text-white max-w-md mx-auto text-left text-xs space-y-2">
              <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Response:
              </p>
              <p className="text-slate-200 leading-relaxed">
                Based on your food processing idea, PMEGP offers up to 35% margin money subsidy, and PMFME provides 35% credit grant specifically for micro food processors.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          11. HOW IT WORKS
      ================================================== */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Simple 4-Step Process</span>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">
              How SchemeSaathi AI Works
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
            
            {/* Step 1 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3 relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg">
                01
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Create Your Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide basic details on social category, location, and financial capacity.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3 relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg">
                02
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Tell Us About Business</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe your activity, project budget estimate, and target enterprise stage.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3 relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg">
                03
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">AI Matches Schemes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our engine screens eligibility rules across 4,700+ schemes instantly.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3 relative">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-lg">
                04
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Prepare & Apply</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review explainable match scores, checklist documents, and start application.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          12. FEATURED SCHEME CAROUSEL #2
      ================================================== */}
      <section className="py-20 bg-[#F8FAF8] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Top Matches For Entrepreneurs
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Explore tailored schemes for SC/ST, OBC, Women, Rural and Micro-Enterprise Founders.
            </p>
          </div>

          <div className="animate-marquee-fast hover:[animation-play-state:paused] flex gap-6 py-4">
            {[...FEATURED_SCHEMES, ...FEATURED_SCHEMES].map((scheme, idx) => (
              <div
                key={`second-carousel-${scheme.id}-${idx}`}
                className="w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold mb-2">
                    <span className="text-emerald-700">{scheme.matchScore}% Match</span>
                    <span className="text-slate-400 font-normal">{scheme.subsidy}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{scheme.name}</h4>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">{scheme.description}</p>
                </div>
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="mt-4 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================================================
          13. CTA SECTION
      ================================================== */}
      <section className="py-20 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-4 py-1 text-xs font-bold text-emerald-200 border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5" /> Start Discovering Today
          </span>

          <h2 className="font-display text-3xl font-extrabold sm:text-5xl tracking-tight leading-tight">
            Your Next Opportunity Could Be One Click Away.
          </h2>

          <p className="mx-auto max-w-2xl text-base text-emerald-100/90 leading-relaxed font-medium">
            Tell us about yourself and your business. SchemeSaathi AI will help you discover government schemes that may fit your profile.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setQuestionnaireOpen(true)}
              className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-emerald-900 shadow-xl hover:bg-emerald-50 transition active:scale-95"
            >
              Find My Schemes →
            </button>
            <a
              href="#schemes"
              className="w-full sm:w-auto rounded-2xl border border-emerald-400/40 bg-emerald-800/40 px-8 py-4 text-base font-extrabold text-white hover:bg-emerald-800/80 transition"
            >
              Explore Schemes
            </a>
          </div>

        </div>
      </section>

      {/* ==================================================
          14. FOOTER
      ================================================== */}
      <footer id="footer" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-lg">
                  S
                </div>
                <span className="font-display text-xl font-black text-white">SchemeSaathi AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Empowering marginalized, rural, and first-time Indian entrepreneurs to discover and navigate government scheme support.
              </p>
            </div>

            {/* Col 1 */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#hero" className="hover:text-white transition">Home</a></li>
                <li><button onClick={() => setQuestionnaireOpen(true)} className="hover:text-white transition text-left">Find Schemes</button></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><button onClick={() => setCompareModalOpen(true)} className="hover:text-white transition text-left">Compare Schemes</button></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#schemes" className="hover:text-white transition">Scheme Directory</a></li>
                <li><a href="#why-different" className="hover:text-white transition">Eligibility Guide</a></li>
                <li><button onClick={() => setDocModalOpen(true)} className="hover:text-white transition text-left">Documents</button></li>
                <li><a href="#footer" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#hero" className="hover:text-white transition">About Us</a></li>
                <li><a href="#footer" className="hover:text-white transition">Contact</a></li>
                <li><a href="#footer" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#footer" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          {/* Legal Disclaimer Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-300 mb-1">Important Legal Disclaimer:</p>
            SchemeSaathi AI provides preliminary scheme recommendations and informational guidance. Final eligibility, approval and benefits are determined by the respective government department, implementing agency or financial institution.
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 SchemeSaathi AI. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Designed for Indian Entrepreneurs 🇮🇳</p>
          </div>

        </div>
      </footer>

      {/* ==================================================
          MODAL 1: PROFILE QUESTIONNAIRE MODAL
      ================================================== */}
      {questionnaireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setQuestionnaireOpen(false);
                setQuizSubmitted(false);
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            {!quizSubmitted ? (
              <div>
                <div className="mb-6">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">AI Scheme Discovery Quiz</span>
                  <h3 className="font-display text-2xl font-extrabold text-slate-900">Find Schemes For Your Profile</h3>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Entrepreneur Social Category</label>
                    <select
                      value={quizState.category}
                      onChange={(e) => setQuizState({ ...quizState, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-slate-50"
                    >
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="OBC">OBC</option>
                      <option value="Women">Women Entrepreneur</option>
                      <option value="Minority">Minority Category</option>
                      <option value="General">General Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Business Type / Industry</label>
                    <select
                      value={quizState.businessType}
                      onChange={(e) => setQuizState({ ...quizState, businessType: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-slate-50"
                    >
                      <option value="Food Processing">Food Processing & Agriculture</option>
                      <option value="Manufacturing">Manufacturing & Textiles</option>
                      <option value="Services">Service Sector Enterprise</option>
                      <option value="Trading">Small Retail & Trading</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Estimated Project Budget (₹ Lakh)</label>
                    <input
                      type="number"
                      value={quizState.projectCost}
                      onChange={(e) => setQuizState({ ...quizState, projectCost: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-slate-50"
                      placeholder="e.g. 10"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Enterprise Location</label>
                    <input
                      type="text"
                      value={quizState.location}
                      onChange={(e) => setQuizState({ ...quizState, location: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-3 bg-slate-50"
                      placeholder="e.g. Rural Maharashtra"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full rounded-xl bg-emerald-700 py-3.5 font-bold text-white shadow-md hover:bg-emerald-800"
                  >
                    Match Schemes Now →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="font-display text-2xl font-extrabold text-slate-900">Your Matches Are Ready!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Based on your profile ({quizState.category}, {quizState.businessType}, ₹{quizState.projectCost}L budget), we found top government schemes matching your needs.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">PMEGP Scheme</h4>
                      <p className="text-[11px] text-slate-500">Up to 35% Rural Subsidy</p>
                    </div>
                    <span className="rounded-xl bg-emerald-700 px-3 py-1 text-xs font-black text-white">94% Fit</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-emerald-200/60 pt-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Stand Up India</h4>
                      <p className="text-[11px] text-slate-500">Targeted Loan Guarantee</p>
                    </div>
                    <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white">89% Fit</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    href="/auth?mode=signup"
                    className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow"
                  >
                    Continue to Full Scheme Wizard & Apply →
                  </Link>
                  <button
                    onClick={() => setQuizSubmitted(false)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Adjust Search Profile
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 2: SCHEME DETAILS MODAL
      ================================================== */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedScheme(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                  {selectedScheme.category}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {selectedScheme.matchScore}% AI Match
                </span>
              </div>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">{selectedScheme.name}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedScheme.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Subsidy / Benefit</span>
                <span className="font-extrabold text-emerald-700 text-sm">{selectedScheme.subsidy || 'Financial Support'}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-bold uppercase text-[10px]">Max Financial Limit</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedScheme.maxFunding || 'As per project'}</span>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Why It Matches Your Profile</h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {selectedScheme.reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedScheme(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                href="/auth?mode=login"
                className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Login to Apply for Scheme →
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 3: DOCUMENT READINESS CHECKLIST MODAL
      ================================================== */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setDocModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Document Checklist Engine</span>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Required Entrepreneur Documents</h3>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span>1. Aadhaar Card (Applicant & Co-applicant)</span>
                <span className="text-emerald-700">✓ Ready</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span>2. PAN Card / Business Tax Identification</span>
                <span className="text-emerald-700">✓ Ready</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span>3. Udyam Registration MSME Certificate</span>
                <span className="text-emerald-700">✓ Ready</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                <span>4. Detailed Project Report (DPR Summary)</span>
                <span className="text-amber-700 font-extrabold">⚠ Draft Required</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                <span>5. Caste / Social Category Certificate</span>
                <span className="text-amber-700 font-extrabold">⚠ Pending Upload</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={() => setDocModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Close
              </button>
              <Link
                href="/auth?mode=login"
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
              >
                Sign In to Upload Documents →
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 4: COMPARE SCHEMES MODAL
      ================================================== */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setCompareModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Side-by-Side Analysis</span>
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Compare Government Schemes</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-2xl p-4 bg-slate-50">
              <div className="space-y-3">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">PMEGP</span>
                <h4 className="font-extrabold text-sm text-slate-900">PMEGP Subsidy</h4>
                <p className="text-slate-500">Margin money subsidy up to 35% for new units.</p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="block font-bold text-slate-700">Max Limit: ₹50 Lakh</span>
                  <span className="block font-bold text-emerald-700">Subsidy: 15% - 35%</span>
                </div>
              </div>

              <div className="space-y-3 border-l border-slate-200 pl-4">
                <span className="rounded-md bg-slate-200 px-2 py-0.5 font-bold text-slate-800">CGTMSE</span>
                <h4 className="font-extrabold text-sm text-slate-900">CGTMSE Credit Guarantee</h4>
                <p className="text-slate-500">Collateral-free bank loan coverage up to ₹5 Cr.</p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="block font-bold text-slate-700">Max Limit: ₹5 Crore</span>
                  <span className="block font-bold text-emerald-700">Collateral: 0% Required</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCompareModalOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Close Comparison
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
