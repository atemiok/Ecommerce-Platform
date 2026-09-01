import { useState } from 'react';
import type { FormEvent } from 'react';

const whatsapp = 'https://wa.me/254714075180';
const wa = (message: string) => `${whatsapp}?text=${encodeURIComponent(message)}`;

export default function Contact() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.open(wa(`Hello iLonito, my name is ${name}. ${message}`), '_blank', 'noopener,noreferrer');
  };
  return <div>
    <section className="contact-hero"><p className="gold-label">Contact us</p><h1>Talk to<br />our team.</h1><p>Ask about a bag, a custom order, a gift or delivery.</p></section>
    <section className="contact-grid"><div><p className="quiet-label">Contact</p><h2>We are here<br />to help.</h2><div className="contact-details"><a href="tel:+254714075180"><span>Phone and WhatsApp</span><strong>+254 714 075 180</strong></a><a href="mailto:ilonito@outlook.com"><span>Email</span><strong>ilonito@outlook.com</strong></a><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer"><span>Instagram</span><strong>@ilonito_designer_collections</strong></a><div><span>Visit us</span><strong>1st Floor, Ol Talet Mall<br />Narok Town, Kenya</strong></div></div></div><form onSubmit={send}><label>Your name<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="Name" /></label><label>Your message<textarea value={message} onChange={(event) => setMessage(event.target.value)} required placeholder="Tell us what you need" rows={6} /></label><button type="submit">Open WhatsApp <span>↗</span></button><small>We will open your message in WhatsApp.</small></form></section>
    <section className="shipping-band" id="shipping"><div><p className="gold-label">Delivery</p><h2>Made in Kenya.<br />Sent worldwide.</h2></div><div><article><span>Kenya</span><p>We arrange delivery with you. We confirm the time and cost before you order.</p></article><article><span>Other countries</span><p>International shipping is available on request. Local taxes or duties may apply.</p></article></div></section>
  </div>;
}