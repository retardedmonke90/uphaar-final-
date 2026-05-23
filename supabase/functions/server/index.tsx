
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'x-admin-secret', 'x-razorpay-signature'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
  }),
);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';
const ADMIN_ACCESS_CODE = Deno.env.get('ADMIN_ACCESS_CODE') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const encode = (value: string) => new TextEncoder().encode(value);

async function hmacSHA256(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';
}
function money(value: any) { return Number(value || 0); }
function mapProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: money(row.price),
    image: row.image || '',
    description: row.description || '',
    stock: Number(row.stock || 0),
    emoji: row.emoji || '🎁',
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
function mapReview(row: any) {
  return { id: row.id, name: row.name, rating: Number(row.rating || 5), comment: row.comment, userId: row.user_id || '', createdAt: row.created_at };
}
function mapContact(row: any) {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone || '', subject: row.subject || '', message: row.message, createdAt: row.created_at };
}
function mapSpin(row: any) {
  return { id: row.id, userIdentifier: row.user_identifier, spinDate: row.spin_date, prize: { text: row.prize_text, discount: money(row.discount), minPurchase: money(row.min_purchase), freeShipping: Boolean(row.free_shipping) }, createdAt: row.created_at };
}
function mapOrder(row: any, items: any[] = []) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id || '',
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    subtotal: money(row.subtotal),
    shipping: money(row.shipping),
    discount: money(row.discount),
    total: money(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    razorpayOrderId: row.razorpay_order_id || '',
    razorpayPaymentId: row.razorpay_payment_id || '',
    razorpaySignature: row.razorpay_signature || '',
    couponCode: row.coupon_code || '',
    trackingNumber: row.tracking_number || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  };
}

async function fetchOrderItems(orderIds: string[]) {
  if (!orderIds.length) return [];
  const { data, error } = await supabase.from('order_items').select('*').in('order_id', orderIds).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function hydrateOrders(filters: { email?: string; phone?: string; userId?: string; orderNumber?: string } = {}) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (filters.email) query = query.eq('email', filters.email);
  if (filters.phone) query = query.eq('phone', filters.phone);
  if (filters.userId) query = query.eq('user_id', filters.userId);
  if (filters.orderNumber) query = query.eq('order_number', filters.orderNumber);

  const { data, error } = await query;
  if (error) throw error;
  const orders = data ?? [];
  const items = await fetchOrderItems(orders.map((order) => order.id));
  const grouped = new Map<string, any[]>();
  for (const item of items) {
    if (!grouped.has(item.order_id)) grouped.set(item.order_id, []);
    grouped.get(item.order_id)!.push({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      price: money(item.price),
      quantity: Number(item.quantity || 1),
      image: item.image || '',
      category: item.category || '',
      createdAt: item.created_at,
    });
  }
  return orders.map((order) => mapOrder(order, grouped.get(order.id) || []));
}

async function requireAdminSecret(c: any) {
  const provided = c.req.header('x-admin-secret') || '';
  if (!ADMIN_ACCESS_CODE || provided !== ADMIN_ACCESS_CODE) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  return null;
}

app.get('/make-server-9a9ac825/health', (c) => c.json({ success: true, status: 'ok' }));

