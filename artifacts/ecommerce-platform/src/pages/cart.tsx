import { Link } from 'wouter';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 7.5;
  const total = subtotal + shipping;

  if (!items.length) return <div className="page-shell flex min-h-[65vh] items-center justify-center py-20"><div className="text-center" data-testid="status-cart-empty"><div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full bg-secondary"><ShoppingBag className="h-7 w-7 text-primary" strokeWidth={1.5} /></div><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your bag / 0 items</p><h1 className="mt-4 font-display text-6xl leading-none">A little empty.</h1><p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-muted-foreground">The right object has a way of finding its way in. Start with a look around.</p><Link href="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm text-primary-foreground" data-testid="link-empty-cart-shop">Find something good <ArrowRight className="h-4 w-4" /></Link></div></div>;

  return (
    <div className="page-shell py-12 md:py-16">
      <div className="flex items-end justify-between gap-5"><div><p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your bag / {itemCount} {itemCount === 1 ? 'item' : 'items'}</p><h1 className="font-display text-6xl leading-[.85] md:text-8xl">Take your time.</h1></div><Link href="/shop" className="hidden text-xs underline underline-offset-4 sm:block" data-testid="link-cart-continue">Continue shopping</Link></div>
      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="border-t border-border">
          {items.map((line) => <div key={line.product.id} className="grid grid-cols-[88px_1fr_auto] gap-4 border-b border-border py-5 sm:grid-cols-[112px_1fr_auto] sm:gap-6" data-testid={`row-cart-item-${line.product.id}`}>
            <Link href={`/product/${line.product.id}`} className="aspect-square overflow-hidden rounded-xl bg-muted" data-testid={`link-cart-image-${line.product.id}`}><img src={line.product.imageUrl} alt={line.product.name} className="h-full w-full object-cover" /></Link>
            <div className="min-w-0 py-1"><p className="font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">{line.product.category}</p><Link href={`/product/${line.product.id}`} className="mt-1 block truncate font-medium" data-testid={`link-cart-item-${line.product.id}`}>{line.product.name}</Link><p className="mt-2 font-mono-ui text-sm">${line.product.price.toFixed(2)}</p><button onClick={() => removeItem(line.product.id)} className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive" data-testid={`button-remove-item-${line.product.id}`}><Trash2 className="h-3 w-3" /> Remove</button></div>
            <div className="flex flex-col items-end justify-between py-1"><p className="font-mono-ui text-sm">${(line.product.price * line.quantity).toFixed(2)}</p><div className="flex h-8 items-center rounded-full border border-border"><button onClick={() => updateQuantity(line.product.id, line.quantity - 1)} className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground" aria-label={`Decrease ${line.product.name}`} data-testid={`button-decrease-cart-${line.product.id}`}><Minus className="h-3 w-3" /></button><span className="w-5 text-center font-mono-ui text-xs" data-testid={`text-cart-quantity-${line.product.id}`}>{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, line.quantity + 1)} className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground" aria-label={`Increase ${line.product.name}`} data-testid={`button-increase-cart-${line.product.id}`}><Plus className="h-3 w-3" /></button></div></div>
          </div>)}
        </div>
        <aside className="h-fit rounded-[1.25rem] bg-secondary p-6 md:p-7">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary/60">Order summary</p>
          <div className="mt-7 grid gap-4 border-b border-primary/15 pb-6 text-sm"><div className="flex justify-between"><span className="text-primary/65">Subtotal</span><span className="font-mono-ui">${subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-primary/65">Shipping</span><span className="font-mono-ui">{shipping ? `$${shipping.toFixed(2)}` : 'Free'}</span></div></div>
          <div className="flex justify-between py-6 font-medium"><span>Total</span><span className="font-mono-ui" data-testid="text-cart-total">${total.toFixed(2)}</span></div>
          {shipping > 0 && <p className="mb-5 text-xs leading-5 text-primary/60">Add ${(75 - subtotal).toFixed(2)} more for complimentary shipping.</p>}
          <Link href="/checkout" className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="link-checkout">Continue to checkout <ArrowRight className="h-4 w-4" /></Link>
        </aside>
      </div>
    </div>
  );
}