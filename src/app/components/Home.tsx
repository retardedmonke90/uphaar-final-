import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Package, Users, Sparkles, ShoppingBag, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api';
import ProductCard from './ProductCard';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  createdAt?: string;
  isNewArrival?: boolean;
};

const sampleProducts: Product[] = [
  {
    id: 'sample-1',
    name: 'Rose Glow Bracelet',
    category: 'Bracelets',
    price: 499,
    image: '',
    description: 'A soft blush bracelet with a premium cute finish.',
    stock: 18,
  },
  {
    id: 'sample-2',
    name: 'Pale Bloom Earrings',
    category: 'Earrings',
    price: 399,
    image: '',
    description: 'Lightweight earrings with a sweet pastel shine.',
    stock: 24,
  },
  {
    id: 'sample-3',
    name: 'Sunlit Flower Clip',
    category: 'Hair Accessories',
    price: 299,
    image: '',
    description: 'A charming hair clip inspired by soft morning light.',
    stock: 12,
  },
  {
    id: 'sample-4',
    name: 'Metro Card Skin',
    category: 'Metro Card Skins',
    price: 199,
    image: '',
    description: 'Cute custom metro card skin for daily essentials.',
    stock: 30,
  },
  {
    id: 'sample-5',
    name: 'Mini Bloom Keychain',
    category: 'Keychains',
    price: 249,
    image: '',
    description: 'An adorable little charm that feels personal.',
    stock: 14,
  },
  {
    id: 'sample-6',
    name: 'Pastel Note Bookmark',
    category: 'Bookmarks',
    price: 149,
    image: '',
    description: 'A soft and pretty bookmark for daily reading.',
    stock: 40,
  },
];

