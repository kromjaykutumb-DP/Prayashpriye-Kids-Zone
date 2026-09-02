import { Link } from 'react-router-dom';
import { Baby, Phone, MessageCircle, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { STORE, whatsappLink, telLink } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Baby className="text-white" size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{STORE.name}</h3>
                <p className="text-xs text-teal-300">{STORE.storeName}</p>
              </div>
            </div>
            <p className="text-sm text-cream-200/70 leading-relaxed">
              Proudly presented by {STORE.storeName} &mdash; Your trusted kids&rsquo; clothing store in Darjeeling. Now online with free delivery.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-600 flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-teal-600 flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-cream-200/70 hover:text-sun-300 transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="text-cream-200/70 hover:text-sun-300 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-cream-200/70 hover:text-sun-300 transition-colors">Contact</Link></li>
              <li><Link to="/login" className="text-cream-200/70 hover:text-sun-300 transition-colors">Login / Sign Up</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/policies/delivery" className="text-cream-200/70 hover:text-sun-300 transition-colors">Delivery & Shipping</Link></li>
              <li><Link to="/policies/returns" className="text-cream-200/70 hover:text-sun-300 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/policies/privacy" className="text-cream-200/70 hover:text-sun-300 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policies/terms" className="text-cream-200/70 hover:text-sun-300 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Visit Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <span className="text-cream-200/70">{STORE.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-teal-400 shrink-0" />
                <span className="text-cream-200/70">{STORE.hours}</span>
              </li>
              {STORE.phones.map((phone) => (
                <li key={phone}>
                  <a href={telLink(phone)} className="flex items-center gap-2 text-cream-200/70 hover:text-sun-300 transition-colors">
                    <Phone size={16} className="text-teal-400 shrink-0" />
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cream-200/70 hover:text-sun-300 transition-colors">
                  <MessageCircle size={16} className="text-teal-400 shrink-0" />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-200/50">
            &copy; {new Date().getFullYear()} {STORE.name} ({STORE.storeName}). All rights reserved.
          </p>
          <p className="text-xs text-cream-200/50">Made with care in Darjeeling, India</p>
        </div>
      </div>
    </footer>
  );
}
