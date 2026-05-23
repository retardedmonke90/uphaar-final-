# UPHAAR

A premium Gen-Z ecommerce storefront with Supabase backend, Razorpay checkout, order history, lucky draw, reviews, and an admin dashboard.

## What you need to set up

1. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `VITE_ADMIN_ACCESS_CODE`

2. In Supabase, run `supabase/migrations/20260522_phulwari_schema.sql`.

3. Deploy the Supabase Edge Function in `supabase/functions/server` and set its secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `ADMIN_ACCESS_CODE`

4. Start the app:

```bash
npm install
npm run dev
```

## Important pages
- `/` Home
- `/categories` Catalog
- `/cart` Cart
- `/checkout` Checkout
- `/orders` Order history
- `/lucky-draw` Lucky draw
- `/account` Customer auth
- `/admin` Admin dashboard
