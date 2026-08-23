import { useState } from 'react';
import type { FormEvent, PropsWithChildren } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useHealthCheck } from '@workspace/api-client-react';
import { useCart } from '@/hooks/use-cart';

export function StoreShell({ children }: PropsWithChildren) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { itemCount } = useCart();
  const healthQuery = useHealthCheck();
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocation(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
    setMenuOpen(false);
  };

  return (
    <div className="grain min-h-[100dvh] bg-background">
      <div className="bg-primary px-4 py-2 text-center font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary-foreground">
        Complimentary shipping on orders over $75
      </div>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="page-shell flex h-[72px] items-center justify-between gap-5">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" data-testid="link-home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary transition-transform duration-300 group-hover:rotate-12">
              <span className="h-3 w-3 rounded-full border-2 border-primary" />
            </span>
            <span className="font-display text-2xl leading-none tracking-tight">Northstar</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <Link href="/shop" className={`font-mono-ui text-[11px] uppercase tracking-[0.14em] transition-colors hover:text-accent ${location === '/shop' ? 'text-accent' : 'text-foreground/75'}`} data-testid="link-shop">Shop</Link>
            <Link href="/shop?featured=true" className="font-mono-ui text-[11px] uppercase tracking-[0.14em] text-foreground/75 transition-colors hover:text-accent" data-testid="link-featured">The edit</Link>
            <Link href="/shop?category=Kitchen" className="font-mono-ui text-[11px] uppercase tracking-[0.14em] text-foreground/75 transition-colors hover:text-accent" data-testid="link-kitchen">Kitchen</Link>
          </nav>
          <div className="flex items-center gap-2">
            <form onSubmit={submitSearch} className="hidden items-center border-b border-foreground/30 px-1 py-1 focus-within:border-accent sm:flex" role="search">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground/80" placeholder="Search goods" aria-label="Search goods" data-testid="input-header-search" />
            </form>
            <Link href="/cart" className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary" aria-label={`Cart, ${itemCount} items`} data-testid="link-cart">
              <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.7} />
              {itemCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 font-mono-ui text-[9px] font-medium text-accent-foreground" data-testid="text-cart-count">{itemCount}</span>}
            </Link>
            <button className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-secondary md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="animate-fade border-t border-border bg-card px-4 py-5 md:hidden">
            <form onSubmit={submitSearch} className="mb-5 flex items-center gap-2 rounded-full border border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="Search goods" aria-label="Search goods" data-testid="input-mobile-search" />
            </form>
            <div className="grid gap-4">
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="font-display text-3xl" data-testid="link-mobile-shop">Shop everything</Link>
              <Link href="/shop?featured=true" onClick={() => setMenuOpen(false)} className="font-display text-3xl" data-testid="link-mobile-edit">The edit</Link>
              <Link href="/cart" onClick={() => setMenuOpen(false)} className="font-display text-3xl" data-testid="link-mobile-cart">Your bag <span className="font-sans text-base text-muted-foreground">({itemCount})</span></Link>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
        <div className="page-shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><span className="h-2.5 w-2.5 rounded-full border-2 border-primary" /></span>
              <span className="font-display text-2xl">Northstar</span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-primary-foreground/65">A considered collection of useful, beautiful things for the everyday.</p>
          </div>
          <div>
            <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary-foreground/50">Explore</p>
            <div className="grid gap-3 text-sm">
              <Link href="/shop" className="transition-colors hover:text-secondary" data-testid="link-footer-shop">Shop all goods</Link>
              <Link href="/shop?featured=true" className="transition-colors hover:text-secondary" data-testid="link-footer-edit">The edit</Link>
              <Link href="/cart" className="transition-colors hover:text-secondary" data-testid="link-footer-cart">Your bag</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary-foreground/50">Our promise</p>
            <p className="text-sm leading-6 text-primary-foreground/65">Good materials. Honest prices. Things that earn their place.</p>
            <Link href="/shop" className="mt-5 inline-flex items-center gap-2 border-b border-secondary pb-1 text-sm transition-colors hover:text-secondary" data-testid="link-footer-discover">Discover the collection <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
        <div className="page-shell flex flex-wrap justify-between gap-3 border-t border-primary-foreground/15 py-5 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-primary-foreground/45"><span>Northstar Market / Objects with a point of view</span><span className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${healthQuery.isError ? 'bg-destructive' : 'bg-secondary'}`} /> {healthQuery.isError ? 'Shop status / reconnecting' : 'Shop status / online'}</span></div>
      </footer>
    </div>
  );
}