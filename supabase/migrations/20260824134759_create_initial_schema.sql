/*
# Initial schema for Prayashpriye Kid's Zone online store

1. New Tables
- `categories` — product categories (Baby, Kids, Ethnic, Party Wear, etc.)
- `products` — catalog items with price, stock, images, age range, gender, featured flag
- `order_status` enum — order lifecycle
- `orders` — customer orders with delivery info, payment method, status
- `order_items` — line items per order (snapshot of product at purchase time)
- `addresses` — saved delivery addresses for signed-in customers
2. Security
- Enable RLS on every table.
- Products + categories: public read (anon, authenticated); only admin can write.
- Orders: customers read/update only their own; admin reads/updates all; insert by anyone (checkout).
- Order items: readable by order owner or admin; insert by anyone.
- Addresses: owner-scoped CRUD.
- Admin is identified by raw_app_meta_data ->> 'role' = 'admin' via helper is_admin().
3. Important Notes
- is_admin() SECURITY DEFINER helper checks auth.jwt() raw_app_meta_data for role='admin'.
- Owner columns default to auth.uid() so client inserts omitting them still satisfy WITH CHECK.
- No destructive operations; idempotent statements used throughout.
*/

-- =============================================================
-- Helper: is_admin()
-- =============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce((auth.jwt() -> 'raw_app_meta_data' ->> 'role') = 'admin', false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =============================================================
-- Categories
-- =============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_public" ON public.categories;
CREATE POLICY "categories_read_public" ON public.categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE
  TO authenticated USING (public.is_admin());

-- =============================================================
-- Products
-- =============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  gender text NOT NULL DEFAULT 'Unisex' CHECK (gender IN ('Boy','Girl','Unisex')),
  age_range text,
  sizes text[] NOT NULL DEFAULT '{}',
  colors text[] NOT NULL DEFAULT '{}',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  discount_price numeric(10,2) CHECK (discount_price >= 0 AND discount_price <= price),
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images text[] NOT NULL DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_read_public" ON public.products;
CREATE POLICY "products_read_public" ON public.products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

-- =============================================================
-- Orders
-- =============================================================
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('New','Confirmed','Packed','Out for Delivery','Delivered','Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_whatsapp text,
  email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  address_line text NOT NULL,
  landmark text,
  pincode text NOT NULL,
  delivery_instructions text,
  payment_method text NOT NULL DEFAULT 'COD' CHECK (payment_method IN ('COD','UPI','Card')),
  status public.order_status NOT NULL DEFAULT 'New',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_any" ON public.orders;
CREATE POLICY "orders_insert_any" ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update_own_or_admin" ON public.orders;
CREATE POLICY "orders_update_own_or_admin" ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;
CREATE POLICY "orders_delete_admin" ON public.orders FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- =============================================================
-- Order Items
-- =============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size text,
  color text,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON public.order_items;
CREATE POLICY "order_items_select_own_or_admin" ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "order_items_insert_any" ON public.order_items;
CREATE POLICY "order_items_insert_any" ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "order_items_update_admin" ON public.order_items;
CREATE POLICY "order_items_update_admin" ON public.order_items FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items_delete_admin" ON public.order_items;
CREATE POLICY "order_items_delete_admin" ON public.order_items FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =============================================================
-- Addresses (saved by signed-in customers)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  landmark text,
  pincode text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select_own" ON public.addresses;
CREATE POLICY "addresses_select_own" ON public.addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_insert_own" ON public.addresses;
CREATE POLICY "addresses_insert_own" ON public.addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update_own" ON public.addresses;
CREATE POLICY "addresses_update_own" ON public.addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete_own" ON public.addresses;
CREATE POLICY "addresses_delete_own" ON public.addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- =============================================================
-- updated_at triggers
-- =============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_products_touch ON public.products;
CREATE TRIGGER trg_products_touch BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_orders_touch ON public.orders;
CREATE TRIGGER trg_orders_touch BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();