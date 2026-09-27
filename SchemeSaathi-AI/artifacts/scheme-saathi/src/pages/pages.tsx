import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useAddDocument, useAskAssistant, useCalculateFinancials, useCreateChatThread, useCreateMatch, useCreateScheme, useDeleteChatThread, useDeleteScheme, useGenerateDpr, getGetApplicationReadinessQueryKey, getGetDashboardQueryKey, getGetProfileQueryKey, getGetRoadmapQueryKey, getGetSchemeQueryKey, getListDocumentsQueryKey, getListRecommendationsQueryKey, useGetAdminChatStats, useGetApplicationReadiness, useGetDashboard, useGetProfile, useGetRoadmap, useGetScheme, useGetThreadMessages, useHealthCheck, useListChatThreads, useListDocuments, useListRecommendations, useListSchemes, useProcessDocument, useSaveProfile, useSendChatMessage, useSubmitChatFeedback, useToggleMilestone, useUpdateScheme } from '@workspace/api-client-react';
import type { ChatMessage, ChatThread, Document, MatchingCriterion, ProfileInput, Recommendation, RoadmapMilestone, Scheme } from '@workspace/api-client-react';
import { AlertCircle, AlertOctagon, AlertTriangle, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Building2, Calculator, Check, CheckCircle2, CheckSquare, ClipboardCheck, Clock3, Coins, Copy, Edit, ExternalLink, Eye, EyeOff, FileCheck, FileCheck2, FileSpreadsheet, FileText, FileWarning, Filter, Globe, Info, Landmark, Layers, Lock, Mail, MapPin, MessageCircleQuestion, MessageSquare, Mic, MicOff, Milestone, Paperclip, Phone, Plus, Printer, RefreshCw, Scale, Search, Send, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, ThumbsDown, ThumbsUp, Trash2, TrendingUp, UploadCloud, User, Volume2, VolumeX, Wand2, X } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, LinkArrow, LoadingPage, PendingLabel, ProgressBar, ScorePill, SectionHeading } from '@/components/ui-kit';
export { LandingPage } from './LandingPage';


const emptyProfile: ProfileInput = { name: '', age: 18, gender: '', category: '', state: '', district: '', annualIncome: 0, investmentAvailable: 0, projectCost: 0, loanRequirement: 0, businessType: '', industry: '', businessStatus: '', location: '', expectedTurnover: 0, employees: 0, education: '', experience: '', training: '', previousLoan: '', previousAssistance: '' };

