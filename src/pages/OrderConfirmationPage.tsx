import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Phone, MessageCircle, Truck, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STORE, whatsappLink, telLink, formatPrice } from '@/lib/constants';
import type { OrderWithItems } from '@/types';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('order_number', orderNumber)
        .maybeSingle();
      setOrder(data as unknown as OrderWithItems | null);
      setLoading(false);
    })();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-cream-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-success-100 flex items-center justify-center mb-4 animate-bounce-soft">
          <CheckCircle size={40} className="text-success-600" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-2">
          Thank You! Your Order is Confirmed
        </h1>
        {order ? (
          <p className="text-ink-600">
            Order <span className="font-bold text-ink-900">#{order.order_number}</span> &middot; Free delivery in Darjeeling
          </p>
        ) : (
          <p className="text-ink-600">
            Order <span className="font-bold text-ink-900">#{orderNumber}</span> &middot; Free delivery in Darjeeling
          </p>
        )}
      </div>

      {/* Contact callout */}
      <div className="card p-5 mb-6 bg-teal-50/50 border-teal-200">
        <p className="text-sm text-ink-700 text-center mb-3">
          We&rsquo;ll contact you soon to confirm your order and delivery time.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {STORE.phones.map((phone) => (
            <a key={phone} href={telLink(phone)} className="btn-outline text-sm py-2">
              <Phone size={16} /> {phone}
            </a>
          ))}
          <a href={whatsappLink(`Hi, I just placed order #${orderNumber}. I'd like to confirm the delivery details.`)} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm py-2">
            <MessageCircle size={16} /> WhatsApp Us
          </a>
        </div>
      </div>

      {/* Order details */}
      {order && (
        <div className="card p-5 mb-6">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Order Details</h2>

          <div className="space-y-3 mb-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{item.product_name}</p>
                  <p className="text-ink-600 text-xs">{item.size} &middot; {item.color} &middot; Qty {item.quantity}</p>
                </div>
                <p className="font-semibold text-ink-900">{formatPrice(item.line_total)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-ink-700">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Delivery</span>
              <span className="font-semibold text-success-600">FREE</span>
            </div>
            <div className="flex justify-between items-baseline border-t border-cream-200 pt-2">
              <span className="font-display font-bold text-ink-900">Total</span>
              <span className="font-display text-xl font-bold text-ink-900">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-ink-700 pt-2">
              <span>Payment</span>
              <span className="font-semibold">{order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery info */}
      {order && (
        <div className="card p-5 mb-6">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Delivery To</h2>
          <div className="space-y-1 text-sm text-ink-700">
            <p className="font-medium text-ink-900">{order.customer_name}</p>
            <p>{order.address_line}</p>
            {order.landmark && <p>Landmark: {order.landmark}</p>}
            <p>PIN: {order.pincode}</p>
            <p>Phone: {order.customer_phone}</p>
          </div>
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-teal-50">
            <Truck size={18} className="text-teal-600 mt-0.5 shrink-0" />
            <p className="text-sm text-teal-700">{STORE.deliveryEstimate}</p>
          </div>
        </div>
      )}

      {/* Account prompt */}
      {!order?.user_id && (
        <div className="card p-5 mb-6 bg-sun-50/50 border-sun-200">
          <div className="flex items-start gap-3">
            <Package size={20} className="text-sun-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-ink-900">Want to track orders easily?</p>
              <p className="text-sm text-ink-600 mt-1">
                Create an account with your phone or email to view order history and reorder with one click.
              </p>
              <Link to="/login" className="btn-accent text-sm py-2 mt-3">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
