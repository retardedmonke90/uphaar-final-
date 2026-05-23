import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { CreditCard, MapPin, User, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../../utils/api';
import { getLocalSession } from '../lib/localAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import paymentQr from '../../imports/payment-qr.png';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, discount, freeShipping, clearCart, authSession } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentOrderId, setPaymentOrderId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  useEffect(() => {
    const saved = localStorage.getItem('phulwari-checkout-form');
    if (saved) {
      try {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch {
        // ignore
      }
    }

    const session = getLocalSession();
    if (session?.email) {
      setFormData((prev) => ({ ...prev, email: prev.email || session.email }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('phulwari-checkout-form', JSON.stringify(formData));
  }, [formData]);

  const shipping = freeShipping || totalAmount > 499 ? 0 : 50;
  const finalAmount = Math.max(0, totalAmount + shipping - discount);

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const saveLookup = (userId: string) => {
    localStorage.setItem(
      'phulwari-order-lookup',
      JSON.stringify({
        email: formData.email,
        phone: formData.phone,
        userId,
      }),
    );
    localStorage.setItem('phulwari-user-id', userId);
  };

  const getUserId = async () => {
    const session = getLocalSession();
    return session?.userId || localStorage.getItem('phulwari-user-id') || '';
  };

  const finalizeOrder = (placedOrderId: string, userId: string) => {
    setOrderId(placedOrderId);
    setOrderPlaced(true);
    clearCart();
    saveLookup(userId);

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => navigate('/orders'), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authSession?.email) {
      toast.error('Please create an account or sign in before placing an order.');
      navigate('/account');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const userId = await getUserId();
      if (userId) {
        localStorage.setItem('phulwari-user-id', userId);
      }
      const orderPayload = {
        userId,
        customerInfo: formData,
        items: cartItems,
        subtotal: totalAmount,
        shipping,
        discount,
        total: finalAmount,
        paymentMethod: formData.paymentMethod,
      };

      if (formData.paymentMethod === 'online') {
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
        const scriptLoaded = await loadRazorpayScript();

        if (key && scriptLoaded) {
          try {
            const created = await api.createRazorpayOrder(orderPayload);
            if (!created.success) {
              throw new Error(created.error || 'Failed to create payment order');
            }

            setPaymentOrderId(created.razorpayOrder.id);

            const options = {
              key,
              amount: created.razorpayOrder.amount,
              currency: created.razorpayOrder.currency,
              name: 'UPHAAR',
              description: 'Cute accessories for your softest era',
              order_id: created.razorpayOrder.id,
              prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone,
              },
              theme: {
                color: '#e97a7a',
              },
              handler: async (response: any) => {
                try {
                  const verify = await api.verifyRazorpayPayment({
                    dbOrderId: created.order.id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  });

                  if (!verify.success) {
                    throw new Error(verify.error || 'Payment verification failed');
                  }

                  finalizeOrder(created.order.id || created.razorpayOrder.id, userId);
                } catch (err: any) {
                  toast.error(err.message || 'Payment verification failed');
                }
              },
              modal: {
                ondismiss: () => toast.info('Payment window closed'),
              },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            return;
          } catch (error: any) {
            toast.info('Razorpay is not ready yet. Saving this as a manual payment order.');
            console.warn(error);
          }
        } else {
          toast.info('Razorpay is not configured yet. Saving this as a manual payment order.');
        }
      }

      const result = await api.createOrder({
        ...orderPayload,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'pending_verification',
        orderStatus: formData.paymentMethod === 'cod' ? 'confirmed' : 'pending_payment',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      finalizeOrder(result.order.id || result.order.order_number || '', userId);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-2">Thank you for your purchase</p>
          <p className="text-sm text-gray-500 mb-8">Order ID: {orderId || paymentOrderId}</p>

          <div className="bg-rose-50 rounded-xl p-6 mb-6">
            <p className="text-rose-700 font-medium">We'll send you an email confirmation shortly</p>
          </div>

          <p className="text-gray-600">Redirecting to order history...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {!authSession?.email && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800">Create an account before checkout</h2>
            <p className="mt-2 text-sm text-gray-600">You can keep adding items to cart, but orders can only be placed after account creation or sign in. Your 10% welcome offer will be applied automatically on eligible orders.</p>
            <Link to="/account" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105">
              Go to Account
            </Link>
          </motion.div>
        )}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-8 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Checkout</motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-600" />
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors" required />
                  <input type="email" placeholder="Email Address *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors" required />
                  <input type="tel" placeholder="Phone Number *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors" required />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <textarea placeholder="Street Address *" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors resize-none" rows={3} required />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City *" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors" required />
                    <input type="text" placeholder="Pincode *" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors" required />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-5 h-5 text-rose-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input type="radio" name="payment" value="upi" checked={formData.paymentMethod === 'upi'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-5 h-5 text-rose-600" />
                    <span className="font-medium">UPI / QR Payment</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-rose-500 transition-colors">
                    <input type="radio" name="payment" value="online" checked={formData.paymentMethod === 'online'} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-5 h-5 text-rose-600" />
                    <span className="font-medium">Online Payment (Razorpay)</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === 'upi' && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-rose-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Scan QR to Pay</h3>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white p-3">
                    <img src={paymentQr} alt="UPI QR code" className="w-full rounded-xl object-cover" />
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    After payment, click <span className="font-semibold text-rose-600">Place Order</span>. Your order will be stored as pending and the admin can confirm it manually.
                  </p>
                </div>
              )}

              <motion.button whileHover={{ scale: authSession?.email ? 1.02 : 1 }} whileTap={{ scale: authSession?.email ? 0.98 : 1 }} type="submit" disabled={loading || !authSession?.email} className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : authSession?.email ? 'Place Order' : 'Sign In to Place Order'}
              </motion.button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700"><span>Subtotal</span><span className="font-semibold">₹{totalAmount}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span className="font-semibold">-₹{discount}</span></div>}
                <div className="flex justify-between text-gray-700"><span>Shipping</span><span className="font-semibold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-rose-600">₹{finalAmount}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
