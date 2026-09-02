import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, ShoppingBag, Phone, MessageCircle, ArrowRight, Lock, Mail, UserPlus, LogIn, AlertCircle, Baby } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { STORE, whatsappLink, telLink } from '@/lib/constants';

type Role = 'admin' | 'customer';
type CustomerTab = 'signin' | 'signup';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerTab>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Customer sign in
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Customer sign up
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (err) throw err;
      if (data.user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('This account does not have admin access.');
      }
      navigate('/admin');
    } catch {
      setError('Invalid admin credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      if (err) throw err;
      navigate('/');
    } catch {
      setError('Could not sign in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (signUpPassword !== signUpConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpName,
            phone: signUpPhone,
          },
        },
      });
      if (err) throw err;
      navigate('/');
    } catch {
      setError('Could not create account. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-teal-50 via-cream-50 to-sun-50 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg mb-3">
            <Baby className="text-white" size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{STORE.name}</h1>
          <p className="text-sm text-ink-600">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Role selector */}
        <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-4 shadow-sm ring-1 ring-cream-200">
          <button
            onClick={() => { setRole('customer'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${role === 'customer' ? 'bg-teal-600 text-white shadow-md' : 'text-ink-700 hover:bg-cream-100'}`}
          >
            <User size={16} /> Customer
          </button>
          <button
            onClick={() => { setRole('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${role === 'admin' ? 'bg-ink-900 text-white shadow-md' : 'text-ink-700 hover:bg-cream-100'}`}
          >
            <Store size={16} /> Store Owner / Admin
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-50 text-error-700 text-sm flex items-start gap-2 animate-slide-up">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Admin login */}
        {role === 'admin' && (
          <div className="card p-6 animate-slide-up">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-1">Admin Login</h2>
            <p className="text-sm text-ink-600 mb-4">Sign in to manage products and orders.</p>

            {/* Development bypass */}
            <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-xs text-teal-700 font-medium mb-2">Development Mode</p>
              <button
                onClick={() => navigate('/admin')}
                className="w-full btn-accent text-sm py-2"
              >
                Skip Login & Go to Admin Dashboard
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="input-field pl-9"
                    placeholder="Your password"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Signing in...' : 'Login as Admin'} <ArrowRight size={18} />
              </button>
              <div className="text-center">
                <a href="#" className="text-sm text-teal-600 hover:text-teal-700">Forgot password?</a>
              </div>
            </form>
          </div>
        )}

        {/* Customer login */}
        {role === 'customer' && (
          <div className="card p-6 animate-slide-up">
            {/* Development bypass */}
            <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-200">
              <p className="text-xs text-teal-700 font-medium mb-2">Development Mode</p>
              <button
                onClick={() => navigate('/shop')}
                className="w-full btn-accent text-sm py-2"
              >
                Skip Login & Shop as Guest
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-cream-100 rounded-xl p-1 mb-4">
              <button
                onClick={() => { setCustomerTab('signin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${customerTab === 'signin' ? 'bg-white text-teal-700 shadow-sm' : 'text-ink-700'}`}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                onClick={() => { setCustomerTab('signup'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${customerTab === 'signup' ? 'bg-white text-teal-700 shadow-sm' : 'text-ink-700'}`}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>

            {customerTab === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="input-field pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                    <input
                      type="password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Your password"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                </button>
                <div className="text-center">
                  <a href="#" className="text-sm text-teal-600 hover:text-teal-700">Forgot password?</a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                    <input
                      type="text"
                      required
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="input-field pl-9"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="input-field pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                    <input
                      type="tel"
                      required
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      className="input-field pl-9"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                      <input
                        type="password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="input-field pl-9"
                        placeholder="Min 6 chars"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Confirm</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600/40" />
                      <input
                        type="password"
                        required
                        value={signUpConfirm}
                        onChange={(e) => setSignUpConfirm(e.target.value)}
                        className="input-field pl-9"
                        placeholder="Repeat password"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                  {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Guest notice */}
            <div className="mt-5 pt-5 border-t border-cream-200">
              <div className="flex items-start gap-2 mb-3">
                <ShoppingBag size={16} className="text-teal-600 mt-0.5 shrink-0" />
                <p className="text-sm text-ink-600">
                  You can also shop without creating an account. Just add items to your cart and checkout as a guest.
                </p>
              </div>
              <Link to="/shop" className="btn-outline w-full">
                Continue as Guest <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ink-600 mb-2">Need help?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {STORE.phones.map((phone) => (
              <a key={phone} href={telLink(phone)} className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700">
                <Phone size={14} /> {phone}
              </a>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-success-600 hover:text-success-700">
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
