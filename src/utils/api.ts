import { supabase } from '../app/lib/supabase';

const STORAGE_KEYS = {
  products: 'phulwari-products',
  orders: 'phulwari-orders',
  reviews: 'phulwari-reviews',
  contacts: 'phulwari-contacts',
  luckySpins: 'phulwari-lucky-spins',
};

type AnyObj = Record<string, any>;

const SAMPLE_PRODUCTS: AnyObj[] = [
  { id: 'metro-bollywood-1', name: 'Bollywood Metro Card Skin', category: 'Metro Card Skins', price: 99, image: '', description: 'Vintage Bollywood-themed metro card skin', stock: 50, emoji: '🎫', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'metro-brat-1', name: 'Brat Metro Card Skin', category: 'Metro Card Skins', price: 89, image: '', description: 'Trend-forward brat themed metro card skin', stock: 45, emoji: '🎫', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'metro-newyork-1', name: 'New York Metro Card Skin', category: 'Metro Card Skins', price: 99, image: '', description: 'NYC inspired metro card design', stock: 40, emoji: '🎫', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'flower-red-1', name: 'Handmade Red Rose', category: 'Handmade Flowers', price: 149, image: '', description: 'Beautiful handcrafted red rose', stock: 30, emoji: '🌸', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'flower-pink-1', name: 'Handmade Pink Carnation', category: 'Handmade Flowers', price: 129, image: '', description: 'Delicate handmade pink carnation', stock: 35, emoji: '🌷', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'soap-street-1', name: 'SFS Street Soap', category: 'Accessories', price: 199, image: '', description: 'Artisanal handmade soap with unique fragrance', stock: 25, emoji: '🧼', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'keychain-custom-1', name: 'Custom Name Keychain', category: 'Keychains', price: 79, image: '', description: 'Personalized acrylic keychain', stock: 60, emoji: '🔑', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sticker-pack-1', name: 'GenZ Sticker Pack', category: 'Stickers', price: 59, image: '', description: 'Pack of 10 trendy GenZ stickers', stock: 100, emoji: '🎨', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'bookmark-aesthetic-1', name: 'Aesthetic Bookmark Set', category: 'Bookmarks', price: 69, image: '', description: 'Set of 5 aesthetic bookmarks', stock: 55, emoji: '📖', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phone-grip-1', name: 'Pastel Phone Grip', category: 'Phone Accessories', price: 89, image: '', description: 'Cute pastel-colored phone grip', stock: 70, emoji: '📱', featured: false, isNewArrival: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'hair-clip-1', name: 'Cherry Blossom Hair Clip', category: 'Hair Accessories', price: 119, image: '', description: 'Soft cherry blossom clip with a glossy finish', stock: 28, emoji: '🌸', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'gift-box-1', name: 'UPHAAR Gift Box', category: 'Gift Boxes', price: 299, image: '', description: 'Curated mini gift box for special surprises', stock: 20, emoji: '🎁', featured: true, isNewArrival: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const PRIZES = [
  { text: '₹100 OFF on ₹999+', discount: 100, minPurchase: 999, freeShipping: false },
  { text: '₹50 OFF on ₹499+', discount: 50, minPurchase: 499, freeShipping: false },
  { text: '₹20 OFF on ₹299+', discount: 20, minPurchase: 299, freeShipping: false },
  { text: '₹10 OFF on any order', discount: 10, minPurchase: 0, freeShipping: false },
  { text: 'Free Shipping', discount: 0, minPurchase: 0, freeShipping: true },
];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function readStore<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function getAdminFunctionUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/admin`;
  }
  return '/api/admin';
}

function resolveAdminSecret(adminSecret: string) {
  return String(adminSecret || '').trim();
}

async function callAdminFunction(action: string, payload: AnyObj, adminSecret: string) {
  const resolvedAdminSecret = resolveAdminSecret(adminSecret);

  const response = await fetch(getAdminFunctionUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': resolvedAdminSecret,
    },
    body: JSON.stringify({
      action,
      ...payload,
      adminSecret: resolvedAdminSecret,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || `Admin ${action} failed`);
  }

  return data;
}

function normalizeProductRow(row: AnyObj) {
  const createdAt = row.created_at || row.createdAt || nowIso();
  const createdAge = Date.now() - new Date(createdAt).getTime();
  const recentWindow = 1000 * 60 * 60 * 24 * 30;
  return {
    id: String(row.id || makeId('product')),
    name: row.name || '',
    category: row.category || 'Accessories',
    price: Number(row.price || 0),
    image: row.image || '',
    description: row.description || '',
    stock: Number(row.stock || 0),
    emoji: row.emoji || '🎁',
    featured: Boolean(row.featured),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival ?? (createdAge <= recentWindow)),
    createdAt,
    updatedAt: row.updated_at || row.updatedAt || createdAt,
  };
}

function normalizeOrderRow(row: AnyObj) {
  const itemsJson = row.items_json || row.itemsJson || row.items || [];
  const items = Array.isArray(itemsJson) ? itemsJson : [];
  return {
    id: String(row.id || makeId('order')),
    orderNumber: row.order_number || row.orderNumber || '',
    userId: row.user_id || row.userId || '',
    fullName: row.full_name || row.fullName || '',
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    city: row.city || '',
    pincode: row.pincode || '',
    subtotal: Number(row.subtotal || 0),
    shipping: Number(row.shipping || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    paymentMethod: row.payment_method || row.paymentMethod || 'cod',
    paymentStatus: row.payment_status || row.paymentStatus || 'pending',
    orderStatus: row.order_status || row.orderStatus || 'pending',
    razorpayOrderId: row.razorpay_order_id || row.razorpayOrderId || '',
    razorpayPaymentId: row.razorpay_payment_id || row.razorpayPaymentId || '',
    razorpaySignature: row.razorpay_signature || row.razorpaySignature || '',
    couponCode: row.coupon_code || row.couponCode || '',
    trackingNumber: row.tracking_number || row.trackingNumber || '',
    notes: row.notes || '',
    customerInfo: row.customer_info || row.customerInfo || {},
    items: items.map((item: AnyObj) => ({
      id: item.id,
      productId: item.productId || item.id,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image || '',
      category: item.category || '',
    })),
    createdAt: row.created_at || row.createdAt || nowIso(),
    updatedAt: row.updated_at || row.updatedAt || nowIso(),
  };
}

function normalizeReviewRow(row: AnyObj) {
  return {
    id: String(row.id || makeId('review')),
    name: row.name || 'Guest',
    rating: Number(row.rating || 5),
    comment: row.comment || '',
    userId: row.user_id || row.userId || '',
    productId: row.product_id || row.productId || '',
    createdAt: row.created_at || row.createdAt || nowIso(),
  };
}

function normalizeContactRow(row: AnyObj) {
  return {
    id: String(row.id || makeId('contact')),
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    subject: row.subject || '',
    message: row.message || '',
    createdAt: row.created_at || row.createdAt || nowIso(),
  };
}

function normalizeSpinRow(row: AnyObj) {
  return {
    id: String(row.id || makeId('spin')),
    userIdentifier: row.user_identifier || row.userIdentifier || '',
    spinDate: row.spin_date || row.spinDate || '',
    prizeText: row.prize_text || row.prizeText || '',
    discount: Number(row.discount || 0),
    minPurchase: Number(row.min_purchase || row.minPurchase || 0),
    freeShipping: Boolean(row.free_shipping ?? row.freeShipping),
    createdAt: row.created_at || row.createdAt || nowIso(),
  };
}

function getLocalProducts() {
  const stored = readStore<AnyObj[]>(STORAGE_KEYS.products, []);
  const source = stored.length ? stored : SAMPLE_PRODUCTS;
  return source.map(normalizeProductRow);
}

function saveLocalProducts(products: AnyObj[]) {
  writeStore(STORAGE_KEYS.products, products);
}

function getLocalOrders() {
  return readStore<AnyObj[]>(STORAGE_KEYS.orders, []).map(normalizeOrderRow);
}

function saveLocalOrders(orders: AnyObj[]) {
  writeStore(STORAGE_KEYS.orders, orders);
}

function getLocalReviews() {
  return readStore<AnyObj[]>(STORAGE_KEYS.reviews, []).map(normalizeReviewRow);
}

function saveLocalReviews(reviews: AnyObj[]) {
  writeStore(STORAGE_KEYS.reviews, reviews);
}

function getLocalContacts() {
  return readStore<AnyObj[]>(STORAGE_KEYS.contacts, []).map(normalizeContactRow);
}

function saveLocalContacts(contacts: AnyObj[]) {
  writeStore(STORAGE_KEYS.contacts, contacts);
}

function getLocalSpins() {
  return readStore<AnyObj[]>(STORAGE_KEYS.luckySpins, []).map(normalizeSpinRow);
}

function saveLocalSpins(spins: AnyObj[]) {
  writeStore(STORAGE_KEYS.luckySpins, spins);
}

function eligiblePrizes(cartTotal: number) {
  return PRIZES.filter((prize) => cartTotal >= prize.minPurchase || prize.minPurchase === 0);
}

function pickLuckyPrize(cartTotal: number) {
  const pool = eligiblePrizes(cartTotal);
  const weights = pool.map((prize) => {
    if (prize.text.includes('₹100')) return 14;
    if (prize.text.includes('₹50')) return 22;
    if (prize.text.includes('₹20')) return 28;
    if (prize.text.includes('₹10')) return 24;
    return 12;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return pool[i];
  }
  return pool[pool.length - 1] || PRIZES[0];
}

function buildQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function getProductsFromSupabase() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeProductRow);
}

async function getProductFromSupabase(id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normalizeProductRow(data) : null;
}

async function upsertProductToSupabase(product: AnyObj) {
  const now = nowIso();
  const payload = {
    id: String(product.id || makeId('product')),
    name: product.name || '',
    category: product.category || 'Accessories',
    price: Number(product.price || 0),
    image: product.image || '',
    description: product.description || '',
    stock: Number(product.stock || 0),
    emoji: product.emoji || '🎁',
    featured: Boolean(product.featured),
    is_new_arrival: Boolean(product.isNewArrival ?? product.is_new_arrival ?? true),
    created_at: product.createdAt || now,
    updated_at: now,
  };
  const { data, error } = await supabase.from('products').upsert(payload, { onConflict: 'id' }).select('*').maybeSingle();
  if (error) throw error;
  return data ? normalizeProductRow(data) : normalizeProductRow(payload);
}

async function deleteProductFromSupabase(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

async function getOrdersFromSupabase(filters?: { email?: string; phone?: string; userId?: string; orderNumber?: string }) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (filters?.email) query = query.eq('email', filters.email);
  if (filters?.phone) query = query.eq('phone', filters.phone);
  if (filters?.userId) query = query.eq('user_id', filters.userId);
  if (filters?.orderNumber) query = query.eq('order_number', filters.orderNumber);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeOrderRow);
}

async function createOrderOnSupabase(orderData: AnyObj) {
  const customerInfo = orderData.customerInfo || {};
  const orderId = orderData.id || makeId('order');
  const orderNumber = orderData.orderNumber || `${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;
  const createdAt = orderData.createdAt || nowIso();
  const payload = {
    id: orderId,
    order_number: orderNumber,
    user_id: orderData.userId || '',
    full_name: customerInfo.name || orderData.fullName || '',
    email: customerInfo.email || orderData.email || '',
    phone: customerInfo.phone || orderData.phone || '',
    address: customerInfo.address || orderData.address || '',
    city: customerInfo.city || orderData.city || '',
    pincode: customerInfo.pincode || orderData.pincode || '',
    subtotal: Number(orderData.subtotal || 0),
    shipping: Number(orderData.shipping || 0),
    discount: Number(orderData.discount || 0),
    total: Number(orderData.total || 0),
    payment_method: orderData.paymentMethod || 'cod',
    payment_status: orderData.paymentStatus || 'pending',
    order_status: orderData.orderStatus || 'pending',
    razorpay_order_id: orderData.razorpayOrderId || '',
    razorpay_payment_id: orderData.razorpayPaymentId || '',
    razorpay_signature: orderData.razorpaySignature || '',
    coupon_code: orderData.couponCode || '',
    tracking_number: orderData.trackingNumber || '',
    notes: orderData.notes || '',
    customer_info: customerInfo,
    items_json: Array.isArray(orderData.items) ? orderData.items : [],
    created_at: createdAt,
    updated_at: nowIso(),
  };

  const { data, error } = await supabase.from('orders').upsert(payload, { onConflict: 'id' }).select('*').maybeSingle();
  if (error) throw error;
  return { order: data ? normalizeOrderRow(data) : normalizeOrderRow(payload) };
}

async function updateOrderOnSupabase(orderId: string, payload: AnyObj) {
  const updatePayload: AnyObj = { updated_at: nowIso() };
  if (payload.orderStatus) updatePayload.order_status = payload.orderStatus;
  if (payload.paymentStatus) updatePayload.payment_status = payload.paymentStatus;
  if (payload.trackingNumber) updatePayload.tracking_number = payload.trackingNumber;
  if (payload.notes) updatePayload.notes = payload.notes;
  const { data, error } = await supabase.from('orders').update(updatePayload).eq('id', orderId).select('*').maybeSingle();
  if (error) throw error;
  return data ? normalizeOrderRow(data) : null;
}

async function createReviewOnSupabase(reviewData: AnyObj) {
  const payload = {
    id: reviewData.id || makeId('review'),
    name: reviewData.name || 'Guest',
    rating: Number(reviewData.rating || 5),
    comment: reviewData.comment || '',
    user_id: reviewData.userId || '',
    product_id: reviewData.productId || '',
    created_at: reviewData.createdAt || nowIso(),
  };
  const { data, error } = await supabase.from('reviews').insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return { review: data ? normalizeReviewRow(data) : normalizeReviewRow(payload) };
}

async function getReviewsFromSupabase() {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeReviewRow);
}

async function submitContactOnSupabase(contactData: AnyObj) {
  const payload = {
    id: contactData.id || makeId('contact'),
    name: contactData.name || '',
    email: contactData.email || '',
    phone: contactData.phone || '',
    subject: contactData.subject || '',
    message: contactData.message || '',
    created_at: contactData.createdAt || nowIso(),
  };
  const { data, error } = await supabase.from('contacts').insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return { contact: data ? normalizeContactRow(data) : normalizeContactRow(payload) };
}

async function spinLuckyOnSupabase(userId: string, cartTotal = 0) {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing, error: existingError } = await supabase
    .from('lucky_spins')
    .select('*')
    .eq('user_identifier', userId)
    .eq('spin_date', today)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    return { success: false, error: 'You have already spun today! Come back tomorrow.' };
  }

  const selected = pickLuckyPrize(Number(cartTotal || 0));
  const payload = {
    id: makeId('spin'),
    user_identifier: userId,
    spin_date: today,
    prize_text: selected.text,
    discount: selected.discount,
    min_purchase: selected.minPurchase,
    free_shipping: selected.freeShipping,
    created_at: nowIso(),
  };

  const { data, error } = await supabase.from('lucky_spins').insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return { success: true, prize: clone(selected), spin: data ? normalizeSpinRow(data) : normalizeSpinRow(payload) };
}

