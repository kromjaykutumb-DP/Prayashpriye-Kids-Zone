import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Check, AlertCircle, CreditCard, Wallet, Banknote, ArrowLeft, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { STORE, formatPrice } from '@/lib/constants';
import type { OrderStatus } from '@/types';

type PaymentMethod = 'COD' | 'UPI' | 'Card';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_whatsapp: '',
    email: '',
    address_line: '',
    landmark: '',
    pincode: '',
    delivery_instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [deliveryValid, setDeliveryValid] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validatePincode = (pin: string) => {
    if (pin.length === 6) {
      setDeliveryValid(STORE.deliveryPincodes.includes(pin));
    } else {
      setDeliveryValid(null);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'pincode') validatePincode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!form.customer_name || !form.customer_phone || !form.address_line || !form.pincode) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.customer_phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (form.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `LB${Date.now().toString().slice(-8)}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_whatsapp: form.customer_whatsapp || null,
          email: form.email || null,
          user_id: user?.id ?? null,
          address_line: form.address_line,
          landmark: form.landmark || null,
          pincode: form.pincode,
          delivery_instructions: form.delivery_instructions || null,
          payment_method: paymentMethod,
          status: 'New' as OrderStatus,
          subtotal,
          total: subtotal,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order-confirmation/${orderNumber}`);
    } catch {
      setError('Could not place your order. Please try again or call us.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-600 text-lg mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const paymentOptions: { value: PaymentMethod; label: string; icon: typeof Banknote; desc: string }[] = [
    { value: 'COD', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive your order' },
    { value: 'UPI', label: 'UPI (GPay/PhonePe/Paytm)', icon: Wallet, desc: `Pay to ${STORE.upiId}` },
    { value: 'Card', label: 'Card / Net Banking', icon: CreditCard, desc: 'Secure online payment' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mb-4">
        <ArrowLeft size={16} /> Back to Cart
      </Link>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-6">Checkout</h1>

      {!user && (
        <div className="card p-4 mb-6 bg-teal-50/50 border-teal-200">
          <div className="flex items-start gap-3">
            <User size={20} className="text-teal-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-ink-700">
                You&rsquo;re checking out as a guest. No account needed &mdash; just fill in your details below.
              </p>
              <p className="text-sm text-ink-600 mt-1">
                Have an account? <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">Sign in</Link> to save your details and track orders.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact info */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-900 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  className="input-field"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.customer_phone}
                  onChange={(e) => handleChange('customer_phone', e.target.value)}
                  className="input-field"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.customer_whatsapp}
                  onChange={(e) => handleChange('customer_whatsapp', e.target.value)}
                  className="input-field"
                  placeholder="Same as phone if not specified"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-900 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-900 mb-1">Full Address *</label>
                <textarea
                  required
                  value={form.address_line}
                  onChange={(e) => handleChange('address_line', e.target.value)}
                  className="input-field min-h-[80px]"
                  placeholder="House no, street, area, city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Landmark</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => handleChange('landmark', e.target.value)}
                  className="input-field"
                  placeholder="Near..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                  className="input-field"
                  placeholder="734101"
                />
                {deliveryValid === true && (
                  <p className="mt-1.5 text-sm text-success-600 flex items-center gap-1">
                    <Check size={14} /> Free delivery available in your area!
                  </p>
                )}
                {deliveryValid === false && (
                  <p className="mt-1.5 text-sm text-warning-600 flex items-start gap-1">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    Currently we offer free delivery only in Darjeeling. Please call/WhatsApp us for other areas.
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-ink-900 mb-1">Delivery Instructions (optional)</label>
                <textarea
                  value={form.delivery_instructions}
                  onChange={(e) => handleChange('delivery_instructions', e.target.value)}
                  className="input-field min-h-[60px]"
                  placeholder="Preferred delivery time, gate color, etc."
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === opt.value ? 'border-teal-500 bg-teal-50' : 'border-cream-200 hover:border-teal-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === opt.value ? 'bg-teal-600 text-white' : 'bg-cream-100 text-ink-700'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink-900">{opt.label}</p>
                      <p className="text-sm text-ink-600">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${paymentMethod === opt.value ? 'border-teal-600 bg-teal-600' : 'border-cream-200'}`}>
                      {paymentMethod === opt.value && <Check size={12} className="text-white m-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'UPI' && (
              <div className="mt-4 p-4 rounded-xl bg-cream-100 text-center">
                <p className="text-sm text-ink-600 mb-2">Pay to UPI ID:</p>
                <p className="font-display text-lg font-bold text-ink-900">{STORE.upiId}</p>
                <p className="text-xs text-ink-600 mt-2">Send a screenshot of your payment via WhatsApp after placing the order.</p>
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-28">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                    {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-ink-600">{item.size} &middot; {item.color} &middot; Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-ink-900 shrink-0">{formatPrice(item.line_total)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-ink-700">
                <span>Subtotal ({itemCount})</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Delivery</span>
                <span className="font-semibold text-success-600">FREE</span>
              </div>
              <div className="border-t border-cream-200 pt-3 flex justify-between items-baseline">
                <span className="font-display font-bold text-ink-900">Total</span>
                <span className="font-display text-2xl font-bold text-ink-900">{formatPrice(subtotal)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-error-50 text-error-700 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>

            <div className="mt-4 p-3 rounded-xl bg-teal-50 flex items-start gap-2">
              <Truck size={18} className="text-teal-600 mt-0.5 shrink-0" />
              <p className="text-sm text-teal-700">{STORE.deliveryEstimate}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
