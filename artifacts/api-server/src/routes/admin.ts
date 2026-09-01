import { Router, type IRouter, type RequestHandler } from "express";
import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { getAuth } from "@clerk/express";
import { db, orderItemsTable, ordersTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

const productInputSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string(),
  price: z.coerce.number().finite().min(0),
  compareAtPrice: z.coerce.number().finite().min(0).nullable().optional(),
  category: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  rating: z.coerce.number().finite().min(0).max(5).optional().default(4.8),
  reviewCount: z.coerce.number().int().min(0).optional().default(0),
  stockQuantity: z.coerce.number().int().min(0),
  inStock: z.boolean(),
  featured: z.boolean(),
  badge: z.string().trim().nullable().optional(),
});

const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});

function toProductDto(product: typeof productsTable.$inferSelect) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    imageUrl: product.imageUrl,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockQuantity: product.stockQuantity,
    inStock: product.inStock,
    featured: product.featured,
    badge: product.badge,
  };
}

async function toOrderDtos(orderRows: typeof ordersTable.$inferSelect[]) {
  if (!orderRows.length) return [];

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(inArray(orderItemsTable.orderId, orderRows.map((order) => order.id)));

  const itemsByOrderId = new Map<number, typeof items>();
  for (const item of items) {
    const orderItems = itemsByOrderId.get(item.orderId) ?? [];
    orderItems.push(item);
    itemsByOrderId.set(item.orderId, orderItems);
  }

  return orderRows.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    email: order.email,
    shippingAddress: order.shippingAddress,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: (itemsByOrderId.get(order.id) ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  }));
}

const requireAdmin: RequestHandler = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const allowlistedIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowlistedIds.length > 0 && !allowlistedIds.includes(userId)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
};

router.use("/admin", requireAdmin);

router.get("/admin/summary", async (_req, res) => {
  const [products, orders] = await Promise.all([
    db.select().from(productsTable),
    db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)),
  ]);
  const recentOrders = await toOrderDtos(orders.slice(0, 5));

  res.json({
    totalProducts: products.length,
    inStockProducts: products.filter((product) => product.inStock).length,
    lowStockProducts: products.filter((product) => product.inStock && product.stockQuantity <= 2).length,
    pendingOrders: orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.status)).length,
    revenue: orders
      .filter((order) => order.status !== "cancelled")
      .reduce((total, order) => total + order.total, 0),
    recentOrders,
  });
});

router.get("/admin/products", async (_req, res) => {
  const products = await db.select().from(productsTable);
  res.json(products.map(toProductDto));
});

router.post("/admin/products", async (req, res) => {
  const input = productInputSchema.parse(req.body);
  const [existing] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.slug, input.slug))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: "A product with this slug already exists" });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values(input)
    .returning();
  res.status(201).json(toProductDto(product));
});

router.patch("/admin/products/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const input = productInputSchema.parse(req.body);
  const [existing] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [slugConflict] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.slug, input.slug), ne(productsTable.id, id)))
    .limit(1);
  if (slugConflict) {
    res.status(409).json({ error: "A product with this slug already exists" });
    return;
  }

  const [product] = await db
    .update(productsTable)
    .set(input)
    .where(eq(productsTable.id, id))
    .returning();
  res.json(toProductDto(product));
});

router.delete("/admin/products/:id", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const [existing] = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [orderedProduct] = await db
    .select({ id: orderItemsTable.id })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.productId, id))
    .limit(1);
  if (orderedProduct) {
    res.status(409).json({ error: "This product is referenced by an order. Mark it out of stock instead." });
    return;
  }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.status(204).send();
});

router.get("/admin/orders", async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(await toOrderDtos(orders));
});

router.patch("/admin/orders/:id/status", async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id);
  const { status } = orderStatusSchema.parse(req.body);
  const [order] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [updated] = await toOrderDtos([order]);
  res.json(updated);
});

export default router;