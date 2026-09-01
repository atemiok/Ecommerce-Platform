import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useCreateOrder } from '@workspace/api-client-react';
import { useCart } from '@/hooks/use-cart';
import { formatKes } from '@/lib/format';

type PaymentMethod = 'mpesa' | 'card';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [formError, setFormError] = useState('');
  const createOrder = useCreateOrder();
  const total = subtotal;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const address = String(form.get('address') ?? '').trim();
    if (!name || !email || !phone || !address) {
      setFormError('Please fill in all your contact and delivery details.');
      return;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setFormError('');
    createOrder.mutate({ data: { customerName: name, email: email.toLowerCase(), shippingAddress: `${address}\nPhone: ${phone}\nPayment preference: ${method === 'mpesa' ? 'M-Pesa' : 'Card'}`, items: items.map((line) => ({ productId: line.product.id, quantity: line.quantity })) } }, {
      onSuccess: (order) => {
        clearCart();
        setLocation(`/order-success/${order.id}`);
      },
    });
  };

  if (!items.length && !createOrder.isSuccess) return <section className="checkout-empty"><p className="quiet-label">Your bag</p><h1>Nothing to check out yet.</h1><p>Choose a handcrafted leather piece, then return here to complete your order.</p><Link href="/shop">Explore the shop <span>→</span></Link></section>;

  return <section className="checkout-page">
    <header className="checkout-heading"><p>Secure checkout</p><h1>Complete your order</h1><span>Delivery details, then your preferred payment method.</span></header>
    <div className="checkout-layout">
      <div className="payment-panel">
        <form onSubmit={submit} noValidate>
          <section className="checkout-section"><div className="checkout-section-title"><span>01</span><div><h2>Contact & delivery</h2><p>Where should we send your order details?</p></div></div><div className="checkout-fields"><label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" data-testid="input-customer-name" /></label><label>Phone number<input name="phone" inputMode="tel" autoComplete="tel" required placeholder="0712 345 678" data-testid="input-customer-phone" /></label><label>Email <span>Required for order confirmation</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" data-testid="input-customer-email" /></label><label>Delivery address<textarea name="address" autoComplete="street-address" required rows={3} placeholder="Building, street, area and town" data-testid="input-shipping-address" /></label></div></section>
          <section className="checkout-section"><div className="checkout-section-title"><span>02</span><div><h2>Payment preference</h2><p>Choose how you would like the iLonito team to confirm payment.</p></div></div><div className="payment-options" role="group" aria-label="Payment method"><button type="button" className={method === 'mpesa' ? 'selected' : ''} onClick={() => setMethod('mpesa')}><b className="mpesa-mark">M-PESA</b><span><strong>Lipa na M-Pesa</strong><small>Receive a prompt on your Safaricom phone</small></span><i /></button><button type="button" className={method === 'card' ? 'selected' : ''} onClick={() => setMethod('card')}><b className="card-mark">VISA<br />CARD</b><span><strong>Pay with card</strong><small>We will share the secure payment link</small></span><i /></button></div><button className={`checkout-pay ${method}`} disabled={createOrder.isPending} data-testid="button-place-order">{createOrder.isPending ? 'Sending your order…' : `Submit order · ${formatKes(total)}`}<span>→</span></button>{formError && <p className="payment-error" role="alert" data-testid="status-checkout-error">{formError}</p>}{createOrder.isError && <p className="payment-error" role="alert" data-testid="status-order-error">We could not place that order. Please check your details and try again.</p>}<small className="payment-note">Your payment preference is sent to our team. Never share your M-Pesa PIN or card security code.</small></section>
        </form>
        <div className="checkout-help"><span>Need help with your order?</span><a href="https://wa.me/254714075180?text=Hello%20iLonito%2C%20I%20need%20help%20completing%20my%20order." target="_blank" rel="noreferrer">Talk to us on WhatsApp ↗</a></div>
      </div>
      <aside className="order-summary"><div className="summary-head"><h2>Your order</h2><Link href="/shop">Continue shopping</Link></div><div className="summary-lines">{items.map(({ product, quantity }) => <article key={product.id}><img src={product.imageUrl} alt={product.name} /><div><span>{product.category}</span><h3>{product.name}</h3><p>Quantity {quantity}</p></div><strong>{formatKes(product.price * quantity)}</strong></article>)}</div><dl><div><dt>Subtotal</dt><dd>{formatKes(subtotal)}</dd></div><div><dt>Delivery</dt><dd>Arranged after order</dd></div><div><dt>Total</dt><dd>{formatKes(total)}</dd></div></dl><p>Handmade in Kenya. Your order and delivery details will be confirmed directly by iLonito.</p></aside>
    </div>
  </section>;
}