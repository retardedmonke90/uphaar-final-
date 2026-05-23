import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await api.submitContact(formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you! Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <ContactCard
            icon={<Mail className="w-8 h-8" />}
            title="Email Us"
            content="support@uphaar.com"
          />
          <ContactCard
            icon={<Phone className="w-8 h-8" />}
            title="Call Us"
            content="+91 98765 43210"
          />
          <ContactCard
            icon={<MapPin className="w-8 h-8" />}
            title="Visit Us"
            content="Delhi, India"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-rose-600" />
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
                required
              />

              <input
                type="email"
                placeholder="Your Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
                required
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
              />

              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors"
              />

              <textarea
                placeholder="Your Message *"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-colors resize-none"
                rows={6}
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || submitted}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  'Sending...'
                ) : submitted ? (
                  'Sent!'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-8 flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Why Contact Us?</h3>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-2xl">💬</span>
                <div>
                  <strong>Customer Support</strong>
                  <p className="text-sm">Get help with your orders and queries</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-2xl">🎁</span>
                <div>
                  <strong>Bulk Orders</strong>
                  <p className="text-sm">Special pricing for wholesale purchases</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-2xl">✨</span>
                <div>
                  <strong>Custom Requests</strong>
                  <p className="text-sm">Tell us about your custom design ideas</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 text-2xl">🤝</span>
                <div>
                  <strong>Partnerships</strong>
                  <p className="text-sm">Collaborate with us on exciting projects</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, content }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
    >
      <div className="text-rose-500 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </motion.div>
  );
}
