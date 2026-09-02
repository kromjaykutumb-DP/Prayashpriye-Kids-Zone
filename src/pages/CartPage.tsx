import { Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, Truck, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { STORE, formatPrice, whatsappLink } from '@/lib/constants';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto rounded-full bg-cream-100 flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-cream-300" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Your Cart is Empty</h1>
        <p className="text-ink-600 mb-6">Browse our collection and add some lovely clothes for your little one!</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          Your Cart ({itemCount})
        </h1>
        <button onClick={clearCart} className="text-sm text-error-600 hover:text-error-700 font-medium">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product_id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cream-300">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`}>
                  <h3 className="font-semibold text-ink-900 hover:text-teal-700 transition-colors line-clamp-1">{item.product_name}</h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-ink-600 mt-0.5">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>&middot; Color: {item.color}</span>}
                </div>
                <p className="font-display text-lg font-bold text-ink-900 mt-1">{formatPrice(item.unit_price)}</p>

                <div className="flex items-center justify-between mt-2">
                  <div className="inline-flex items-center rounded-lg border-2 border-cream-200 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)}
                      className="px-2.5 py-1 text-ink-700 hover:bg-cream-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 font-semibold text-sm text-ink-900 min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)}
                      className="px-2.5 py-1 text-ink-700 hover:bg-cream-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product_id, item.size, item.color)}
                    className="text-error-500 hover:text-error-700 p-1.5 rounded-lg hover:bg-error-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mt-4">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-28">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-700">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Delivery</span>
                <span className="font-semibold text-success-600">FREE</span>
              </div>
              <div className="border-t border-cream-200 pt-3 mt-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-ink-900">Total</span>
                  <span className="font-display text-2xl font-bold text-ink-900">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-teal-50 flex items-start gap-2">
              <Truck size={18} className="text-teal-600 mt-0.5 shrink-0" />
              <p className="text-sm text-teal-700">{STORE.deliveryZone}</p>
            </div>

            <Link to="/checkout" className="btn-primary w-full mt-4">
              Proceed to Checkout
            </Link>
            <a href={whatsappLink(`Hi, I'd like to order ${itemCount} items from your store. Total: ${formatPrice(subtotal)}`)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full mt-2">
              <MessageCircle size={18} /> Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
