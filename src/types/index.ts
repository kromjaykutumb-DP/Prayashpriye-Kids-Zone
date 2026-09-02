export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  gender: 'Boy' | 'Girl' | 'Unisex';
  age_range: string | null;
  sizes: string[];
  colors: string[];
  price: number;
  discount_price: number | null;
  stock: number;
  images: string[];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type OrderStatus = 'New' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string | null;
  email: string | null;
  user_id: string | null;
  address_line: string;
  landmark: string | null;
  pincode: string;
  delivery_instructions: string | null;
  payment_method: 'COD' | 'UPI' | 'Card';
  status: OrderStatus;
  subtotal: number;
  total: number;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  landmark: string | null;
  pincode: string;
  is_default: boolean;
  created_at: string;
};

export type CartItem = {
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type WishlistItem = {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  discount_price: number | null;
};
