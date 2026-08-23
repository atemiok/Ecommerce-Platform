import { Link } from 'wouter';
import { ArrowDownRight, ArrowRight, Sparkles } from 'lucide-react';
import { useGetStorefrontSummary, useListCategories } from '@workspace/api-client-react';
import { ProductCard } from '@/components/product-card';

function ProductSkeleton({ wide = false }: { wide?: boolean }) {
  return <div className={`animate-pulse ${wide ? 'md:col-span-2' : ''}`}><div className="aspect-[4/5] rounded-[1.1rem] bg-muted" /><div className="mt-4 h-3 w-20 rounded bg-muted" /><div className="mt-2 h-4 w-36 rounded bg-muted" /></div>;
}

export default function Home() {
  const summaryQuery = useGetStorefrontSummary();
  const categoriesQuery = useListCategories();
  const summary = summaryQuery.data;
  const categories = categoriesQuery.data ?? [];

  return (
    <div>
      <section className="page-shell relative grid min-h-[610px] items-center gap-10 overflow-hidden py-16 md:grid-cols-[1.08fr_.92fr] md:py-20">
        <div className="relative z-10 animate-rise">
          <p className="mb-7 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-accent" /> A small, excellent shop</p>
          <h1 className="max-w-[680px] text-balance font-display text-[clamp(4.5rem,11vw,9.5rem)] leading-[.78] tracking-[-0.055em] text-primary">
            Good things<br /><em className="text-accent">find</em> you.
          </h1>
          <p className="mt-10 max-w-[380px] text-base leading-7 text-muted-foreground">Everyday objects with a little more thought in them. Chosen for how they work, how they feel, and how long they stay useful.</p>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5" data-testid="link-hero-shop">Browse the collection <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="relative mx-auto h-[430px] w-full max-w-[470px] animate-rise md:h-[530px]" style={{ animationDelay: '140ms' }}>
          <div className="absolute right-0 top-0 h-[76%] w-[72%] rounded-[2rem] bg-secondary" />
          <div className="absolute bottom-0 left-0 h-[75%] w-[72%] overflow-hidden rounded-[2rem] border-[12px] border-background bg-primary shadow-2xl">
            {summary?.featuredProducts?.[0]?.imageUrl ? <img src={summary.featuredProducts[0].imageUrl} alt={summary.featuredProducts[0].name} className="h-full w-full object-cover opacity-90" /> : <div className="grid h-full place-items-center"><span className="font-display text-[10rem] text-primary-foreground/20">N</span></div>}
          </div>
          <div className="absolute right-2 top-[18%] grid h-24 w-24 rotate-6 place-items-center rounded-full bg-accent text-center text-primary">
            <span className="font-mono-ui text-[9px] uppercase leading-4 tracking-[0.12em]">Worth<br />keeping</span>
          </div>
          <div className="absolute bottom-8 right-[9%] rounded-lg bg-background px-3 py-2 font-mono-ui text-[9px] uppercase tracking-[0.1em] shadow-lg">Est. 2024 / Online</div>
        </div>
        <div className="absolute bottom-7 left-0 hidden items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex"><ArrowDownRight className="h-4 w-4" /> Scroll to explore</div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground md:py-20">
        <div className="page-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary">01 / In the spotlight</p>
              <h2 className="font-display text-5xl leading-none tracking-tight md:text-7xl">The good stuff.</h2>
            </div>
            <Link href="/shop?featured=true" className="group inline-flex items-center gap-2 border-b border-secondary pb-2 text-sm text-primary-foreground/80 transition-colors hover:text-secondary" data-testid="link-home-featured">See all featured <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
          {summaryQuery.isLoading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div>
          ) : summaryQuery.isError ? (
            <div className="mt-10 rounded-2xl border border-primary-foreground/20 p-8" data-testid="status-home-error"><p className="font-display text-3xl">The shelves are taking a moment.</p><p className="mt-2 text-sm text-primary-foreground/60">Please refresh and try again.</p></div>
          ) : (
            <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {(summary?.featuredProducts ?? []).slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          )}
        </div>
      </section>

      <section className="page-shell py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">02 / Browse by feeling</p>
            <h2 className="max-w-xs font-display text-5xl leading-[.9] tracking-tight md:text-6xl">Make room for better.</h2>
            <p className="mt-6 max-w-xs text-sm leading-6 text-muted-foreground">A shorter list, selected with a sharper eye. Start somewhere that feels like you.</p>
          </div>
          <div className="border-t border-border">
            {categoriesQuery.isLoading ? [1, 2, 3].map((item) => <div key={item} className="flex h-20 animate-pulse items-center justify-between border-b border-border"><div className="h-5 w-32 rounded bg-muted" /><div className="h-3 w-16 rounded bg-muted" /></div>) : categories.length ? categories.map((category, index) => (
              <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.slug} className="group flex items-center justify-between border-b border-border py-5 transition-colors hover:border-primary" data-testid={`link-category-${category.slug}`}>
                <div className="flex items-center gap-5"><span className="font-mono-ui text-[10px] text-muted-foreground">0{index + 1}</span><span className="font-display text-3xl md:text-4xl">{category.name}</span></div>
                <div className="flex items-center gap-4"><span className="font-mono-ui text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{category.productCount} pieces</span><ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" /></div>
              </Link>
            )) : <div className="py-10 text-sm text-muted-foreground">Categories are being arranged.</div>}
          </div>
        </div>
      </section>

      <section className="page-shell pb-24">
        <div className="relative overflow-hidden rounded-[1.6rem] bg-secondary px-8 py-12 md:px-16 md:py-16">
          <div className="absolute -right-8 -top-12 h-48 w-48 rounded-full border-[24px] border-accent/30" />
          <div className="absolute bottom-[-75px] right-[20%] h-52 w-52 rounded-full border-[1px] border-primary/20" />
          <div className="relative max-w-xl">
            <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-primary/60">A considered collection</p>
            <h2 className="font-display text-5xl leading-[.9] tracking-tight text-primary md:text-7xl">Less browsing.<br />More finding.</h2>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-3 text-sm text-primary transition-colors hover:bg-primary hover:text-secondary" data-testid="link-home-collection">Enter the shop <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}