function localProductsResponse() {
  const products = getLocalProducts();
  if (!products.length) {
    saveLocalProducts(SAMPLE_PRODUCTS);
    return { success: true, products: clone(SAMPLE_PRODUCTS.map(normalizeProductRow)) };
  }
  return { success: true, products: clone(products) };
}

function localProductResponse(id: string) {
  const products = getLocalProducts();
  const product = products.find((item) => item.id === id) || products[0] || SAMPLE_PRODUCTS[0];
  if (!product) return { success: false, error: 'Product not found' };
  return { success: true, product: clone(product) };
}

function normalizeOrderPayload(orderData: AnyObj) {
  const customerInfo = orderData.customerInfo || {};
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const id = orderData.id || makeId('order');
  const orderNumber = orderData.orderNumber || `${new Date().getFullYear()}${String(Date.now()).slice(-8)}`;

  return {
    id,
    orderNumber,
    userId: orderData.userId || '',
    fullName: customerInfo.name || orderData.fullName || '',
    email: customerInfo.email || orderData.email || '',
    phone: customerInfo.phone || orderData.phone || '',
    address: customerInfo.address || orderData.address || '',
    city: customerInfo.city || orderData.city || '',
    pincode: customerInfo.pincode || orderData.pincode || '',
    subtotal: Number(orderData.subtotal || 0),
    shipping: Number(orderData.shipping || 0),
    discount: Number(orderData.discount || 0),
    total: Number(orderData.total || 0),
    paymentMethod: orderData.paymentMethod || 'cod',
    paymentStatus: orderData.paymentStatus || 'pending',
    orderStatus: orderData.orderStatus || 'confirmed',
    razorpayOrderId: orderData.razorpayOrderId || '',
    razorpayPaymentId: orderData.razorpayPaymentId || '',
    razorpaySignature: orderData.razorpaySignature || '',
    couponCode: orderData.couponCode || '',
    trackingNumber: orderData.trackingNumber || '',
    notes: orderData.notes || '',
    customerInfo,
    items: items.map((item: AnyObj) => ({
      id: item.id,
      productId: item.productId || item.id,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      image: item.image || '',
      category: item.category || '',
    })),
    createdAt: orderData.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
}

function upsertLocalOrder(order: AnyObj) {
  const orders = getLocalOrders();
  const idx = orders.findIndex((item) => item.id === order.id || item.orderNumber === order.orderNumber);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...order, updatedAt: nowIso() };
  } else {
    orders.unshift(order);
  }
  saveLocalOrders(orders);
  return order;
}

