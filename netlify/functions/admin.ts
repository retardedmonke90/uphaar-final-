import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || "";

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  },
  body: JSON.stringify(body),
});

function money(value: any) {
  return Number(value || 0);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "item";
}

function mapProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: money(row.price),
    image: row.image || "",
    description: row.description || "",
    stock: Number(row.stock || 0),
    emoji: row.emoji || "🎁",
    featured: Boolean(row.featured),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival ?? false),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrder(row: any) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id || "",
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
    razorpayOrderId: row.razorpay_order_id || "",
    razorpayPaymentId: row.razorpay_payment_id || "",
    razorpaySignature: row.razorpay_signature || "",
    couponCode: row.coupon_code || "",
    trackingNumber: row.tracking_number || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: [],
  };
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function requireAdminSecret(event: any) {
  const provided = event.headers["x-admin-secret"] || event.headers["X-Admin-Secret"] || "";
  if (!ADMIN_ACCESS_CODE || provided !== ADMIN_ACCESS_CODE) {
    return json(401, { success: false, error: "Unauthorized" });
  }
  return null;
}

export const handler = async (event: any) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return json(200, { success: true });
    }

    const authError = await requireAdminSecret(event);
    if (authError) return authError;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(500, { success: false, error: "Missing Supabase server credentials" });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const action = body.action || "";

    if (action === "upsert-product") {
      const product = body.product || {};
      const id = product.id || slugify(product.name || `product-${Date.now()}`);
      const payload = {
        id,
        name: product.name,
        category: product.category,
        price: money(product.price),
        image: product.image || "",
        description: product.description || "",
        stock: Number(product.stock || 0),
        emoji: product.emoji || "🎁",
        featured: Boolean(product.featured),
      };
      const { data, error } = await supabase.from("products").upsert(payload).select("*").single();
      if (error) throw error;
      return json(200, { success: true, product: mapProduct(data) });
    }

    if (action === "delete-product") {
      const id = body.id;
      if (!id) return json(400, { success: false, error: "Missing product id" });
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      return json(200, { success: true });
    }

    if (action === "update-order-status") {
      const orderId = body.orderId;
      const payload = body.payload || {};
      if (!orderId) return json(400, { success: false, error: "Missing order id" });
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (payload.orderStatus) updatePayload.order_status = payload.orderStatus;
      if (payload.paymentStatus) updatePayload.payment_status = payload.paymentStatus;
      if (payload.trackingNumber) updatePayload.tracking_number = payload.trackingNumber;
      if (payload.notes) updatePayload.notes = payload.notes;
      const { data, error } = await supabase.from("orders").update(updatePayload).eq("id", orderId).select("*").maybeSingle();
      if (error) throw error;
      return json(200, { success: true, order: data ? mapOrder(data) : null });
    }

    return json(400, { success: false, error: "Unknown action" });
  } catch (error: any) {
    return json(500, { success: false, error: error?.message || String(error) });
  }
};
