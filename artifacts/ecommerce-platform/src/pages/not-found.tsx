import { Link } from 'wouter';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center py-20">
      <div className="relative max-w-xl text-center" data-testid="status-not-found">
        <Compass className="mx-auto mb-8 h-10 w-10 text-accent" strokeWidth={1.2} />
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">404 / Off the map</p>
        <h1 className="mt-5 font-display text-7xl leading-[.82] md:text-9xl">Nothing<br /><em>to see here.</em></h1>
        <p className="mx-auto mt-7 max-w-xs text-sm leading-6 text-muted-foreground">This page isn't part of our collection. Let's get you back to something good.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm text-primary-foreground" data-testid="link-not-found-home"><ArrowLeft className="h-4 w-4" /> Return home</Link>
      </div>
    </div>
  );
}
