import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../../utils/api';
import ProductCard from './ProductCard';

export default function Categories() {
  const { category } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    if (category) setSelectedCategory(category);
  }, [category]);

  const loadProducts = async () => {
    try {
      const result = await api.getProducts();
      const list = result.products || [];
      if (!list.length) {
        await api.initProducts();
        const refreshed = await api.getProducts();
        setProducts(refreshed.products || []);
      } else {
        setProducts(list);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">Browse UPHAAR</p>
          <h1 className="mt-4 font-heading text-5xl font-black tracking-tight text-[#7d262e] md:text-6xl">
            Our Collection
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#7c5f5f]">
            Softly curated accessories, gifts, and cute little essentials for your everyday aesthetic.
          </p>
        </motion.div>

        <div className="mb-8 rounded-[34px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.84)] p-4 shadow-[0_12px_34px_rgba(233,122,122,0.08)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b07878]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-[#e97a7a]/14 bg-white/90 py-3 pl-12 pr-4 text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.04)] outline-none placeholder:text-[#b08b8b] focus:border-[#e97a7a]/35"
              />
            </div>

            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-[#e97a7a]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-[#e97a7a]/14 bg-white/90 px-4 py-3 text-[#7d262e] outline-none focus:border-[#e97a7a]/35"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                  selectedCategory === cat
                    ? 'bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)]'
                    : 'border border-[#e97a7a]/14 bg-white/85 text-[#7d262e] hover:bg-white'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[520px] animate-pulse rounded-[30px] bg-white/70 shadow-[0_12px_34px_rgba(233,122,122,0.08)]" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} delay={index * 0.08} />
            ))}
          </motion.div>
        ) : (
          <div className="rounded-[34px] border border-[#e97a7a]/12 bg-white/75 py-20 text-center shadow-[0_12px_34px_rgba(233,122,122,0.08)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2d7] text-2xl">
              ✨
            </div>
            <h3 className="font-heading text-3xl font-black text-[#7d262e]">No products found</h3>
            <p className="mt-3 text-[#7c5f5f]">Try changing the search or category filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSortBy('featured');
              }}
              className="mt-6 rounded-full bg-[#e97a7a] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
