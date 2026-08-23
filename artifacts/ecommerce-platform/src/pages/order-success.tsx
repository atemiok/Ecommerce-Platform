import { Link, useParams } from 'wouter';
import { ArrowRight, Check, Package, Sparkles } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center py-20">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[1.6rem] bg-primary px-7 py-14 text-center text-primary-foreground md:px-16 md:py-20" data-testid="status-order-success">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[25px] border-secondary/20" />
        <div className="absolute -bottom-28 -left-14 h-64 w-64 rounded-full border border-secondary/20" />
        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary"><Check className="h-7 w-7" /></div>
          <p className="mt-7 flex items-center justify-center gap-2 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-secondary"><Sparkles className="h-3 w-3" /> Order received</p>
          <h1 className="mt-5 font-display text-6xl leading-[.85] md:text-8xl">Thank you<br /><em>for choosing iLonito.</em></h1>
          <p className="mx-auto mt-7 max-w-sm text-sm leading-6 text-primary-foreground/65">Your order is confirmed. We’ll contact you with payment and delivery details shortly.</p>
          <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-primary-foreground/20 px-4 py-2 font-mono-ui text-[10px] uppercase tracking-[0.14em]" data-testid="text-order-id"><Package className="h-3.5 w-3.5 text-secondary" /> Order #{id}</div>
          <Link href="/shop" className="mt-10 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm text-primary transition-transform hover:-translate-y-0.5" data-testid="link-success-shop">Return to the collection <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}