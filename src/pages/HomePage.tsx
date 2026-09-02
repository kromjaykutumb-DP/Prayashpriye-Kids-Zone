import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CreditCard, RefreshCw, Baby, Sparkles, ArrowRight, MapPin, MessageCircle, Phone, Star, Crown, Shirt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STORE, whatsappLink, telLink } from '@/lib/constants';
import type { ProductWithCategory, Category } from '@/types';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: products }, { data: cats }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
      ]);
      setFeaturedProducts((products ?? []) as unknown as ProductWithCategory[]);
      setCategories(cats ?? []);
      setLoading(false);
    })();
  }, []);

  const highlights = [
    { icon: Truck, title: 'Free Delivery', desc: 'In Darjeeling town & nearby areas' },
    { icon: CreditCard, title: 'COD & UPI', desc: 'GPay, PhonePe, Paytm accepted' },
    { icon: RefreshCw, title: 'Easy Exchanges', desc: 'Hassle-free returns' },
  ];

  const categoryIcons: Record<string, typeof Baby> = {
    baby: Baby,
    kids: Shirt,
    juniors: Star,
    ethnic: Crown,
    'party-wear': Crown,
    'daily-wear': Baby,
    'winter-wear': Star,
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cream-50 to-sun-50">
        {/* Decorative hills */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-32 text-teal-200/40" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,80 C240,120 480,20 720,60 C960,100 1200,30 1440,70 L1440,120 L0,120 Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 right-0 w-full h-24 text-teal-300/30" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="currentColor">
          <path d="M0,60 C320,100 640,10 960,50 C1200,80 1320,40 1440,60 L1440,120 L0,120 Z" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="badge bg-sun-200 text-sun-700 mb-4 px-3 py-1">
              Now Online in Darjeeling
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 leading-tight mb-4">
              {STORE.storeName} &ndash; <span className="text-teal-600">Kids&rsquo; Clothes</span> Now Online
            </h1>
            <p className="text-base sm:text-lg text-ink-700 mb-8 leading-relaxed">
              Proudly presented by {STORE.storeName}. Shop baby &amp; kids&rsquo; clothing online with free delivery in Darjeeling.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/shop?filter=new" className="btn-accent">
                View New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Icon className="text-teal-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900">{h.title}</h3>
                  <p className="text-sm text-ink-600">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Shop by Category</h2>
          <p className="text-ink-600 mt-2">Find the perfect outfit for every age and occasion</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] ?? Baby;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="card p-5 text-center group hover:bg-teal-50"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-100 to-sun-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="text-teal-600" size={28} />
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-ink-900 group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-ink-600 mt-1 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 bg-gradient-to-b from-transparent to-teal-50/30">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">Featured Products</h2>
            <p className="text-ink-600 mt-1">Handpicked favorites for your little ones</p>
          </div>
          <Link to="/shop" className="btn-ghost text-sm hidden sm:inline-flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="aspect-square bg-cream-200 rounded-xl mb-3" />
                <div className="h-4 bg-cream-200 rounded mb-2" />
                <div className="h-4 bg-cream-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link to="/shop" className="btn-outline">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Trust / About section */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <span className="badge bg-teal-100 text-teal-700 mb-3">Our Store</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
              Trusted by Darjeeling Families for Years
            </h2>
            <p className="text-ink-700 leading-relaxed mb-4">
              {STORE.storeName} has been serving the families of Darjeeling from our physical store at {STORE.shortAddress}. Now we&rsquo;re bringing the same warmth and quality online, so you can shop for your little ones from the comfort of your home.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-ink-900">Visit Our Store</p>
                  <p className="text-sm text-ink-600">{STORE.address}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-ink-900">Call Us</p>
                  <div className="flex gap-3 text-sm text-ink-600">
                    {STORE.phones.map((p) => (
                      <a key={p} href={telLink(p)} className="hover:text-teal-700">{p}</a>
                    ))}
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle size={20} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-ink-900">WhatsApp Us</p>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-ink-600 hover:text-teal-700">
                    Chat with us for any queries
                  </a>
                </div>
              </li>
            </ul>
            <div className="flex gap-3">
              <Link to="/about" className="btn-primary">Learn More</Link>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-gradient-to-br from-teal-100 to-cream-100">
              <img
                src="https://images.pexels.com/photos/3933247/pexels-photo-3933247.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Kids clothing store"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                <p className="font-display font-bold text-ink-900">{STORE.storeName}</p>
                <p className="text-sm text-ink-600">{STORE.shortAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Ready to Shop for Your Little One?
          </h2>
          <p className="text-teal-100 mb-6">
            Browse our full collection and get free delivery in Darjeeling. No account needed &ndash; just add to cart and check out!
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/shop" className="btn-accent">
              Start Shopping <ArrowRight size={18} />
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95">
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