function filterLocalOrders(filters?: { email?: string; phone?: string; userId?: string; orderNumber?: string }) {
  const orders = getLocalOrders();
  if (!filters) return orders;
  return orders.filter((order) => {
    const emailOk = !filters.email || String(order.email || order.customerInfo?.email || '').toLowerCase() === filters.email.toLowerCase();
    const phoneOk = !filters.phone || String(order.phone || order.customerInfo?.phone || '') === filters.phone;
    const userOk = !filters.userId || String(order.userId || '') === filters.userId;
    const orderNumberOk = !filters.orderNumber || String(order.orderNumber || '') === filters.orderNumber;
    return emailOk && phoneOk && userOk && orderNumberOk;
  });
}

export const api = {
  getProducts: async () => {
    try {
      const products = await getProductsFromSupabase();
      if (!products.length) {
        await api.initProducts();
        return { success: true, products: clone(SAMPLE_PRODUCTS.map(normalizeProductRow)) };
      }
      return { success: true, products };
    } catch {
      return localProductsResponse();
    }
  },

  getProduct: async (id: string) => {
    try {
      const product = await getProductFromSupabase(id);
      if (!product) throw new Error('Product not found');
      return { success: true, product };
    } catch {
      const fallback = localProductResponse(id);
      if (fallback.success) return fallback;
      return { success: true, product: clone(SAMPLE_PRODUCTS[0]) };
    }
  },

  initProducts: async () => {
    try {
      for (const product of SAMPLE_PRODUCTS) {
        await upsertProductToSupabase(product);
      }
      saveLocalProducts(SAMPLE_PRODUCTS);
      return { success: true, message: 'Products initialized' };
    } catch {
      saveLocalProducts(SAMPLE_PRODUCTS);
      return { success: true, message: 'Products initialized locally' };
    }
  },

  createOrder: async (orderData: AnyObj) => {
    try {
      const result = await createOrderOnSupabase(orderData);
      return { success: true, ...result };
    } catch {
      const order = normalizeOrderPayload(orderData);
      upsertLocalOrder(order);
      return { success: true, order };
    }
  },

  createRazorpayOrder: async () => {
    throw new Error('Razorpay is not configured yet. Please use UPI/COD checkout for now.');
  },

  verifyRazorpayPayment: async (payload: AnyObj) => {
    try {
      const orders = await getOrdersFromSupabase({ orderNumber: payload.orderNumber });
      const order = orders.find((item) => item.id === payload.dbOrderId || item.razorpayOrderId === payload.razorpayOrderId) || null;
      if (order) {
        await updateOrderOnSupabase(order.id, {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayOrderId: payload.razorpayOrderId,
          razorpayPaymentId: payload.razorpayPaymentId,
          razorpaySignature: payload.razorpaySignature,
        });
      }
      return { success: true, order };
    } catch {
      const orders = getLocalOrders();
      const idx = orders.findIndex((item) => item.id === payload.dbOrderId || item.razorpayOrderId === payload.razorpayOrderId);
      if (idx >= 0) {
        orders[idx] = {
          ...orders[idx],
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          razorpayOrderId: payload.razorpayOrderId || orders[idx].razorpayOrderId,
          razorpayPaymentId: payload.razorpayPaymentId || orders[idx].razorpayPaymentId,
          razorpaySignature: payload.razorpaySignature || orders[idx].razorpaySignature,
          updatedAt: nowIso(),
        };
        saveLocalOrders(orders);
      }
      return { success: true, order: orders[idx] || null };
    }
  },

  getOrders: async (filters?: { email?: string; phone?: string; userId?: string; orderNumber?: string }) => {
    try {
      const orders = await getOrdersFromSupabase(filters);
      return { success: true, orders };
    } catch {
      return { success: true, orders: filterLocalOrders(filters) };
    }
  },

  updateOrderStatus: async (orderId: string, payload: AnyObj, adminSecret: string) => {
    const result = await callAdminFunction('update-order-status', { orderId, payload }, adminSecret);
    return { success: true, order: result.order };
  },

  createReview: async (reviewData: AnyObj) => {
    try {
      const result = await createReviewOnSupabase(reviewData);
      return { success: true, ...result };
    } catch {
      const review = normalizeReviewRow({
        id: makeId('review'),
        name: reviewData.name || 'Guest',
        rating: Number(reviewData.rating || 5),
        comment: reviewData.comment || '',
        userId: reviewData.userId || '',
        createdAt: nowIso(),
      });
      const reviews = getLocalReviews();
      reviews.unshift(review);
      saveLocalReviews(reviews);
      return { success: true, review };
    }
  },

  getReviews: async () => {
    try {
      const reviews = await getReviewsFromSupabase();
      return { success: true, reviews };
    } catch {
      return { success: true, reviews: clone(getLocalReviews()) };
    }
  },

  submitContact: async (contactData: AnyObj) => {
    try {
      const result = await submitContactOnSupabase(contactData);
      return { success: true, ...result };
    } catch {
      const contact = normalizeContactRow({
        id: makeId('contact'),
        name: contactData.name || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        subject: contactData.subject || '',
        message: contactData.message || '',
        createdAt: nowIso(),
      });
      const contacts = getLocalContacts();
      contacts.unshift(contact);
      saveLocalContacts(contacts);
      return { success: true, message: 'Message received locally', contact };
    }
  },

  spinLuckyDraw: async (userId: string, cartTotal = 0) => {
    try {
      const result = await spinLuckyOnSupabase(userId, cartTotal);
      return result;
    } catch {
      const today = new Date().toISOString().split('T')[0];
      const spins = getLocalSpins();
      const existing = spins.find((spin) => spin.userIdentifier === userId && spin.spinDate === today);
      if (existing) {
        return { success: false, error: 'You have already spun today! Come back tomorrow.' };
      }

      const selected = pickLuckyPrize(Number(cartTotal || 0));
      const spin = normalizeSpinRow({
        id: makeId('spin'),
        userIdentifier: userId,
        spinDate: today,
        prizeText: selected.text,
        discount: selected.discount,
        minPurchase: selected.minPurchase,
        freeShipping: selected.freeShipping,
        createdAt: nowIso(),
      });
      spins.push(spin);
      saveLocalSpins(spins);
      return { success: true, prize: clone(selected) };
    }
  },

  adminUpsertProduct: async (product: AnyObj, adminSecret: string) => {
  console.log("ADMIN SECRET RECEIVED:", adminSecret);

  const result = await callAdminFunction(
    'upsert-product',
    { product },
    adminSecret
  );

  return {
    success: true,
    product: result.product,
  };
},

  adminDeleteProduct: async (id: string, adminSecret: string) => {
    await callAdminFunction('delete-product', { id }, adminSecret);
    return { success: true };
  },
};
