import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth, useClerk } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AdminOrderStatusInputStatus,
  getListAdminOrdersQueryKey,
  getListAdminProductsQueryKey,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useGetAdminSummary,
  useListAdminOrders,
  useListAdminProducts,
  useUpdateAdminOrderStatus,
  useUpdateAdminProduct,
} from '@workspace/api-client-react';
import type { AdminOrder, AdminProduct, AdminProductInput, AdminSummary, AdminOrderStatusInput } from '@workspace/api-client-react';
import {
  Archive,
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleAlert,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { formatKes } from '@/lib/format';

type View = 'overview' | 'catalog' | 'orders';
type ProductDraft = AdminProductInput;

const statuses = Object.values(AdminOrderStatusInputStatus);
const categories = ['All categories', 'Bags', 'Wallets', 'Shoes', 'Belts', 'Coasters', 'Beadwork', 'Journals'];

const emptyDraft: ProductDraft = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  compareAtPrice: null,
  category: 'Handbags',
  imageUrl: '',
  rating: 0,
  reviewCount: 0,
  stockQuantity: 0,
  inStock: true,
  featured: false,
  badge: null,
};

function IconButton({ label, children, onClick, className = '' }: { label: string; children: React.ReactNode; onClick: () => void; className?: string }) {
  return <button type="button" className={`admin-icon-button ${className}`} aria-label={label} data-testid={`button-${label.toLowerCase().replaceAll(' ', '-')}`} onClick={onClick}>{children}</button>;
}

function StatusPill({ status }: { status: string }) {
  return <span className={`admin-status status-${status}`} data-testid={`status-order-${status}`}>{status}</span>;
}

function AdminSkeleton() {
  return <div className="admin-skeleton-page" aria-label="Loading admin workspace"><div className="admin-skeleton-sidebar" /><div className="admin-skeleton-main"><span /><span /><div /><div /><div /></div></div>;
}

function ProductModal({ product, onClose, onSaved }: { product: AdminProduct | null; onClose: () => void; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const create = useCreateAdminProduct();
  const update = useUpdateAdminProduct();
  const [draft, setDraft] = useState<ProductDraft>(() => product ? {
    name: product.name, slug: product.slug, description: product.description, price: product.price,
    compareAtPrice: product.compareAtPrice ?? null, category: product.category, imageUrl: product.imageUrl,
    rating: product.rating, reviewCount: product.reviewCount, stockQuantity: product.stockQuantity,
    inStock: product.inStock, featured: product.featured, badge: product.badge ?? null,
  } : emptyDraft);
  const saving = create.isPending || update.isPending;
  const updateField = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { ...draft, price: Number(draft.price), compareAtPrice: draft.compareAtPrice === null ? null : Number(draft.compareAtPrice), stockQuantity: Number(draft.stockQuantity), rating: Number(draft.rating || 0), reviewCount: Number(draft.reviewCount || 0) };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/summary'] });
      onSaved();
    };
    if (product) update.mutate({ id: product.id, data: payload }, { onSuccess });
    else create.mutate({ data: payload }, { onSuccess });
  };

  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
      <div className="admin-modal-header"><div><p className="admin-kicker">{product ? 'Catalog edit' : 'New addition'}</p><h2 id="product-form-title">{product ? 'Refine product' : 'Add a product'}</h2></div><IconButton label="Close product editor" onClick={onClose}><X size={18} /></IconButton></div>
      <form onSubmit={submit} className="admin-form">
        <div className="admin-form-grid">
          <label>Product name<input required value={draft.name} onChange={(event) => updateField('name', event.target.value)} data-testid="input-product-name" /></label>
          <label>Slug<input required value={draft.slug} onChange={(event) => updateField('slug', event.target.value)} data-testid="input-product-slug" /></label>
          <label>Price (KES)<input required min="0" type="number" value={draft.price} onChange={(event) => updateField('price', Number(event.target.value))} data-testid="input-product-price" /></label>
          <label>Compare-at price<input min="0" type="number" value={draft.compareAtPrice ?? ''} onChange={(event) => updateField('compareAtPrice', event.target.value === '' ? null : Number(event.target.value))} data-testid="input-product-compare-price" /></label>
           <label>Category<input required list="admin-category-options" value={draft.category} onChange={(event) => updateField('category', event.target.value)} data-testid="input-product-category" /><datalist id="admin-category-options">{categories.slice(1).map((category) => <option key={category} value={category} />)}</datalist></label>
          <label>Badge<input value={draft.badge ?? ''} placeholder="e.g. New arrival" onChange={(event) => updateField('badge', event.target.value || null)} data-testid="input-product-badge" /></label>
          <label>Stock quantity<input required min="0" type="number" value={draft.stockQuantity} onChange={(event) => updateField('stockQuantity', Number(event.target.value))} data-testid="input-product-stock" /></label>
          <label>Image URL<input required type="url" value={draft.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} data-testid="input-product-image" /></label>
        </div>
        <label>Description<textarea required rows={4} value={draft.description} onChange={(event) => updateField('description', event.target.value)} data-testid="input-product-description" /></label>
        <div className="admin-checks">
          <label className="admin-check"><input type="checkbox" checked={draft.inStock} onChange={(event) => updateField('inStock', event.target.checked)} data-testid="checkbox-product-in-stock" /><span>Available to purchase</span></label>
          <label className="admin-check"><input type="checkbox" checked={draft.featured} onChange={(event) => updateField('featured', event.target.checked)} data-testid="checkbox-product-featured" /><span>Feature in collection</span></label>
        </div>
        {(create.isError || update.isError) && <p className="admin-form-error" data-testid="status-product-error">We could not save this product. Check the fields and try again.</p>}
        <div className="admin-modal-actions"><button type="button" className="admin-button admin-button-quiet" onClick={onClose} data-testid="button-cancel-product">Cancel</button><button type="submit" className="admin-button admin-button-primary" disabled={saving} data-testid="button-save-product">{saving ? 'Saving…' : product ? 'Save changes' : 'Create product'}<ArrowUpRight size={15} /></button></div>
      </form>
    </section>
  </div>;
}

