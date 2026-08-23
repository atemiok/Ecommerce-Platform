import { useState } from 'react';
import { Link } from 'wouter';
import { Check, Plus, Star } from 'lucide-react';
import type { Product } from '@workspace/api-client-react';
import { useCart } from '@/hooks/use-cart';
import { formatKes } from '@/lib/format';

function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {!failed && product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" data-testid={`img-product-${product.id}`} />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,hsl(var(--secondary)),hsl(var(--muted)))]">
          <span className="font-display text-7xl text-primary/20">{product.name.charAt(0)}</span>
        </div>
      )}
      {product.badge && <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-[0.12em] text-foreground" data-testid={`badge-product-${product.id}`}>{product.badge}</span>}
    </div>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const add = () => {
    if (!product.inStock) return;
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };
  return (
    <article className="group animate-rise" style={{ animationDelay: `${index * 70}ms` }} data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`} className="block" data-testid={`link-product-${product.id}`}>
        <ProductImage product={product} className="aspect-[4/5] rounded-[1.1rem]" />
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="mb-1 font-mono-ui text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{product.category}</p>
          <Link href={`/product/${product.id}`} className="block truncate font-medium tracking-[-0.01em] hover:text-accent" data-testid={`link-product-name-${product.id}`}>{product.name}</Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono-ui text-sm">{formatKes(product.price)}</span>
            {product.compareAtPrice && <span className="font-mono-ui text-xs text-muted-foreground line-through">{formatKes(product.compareAtPrice)}</span>}
            {product.rating > 0 && <span className="ml-1 flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-accent text-accent" /> {product.rating.toFixed(1)}</span>}
          </div>
        </div>
        <button onClick={add} disabled={!product.inStock} className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${added ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary hover:bg-secondary'} disabled:cursor-not-allowed disabled:opacity-40`} aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`} data-testid={`button-add-product-${product.id}`}>
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
      {!product.inStock && <p className="mt-2 text-xs text-destructive" data-testid={`status-stock-${product.id}`}>Currently unavailable</p>}
    </article>
  );
}

export { ProductImage };