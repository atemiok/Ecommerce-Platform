import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetProductParams,
  GetProductResponse,
  GetStorefrontSummaryResponse,
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";
import { db, orderItemsTable, ordersTable, productsTable } from "@workspace/db";

const router: IRouter = Router();

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

router.get("/products", async (req, res) => {
  const query = ListProductsQueryParams.parse(req.query);
  const products = await db.select().from(productsTable);
  const normalizedSearch = query.search?.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const isCategoryMatch =
      !query.category || product.category.toLowerCase() === query.category.toLowerCase();
    const isFeaturedMatch = query.featured === undefined || product.featured === query.featured;
    const isSearchMatch =
      !normalizedSearch ||
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(normalizedSearch);
    return isCategoryMatch && isFeaturedMatch && isSearchMatch;
  });

  res.json(ListProductsResponse.parse(filtered.map(toProductDto)));
});

router.get("/products/:id", async (req, res) => {
  const { id } = GetProductParams.parse(req.params);
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(toProductDto(product)));
});

router.get("/categories", async (_req, res) => {
  const products = await db.select().from(productsTable);
  const categories = [...new Map(
    products.map((product) => [
      product.category,
      {
        name: product.category,
        slug: product.category.toLowerCase().replace(/\s+/g, "-"),
        productCount: products.filter((entry) => entry.category === product.category).length,
      },
    ]),
  ).values()];

  res.json(ListCategoriesResponse.parse(categories));
});

router.get("/storefront/summary", async (_req, res) => {
  const products = await db.select().from(productsTable);
  const data = {
    featuredProducts: products.filter((product) => product.featured).map(toProductDto),
    totalProducts: products.length,
    categoryCount: new Set(products.map((product) => product.category)).size,
  };
  res.json(GetStorefrontSummaryResponse.parse(data));
});

router.post("/orders", async (req, res) => {
  const input = CreateOrderBody.parse(req.body);
  const productIds = [...new Set(input.items.map((item) => item.productId))];

  if (input.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    res.status(400).json({ error: "Each item quantity must be a positive whole number" });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(and(inArray(productsTable.id, productIds), eq(productsTable.inStock, true)));
  const productsById = new Map(products.map((product) => [product.id, product]));

  if (productsById.size !== productIds.length) {
    res.status(400).json({ error: "One or more requested products are unavailable" });
    return;
  }

  const total = input.items.reduce((sum, item) => {
    const product = productsById.get(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const order = await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(ordersTable)
      .values({
        customerName: input.customerName.trim(),
        email: input.email.trim().toLowerCase(),
        shippingAddress: input.shippingAddress.trim(),
        total,
      })
      .returning();

    await tx.insert(orderItemsTable).values(
      input.items.map((item) => {
        const product = productsById.get(item.productId)!;
        return {
          orderId: createdOrder.id,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      }),
    );

    return createdOrder;
  });

  req.log.info({ orderId: order.id, itemCount: input.items.length }, "Storefront order created");
  res.status(201).json(
    CreateOrderResponse.parse({
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
    }),
  );
});

export default router;