function isRecentProduct(createdAt?: string) {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age <= 1000 * 60 * 60 * 24 * 30;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await api.getProducts();
      if (result.success && result.products.length === 0) {
        await api.initProducts();
        const refreshed = await api.getProducts();
        setProducts(refreshed.products || []);
      } else {
        setProducts(result.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = useMemo(
    () => (products.length > 0 ? products : sampleProducts),
    [products]
  );

  const heroProducts = displayProducts.slice(0, 3);
  const bestSellerProducts = displayProducts.slice(0, 8);
  const marqueeProducts = [...bestSellerProducts, ...bestSellerProducts];
  const featuredProducts = displayProducts.slice(0, 8);

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[40px] border border-[#e97a7a]/12 bg-[linear-gradient(135deg,rgba(255,253,248,0.98),rgba(255,242,215,0.75))] shadow-[0_24px_80px_rgba(233,122,122,0.1)] backdrop-blur-xl"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[40px]">
              <div className="absolute left-[-10%] top-[-18%] h-[420px] w-[420px] rounded-full bg-[#ffd6d6]/40 blur-3xl" />
              <div className="absolute bottom-[-8%] right-[-6%] h-[420px] w-[420px] rounded-full bg-[#fff0c2]/35 blur-3xl" />
            </div>

            <div className="relative z-10 grid gap-14 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-14 lg:py-16 xl:px-16 xl:py-20">
              <div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 170, damping: 14 }}
                  className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/85 shadow-[0_12px_30px_rgba(233,122,122,0.1)]"
                >
                  <Sparkles className="h-9 w-9 text-[#e97a7a]" />
                </motion.div>

                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">
                  4.7★ · 20K+ orders · cute, premium, Gen-Z
                </p>

                <h1 className="max-w-3xl font-heading text-5xl font-black tracking-tight text-[#7d262e] md:text-7xl lg:text-8xl">
                  Cute things
                  <span className="block bg-gradient-to-r from-[#e97a7a] via-[#d84d73] to-[#f2b24c] bg-clip-text text-transparent">
                    for your softest era.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#7c5f5f] md:text-xl">
                  A dreamy accessories store with pastel warmth, smooth motion, and a premium shopping experience designed for UPHAAR.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <StatCard icon={<Star className="h-7 w-7" />} value="4.7" label="Average Rating" delay={0.2} />
                  <StatCard icon={<Package className="h-7 w-7" />} value="20K+" label="Orders Placed" delay={0.3} />
                  <StatCard icon={<Users className="h-7 w-7" />} value="15K+" label="Happy Customers" delay={0.4} />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-10 flex flex-col items-start gap-4 sm:flex-row"
                >
                  <Link
                    to="/categories"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#e97a7a] px-8 py-4 font-semibold text-white shadow-[0_14px_35px_rgba(233,122,122,0.26)] transition-all duration-300 hover:bg-[#d86a6a] hover:shadow-[0_18px_50px_rgba(233,122,122,0.3)] active:scale-[0.97]"
                  >
                    <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    Shop Now
                  </Link>

                  <Link
                    to="/lucky-draw"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e97a7a]/15 bg-white/80 px-8 py-4 font-semibold text-[#7d262e] shadow-[0_12px_30px_rgba(233,122,122,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-white active:scale-[0.97]"
                  >
                    <Sparkles className="h-5 w-5 text-[#e97a7a]" />
                    Try Lucky Draw
                  </Link>
                </motion.div>
              </div>

              <div className="relative lg:pl-4">
                <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/55 via-white/20 to-[#fff2d7]/60 blur-2xl" />
                <div className="relative rounded-[36px] border border-white/70 bg-[rgba(255,253,248,0.72)] p-5 shadow-[0_18px_60px_rgba(233,122,122,0.12)] backdrop-blur-xl sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b07878]">
                        Best sellers
                      </p>
                      <h2 className="mt-2 font-heading text-3xl font-black text-[#7d262e]">
                        Fresh picks
                      </h2>
                    </div>
                    <div className="rounded-full bg-[#fff2d7] px-4 py-2 text-sm font-semibold text-[#7d262e]">
                      Live now
                    </div>
                  </div>

                  <div className="space-y-4">
                    {heroProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="group flex items-center gap-4 rounded-[28px] border border-[#e97a7a]/12 bg-white/82 p-4 shadow-[0_12px_34px_rgba(233,122,122,0.08)] transition-all duration-300"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(255,242,215,0.95),rgba(255,249,244,0.95))] text-4xl shadow-inner">
                          {getProductEmoji(product.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b07878]">
                            {product.category}
                          </div>
                          <h3 className="truncate font-heading text-xl font-black text-[#7d262e] transition-colors duration-300 group-hover:text-[#e97a7a]">
                            {product.name}
                          </h3>
                          <p className="mt-1 truncate text-sm text-[#7c5f5f]">
                            {product.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-heading text-2xl font-black text-[#e97a7a]">₹{product.price}</div>
                          <Link
                            to={`/product/${product.id}`}
                            className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#fff2d7] px-3 py-1 text-xs font-semibold text-[#7d262e] transition-transform duration-300 hover:scale-105 active:scale-95"
                          >
                            View
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">
                Best sellers
              </p>
              <h2 className="mt-4 font-heading text-4xl font-black text-[#7d262e] md:text-5xl">
                Scroll through the top picks
              </h2>
              <p className="mt-3 text-[#7c5f5f]">
                A horizontally scrolling product rail makes the second slide feel alive and editorial.
              </p>
            </div>

            <Link
              to="/categories"
              className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 px-6 py-3 font-semibold text-[#7d262e] shadow-[0_12px_30px_rgba(233,122,122,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-white active:scale-[0.98]"
            >
              View All Products
              <TrendingUp className="h-5 w-5 text-[#e97a7a]" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex gap-5 overflow-hidden pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[340px] min-w-[280px] animate-pulse rounded-[32px] bg-white/70 shadow-[0_12px_34px_rgba(233,122,122,0.08)]" />
              ))}
            </div>
          ) : (
            <div className="group -mx-4 overflow-hidden px-4 pb-4">
              <div className="animate-marquee group-hover:pause-marquee flex w-max gap-5 pr-4">
                {marqueeProducts.map((product, index) => (
                  <motion.article
                    key={`${product.id}-${index}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: (index % bestSellerProducts.length) * 0.03, duration: 0.45 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="snap-start"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="group flex min-w-[280px] max-w-[280px] flex-col overflow-hidden rounded-[32px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.9)] shadow-[0_12px_34px_rgba(233,122,122,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#e97a7a]/22 hover:shadow-[0_24px_64px_rgba(233,122,122,0.18)] md:min-w-[320px] md:max-w-[320px] lg:min-w-[340px] lg:max-w-[340px]">
                      <div className="relative h-60 overflow-hidden bg-[linear-gradient(180deg,rgba(255,242,215,0.78),rgba(255,249,244,0.96))]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ffd6d6]/35 via-transparent to-[#fff0c2]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                        {Boolean(product.isNewArrival) && (
                          <div className="absolute left-4 top-4 rounded-full bg-[#fff2d7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.12)]">New Arrival</div>
                        )}
                        <motion.div
                          animate={{ scale: 1, rotate: 0 }}
                          whileHover={{ scale: 1.08, rotate: -1.5 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                          className="flex h-full items-center justify-center p-8"
                        >
                          <div className="select-none text-8xl drop-shadow-[0_12px_26px_rgba(233,122,122,0.12)]">
                            {getProductEmoji(product.category)}
                          </div>
                        </motion.div>

                        <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.12)]">
                          Best Seller
                        </div>
                        {Boolean(product.isNewArrival) && (
                          <div className="absolute left-4 top-14 rounded-full bg-[#fff2d7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.12)]">New Arrival</div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-2 text-sm font-medium text-[#b07878]">{product.category}</div>
                        <h3 className="font-heading text-2xl font-black tracking-tight text-[#7d262e] transition-colors duration-300 group-hover:text-[#e97a7a]">
                          {product.name}
                        </h3>
                        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-[#7c5f5f]">
                          {product.description}
                        </p>

                        <div className="mt-6 flex items-center justify-between gap-3">
                          <div className="text-2xl font-black text-[#e97a7a]">₹{product.price}</div>
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.22)] transition-all duration-300 group-hover:bg-[#d76c6c]">
                            <ShoppingBag className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-22">
        <div className="mx-auto max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="mb-12 text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">
              Featured Collection
            </p>
            <h2 className="mt-4 font-heading text-4xl font-black text-[#7d262e] md:text-5xl">
              Handpicked favorites
            </h2>
            <p className="mt-4 text-[#7c5f5f]">Soft colors, cute details, and the best sellers first.</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-[30px] bg-white/70 shadow-[0_12px_34px_rgba(233,122,122,0.08)]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} delay={index * 0.08} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-8 py-4 font-semibold text-[#7d262e] shadow-[0_12px_30px_rgba(233,122,122,0.08)] backdrop-blur-md transition-all duration-300 hover:bg-white active:scale-[0.98]"
            >
              View All Products
              <TrendingUp className="h-5 w-5 text-[#e97a7a]" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<Heart className="h-11 w-11" />}
            title="Made to feel special"
            description="Every page interaction has soft motion and delicate feedback."
          />
          <FeatureCard
            icon={<Sparkles className="h-11 w-11" />}
            title="Premium but cute"
            description="A soft red, pale yellow, and white palette keeps it elegant and warm."
          />
          <FeatureCard
            icon={<Package className="h-11 w-11" />}
            title="Fast, practical shopping"
            description="Built like a real store: catalog, cart, checkout, orders, and support."
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 190, damping: 16 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-[28px] border border-[#e97a7a]/12 bg-white/78 p-6 text-center shadow-[0_12px_34px_rgba(233,122,122,0.08)] backdrop-blur-xl"
    >
      <div className="mb-3 flex justify-center text-[#e97a7a]">{icon}</div>
      <div className="font-heading text-3xl font-black tracking-tight text-[#7d262e]">{value}</div>
      <div className="mt-1 text-sm text-[#7c5f5f]">{label}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      className="rounded-[32px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.84)] p-8 text-center shadow-[0_12px_34px_rgba(233,122,122,0.08)] backdrop-blur-xl"
    >
      <div className="mb-4 flex justify-center text-[#e97a7a]">{icon}</div>
      <h3 className="font-heading text-2xl font-black text-[#7d262e]">{title}</h3>
      <p className="mt-3 leading-7 text-[#7c5f5f]">{description}</p>
    </motion.div>
  );
}

function getProductEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Metro Card Skins': '🎫',
    'Handmade Flowers': '🌸',
    Accessories: '✨',
    Keychains: '🔑',
    Stickers: '🎨',
    Bookmarks: '📖',
    'Phone Accessories': '📱',
    Bracelets: '💫',
    Earrings: '💖',
    'Hair Accessories': '🎀',
    'Gift Boxes': '🎁',
  };
  return emojiMap[category] || '🎁';
}
