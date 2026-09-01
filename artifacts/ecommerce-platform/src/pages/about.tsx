import { Link } from 'wouter';

const whatsapp = 'https://wa.me/254714075180';
const wa = (message: string) => `${whatsapp}?text=${encodeURIComponent(message)}`;

export default function About() {
  return <div>
    <header className="story-hero"><img src="/source-assets/craft.png" alt="Leather artisan at work" /><div><p className="gold-label">Our story</p><h1>Kenyan leather,<br />made to last.</h1></div></header>
    <section className="story-intro"><p className="quiet-label">About iLonito</p><div><h2>We make bags with care.</h2><p>Dr. Elizabeth Sanangoi founded iLonito Designer Collections. For more than seven years, the brand has made leather bags and accessories in Kenya.</p><p>iLonito is based in Narok. Our work brings Kenyan culture, useful design and skilled leather craft together.</p></div><img className="story-logo" src="/source-assets/ilonito-brand-card.jpg" alt="iLonito Designer Leather Collections logo" /></section>
    <section className="story-craft" id="craft"><img src="/source-assets/product-nia.png" alt="Leather craft and finished hide" /><div><p className="gold-label">How we work</p><h2>Good work takes time.</h2><p>We choose the leather, cut it, put each piece together and finish it by hand. Small differences show that a real person made your bag.</p><ol><li><span>01</span>Choose good leather</li><li><span>02</span>Build a strong bag</li><li><span>03</span>Finish it by hand</li></ol><Link className="pill-button" href="/shop">Shop our bags</Link></div></section>
    <section className="care-section" id="care"><p className="quiet-label">Leather care</p><h2>Help your bag last longer.</h2><div><article><b>Keep it dry</b><p>If it gets wet, wipe it gently and let it dry away from heat.</p></article><article><b>Store it well</b><p>Fill the bag lightly so it keeps its shape. Store it in a cloth bag.</p></article><article><b>Let it change</b><p>Real leather changes colour and texture over time. This is normal.</p></article></div><a className="micro-link" href={wa('Hello iLonito, I need help caring for my leather piece.')} target="_blank" rel="noreferrer">Ask us</a></section>
  </div>;
}