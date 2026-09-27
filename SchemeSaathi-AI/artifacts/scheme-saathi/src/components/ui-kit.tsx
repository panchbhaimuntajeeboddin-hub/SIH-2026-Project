import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowUpRight, Check, CircleAlert, LoaderCircle } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'quiet' | 'outline' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_8px_20px_hsl(var(--primary)/.16)]',
    soft: 'bg-secondary text-secondary-foreground hover:brightness-105',
    quiet: 'bg-transparent text-foreground hover:bg-muted',
    outline: 'border border-border bg-card text-foreground hover:border-primary hover:text-primary',
    danger: 'bg-destructive text-destructive-foreground hover:brightness-110',
  };
  const sizes = { sm: 'h-9 px-3 text-xs', md: 'h-11 px-4 text-sm', lg: 'h-13 px-5 text-sm' };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props}>{children}</button>;
}

export function Badge({ children, tone = 'teal' }: { children: ReactNode; tone?: 'teal' | 'yellow' | 'coral' | 'muted' | 'green' }) {
  const tones = {
    teal: 'bg-primary/10 text-primary',
    yellow: 'bg-secondary/35 text-foreground',
    coral: 'bg-accent/15 text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
    green: 'bg-emerald-100 text-emerald-800',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = '', ...props }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-card-border bg-card shadow-[0_10px_30px_hsl(190_30%_20%/.035)] ${className}`} {...props}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-4">
    <div><p className="mb-1 font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-primary">{eyebrow}</p><h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>{detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}</div>
    {action}
  </div>;
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} aria-label="Loading" data-testid="loading-skeleton" />;
}

export function LoadingPage() {
  return <div className="space-y-6 page-in"><SkeletonBlock className="h-8 w-52" /><SkeletonBlock className="h-28 w-full" /><div className="grid gap-4 md:grid-cols-3"><SkeletonBlock className="h-32" /><SkeletonBlock className="h-32" /><SkeletonBlock className="h-32" /></div><SkeletonBlock className="h-72 w-full" /></div>;
}

export function ErrorState({ onRetry, message = 'We could not reach your scheme workspace.' }: { onRetry?: () => void; message?: string }) {
  return <Card className="flex flex-col items-center justify-center px-6 py-14 text-center"><CircleAlert className="mb-4 text-accent" size={28} /><h3 className="font-display text-lg font-bold">A small pause in the journey</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>{onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="mt-5" data-testid="button-retry">Try again</Button>}</Card>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return <Card className="soft-grid flex flex-col items-center justify-center px-6 py-14 text-center"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-xl font-bold text-secondary-foreground"><Check size={22} /></div><h3 className="font-display text-xl font-extrabold">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{detail}</p>{action && <div className="mt-5">{action}</div>}</Card>;
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`h-2 overflow-hidden rounded-full bg-muted ${className}`}><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

export function ScorePill({ score }: { score: number }) {
  return <div className="flex items-center gap-2"><div className="relative flex h-12 w-12 items-center justify-center rounded-full border-[5px] border-secondary bg-secondary/20 font-mono-ui text-xs font-bold text-foreground">{Math.round(score)}%</div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">match</p><p className="text-xs font-semibold text-primary">Strong fit</p></div></div>;
}

export function LinkArrow() { return <ArrowUpRight size={16} strokeWidth={2.3} />; }
export function PendingLabel() { return <span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle size={14} className="animate-spin" />Working on it</span>; }