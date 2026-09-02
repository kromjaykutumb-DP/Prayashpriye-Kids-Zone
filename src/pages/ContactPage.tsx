import { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Send, Check } from 'lucide-react';
import { STORE, whatsappLink, telLink } from '@/lib/constants';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(`Hi, my name is ${form.name}. My phone: ${form.phone}. Message: ${form.message}`);
    window.open(`https://wa.me/${STORE.whatsapp}?text=${text}`, '_blank');
    setSent(true);
    setForm({ name: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-2">Get in Touch</h1>
        <p className="text-ink-600">We&rsquo;re here to help with any questions about products, orders, or delivery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                <Phone size={22} className="text-teal-600" />
              </div>
              <div>
                <h2 className="font-semibold text-ink-900">Call Us</h2>
                <div className="flex flex-col gap-1 mt-1">
                  {STORE.phones.map((phone) => (
                    <a key={phone} href={telLink(phone)} className="text-ink-600 hover:text-teal-700 transition-colors">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="card p-5 block hover:bg-success-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center shrink-0">
                <MessageCircle size={22} className="text-success-600" />
              </div>
              <div>
                <h2 className="font-semibold text-ink-900">WhatsApp Chat</h2>
                <p className="text-sm text-ink-600 mt-1">Quick answers to your questions. Tap to start chatting.</p>
              </div>
            </div>
          </a>

          <div className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sun-100 flex items-center justify-center shrink-0">
                <MapPin size={22} className="text-sun-600" />
              </div>
              <div>
                <h2 className="font-semibold text-ink-900">Visit Our Store</h2>
                <p className="text-sm text-ink-600 mt-1">{STORE.address}</p>
                <p className="text-sm text-ink-600 mt-1">{STORE.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className="card p-6">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Send Us a Message</h2>
          <p className="text-sm text-ink-600 mb-4">Fill in the form and we&rsquo;ll get back to you on WhatsApp.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Message *</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field min-h-[100px]"
                placeholder="How can we help you?"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Send size={18} /> Send via WhatsApp
            </button>
            {sent && (
              <div className="p-3 rounded-xl bg-success-50 text-success-700 text-sm flex items-center gap-2 animate-slide-up">
                <Check size={16} /> Opening WhatsApp with your message...
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
