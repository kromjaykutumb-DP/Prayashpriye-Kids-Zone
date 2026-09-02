import { MapPin, Clock, Phone, MessageCircle, Baby, Heart, Store } from 'lucide-react';
import { STORE, whatsappLink, telLink } from '@/lib/constants';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Hero */}
      <section className="text-center mb-12">
        <span className="badge bg-teal-100 text-teal-700 mb-3">Our Story</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
          About {STORE.name}
        </h1>
        <p className="text-lg text-ink-700 max-w-2xl mx-auto leading-relaxed">
          Proudly presented by {STORE.storeName} &mdash; bringing quality kids&rsquo; clothing to Darjeeling families, now online with free delivery.
        </p>
      </section>

      {/* Store photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[16/9] mb-12 bg-gradient-to-br from-teal-100 to-cream-100">
        <img
          src="https://images.pexels.com/photos/3933247/pexels-photo-3933247.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Our store in Darjeeling"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4">
          <p className="font-display font-bold text-ink-900">{STORE.storeName}</p>
          <p className="text-sm text-ink-600">{STORE.shortAddress}</p>
        </div>
      </div>

      {/* Story */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Store size={24} className="text-teal-600" />
              <h2 className="font-display text-2xl font-bold text-ink-900">Our Physical Store</h2>
            </div>
            <p className="text-ink-700 leading-relaxed mb-4">
              {STORE.storeName} has been a trusted name in kids&rsquo; clothing for years. Located in the heart of New Market, our store has served generations of families with quality clothing for their little ones.
            </p>
            <p className="text-ink-700 leading-relaxed mb-4">
              From baby essentials to festive ethnic wear and warm winter clothing for the Darjeeling hills, we carefully select each piece to ensure comfort, quality, and value for your children.
            </p>
          </div>
          <div className="card p-6 bg-gradient-to-br from-teal-50 to-cream-50">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={24} className="text-rose-500" />
              <h3 className="font-display text-lg font-bold text-ink-900">Why Families Trust Us</h3>
            </div>
            <ul className="space-y-3 text-sm text-ink-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                Years of experience serving Darjeeling families
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                Quality-checked clothing for kids of all ages
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                Free delivery within Darjeeling town and nearby
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                Cash on Delivery, UPI, and easy exchanges
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                Personal service via phone and WhatsApp
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Visit us */}
      <section className="card p-6 mb-8">
        <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">Visit Our Store</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink-900">Address</p>
                <p className="text-sm text-ink-600">{STORE.address}</p>
                <a href={STORE.mapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700 mt-1 inline-block">
                  View on Google Maps &rarr;
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink-900">Opening Hours</p>
                <p className="text-sm text-ink-600">{STORE.hours}</p>
              </div>
            </div>
            {STORE.phones.map((phone) => (
              <div key={phone} className="flex items-start gap-3">
                <Phone size={20} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-ink-900">Phone</p>
                  <a href={telLink(phone)} className="text-sm text-ink-600 hover:text-teal-700">{phone}</a>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3">
              <MessageCircle size={20} className="text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink-900">WhatsApp</p>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-700">
                  Chat with us
                </a>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-cream-100 min-h-[200px]">
            <iframe
              title="Store location"
              src={STORE.mapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '200px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 text-white">
        <Baby size={32} className="mx-auto mb-3 text-sun-300" />
        <h2 className="font-display text-2xl font-bold mb-2">Shop Online or Visit Us</h2>
        <p className="text-teal-100 mb-6">Browse our collection online with free delivery in Darjeeling, or stop by our store.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="/shop" className="btn-accent">Shop Online</a>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white px-6 py-3 font-semibold text-white transition-all hover:bg-white/10 active:scale-95">
            <MessageCircle size={18} /> WhatsApp Us
          </a>
        </div>
      </section>
    </div>
  );
}
