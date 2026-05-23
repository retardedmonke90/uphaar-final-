import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const ADMIN_ACCESS_CODE =
  process.env.ADMIN_ACCESS_CODE || "";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function money(value: any) {
  return Number(value || 0);
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "item"
  );
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
    isNewArrival: Boolean(
      row.is_new_arrival ?? row.isNewArrival ?? false
    ),
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

export default async function handler(req: any, res: any) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-admin-secret"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).json({
        success: true,
      });
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
      });
    }

    const providedSecret =
      req.headers["x-admin-secret"] || "";

    if (
      !ADMIN_ACCESS_CODE ||
      providedSecret !== ADMIN_ACCESS_CODE
    ) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return res.status(500).json({
        success: false,
        error: "Missing Supabase credentials",
      });
    }

    const body = req.body || {};
    const action = body.action || "";

    // =========================
    // UPSERT PRODUCT
    // =========================

    if (action === "upsert-product") {
      const product = body.product || {};

      const id =
        product.id ||
        slugify(product.name || `product-${Date.now()}`);

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

      const { data, error } = await supabase
        .from("products")
        .upsert(payload)
        .select("*")
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        product: mapProduct(data),
      });
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    if (action === "delete-product") {
      const id = body.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Missing product id",
        });
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
      });
    }

    // =========================
    // UPDATE ORDER STATUS
    // =========================

    if (action === "update-order-status") {
      const orderId = body.orderId;
      const payload = body.payload || {};

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Missing order id",
        });
      }

      const updatePayload: any = {
        updated_at: new Date().toISOString(),
      };

      if (payload.orderStatus) {
        updatePayload.order_status =
          payload.orderStatus;
      }

      if (payload.paymentStatus) {
        updatePayload.payment_status =
          payload.paymentStatus;
      }

      if (payload.trackingNumber) {
        updatePayload.tracking_number =
          payload.trackingNumber;
      }

      if (payload.notes) {
        updatePayload.notes = payload.notes;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select("*")
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        order: data ? mapOrder(data) : null,
      });
    }

    return res.status(400).json({
      success: false,
      error: "Unknown action",
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
}