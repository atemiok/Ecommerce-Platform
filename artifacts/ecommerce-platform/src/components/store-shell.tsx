import { useState } from 'react';
import type { FormEvent, PropsWithChildren } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/hooks/use-cart';
import { formatKes } from '@/lib/format';

const whatsapp = 'https://wa.me/254714075180';
const wa = (message: string) => `${whatsapp}?text=${encodeURIComponent(message)}`;

function BagIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>;
}

export function StoreShell({ children }: PropsWithChildren) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const links = [{ href: '/shop', label: 'Shop' }, { href: '/contact', label: 'Contact' }, { href: '/about', label: 'About Us' }];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocation(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : '/shop');
    setMenuOpen(false);
  };

  return (
    <div className="page-shell">
      <nav className="floating-nav" aria-label="Main navigation">
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" data-testid="button-mobile-menu"><i /><i /></button>
        <div className="nav-left">
          <Link className="logo" href="/" aria-label="iLonito home" data-testid="link-home">ILONITO</Link>
          <ul>{links.map((link) => <li key={link.href}><Link className={location === link.href ? 'active' : ''} href={link.href} data-testid={`link-${link.label.toLowerCase().replace(' ', '-')}`}>{location === link.href && <i />}{link.label}</Link></li>)}</ul>
        </div>
        <div className="nav-actions">
          <a className="nav-enquire" href={wa('Hello iLonito, I would like to enquire about your leather collection.')} target="_blank" rel="noreferrer">Enquire</a>
          <button className="nav-bag" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag with ${itemCount} items`} data-testid="button-open-cart"><BagIcon /><span>{itemCount}</span></button>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <button onClick={() => setMenuOpen(false)} aria-label="Close menu">×</button>
        <p>ILONITO</p>
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}
        <Link href="/cart" onClick={() => setMenuOpen(false)}>Your bag ({itemCount})</Link>
        <a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a>
      </div>

      <main>{children}</main>

      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`} aria-hidden={!cartOpen} aria-label="Shopping bag">
        <div className="cart-head"><div><p>Your bag</p><span>{itemCount} {itemCount === 1 ? 'piece' : 'pieces'}</span></div><button onClick={() => setCartOpen(false)} aria-label="Close shopping bag">×</button></div>
        {items.length ? <><div className="cart-lines">{items.map(({ product, quantity }) => <article key={product.id} data-testid={`drawer-item-${product.id}`}><img src={product.imageUrl} alt={product.name} /><div><span>{product.category}</span><h2>{product.name}</h2><strong>{formatKes(product.price)}</strong><div className="cart-quantity"><button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={`Remove one ${product.name}`}>−</button><span>{quantity}</span><button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={`Add one ${product.name}`}>+</button></div></div><button className="cart-remove" onClick={() => removeItem(product.id)}>Remove</button></article>)}</div><div className="cart-foot"><div><span>Subtotal</span><strong>{formatKes(subtotal)}</strong></div><p>Delivery is arranged separately after payment.</p><Link href="/checkout" onClick={() => setCartOpen(false)} data-testid="link-drawer-checkout">Checkout <span>→</span></Link><button onClick={() => setCartOpen(false)}>Continue shopping</button></div></> : <div className="cart-empty"><p>Your bag is empty.</p><span>Choose a handcrafted piece to begin.</span><Link href="/shop" onClick={() => setCartOpen(false)}>Explore the shop</Link></div>}
      </aside>
      {cartOpen && <button className="cart-shade" onClick={() => setCartOpen(false)} aria-label="Close shopping bag" />}

      <footer>
        <div className="container">
          <div className="footer-wordmark"><h2>ILONITO</h2><p>Narok · Kenya · Worldwide Requests</p></div>
          <div className="footer-grid">
            <div><h4>Atelier</h4><Link href="/shop">Shop all</Link><Link href="/shop?category=Handbags">Handbags</Link><a href={wa('Hello iLonito, I would like a bespoke piece.')} target="_blank" rel="noreferrer">Bespoke</a></div>
            <div><h4>Maison</h4><Link href="/about">Our Story</Link><a href="/about#craft">Craftsmanship</a><a href="/about#care">Care Guide</a></div>
            <div><h4>Client Care</h4><Link href="/contact">Contact</Link><a href="/contact#shipping">Shipping</a><a href="tel:+254714075180">Call the atelier</a></div>
            <div><h4>Newsletter</h4><form onSubmit={(event) => { event.preventDefault(); }}><input aria-label="Email for newsletter" placeholder="YOUR EMAIL" type="email" required /><button type="submit">→</button></form><p>Subscribe for private drops.</p></div>
          </div>
          <div className="footer-bottom"><p>© {new Date().getFullYear()} iLonito Designer Collections. Narok, Kenya.</p><div><a href="mailto:ilonito@outlook.com">Email</a><a href="tel:+254714075180">Phone</a><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer">Instagram</a></div></div>
        </div>
      </footer>
    </div>
  );
}