app.get('/make-server-9a9ac825/products', async (c) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    return c.json({ success: true, products: (data ?? []).map(mapProduct) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-9a9ac825/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return c.json({ success: false, error: 'Product not found' }, 404);
    return c.json({ success: true, product: mapProduct(data) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/init-products', async (c) => {
  try {
    const sampleProducts = [
      { id: 'metro-bollywood-1', name: 'Bollywood Metro Card Skin', category: 'Metro Card Skins', price: 99, image: '', description: 'Vintage Bollywood-themed metro card skin', stock: 50, emoji: '🎫', featured: true },
      { id: 'metro-brat-1', name: 'Brat Metro Card Skin', category: 'Metro Card Skins', price: 89, image: '', description: 'Trendy neon green brat themed card skin', stock: 45, emoji: '🎫', featured: true },
      { id: 'metro-newyork-1', name: 'New York Metro Card Skin', category: 'Metro Card Skins', price: 99, image: '', description: 'NYC inspired metro card design', stock: 40, emoji: '🎫', featured: false },
      { id: 'flower-red-1', name: 'Handmade Red Rose', category: 'Handmade Flowers', price: 149, image: '', description: 'Beautiful handcrafted red rose', stock: 30, emoji: '🌸', featured: true },
      { id: 'flower-pink-1', name: 'Handmade Pink Carnation', category: 'Handmade Flowers', price: 129, image: '', description: 'Delicate handmade pink carnation', stock: 35, emoji: '🌷', featured: false },
      { id: 'soap-street-1', name: 'SFS Street Soap', category: 'Accessories', price: 199, image: '', description: 'Artisanal handmade soap with unique fragrance', stock: 25, emoji: '🧼', featured: false },
      { id: 'keychain-custom-1', name: 'Custom Name Keychain', category: 'Keychains', price: 79, image: '', description: 'Personalized acrylic keychain', stock: 60, emoji: '🔑', featured: true },
      { id: 'sticker-pack-1', name: 'GenZ Sticker Pack', category: 'Stickers', price: 59, image: '', description: 'Pack of 10 trendy GenZ stickers', stock: 100, emoji: '🎨', featured: false },
      { id: 'bookmark-aesthetic-1', name: 'Aesthetic Bookmark Set', category: 'Bookmarks', price: 69, image: '', description: 'Set of 5 aesthetic bookmarks', stock: 55, emoji: '📖', featured: false },
      { id: 'phone-grip-1', name: 'Pastel Phone Grip', category: 'Phone Accessories', price: 89, image: '', description: 'Cute pastel-colored phone grip', stock: 70, emoji: '📱', featured: false },
    ];
    const { error } = await supabase.from('products').upsert(sampleProducts, { onConflict: 'id' });
    if (error) throw error;
    return c.json({ success: true, message: 'Products initialized' });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/admin/products', async (c) => {
  try {
    const auth = await requireAdminSecret(c);
    if (auth) return auth;
    const body = await c.req.json();
    const productId = body.id || slugify(body.name || `product-${Date.now()}`);
    const payload = {
      id: productId,
      name: body.name,
      category: body.category,
      price: money(body.price),
      image: body.image || '',
      description: body.description || '',
      stock: Number(body.stock || 0),
      emoji: body.emoji || '🎁',
      featured: Boolean(body.featured),
    };
    const { data, error } = await supabase.from('products').upsert(payload).select('*').single();
    if (error) throw error;
    return c.json({ success: true, product: mapProduct(data) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete('/make-server-9a9ac825/admin/products/:id', async (c) => {
  try {
    const auth = await requireAdminSecret(c);
    if (auth) return auth;
    const id = c.req.param('id');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-9a9ac825/orders', async (c) => {
  try {
    const { email, phone, userId, orderNumber } = c.req.query();
    const orders = await hydrateOrders({ email, phone, userId, orderNumber });
    return c.json({ success: true, orders });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.patch('/make-server-9a9ac825/admin/orders/:id', async (c) => {
  try {
    const auth = await requireAdminSecret(c);
    if (auth) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const updates: Record<string, any> = {};
    if (body.orderStatus) updates.order_status = body.orderStatus;
    if (body.paymentStatus) updates.payment_status = body.paymentStatus;
    if (body.trackingNumber) updates.tracking_number = body.trackingNumber;
    if (body.razorpayOrderId) updates.razorpay_order_id = body.razorpayOrderId;
    if (body.razorpayPaymentId) updates.razorpay_payment_id = body.razorpayPaymentId;
    if (body.razorpaySignature) updates.razorpay_signature = body.razorpaySignature;
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select('*').single();
    if (error) throw error;
    const orders = await hydrateOrders({ orderNumber: data.order_number });
    return c.json({ success: true, order: orders[0] });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/orders', async (c) => {
  try {
    const body = await c.req.json();
    const customerInfo = body.customerInfo || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const orderNumber = `PF-${Date.now().toString().slice(-8)}`;
    const paymentMethod = body.paymentMethod || customerInfo.paymentMethod || 'cod';
    const paymentStatus = body.paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'initiated');
    const orderStatus = body.orderStatus || (paymentMethod === 'cod' ? 'confirmed' : 'pending_payment');

    const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: body.userId || null,
      full_name: customerInfo.name || body.fullName || '',
      email: customerInfo.email || body.email || '',
      phone: customerInfo.phone || body.phone || '',
      address: customerInfo.address || body.address || '',
      city: customerInfo.city || body.city || '',
      pincode: customerInfo.pincode || body.pincode || '',
      subtotal: money(body.subtotal),
      shipping: money(body.shipping),
      discount: money(body.discount),
      total: money(body.total),
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: orderStatus,
      razorpay_order_id: body.razorpayOrderId || null,
      razorpay_payment_id: body.razorpayPaymentId || null,
      razorpay_signature: body.razorpaySignature || null,
      coupon_code: body.couponCode || null,
      tracking_number: body.trackingNumber || null,
      notes: body.notes || null,
    }).select('*').single();
    if (orderError) throw orderError;

    if (items.length) {
      const orderItems = items.map((item: any) => ({
        order_id: insertedOrder.id,
        product_id: item.id || item.productId || '',
        name: item.name || '',
        price: money(item.price),
        quantity: Number(item.quantity || 1),
        image: item.image || '',
        category: item.category || '',
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    const orders = await hydrateOrders({ orderNumber });
    return c.json({ success: true, order: orders[0] });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/payments/razorpay/create-order', async (c) => {
  try {
    const body = await c.req.json();
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return c.json({ success: false, error: 'Razorpay secrets are missing' }, 500);
    }

    const customerInfo = body.customerInfo || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const amount = Math.round(money(body.total) * 100);
    const orderNumber = `PF-${Date.now().toString().slice(-8)}`;

    const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
      order_number: orderNumber,
      user_id: body.userId || null,
      full_name: customerInfo.name || '',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
      address: customerInfo.address || '',
      city: customerInfo.city || '',
      pincode: customerInfo.pincode || '',
      subtotal: money(body.subtotal),
      shipping: money(body.shipping),
      discount: money(body.discount),
      total: money(body.total),
      payment_method: 'online',
      payment_status: 'initiated',
      order_status: 'pending_payment',
      notes: body.notes || null,
    }).select('*').single();
    if (orderError) throw orderError;

    if (items.length) {
      const orderItems = items.map((item: any) => ({
        order_id: insertedOrder.id,
        product_id: item.id || item.productId || '',
        name: item.name || '',
        price: money(item.price),
        quantity: Number(item.quantity || 1),
        image: item.image || '',
        category: item.category || '',
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          order_id: insertedOrder.id,
          order_number: orderNumber,
          customer_email: customerInfo.email || '',
          customer_phone: customerInfo.phone || '',
        },
      }),
    });

    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      throw new Error(razorpayOrder.error?.description || razorpayOrder.error || 'Unable to create Razorpay order');
    }

    const { error: updateError } = await supabase.from('orders').update({ razorpay_order_id: razorpayOrder.id }).eq('id', insertedOrder.id);
    if (updateError) throw updateError;

    const orders = await hydrateOrders({ orderNumber });
    return c.json({ success: true, order: orders[0], razorpayOrder });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/payments/razorpay/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { dbOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
    if (!RAZORPAY_KEY_SECRET) {
      return c.json({ success: false, error: 'Razorpay verification secret missing' }, 500);
    }

    const expected = await hmacSHA256(`${razorpayOrderId}|${razorpayPaymentId}`, RAZORPAY_KEY_SECRET);
    if (expected !== razorpaySignature) {
      return c.json({ success: false, error: 'Invalid payment signature' }, 400);
    }

    const { error } = await supabase.from('orders').update({
      payment_status: 'paid',
      order_status: 'confirmed',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    }).eq('id', dbOrderId);
    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/webhooks/razorpay', async (c) => {
  try {
    const rawBody = await c.req.text();
    const signature = c.req.header('x-razorpay-signature') || '';
    if (!RAZORPAY_WEBHOOK_SECRET) {
      return c.json({ success: false, error: 'Webhook secret missing' }, 500);
    }

    const expected = await hmacSHA256(rawBody, RAZORPAY_WEBHOOK_SECRET);
    if (expected !== signature) {
      return c.json({ success: false, error: 'Invalid webhook signature' }, 400);
    }

    const payload = JSON.parse(rawBody);
    const entity = payload?.payload?.payment?.entity || payload?.payload?.order?.entity || null;
    const razorpayOrderId = entity?.order_id || payload?.payload?.order?.entity?.id;
    const razorpayPaymentId = entity?.id || '';
    const event = payload?.event || '';

    if (razorpayOrderId) {
      const update: Record<string, any> = { razorpay_order_id: razorpayOrderId };
      if (razorpayPaymentId) update.razorpay_payment_id = razorpayPaymentId;
      if (event === 'payment.captured') {
        update.payment_status = 'paid';
        update.order_status = 'confirmed';
      }
      await supabase.from('orders').update(update).eq('razorpay_order_id', razorpayOrderId);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/reviews', async (c) => {
  try {
    const body = await c.req.json();
    const { data, error } = await supabase.from('reviews').insert({
      name: body.name,
      rating: Number(body.rating || 5),
      comment: body.comment,
      user_id: body.userId || null,
    }).select('*').single();
    if (error) throw error;
    return c.json({ success: true, review: mapReview(data) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get('/make-server-9a9ac825/reviews', async (c) => {
  try {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return c.json({ success: true, reviews: (data ?? []).map(mapReview) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/contact', async (c) => {
  try {
    const body = await c.req.json();
    const { data, error } = await supabase.from('contact_messages').insert({
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject || null,
      message: body.message,
    }).select('*').single();
    if (error) throw error;
    return c.json({ success: true, message: 'Contact form submitted successfully', contact: mapContact(data) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post('/make-server-9a9ac825/lucky-draw/spin', async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.userId || `guest-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const { data: existingSpin, error: existingError } = await supabase.from('lucky_draw_spins').select('*').eq('user_identifier', userId).eq('spin_date', today).maybeSingle();
    if (existingError) throw existingError;
    if (existingSpin) {
      return c.json({ success: false, error: 'You have already spun today! Come back tomorrow.' }, 400);
    }

    const prizes = [
      { text: '₹100 OFF on ₹999+', discount: 100, minPurchase: 999, freeShipping: false },
      { text: 'Better Luck Next Time', discount: 0, minPurchase: 0, freeShipping: false },
      { text: '₹50 OFF on ₹499+', discount: 50, minPurchase: 499, freeShipping: false },
      { text: 'Free Shipping', discount: 0, minPurchase: 0, freeShipping: true },
      { text: '₹20 OFF on ₹299+', discount: 20, minPurchase: 299, freeShipping: false },
      { text: 'Better Luck Next Time', discount: 0, minPurchase: 0, freeShipping: false },
    ];
    const weights = [10, 20, 18, 17, 15, 20];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const random = Math.random() * totalWeight;
    let sum = 0;
    let selected = prizes[1];
    for (let i = 0; i < prizes.length; i++) {
      sum += weights[i];
      if (random <= sum) { selected = prizes[i]; break; }
    }

    const { data, error } = await supabase.from('lucky_draw_spins').insert({
      user_identifier: userId,
      spin_date: today,
      prize_text: selected.text,
      discount: selected.discount,
      min_purchase: selected.minPurchase,
      free_shipping: selected.freeShipping,
    }).select('*').single();
    if (error) throw error;

    return c.json({ success: true, prize: mapSpin(data) });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
