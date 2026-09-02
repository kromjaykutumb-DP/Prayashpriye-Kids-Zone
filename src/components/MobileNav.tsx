import { Link } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/constants';
import { useCart } from '@/contexts/CartContext';

export default function MobileNav() {
  const { itemCount } = useCart();

  const items = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/shop', icon: ShoppingBag, label: 'Shop' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: itemCount },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cream-200 shadow-lg">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-ink-700 hover:text-teal-700 hover:bg-teal-50 transition-colors relative"
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge ? (
                <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-sun-400 text-ink-900 text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-success-600 hover:bg-success-50 transition-colors"
        >
          <MessageCircle size={22} />
          <span className="text-xs font-medium">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
