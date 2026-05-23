import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-9xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops! Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 border-2 border-rose-500 rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Browse Products
          </Link>
        </div>

        <div className="mt-12 text-6xl">🌸</div>
      </motion.div>
    </div>
  );
}
