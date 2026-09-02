import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Truck, RefreshCw, Check, ShoppingBag, ArrowLeft, ZoomIn, Ruler } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STORE, formatPrice, formatAgeRangeForDisplay } from '@/lib/constants';
import { useCart } from '@/contexts/CartContext';
import type { ProductWithCategory } from '@/types';

const sizeGuide = [
  { age: '0-3 months', height: '50-58 cm', chest: '38-42 cm' },
  { age: '3-6 months', height: '58-66 cm', chest: '42-46 cm' },
  { age: '6-12 months', height: '66-76 cm', chest: '46-50 cm' },
  { age: '12-24 months', height: '76-86 cm', chest: '50-54 cm' },
  { age: '2-3 years', height: '86-96 cm', chest: '52-56 cm' },
  { age: '3-4 years', height: '96-104 cm', chest: '54-58 cm' },
  { age: '4-5 years', height: '104-110 cm', chest: '56-60 cm' },
  { age: '5-6 years', height: '110-116 cm', chest: '58-62 cm' },
  { age: '6-7 years', height: '116-122 cm', chest: '60-64 cm' },
  { age: '7-8 years', height: '122-128 cm', chest: '62-66 cm' },
  { age: '8-10 years', height: '128-140 cm', chest: '66-72 cm' },
  { age: '10-12 years', height: '140-152 cm', chest: '72-78 cm' },
  { age: '12-14 years', height: '152-164 cm', chest: '78-84 cm' },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .maybeSingle();
      setProduct(data as unknown as ProductWithCategory | null);
      if (data) {
        const p = data as unknown as ProductWithCategory;
        setSelectedSize(p.sizes[0] ?? '');
        setSelectedColor(p.colors[0] ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const effectivePrice = product.discount_price ?? product.price;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images[0] ?? '',
      size: selectedSize,
      color: selectedColor,
      quantity,
      unit_price: effectivePrice,
      line_total: effectivePrice * quantity,
    });
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-cream-200 rounded-3xl animate-pulse" />
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-cream-200 rounded w-3/4" />
            <div className="h-6 bg-cream-200 rounded w-1/2" />
            <div className="h-32 bg-cream-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-600 text-lg">Product not found.</p>
        <Link to="/shop" className="btn-primary mt-4">Back to Shop</Link>
      </div>
    );
  }

  const effectivePrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const inStock = product.stock > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-600 mb-6">
        <Link to="/" className="hover:text-teal-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-teal-700">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-teal-700">{product.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-ink-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-100 group">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cream-300">No image</div>
            )}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {product.new_arrival && <span className="badge bg-teal-500 text-white">New Arrival</span>}
              {hasDiscount && <span className="badge bg-sun-400 text-ink-900">Sale</span>}
              {product.best_seller && <span className="badge bg-rose-500 text-white">Best Seller</span>}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden ring-2 transition-all ${selectedImage === i ? 'ring-teal-500' : 'ring-cream-200 hover:ring-teal-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.category && <span className="text-sm font-medium text-teal-600">{product.category.name}</span>}
            {product.age_range && <span className="text-sm text-ink-600">&middot; {formatAgeRangeForDisplay(product.age_range)}</span>}
            <span className="text-sm text-ink-600">&middot; {product.gender}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-3xl font-bold text-ink-900">{formatPrice(effectivePrice)}</span>
            {hasDiscount && <span className="text-lg text-ink-600/50 line-through">{formatPrice(product.price)}</span>}
            {hasDiscount && (
              <span className="badge bg-success-100 text-success-700">
                Save {formatPrice(product.price - (product.discount_price ?? 0))}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-ink-700 leading-relaxed mb-6">{product.description}</p>
          )}

          {/* Stock */}
          <div className="mb-4">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-success-600 font-medium text-sm">
                <Check size={16} /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-error-600 font-medium text-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-ink-900">Select Size</label>
                <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${selectedSize === size ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-cream-200 text-ink-700 hover:border-teal-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-semibold text-ink-900 block mb-2">Select Color</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border-2 font-medium text-sm transition-all ${selectedColor === color ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-cream-200 text-ink-700 hover:border-teal-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-ink-900 block mb-2">Quantity</label>
            <div className="inline-flex items-center rounded-xl border-2 border-cream-200 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg text-ink-700 hover:bg-cream-100 transition-colors"
              >
                &minus;
              </button>
              <span className="px-6 py-2 font-semibold text-ink-900 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                className="px-4 py-2 text-lg text-ink-700 hover:bg-cream-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {addedMessage && (
            <div className="mb-4 p-3 rounded-xl bg-success-50 text-success-700 text-sm font-medium animate-slide-up flex items-center gap-2">
              <Check size={16} /> Added to cart! <Link to="/cart" className="underline">View cart</Link>
            </div>
          )}

          {/* Delivery info */}
          <div className="space-y-3 pt-4 border-t border-cream-200">
            <div className="flex items-start gap-3">
              <Truck size={20} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-ink-900 text-sm">Free Delivery in Darjeeling</p>
                <p className="text-sm text-ink-600">{STORE.deliveryEstimate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw size={20} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-ink-900 text-sm">Easy Returns & Exchanges</p>
                <p className="text-sm text-ink-600">7-day easy exchange on unworn items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSizeGuide(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-cream-50 rounded-3xl shadow-2xl p-6 m-4">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Kids&rsquo; Size Guide (cm)</h2>
            <p className="text-sm text-ink-600 mb-4">Measure your child&rsquo;s height and chest to find the best fit. Sizes are approximate.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-cream-200">
                    <th className="text-left py-2 px-3 font-semibold text-ink-900">Age</th>
                    <th className="text-left py-2 px-3 font-semibold text-ink-900">Height</th>
                    <th className="text-left py-2 px-3 font-semibold text-ink-900">Chest</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.map((row) => (
                    <tr key={row.age} className="border-b border-cream-100 hover:bg-teal-50/50">
                      <td className="py-2 px-3 text-ink-700">{row.age}</td>
                      <td className="py-2 px-3 text-ink-700">{row.height}</td>
                      <td className="py-2 px-3 text-ink-700">{row.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={() => setShowSizeGuide(false)} className="btn-primary w-full mt-6">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
