import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, uploadImage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { STORE, formatPrice } from '@/lib/constants';
import type { ProductWithCategory, OrderWithItems, Category, OrderStatus } from '@/types';
import { Package, ShoppingCart, TrendingUp, Plus, Edit2, Trash2, X, Download, LayoutDashboard, ShoppingBag, BarChart3, ArrowLeft, Check, Settings, FolderOpen, Upload, Image as ImageIcon } from 'lucide-react';

type AdminTab = 'overview' | 'products' | 'orders' | 'categories' | 'settings';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    // Bypass login check for direct admin access
    (async () => {
      await loadData();
      setLoading(false);
    })();
  }, []);

  const loadData = async () => {
    const [{ data: prods }, { data: ords }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
    ]);
    setProducts((prods ?? []) as unknown as ProductWithCategory[]);
    setOrders((ords ?? []) as unknown as OrderWithItems[]);
    setCategories(cats ?? []);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-ink-600">Loading admin dashboard...</div>
      </div>
    );
  }

  // Analytics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayOrders = orders.filter((o) => new Date(o.created_at) >= today);
  const weekOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo);
  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.total), 0);
  const weekRevenue = weekOrders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.total), 0);

  // Top selling products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.filter((o) => o.status !== 'Cancelled').forEach((o) => {
    o.order_items.forEach((item) => {
      const key = item.product_id ?? item.product_name;
      if (!productSales[key]) productSales[key] = { name: item.product_name, qty: 0, revenue: 0 };
      productSales[key].qty += item.quantity;
      productSales[key].revenue += Number(item.line_total);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const statusColors: Record<OrderStatus, string> = {
    'New': 'bg-teal-100 text-teal-700',
    'Confirmed': 'bg-sun-100 text-sun-700',
    'Packed': 'bg-cream-200 text-ink-700',
    'Out for Delivery': 'bg-sun-200 text-sun-800',
    'Delivered': 'bg-success-100 text-success-700',
    'Cancelled': 'bg-error-100 text-error-700',
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) return;
    await supabase.from('categories').delete().eq('id', id);
    await loadData();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    await loadData();
    setSelectedOrder(null);
  };

  const exportOrdersCSV = () => {
    const headers = ['Order #', 'Date', 'Customer', 'Phone', 'Address', 'Pincode', 'Payment', 'Status', 'Total'];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      o.customer_name,
      o.customer_phone,
      o.address_line,
      o.pincode,
      o.payment_method,
      o.status,
      o.total,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'categories', label: 'Categories', icon: FolderOpen },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-ink-900 text-cream-100 lg:min-h-screen lg:fixed lg:left-0 lg:top-0 flex-shrink-0">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base">Admin Panel</h1>
              <p className="text-xs text-cream-200/60">{STORE.name}</p>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${tab === item.key ? 'bg-teal-600 text-white' : 'text-cream-200/70 hover:bg-white/10'}`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:block mt-6 pt-6 border-t border-white/10">
            <Link to="/" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-cream-200/70 hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} /> Back to Store
            </Link>
            <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-cream-200/70 hover:bg-white/10 transition-colors mt-1">
              <X size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Mobile sign out */}
        <div className="lg:hidden flex justify-end mb-4">
          <button onClick={handleSignOut} className="btn-ghost text-sm">Sign Out</button>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">Dashboard Overview</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                  <ShoppingCart size={20} className="text-teal-600" />
                </div>
                <p className="text-sm text-ink-600">Today's Orders</p>
                <p className="font-display text-2xl font-bold text-ink-900">{todayOrders.length}</p>
              </div>
              <div className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-sun-100 flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-sun-600" />
                </div>
                <p className="text-sm text-ink-600">This Week</p>
                <p className="font-display text-2xl font-bold text-ink-900">{weekOrders.length}</p>
              </div>
              <div className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center mb-3">
                  <BarChart3 size={20} className="text-success-600" />
                </div>
                <p className="text-sm text-ink-600">Week Revenue</p>
                <p className="font-display text-2xl font-bold text-ink-900">{formatPrice(weekRevenue)}</p>
              </div>
              <div className="card p-5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center mb-3">
                  <Package size={20} className="text-rose-600" />
                </div>
                <p className="text-sm text-ink-600">Total Products</p>
                <p className="font-display text-2xl font-bold text-ink-900">{products.length}</p>
              </div>
            </div>

            {/* Top products */}
            <div className="card p-5 mb-8">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Top Selling Products</h3>
              {topProducts.length === 0 ? (
                <p className="text-ink-600 text-sm">No sales data yet.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium text-ink-900">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-ink-600">{p.qty} sold</span>
                        <span className="font-semibold text-ink-900">{formatPrice(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent orders */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-ink-900">Recent Orders</h3>
                <button onClick={() => setTab('orders')} className="text-sm text-teal-600 hover:text-teal-700 font-medium">View All</button>
              </div>
              {orders.length === 0 ? (
                <p className="text-ink-600 text-sm">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-cream-100 last:border-0">
                      <div>
                        <p className="font-medium text-ink-900">#{o.order_number}</p>
                        <p className="text-xs text-ink-600">{o.customer_name} &middot; {new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
                        <span className="font-semibold text-ink-900">{formatPrice(Number(o.total))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-ink-900">Products ({products.length})</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="btn-primary text-sm"
              >
                <Plus size={18} /> Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="card p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                      {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink-900 text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-ink-600">{p.category?.name ?? 'Uncategorized'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-ink-900 text-sm">{formatPrice(p.discount_price ?? p.price)}</span>
                        {p.discount_price && <span className="text-xs text-ink-600/50 line-through">{formatPrice(p.price)}</span>}
                      </div>
                      <p className="text-xs text-ink-600 mt-0.5">Stock: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                      className="flex-1 btn-ghost text-sm py-1.5"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="px-3 py-1.5 rounded-full text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showProductForm && (
              <ProductFormModal
                product={editingProduct}
                categories={categories}
                onClose={() => setShowProductForm(false)}
                onSaved={() => { setShowProductForm(false); loadData(); }}
              />
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-ink-900">Orders ({orders.length})</h2>
              <button onClick={exportOrdersCSV} className="btn-outline text-sm">
                <Download size={16} /> Export CSV
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-ink-600">No orders yet. Orders will appear here once customers start shopping.</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-cream-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-ink-900">Order #</th>
                        <th className="text-left py-3 px-4 font-semibold text-ink-900">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-ink-900 hidden sm:table-cell">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-ink-900 hidden md:table-cell">Payment</th>
                        <th className="text-left py-3 px-4 font-semibold text-ink-900">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-ink-900">Total</th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                          <td className="py-3 px-4 font-medium text-ink-900">#{o.order_number}</td>
                          <td className="py-3 px-4">
                            <p className="text-ink-900">{o.customer_name}</p>
                            <p className="text-xs text-ink-600">{o.customer_phone}</p>
                          </td>
                          <td className="py-3 px-4 text-ink-600 hidden sm:table-cell">{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-ink-600 hidden md:table-cell">{o.payment_method}</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-ink-900">{formatPrice(Number(o.total))}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => setSelectedOrder(o)} className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedOrder && (
              <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={(status) => handleUpdateOrderStatus(selectedOrder.id, status)}
              />
            )}
          </div>
        )}

        {/* Categories */}
        {tab === 'categories' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-ink-900">Categories ({categories.length})</h2>
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
                className="btn-primary text-sm"
              >
                <Plus size={18} /> Add Category
              </button>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-ink-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-ink-900">Slug</th>
                    <th className="text-left py-3 px-4 font-semibold text-ink-900">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-ink-900">Order</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                      <td className="py-3 px-4 font-medium text-ink-900">{cat.name}</td>
                      <td className="py-3 px-4 text-ink-600">{cat.slug}</td>
                      <td className="py-3 px-4 text-ink-600">{cat.description || '-'}</td>
                      <td className="py-3 px-4 text-ink-600">{cat.display_order}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showCategoryForm && (
              <CategoryFormModal
                category={editingCategory}
                onClose={() => setShowCategoryForm(false)}
                onSaved={() => { setShowCategoryForm(false); loadData(); }}
              />
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-6">Store Settings</h2>
            <div className="space-y-6">
              {/* Store Information */}
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Store Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Store Name</label>
                    <input type="text" defaultValue={STORE.storeName} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Tagline</label>
                    <input type="text" defaultValue={STORE.tagline} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Full Address</label>
                    <textarea defaultValue={STORE.address} className="input-field min-h-[80px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Phone Numbers (comma-separated)</label>
                    <input type="text" defaultValue={STORE.phones.join(', ')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">WhatsApp Number</label>
                    <input type="text" defaultValue={STORE.whatsapp} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">UPI ID</label>
                    <input type="text" defaultValue={STORE.upiId} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Business Hours</label>
                    <input type="text" defaultValue={STORE.hours} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Delivery Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Delivery Zone Description</label>
                    <textarea defaultValue={STORE.deliveryZone} className="input-field min-h-[80px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Delivery Estimate</label>
                    <input type="text" defaultValue={STORE.deliveryEstimate} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1">Delivery Pincodes (comma-separated)</label>
                    <input type="text" defaultValue={STORE.deliveryPincodes.join(', ')} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-cream-200 rounded-xl cursor-pointer hover:bg-cream-50">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-teal-600" />
                    <div>
                      <p className="font-medium text-ink-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-ink-600">Pay when you receive your order</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-cream-200 rounded-xl cursor-pointer hover:bg-cream-50">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-teal-600" />
                    <div>
                      <p className="font-medium text-ink-900">UPI (GPay, PhonePe, Paytm)</p>
                      <p className="text-sm text-ink-600">Instant payment via UPI apps</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-cream-200 rounded-xl cursor-pointer hover:bg-cream-50">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-teal-600" />
                    <div>
                      <p className="font-medium text-ink-900">Card / Net Banking</p>
                      <p className="text-sm text-ink-600">Credit card, debit card, or net banking</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button className="btn-outline">Reset to Defaults</button>
                <button className="btn-primary">Save Settings</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Age range utilities
const AGE_RANGE_OPTIONS = [
  '0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y'
];

const parseAgeRange = (ageRange: string): string[] => {
  if (!ageRange) return [];
  // Parse ranges like "4-6Y" into individual options ["4-5Y", "5-6Y"]
  const ranges = ageRange.split(',').map(r => r.trim());
  const selected: string[] = [];
  
  ranges.forEach(range => {
    const match = range.match(/(\d+)-(\d+)([MY])/i);
    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      const unit = match[3].toUpperCase();
      
      if (unit === 'M') {
        // For months, add individual month ranges
        for (let i = start; i < end; i += 6) {
          const option = `${i}-${i + 6}M`;
          if (AGE_RANGE_OPTIONS.includes(option)) {
            selected.push(option);
          }
        }
      } else {
        // For years, add individual year ranges
        for (let i = start; i < end; i++) {
          const option = `${i}-${i + 1}Y`;
          if (AGE_RANGE_OPTIONS.includes(option)) {
            selected.push(option);
          }
        }
      }
    } else {
      // If it's already in the format of an option, add it directly
      if (AGE_RANGE_OPTIONS.includes(range)) {
        selected.push(range);
      }
    }
  });
  
  return [...new Set(selected)].sort();
};

const formatAgeRange = (selectedRanges: string[]): string => {
  if (selectedRanges.length === 0) return '';
  
  // Group by unit (M or Y)
  const monthRanges = selectedRanges.filter(r => r.endsWith('M')).map(r => r.replace('M', '').split('-').map(Number));
  const yearRanges = selectedRanges.filter(r => r.endsWith('Y')).map(r => r.replace('Y', '').split('-').map(Number));
  
  const formatted: string[] = [];
  
  // Merge consecutive month ranges
  if (monthRanges.length > 0) {
    monthRanges.sort((a, b) => a[0] - b[0]);
    let currentStart = monthRanges[0][0];
    let currentEnd = monthRanges[0][1];
    
    for (let i = 1; i < monthRanges.length; i++) {
      if (monthRanges[i][0] === currentEnd) {
        currentEnd = monthRanges[i][1];
      } else {
        formatted.push(`${currentStart}-${currentEnd}M`);
        currentStart = monthRanges[i][0];
        currentEnd = monthRanges[i][1];
      }
    }
    formatted.push(`${currentStart}-${currentEnd}M`);
  }
  
  // Merge consecutive year ranges
  if (yearRanges.length > 0) {
    yearRanges.sort((a, b) => a[0] - b[0]);
    let currentStart = yearRanges[0][0];
    let currentEnd = yearRanges[0][1];
    
    for (let i = 1; i < yearRanges.length; i++) {
      if (yearRanges[i][0] === currentEnd) {
        currentEnd = yearRanges[i][1];
      } else {
        formatted.push(`${currentStart}-${currentEnd}Y`);
        currentStart = yearRanges[i][0];
        currentEnd = yearRanges[i][1];
      }
    }
    formatted.push(`${currentStart}-${currentEnd}Y`);
  }
  
  return formatted.join(', ');
};

// Product Form Modal
type ProductFormState = {
  name: string;
  description: string;
  category_id: string;
  gender: 'Boy' | 'Girl' | 'Unisex';
  selected_age_ranges: string[];
  showAgeDropdown: boolean;
  sizes: string;
  colors: string;
  price: string;
  discount_price: string;
  stock: string;
  images: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
};

function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductWithCategory | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormState>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    category_id: product?.category_id ?? '',
    gender: product?.gender ?? 'Unisex',
    selected_age_ranges: product?.age_range ? parseAgeRange(product.age_range) : [],
    showAgeDropdown: false,
    sizes: (product?.sizes ?? []).join(', '),
    colors: (product?.colors ?? []).join(', '),
    price: product?.price?.toString() ?? '',
    discount_price: product?.discount_price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '0',
    images: (product?.images ?? []).join(', '),
    featured: product?.featured ?? false,
    best_seller: product?.best_seller ?? false,
    new_arrival: product?.new_arrival ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      setImageFiles(prev => [...prev, ...files]);
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formattedAgeRange = formatAgeRange(form.selected_age_ranges);
      const payload = {
        name: form.name,
        description: form.description || null,
        category_id: form.category_id || null,
        gender: form.gender,
        age_range: formattedAgeRange || null,
        sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        price: parseFloat(form.price) || 0,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        stock: parseInt(form.stock) || 0,
        images: uploadedImages,
        featured: form.featured,
        best_seller: form.best_seller,
        new_arrival: form.new_arrival,
      };

      if (product) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', product.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('products').insert(payload);
        if (err) throw err;
      }
      onSaved();
    } catch (err: any) {
      console.error('Product save error:', err);
      setError(err?.message || 'Could not save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-cream-50 rounded-3xl shadow-2xl p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Product Name *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Product name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" placeholder="Product description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'Boy' | 'Girl' | 'Unisex' })} className="input-field">
                <option value="Unisex">Unisex</option>
                <option value="Boy">Boy</option>
                <option value="Girl">Girl</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Age Range</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setForm({ ...form, showAgeDropdown: !form.showAgeDropdown })}
                className="w-full input-field text-left flex items-center justify-between"
              >
                <span>
                  {form.selected_age_ranges.length > 0 
                    ? `${form.selected_age_ranges.length} range${form.selected_age_ranges.length > 1 ? 's' : ''} selected`
                    : 'Select age ranges'}
                </span>
                <span className="text-ink-600">{form.showAgeDropdown ? '▲' : '▼'}</span>
              </button>
              
              {form.showAgeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-cream-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-cream-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.selected_age_ranges.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({ 
                              ...form, 
                              selected_age_ranges: [...form.selected_age_ranges, option].sort() 
                            });
                          } else {
                            setForm({ 
                              ...form, 
                              selected_age_ranges: form.selected_age_ranges.filter(r => r !== option) 
                            });
                          }
                        }}
                        className="w-4 h-4 rounded text-teal-600"
                      />
                      <span className="text-sm text-ink-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {form.selected_age_ranges.length > 0 && (
              <div className="mt-2 text-xs text-ink-600">
                <span className="font-medium">Formatted as:</span> {formatAgeRange(form.selected_age_ranges)}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Sizes (comma-separated)</label>
              <input type="text" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="input-field" placeholder="2-3Y, 4-5Y" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Colors (comma-separated)</label>
              <input type="text" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className="input-field" placeholder="Red, Blue" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Price *</label>
              <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="299" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Discount Price</label>
              <input type="number" step="0.01" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className="input-field" placeholder="249" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-900 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" placeholder="10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Product Images</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-cream-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                >
                  <Upload size={20} className="text-ink-600" />
                  <span className="text-sm text-ink-600">
                    {uploading ? 'Uploading...' : 'Click to upload images (or drag and drop)'}
                  </span>
                </label>
              </div>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-cream-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-error-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs text-ink-600">
                <span className="font-medium">Tip:</span> You can also paste image URLs below as backup
              </div>
              <input
                type="text"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="input-field text-sm"
                placeholder="https://example.com/image.jpg (optional, comma-separated for multiple)"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded text-teal-600" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} className="w-4 h-4 rounded text-teal-600" />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={form.new_arrival} onChange={(e) => setForm({ ...form, new_arrival: e.target.checked })} className="w-4 h-4 rounded text-teal-600" />
              New Arrival
            </label>
          </div>

          {error && <div className="p-3 rounded-xl bg-error-50 text-error-700 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Order Detail Modal
function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: OrderWithItems;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}) {
  const statuses: OrderStatus[] = ['New', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-cream-50 rounded-3xl shadow-2xl p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink-900">Order #{order.order_number}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-200"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {/* Customer info */}
          <div className="card p-4">
            <h3 className="font-semibold text-ink-900 mb-2">Customer</h3>
            <div className="space-y-1 text-sm text-ink-700">
              <p><span className="font-medium">Name:</span> {order.customer_name}</p>
              <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
              {order.customer_whatsapp && <p><span className="font-medium">WhatsApp:</span> {order.customer_whatsapp}</p>}
              {order.email && <p><span className="font-medium">Email:</span> {order.email}</p>}
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-4">
            <h3 className="font-semibold text-ink-900 mb-2">Delivery Address</h3>
            <div className="space-y-1 text-sm text-ink-700">
              <p>{order.address_line}</p>
              {order.landmark && <p>Landmark: {order.landmark}</p>}
              <p>PIN: {order.pincode}</p>
              {order.delivery_instructions && <p>Instructions: {order.delivery_instructions}</p>}
            </div>
          </div>

          {/* Items */}
          <div className="card p-4">
            <h3 className="font-semibold text-ink-900 mb-2">Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-ink-900">{item.product_name}</p>
                    <p className="text-xs text-ink-600">{item.size} &middot; {item.color} &middot; Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-ink-900">{formatPrice(Number(item.line_total))}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 mt-3 pt-3 flex justify-between items-baseline">
              <span className="font-display font-bold text-ink-900">Total</span>
              <span className="font-display text-xl font-bold text-ink-900">{formatPrice(Number(order.total))}</span>
            </div>
            <p className="text-sm text-ink-600 mt-2">Payment: {order.payment_method}</p>
          </div>

          {/* Status update */}
          <div className="card p-4">
            <h3 className="font-semibold text-ink-900 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${order.status === s ? 'bg-teal-600 text-white' : 'bg-cream-100 text-ink-700 hover:bg-cream-200'}`}
                >
                  {order.status === s && <Check size={14} className="inline mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Form Modal
function CategoryFormModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    display_order: category?.display_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
        description: form.description || null,
        display_order: parseInt(String(form.display_order)) || 0,
      };

      if (category) {
        const { error: err } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('categories').insert(payload);
        if (err) throw err;
      }
      onSaved();
    } catch {
      setError('Could not save category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-cream-50 rounded-3xl shadow-2xl p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-ink-900">{category ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-cream-200"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Baby Clothes"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input-field"
              placeholder="e.g. baby-clothes"
            />
            <p className="text-xs text-ink-600 mt-1">URL-friendly identifier (lowercase, hyphens)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="Brief description of this category"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-1">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
              className="input-field"
              placeholder="0"
            />
            <p className="text-xs text-ink-600 mt-1">Lower numbers appear first</p>
          </div>

          {error && <div className="p-3 rounded-xl bg-error-50 text-error-700 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
