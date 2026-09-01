import { useState } from 'react';
import type { FormEvent } from 'react';

const whatsapp = 'https://wa.me/254714075180';
const email = 'ilonito@outlook.com';
const wa = (message: string) => `${whatsapp}?text=${encodeURIComponent(message)}`;

export default function CustomOrder() {
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [sent, setSent] = useState(false);

  const sendRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? '').trim();
    const message = [
      'Hello iLonito, I would like to request a custom piece.',
      '',
      `Name: ${value('name')}`,
      `Phone: ${value('phone')}`,
      `Email: ${value('email') || 'Not provided'}`,
      `Piece: ${value('itemType')}`,
      `Quantity: ${value('quantity')}`,
      `What I would like: ${value('request')}`,
      `Dimensions: ${value('length') || '—'} L × ${value('height') || '—'} H × ${value('width') || '—'} W cm`,
      `Colour or finish: ${value('finish') || 'Open to suggestions'}`,
      `Needed by: ${value('neededBy') || 'Flexible'}`,
      `Delivery location: ${value('deliveryLocation')}`,
    ].join('\n');

    if (contactMethod === 'email') {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent('Custom order enquiry')}&body=${encodeURIComponent(message)}`;
    } else {
      window.open(wa(message), '_blank', 'noopener,noreferrer');
    }
    setSent(true);
  };

  return (
    <div className="custom-order-page">
      <header className="custom-order-hero">
        <div>
          <p className="gold-label">Bespoke service</p>
          <h1>Make it<br /><em>yours.</em></h1>
          <p>Tell us what you have in mind. We will listen, advise on the leather, and come back to you with the next steps.</p>
        </div>
        <img src="/source-assets/craft.png" alt="Leather artisan working on a custom piece" />
      </header>

      <section className="custom-order-layout">
        <div className="custom-order-intro">
          <p className="quiet-label">Your brief</p>
          <h2>Start with an idea.</h2>
          <p>Whether you know the exact size or are still exploring, share as much as you can. A sketch, a reference, or a few words are all welcome.</p>
          <div className="custom-order-notes">
            <div><span>01</span><p>Describe the piece and how you plan to use it.</p></div>
            <div><span>02</span><p>Add measurements if you have them. We can help refine them.</p></div>
            <div><span>03</span><p>We will contact you to confirm materials, price and delivery.</p></div>
          </div>
        </div>

        <form className="custom-order-form" onSubmit={sendRequest}>
          <div className="custom-order-section">
            <p className="custom-order-section-label">About you</p>
            <div className="custom-order-fields">
              <label>Full name<input name="name" required autoComplete="name" placeholder="Your name" /></label>
              <label>Phone number<input name="phone" required inputMode="tel" autoComplete="tel" placeholder="+254 7…" /></label>
              <label>Email <span>Optional</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
              <label>Delivery location<input name="deliveryLocation" required placeholder="Town or country" /></label>
            </div>
          </div>

          <div className="custom-order-section">
            <p className="custom-order-section-label">The piece</p>
            <div className="custom-order-fields">
              <label>What are you making?<select name="itemType" defaultValue="Bag"><option>Bag</option><option>Wallet or purse</option><option>Shoes</option><option>Belt</option><option>Journal</option><option>Homeware</option><option>Something else</option></select></label>
              <label>Quantity<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
              <label className="custom-order-wide">Tell us what you want<textarea name="request" required rows={5} placeholder="For example: a structured everyday bag that fits a 14-inch laptop, with a long strap and two inside pockets." /></label>
            </div>
          </div>

          <div className="custom-order-section">
            <p className="custom-order-section-label">Details, if known</p>
            <div className="custom-order-fields custom-order-dimensions">
              <label>Length <span>cm</span><input name="length" type="number" min="0" step="0.1" placeholder="e.g. 36" /></label>
              <label>Height <span>cm</span><input name="height" type="number" min="0" step="0.1" placeholder="e.g. 28" /></label>
              <label>Width <span>cm</span><input name="width" type="number" min="0" step="0.1" placeholder="e.g. 12" /></label>
              <label>Colour or finish<input name="finish" placeholder="e.g. Dark brown, natural edge" /></label>
              <label>When do you need it?<input name="neededBy" type="date" /></label>
            </div>
          </div>

          <div className="custom-order-submit">
            <label>How should we contact you?<select value={contactMethod} onChange={(event) => setContactMethod(event.target.value as 'whatsapp' | 'email')}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></label>
            <button type="submit">{contactMethod === 'whatsapp' ? 'Send request on WhatsApp' : 'Send request by email'} <span>↗</span></button>
            <small>We will review your brief and contact you to discuss the design, price and timing.</small>
          </div>
          {sent && <p className="custom-order-success" role="status">Your request is ready. We will be in touch shortly.</p>}
        </form>
      </section>

      <section className="custom-order-contact">
        <p className="gold-label">Prefer to talk first?</p>
        <h2>Call or message the atelier.</h2>
        <a href={wa('Hello iLonito, I would like to discuss a custom order.')} target="_blank" rel="noreferrer">WhatsApp +254 714 075 180 ↗</a>
        <a href={`mailto:${email}`}>ilonito@outlook.com ↗</a>
      </section>
    </div>
  );
}