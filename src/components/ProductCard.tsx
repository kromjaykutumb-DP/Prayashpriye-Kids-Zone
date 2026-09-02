import { useNavigate } from 'react-router-dom';
import { Star, Check, Heart } from 'lucide-react';
import { formatPrice, formatAgeRangeForDisplay } from '@/lib/constants';
import type { ProductWithCategory } from '@/types';
import { useWishlist } from '@/contexts/WishlistContext';

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  const navigate = useNavigate();
  const { addItem, removeItem, isInWishlist } = useWishlist();
  const effectivePrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price !== null && product.discount_price < product.price;
  const inStock = product.stock > 0;
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem({
        product_id: product.id,
        product_name: product.name,
        product_image: product.images[0] || '',
        price: product.price,
        discount_price: product.discount_price,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div onClick={handleCardClick} className="card group overflow-hidden flex flex-col cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream-300">
            <span className="text-sm">No image</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.new_arrival && (
            <span className="badge bg-teal-500 text-white">New</span>
          )}
          {hasDiscount && (
            <span className="bg-sun-400 text-ink-900 badge">Sale</span>
          )}
          {product.best_seller && (
            <span className="bg-rose-500 text-white badge gap-0.5">
              <Star size={10} fill="currentColor" /> Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm z-10"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            className={inWishlist ? 'fill-rose-500 text-rose-500' : 'text-ink-600'}
          />
        </button>
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="badge bg-ink-900 text-white text-sm px-4 py-1">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.category && (
            <span className="text-xs text-teal-600 font-medium">{product.category.name}</span>
          )}
          {product.age_range && (
            <>
              <span className="text-xs text-ink-600/40">&middot;</span>
              <span className="text-xs text-ink-600">{formatAgeRangeForDisplay(product.age_range)}</span>
            </>
          )}
        </div>
        <h3 className="font-semibold text-sm sm:text-base text-ink-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="font-display text-lg font-bold text-ink-900">{formatPrice(effectivePrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-ink-600/50 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        {inStock && (
          <div className="flex items-center gap-1 text-xs text-success-600">
            <Check size={12} />
            <span>In Stock</span>
          </div>
        )}
      </div>
    </div>
  );
}
