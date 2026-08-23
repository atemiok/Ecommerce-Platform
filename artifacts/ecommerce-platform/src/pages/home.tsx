import { Link } from 'wouter';
import { ArrowRight, MapPin, MessageCircle, PackageCheck, Sparkles } from 'lucide-react';
import { useGetStorefrontSummary, useListCategories } from '@workspace/api-client-react';
import { ProductCard } from '@/components/product-card';

function ProductSkeleton() {
  return <div className="animate-pulse"><div className="aspect-[4/5] rounded-sm bg-muted" /><div className="mt-4 h-3 w-20 rounded bg-muted" /><div className="mt-2 h-4 w-36 rounded bg-muted" /></div>;
}

const whatsappUrl = 'https://wa.me/254714075180';

export default function Home() {
  const summaryQuery = useGetStorefrontSummary();
  const categoriesQuery = useListCategories();
  const summary = summaryQuery.data;
  const categories = categoriesQuery.data ?? [];

  return (
    <div>
      <section className="relative min-h-[690px] overflow-hidden bg-primary text-primary-foreground">
        <img src="/images/ilonito/hero.jpg" alt="iLonito leather tote in Narok light" className="absolute inset-0 h-full w-full object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary))_4%,hsl(var(--primary)/.77)_46%,hsl(var(--primary)/.12)_100%)]" />
        <div className="page-shell relative z-10 flex min-h-[690px] items-end py-14 md:items-center md:py-20">
          <div className="max-w-2xl animate-rise">
            <p className="mb-7 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.25em] text-secondary"><Sparkles className="h-3.5 w-3.5" /> Kenyan luxury leather</p>
            <h1 className="font-display text-[clamp(4.8rem,11vw,10.5rem)] leading-[.78] tracking-[-.055em]">Made to<br /><em className="text-secondary">carry</em> stories.</h1>
            <p className="mt-9 max-w-md text-base leading-7 text-primary-foreground/75">Bold, timeless leather bags and accessories, handmade in Kenya for the lives you are building.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex items-center gap-3 bg-secondary px-6 py-3.5 text-sm font-medium text-secondary-foreground transition-transform hover:-translate-y-0.5" data-testid="link-hero-shop">Explore the collection <ArrowRight className="h-4 w-4" /></Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-primary-foreground/30 px-5 py-3.5 text-sm transition-colors hover:bg-primary-foreground hover:text-primary"><MessageCircle className="h-4 w-4" /> Order on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-10 py-20 md:grid-cols-[.9fr_1.1fr] md:py-28">
        <div className="overflow-hidden bg-muted"><img src="/images/ilonito/craft.jpg" alt="Hands working with leather" className="h-full min-h-[440px] w-full object-cover" /></div>
        <div className="flex flex-col justify-center md:pl-10">
          <p className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.22em] text-muted-foreground">01 / Our leather, our hands</p>
          <h2 className="max-w-lg font-display text-5xl leading-[.9] tracking-tight md:text-7xl">Born in Kenya.<br />Built for everywhere.</h2>
          <p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">iLonito creates small-batch leather pieces that feel at home in Narok, Nairobi, and wherever the road leads. Every stitch, edge, and hand-finished surface is made with purpose.</p>
          <a href="#leather-care" className="mt-8 inline-flex w-fit items-center gap-2 border-b border-accent pb-2 text-sm text-foreground hover:text-accent">Learn about leather care <ArrowRight className="h-4 w-4" /></a>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground md:py-20">
        <div className="page-shell">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[.22em] text-secondary">02 / The iLonito collection</p><h2 className="font-display text-5xl leading-none tracking-tight md:text-7xl">Leather with presence.</h2></div>
            <Link href="/shop?featured=true" className="group inline-flex items-center gap-2 border-b border-secondary pb-2 text-sm text-primary-foreground/80 transition-colors hover:text-secondary">Shop featured pieces <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          </div>
          {summaryQuery.isLoading ? <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div> : summaryQuery.isError ? <div className="mt-10 border border-primary-foreground/20 p-8"><p className="font-display text-3xl">The collection is taking a moment.</p><p className="mt-2 text-sm text-primary-foreground/60">Please refresh and try again.</p></div> : <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{(summary?.featuredProducts ?? []).slice(0, 4).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>}
        </div>
      </section>

      <section className="page-shell py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[.7fr_1.3fr]">
          <div><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[.2em] text-muted-foreground">03 / Shop by craft</p><h2 className="max-w-xs font-display text-5xl leading-[.9] tracking-tight md:text-6xl">Pieces for every path.</h2><p className="mt-6 max-w-xs text-sm leading-6 text-muted-foreground">Bags, wallets, shoes, belts, coasters, beadwork, and journals made with a distinctly Kenyan point of view.</p></div>
          <div className="border-t border-border">{categoriesQuery.isLoading ? [1, 2, 3].map((item) => <div key={item} className="flex h-20 animate-pulse items-center justify-between border-b border-border"><div className="h-5 w-32 rounded bg-muted" /><div className="h-3 w-16 rounded bg-muted" /></div>) : categories.map((category, index) => <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} key={category.slug} className="group flex items-center justify-between border-b border-border py-5 transition-colors hover:border-primary" data-testid={`link-category-${category.slug}`}><div className="flex items-center gap-5"><span className="font-mono-ui text-[10px] text-muted-foreground">{String(index + 1).padStart(2, '0')}</span><span className="font-display text-3xl md:text-4xl">{category.name}</span></div><div className="flex items-center gap-4"><span className="font-mono-ui text-[10px] uppercase tracking-[.12em] text-muted-foreground">{category.productCount} pieces</span><ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" /></div></Link>)}</div>
        </div>
      </section>

      <section id="custom-orders" className="bg-secondary/40">
        <div className="page-shell grid gap-10 py-20 md:grid-cols-[1.05fr_.95fr] md:py-24">
          <div className="flex flex-col justify-center"><p className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.22em] text-accent">04 / Custom order</p><h2 className="max-w-xl font-display text-5xl leading-[.9] tracking-tight md:text-7xl">A piece made<br />around you.</h2><p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">Choose your leather, colour, proportions, and details. We collaborate with you to make a bag, journal, or accessory that carries your story from the first day.</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-fit items-center gap-2 bg-primary px-6 py-3.5 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5"><MessageCircle className="h-4 w-4" /> Start a custom order</a></div>
          <div className="overflow-hidden"><img src="/images/ilonito/black-briefcase.jpg" alt="Handcrafted black iLonito leather briefcase" className="h-full min-h-[420px] w-full object-cover" /></div>
        </div>
      </section>

      <section id="delivery" className="page-shell grid gap-5 py-20 md:grid-cols-3 md:py-28">
        <div><PackageCheck className="mb-5 h-7 w-7 text-accent" /><h2 className="font-display text-4xl">Ordering</h2><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Order online or chat with us on WhatsApp. We’ll confirm availability, payment, and your preferred delivery details personally.</p></div>
        <div><MapPin className="mb-5 h-7 w-7 text-accent" /><h2 className="font-display text-4xl">Delivery</h2><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Local delivery is available across Kenya. International shipping is available and quoted for your destination before dispatch.</p></div>
        <div><Sparkles className="mb-5 h-7 w-7 text-accent" /><h2 className="font-display text-4xl">Custom work</h2><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">For made-to-order pieces, allow time for the craft. We’ll guide you through every material and design decision.</p></div>
      </section>

      <section id="leather-care" className="bg-primary text-primary-foreground">
        <div className="page-shell grid gap-10 py-20 md:grid-cols-[.95fr_1.05fr] md:py-24">
          <div><p className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.22em] text-secondary">05 / Leather care</p><h2 className="font-display text-5xl leading-[.9] md:text-7xl">Care makes<br />the character.</h2></div>
          <div className="grid content-center gap-5 text-sm leading-7 text-primary-foreground/75"><p>Keep your leather away from prolonged sun and moisture. Store every piece in its dust bag and let it rest between adventures.</p><p>For gentle maintenance, wipe with a soft dry cloth and condition sparingly with a leather-safe balm. Never use harsh household cleaners.</p><p className="border-t border-primary-foreground/20 pt-5 text-primary-foreground">Questions about a piece you own? <a href={`mailto:ilonito@outlook.com`} className="text-secondary underline underline-offset-4">Write to our care team.</a></p></div>
        </div>
      </section>

      <section id="visit" className="page-shell grid gap-10 py-20 md:grid-cols-[1fr_.9fr] md:py-28">
        <div><p className="mb-5 font-mono-ui text-[10px] uppercase tracking-[.22em] text-muted-foreground">06 / Visit & contact</p><h2 className="font-display text-5xl leading-[.9] md:text-7xl">Meet iLonito<br />in Narok.</h2><p className="mt-7 max-w-md text-base leading-7 text-muted-foreground">Visit the studio store, feel the leather, and talk with us about the piece you are looking for.</p></div>
        <div className="border-t border-border pt-7 text-sm"><div className="grid gap-6"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">Store</p><p className="mt-2 text-lg">1st Floor, Ol Talet Mall, Narok</p></div><div><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">WhatsApp</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-lg underline decoration-accent underline-offset-4">+254 714 075 180</a></div><div><p className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-muted-foreground">Email</p><a href="mailto:ilonito@outlook.com" className="mt-2 inline-block text-lg underline decoration-accent underline-offset-4">ilonito@outlook.com</a></div></div>
        </div>
      </section>
    </div>
  );
}