function Overview({ summary, orders, onViewOrders }: { summary: AdminSummary; orders: AdminOrder[]; onViewOrders: () => void }) {
  const revenue = summary.revenue ?? 0;
  return <div className="admin-content">
    <div className="admin-page-intro animate-rise"><div><p className="admin-kicker">Monday, 14 October 2024</p><h1>Good morning, <em>atelier.</em></h1><p className="admin-intro-copy">A measured view of what needs your attention across iLonito today.</p></div><button className="admin-button admin-button-outline" onClick={onViewOrders} data-testid="button-review-orders">Review orders <ArrowUpRight size={15} /></button></div>
    <div className="admin-metric-grid animate-rise">
      <article className="admin-metric-card admin-metric-featured"><div className="metric-top"><span>Gross revenue</span><ArrowUpRight size={15} /></div><strong>{formatKes(revenue)}</strong><small>All time order value</small><div className="metric-rule" /></article>
      <article className="admin-metric-card"><div className="metric-top"><span>Catalog</span><Package size={15} /></div><strong>{summary.totalProducts}</strong><small>Products in the collection</small><div className="metric-detail"><b>{summary.inStockProducts}</b> available <span>·</span> <b>{summary.lowStockProducts}</b> low stock</div></article>
      <article className="admin-metric-card"><div className="metric-top"><span>Orders to tend</span><ClipboardList size={15} /></div><strong>{summary.pendingOrders}</strong><small>Awaiting a next step</small><div className="metric-detail attention"><CircleAlert size={14} /> Needs a look today</div></article>
    </div>
    <div className="admin-overview-grid animate-rise">
      <section className="admin-panel admin-recent-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Live queue</p><h2>Recent orders</h2></div><button className="admin-text-button" onClick={onViewOrders} data-testid="button-view-all-orders">View all <ArrowUpRight size={14} /></button></div>{orders.length ? <div className="admin-order-list">{orders.slice(0, 5).map((order) => <button className="admin-order-row" key={order.id} onClick={onViewOrders} data-testid={`button-recent-order-${order.id}`}><span className="order-number">#{String(order.id).padStart(4, '0')}</span><span className="order-customer"><b>{order.customerName}</b><small>{order.items?.length ?? 0} {(order.items?.length ?? 0) === 1 ? 'piece' : 'pieces'}</small></span><span className="order-total">{formatKes(order.total)}</span><StatusPill status={order.status} /><ChevronDown size={14} className="order-chevron" /></button>)}</div> : <div className="admin-empty"><ClipboardList size={20} /><p>No orders yet</p><span>New customer orders will appear here.</span></div>}</section>
      <section className="admin-panel admin-note-panel"><div className="note-mark"><Sparkles size={18} /></div><p className="admin-kicker">Atelier note</p><h2>Every piece has a paper trail.</h2><p>Keep product details considered and current. Your storefront is a reflection of the hands behind it.</p><div className="note-footer"><span>iLonito / Operations</span><span>01</span></div></section>
    </div>
  </div>;
}

