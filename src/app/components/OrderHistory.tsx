import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, Truck, Search } from 'lucide-react';
import { api } from '../../utils/api';
import { getLocalSession, subscribeAuth, type LocalAuthSession } from '../lib/localAuth';

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookup, setLookup] = useState({ email: '', phone: '' });
  const [session, setSession] = useState<LocalAuthSession | null>(null);

  useEffect(() => {
    setSession(getLocalSession());
    const unsubscribe = subscribeAuth(setSession);
    const saved = localStorage.getItem('phulwari-order-lookup');
    if (saved) {
      try {
        setLookup((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // ignore
      }
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, lookup.email, lookup.phone]);

  const loadOrders = async (filters?: { email?: string; phone?: string; userId?: string }) => {
    const userId = filters?.userId || session?.userId || undefined;
    const email = filters?.email || session?.email || lookup.email || undefined;
    const phone = filters?.phone || lookup.phone || undefined;

    if (!userId && !email && !phone) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await api.getOrders({ userId, email, phone });
      const sortedOrders = (result.orders || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLabel = useMemo(() => {
    if (session?.email) return session.role === 'admin' ? `Owner: ${session.email}` : `Logged in: ${session.email}`;
    if (lookup.email || lookup.phone) return `${lookup.email || lookup.phone}`;
    return 'No lookup set';
  }, [lookup, session]);

  const submitLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('phulwari-order-lookup', JSON.stringify(lookup));
    await loadOrders(lookup);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-5xl font-bold text-transparent">Order History</h1>
          <p className="text-lg text-gray-600">Track and view your past orders</p>
          <p className="mt-2 text-sm text-gray-500">Current lookup: {filterLabel}</p>
        </motion.div>

        <form onSubmit={submitLookup} className="mb-8 grid gap-4 rounded-2xl bg-white p-5 shadow-lg md:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input value={lookup.email} onChange={(e) => setLookup({ ...lookup, email: e.target.value })} placeholder="Email address" className="w-full rounded-full border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-rose-500" />
          </div>
          <input value={lookup.phone} onChange={(e) => setLookup({ ...lookup, phone: e.target.value })} placeholder="Phone number" className="w-full rounded-full border border-gray-200 px-4 py-3 outline-none focus:border-rose-500" />
          <button className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg">Find Orders</button>
        </form>

        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
            <Package className="mx-auto mb-6 h-24 w-24 text-gray-400" />
            <h3 className="mb-2 text-2xl font-bold text-gray-800">No orders yet</h3>
            <p className="mb-8 text-gray-600">When you place orders, they&apos;ll appear here</p>
            <a href="/categories" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105">Start Shopping</a>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => <OrderCard key={order.id} order={order} delay={index * 0.1} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, delay }: any) {
  const status = order.orderStatus || order.order_status || order.status || 'pending';
  const paymentStatus = order.paymentStatus || order.payment_status || 'pending';

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'shipped':
      case 'packed':
      case 'confirmed':
        return <Truck className="h-6 w-6 text-blue-500" />;
      default:
        return <Clock className="h-6 w-6 text-orange-500" />;
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
      case 'packed':
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay }} className="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">Order #{(order.orderNumber || order.id || 'N/A').toString().slice(0, 12)}</h3>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(status)}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">{paymentStatus}</span>
          </div>
          <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-600">₹{order.total}</div>
            <div className="text-sm text-gray-500">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="mb-3 font-semibold text-gray-700">Order Items</h4>
        <div className="space-y-2">
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{item.name} x {item.quantity}</span>
              <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {(order.customerInfo || order.fullName) && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="mb-2 font-semibold text-gray-700">Delivery Address</h4>
          <p className="text-sm text-gray-600">
            {order.fullName || order.customerInfo?.name}
            <br />
            {order.address || order.customerInfo?.address}
            <br />
            {(order.city || order.customerInfo?.city) + ' - ' + (order.pincode || order.customerInfo?.pincode)}
            <br />
            {order.phone || order.customerInfo?.phone}
          </p>
        </div>
      )}
    </motion.div>
  );
}
