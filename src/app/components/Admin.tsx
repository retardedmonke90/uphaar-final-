import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { api } from '../../utils/api';
import { ADMIN_EMAIL, isAdminEmail } from '../lib/auth';
import { getLocalSession, signInAdmin, signOutLocal, subscribeAuth, type LocalAuthSession } from '../lib/localAuth';
import { toast } from 'sonner';
import {
  Package,
  ShoppingBag,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Truck,
  ClipboardList,
  Mail,
  LogIn,
  LogOut,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const EMPTY_PRODUCT = {
  id: '',
  name: '',
  category: 'Accessories',
  price: 0,
  image: '',
  description: '',
  stock: 0,
  emoji: '🎁',
  featured: false,
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function Admin() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<LocalAuthSession | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setSession(getLocalSession());
    const unsubscribe = subscribeAuth(setSession);
    return () => unsubscribe();
  }, []);

  const isAdminAuthed = useMemo(() => session?.role === 'admin' && isAdminEmail(session.email), [session]);

  useEffect(() => {
    if (isAdminAuthed) {
      void loadDashboard();
    }
  }, [isAdminAuthed]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    return {
      products: products.length,
      orders: orders.length,
      revenue,
      pending: orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'pending_payment').length,
    };
  }, [products, orders]);

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Enter the admin email');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Use a password with at least 6 characters');
      return;
    }
    setAuthLoading(true);
    try {
      const nextSession = await signInAdmin(email, password);
      setSession(nextSession);
      toast.success('Admin access granted');
      setPassword('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to authenticate admin');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [productResult, orderResult] = await Promise.all([api.getProducts(), api.getOrders()]);
      setProducts(productResult.products || []);
      setOrders(orderResult.orders || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminUpsertProduct(
        {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          featured: Boolean(form.featured),
          id: editingId || form.id || undefined,
        },
        import.meta.env.VITE_ADMIN_ACCESS_CODE || 'phulwari-admin-access',
      );
      toast.success(editingId ? 'Product updated' : 'Product added');
      setForm(EMPTY_PRODUCT);
      setEditingId(null);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setForm({ ...product });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.adminDeleteProduct(id, import.meta.env.VITE_ADMIN_ACCESS_CODE || 'phulwari-admin-access');
      toast.success('Product deleted');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const updateStatus = async (orderId: string, orderStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, { orderStatus }, import.meta.env.VITE_ADMIN_ACCESS_CODE || 'phulwari-admin-access');
      toast.success(`Order marked as ${orderStatus}`);
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order');
    }
  };

  const setProductStock = async (product: any, nextStock: number) => {
    try {
      await api.adminUpsertProduct(
        {
          ...product,
          stock: nextStock,
          id: product.id,
        },
        import.meta.env.VITE_ADMIN_ACCESS_CODE || 'phulwari-admin-access',
      );
      toast.success(nextStock === 0 ? 'Marked out of stock' : 'Product restocked');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  const handleLogout = async () => {
    signOutLocal();
    setSession(null);
    toast.success('Logged out successfully');
  };

  if (!isAdminAuthed) {
    return (
      <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.92)] p-8 shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2d7] text-[#e97a7a]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">Admin Management</p>
              <h1 className="mt-3 font-heading text-4xl font-black text-[#7d262e]">Secure Dashboard</h1>
              <p className="mt-3 text-[#7c5f5f]">
                Sign in with the owner email and password to manage products, orders, and shipping.
              </p>
            </div>

            <form onSubmit={authenticate} className="space-y-4">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b07878]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin email"
                  className="w-full rounded-full border border-[#e97a7a]/14 bg-white/90 px-5 py-4 pl-12 text-[#7d262e] outline-none focus:border-[#e97a7a]/35"
                />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full rounded-full border border-[#e97a7a]/14 bg-white/90 px-5 py-4 text-[#7d262e] outline-none focus:border-[#e97a7a]/35"
              />
              <button
                disabled={authLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e97a7a] px-6 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] disabled:opacity-60 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                {authLoading ? 'Signing in…' : 'Open Dashboard'}
              </button>
              <p className="text-center text-xs text-[#a98282]">
                Admin access is locked to <span className="font-semibold">{ADMIN_EMAIL}</span> only.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.9)] p-8 shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">UPHAAR Admin</p>
              <h1 className="mt-3 font-heading text-5xl font-black text-[#7d262e]">Dashboard</h1>
              <p className="mt-3 max-w-2xl text-[#7c5f5f]">
                Add products, manage shipping, and handle orders without touching the codebase.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 rounded-full bg-[#e97a7a] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] active:scale-[0.98]"
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-[#e97a7a]/14 bg-white/80 px-6 py-3 font-semibold text-[#7d262e] transition-all duration-300 hover:bg-white active:scale-[0.98]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <AdminStat icon={<Package className="h-6 w-6" />} label="Products" value={stats.products} />
            <AdminStat icon={<ClipboardList className="h-6 w-6" />} label="Orders" value={stats.orders} />
            <AdminStat icon={<ShoppingBag className="h-6 w-6" />} label="Revenue" value={`₹${stats.revenue.toFixed(0)}`} />
            <AdminStat icon={<Truck className="h-6 w-6" />} label="Pending" value={stats.pending} />
          </div>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.9)] p-8 shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">Quick Product Upload</p>
                <h2 className="mt-3 font-heading text-3xl font-black text-[#7d262e]">Add a new release</h2>
                <p className="mt-2 text-sm text-[#7c5f5f]">Ask for the product name, image, and price first. Extra fields are optional.</p>
              </div>
              <div className="rounded-full bg-[#fff2d7] px-4 py-2 text-sm font-semibold text-[#7d262e]">
                {editingId ? 'Editing' : 'New Product'}
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="grid gap-4 md:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none md:col-span-2" required />
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none md:col-span-2" />
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none" required />
              <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none" required />
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none" required />
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="Emoji" className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={4} className="rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 outline-none md:col-span-2" required />
              <label className="flex items-center gap-3 rounded-2xl border border-[#e97a7a]/14 bg-white/90 px-4 py-3 md:col-span-2">
                <input checked={Boolean(form.featured)} onChange={(e) => setForm({ ...form, featured: e.target.checked })} type="checkbox" />
                Featured product
              </label>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e97a7a] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] active:scale-[0.98] md:col-span-2">
                <Plus className="h-4 w-4" />
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
            </form>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="text-[#7c5f5f]">Loading products…</div>
              ) : products.length ? (
                products.map((product) => {
                  const isOut = Number(product.stock || 0) <= 0;
                  return (
                    <div key={product.id} className="rounded-[28px] border border-[#e97a7a]/12 bg-white/80 p-5 shadow-[0_12px_30px_rgba(233,122,122,0.08)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-4xl">{product.emoji || '🎁'}</div>
                          <h3 className="mt-3 font-heading text-xl font-black text-[#7d262e]">{product.name}</h3>
                          <p className="mt-1 text-sm text-[#b07878]">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-[#e97a7a]">₹{product.price}</div>
                          <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isOut ? 'bg-[#ffe4e4] text-[#7d262e]' : 'bg-[#fff2d7] text-[#7d262e]'}`}>
                            {isOut ? 'Out of stock' : `${product.stock} in stock`}
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#7c5f5f]">{product.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => handleEdit(product)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e97a7a]/14 bg-white px-3 py-2 text-sm font-semibold text-[#7d262e] transition-transform hover:scale-[1.02]">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button onClick={() => setProductStock(product, isOut ? 5 : 0)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fff2d7] px-3 py-2 text-sm font-semibold text-[#7d262e] transition-transform hover:scale-[1.02]">
                          {isOut ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          {isOut ? 'Restock' : 'Out of stock'}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="inline-flex items-center justify-center rounded-full bg-[#ffe4e4] px-3 py-2 text-sm font-semibold text-[#7d262e] transition-transform hover:scale-[1.02]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-[#7c5f5f]">No products found.</div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.9)] p-8 shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">Order Queue</p>
              <h2 className="mt-3 font-heading text-3xl font-black text-[#7d262e]">Manage orders</h2>
              <p className="mt-2 text-sm text-[#7c5f5f]">Update status, check payment progress, and keep shipping moving.</p>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-[#7c5f5f]">Loading orders…</div>
              ) : orders.length ? (
                orders.map((order) => (
                  <div key={order.id} className="rounded-[28px] border border-[#e97a7a]/12 bg-white/80 p-5 shadow-[0_12px_30px_rgba(233,122,122,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-xl font-black text-[#7d262e]">Order #{(order.orderNumber || order.id || 'N/A').toString().slice(0, 12)}</h3>
                        <p className="mt-1 text-sm text-[#7c5f5f]">{order.fullName || order.customerInfo?.name || 'Customer'}</p>
                        <p className="mt-1 text-sm text-[#b07878]">₹{order.total} • {order.items?.length || 0} item(s)</p>
                      </div>
                      <div className="text-right text-sm text-[#7c5f5f]">
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1">{order.paymentStatus || 'pending'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold transition-transform hover:scale-[1.02] ${
                            order.orderStatus === status
                              ? 'bg-[#e97a7a] text-white'
                              : 'border border-[#e97a7a]/14 bg-white text-[#7d262e]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[28px] border border-[#e97a7a]/12 bg-white/80 p-6 text-center text-[#7c5f5f] shadow-[0_12px_30px_rgba(233,122,122,0.08)]">
                  No orders yet.
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-[28px] border border-[#e97a7a]/12 bg-white/80 p-5 shadow-[0_12px_30px_rgba(233,122,122,0.08)]">
      <div className="mb-3 text-[#e97a7a]">{icon}</div>
      <div className="text-sm uppercase tracking-[0.28em] text-[#b07878]">{label}</div>
      <div className="mt-2 font-heading text-3xl font-black text-[#7d262e]">{value}</div>
    </div>
  );
}
