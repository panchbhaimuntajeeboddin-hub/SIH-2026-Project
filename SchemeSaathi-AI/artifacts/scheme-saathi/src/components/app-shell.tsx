import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetProfile } from '@workspace/api-client-react';
import { Activity, BookOpenCheck, BriefcaseBusiness, Building2, Calculator, CheckCircle2, ChevronRight, Database, ExternalLink, FileCheck2, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, MessageCircleQuestion, Milestone, Phone, Scale, Settings2, ShieldCheck, Sparkles, User, UserRound, Wand2, X } from 'lucide-react';
import { FloatingChatbotWidget } from './floating-chatbot-widget';

import { useLanguage, type LanguageCode } from '@/lib/i18n';

const navigationItems = [
  { href: '/', key: 'overview', defaultLabel: 'Overview', icon: LayoutDashboard },
  { href: '/udyam', key: 'udyamData', defaultLabel: 'UDYAM Govt Data', icon: Database },
  { href: '/knowledge-portal', key: 'knowledgePortal', defaultLabel: 'Knowledge Portal', icon: BookOpenCheck },
  { href: '/wizard', key: 'wizard', defaultLabel: '7-Step Scheme Wizard', icon: Wand2 },
  { href: '/profile', key: 'profile', defaultLabel: 'Your profile', icon: UserRound },
  { href: '/recommendations', key: 'recommendations', defaultLabel: 'Recommendations', icon: Sparkles },
  { href: '/calculator', key: 'calculator', defaultLabel: 'Financial Calculator', icon: Calculator },
  { href: '/roadmap', key: 'roadmap', defaultLabel: 'Application Roadmap', icon: Milestone },
  { href: '/documents', key: 'documents', defaultLabel: 'Documents AI', icon: FileCheck2 },
  { href: '/compare', key: 'compare', defaultLabel: 'Compare', icon: Scale },
  { href: '/assistant', key: 'askSaathi', defaultLabel: 'Ask Saathi', icon: MessageCircleQuestion },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const activeLocation = useLocation()[0];

  const profileQuery = useGetProfile();
  const profileData = (profileQuery.data || {}) as Record<string, any>;

  // Get user session from localStorage if available
  const storedSession: Record<string, any> = (() => {
    try {
      return JSON.parse(localStorage.getItem('schemesaathi_session') || '{}');
    } catch {
      return {};
    }
  })();

  const userName = profileData.name || storedSession.name || 'Entrepreneur';
  const userMobile = profileData.mobileNumber || storedSession.mobileNumber || 'Not specified';
  const userEmail = profileData.email || storedSession.email || 'Not specified';
  const userRole = storedSession.role || 'Entrepreneur (User)';
  const userState = profileData.state || 'Maharashtra';
  const userDistrict = profileData.district || 'Pune';
  const userBusiness = profileData.businessName || (userName !== 'Entrepreneur' ? `${userName.split(' ')[0]}'s Enterprise` : 'Enterprise Unit');
  const userCategory = profileData.category || 'General';
  const userGender = profileData.gender || 'Not specified';
  const completeness = profileData.completeness ?? 68;

  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AS';

  // Close profile card when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileCardRef.current && !profileCardRef.current.contains(event.target as Node)) {
        setShowProfileCard(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('schemesaathi_session_token');
    localStorage.removeItem('schemesaathi_session');
    window.location.href = '/';
  };

  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('schemesaathi_session_token'));
  if (activeLocation === '/landing' || activeLocation === '/auth' || (activeLocation === '/' && !hasToken)) {
    return <div className="noise min-h-[100dvh] bg-background">{children}</div>;
  }

  return <div className="noise min-h-[100dvh] bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3">
        <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
          <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-sidebar-primary font-display text-xl font-black text-sidebar-primary-foreground">S</span>
          <span><span className="block font-display text-[17px] font-extrabold tracking-tight">SchemeSaathi</span><span className="block font-mono-ui text-[9px] uppercase tracking-[.15em] text-sidebar-foreground/55">AI guide for growth</span></span>
        </Link>
        <button className="rounded-lg p-2 text-sidebar-foreground/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={18} /></button>
      </div>
      <div className="mx-3 mb-4 mt-8 h-px bg-sidebar-border" />
      <p className="px-3 pb-2 font-mono-ui text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/45">{t('workspace', 'Your workspace')}</p>
      <nav className="space-y-1">
        {navigationItems.map(({ href, key, defaultLabel, icon: Icon }) => {
          const label = t(key, defaultLabel);
          const active = href === '/' ? activeLocation === '/' : activeLocation.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/68 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${defaultLabel.toLowerCase().replaceAll(' ', '-')}`}>
            <Icon size={17} className={active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'} /><span className="flex-1">{label}</span>{active && <ChevronRight size={14} className="text-sidebar-primary" />}
          </Link>;
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-sidebar-foreground/62 transition hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="link-nav-admin"><Settings2 size={17} className="text-sidebar-foreground/50" />{t('adminView', 'Admin view')}</Link>
        <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sidebar-primary"><Activity size={15} /><span className="font-mono-ui text-[9px] font-bold uppercase tracking-[.18em]">{t('liveSignals', 'Live signals')}</span></div>
          <p className="text-xs leading-5 text-sidebar-foreground/65">Recommendations are checked against current scheme sources.</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{t('sourceSync', 'Source sync healthy')}</div>
        </div>
        <div className="flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary font-bold text-sidebar-primary-foreground">{initials}</div>
            <div><p className="text-xs font-bold">{userName}</p><p className="text-[10px] text-sidebar-foreground/45">Entrepreneur</p></div>
          </div>
          <button
            onClick={handleSignOut}
            title="Log Out & Return to Sign Up"
            className="inline-flex items-center gap-1 rounded-xl border border-sidebar-border bg-sidebar-accent/70 px-2.5 py-1.5 text-[11px] font-bold text-sidebar-foreground transition hover:bg-rose-500 hover:text-white"
            data-testid="button-sidebar-logout"
          >
            <LogOut size={13} /> {t('logOut', 'Log Out')}
          </button>
        </div>
      </div>
    </aside>
    {open && <button className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" data-testid="button-overlay-close" />}
    <main className="min-h-[100dvh] lg:pl-[260px]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-3"><button className="rounded-xl border border-border bg-card p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={19} /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><BriefcaseBusiness size={14} className="text-primary" /> {t('supportHeader', 'Practical support for your next move')}</div></div>
        <div className="flex items-center gap-3">
          {/* STEP 12: Multilingual Language Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold">
            <span className="text-muted-foreground font-bold">🌐</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
              title="Select Language / भाषा चुनें"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>

          <Link href="/assistant" className="hidden items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground sm:flex" data-testid="link-header-assistant">
            <Sparkles size={14} /> {t('voiceAiSaathi', 'Voice & AI Saathi')}
          </Link>
          
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-600 hover:text-white"
            data-testid="button-header-logout"
          >
            <LogOut size={14} /> {t('logOut', 'Log Out')}
          </button>

          {/* AS AVATAR BUTTON WITH POPUP PROFILE CARD */}
          <div className="relative" ref={profileCardRef}>
            <button
              onClick={() => setShowProfileCard((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground shadow-md transition hover:scale-105 hover:ring-2 hover:ring-primary/40 cursor-pointer"
              title="Click to view login & profile details"
              data-testid="link-header-profile"
            >
              {initials}
            </button>

            {/* POPUP USER PROFILE DETAILS CARD */}
            {showProfileCard && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-extrabold text-primary-foreground shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-foreground">{userName}</h3>
                    <p className="text-xs font-bold text-primary">{userRole}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                      <CheckCircle2 size={11} /> Authenticated User
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <Phone size={14} className="text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</span>
                      <span className="font-bold">{userMobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <Mail size={14} className="text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
                      <span className="font-bold">{userEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <Building2 size={14} className="text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise Name</span>
                      <span className="font-bold">{userBusiness}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Location & Region</span>
                      <span className="font-bold">{userDistrict}, {userState}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <User size={14} className="text-primary shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Social Category & Gender</span>
                      <span className="font-bold">{userCategory} / {userGender}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-primary/10 p-2.5 text-[11px] font-semibold text-primary flex items-center justify-between">
                    <span>Profile Completeness:</span>
                    <span className="font-bold font-mono-ui text-xs">{completeness}%</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileCard(false)}
                    className="flex-1 inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow transition hover:brightness-110"
                  >
                    Edit Profile Details
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileCard(false);
                      handleSignOut();
                    }}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    title="Log Out"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-8 lg:px-10">{children}</div>
    </main>
    <FloatingChatbotWidget />
  </div>;
}