function Catalog({ products, onEdit, onNew }: { products: AdminProduct[]; onEdit: (product: AdminProduct) => void; onNew: () => void }) {
  const queryClient = useQueryClient();
  const archive = useDeleteAdminProduct();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [availability, setAvailability] = useState('All stock');
  const [confirming, setConfirming] = useState<AdminProduct | null>(null);
  const filtered = useMemo(() => products.filter((product) => {
    const textMatch = `${product.name} ${product.slug}`.toLowerCase().includes(query.toLowerCase());
    const categoryMatch = category === 'All categories' || product.category === category;
    const stockMatch = availability === 'All stock' || (availability === 'In stock' ? product.inStock : !product.inStock);
    return textMatch && categoryMatch && stockMatch;
  }), [products, query, category, availability]);
  const archiveProduct = () => {
    if (!confirming) return;
    archive.mutate({ id: confirming.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminProductsQueryKey() }); queryClient.invalidateQueries({ queryKey: ['/api/admin/summary'] }); setConfirming(null); } });
  };
  return <div className="admin-content"><div className="admin-page-intro animate-rise"><div><p className="admin-kicker">The collection</p><h1>Product <em>catalog.</em></h1><p className="admin-intro-copy">Maintain the objects, prices and stories that meet your customers.</p></div><button className="admin-button admin-button-primary" onClick={onNew} data-testid="button-new-product"><Plus size={16} /> Add product</button></div>
    <div className="admin-toolbar animate-rise"><label className="admin-search"><Search size={17} /><input type="search" placeholder="Search products or slugs" value={query} onChange={(event) => setQuery(event.target.value)} data-testid="input-product-search" /></label><div className="admin-select-wrap"><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} data-testid="select-product-filter-category">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><select className="admin-filter-select" value={availability} onChange={(event) => setAvailability(event.target.value)} data-testid="select-product-filter-stock"><option>All stock</option><option>In stock</option><option>Out of stock</option></select><span className="admin-result-count">{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</span></div>
    <section className="admin-panel admin-catalog-panel animate-rise"><div className="admin-table-head"><span>Product</span><span>Price</span><span>Stock</span><span>Placement</span><span /></div>{filtered.length ? <div className="admin-product-table">{filtered.map((product) => <article className="admin-product-row" key={product.id} data-testid={`row-product-${product.id}`}><div className="product-identity"><div className="product-thumb">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <Package size={18} />}</div><div><b>{product.name}</b><small>{product.category} · /{product.slug}</small></div></div><div className="product-price"><b>{formatKes(product.price)}</b>{product.compareAtPrice ? <del>{formatKes(product.compareAtPrice)}</del> : null}</div><div className={`stock-cell ${product.inStock && product.stockQuantity > 0 ? '' : 'stock-low'}`}><span className="stock-dot" /><b>{product.stockQuantity}</b><small>{product.inStock ? 'available' : 'not available'}</small></div><div className="product-placement">{product.featured && <span className="placement-tag"><Sparkles size={12} /> Featured</span>}{product.badge && <span className="placement-badge"><Tag size={12} /> {product.badge}</span>}{!product.featured && !product.badge && <span className="muted-dash">—</span>}</div><div className="row-actions"><IconButton label={`Edit ${product.name}`} onClick={() => onEdit(product)}><ArrowUpRight size={16} /></IconButton><IconButton label={`Archive ${product.name}`} className="danger-action" onClick={() => setConfirming(product)}><Archive size={15} /></IconButton></div></article>)}</div> : <div className="admin-empty admin-empty-large"><Package size={24} /><p>No products match that view</p><span>Try a different search or category.</span></div>}</section>
    {confirming && <div className="admin-confirm-backdrop"><div className="admin-confirm" role="alertdialog" aria-modal="true"><div className="confirm-icon"><Archive size={20} /></div><p className="admin-kicker">Archive product</p><h2>Remove {confirming.name}?</h2><p>This will take the product out of the active catalog. The action can be reversed by your operations team.</p><div className="admin-modal-actions"><button className="admin-button admin-button-quiet" onClick={() => setConfirming(null)} data-testid="button-cancel-archive">Keep product</button><button className="admin-button admin-button-danger" disabled={archive.isPending} onClick={archiveProduct} data-testid="button-confirm-archive">{archive.isPending ? 'Archiving…' : 'Archive product'}</button></div></div></div>}
  </div>;
}

