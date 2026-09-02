/*
# Seed categories and sample products

1. Data
- 19 categories: Baby (0-2Y), Kids (2-6Y), Juniors (7-14Y), Ethnic, Party Wear, Daily Wear, Winter Wear, Pants, Jeans, Skirts, Leggings, Sweatshirts, Hoodies, Cardigans, Jackets, Frocks, Socks, Sandals, School Uniforms
- 8 sample products across categories with placeholder image URLs (Pexels)
2. Notes
- Images use Pexels placeholder URLs structured for easy replacement.
- Prices in INR. Stock values set for demonstration.
*/

-- Categories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Baby (0-2Y)', 'baby', 'Soft clothing for babies aged 0 to 2 years', 1),
  ('Kids (2-6Y)', 'kids', 'Comfortable clothing for kids aged 2 to 6 years', 2),
  ('Juniors (7-14Y)', 'juniors', 'Stylish clothing for juniors aged 7 to 14 years', 3),
  ('Daily Wear', 'daily-wear', 'Everyday comfortable clothing for kids', 4),
  ('Pants', 'pants', 'Comfortable pants and trousers for kids', 5),
  ('Jeans', 'jeans', 'Stylish denim jeans for boys and girls', 6),
  ('Skirts', 'skirts', 'Beautiful skirts for girls', 7),
  ('Leggings', 'leggings', 'Comfortable leggings for everyday wear', 8),
  ('Sweatshirts', 'sweatshirts', 'Cozy sweatshirts for cool weather', 9),
  ('Hoodies', 'hoodies', 'Trendy hoodies for kids', 10),
  ('Cardigans', 'cardigans', 'Soft cardigans for layering', 11),
  ('Jackets', 'jackets', 'Stylish jackets for various occasions', 12),
  ('Frocks', 'frocks', 'Beautiful frocks and dresses for girls', 13),
  ('Ethnic', 'ethnic', 'Traditional ethnic wear for kids', 14),
  ('Party Wear', 'party-wear', 'Party and festive outfits for kids', 15),
  ('Winter Wear', 'winter-wear', 'Warm winter clothing for Darjeeling weather', 16),
  ('Socks', 'socks', 'Comfortable socks for kids', 17),
  ('Sandals', 'sandals', 'Comfortable sandals for kids', 18),
  ('School Uniforms', 'school-uniforms', 'School uniforms for boys and girls', 19)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

-- Sample products
INSERT INTO public.products (name, description, category_id, gender, age_range, sizes, colors, price, discount_price, stock, images, featured, best_seller, new_arrival) VALUES
  (
    'Soft Cotton Baby Romper',
    'Gentle 100% cotton romper perfect for babies. Easy snap buttons for quick changes. Breathable fabric for all-day comfort.',
    (SELECT id FROM public.categories WHERE slug = 'baby'),
    'Unisex', '0-12 months',
    ARRAY['0-3M','3-6M','6-12M'],
    ARRAY['Pastel Pink','Sky Blue','Mint Green'],
    349.00, 299.00, 25,
    ARRAY['https://images.pexels.com/photos/2678027/pexels-photo-2678027.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true, false
  ),
  (
    'Cozy Knit Baby Cardigan',
    'Warm knit cardigan for chilly Darjeeling evenings. Soft buttons and gentle stretch fabric.',
    (SELECT id FROM public.categories WHERE slug = 'baby'),
    'Unisex', '0-2 years',
    ARRAY['3-6M','6-12M','12-24M'],
    ARRAY['Cream','Grey','Baby Pink'],
    499.00, NULL, 18,
    ARRAY['https://images.pexels.com/photos/3933247/pexels-photo-3933247.jpeg?auto=compress&cs=tinysrgb&w=800'],
    false, false, true
  ),
  (
    'Playful Printed T-Shirt',
    'Fun graphic t-shirt for active kids. Durable cotton blend that washes well and keeps its shape.',
    (SELECT id FROM public.categories WHERE slug = 'kids'),
    'Boy', '2-6 years',
    ARRAY['2-3Y','3-4Y','4-5Y','5-6Y'],
    ARRAY['Navy Blue','Red','Yellow'],
    249.00, 199.00, 40,
    ARRAY['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true, false
  ),
  (
    'Floral Summer Dress',
    'Light and breezy floral dress for girls. Perfect for parties or everyday wear in warm weather.',
    (SELECT id FROM public.categories WHERE slug = 'kids'),
    'Girl', '2-6 years',
    ARRAY['2-3Y','3-4Y','4-5Y','5-6Y'],
    ARRAY['Pink Floral','Blue Floral'],
    399.00, 349.00, 30,
    ARRAY['https://images.pexels.com/photos/1456704/pexels-photo-1456704.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false, true
  ),
  (
    'Traditional Kurta Set',
    'Elegant ethnic kurta set for boys. Comfortable cotton fabric with traditional embroidery. Perfect for festivals and special occasions.',
    (SELECT id FROM public.categories WHERE slug = 'ethnic'),
    'Boy', '2-10 years',
    ARRAY['2-3Y','4-5Y','6-7Y','8-10Y'],
    ARRAY['Cream','Maroon','Olive Green'],
    699.00, 599.00, 15,
    ARRAY['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, false, false
  ),
  (
    'Festive Lehenga Choli',
    'Beautiful festive lehenga choli for girls. Intricate detailing and comfortable fit for weddings and celebrations.',
    (SELECT id FROM public.categories WHERE slug = 'ethnic'),
    'Girl', '3-12 years',
    ARRAY['3-4Y','5-6Y','7-8Y','10-12Y'],
    ARRAY['Pink','Red','Purple'],
    899.00, 799.00, 12,
    ARRAY['https://images.pexels.com/photos/1456704/pexels-photo-1456704.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true, false
  ),
  (
    'Warm Puffer Jacket',
    'Insulated puffer jacket perfect for Darjeeling winters. Lightweight yet warm with a cozy hood.',
    (SELECT id FROM public.categories WHERE slug = 'winter-wear'),
    'Unisex', '4-14 years',
    ARRAY['4-5Y','6-7Y','8-10Y','12-14Y'],
    ARRAY['Black','Navy Blue','Burgundy'],
    999.00, 849.00, 20,
    ARRAY['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=800'],
    true, true, true
  ),
  (
    'Fleece Winter Set with Cap',
    'Cozy fleece set with matching cap and mittens. Perfect for keeping little ones warm in Darjeeling hills.',
    (SELECT id FROM public.categories WHERE slug = 'winter-wear'),
    'Unisex', '1-8 years',
    ARRAY['1-2Y','3-4Y','5-6Y','7-8Y'],
    ARRAY['Grey','Mustard','Teal'],
    599.00, 499.00, 22,
    ARRAY['https://images.pexels.com/photos/3933247/pexels-photo-3933247.jpeg?auto=compress&cs=tinysrgb&w=800'],
    false, false, true
  )
ON CONFLICT (id) DO NOTHING;