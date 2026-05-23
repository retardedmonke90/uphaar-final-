import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  createdAt?: string;
  isNewArrival?: boolean;
}

export default function ProductCard({ product, delay = 0 }: { product: Product; delay?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const { addToCart } = useCart();
  const isNewArrival = Boolean(product.isNewArrival);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} added to cart!`, { duration: 1800 });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => !prev);
    toast.success(!liked ? 'Added to wishlist!' : 'Removed from wishlist!', { duration: 1500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.55, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      className="h-full"
    >
      <Link
        to={`/product/${product.id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group block h-full"
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.82)] shadow-[0_12px_34px_rgba(233,122,122,0.09)] backdrop-blur-xl transition-all duration-500 group-hover:border-[#e97a7a]/25 group-hover:shadow-[0_24px_64px_rgba(233,122,122,0.18)]">
          <div className="relative h-72 overflow-hidden bg-[linear-gradient(180deg,rgba(255,242,215,0.75),rgba(255,249,244,0.96))]">
            <motion.div
              animate={{ scale: isHovered ? 1.08 : 1, rotate: isHovered ? -1.5 : 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="flex h-full items-center justify-center p-8"
            >
              <div className="select-none text-7xl drop-shadow-[0_12px_26px_rgba(233,122,122,0.12)]">
                {getProductEmoji(product.category)}
              </div>
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#7d262e]/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <button
              onClick={handleLike}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/85 text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-110"
              aria-label="Wishlist"
            >
              <Heart className={`h-5 w-5 ${liked ? 'fill-[#e97a7a] text-[#e97a7a]' : 'text-[#7d262e]'}`} />
            </button>

            {isNewArrival && (
              <div className="absolute left-4 top-4 rounded-full bg-[#fff2d7] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7d262e] shadow-lg">
                New Arrival
              </div>
            )}
            {product.stock < 10 && (
              <div className="absolute left-4 top-12 rounded-full bg-[#e97a7a] px-3 py-1 text-xs font-bold text-white shadow-lg">
                Only {product.stock} left!
              </div>
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

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.22)] transition-all duration-300 hover:bg-[#d76c6c]"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-1 origin-left bg-gradient-to-r from-[#e97a7a] via-[#ffd6a5] to-[#f7b7c2]"
          />
        </div>
      </Link>
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
  };
  return emojiMap[category] || '🎁';
}

function isRecentProduct(createdAt?: string) {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age <= 1000 * 60 * 60 * 24 * 30;
}