function Orders({ orders }: { orders: AdminOrder[] }) {
  const queryClient = useQueryClient();
  const updateStatus = useUpdateAdminOrderStatus();
  const [selected, setSelected] = useState<AdminOrder | null>(orders[0] ?? null);
  const [filter, setFilter] = useState('All orders');
  const visible = orders.filter((order) => filter === 'All orders' || order.status === filter);
  const changeStatus = (status: string) => {
    if (!selected) return;
    updateStatus.mutate({ id: selected.id, data: { status: status as AdminOrderStatusInput['status'] } }, { onSuccess: (updated) => { setSelected(updated); queryClient.invalidateQueries({ queryKey: getListAdminOrdersQueryKey() }); queryClient.invalidateQueries({ queryKey: ['/api/admin/summary'] }); } });
  };
  return <div className="admin-content"><div className="admin-page-intro animate-rise"><div><p className="admin-kicker">Client care</p><h1>Order <em>desk.</em></h1><p className="admin-intro-copy">A clear handoff from payment to the customer's door.</p></div><div className="admin-orders-summary"><span>{orders.length} total orders</span><span className="summary-divider" /><span>{orders.filter((order) => order.status === 'pending').length} pending</span></div></div>
    <div className={`admin-orders-layout ${selected ? 'has-selection' : ''} animate-rise`}><section className="admin-panel admin-orders-table"><div className="admin-orders-filter"><div className="admin-segmented">{['All orders', ...statuses].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} data-testid={`button-order-filter-${item.replaceAll(' ', '-')}`}>{item}</button>)}</div><button className="admin-icon-button" aria-label="Export orders" data-testid="button-export-orders" onClick={() => window.print()}><ArrowDownToLine size={16} /></button></div>{visible.length ? visible.map((order) => <button className={`admin-order-table-row ${selected?.id === order.id ? 'selected' : ''}`} key={order.id} onClick={() => setSelected(order)} data-testid={`button-order-${order.id}`}><span className="order-number">#{String(order.id).padStart(4, '0')}</span><span><b>{order.customerName}</b><small>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small></span><strong>{formatKes(order.total)}</strong><StatusPill status={order.status} /><ChevronLeft size={15} /></button>) : <div className="admin-empty admin-empty-large"><ClipboardList size={24} /><p>No orders in this view</p><span>Change the filter to see more orders.</span></div>}</section>
      {selected && <aside className="admin-panel admin-order-detail"><div className="detail-top"><div><p className="admin-kicker">Order #{String(selected.id).padStart(4, '0')}</p><h2>{selected.customerName}</h2></div><IconButton label="Close order detail" onClick={() => setSelected(null)}><X size={17} /></IconButton></div><p className="detail-email">{selected.email}</p><div className="detail-section"><span className="detail-label">Fulfilment status</span><div className="status-select"><select value={selected.status} onChange={(event) => changeStatus(event.target.value)} disabled={updateStatus.isPending} data-testid={`select-order-status-${selected.id}`}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><ChevronDown size={14} /></div>{updateStatus.isPending && <small className="saving-note">Updating order…</small>}</div><div className="detail-section"><span className="detail-label">Pieces ordered</span><div className="detail-items">{selected.items?.map((item) => <div className="detail-item" key={item.id}><div><b>{item.productName}</b><span>Qty {item.quantity}</span></div><strong>{formatKes(item.unitPrice * item.quantity)}</strong></div>)}</div><div className="detail-total"><span>Total</span><strong>{formatKes(selected.total)}</strong></div></div><div className="detail-section address-section"><span className="detail-label">Shipping to</span><p>{selected.shippingAddress}</p></div><a className="admin-button admin-button-outline detail-contact" href={`mailto:${selected.email}`} data-testid={`link-email-order-${selected.id}`}>Email customer <ExternalLink size={14} /></a></aside>}</div>
  </div>;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const [view, setView] = useState<View>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productEditor, setProductEditor] = useState<AdminProduct | null | undefined>(undefined);
  const summaryQuery = useGetAdminSummary({ query: { enabled: isSignedIn === true, queryKey: ['/api/admin/summary'] } });
  const productsQuery = useListAdminProducts({ query: { enabled: isSignedIn === true, queryKey: getListAdminProductsQueryKey() } });
  const ordersQuery = useListAdminOrders({ query: { enabled: isSignedIn === true, queryKey: getListAdminOrdersQueryKey() } });
  const summary = summaryQuery.data;
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const loading = !isLoaded || (isSignedIn === true && (summaryQuery.isLoading || productsQuery.isLoading || ordersQuery.isLoading));
  const error = summaryQuery.isError || productsQuery.isError || ordersQuery.isError;

  if (loading) return <AdminSkeleton />;
  if (!isSignedIn) return <div className="admin-auth-state"><div className="auth-seal">i</div><p className="admin-kicker">Private workspace</p><h1>Enter the <em>atelier.</em></h1><p>Sign in with your iLonito operations account to manage the collection and customer orders.</p><button className="admin-button admin-button-primary" onClick={() => setLocation('/sign-in?redirect_url=%2Fadmin')} data-testid="button-admin-sign-in">Sign in to admin <ArrowUpRight size={15} /></button><button className="admin-auth-link" onClick={() => setLocation('/')} data-testid="link-return-store">Return to storefront</button></div>;
  if (error || !summary) return <div className="admin-auth-state"><div className="auth-seal">i</div><p className="admin-kicker">Private workspace</p><h1>We could not open the <em>atelier.</em></h1><p>Your admin session may have expired, or the workspace is taking a moment to respond.</p><button className="admin-button admin-button-primary" onClick={() => { summaryQuery.refetch(); productsQuery.refetch(); ordersQuery.refetch(); }} data-testid="button-retry-admin">Try again <ArrowUpRight size={15} /></button><button className="admin-auth-link" onClick={() => setLocation('/')} data-testid="link-return-store">Return to storefront</button></div>;

  const nav = [{ id: 'overview' as const, label: 'Overview', icon: LayoutDashboard }, { id: 'catalog' as const, label: 'Catalog', icon: Package }, { id: 'orders' as const, label: 'Orders', icon: ClipboardList }];
  return <div className="admin-workspace">{sidebarOpen && <button className="admin-mobile-shade" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" />}
     <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}><div className="admin-brand"><span className="brand-monogram">i</span><div><b>ILONITO</b><small>Atelier operations</small></div><IconButton label="Close navigation" className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={17} /></IconButton></div><div className="admin-nav-label">Workspace</div><nav>{nav.map(({ id, label, icon: NavIcon }) => <button className={`admin-nav-item ${view === id ? 'active' : ''}`} onClick={() => { setView(id); setSidebarOpen(false); }} key={id} data-testid={`button-nav-${id}`}><NavIcon size={17} /><span>{label}</span>{id === 'orders' && summary.pendingOrders > 0 && <i>{summary.pendingOrders}</i>}</button>)}</nav><div className="admin-sidebar-bottom"><div className="admin-side-status"><span /><div><b>Storefront live</b><small>Narok, Kenya</small></div></div><a href="/" className="admin-store-link" data-testid="link-view-storefront">View storefront <ExternalLink size={13} /></a><button className="admin-signout" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out"><LogOut size={16} /> Sign out</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><button className="admin-menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button><div className="admin-breadcrumb"><span>iLonito</span><ChevronLeft size={13} /><b>{nav.find((item) => item.id === view)?.label}</b></div><div className="admin-top-actions"><span className="admin-live-dot" /> <span className="admin-live-text">Live</span><button className="admin-avatar" aria-label="Signed-in profile" data-testid="button-profile">AM</button></div></header>{view === 'overview' && <Overview summary={summary} orders={orders} onViewOrders={() => setView('orders')} />}{view === 'catalog' && <Catalog products={products} onEdit={(product) => setProductEditor(product)} onNew={() => setProductEditor(null)} />}{view === 'orders' && <Orders orders={orders} />}</main>
    {productEditor !== undefined && <ProductModal product={productEditor} onClose={() => setProductEditor(undefined)} onSaved={() => setProductEditor(undefined)} />}
  </div>;
}