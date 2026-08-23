import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react';
import { getGetProductQueryKey, useGetProduct, useListProducts } from '@workspace/api-client-react';
import { ProductImage } from '@/components/product-card';
import { useCart } from '@/hooks/use-cart';

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = Number(params.id);
  const productQuery = useGetProduct(id, { query: { enabled: Number.isFinite(id) && id > 0, queryKey: getGetProductQueryKey(id) } });
  const product = productQuery.data;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const relatedQuery = useListProducts(product ? { category: product.category } : undefined, { query: { enabled: !!product, queryKey: ['/api/products', product?.category ?? 'related'] } });

  if (productQuery.isLoading) return <div className="page-shell grid min-h-[70vh] gap-12 py-16 md:grid-cols-2"><div className="animate-pulse aspect-[4/5] rounded-[1.3rem] bg-muted" /><div className="animate-pulse py-10"><div className="h-3 w-24 rounded bg-muted" /><div className="mt-5 h-16 w-3/4 rounded bg-muted" /><div className="mt-8 h-5 w-32 rounded bg-muted" /></div></div>;
  if (productQuery.isError || !product) return <div className="page-shell flex min-h-[65vh] items-center justify-center py-20 text-center" data-testid="status-product-error"><div><p className="font-display text-6xl">That object wandered off.</p><p className="mt-3 text-sm text-muted-foreground">This product may no longer be part of the collection.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground" data-testid="link-product-back">Back to the shop</Link></div></div>;

  const add = () => {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };
  const related = (relatedQuery.data ?? []).filter((item) => item.id !== product.id).slice(0, 3);

  return (
    <div className="page-shell py-8 md:py-12">
      <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground" data-testid="link-product-shop"><ArrowLeft className="h-3.5 w-3.5" /> Back to collection</Link>
      <div className="grid gap-10 md:grid-cols-[minmax(0,.95fr)_minmax(360px,.8fr)] md:gap-20">
        <div className="md:sticky md:top-28 md:self-start"><ProductImage product={product} className="aspect-[4/5] rounded-[1.6rem]" /></div>
        <div className="animate-rise py-2 md:py-10">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
          <h1 className="mt-4 max-w-lg font-display text-6xl leading-[.86] tracking-tight md:text-8xl" data-testid="text-product-name">{product.name}</h1>
          <div className="mt-7 flex items-center gap-4">
            <span className="font-mono-ui text-lg" data-testid="text-product-price">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && <span className="font-mono-ui text-sm text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>}
            {product.rating > 0 && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-3.5 w-3.5 fill-accent text-accent" /> {product.rating.toFixed(1)} <span className="text-xs">({product.reviewCount})</span></span>}
          </div>
          <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground" data-testid="text-product-description">{product.description}</p>
          <div className="my-9 border-y border-border py-5">
            <div className="flex items-center gap-3 text-sm"><span className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-[#4f936b]' : 'bg-destructive'}`} /><span data-testid="status-product-stock">{product.inStock ? 'In stock, ready to ship' : 'Currently unavailable'}</span></div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-12 items-center rounded-full border border-border">
              <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-11 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground" aria-label="Decrease quantity" data-testid="button-decrease-quantity"><Minus className="h-3.5 w-3.5" /></button>
              <span className="w-6 text-center font-mono-ui text-sm" data-testid="text-product-quantity">{quantity}</span>
              <button onClick={() => setQuantity((value) => value + 1)} className="grid h-11 w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground" aria-label="Increase quantity" data-testid="button-increase-quantity"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <button onClick={add} disabled={!product.inStock} className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-medium transition-all ${added ? 'bg-[#4f936b] text-primary-foreground' : 'bg-primary text-primary-foreground hover:-translate-y-0.5'} disabled:cursor-not-allowed disabled:opacity-40`} data-testid="button-add-to-cart">
              {added ? <><Check className="h-4 w-4" /> Added to your bag</> : 'Add to bag'}
            </button>
          </div>
          {added && <button onClick={() => setLocation('/cart')} className="mt-3 w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground" data-testid="button-view-cart">View your bag</button>}
          <div className="mt-10 grid gap-4 border-t border-border pt-7 text-xs text-muted-foreground">
            <div className="flex items-center gap-3"><Truck className="h-4 w-4 text-primary" /> Complimentary shipping over $75</div>
            <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /> Thoughtful goods, considered carefully</div>
          </div>
        </div>
      </div>
      {related.length > 0 && <section className="border-t border-border pt-14 mt-20"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">You may also like</p><h2 className="font-display text-4xl">Keep looking.</h2></div><Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-xs underline underline-offset-4" data-testid="link-related-category">More in {product.category}</Link></div><div className="grid gap-5 sm:grid-cols-3">{related.map((item, index) => <div key={item.id}><ProductImage product={item} className="group aspect-[4/5] rounded-[1.1rem]" /><Link href={`/product/${item.id}`} className="mt-3 block text-sm hover:text-accent" data-testid={`link-related-${item.id}`}>{item.name}</Link><p className="mt-1 font-mono-ui text-xs">${item.price.toFixed(2)}</p></div>)}</div></section>}
    </div>
  );
}