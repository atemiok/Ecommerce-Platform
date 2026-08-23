import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { getListProductsQueryKey, useListCategories, useListProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/product-card';

function SkeletonGrid() {
  return <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="animate-pulse"><div className="aspect-[4/5] rounded-[1.1rem] bg-muted" /><div className="mt-4 h-3 w-20 rounded bg-muted" /><div className="mt-2 h-4 w-36 rounded bg-muted" /></div>)}</div>;
}

export default function Shop() {
  const [location] = useLocation();
  const paramsFromUrl = useMemo(() => new URLSearchParams(location.split('?')[1] ?? ''), [location]);
  const initialSearch = paramsFromUrl.get('search') ?? '';
  const initialCategory = paramsFromUrl.get('category') ?? '';
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [featured, setFeatured] = useState(paramsFromUrl.get('featured') === 'true');
  const [sort, setSort] = useState('curated');
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    setSearch(initialSearch);
    setCategory(initialCategory);
    setFeatured(paramsFromUrl.get('featured') === 'true');
  }, [initialCategory, initialSearch, paramsFromUrl]);
  const params = useMemo(() => ({ ...(search.trim() ? { search: search.trim() } : {}), ...(category ? { category } : {}), ...(featured ? { featured: true } : {}) }), [search, category, featured]);
  const productsQuery = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const categoriesQuery = useListCategories();
  const products = useMemo(() => [...(productsQuery.data ?? [])].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : 0), [productsQuery.data, sort]);

  return (
    <div className="page-shell py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">The iLonito collection / {productsQuery.data?.length ?? '—'} pieces</p>
          <h1 className="font-display text-6xl leading-[.85] tracking-tight md:text-8xl">Carry your story.</h1>
        </div>
        <p className="max-w-[240px] text-sm leading-6 text-muted-foreground">Handmade in Kenya. Bold leather pieces designed to grow more personal with every journey.</p>
      </div>

      <div className="mt-12 border-y border-border py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-2 border-b border-foreground/30 py-2 focus-within:border-accent sm:max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search iLonito leather" aria-label="Search iLonito leather" data-testid="input-shop-search" />
            {search && <button onClick={() => setSearch('')} aria-label="Clear search" className="text-muted-foreground hover:text-foreground" data-testid="button-clear-search"><X className="h-4 w-4" /></button>}
          </div>
          <button onClick={() => setFiltersOpen((open) => !open)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs transition-colors ${filtersOpen ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`} data-testid="button-toggle-filters"><SlidersHorizontal className="h-3.5 w-3.5" /> Filter</button>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground"><span className="hidden sm:inline">Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent py-2 font-medium text-foreground outline-none" aria-label="Sort products" data-testid="select-sort-products"><option value="curated">Curated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label>
        </div>
        {filtersOpen && <div className="animate-fade flex flex-wrap items-center gap-2 pt-5">
          <button onClick={() => setFeatured((value) => !value)} className={`rounded-full border px-3 py-2 text-xs ${featured ? 'border-accent bg-accent text-accent-foreground' : 'border-border hover:border-primary'}`} data-testid="button-filter-featured"><Filter className="mr-1 inline h-3 w-3" /> Featured only</button>
          <button onClick={() => setCategory('')} className={`rounded-full border px-3 py-2 text-xs ${!category ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`} data-testid="button-filter-all">All categories</button>
          {(categoriesQuery.data ?? []).map((item) => <button key={item.slug} onClick={() => setCategory(item.slug)} className={`rounded-full border px-3 py-2 text-xs ${category === item.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`} data-testid={`button-filter-${item.slug}`}>{item.name}</button>)}
        </div>}
      </div>
      {category && <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">Showing <span className="font-medium text-foreground">{category}</span><button onClick={() => setCategory('')} className="rounded-full p-1 hover:bg-muted" aria-label="Remove category filter" data-testid="button-remove-category"><X className="h-3 w-3" /></button></div>}
      <div className="mt-10">
        {productsQuery.isLoading ? <SkeletonGrid /> : productsQuery.isError ? <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center" data-testid="status-shop-error"><p className="font-display text-4xl">The collection is out of reach.</p><p className="mt-2 text-sm text-muted-foreground">We couldn't load the shelves. Please try again.</p><button onClick={() => productsQuery.refetch()} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground" data-testid="button-retry-products">Try again</button></div> : products.length ? <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="rounded-2xl border border-border bg-card px-6 py-20 text-center" data-testid="status-shop-empty"><p className="font-display text-5xl">Nothing quite yet.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Try a different search, or clear the filters to see the full collection.</p><button onClick={() => { setSearch(''); setCategory(''); setFeatured(false); }} className="mt-7 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground" data-testid="button-reset-filters">Reset filters</button></div>}
      </div>
    </div>
  );
}