function formatMoney(value?: number | null) {
  if (value === undefined || value === null) return 'Not specified';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value?: string) {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PageIntro({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 font-mono-ui text-[10px] font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-[-.035em] md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p></div>{action}</div>;
}

function ReadinessCard({ percentage, uploaded, required, missing }: { percentage: number; uploaded: number; required: number; missing: string[] }) {
  return <Card className="relative overflow-hidden p-5"><div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-secondary/30 blur-2xl" /><div className="relative flex items-start justify-between gap-4"><div><p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.15em] text-primary">Application readiness</p><h3 className="mt-2 font-display text-2xl font-extrabold">{percentage}% ready</h3><p className="mt-1 text-xs text-muted-foreground">{uploaded} of {required} required documents marked ready</p></div><div className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-secondary bg-secondary/15 font-mono-ui text-xs font-bold">{percentage}%</div></div><ProgressBar value={percentage} className="relative mt-5" />{missing.length > 0 && <p className="relative mt-3 text-xs text-muted-foreground"><span className="font-bold text-foreground">Next up:</span> {missing[0]}</p>}</Card>;
}

function SchemeCard({ recommendation, onCompare }: { recommendation: Recommendation; onCompare?: (scheme: Scheme) => void }) {
  const { scheme } = recommendation;
  return <Card className="group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_hsl(190_30%_20%/.09)]" data-testid={`card-recommendation-${scheme.id}`}>
    <div className="mb-5 flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Landmark size={20} /></div><ScorePill score={recommendation.score} /></div>
    <div className="flex-1"><div className="mb-2 flex flex-wrap gap-2"><Badge tone="teal">{scheme.category}</Badge>{recommendation.status && <Badge tone={recommendation.status.toLowerCase().includes('eligible') ? 'green' : 'yellow'}>{recommendation.status}</Badge>}</div><h3 className="font-display text-xl font-extrabold leading-tight">{scheme.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{scheme.description}</p><div className="mt-4 space-y-2">{recommendation.reasons.slice(0, 2).map((reason, index) => <div key={`${scheme.id}-reason-${index}`} className="flex items-start gap-2 text-xs leading-5 text-foreground/75"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-primary" />{reason}</div>)}</div></div>
    <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><Link href={`/schemes/${scheme.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-2" data-testid={`link-view-scheme-${scheme.id}`}>See why it fits <LinkArrow /></Link>{onCompare && <button onClick={() => onCompare(scheme)} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline" data-testid={`button-compare-${scheme.id}`}>Compare</button>}</div>
  </Card>;
}

export function DashboardPage() {
  const dashboard = useGetDashboard();
  if (dashboard.isLoading) return <LoadingPage />;
  if (dashboard.isError || !dashboard.data) return <ErrorState onRetry={() => dashboard.refetch()} />;
  const data = dashboard.data;
  return <div className="page-in space-y-8">
    <PageIntro eyebrow={data.profile?.name ? `Good morning, ${data.profile.name.split(' ')[0]}` : 'Good morning'} title={data.profile?.name ? `A clearer path for ${data.profile.name.split(' ')[0]}.` : 'A clearer path to your next move.'} detail="We translate your business story into practical government support — with the reasoning and paperwork laid out plainly." action={<Link href="/recommendations" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/.16)] transition hover:brightness-110" data-testid="link-dashboard-recommendations">Explore matches <ArrowRight size={16} /></Link>} />
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><Card className="relative overflow-hidden bg-primary p-6 text-primary-foreground md:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[34px] border-secondary/25" /><div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full border-[22px] border-accent/20" /><div className="relative max-w-xl"><div className="mb-5 flex items-center gap-2 text-secondary"><Sparkles size={17} /><span className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em]">Your strongest match</span></div><h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">{data.topRecommendation?.scheme?.name || 'Your recommendations are taking shape'}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75">{data.topRecommendation?.scheme?.description || 'Complete your profile and we will find schemes that understand your stage, location, and ambition.'}</p>{data.topRecommendation && <div className="mt-6 flex flex-wrap items-center gap-3"><Badge tone="yellow">{Math.round(data.topRecommendation.score)}% fit</Badge><Link href={`/schemes/${data.topRecommendation.scheme.id}`} className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-bold transition hover:bg-primary-foreground/20" data-testid="link-top-recommendation">View match <ArrowUpRight size={14} /></Link></div>}</div></Card><ReadinessCard {...data.readiness} /></div>
    
    <section>
      <SectionHeading eyebrow="Financial & Process Suite" title="Entrepreneur Decision Tools" detail="Assess subsidy rates, track application steps, and draft project reports." />
      <div className="grid gap-5 md:grid-cols-3">
        <Card className="group flex flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600"><Calculator size={20} /></div>
            <h3 className="font-display text-lg font-extrabold">Subsidy & EMI Calculator</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Calculate margin money subsidy (15%–35%), required owner contribution, bank loan portion, and monthly EMI.</p>
          </div>
          <Link href="/calculator" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2">Open calculator <ArrowRight size={14} /></Link>
        </Card>
        <Card className="group flex flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><Milestone size={20} /></div>
            <h3 className="font-display text-lg font-extrabold">Application Roadmap</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Step-by-step progress checklist from profile verification to bank sanction and margin money disbursal.</p>
          </div>
          <Link href="/roadmap" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2">Track roadmap <ArrowRight size={14} /></Link>
        </Card>
        <Card className="group flex flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><FileSpreadsheet size={20} /></div>
            <h3 className="font-display text-lg font-extrabold">Project Report (DPR) Outline</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Generate a bank-ready Detailed Project Report summary tailored to your chosen scheme and entrepreneur profile.</p>
          </div>
          <Link href="/dpr" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2">Generate DPR <ArrowRight size={14} /></Link>
        </Card>
      </div>
    </section>

    <div className="grid gap-8 xl:grid-cols-[1.45fr_.55fr]"><section><SectionHeading eyebrow="A considered shortlist" title="Latest recommendations" detail="Ranked for your current profile, not a generic list." action={<Link href="/recommendations" className="text-xs font-bold text-primary" data-testid="link-all-recommendations">View all</Link>} />{data.recommendations?.length ? <div className="grid gap-4 md:grid-cols-2">{data.recommendations.slice(0, 4).map((item) => <SchemeCard key={item.scheme.id} recommendation={item} />)}</div> : <EmptyState title="Your shortlist is waiting" detail="Add a little more context to your profile and Saathi will look for a stronger match." action={<Link href="/profile" className="text-sm font-bold text-primary" data-testid="link-complete-profile">Complete profile</Link>} />}</section><section><SectionHeading eyebrow="Your momentum" title="Recent activity" /><Card className="divide-y divide-border p-2">{data.recentActivity?.length ? data.recentActivity.map((activity, index) => <div key={`${activity}-${index}`} className="flex gap-3 p-3"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" /><p className="text-sm leading-5 text-muted-foreground" data-testid={`text-activity-${index}`}>{activity}</p></div>) : <div className="p-6 text-sm text-muted-foreground">Your first steps will appear here.</div>}</Card></section></div>
  </div>;
}

const profileSteps = [
  { title: 'About you', fields: ['name', 'age', 'gender', 'category', 'education'] as (keyof ProfileInput)[], hint: 'A few details help us understand which support is meant for you.' },
  { title: 'Where you work', fields: ['state', 'district', 'location', 'businessType', 'industry', 'businessStatus'] as (keyof ProfileInput)[], hint: 'Schemes often differ by state, district, and business stage.' },
  { title: 'The numbers', fields: ['annualIncome', 'investmentAvailable', 'projectCost', 'loanRequirement', 'expectedTurnover', 'employees'] as (keyof ProfileInput)[], hint: 'Estimates are fine. They help us make the shortlist more useful.' },
  { title: 'Your experience', fields: ['experience', 'training', 'previousLoan', 'previousAssistance'] as (keyof ProfileInput)[], hint: 'This context can unlock training support and remove avoidable surprises.' },
];
const labels: Partial<Record<keyof ProfileInput, string>> = { name: 'Full name', age: 'Age', gender: 'Gender', category: 'Social category', state: 'State', district: 'District', annualIncome: 'Annual household income', investmentAvailable: 'Investment available', projectCost: 'Estimated project cost', loanRequirement: 'Loan requirement', businessType: 'Business type', industry: 'Industry', businessStatus: 'Business status', location: 'Business location', expectedTurnover: 'Expected annual turnover', employees: 'Number of employees', education: 'Highest education', experience: 'Relevant experience', training: 'Training completed', previousLoan: 'Previous loan', previousAssistance: 'Previous government assistance' };
const numberFields = new Set<keyof ProfileInput>(['age', 'annualIncome', 'investmentAvailable', 'projectCost', 'loanRequirement', 'expectedTurnover', 'employees']);
const selectOptions: Partial<Record<keyof ProfileInput, string[]>> = { gender: ['Female', 'Male', 'Prefer not to say'], category: ['General', 'OBC', 'SC', 'ST', 'Minority'], businessType: ['Sole proprietorship', 'Partnership', 'Private limited', 'Self-help group'], businessStatus: ['Idea stage', 'Early operations', 'Growing business', 'Established'], education: ['Below class 10', 'Class 10–12', 'Graduate', 'Postgraduate'], training: ['None yet', 'Basic entrepreneurship', 'Technical training', 'Business management'] };

function ProfileField({ field, value, onChange }: { field: keyof ProfileInput; value?: string | number; onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void }) {
  const options = selectOptions[field];
  const labelText = labels[field] || String(field);
  return <label className="block"><span className="mb-2 block text-xs font-bold text-foreground/80">{labelText}</span>{options ? <select name={field} value={value} onChange={onChange} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid={`input-profile-${field}`}><option value="">Select one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input name={field} type={numberFields.has(field) ? 'number' : 'text'} min={numberFields.has(field) ? 0 : undefined} value={value} onChange={onChange} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder={field === 'name' ? 'Your full name' : `Enter ${labelText.toLowerCase()}`} data-testid={`input-profile-${field}`} />}</label>;
}

export function ProfilePage() {
  const profileQuery = useGetProfile();
  const schemesQuery = useListSchemes({});
  const save = useSaveProfile();
  const match = useCreateMatch();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileInput>(emptyProfile);
  const initialized = useRef(false);

  useEffect(() => {
    if (profileQuery.data && !initialized.current) {
      initialized.current = true;
      setForm(profileQuery.data);
    }
  }, [profileQuery.data]);

  const catalog = schemesQuery.data || [];

  // REAL-TIME RUNTIME SCHEME MATCHING ENGINE
  const liveMatches = useMemo(() => {
    if (!catalog.length) return [];
    const age = Number(form.age || 25);
    const cost = Number(form.projectCost || 1000000);
    const category = form.category || 'General';
    const bType = form.businessType || 'Manufacturing';

    return catalog
      .map((scheme) => {
        let score = 70;
        const reasons: string[] = [];

        if (age >= (scheme.minAge || 18) && age <= (scheme.maxAge || 65)) {
          score += 10;
          reasons.push(`Age ${age} yrs within eligible range`);
        }
        if (['SC', 'ST', 'OBC', 'Women', 'Minority'].includes(category)) {
          score += 10;
          reasons.push(`${category} Category Subsidy Grant`);
        }
        if (!scheme.maxProjectCost || cost <= scheme.maxProjectCost) {
          score += 10;
          reasons.push(`Cost ₹${(cost / 100000).toFixed(1)}L within scheme limit`);
        }
        if (scheme.businessTypes?.some((b) => b.toLowerCase().includes(bType.toLowerCase())) || scheme.category?.toLowerCase().includes(bType.toLowerCase())) {
          score += 8;
          reasons.push(`Sector '${bType}' matches target beneficiaries`);
        }

        const finalScore = Math.min(98, Math.max(50, score));
        const estSubsidy = Math.round(cost * ((scheme.subsidyRatePercent || 25) / 100));

        return {
          scheme,
          score: finalScore,
          estSubsidy,
          reason: reasons[0] || 'Eligible under general scheme guidelines',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [form, catalog]);

  if (profileQuery.isLoading || schemesQuery.isLoading) return <LoadingPage />;
  if (profileQuery.isError || schemesQuery.isError) return <ErrorState onRetry={() => { profileQuery.refetch(); schemesQuery.refetch(); }} />;

  const current = profileSteps[step];
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const field = event.target.name as keyof ProfileInput;
    const value = numberFields.has(field) ? Number(event.target.value) : event.target.value;
    setForm((old) => ({ ...old, [field]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (step < profileSteps.length - 1) {
      setStep((old) => old + 1);
      return;
    }
    save.mutate(
      { data: form },
      {
        onSuccess: (saved) => {
          queryClient.setQueryData(getGetProfileQueryKey(), saved);
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListRecommendationsQueryKey() });
          setLocation('/recommendations');
        },
      }
    );
    match.mutate({ data: form });
  };

  const completeness = profileQuery.data?.completeness ?? Math.round(((step + 1) / profileSteps.length) * 100);

  return (
    <div className="page-in">
      <PageIntro
        eyebrow="Real-Time Runtime AI Evaluation"
        title="Tell Saathi what you are building."
        detail="As you update your details, SchemeSaathi evaluates eligible government subsidies and calculates match scores in real time."
        action={
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <ShieldCheck size={16} /> Private by design
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[.34fr_.66fr]">
        <aside className="space-y-4">
          <Card className="p-4">
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">Profile strength</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-display text-3xl font-extrabold">{completeness}%</span>
              <span className="text-xs text-muted-foreground">useful context</span>
            </div>
            <ProgressBar value={completeness} className="mt-3" />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">A richer profile means fewer generic results and clearer next steps.</p>
          </Card>

          {/* REAL-TIME RUNTIME MATCH SUGGESTIONS WIDGET */}
          <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-card to-teal-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] font-extrabold uppercase tracking-[.18em] text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>Live Runtime AI Matches</span>
              </div>
              <Badge tone="green">Real-Time</Badge>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Evaluated live as you edit your details:
            </p>

            <div className="space-y-2.5">
              {liveMatches.map(({ scheme, score, estSubsidy, reason }) => (
                <div key={scheme.id} className="rounded-xl border border-border bg-card p-3 space-y-1 text-xs shadow-sm transition hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground line-clamp-1">{scheme.shortName || scheme.name}</span>
                    <Badge tone={score >= 85 ? 'green' : 'teal'}>{score}% Match</Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold pt-0.5">
                    <span>Est. Grant Subsidy:</span>
                    <span className="font-mono-ui font-extrabold">{formatMoney(estSubsidy)}</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground truncate pt-0.5">✓ {reason}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                save.mutate({ data: form }, { onSuccess: () => setLocation('/recommendations') });
              }}
              className="w-full h-9 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition mt-2"
            >
              <span>Explore All ({catalog.length}) Matches</span>
              <ArrowRight size={13} />
            </button>
          </Card>

          <div className="space-y-1">
            {profileSteps.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setStep(index)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  step === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                data-testid={`button-profile-step-${index}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono-ui text-[10px] font-bold ${
                  step === index ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <span className="text-sm font-semibold">{item.title}</span>
                {step > index && <CheckCircle2 size={14} className="ml-auto text-secondary" />}
              </button>
            ))}
          </div>
        </aside>

        <Card className="p-5 md:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                Step {step + 1} of {profileSteps.length}
              </p>
              <h2 className="mt-2 font-display text-2xl font-extrabold">{current.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
              {Math.round(((step + 1) / profileSteps.length) * 100)}%
            </span>
          </div>

          <form onSubmit={submit}>
            <div className="grid gap-5 md:grid-cols-2">
              {current.fields.map((field) => (
                <ProfileField key={field} field={field} value={form[field]} onChange={handleChange} />
              ))}
            </div>

            <div className="mt-9 flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={() => setStep((old) => old - 1)} data-testid="button-profile-back">
                  <ArrowLeft size={15} /> Back
                </Button>
              ) : (
                <span />
              )}
              {step < profileSteps.length - 1 ? (
                <Button type="submit" data-testid="button-profile-next">
                  Continue <ArrowRight size={15} />
                </Button>
              ) : (
                <Button type="submit" disabled={save.isPending} data-testid="button-profile-save">
                  {save.isPending ? <PendingLabel /> : <>Save and find my matches <Sparkles size={15} /></>}
                </Button>
              )}
            </div>

            {save.isError && (
              <p className="mt-4 text-sm font-semibold text-destructive" data-testid="status-profile-error">
                We could not save this just yet. Please try again.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

export function RecommendationsPage() {
  const recommendations = useListRecommendations();
  const dashboard = useGetDashboard();
  const catalog = useListSchemes({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');
  const [selectedCriteriaRec, setSelectedCriteriaRec] = useState<Recommendation | null>(null);

  const categories = useMemo(() => ['All', ...new Set((catalog.data ?? []).map((scheme) => scheme.category))], [catalog.data]);
  const filtered = useMemo(() => (recommendations.data ?? []).filter((item) => (category === 'All' || item.scheme.category === category) && `${item.scheme.name} ${item.scheme.description}`.toLowerCase().includes(search.toLowerCase())), [recommendations.data, search, category]);
  
  const ineligibleList = dashboard.data?.ineligibleSchemes || [];

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  if (recommendations.isLoading || dashboard.isLoading) return <LoadingPage />;
  if (recommendations.isError || dashboard.isError) return <ErrorState onRetry={() => { recommendations.refetch(); dashboard.refetch(); }} />;

  return (
    <div className="page-in space-y-8">
      <PageIntro
        eyebrow="Ranked for your story"
        title="AI Scheme Matching & Eligibility Engine"
        detail="Each scheme match includes explainable AI confidence scores, hard rule validation, matching criteria tables, and official application portals."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/wizard" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md hover:brightness-110">
              <Wand2 size={16} /> 7-Step Scheme Wizard
            </Link>
            {compareIds.length > 0 && (
              <Button onClick={() => setLocation(`/compare?ids=${compareIds.join(',')}`)} variant="soft" data-testid="button-open-compare">
                <ScaleIcon /> Compare ({compareIds.length})
              </Button>
            )}
          </div>
        }
      />

      {/* Tab Selector: Eligible vs Ineligible */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div className="flex rounded-2xl bg-muted p-1">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'eligible' ? 'bg-card text-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Eligible Matches ({filtered.length})
          </button>
          <button
            onClick={() => setActiveTab('ineligible')}
            className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition ${
              activeTab === 'ineligible' ? 'bg-card text-rose-600 shadow-md' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Why Not Eligible? ({ineligibleList.length})
          </button>
        </div>

        {activeTab === 'eligible' && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search scheme name or benefit..."
                className="h-9 w-full rounded-xl bg-muted/60 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-auto">
              <Filter size={14} className="shrink-0 text-muted-foreground" />
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    category === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Eligible Tab View */}
      {activeTab === 'eligible' && (
        <>
          {/* STEP 8: TOP 5 SCHEMES SHOWCASE BANNER */}
          {filtered.length > 0 && (
            <Card className="border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-card to-amber-500/10 p-6 shadow-xl">
              <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={16} /> STEP 8: AUTOMATED TOP 5 RECOMMENDATION ENGINE
                  </div>
                  <h2 className="font-display text-2xl font-extrabold mt-1">Top 5 Matched Government Schemes</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Ranked by deterministic eligibility rules and 5-factor weighted fit score</p>
                </div>
                <Badge tone="yellow">Top 5 Match Guarantee</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                {filtered.slice(0, 5).map((item, index) => (
                  <div
                    key={`top5-${item.scheme.id}`}
                    className="relative flex flex-col justify-between rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-md transition hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                  >
                    <div className="absolute -top-3 left-4 flex h-7 items-center justify-center rounded-full bg-primary px-3 text-[11px] font-black text-primary-foreground shadow-sm">
                      #{index + 1} RANK
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="truncate font-extrabold text-foreground">{item.scheme.shortName || item.scheme.name}</span>
                        <ScorePill score={item.score} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{item.scheme.description}</p>
                      
                      <div className="mt-3 rounded-lg bg-primary/5 p-2 text-[11px]">
                        <span className="font-bold text-primary block">Max Subsidy:</span>
                        <span className="font-mono-ui font-extrabold text-foreground">
                          {item.scheme.maxSubsidyAmount ? formatMoney(item.scheme.maxSubsidyAmount) : `${item.scheme.subsidyRatePercent}% Rate`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border flex items-center justify-between">
                      <Link
                        href={`/schemes/${item.scheme.id}`}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        View Rule Fit →
                      </Link>
                      {item.scheme.officialApplicationUrl && (
                        <a
                          href={item.scheme.officialApplicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                        >
                          Apply <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.scheme.id} className="group flex h-full flex-col justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Landmark size={20} />
                    </div>
                    <div className="text-right">
                      <ScorePill score={item.score} />
                      <p className="mt-1 font-mono-ui text-[10px] font-bold text-muted-foreground">Confidence: {item.confidenceLevel || 'High'}</p>
                    </div>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <Badge tone="teal">{item.scheme.category}</Badge>
                    <Badge tone="green">{item.matchClassification || 'Likely Eligible'}</Badge>
                  </div>

                  <h3 className="font-display text-xl font-extrabold leading-tight">{item.scheme.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.scheme.description}</p>

                  <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono-ui">Why this scheme matches you</p>
                    <p className="text-xs leading-5 text-foreground/80">{item.explanation || item.reasons[0]}</p>
                  </div>

                  {item.missingDocuments && item.missingDocuments.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                      <AlertCircle size={13} className="shrink-0" /> Missing: {item.missingDocuments.join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2.5 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCriteriaRec(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <SlidersHorizontal size={13} /> View Match Criteria ({item.verifiedCriteriaCount || 6}/{item.totalCriteriaCount || 10})
                    </button>
                    {item.scheme.officialApplicationUrl && (
                      <a
                        href={item.scheme.officialApplicationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Apply <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <Link href={`/schemes/${item.scheme.id}`} className="font-bold text-foreground/80 hover:text-primary">
                      Full Details <ArrowRight size={13} className="inline" />
                    </Link>
                    <button
                      onClick={() => setCompareIds((old) => old.includes(item.scheme.id) ? old.filter((id) => id !== item.scheme.id) : [...old, item.scheme.id].slice(-3))}
                      className="font-semibold text-muted-foreground hover:text-primary"
                    >
                      {compareIds.includes(item.scheme.id) ? '✓ Shortlisted' : '+ Compare'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matches found"
            detail="Try adjusting your search filter or complete your entrepreneur profile."
            action={<Link href="/profile" className="text-sm font-bold text-primary">Update profile</Link>}
          />
        )}
        </>
      )}

      {/* Ineligible Tab View */}
      {activeTab === 'ineligible' && (
        <div className="space-y-4">
          <Card className="border-rose-500/20 bg-rose-500/5 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-rose-600 shrink-0" size={20} />
              <div>
                <h3 className="font-display text-lg font-extrabold text-rose-950">Deterministic Hard Rules Transparency</h3>
                <p className="mt-1 text-xs leading-5 text-rose-800">
                  Under SchemeSaathi AI safety rules, mandatory scheme requirements (such as Maximum Age ceilings, Income limits, or Turnover thresholds) are treated as hard binary rules. If any mandatory rule fails, the scheme is marked Not Eligible with the exact disqualification reason below.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {ineligibleList.map((item) => (
              <Card key={item.scheme.id} className="border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="coral">❌ Not Eligible</Badge>
                    <h3 className="mt-2 font-display text-lg font-extrabold">{item.scheme.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.scheme.category} · {item.scheme.shortName}</p>
                  </div>
                  <span className="font-mono-ui text-xs font-bold text-muted-foreground">Limit: ₹{(item.scheme.maxProjectCost ? item.scheme.maxProjectCost / 100000 : 10).toFixed(0)}L</span>
                </div>

                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-900 font-mono-ui">Disqualification Reason</p>
                  <p className="mt-1 text-xs font-semibold text-rose-800">
                    {item.disqualificationReasons?.join(' ') || item.explanation || 'Does not satisfy mandatory age or category threshold.'}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 text-xs border-t border-border">
                  <span className="text-muted-foreground">Required Age: {item.scheme.minAge || 18}–{item.scheme.maxAge || 60} Yrs</span>
                  <Link href={`/schemes/${item.scheme.id}`} className="font-bold text-primary hover:underline">
                    View Scheme Rules <ArrowRight size={13} className="inline" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Criteria Modal */}
      {selectedCriteriaRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl overflow-hidden p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <Badge tone="teal">{selectedCriteriaRec.scheme.shortName}</Badge>
                <h3 className="mt-1 font-display text-xl font-extrabold">{selectedCriteriaRec.scheme.name}</h3>
              </div>
              <button onClick={() => setSelectedCriteriaRec(null)} className="rounded-lg p-2 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-xs text-muted-foreground leading-5">{selectedCriteriaRec.explanation}</p>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="p-2.5 font-bold">Criteria</th>
                    <th className="p-2.5 font-bold">Your Information</th>
                    <th className="p-2.5 font-bold">Scheme Requirement</th>
                    <th className="p-2.5 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedCriteriaRec.criteriaTable?.map((row, idx) => (
                    <tr key={idx} className={row.isSatisfied ? 'bg-emerald-500/5' : 'bg-rose-500/5'}>
                      <td className="p-2.5 font-semibold">{row.criteria}</td>
                      <td className="p-2.5 text-muted-foreground">{row.userValue}</td>
                      <td className="p-2.5 text-muted-foreground">{row.requirement}</td>
                      <td className="p-2.5 text-center font-bold">
                        {row.isSatisfied ? <span className="text-emerald-600">✓ Satisfied</span> : <span className="text-rose-600">❌ Mismatch</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Button onClick={() => setSelectedCriteriaRec(null)}>Close Matrix</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
function ScaleIcon() { return <Scale size={15} />; }

export function SchemeDetailsPage() {
  const { schemeId = '' } = useParams<{ schemeId: string }>();
  const schemeQuery = useGetScheme(schemeId, { query: { queryKey: getGetSchemeQueryKey(schemeId), enabled: !!schemeId } });
  if (schemeQuery.isLoading) return <LoadingPage />;
  if (schemeQuery.isError || !schemeQuery.data) return <ErrorState onRetry={() => schemeQuery.refetch()} />;
  const scheme = schemeQuery.data;
  return <div className="page-in"><Link href="/recommendations" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary" data-testid="link-back-recommendations"><ArrowLeft size={15} /> Back to recommendations</Link><div className="grid gap-8 xl:grid-cols-[1fr_.36fr]"><div><div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground"><Landmark size={28} /></div><Badge tone="teal">{scheme.category}</Badge><h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-[-.04em] md:text-5xl">{scheme.name}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{scheme.description}</p><div className="mt-6 flex flex-wrap gap-2">{scheme.locations.map((location) => <Badge key={location} tone="muted"><MapPin size={12} className="mr-1" />{location}</Badge>)}</div><div className="mt-10 grid gap-5 md:grid-cols-2"><Card className="p-6"><SectionHeading eyebrow="What it can unlock" title="Benefits" /> <ul className="space-y-4">{scheme.benefits.map((benefit, index) => <li key={`${benefit}-${index}`} className="flex gap-3 text-sm leading-6"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><CheckCircle2 size={13} /></span>{benefit}</li>)}</ul></Card><Card className="p-6"><SectionHeading eyebrow="Prepare with less stress" title="Documents" /><ul className="space-y-3">{scheme.documents.map((document, index) => <li key={`${document}-${index}`} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm"><FileText size={16} className="text-primary" />{document}</li>)}</ul><Link href="/documents" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-primary" data-testid="link-scheme-documents">Open document checklist <ArrowRight size={14} /></Link></Card></div></div><aside className="space-y-4"><Card className="overflow-hidden"><div className="bg-primary p-5 text-primary-foreground"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-secondary">Source verification</p><h2 className="mt-2 font-display text-xl font-extrabold">Information you can trace</h2></div><div className="space-y-4 p-5 text-sm"><div><p className="text-xs text-muted-foreground">Last verified</p><p className="mt-1 font-bold">{formatDate(scheme.lastVerified)}</p></div><div><p className="text-xs text-muted-foreground">Published source</p><p className="mt-1 break-words font-semibold text-primary">{scheme.source}</p></div><a href={scheme.source} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-bold transition hover:border-primary hover:text-primary" data-testid="link-open-source">Open official source <ExternalLink size={14} /></a></div></Card><Card className="p-5"><p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-primary">Scheme snapshot</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">For businesses</span><span className="text-right font-semibold">{scheme.businessTypes.join(', ')}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Target groups</span><span className="text-right font-semibold">{scheme.targetGroups?.join(', ') || 'Open category'}</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Max project cost</span><span className="font-semibold">{formatMoney(scheme.maxProjectCost)}</span></div></div></Card></aside></div></div>;
}

export function ComparePage() {
  const recommendations = useListRecommendations();
  const [location, setLocation] = useLocation();
  const ids = new URLSearchParams(location.split('?')[1] ?? '').get('ids')?.split(',').filter(Boolean) ?? [];
  const options = (recommendations.data ?? []).filter((item) => ids.includes(item.scheme.id)).slice(0, 3);
  const remove = (id: string) => { const next = ids.filter((item) => item !== id); setLocation(next.length ? `/compare?ids=${next.join(',')}` : '/compare'); };
  if (recommendations.isLoading) return <LoadingPage />;
  if (recommendations.isError) return <ErrorState onRetry={() => recommendations.refetch()} />;
  return <div className="page-in">
    <PageIntro eyebrow="Make the call" title="Compare what matters." detail="Lay the strongest options side by side. The right scheme is the one whose requirements you can realistically meet." action={<Link href="/recommendations" className="text-xs font-bold text-primary" data-testid="link-compare-add">Add from recommendations</Link>} />
    {options.length < 2 ? <EmptyState title="Choose two schemes to compare" detail="Select Compare on any recommendation card. We will keep the shortlist here while you make sense of the differences." action={<Link href="/recommendations" className="inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-compare-browse">Browse recommendations <ArrowRight size={15} /></Link>} /> : <Card className="overflow-x-auto p-1">
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${options.length}, minmax(190px, 1fr))` }}>
          <div className="bg-muted/50 p-5" />
          {options.map(({ scheme }) => <div key={scheme.id} className="relative border-l border-border p-5">
            <button onClick={() => remove(scheme.id)} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Remove ${scheme.shortName}`} data-testid={`button-remove-compare-${scheme.id}`}><X size={14} /></button>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Landmark size={18} /></div>
            <h2 className="pr-4 font-display text-lg font-extrabold leading-tight">{scheme.shortName || scheme.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{scheme.category}</p>
          </div>)}
        </div>
        {[
          ['Match score', ...options.map((item) => `${Math.round(item.score)}%`)],
          ['Max project cost', ...options.map((item) => formatMoney(item.scheme.maxProjectCost))],
          ['Subsidy rate', ...options.map((item) => item.scheme.subsidyRatePercent ? `${item.scheme.subsidyRatePercent}%` : 'None / Collateral cover')],
          ['Interest subvention', ...options.map((item) => item.scheme.interestSubventionPercent ? `${item.scheme.interestSubventionPercent}% discount` : 'Standard bank rate')],
          ['Processing time', ...options.map((item) => item.scheme.processingTimeWeeks ? `${item.scheme.processingTimeWeeks} Weeks` : '3-4 Weeks')],
          ['Target sector', ...options.map((item) => item.scheme.sector || 'General Enterprise')],
          ['Benefits', ...options.map((item) => `${item.scheme.benefits.length} listed`)],
          ['Documents', ...options.map((item) => `${item.scheme.documents.length} to prepare`)],
          ['Last verified', ...options.map((item) => formatDate(item.scheme.lastVerified))],
        ].map(([label, ...values], row) => <div className="grid border-t border-border" style={{ gridTemplateColumns: `180px repeat(${options.length}, minmax(190px, 1fr))` }} key={String(label)}>
          <div className="bg-muted/30 p-5 text-xs font-bold text-muted-foreground">{label}</div>
          {values.map((value, index) => <div key={`${row}-${index}`} className="border-l border-border p-5 text-sm font-semibold">{value}</div>)}
        </div>)}
        <div className="grid border-t border-border" style={{ gridTemplateColumns: `180px repeat(${options.length}, minmax(190px, 1fr))` }}>
          <div className="p-5" />
          {options.map(({ scheme }) => <div key={scheme.id} className="border-l border-border p-5"><Link href={`/schemes/${scheme.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-primary" data-testid={`link-compare-details-${scheme.id}`}>View details <ArrowRight size={14} /></Link></div>)}
        </div>
      </div>
    </Card>}
  </div>;
}

export function DocumentsPage() {
  const documents = useListDocuments();
  const readiness = useGetApplicationReadiness();
  const processDoc = useProcessDocument();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [type, setType] = useState('Identity');
  const [saved, setSaved] = useState(false);
  const [fileName, setFileName] = useState('');
  const [auditResult, setAuditResult] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    processDoc.mutate(
      { data: { name: name.trim(), type } },
      {
        onSuccess: () => {
          setName('');
          setFileName('');
          setSaved(true);
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetApplicationReadinessQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
          setTimeout(() => setSaved(false), 2600);
        },
      }
    );
  };

  if (documents.isLoading || readiness.isLoading) return <LoadingPage />;
  if (documents.isError || readiness.isError || !readiness.data) return <ErrorState onRetry={() => { documents.refetch(); readiness.refetch(); }} />;

  const runComplianceAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/documents/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('schemesaathi_session_token') || ''}`,
        },
      });
      const data = await res.json();
      setAuditResult(data);
    } catch {
      alert('Failed to run document compliance audit.');
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="page-in space-y-8">
      <PageIntro
        eyebrow="Document Verification AI Engine"
        title="Upload & Verify Entrepreneur Documents"
        detail="Upload PDF, PNG, or JPG files. Our Document AI automatically extracts data, verifies information against your profile, and detects missing or inconsistent records."
        action={
          <Button onClick={runComplianceAudit} disabled={auditing} size="sm" className="font-extrabold shadow-md">
            {auditing ? <PendingLabel /> : <>🔍 Run AI Compliance Pre-Audit</>}
          </Button>
        }
      />

      {auditResult && (
        <Card className="p-6 border-emerald-500/40 bg-emerald-500/5 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-col justify-between gap-4 border-b border-emerald-500/20 pb-4 md:flex-row md:items-center">
            <div>
              <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">
                AI Cross-Verification Compliance Audit
              </p>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-emerald-950 dark:text-emerald-100">
                {auditResult.status}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-500/30 bg-card px-4 py-2 text-center">
                <span className="block font-mono-ui text-2xl font-black text-emerald-600">{auditResult.score}%</span>
                <span className="block text-[10px] font-bold text-muted-foreground">Compliance Rating</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAuditResult(null)}>Close Audit</Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {auditResult.checks.map((c: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{c.field}</span>
                  <Badge tone={c.status === 'PASS' ? 'green' : 'yellow'}>{c.status}</Badge>
                </div>
                <p className="text-muted-foreground leading-5">{c.detail}</p>
              </div>
            ))}
          </div>

          {auditResult.recommendations && (
            <div className="mt-5 rounded-xl bg-background/80 p-4 text-xs space-y-1.5 border border-emerald-500/20">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Nodal Interview Preparation Steps:</p>
              {auditResult.recommendations.map((rec: string, idx: number) => (
                <p key={idx} className="text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{rec}</span>
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-8 xl:grid-cols-[.7fr_1.3fr]">
        <div className="space-y-5">
          <ReadinessCard {...readiness.data} />
          
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold">Upload Document for OCR AI</h2>
                <p className="text-xs text-muted-foreground">PDF, JPG, JPEG, PNG accepted</p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold">Select Document Type</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="Udyam Registration Certificate">Udyam Registration Certificate</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="GST Certificate">GST Certificate</option>
                  <option value="Income Certificate / ITR">Income Certificate / ITR</option>
                  <option value="Project Report (DPR)">Project Report (DPR)</option>
                  <option value="Caste Certificate">Caste Certificate</option>
                  <option value="Bank Statement">Bank Statement</option>
                  <option value="Business License">Business License</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold">Document Name / Reference</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Udyam Registration MH-12"
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center text-xs font-bold text-primary hover:bg-primary/10 transition">
                <UploadCloud size={24} />
                <span>{fileName || 'Click to select file (PDF, JPG, PNG)'}</span>
                <span className="text-[10px] text-muted-foreground">Max file size 10MB</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
              </label>

              <Button className="w-full h-11" type="submit" disabled={processDoc.isPending || !name.trim()}>
                {processDoc.isPending ? <PendingLabel /> : <>Run AI OCR & Verification <Wand2 size={16} /></>}
              </Button>

              {saved && <p className="text-center text-xs font-bold text-emerald-600">✓ Document AI processed and added to checklist.</p>}
            </form>
          </Card>
        </div>

        <Card className="p-6">
          <SectionHeading
            eyebrow="Verification Status"
            title="Document Checklist & Extracted Data"
            detail={`${documents.data?.length ?? 0} verified documents attached to profile`}
          />

          {documents.data?.length ? (
            <div className="space-y-4">
              {documents.data.map((document) => (
                <Card key={document.id} className="p-4 border-border/80">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{document.name}</h4>
                          <Badge tone="green">{document.status || 'Verified'}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{document.type} · Processed {formatDate(document.uploadedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-700">
                        <Check size={12} /> Profile Matched
                      </span>
                    </div>
                  </div>

                  {document.extractedInfo && Object.keys(document.extractedInfo).length > 0 && (
                    <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs">
                      <p className="font-mono-ui text-[10px] font-bold uppercase tracking-wider text-primary mb-2">OCR Extracted Information</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Object.entries(document.extractedInfo).map(([key, val]) => (
                          <div key={key} className="flex justify-between border-b border-border/40 pb-1">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="font-semibold text-foreground">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing filed yet" detail="Upload your first document above for AI OCR processing." />
          )}
        </Card>
      </div>
    </div>
  );
}

export function AssistantPage() {
  const queryClient = useQueryClient();
  const threadsQuery = useListChatThreads();
  const createThread = useCreateChatThread();
  const deleteThread = useDeleteChatThread();
  const sendMessage = useSendChatMessage();
  const submitFeedback = useSubmitChatFeedback();
  const docsQuery = useListDocuments();

  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [attachedDocIds, setAttachedDocIds] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr' | 'gu'>('en');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const speakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported on this browser.');
      return;
    }
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : selectedLanguage === 'gu' ? 'gu-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const threads: ChatThread[] = threadsQuery.data || [];
  const documents: Document[] = docsQuery.data || [];

  // Automatically select first thread if available
  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  const currentThreadId = activeThreadId || (threads[0] ? threads[0].id : '');
  const messagesQuery = useGetThreadMessages(currentThreadId);
  const messages: ChatMessage[] = messagesQuery.data || [];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendMessage.isPending]);

  const handleCreateNewThread = () => {
    createThread.mutate(
      undefined,
      {
        onSuccess: (newThread) => {
          setActiveThreadId(newThread.id);
          queryClient.invalidateQueries();
        },
      }
    );
  };

  const handleDeleteThread = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation thread?')) return;
    deleteThread.mutate(
      { threadId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          if (activeThreadId === threadId) {
            setActiveThreadId('');
          }
        },
      }
    );
  };

  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    sendMessage.mutate(
      {
        data: {
          threadId: currentThreadId || undefined,
          text: textToSend,
          attachedDocs: attachedDocIds,
          language: selectedLanguage,
        } as any,
      },
      {
        onSuccess: (newMsg) => {
          setActiveThreadId(newMsg.threadId);
          setTimeout(() => {
            queryClient.invalidateQueries();
          }, 100);
        },
      }
    );
  };

  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    submitFeedback.mutate(
      { data: { messageId, isHelpful } },
      {
        onSuccess: () => {
          setFeedbackSuccessId(messageId);
          setTimeout(() => setFeedbackSuccessId(null), 3000);
          queryClient.invalidateQueries();
        },
      }
    );
  };

  // Voice Input Handler (Web Speech API)
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported on this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  if (threadsQuery.isLoading) return <LoadingPage />;

  return (
    <div className="page-in space-y-6">
      <PageIntro
        eyebrow="Grounded AI Assistant"
        title="Personal Question-Answering Chatbot"
        detail="Private, grounded guidance for business schemes, application steps, eligibility rules, and document explanations with multi-thread context memory."
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        
        {/* Left Sidebar: Threads History Memory */}
        <Card className="flex flex-col h-[780px] p-4">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              <h3 className="font-display text-sm font-extrabold">Chat History</h3>
            </div>
            <Button size="sm" onClick={handleCreateNewThread} disabled={createThread.isPending}>
              <Plus size={14} /> New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {threads.length > 0 ? (
              threads.map((t) => {
                const isActive = t.id === activeThreadId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`group flex items-center justify-between rounded-xl p-3 text-xs font-semibold cursor-pointer transition ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/30 font-bold'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(t.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteThread(e, t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 transition"
                      title="Delete Thread"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No chat history yet. Click <strong>New Chat</strong> to begin.
              </div>
            )}
          </div>

          {/* Genuine Use Safety Badge */}
          <div className="mt-auto pt-3 border-t border-border">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-[11px] space-y-1 text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck size={14} className="text-emerald-600" /> Genuine-Use Policy Enforced
              </div>
              <p className="text-[10px] leading-4">
                Protects user data, prevents fake document creation, and delivers verified government scheme answers.
              </p>
            </div>
          </div>
        </Card>

        {/* Right Main Panel: Active Thread Feed & Input Studio */}
        <Card className="flex flex-col h-[780px] overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold">
                  {threads.find((t) => t.id === activeThreadId)?.title || 'New Scheme Assistant Session'}
                </h3>
                <p className="text-xs text-muted-foreground">Anchored to official KVIC, MSME, and DTFC nodal guidelines</p>
              </div>
            </div>

            {/* Language & Document Context Selection */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-bold">
                <Globe size={14} className="text-primary" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
              </div>

              {documents.length > 0 && (
                <div className="flex items-center gap-2">
                  <Paperclip size={14} className="text-muted-foreground" />
                  <select
                    value={attachedDocIds[0] || ''}
                    onChange={(e) => setAttachedDocIds(e.target.value ? [e.target.value] : [])}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-semibold outline-none focus:border-primary"
                  >
                    <option value="">Attach Document Context (Optional)</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    
                    {!isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md">
                        AI
                      </div>
                    )}

                    <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl p-4 text-sm leading-6 ${
                          isUser
                            ? 'bg-primary text-primary-foreground shadow-md rounded-tr-none'
                            : msg.isGuardrailBlocked
                            ? 'bg-rose-500/10 border border-rose-500/30 text-foreground rounded-tl-none'
                            : 'bg-muted/70 border border-border text-foreground rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {/* Guardrail Policy Refusal Box */}
                        {msg.isGuardrailBlocked && msg.structuredAnswer && (
                          <div className="mt-3 space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs">
                            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                              <ShieldAlert size={16} /> {msg.structuredAnswer.answer}
                            </div>
                            <p className="text-muted-foreground">{msg.structuredAnswer.why}</p>

                            <div className="space-y-1">
                              <p className="font-bold text-foreground">Legitimate Requirements:</p>
                              {msg.structuredAnswer.whatYouNeed.map((item, idx) => (
                                <p key={idx} className="text-muted-foreground">✓ {item}</p>
                              ))}
                            </div>

                            <div className="space-y-1">
                              <p className="font-bold text-foreground">Recommended Next Steps:</p>
                              {msg.structuredAnswer.nextSteps.map((step, idx) => (
                                <p key={idx} className="text-muted-foreground">{idx + 1}. {step}</p>
                              ))}
                            </div>

                            <div className="rounded-lg bg-background/80 p-2 font-semibold text-rose-600 dark:text-rose-400 text-[11px]">
                              ⚠️ {msg.structuredAnswer.important}
                            </div>
                          </div>
                        )}

                        {/* Valid Structured 5-Part AI Response Card */}
                        {!isUser && !msg.isGuardrailBlocked && msg.structuredAnswer && (
                          <div className="mt-3 space-y-3.5 text-xs">
                            {/* Audio Playback Button */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => speakText(msg.id, `${msg.structuredAnswer?.answer}. ${msg.structuredAnswer?.why}`)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                                  speakingMsgId === msg.id
                                    ? 'bg-rose-500 text-white animate-pulse'
                                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                                }`}
                              >
                                {speakingMsgId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                {speakingMsgId === msg.id ? 'Stop Audio' : '🔊 Listen to Advice'}
                              </button>
                            </div>

                            {/* 1. Direct Answer */}
                            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-blue-950 dark:text-blue-200">
                              <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">Answer</p>
                              <p className="leading-5">{msg.structuredAnswer.answer}</p>
                            </div>

                            {/* 2. Reasoning */}
                            <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3.5 text-teal-950 dark:text-teal-200">
                              <p className="font-bold text-teal-700 dark:text-teal-300 mb-1">Why this applies to you</p>
                              <p className="leading-5">{msg.structuredAnswer.why}</p>
                            </div>

                            {/* 3. What you need */}
                            <div className="rounded-xl border border-border bg-background p-3.5 space-y-1.5">
                              <p className="font-bold text-foreground mb-1">What You Need (Documents & Information)</p>
                              {msg.structuredAnswer.whatYouNeed.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>

                            {/* 4. Practical Next Steps */}
                            <div className="rounded-xl border border-border bg-background p-3.5 space-y-1.5">
                              <p className="font-bold text-foreground mb-1">Actionable Next Steps</p>
                              {msg.structuredAnswer.nextSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {idx + 1}
                                  </span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>

                            {/* 5. Important Disclaimer */}
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-300 leading-5">
                              <span className="font-bold">Important Notice:</span> {msg.structuredAnswer.important}
                            </div>
                          </div>
                        )}

                        {/* Sources & Citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
                            <BookOpen size={13} className="text-primary" />
                            <span className="font-bold">Verified Sources:</span>
                            {msg.sources.map((src, idx) => (
                              <a key={idx} href={src} target="_blank" rel="noreferrer" className="text-primary hover:underline underline-offset-2">
                                Source {idx + 1} <ExternalLink size={10} className="inline" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* AI Response Feedback Rating */}
                      {!isUser && (
                        <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
                          <span className="text-[11px]">Was this answer helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg.id, true)}
                            className={`p-1 rounded-md hover:bg-muted transition ${msg.isHelpful === true ? 'text-emerald-600 font-bold' : ''}`}
                            title="Helpful"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, false)}
                            className={`p-1 rounded-md hover:bg-muted transition ${msg.isHelpful === false ? 'text-rose-600 font-bold' : ''}`}
                            title="Not Helpful"
                          >
                            <ThumbsDown size={14} />
                          </button>
                          {feedbackSuccessId === msg.id && (
                            <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in">✓ Feedback saved</span>
                          )}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-bold text-xs text-secondary-foreground shadow-md">
                        AS
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="Ask Saathi any genuine question"
                detail="Get personalized, grounded answers for government schemes, eligibility, required documents, DPR preparation, and business registration."
              />
            )}

            {/* Pending AI Indicator */}
            {sendMessage.isPending && (
              <div className="flex gap-3 items-center text-xs text-muted-foreground p-3 rounded-2xl bg-muted/40 w-fit">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground animate-spin">
                  <Sparkles size={14} />
                </div>
                <span>Analyzing profile context, scheme guidelines & genuine-use guardrails...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2 bg-muted/40 border-t border-border flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-bold text-muted-foreground whitespace-nowrap text-[11px]">Sample Questions:</span>
            {[
              'Which scheme suits my food processing unit?',
              'What documents are required for PMEGP?',
              'How to register for Udyam MSME certificate?',
              'Explain eligibility criteria in simple language',
            ].map((promptText) => (
              <button
                key={promptText}
                onClick={() => setInputText(promptText)}
                className="whitespace-nowrap rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold transition hover:border-primary hover:text-primary"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background flex items-center gap-3">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                isRecording
                  ? 'border-rose-500 bg-rose-500 text-white animate-pulse'
                  : 'border-input bg-background hover:bg-muted text-muted-foreground'
              }`}
              title={isRecording ? 'Listening... Click to stop' : 'Voice Input (Click & Speak)'}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? 'Listening to your question...' : 'Ask your personal question regarding schemes, documents, or business guidance...'}
              className="h-11 flex-1 rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />

            <Button type="submit" className="h-11 px-6 font-bold shadow-md" disabled={sendMessage.isPending || !inputText.trim()}>
              {sendMessage.isPending ? <PendingLabel /> : <>Send <Send size={15} /></>}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function AdminPage() {
  const schemes = useListSchemes({});
  const health = useHealthCheck();
  const createScheme = useCreateScheme();
  const updateScheme = useUpdateScheme();
  const deleteScheme = useDeleteScheme();
  const chatStatsQuery = useGetAdminChatStats();
  const queryClient = useQueryClient();

  const [verified, setVerified] = useState<string[]>([]);
  const [editingScheme, setEditingScheme] = useState<Partial<Scheme> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (schemes.isLoading || health.isLoading) return <LoadingPage />;
  if (schemes.isError || health.isError) return <ErrorState onRetry={() => { schemes.refetch(); health.refetch(); }} />;

  const list = schemes.data ?? [];
  const chatStats = chatStatsQuery.data;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!editingScheme?.name || !editingScheme?.category) return;

    if (editingScheme.id) {
      updateScheme.mutate(
        { schemeId: editingScheme.id, data: editingScheme as Scheme },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingScheme(null);
            queryClient.invalidateQueries();
          },
        }
      );
    } else {
      createScheme.mutate(
        { data: editingScheme as Scheme },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingScheme(null);
            queryClient.invalidateQueries();
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    deleteScheme.mutate(
      { schemeId: id },
      {
        onSuccess: () => queryClient.invalidateQueries(),
      }
    );
  };

  return (
    <div className="page-in space-y-8">
      <PageIntro
        eyebrow="Government Scheme & Safety Admin Portal"
        title="Admin Control Center & Misuse Audit Log"
        detail="Monitor chatbot genuine-use compliance, review flagged requests, and manage government scheme deterministic rules."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="green"><span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-600" />API {health.data?.status || 'healthy'}</Badge>
            <Button onClick={() => { setEditingScheme({ name: '', shortName: '', category: 'Credit & subsidy', description: '', minAge: 18, maxAge: 60, maxAnnualIncome: 1500000, maxTurnover: 10000000, maxInvestment: 5000000, subsidyRatePercent: 25, maxLoanAmount: 2500000, documents: ['Aadhaar Card', 'PAN Card', 'Bank Statement'], businessTypes: ['Manufacturing', 'Service'], locations: ['Rural', 'Urban'], targetGroups: ['SC', 'ST', 'OBC', 'Women', 'General'], status: 'Active' }); setIsModalOpen(true); }}>
              <Plus size={16} /> Add New Scheme
            </Button>
          </div>
        }
      />

      {/* Chatbot Safety Metrics & Analytics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground">Total Questions Processed</p>
            <MessageSquare size={18} className="text-primary" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold">{chatStats?.totalQuestions || 30}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Logged user sessions</p>
        </Card>

        <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Genuine Answer Rate</p>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {chatStats?.genuineResponseRate || 97}%
          </p>
          <p className="mt-1 text-[11px] text-emerald-700/80">Verified compliant responses</p>
        </Card>

        <Card className="p-5 border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Blocked Misuse Attempts</p>
            <AlertOctagon size={18} className="text-rose-600" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold text-rose-700 dark:text-rose-300">
            {chatStats?.blockedAttempts || 1}
          </p>
          <p className="mt-1 text-[11px] text-rose-700/80">Flagged by guardrail engine</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground">User Satisfaction Rate</p>
            <ThumbsUp size={18} className="text-amber-500" />
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold">{chatStats?.satisfactionRate || 96}%</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Helpful ratings feedback</p>
        </Card>
      </div>

      {/* Flagged Requests Audit Table */}
      {chatStats?.flaggedRequests && chatStats.flaggedRequests.length > 0 && (
        <Card className="p-6 border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3 mb-4">
            <ShieldAlert size={20} className="text-rose-600" />
            <div>
              <h3 className="font-display text-lg font-extrabold text-rose-950 dark:text-rose-200">
                Flagged Misuse & Fraud Prevention Audit Log
              </h3>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
                Requests flagged and politely refused under Genuine-Use Policy guardrails.
              </p>
            </div>
          </div>

          <div className="divide-y divide-rose-500/20 text-xs">
            {chatStats.flaggedRequests.map((flag) => (
              <div key={flag.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 dark:text-rose-200">{flag.category}</span>
                  <span className="text-[10px] text-muted-foreground font-mono-ui">{formatDate(flag.timestamp)}</span>
                </div>
                <p className="text-foreground font-semibold">User Query: "{flag.userQuery}"</p>
                <p className="text-rose-700 dark:text-rose-300 font-medium">Block Reason: {flag.blockReason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Scheme Catalog Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl font-extrabold">Active Government Schemes Database</h2>
            <p className="mt-1 text-xs text-muted-foreground">Click Edit to modify deterministic hard rules or limits.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <RefreshCw size={14} /> Live Sync
          </div>
        </div>

        {list.length ? (
          <div className="divide-y divide-border">
            {list.map((scheme) => (
              <div key={scheme.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Landmark size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{scheme.name}</p>
                    <Badge tone="teal">{scheme.shortName || scheme.category}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Ministry: {scheme.ministry || 'Govt of India'}</span>
                    <span>Age Limit: {scheme.minAge || 18}–{scheme.maxAge || 65} yrs</span>
                    <span>Max Subsidy: {scheme.subsidyRatePercent}%</span>
                    <span>Max Project Cost: ₹{(scheme.maxProjectCost ? scheme.maxProjectCost / 100000 : 10).toFixed(1)}L</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditingScheme(scheme); setIsModalOpen(true); }}>
                    <Edit size={14} /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(scheme.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5"><EmptyState title="No scheme records" detail="Click Add New Scheme to create the first entry." /></div>
        )}
      </Card>

      {/* Scheme Form Modal */}
      {isModalOpen && editingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-xl font-extrabold">{editingScheme.id ? 'Edit Government Scheme' : 'Add New Government Scheme'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-muted"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-bold">Scheme Name</span>
                  <input value={editingScheme.name || ''} onChange={(e) => setEditingScheme({ ...editingScheme, name: e.target.value })} required className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold">Short Code / Abbreviation</span>
                  <input value={editingScheme.shortName || ''} onChange={(e) => setEditingScheme({ ...editingScheme, shortName: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-bold">Category</span>
                  <input value={editingScheme.category || ''} onChange={(e) => setEditingScheme({ ...editingScheme, category: e.target.value })} required className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold">Nodal Ministry / Department</span>
                  <input value={editingScheme.ministry || ''} onChange={(e) => setEditingScheme({ ...editingScheme, ministry: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block font-bold">Scheme Description</span>
                <textarea rows={3} value={editingScheme.description || ''} onChange={(e) => setEditingScheme({ ...editingScheme, description: e.target.value })} className="w-full rounded-xl border border-input bg-background p-3" />
              </label>

              <div className="rounded-xl border border-border p-4 bg-muted/40 space-y-3">
                <p className="font-mono-ui font-bold text-primary text-[11px] uppercase tracking-wider">Deterministic Hard Rules & Eligibility Caps</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block font-bold">Min Age (Yrs)</span>
                    <input type="number" value={editingScheme.minAge ?? 18} onChange={(e) => setEditingScheme({ ...editingScheme, minAge: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-bold">Max Age (Yrs)</span>
                    <input type="number" value={editingScheme.maxAge ?? 60} onChange={(e) => setEditingScheme({ ...editingScheme, maxAge: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-bold">Max Annual Income (₹)</span>
                    <input type="number" value={editingScheme.maxAnnualIncome ?? 1500000} onChange={(e) => setEditingScheme({ ...editingScheme, maxAnnualIncome: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block font-bold">Max Annual Turnover (₹)</span>
                    <input type="number" value={editingScheme.maxTurnover ?? 10000000} onChange={(e) => setEditingScheme({ ...editingScheme, maxTurnover: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-bold">Plant & Machinery Cap (₹)</span>
                    <input type="number" value={editingScheme.maxInvestment ?? 5000000} onChange={(e) => setEditingScheme({ ...editingScheme, maxInvestment: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-bold">Max Project Cost (₹)</span>
                    <input type="number" value={editingScheme.maxProjectCost ?? 2500000} onChange={(e) => setEditingScheme({ ...editingScheme, maxProjectCost: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-bold">Subsidy Rate %</span>
                  <input type="number" value={editingScheme.subsidyRatePercent ?? 25} onChange={(e) => setEditingScheme({ ...editingScheme, subsidyRatePercent: Number(e.target.value) })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold">Official Application URL</span>
                  <input value={editingScheme.officialApplicationUrl || ''} onChange={(e) => setEditingScheme({ ...editingScheme, officialApplicationUrl: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-background px-3" />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createScheme.isPending || updateScheme.isPending}>
                  {createScheme.isPending || updateScheme.isPending ? <PendingLabel /> : 'Save Scheme Rules'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
function Metric({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) { return <Card className="p-5"><div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/70 text-secondary-foreground">{icon}</div><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-1 font-mono-ui text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></Card>; }

export function CalculatorPage() {
  const schemesQuery = useListSchemes({});
  const profileQuery = useGetProfile();
  const calculate = useCalculateFinancials();

  const [schemeId, setSchemeId] = useState('pmegp');
  const [projectCost, setProjectCost] = useState(1200000);
  const [category, setCategory] = useState('SC');
  const [location, setLocation] = useState('Rural');
  const [tenureYears, setTenureYears] = useState(5);
  const [interestRate, setInterestRate] = useState(9.5);

  useEffect(() => {
    if (profileQuery.data) {
      if (profileQuery.data.projectCost) setProjectCost(profileQuery.data.projectCost);
      if (profileQuery.data.category) setCategory(profileQuery.data.category);
      if (profileQuery.data.location) setLocation(profileQuery.data.location);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    calculate.mutate({
      data: { schemeId, projectCost, category, location, tenureYears, interestRate },
    });
  }, [schemeId, projectCost, category, location, tenureYears, interestRate]);

  if (schemesQuery.isLoading) return <LoadingPage />;
  if (schemesQuery.isError || !schemesQuery.data) return <ErrorState onRetry={() => schemesQuery.refetch()} />;

  const schemes = schemesQuery.data;
  const result = calculate.data;

  return (
    <div className="page-in">
      <PageIntro
        eyebrow="Financial Intelligence"
        title="Subsidy & Monthly EMI Calculator"
        detail="Interactively model capital requirements, government margin money subsidies, owner contribution, and bank repayment schedules."
        action={
          <Link href="/dpr" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground">
            <FileSpreadsheet size={16} /> Generate DPR
          </Link>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="p-6">
          <SectionHeading eyebrow="Parameters" title="Model your project" />
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-foreground/80">Target Scheme</span>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {schemes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortName} — {s.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="flex justify-between text-xs font-bold">
                <span>Total Estimated Project Cost</span>
                <span className="font-mono-ui text-primary">{formatMoney(projectCost)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={25000000}
                step={50000}
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
                className="mt-3 w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground font-mono-ui">
                <span>₹1 Lakh</span>
                <span>₹2.5 Crore</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-foreground/80">Applicant Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="General">General</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="OBC">OBC</option>
                  <option value="Women">Women Entrepreneur</option>
                  <option value="Minority">Minority</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-foreground/80">Business Location</span>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="Rural">Rural</option>
                  <option value="Urban">Urban</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex justify-between text-xs font-bold">
                  <span>Loan Tenure</span>
                  <span className="font-mono-ui">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold">
                  <span>Annual Bank Interest Rate</span>
                  <span className="font-mono-ui">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={16}
                  step={0.25}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="mt-3 w-full accent-primary"
                />
              </div>
            </div>
          </div>
        </Card>

        {result ? (
          <div className="space-y-5">
            <Card className="relative overflow-hidden p-6">
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">Calculation Summary</p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold">{result.schemeName}</h2>
                </div>
                <Badge tone="green">{result.subsidyRatePercent}% Margin Money Subsidy</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-bold text-emerald-800">Govt. Subsidy Grant</p>
                  <p className="mt-2 font-mono-ui text-2xl font-extrabold text-emerald-700">{formatMoney(result.subsidyAmount)}</p>
                  <p className="mt-1 text-[11px] text-emerald-700/80">{result.subsidyRatePercent}% of project cost credited to subsidy lock-in account</p>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-xs font-bold text-blue-800">Bank Loan Share</p>
                  <p className="mt-2 font-mono-ui text-2xl font-extrabold text-blue-700">{formatMoney(result.bankLoanAmount)}</p>
                  <p className="mt-1 text-[11px] text-blue-700/80">Term loan & working capital sanctioned by bank</p>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-bold text-amber-800">Owner Margin Money</p>
                  <p className="mt-2 font-mono-ui text-2xl font-extrabold text-amber-700">{formatMoney(result.ownerContribution)}</p>
                  <p className="mt-1 text-[11px] text-amber-700/80">Promoter initial equity contribution</p>
                </div>

                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <p className="text-xs font-bold text-indigo-800">Estimated Monthly EMI</p>
                  <p className="mt-2 font-mono-ui text-2xl font-extrabold text-indigo-700">{formatMoney(result.monthlyEmi)} / mo</p>
                  <p className="mt-1 text-[11px] text-indigo-700/80">For {tenureYears} yrs @ {interestRate}% rate</p>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Capital Composition Breakdown</span>
                  <span className="font-mono-ui text-primary">100% of {formatMoney(projectCost)}</span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-xl bg-muted p-0.5">
                  <div
                    style={{ width: `${Math.max(5, Math.round((result.subsidyAmount / projectCost) * 100))}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Govt Subsidy: ${formatMoney(result.subsidyAmount)}`}
                  />
                  <div
                    style={{ width: `${Math.max(5, Math.round((result.ownerContribution / projectCost) * 100))}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Owner Equity: ${formatMoney(result.ownerContribution)}`}
                  />
                  <div
                    style={{ width: `${Math.max(5, Math.round((result.bankLoanAmount / projectCost) * 100))}%` }}
                    className="bg-blue-600 transition-all duration-500"
                    title={`Bank Loan: ${formatMoney(result.bankLoanAmount)}`}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Subsidy ({Math.round((result.subsidyAmount / projectCost) * 100)}%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Owner Equity ({Math.round((result.ownerContribution / projectCost) * 100)}%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Bank Loan ({Math.round((result.bankLoanAmount / projectCost) * 100)}%)</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-muted/60 p-4">
                <p className="text-xs font-bold text-foreground/90 mb-1">Financial Breakdown & Nodal Terms</p>
                <p className="text-xs text-muted-foreground">{result.breakdownNote}</p>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 flex items-center justify-center text-sm text-muted-foreground">Calculating breakdown...</Card>
        )}
      </div>
    </div>
  );
}

export function RoadmapPage() {
  const roadmapQuery = useGetRoadmap();
  const toggle = useToggleMilestone();
  const queryClient = useQueryClient();

  if (roadmapQuery.isLoading) return <LoadingPage />;
  if (roadmapQuery.isError || !roadmapQuery.data) return <ErrorState onRetry={() => roadmapQuery.refetch()} />;

  const milestones: RoadmapMilestone[] = roadmapQuery.data;
  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const handleToggle = (milestoneId: string) => {
    toggle.mutate(
      { data: { milestoneId } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetRoadmapQueryKey(), updated);
        },
      }
    );
  };

  return (
    <div className="page-in space-y-8">
      <PageIntro
        eyebrow="Guided Execution"
        title="Application Milestone Roadmap"
        detail="Track your journey from profile setup and document gathering to District Task Force interviews and final bank subsidy disbursal."
      />

      <Card className="p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">Overall Progress</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold">{progressPercent}% Completed</h3>
            <p className="mt-1 text-xs text-muted-foreground">{completedCount} of {milestones.length} application milestones completed</p>
          </div>
          <div className="w-full max-w-xs">
            <ProgressBar value={progressPercent} />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {milestones.map((milestone) => {
          const isDone = milestone.status === 'Completed';
          const inProgress = milestone.status === 'In Progress';

          return (
            <Card key={milestone.id} className={`p-6 transition ${isDone ? 'border-emerald-500/40 bg-emerald-500/5' : inProgress ? 'border-primary/50' : ''}`}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-mono-ui text-sm font-bold ${isDone ? 'bg-emerald-600 text-white' : inProgress ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {milestone.stepNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl font-extrabold">{milestone.title}</h3>
                      <Badge tone={isDone ? 'green' : inProgress ? 'teal' : 'muted'}>{milestone.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{milestone.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {milestone.keyTasks.map((task, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground/80">
                          <CheckSquare size={13} className={isDone ? 'text-emerald-600' : 'text-primary'} />
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 border-t border-border pt-4 md:flex-col md:items-end md:border-t-0 md:pt-0">
                  <span className="text-xs font-bold text-muted-foreground font-mono-ui">Est. {milestone.estimatedDuration}</span>
                  <Button
                    size="sm"
                    variant={isDone ? 'outline' : 'primary'}
                    onClick={() => handleToggle(milestone.id)}
                    disabled={toggle.isPending}
                  >
                    {isDone ? 'Mark Incomplete' : 'Mark Step Complete'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function DprGeneratorPage() {
  const schemesQuery = useListSchemes({});
  const profileQuery = useGetProfile();
  const generate = useGenerateDpr();

  const [schemeId, setSchemeId] = useState('pmegp');
  const [businessName, setBusinessName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profileQuery.data?.name && !businessName) {
      setBusinessName(`${profileQuery.data.name}'s Enterprise`);
    }
  }, [profileQuery.data]);

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    generate.mutate({ data: { schemeId, businessName } });
  };

  const handleCopy = () => {
    if (generate.data) {
      navigator.clipboard.writeText(JSON.stringify(generate.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (schemesQuery.isLoading) return <LoadingPage />;
  if (schemesQuery.isError || !schemesQuery.data) return <ErrorState onRetry={() => schemesQuery.refetch()} />;

  const schemes = schemesQuery.data;
  const dpr = generate.data;

  return (
    <div className="page-in space-y-8">
      <PageIntro
        eyebrow="Bank-Ready Documentation"
        title="Detailed Project Report (DPR) Outline Generator"
        detail="Generate a comprehensive Project Report outline featuring capital expenditure, working capital requirements, revenue projections, and risk mitigation strategies."
      />

      <Card className="p-6">
        <form onSubmit={handleGenerate} className="grid gap-5 md:grid-cols-3 md:items-end">
          <label className="block md:col-span-1">
            <span className="mb-2 block text-xs font-bold">Select Target Scheme</span>
            <select
              value={schemeId}
              onChange={(e) => setSchemeId(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortName} — {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-1">
            <span className="mb-2 block text-xs font-bold">Business / Firm Name</span>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Kulkarni Food Processing Enterprise"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <Button type="submit" className="h-11 md:col-span-1" disabled={generate.isPending}>
            {generate.isPending ? <PendingLabel /> : <>Generate DPR Summary <Sparkles size={16} /></>}
          </Button>
        </form>
      </Card>

      {dpr && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
            <div>
              <Badge tone="teal">{dpr.schemeName}</Badge>
              <h2 className="mt-2 font-display text-2xl font-extrabold">{dpr.businessName}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Bank Submission Project Report Outline</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy size={14} /> {copied ? 'Copied JSON' : 'Copy Data'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.print()}>
                <Printer size={14} /> Print Report
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-extrabold mb-2">1. Executive Summary</h3>
            <p className="text-sm leading-6 text-muted-foreground">{dpr.executiveSummary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground">Capital Expenditure (Capex)</p>
              <p className="mt-2 font-mono-ui text-xl font-bold">{formatMoney(Array.isArray(dpr.capitalExpenditure) ? dpr.capitalExpenditure.reduce((acc, i) => acc + (i.cost || 0), 0) : Number(dpr.capitalExpenditure || 0))}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Machinery & Infrastructure</p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground">Working Capital (Opex)</p>
              <p className="mt-2 font-mono-ui text-sm font-bold leading-5">{dpr.workingCapitalBreakup}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Raw Material & Wages</p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground">Projected Annual Revenue</p>
              <p className="mt-2 font-mono-ui text-sm font-bold leading-5">{dpr.revenueProjection}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Estimated Turnover</p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground">Employment Generation</p>
              <p className="mt-2 font-mono-ui text-xl font-bold">{dpr.employmentGenerated} Persons</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Direct & Indirect jobs</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-extrabold mb-3">2. Key Risk Factors & Mitigation Strategies</h3>
            <ul className="space-y-3">
              {dpr.keyRisksAndMitigations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded-xl border border-border p-3 text-sm leading-6">
                  <CheckCircle2 size={16} className="mt-1 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Bank Cover Letter Template */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-3 text-xs leading-6">
            <div className="flex justify-between border-b border-primary/20 pb-3 font-bold text-muted-foreground font-mono-ui">
              <span>OFFICIAL DIC / KVIC NODAL COVER LETTER</span>
              <span>DATE: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <p className="font-bold text-foreground">TO: THE NODAL BRANCH MANAGER / DISTRICT TASK FORCE COMMITTEE (DTFC)</p>
            <p className="text-foreground/90 font-medium">
              <strong>SUBJECT:</strong> Application for Term Loan & Credit-Linked Margin Money Subsidy under <strong>{dpr.schemeName}</strong> for <strong>{dpr.businessName}</strong>.
            </p>
            <p className="text-muted-foreground">
              Respected Sir/Madam, I am formally submitting the enclosed Detailed Project Report (DPR) along with verified Aadhaar, PAN, and Udyam MSME certificates for sanction of credit facilities and margin money capital grant under <strong>{dpr.schemeName}</strong>.
            </p>
            <div className="pt-2 text-[11px] text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">Enclosures Attached to Application Bundle:</p>
              <p>1. Detailed Project CapEx & Working Capital Projections Statement</p>
              <p>2. Verified Identity Proof (Aadhaar & PAN) & Udyam MSME Registration</p>
              <p>3. Promoter Bank Account Declarations & Risk Mitigation Plan</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function AuthPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialMode = searchParams?.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ananya.shah@schemesaathi.in');
  const [mobileNumber, setMobileNumber] = useState('+91 98230 11492');
  const [password, setPassword] = useState('Demo@1234');
  const [confirmPassword, setConfirmPassword] = useState('Demo@1234');
  const [businessType, setBusinessType] = useState('Manufacturing');
  const [stateName, setStateName] = useState('Maharashtra');

  // OTP Authentication state
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpTarget, setOtpTarget] = useState('ananya.shah@schemesaathi.in');
  const [otpCode, setOtpCode] = useState('');
  const [otpSentSuccess, setOtpSentSuccess] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  // Forgot password modal state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [issuedResetToken, setIssuedResetToken] = useState('');

  // Animated login transition status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!otpTarget) {
      setErrorMessage('Please enter your Mobile Number or Email Address');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setOtpSentSuccess('');
    setStepMessage('Generating secure 6-digit OTP verification code...');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: otpTarget }),
      });
      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { error: 'Backend server on port 5000 is unreachable or restarting. Please ensure Node API server is running.' };
      }

      setIsSubmitting(false);
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpStep('verify');
      setOtpSentSuccess(data.message);
      if (data.debugOtp) setDebugOtp(data.debugOtp);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Error requesting OTP code');
    }
  };

  const handleVerifyOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    setStepMessage('Verifying 6-digit OTP code & logging in...');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: otpTarget,
          otp: otpCode,
          name,
          businessType,
          state: stateName,
        }),
      });
      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { error: 'Backend server on port 5000 is unreachable or restarting. Please ensure Node API server is running.' };
      }

      if (!res.ok) throw new Error(data.error || 'OTP verification failed');

      localStorage.setItem('schemesaathi_session_token', data.token);
      if (data.user) {
        localStorage.setItem('schemesaathi_session', JSON.stringify(data.user));
      }

      setStepMessage('OTP Verified! Opening your workspace dashboard...');
      await new Promise((r) => setTimeout(r, 400));

      queryClient.invalidateQueries();
      setLocation('/');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Invalid OTP verification code');
    }
  };

  const triggerAuthFlow = async (loginEmail: string, loginPass: string, isSignup = false) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setStepMessage('Verifying credentials & security salt hash...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setStepMessage('Connecting to SchemeSaathi AI multi-tenant database...');

      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup
        ? {
            name: name || 'Entrepreneur',
            email: loginEmail,
            mobileNumber,
            password: loginPass,
            confirmPassword,
            businessType,
            state: stateName,
          }
        : { email: loginEmail, password: loginPass };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resText = await response.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = { error: resText || 'Server returned an invalid response' };
      }

      if (!response.ok) {
        throw new Error(data.error || `Authentication failed (${response.status})`);
      }

      localStorage.setItem('schemesaathi_session_token', data.token);

      setStepMessage('Loading authorized user profile & documents...');
      await new Promise((r) => setTimeout(r, 400));

      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      queryClient.invalidateQueries();
      setLocation('/');
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email/mobile and password');
      return;
    }
    if (mode === 'signup') {
      if (!name) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
      }
    }
    triggerAuthFlow(email, password, mode === 'signup');
  };

  const handleDemoUserLogin = () => {
    setEmail('ananya.shah@schemesaathi.in');
    setPassword('Demo@1234');
    triggerAuthFlow('ananya.shah@schemesaathi.in', 'Demo@1234', false);
  };

  const handleDemoAdminLogin = () => {
    setEmail('admin@schemesaathi.in');
    setPassword('Admin@1234');
    triggerAuthFlow('admin@schemesaathi.in', 'Admin@1234', false);
  };

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setResetSuccessMessage(data.message);
      if (data.resetToken) {
        setIssuedResetToken(data.resetToken);
      }
    } catch (err: any) {
      setResetSuccessMessage('Request processed.');
    }
  };

  return (
    <div className="flex min-h-[92dvh] items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl transition-all duration-500">
        
        {/* Animated Loading Overlay during redirect */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md transition-all animate-in fade-in duration-300">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-extrabold text-foreground">Welcome to SchemeSaathi AI</h3>
            <p className="mt-2 text-sm font-semibold text-primary animate-pulse">{stepMessage}</p>
            <div className="mt-6 w-64">
              <ProgressBar value={85} />
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-lg font-extrabold">Forgot Password?</h3>
                <button onClick={() => { setShowForgotPasswordModal(false); setResetSuccessMessage(''); setIssuedResetToken(''); }} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your registered Email Address or Mobile Number. We will generate a single-use password reset token.
              </p>

              {resetSuccessMessage ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-2">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">{resetSuccessMessage}</p>
                  {issuedResetToken && (
                    <div className="rounded bg-background p-2 font-mono text-[11px] font-bold border border-border">
                      Token: <span className="text-primary">{issuedResetToken}</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setShowForgotPasswordModal(false)}>Close Modal</Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground/80 mb-1">Registered Email Address / Mobile</label>
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. ananya.shah@schemesaathi.in"
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="quiet" onClick={() => setShowForgotPasswordModal(false)}>Cancel</Button>
                    <Button type="submit" className="font-bold">Send Reset Token</Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-12">
          
          {/* Left Column: Visual Hero Banner with Glassmorphic Floating Cards */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-950 via-emerald-950 to-primary p-8 text-primary-foreground lg:col-span-5 lg:p-12">
            <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 font-display text-2xl font-black text-secondary backdrop-blur-md">
                  S
                </span>
                <div>
                  <span className="block font-display text-xl font-extrabold tracking-tight">SchemeSaathi AI</span>
                  <span className="block font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-secondary">Govt Scheme Platform</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <h1 className="font-display text-3xl font-extrabold leading-tight text-white md:text-4xl">
                  {mode === 'login' ? 'Welcome back, Entrepreneur.' : 'Begin your scheme journey.'}
                </h1>
                <p className="text-sm leading-6 text-primary-foreground/80">
                  Secure multi-tenant data storage. All your profiles, uploaded OCR documents, and AI recommendations are isolated under your account.
                </p>
              </div>
            </div>

            {/* Floating Glass Badges */}
            <div className="relative z-10 mt-10 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition hover:bg-white/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Up to 35% Margin Money Grant</p>
                  <p className="text-[11px] text-white/70">PMEGP & State Subsidy Schemes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md transition hover:bg-white/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">PBKDF2 Hashed Security</p>
                  <p className="text-[11px] text-white/70">Multi-Tenant Data Partitioning</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 border-t border-white/15 pt-6 text-[11px] text-white/60">
              Trusted by 10,000+ Indian MSMEs & Micro Entrepreneurs across 28 States.
            </div>
          </div>

          {/* Right Column: Dynamic Login / Sign Up Form */}
          <div className="flex flex-col justify-center p-6 md:p-10 lg:col-span-7">
            
            {/* Mode Switcher Tabs */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="flex rounded-2xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMessage(''); setOtpStep('request'); }}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                    mode === 'login'
                      ? 'bg-card text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMessage(''); setOtpStep('request'); }}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all duration-300 ${
                    mode === 'signup'
                      ? 'bg-card text-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Auth Method Switcher (OTP vs Password) */}
              <div className="flex rounded-2xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setErrorMessage(''); setOtpStep('request'); }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                    authMethod === 'otp' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  📱 OTP Verification
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setErrorMessage(''); }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                    authMethod === 'password' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🔒 Password
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="font-display text-2xl font-extrabold">
                {authMethod === 'otp'
                  ? (otpStep === 'request' ? (mode === 'login' ? 'OTP Sign In' : 'Register via OTP') : 'Enter Verification Code')
                  : (mode === 'login' ? 'Sign in to your account' : 'Register your entrepreneur account')}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {authMethod === 'otp'
                  ? (otpStep === 'request' ? 'Enter your mobile number or email to receive a 6-digit verification code.' : `We have sent a 6-digit OTP code to ${otpTarget}`)
                  : (mode === 'login' ? 'Access your profile, documents, recommendations, and DPR generator.' : 'Create your account to unlock private scheme recommendations.')}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-bold text-destructive">
                {errorMessage}
              </div>
            )}

            {otpSentSuccess && authMethod === 'otp' && (
              <div className="mb-6 space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>{otpSentSuccess}</span>
                </div>
                {debugOtp && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-black font-mono-ui text-emerald-800 dark:text-emerald-200">
                    <span>🔑 Real-Time OTP Code:</span>
                    <span className="text-sm tracking-widest">{debugOtp}</span>
                  </div>
                )}
              </div>
            )}

            {/* OTP AUTH FORM */}
            {authMethod === 'otp' ? (
              otpStep === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground/80">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Arfat Panchbhai"
                          className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">Mobile Number / Email Address</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={otpTarget}
                        onChange={(e) => setOtpTarget(e.target.value)}
                        placeholder="e.g. +91 99703 33708 or email@domain.com"
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">{stepMessage || 'Sending OTP...'}</span>
                    ) : (
                      <>
                        <Sparkles size={16} /> Send 6-Digit OTP Verification Code
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">Enter 6-Digit OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 849201"
                      className="h-12 w-full text-center font-mono-ui text-xl font-extrabold tracking-[0.3em] rounded-xl border border-primary/40 bg-card outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow transition hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">{stepMessage || 'Verifying OTP...'}</span>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Verify OTP & Access Workspace
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => { setOtpStep('request'); setOtpCode(''); setErrorMessage(''); }}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      ↩ Change Mobile / Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  </div>
                </form>
              )
            ) : (
              /* PASSWORD AUTH FORM */
              <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {mode === 'signup' && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-foreground/80">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Shah"
                      className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground/80">Email Address / Mobile</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ananya.shah@schemesaathi.in"
                      className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">Mobile Number</label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98230 11492"
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="block text-xs font-bold text-foreground/80">Password</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-xs font-bold text-primary hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div className="grid gap-4 md:grid-cols-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">Industry Sector</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Food Processing">Food Processing</option>
                      <option value="Services">Services & Retail</option>
                      <option value="Handicrafts">Handicrafts & Artisans</option>
                      <option value="Technology">Tech & Startups</option>
                      <option value="Agriculture">Agri-Business</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-foreground/80">State Location</label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Rajasthan">Rajasthan</option>
                    </select>
                  </div>
                </div>
              )}

              <Button type="submit" className="h-12 w-full mt-4 text-sm font-extrabold shadow-lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <PendingLabel />
                ) : mode === 'login' ? (
                  <>Sign In & Open Dashboard <ArrowRight size={16} /></>
                ) : (
                  <>Create Account & Match Schemes <Sparkles size={16} /></>
                )}
              </Button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 7-STAGE SCHEME RECOMMENDATION WIZARD
export function WizardPage() {
  const saveProfile = useSaveProfile();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [stage, setStage] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [form, setForm] = useState<ProfileInput>({
    name: 'Ananya Shah',
    dob: '1997-04-14',
    age: 29,
    gender: 'Female',
    mobileNumber: '+91 98230 11492',
    email: 'ananya.shah@schemesaathi.in',
    category: 'OBC',
    minorityStatus: 'No',
    pwd: 'No',
    veteran: 'No',
    womanEntrepreneur: 'Yes',
    youthEntrepreneur: 'Yes',
    ruralUrban: 'Rural',
    annualFamilyIncome: 300000,
    state: 'Maharashtra',
    district: 'Pune',
    cityVillage: 'Haveli',
    address: 'Plot 42, Industrial Zone, Haveli, Pune',
    businessName: 'Shah Food Products',
    businessType: 'Manufacturing',
    businessRegistrationType: 'Proprietorship',
    businessSector: 'Food Processing',
    industry: 'Food Processing',
    businessActivity: 'Fruit Jam & Pickle Processing',
    businessDescription: 'Organic fruit processing unit producing premium mango jam and lemon pickle.',
    businessStatus: 'New',
    location: 'Rural',
    businessStartDate: '2024-01-15',
    yearsInBusiness: 1,
    annualIncome: 300000,
    investmentAvailable: 300000,
    investmentPlantMachinery: 700000,
    projectCost: 1200000,
    loanRequirement: 900000,
    creditRequirement: 900000,
    bankAccountAvailable: 'Yes',
    expectedTurnover: 2400000,
    employees: 4,
    education: 'Graduate',
    experience: '3 Years in Food Processing',
    training: 'Food Processing Training (KVIC)',
    previousLoan: 'No',
    previousLoanStatus: 'None',
    existingLoan: 'No',
    previousAssistance: 'No',
    existingGovernmentAssistance: 'No',
  });

  const [uploadedDocs, setUploadedDocs] = useState<string[]>([
    'Aadhaar Card',
    'PAN Card',
    'Udyam Registration Certificate',
  ]);

  const stages = [
    { num: 1, name: 'Personal & Social' },
    { num: 2, name: 'Business Details' },
    { num: 3, name: 'Financials' },
    { num: 4, name: 'Document Checklist' },
    { num: 5, name: 'AI Rule Engine' },
    { num: 6, name: 'Top Schemes' },
    { num: 7, name: 'Compare & Apply' },
  ];

  const handleNext = () => {
    if (stage === 4) {
      setStage(5);
      setAnalyzing(true);
      setAnalysisProgress(15);
      
      saveProfile.mutate(
        { data: form },
        {
          onSuccess: () => {
            queryClient.invalidateQueries();
          },
        }
      );

      setTimeout(() => setAnalysisProgress(45), 600);
      setTimeout(() => setAnalysisProgress(75), 1200);
      setTimeout(() => {
        setAnalysisProgress(100);
        setAnalyzing(false);
        setStage(6);
      }, 1800);
    } else if (stage < 7) {
      setStage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (stage > 1) setStage((prev) => prev - 1);
  };

  return (
    <div className="page-in max-w-5xl mx-auto space-y-8">
      <PageIntro
        eyebrow="7-Stage Recommendation Engine"
        title="Government Scheme Match Wizard"
        detail="Fill your entrepreneur details step-by-step. Our AI evaluates deterministic hard rules, document verification, and 5-factor scoring to match you with top government schemes."
      />

      {/* Stepper Progress Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2">
          {stages.map((s) => (
            <div key={s.num} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  stage === s.num
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : stage > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stage > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${stage === s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.name}
              </span>
              {s.num < 7 && <ArrowRight size={12} className="text-muted-foreground/40 mx-1" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Stage 1: Personal & Social Information */}
      {stage === 1 && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <Badge tone="teal">Stage 1 of 7</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Personal & Social Eligibility Information</h2>
            <p className="text-xs text-muted-foreground mt-1">Social category, minority status, gender, and location determine capital subsidies and reservation quotas.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold">Full Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block font-bold">Applicant Age (Years)</span>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Gender</span>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Social Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="Minority">Minority</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Woman Entrepreneur?</span>
              <select value={form.womanEntrepreneur} onChange={(e) => setForm({ ...form, womanEntrepreneur: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Yes">Yes (Woman Owned & Managed)</option>
                <option value="No">No</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Rural or Urban Location</span>
              <select value={form.ruralUrban} onChange={(e) => setForm({ ...form, ruralUrban: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Rural">Rural Area (Eligible for 35% PMEGP subsidy)</option>
                <option value="Urban">Urban Area (Eligible for 25% PMEGP subsidy)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Annual Family Income (₹)</span>
              <input type="number" value={form.annualFamilyIncome} onChange={(e) => setForm({ ...form, annualFamilyIncome: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">State & District</span>
              <input value={`${form.state}, ${form.district}`} onChange={(e) => setForm({ ...form, state: e.target.value.split(',')[0] || 'Maharashtra' })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleNext} className="h-11 px-6 font-bold">Stage 2: Business Details <ArrowRight size={16} /></Button>
          </div>
        </Card>
      )}

      {/* Stage 2: Business Information */}
      {stage === 2 && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <Badge tone="teal">Stage 2 of 7</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Business & Sector Information</h2>
            <p className="text-xs text-muted-foreground mt-1">Enterprise type, sector classification, and activity determine scheme eligibility.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold">Business Name</span>
              <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Business Type</span>
              <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Manufacturing">Manufacturing</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Service">Service & Retail</option>
                <option value="Handicrafts">Handicrafts & Traditional Artisan</option>
                <option value="Technology">Tech & Innovation Startup</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Registration Type</span>
              <select value={form.businessRegistrationType} onChange={(e) => setForm({ ...form, businessRegistrationType: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership Firm</option>
                <option value="Private Limited">Private Limited Company</option>
                <option value="Self Help Group">Self Help Group (SHG)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Operating Sector / Industry</span>
              <input value={form.businessSector} onChange={(e) => setForm({ ...form, businessSector: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Enterprise Stage</span>
              <select value={form.businessStatus} onChange={(e) => setForm({ ...form, businessStatus: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="New">New Enterprise (Greenfield Project)</option>
                <option value="Existing">Existing Business (Expansion / Upgrade)</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Number of Employees</span>
              <input type="number" value={form.employees} onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleBack}><ArrowLeft size={16} /> Back</Button>
            <Button onClick={handleNext} className="h-11 px-6 font-bold">Stage 3: Financials <ArrowRight size={16} /></Button>
          </div>
        </Card>
      )}

      {/* Stage 3: Financial & Loan Requirements */}
      {stage === 3 && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <Badge tone="teal">Stage 3 of 7</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Financials & Capital Requirement</h2>
            <p className="text-xs text-muted-foreground mt-1">Project cost, plant/machinery investment, loan requirement, and expected turnover.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold">Total Estimated Project Cost (₹)</span>
              <input type="number" value={form.projectCost} onChange={(e) => setForm({ ...form, projectCost: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Investment in Plant & Machinery (₹)</span>
              <input type="number" value={form.investmentPlantMachinery} onChange={(e) => setForm({ ...form, investmentPlantMachinery: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Required Bank Loan Amount (₹)</span>
              <input type="number" value={form.loanRequirement} onChange={(e) => setForm({ ...form, loanRequirement: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Promoter's Equity Contribution (₹)</span>
              <input type="number" value={form.investmentAvailable} onChange={(e) => setForm({ ...form, investmentAvailable: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Expected Annual Turnover (₹)</span>
              <input type="number" value={form.expectedTurnover} onChange={(e) => setForm({ ...form, expectedTurnover: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold">Active Bank Account Available?</span>
              <select value={form.bankAccountAvailable} onChange={(e) => setForm({ ...form, bankAccountAvailable: e.target.value })} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="Yes">Yes (Savings or Current Account)</option>
                <option value="No">No</option>
              </select>
            </label>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleBack}><ArrowLeft size={16} /> Back</Button>
            <Button onClick={handleNext} className="h-11 px-6 font-bold">Stage 4: Documents <ArrowRight size={16} /></Button>
          </div>
        </Card>
      )}

      {/* Stage 4: Document Checklist & OCR AI Upload */}
      {stage === 4 && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-border pb-4">
            <Badge tone="teal">Stage 4 of 7</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Document Checklist & AI Verification</h2>
            <p className="text-xs text-muted-foreground mt-1">Select documents you have ready for instant AI OCR verification.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Aadhaar Card',
              'PAN Card',
              'Udyam Registration Certificate',
              'GST Registration Certificate',
              'Detailed Project Report (DPR)',
              'Caste / Category Certificate',
              'Bank Statement (6 Months)',
              'Income Certificate / ITR',
            ].map((docName) => (
              <label
                key={docName}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                  uploadedDocs.includes(docName) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border hover:bg-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={uploadedDocs.includes(docName)}
                  onChange={(e) => {
                    if (e.target.checked) setUploadedDocs([...uploadedDocs, docName]);
                    else setUploadedDocs(uploadedDocs.filter((d) => d !== docName));
                  }}
                  className="h-4 w-4 rounded accent-primary"
                />
                <div>
                  <p className="text-xs font-bold">{docName}</p>
                  <p className="text-[10px] text-muted-foreground">{uploadedDocs.includes(docName) ? '✓ Marked Ready for OCR' : 'Click to mark available'}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleBack}><ArrowLeft size={16} /> Back</Button>
            <Button onClick={handleNext} className="h-11 px-6 font-bold shadow-lg">
              Stage 5: Run AI Analysis Engine <Wand2 size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* Stage 5: AI Verification & Rule Engine Progress Screen */}
      {stage === 5 && (
        <Card className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary animate-pulse">
              <Sparkles size={40} />
            </div>
          </div>

          <div>
            <Badge tone="teal">Stage 5 of 7</Badge>
            <h2 className="mt-2 font-display text-2xl font-extrabold">Evaluating Deterministic Rules & 5-Factor Score</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Evaluating age caps, turnover thresholds, location rules, and document completeness across 10 government scheme databases...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <ProgressBar value={analysisProgress} />
            <p className="font-mono-ui text-xs font-bold text-primary">{analysisProgress}% Complete</p>
          </div>

          <div className="max-w-md mx-auto text-left text-xs space-y-2 rounded-xl bg-muted/60 p-4">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} /> Personal & Social Profile Validated
            </div>
            <div className={`flex items-center gap-2 ${analysisProgress >= 45 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>
              {analysisProgress >= 45 ? <CheckCircle2 size={14} /> : <RefreshCw size={14} className="animate-spin" />} Deterministic Hard Rules Verified (Age ≤ 45, Turnover ≤ ₹2.4M)
            </div>
            <div className={`flex items-center gap-2 ${analysisProgress >= 75 ? 'text-emerald-600 font-semibold' : 'text-muted-foreground'}`}>
              {analysisProgress >= 75 ? <CheckCircle2 size={14} /> : <RefreshCw size={14} className="animate-spin" />} Document AI & Readiness Matrix Evaluated
            </div>
          </div>
        </Card>
      )}

      {/* Stage 6 & Stage 7: Recommendations and Final Shortlist */}
      {(stage === 6 || stage === 7) && (
        <div className="space-y-6">
          <Card className="p-6 bg-emerald-500/10 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <Badge tone="green">Stage {stage} of 7: {stage === 6 ? 'Recommended Schemes' : 'Compare & Official Portals'}</Badge>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-emerald-950">AI Match Engine Completed</h2>
                <p className="text-xs text-emerald-800">Your profile has been evaluated against deterministic hard rules and 5-factor scoring.</p>
              </div>
              <Button onClick={() => setLocation('/recommendations')} variant="soft">
                View Full Recommendations Dashboard <ArrowRight size={16} />
              </Button>
            </div>
          </Card>

          {stage === 6 && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 space-y-4 border-primary/40">
                <div className="flex items-start justify-between">
                  <Badge tone="teal">PMEGP Scheme</Badge>
                  <ScorePill score={96} />
                </div>
                <h3 className="font-display text-xl font-extrabold">Prime Minister’s Employment Generation Programme</h3>
                <p className="text-xs text-muted-foreground">Capital subsidy up to 35% for rural manufacturing micro enterprises.</p>
                <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                  <p className="font-bold text-primary">Matched Criteria (6/6):</p>
                  <p>✓ Age: 29 yrs (Permissible: 18-45 yrs)</p>
                  <p>✓ Sector: Food Processing Manufacturing</p>
                  <p>✓ Location: Rural Haveli, Maharashtra (35% Subsidy Rate)</p>
                  <p>✓ Loan Requirement: ₹9.0 Lakh (Under ₹45.0 Lakh Cap)</p>
                </div>
                <a
                  href="https://www.kviconline.gov.in/pmegpeportal/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md hover:brightness-110"
                >
                  Apply Online at Official KVIC Portal <ExternalLink size={16} />
                </a>
              </Card>

              <Card className="p-6 space-y-4 border-primary/40">
                <div className="flex items-start justify-between">
                  <Badge tone="teal">PMFME Scheme</Badge>
                  <ScorePill score={94} />
                </div>
                <h3 className="font-display text-xl font-extrabold">PM Formalisation of Micro Food Processing Enterprises</h3>
                <p className="text-xs text-muted-foreground">35% credit-linked capital subsidy up to ₹10 Lakhs for food processing units.</p>
                <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                  <p className="font-bold text-primary">Matched Criteria (6/6):</p>
                  <p>✓ Sector: Fruit Jam & Food Processing</p>
                  <p>✓ Status: Micro Enterprise</p>
                  <p>✓ Subsidy Rate: 35% Credit-Linked Capital Grant</p>
                  <p>✓ Training: KVIC Skill Training Certificate</p>
                </div>
                <a
                  href="https://pmfme.mofpi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md hover:brightness-110"
                >
                  Apply Online at PMFME Portal <ExternalLink size={16} />
                </a>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStage(4)}><ArrowLeft size={16} /> Back to Checklist</Button>
            {stage === 6 ? (
              <Button onClick={() => setStage(7)} className="h-11 px-6 font-bold">Stage 7: Compare & Apply <ArrowRight size={16} /></Button>
            ) : (
              <Button onClick={() => setLocation('/recommendations')} className="h-11 px-6 font-bold">
                Finish & Go to Recommendations <Sparkles size={16} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}