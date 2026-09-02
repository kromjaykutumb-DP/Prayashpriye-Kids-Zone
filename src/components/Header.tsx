import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Phone, MessageCircle, Baby, Heart } from 'lucide-react';
import { useState } from 'react';
import { STORE, whatsappLink, telLink } from '@/lib/constants';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-cream-200">
      {/* Top bar */}
      <div className="bg-teal-700 text-white text-xs sm:text-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
          <div className="overflow-hidden flex-1">
            <p className="flex items-center gap-1.5 animate-marquee whitespace-nowrap">
              <span className="hidden sm:inline">Free delivery in Darjeeling</span>
              <span className="sm:hidden">Free delivery</span>
              <span className="hidden md:inline">&middot; COD & UPI accepted &middot; Easy exchanges</span>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href={telLink(STORE.phones[0])} className="flex items-center gap-1 hover:text-sun-200 transition-colors">
              <Phone size={12} /> {STORE.phones[0]}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-sun-200 transition-colors">
              <MessageCircle size={12} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 text-ink-800 hover:text-teal-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Baby className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-ink-900 leading-none">{STORE.name}</h1>
                <p className="text-xs text-teal-600 font-medium hidden sm:block">{STORE.storeName}</p>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-full font-medium text-ink-700 hover:text-teal-700 hover:bg-teal-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="btn-ghost text-sm">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleSignOut} className="btn-ghost text-sm">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">
                Login
              </Link>
            )}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sun-400 text-ink-900 text-xs font-bold flex items-center justify-center animate-fade-in">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sun-400 text-ink-900 text-xs font-bold flex items-center justify-center animate-fade-in">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-200 bg-cream-50 animate-slide-up">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-medium text-ink-800 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-cream-200 mt-2 pt-2">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl font-medium text-ink-800 hover:bg-teal-50 block"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-ink-800 hover:bg-teal-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium text-ink-800 hover:bg-teal-50 block"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
