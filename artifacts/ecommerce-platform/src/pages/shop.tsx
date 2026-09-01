import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import type { Product } from '@workspace/api-client-react';
import { useListProducts } from '@workspace/api-client-react';
import { useCart } from '@/hooks/use-cart';
import { formatKes } from '@/lib/format';

type MainCategory = 'All' | 'Bags' | 'Accessories';
const mainCategories: MainCategory[] = ['All', 'Bags', 'Accessories'];

function FilterList({ products, category, query, onCategory, onQuery }: { products: Product[]; category: string; query: string; onCategory: (value: string) => void; onQuery: (value: string) => void }) {
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  return <div className="filter-list"><h2>Filter products</h2>{categories.map((item) => <button className={category === item ? 'selected' : ''} onClick={() => onCategory(item)} key={item}>{item}<span>{item === 'All' ? products.length : products.filter((product) => product.category === item).length}</span></button>)}<h2>Search</h2><div className="filter-search"><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Product name" aria-label="Search products" /><span>⌕</span></div></div>;
}

export default function Shop() {
  const [location, setLocation] = useLocation();
  const productsQuery = useListProducts();
  const products = productsQuery.data ?? [];
  const params = useMemo(() => new URLSearchParams(location.split('?')[1] ?? ''), [location]);
  const requestedCategory = params.get('category') ?? 'All';
  const [main, setMain] = useState<MainCategory>(requestedCategory === 'Accessories' ? 'Accessories' : requestedCategory !== 'All' ? 'Bags' : 'All');
  const [category, setCategory] = useState(requestedCategory);
  const [sort, setSort] = useState('featured');
  const [query, setQuery] = useState(params.get('search') ?? '');
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  const [columns, setColumns] = useState(4);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const cart = useCart();

  useEffect(() => {
    const slugOrId = params.get('product');
    if (slugOrId) setSelected(products.find((product) => String(product.id) === slugOrId || product.slug === slugOrId) ?? null);
    else setSelected(null);
  }, [params, products]);

  const visible = useMemo(() => {
    const result = products.filter((product) => {
      const isMainMatch = main === 'All' || (main === 'Accessories' ? product.category.toLowerCase().includes('accessor') : !product.category.toLowerCase().includes('accessor'));
      const isCategoryMatch = category === 'All' || product.category.toLowerCase() === category.toLowerCase();
      const isQueryMatch = !query.trim() || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
      return isMainMatch && isCategoryMatch && isQueryMatch;
    });
    return result.sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : Number(b.featured) - Number(a.featured));
  }, [category, main, products, query, sort]);

  const price = (amount: number) => currency === 'KES' ? formatKes(amount) : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount / 130);
  const chooseMain = (next: MainCategory) => { setMain(next); setCategory(next === 'Accessories' ? 'Accessories' : 'All'); };

  return <section>
    <header className="shop-hero"><p className="quiet-label">The iLonito collection</p><h1>Leather made for living.</h1><p>Bold, useful pieces handmade in Kenya, and designed to become more personal with every journey.</p></header>
    <section className="shop-wrap">
      <div className="shop-categories">{mainCategories.map((item) => <button className={main === item ? 'selected' : ''} onClick={() => chooseMain(item)} key={item}>{item}</button>)}</div>
      <div className="shop-toolbar"><span className="product-count">{visible.length ? `1 - ${visible.length} / ${visible.length}` : '0 products'}</span><div className="view-switch"><span>View</span>{[2, 3, 4].map((number) => <button className={columns === number ? 'chosen' : ''} onClick={() => setColumns(number)} key={number}>{number}</button>)}</div><div className="currency-switch" aria-label="Choose currency"><button className={currency === 'KES' ? 'chosen' : ''} onClick={() => setCurrency('KES')}>KES</button><button className={currency === 'USD' ? 'chosen' : ''} onClick={() => setCurrency('USD')}>USD</button></div><label><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Default sorting</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label><button className="filter-trigger" onClick={() => setFiltersOpen(true)}><span aria-hidden="true">☷</span> Filter</button></div>
      <div className="shop-layout"><aside><p>Filter products</p><FilterList products={products} category={category} query={query} onCategory={setCategory} onQuery={setQuery} /></aside><div className="shop-results">{productsQuery.isLoading ? <div className="catalog-grid cols-4">{[1, 2, 3, 4].map((item) => <div className="catalog-card placeholder-card" key={item}><div /></div>)}</div> : productsQuery.isError ? <div className="empty-state"><h2>We could not load the collection</h2><p>Please try again.</p><button onClick={() => productsQuery.refetch()}>Try again</button></div> : visible.length ? <div className={`catalog-grid cols-${columns}`}>{visible.map((product) => <button className="catalog-card" onClick={() => { setSelected(product); setLocation(`/shop?product=${product.id}`); }} key={product.id} data-testid={`card-shop-product-${product.id}`}><div><img src={product.imageUrl} alt={product.name} />{product.badge && <em>{product.badge}</em>}<span>Quick view</span></div><h2>{product.name}</h2><p>{price(product.price)}</p><small>{product.description}</small></button>)}</div> : <div className="empty-state"><h2>No products found</h2><p>Try another category or search.</p><button onClick={() => { setQuery(''); setCategory('All'); setMain('All'); }}>Clear filters</button></div>}<p className="price-note">KES is charged at checkout. USD prices are estimates for international customers.</p></div></div>
      <div className={`filter-drawer ${filtersOpen ? 'open' : ''}`} aria-hidden={!filtersOpen}><button className="drawer-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">×</button><FilterList products={products} category={category} query={query} onCategory={setCategory} onQuery={setQuery} /><button className="apply-filters" onClick={() => setFiltersOpen(false)}>Show {visible.length} products</button></div>{filtersOpen && <button className="drawer-shade" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />}
    </section>
    {selected && <div className="quickview-backdrop" onClick={() => { setSelected(null); setLocation('/shop'); }}><article className="quickview" onClick={(event) => event.stopPropagation()}><button className="quickview-close" onClick={() => { setSelected(null); setLocation('/shop'); }} aria-label="Close">×</button><img src={selected.imageUrl} alt={selected.name} /><div className="quickview-copy"><p>{selected.category}</p><h2>{selected.name}</h2><strong>{price(selected.price)}</strong><span>{selected.description}</span><button className="quickview-add" onClick={() => { cart.addItem(selected); setSelected(null); setLocation('/shop'); }}>Add to bag <i>+</i></button><Link href={`/product/${selected.id}`}>View details</Link><a className="quickview-whatsapp" href={wa(`Hello iLonito, I am interested in the ${selected.name}, shown at ${price(selected.price)}.`)} target="_blank" rel="noreferrer">Ask on WhatsApp</a><small>Local delivery and international shipping available</small></div></article></div>}
  </section>;
}

const wa = (message: string) => `https://wa.me/254714075180?text=${encodeURIComponent(message)}`;