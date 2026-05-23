import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, Send, ThumbsUp } from 'lucide-react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const result = await api.getReviews();
      setReviews(result.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.comment) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await api.createReview(formData);
      toast.success('Thank you for your review!');
      setFormData({ name: '', rating: 5, comment: '' });
      setShowForm(false);
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '4.7';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Customer Reviews
          </h1>
          <p className="text-lg text-gray-600 mb-6">See what our customers are saying</p>

          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-rose-600">{averageRating}</div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(parseFloat(averageRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-gray-600 mt-1">
                Based on {reviews.length || '150+'} reviews
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </motion.button>
        </motion.div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none"
                required
              />

              <div>
                <label className="block text-gray-700 font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      <Star
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Tell us about your experience..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none resize-none"
                rows={4}
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5" />
                Submit Review
              </button>
            </form>
          </motion.div>
        )}

        <div className="space-y-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ReviewCard key={review.id || index} review={review} delay={index * 0.1} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-800 text-lg">{review.name || 'Anonymous'}</h4>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <button className="text-gray-400 hover:text-rose-500 transition-colors">
          <ThumbsUp className="w-5 h-5" />
        </button>
      </div>
      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      {review.createdAt && (
        <div className="text-sm text-gray-400 mt-4">
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}
