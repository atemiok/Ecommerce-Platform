import { Link } from 'wouter';
import { useListCategories, useListProducts } from '@workspace/api-client-react';

const whatsapp = 'https://wa.me/254714075180';
const wa = (message: string) => `${whatsapp}?text=${encodeURIComponent(message)}`;
const money = (amount: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);

const categoryImages = [
  { no: '01', name: 'Handbags', image: '/source-assets/product-nia.png' },
  { no: '02', name: 'Travel', image: '/source-assets/product-zuri.png' },
  { no: '03', name: 'Office', image: '/source-assets/product-amani.png' },
  { no: '04', name: 'Accessories', image: '/source-assets/craft.png' },
];

function HomeProductCard({ product }: { product: { id: number; name: string; price: number; imageUrl: string; description: string } }) {
  return (
    <Link className="product-card" href={`/product/${product.id}`} data-testid={`link-home-product-${product.id}`}>
      <div className="product-photo"><img src={product.imageUrl} alt={product.name} /><i /></div>
      <h3>{product.name}</h3>
      <p>{money(product.price)}</p>
      <small>{product.description}</small>
    </Link>
  );
}

export default function Home() {
  const productsQuery = useListProducts();
  const categoriesQuery = useListCategories();
  const products = productsQuery.data ?? [];
  const featured = products.filter((product) => product.featured);
  const release = (featured.length ? featured : products).slice(0, 4);
  const categories = categoriesQuery.data?.length
    ? categoriesQuery.data.slice(0, 4).map((category, index) => ({ ...categoryImages[index % categoryImages.length], name: category.name }))
    : categoryImages;

  return (
    <div>
      <header className="hero" id="top">
        <img src="/source-assets/hero.png" alt="Model holding a structured iLonito leather tote bag" />
        <div className="hero-overlay" />
        <div className="hero-inner"><div className="hero-copy">
          <p className="gold-label">Kenyan leather brand</p>
          <h1>Leather bags,<br />made in Kenya.</h1>
          <p className="hero-subtitle">Bold design. Skilled hands. Made to last.</p>
          <Link className="pill-button" href="/shop">Shop now <span>›</span></Link>
        </div></div>
      </header>

      <div className="marquee" aria-label="Narok Atelier — Handcrafted in Kenya — African Luxury">
        <div className="marquee-track">
          <span className="marquee-set">
            <strong>Narok Atelier</strong>
            <i>Handcrafted in Kenya</i>
            <em>African Luxury</em>
          </span>
          <span className="marquee-set" aria-hidden="true">
            <strong>Narok Atelier</strong>
            <i>Handcrafted in Kenya</i>
            <em>African Luxury</em>
          </span>
        </div>
      </div>

      <section className="collections">
        <div className="container">
          <div className="section-heading"><div><p className="quiet-label">Latest release</p><h2>New Collection</h2></div><Link className="micro-link" href="/shop">View Catalogue</Link></div>
          {productsQuery.isLoading ? <div className="product-grid">{[1, 2, 3, 4].map((item) => <div className="product-card placeholder-card" key={item}><div className="product-photo" /></div>)}</div> : <div className="product-grid">{release.map((product) => <HomeProductCard key={product.id} product={product} />)}</div>}
        </div>
      </section>

      <section className="category-band"><div className="category-grid">
        {categories.map((category, index) => <Link className="category-card" href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}><img src={category.image} alt={category.name} /><div><span>{String(index + 1).padStart(2, '0')}</span><h3>{category.name}</h3></div></Link>)}
         <Link className="category-card bespoke-card" href="/custom-order"><span>05</span><h3>Bespoke</h3><p>Custom design service</p></Link>
      </div></section>

      <section className="craft"><div className="craft-grid">
        <div className="process-copy"><p className="gold-label">How we make it</p><h2>Made slowly and with care.</h2><p>We cut, stitch and finish every leather piece in Kenya. We take our time so each bag looks good and lasts.</p><div className="founder-row"><img src="/source-assets/ilonito-brand-card.jpg" alt="iLonito logo" /><div><strong>Dr. Elizabeth Sanangoi</strong><span>Founder</span></div><Link href="/about">Our story</Link></div></div>
        <div className="process-list"><article><img src="/source-assets/craft.png" alt="Leather craft close-up" /><div><h4>Good leather</h4><p>We choose leather that feels good and works well for daily use.</p></div></article><article><img src="/source-assets/product-amani.png" alt="Hand-finished leather piece" /><div><h4>Finished by hand</h4><p>Careful work gives every piece its own character.</p></div></article></div>
        <Link className="atelier-card" href="/shop"><img src="/source-assets/product-zuri.png" alt="iLonito leather bag" /><i /><div><span>View the collection</span><h4>Leather with presence</h4></div></Link>
      </div></section>

      <section className="journal-section"><div className="journal-grid">
        <div><div className="journal-title"><h2>Leather care</h2><Link href="/about#care">Read more</Link></div><div className="journal-list"><Link href="/about#care"><article><img src="/source-assets/product-amani.png" alt="Leather texture" /><div><p>Care guide</p><h4>Help your leather age well</h4></div></article></Link><Link href="/about"><article><img src="/source-assets/ilonito-award-team.jpeg" alt="iLonito team" /><div><p>Our story</p><h4>Made in Kenya</h4></div></article></Link></div></div>
        <div className="concierge"><div className="concierge-head"><div><p>Need help?</p><h2>Talk to us</h2></div><div className="live"><span>Status</span><strong>Available now</strong></div></div><p>Ask us about bags, custom orders, gifts or delivery on WhatsApp.</p><a className="concierge-button" href={wa('Hello iLonito, I would like help choosing or ordering a leather piece.')} target="_blank" rel="noreferrer">Chat on WhatsApp</a><div className="delivery-facts"><div><span>Kenya</span><strong>We arrange delivery</strong></div><div><span>Outside Kenya</span><strong>Shipping on request</strong></div></div><b>✦</b></div>
      </div></section>

      <section className="instagram-section"><div><p className="quiet-label">Follow our work</p><h2>See iLonito on Instagram</h2><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer">@ilonito_designer_collections ↗</a></div><div className="instagram-grid"><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer"><img src="/source-assets/ilonito-award-team.jpeg" alt="iLonito leather collection" /><span>View work ↗</span></a><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer"><img src="/source-assets/product-nia.png" alt="iLonito handcrafted leather" /><span>View work ↗</span></a><a href="https://www.instagram.com/ilonito_designer_collections" target="_blank" rel="noreferrer"><img src="/source-assets/ilonito-award.jpeg" alt="iLonito team" /><span>View work ↗</span></a></div></section>
    </div>
  );
}