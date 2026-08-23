import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { useCreateOrder } from '@workspace/api-client-react';
import { useCart } from '@/hooks/use-cart';
import { formatKes } from '@/lib/format';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [formError, setFormError] = useState('');
  const createOrder = useCreateOrder();
  const shipping = subtotal >= 25000 ? 0 : 800;
  const total = subtotal + shipping;

  if (!items.length && !createOrder.isSuccess) return <div className="page-shell flex min-h-[65vh] items-center justify-center py-20 text-center" data-testid="status-checkout-empty"><div><p className="font-display text-6xl">Your bag is empty.</p><p className="mt-3 text-sm text-muted-foreground">There is nothing to check out just yet.</p><Link href="/shop" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground" data-testid="link-checkout-shop">Return to the shop</Link></div></div>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerName.trim() || !email.trim() || !shippingAddress.trim()) {
      setFormError('Please fill in all the details so we know where to send your order.');
      return;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError('');
    createOrder.mutate({ data: { customerName: customerName.trim(), email: email.trim(), shippingAddress: shippingAddress.trim(), items: items.map((line) => ({ productId: line.product.id, quantity: line.quantity })) } }, {
      onSuccess: (order) => {
        clearCart();
        setLocation(`/order-success/${order.id}`);
      },
    });
  };

  return (
    <div className="page-shell py-10 md:py-16">
      <Link href="/cart" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" data-testid="link-checkout-back"><ArrowLeft className="h-3.5 w-3.5" /> Back to bag</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
        <div>
          <p className="mb-4 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Checkout / Almost there</p>
          <h1 className="font-display text-6xl leading-[.86] md:text-8xl">Make it yours.</h1>
          <form onSubmit={submit} className="mt-12 max-w-xl" noValidate>
            <div className="grid gap-7">
              <label className="grid gap-2"><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Your name</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent" placeholder="First and last name" autoComplete="name" data-testid="input-customer-name" /></label>
              <label className="grid gap-2"><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent" placeholder="you@example.com" autoComplete="email" data-testid="input-customer-email" /></label>
              <label className="grid gap-2"><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Shipping address</span><textarea value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} className="min-h-24 resize-y border-b border-border bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent" placeholder="Street, city, region, postal code" autoComplete="street-address" data-testid="input-shipping-address" /></label>
            </div>
            {formError && <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert" data-testid="status-checkout-error">{formError}</p>}
            {createOrder.isError && <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert" data-testid="status-order-error">We couldn't place that order. Please check your details and try again.</p>}
            <button type="submit" disabled={createOrder.isPending} className="mt-9 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" data-testid="button-place-order">{createOrder.isPending ? 'Sending your order…' : <>Submit your order <ArrowRight className="h-4 w-4" /></>}</button>
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" /> We’ll confirm delivery and payment with you directly.</p>
          </form>
        </div>
        <aside className="h-fit rounded-[1.25rem] bg-secondary p-6 md:p-7">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary/60">In your bag</p>
          <div className="mt-6 grid gap-4">{items.map((line) => <div key={line.product.id} className="flex gap-3" data-testid={`summary-item-${line.product.id}`}><div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted"><img src={line.product.imageUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm">{line.product.name}</p><p className="mt-1 font-mono-ui text-[10px] text-primary/55">Qty {line.quantity}</p></div><span className="font-mono-ui text-xs">{formatKes(line.product.price * line.quantity)}</span></div>)}</div>
          <div className="mt-7 grid gap-3 border-t border-primary/15 pt-6 text-sm"><div className="flex justify-between"><span className="text-primary/60">Subtotal</span><span className="font-mono-ui">{formatKes(subtotal)}</span></div><div className="flex justify-between"><span className="text-primary/60">Kenya delivery</span><span className="font-mono-ui">{shipping ? formatKes(shipping) : 'Complimentary'}</span></div><div className="mt-2 flex justify-between border-t border-primary/15 pt-4 font-medium"><span>Total</span><span className="font-mono-ui" data-testid="text-checkout-total">{formatKes(total)}</span></div></div>
          <p className="mt-6 flex items-center gap-2 text-xs text-primary/60"><Check className="h-3.5 w-3.5" /> Local delivery and international shipping available</p>
        </aside>
      </div>
    </div>
  );
}