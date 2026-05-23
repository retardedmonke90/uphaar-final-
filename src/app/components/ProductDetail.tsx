import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Star, Package, Shield, Truck, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const { addToCart } = useCart();
  const isNewArrival = Boolean(product?.isNewArrival);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const result = await api.getProduct(productId);
      if (result.success) {
        setProduct(result.product);
        return;
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }

    const fallback = {
      id: productId,
      name: 'UPHAAR Product',
      category: 'Accessories',
      price: 199,
      image: '',
      description: 'Cute premium accessory from UPHAAR.',
      stock: 25,
    };
    setProduct(fallback);
  };

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-8 font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-12 aspect-square flex items-center justify-center shadow-xl sticky top-24">
              <div className="text-9xl">{getProductEmoji(product.category)}</div>

              <button
                onClick={() => {
                  setLiked(!liked);
                  toast.success(liked ? 'Removed from wishlist' : 'Added to wishlist!');
                }}
                className="absolute top-6 right-6 p-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <Heart
                  className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="text-rose-600 font-semibold">{product.category}</div>
                {isNewArrival && (
                  <span className="rounded-full bg-[#fff2d7] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#7d262e]">New Arrival</span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">(4.7 rating)</span>
              </div>

              <div className="text-5xl font-bold text-rose-600 mb-6">₹{product.price}</div>

              <p className="text-lg text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center font-bold text-rose-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-xl">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-full bg-rose-100 hover:bg-rose-200 flex items-center justify-center font-bold text-rose-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Stock</div>
                  <div className="text-lg font-semibold text-green-600">
                    {product.stock} available
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <FeatureBadge icon={<Truck />} text="Fast Delivery" />
              <FeatureBadge icon={<Shield />} text="Secure Payment" />
              <FeatureBadge icon={<Package />} text="Easy Returns" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureBadge({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl">
      <div className="text-rose-600">{icon}</div>
      <span className="font-medium text-gray-700">{text}</span>
    </div>
  );
}

function getProductEmoji(category: string): string {
  const emojiMap: { [key: string]: string } = {
    'Metro Card Skins': '🎫',
    'Handmade Flowers': '🌸',
    'Accessories': '✨',
    'Keychains': '🔑',
    'Stickers': '🎨',
    'Bookmarks': '📖',
    'Phone Accessories': '📱',
  };
  return emojiMap[category] || '🎁';
}

function isRecentProduct(createdAt?: string) {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age <= 1000 * 60 * 60 * 24 * 30;
}
