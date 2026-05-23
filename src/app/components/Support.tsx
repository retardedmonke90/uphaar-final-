import { motion } from 'motion/react';
import { HelpCircle, Package, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react';
import { Link } from 'react-router';

export default function Support() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Help Center
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions and get support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <SupportCard
            icon={<Package className="w-8 h-8" />}
            title="Order Tracking"
            description="Track your order status and delivery"
          />
          <SupportCard
            icon={<CreditCard className="w-8 h-8" />}
            title="Payment Issues"
            description="Help with payment and billing"
          />
          <SupportCard
            icon={<Truck className="w-8 h-8" />}
            title="Shipping Info"
            description="Delivery times and shipping policies"
          />
          <SupportCard
            icon={<RotateCcw className="w-8 h-8" />}
            title="Returns & Refunds"
            description="Easy returns within 7 days"
          />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-rose-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <FAQItem
              question="How long does delivery take?"
              answer="We deliver within 3-5 business days for metro cities and 5-7 days for other locations. You'll receive a tracking number once your order is shipped."
            />
            <FAQItem
              question="What is your return policy?"
              answer="We offer easy returns within 7 days of delivery. Items must be unused and in original packaging. Contact our support team to initiate a return."
            />
            <FAQItem
              question="Do you offer Cash on Delivery?"
              answer="Yes! We accept both Cash on Delivery (COD) and online payment methods for your convenience."
            />
            <FAQItem
              question="How can I track my order?"
              answer="Once your order is shipped, you'll receive a tracking link via email and SMS. You can also check your order status in the Order History section."
            />
            <FAQItem
              question="Are the products handmade?"
              answer="Yes! Our handmade flowers and many accessories are carefully crafted by artisans. Each piece is unique and made with love."
            />
            <FAQItem
              question="Can I customize products?"
              answer="Absolutely! We offer customization for many products. Contact us with your requirements and we'll create something special for you."
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 shadow-lg text-center">
          <Shield className="w-12 h-12 text-rose-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Still Need Help?</h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help you with any questions or concerns
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, description }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="text-rose-500 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
          <h4 className="font-semibold text-gray-800">{question}</h4>
          <span className="text-rose-600 group-open:rotate-180 transition-transform">▼</span>
        </div>
      </summary>
      <div className="p-4 text-gray-600 bg-gray-50 rounded-b-lg mt-1">{answer}</div>
    </details>
  );
}
