import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Gift, Zap } from 'lucide-react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';

const PRIZES = [
  { text: '₹100 OFF\non ₹999+', color: '#f43f5e', index: 0, discount: 100, minPurchase: 999, freeShipping: false },
  { text: '₹50 OFF\non ₹499+', color: '#ec4899', index: 1, discount: 50, minPurchase: 499, freeShipping: false },
  { text: '₹20 OFF\non ₹299+', color: '#fb7185', index: 2, discount: 20, minPurchase: 299, freeShipping: false },
  { text: '₹10 OFF\non any order', color: '#fbbf24', index: 3, discount: 10, minPurchase: 0, freeShipping: false },
  { text: 'Free\nShipping', color: '#fda4af', index: 4, discount: 0, minPurchase: 0, freeShipping: true },
];

export default function LuckyDraw() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { setDiscount, totalAmount } = useCart();

  const eligiblePrizes = useMemo(() => {
    return PRIZES.filter((prize) => totalAmount >= prize.minPurchase || prize.minPurchase === 0);
  }, [totalAmount]);

  const handleSpin = async () => {
    if (spinning) return;

    const pool = eligiblePrizes.length ? eligiblePrizes : PRIZES.slice(-1);
    const selected = pool[Math.floor(Math.random() * pool.length)] || PRIZES[0];
    const targetIndex = PRIZES.findIndex((item) => item.text === selected.text);

    setSpinning(true);
    setResult(null);

    const userId = localStorage.getItem('phulwari-user-id') || `user-${Date.now()}`;
    localStorage.setItem('phulwari-user-id', userId);

    let apiPrize: any = null;
    try {
      const response = await api.spinLuckyDraw(userId, totalAmount);
      if (response?.success === false) {
        toast.error(response.error || 'You have already spun today! Come back tomorrow.');
        setSpinning(false);
        return;
      }
      apiPrize = response?.prize || null;
    } catch {
      // fallback handled locally below
    }

    const prize = apiPrize || selected;
    const prizeIndex = PRIZES.findIndex((item) => item.text === prize.text);
    const spins = 5;
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIndex >= 0 ? prizeIndex : targetIndex) * segmentAngle;
    const totalRotation = rotation + 360 * spins + targetAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(prize);
      setShowModal(true);

      if (prize.discount > 0 || prize.freeShipping) {
        setDiscount({
          amount: prize.discount,
          minPurchase: prize.minPurchase,
          label: prize.text.replace('\n', ' '),
          freeShipping: prize.freeShipping,
          source: 'lucky',
        });
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        toast.success(`You won ${prize.text.replace('\n', ' ')}!`, { duration: 3000 });
      }
    }, 3800);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-block">
            <Sparkles className="mx-auto h-16 w-16 animate-pulse text-rose-500" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-5xl font-bold text-transparent">
            Lucky Draw Wheel
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Spin the wheel once per day to unlock a winning offer.
          </p>
        </motion.div>

        <div className="relative mb-12 flex flex-col items-center justify-center">
          <div className="absolute -top-4 z-20 transform scale-150">
            <div className="h-0 w-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-rose-600 drop-shadow-lg" />
          </div>

          <div className="relative flex h-96 w-96 items-center justify-center">
            <motion.div animate={{ rotate: rotation }} transition={{ duration: 4, ease: 'easeOut' }} className="relative h-full w-full">
              <svg viewBox="0 0 200 200" className="h-full w-full">
                {PRIZES.map((prize, index) => {
                  const angle = (360 / PRIZES.length) * index;
                  const nextAngle = (360 / PRIZES.length) * (index + 1);
                  const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                  const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                  const x2 = 100 + 100 * Math.cos((nextAngle * Math.PI) / 180);
                  const y2 = 100 + 100 * Math.sin((nextAngle * Math.PI) / 180);
                  const midAngle = angle + 360 / PRIZES.length / 2;
                  const textX = 100 + 60 * Math.cos((midAngle * Math.PI) / 180);
                  const textY = 100 + 60 * Math.sin((midAngle * Math.PI) / 180);

                  return (
                    <g key={index}>
                      <path d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={prize.color} stroke="white" strokeWidth="2" />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      >
                        {prize.text.split('\n').map((line, i) => (
                          <tspan key={i} x={textX} dy={i === 0 ? 0 : 12}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                })}

                <circle cx="100" cy="100" r="20" fill="white" stroke="#f43f5e" strokeWidth="4" />
                <circle cx="100" cy="100" r="10" fill="#f43f5e" />
              </svg>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: spinning ? 1 : 1.05 }}
            whileTap={{ scale: spinning ? 1 : 0.95 }}
            onClick={handleSpin}
            disabled={spinning}
            className={`mt-8 flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-12 py-4 text-xl font-bold text-white shadow-2xl transition-all duration-300 ${spinning ? 'cursor-not-allowed opacity-50' : 'hover:shadow-3xl'}`}
          >
            {spinning ? (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Spinning...
              </>
            ) : (
              <>
                <Zap className="h-6 w-6" />
                Spin the Wheel!
              </>
            )}
          </motion.button>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-8 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-800">
            <Gift className="h-6 w-6 text-rose-600" />
            How it Works
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3"><span className="font-bold text-rose-500">•</span><span>Spin the wheel once per day for free</span></li>
            <li className="flex items-start gap-3"><span className="font-bold text-rose-500">•</span><span>Win a valid discount or free shipping</span></li>
            <li className="flex items-start gap-3"><span className="font-bold text-rose-500">•</span><span>Discounts are applied only when the minimum order value is met</span></li>
            <li className="flex items-start gap-3"><span className="font-bold text-rose-500">•</span><span>Come back tomorrow for another chance to win!</span></li>
          </ul>
        </div>

        <AnimatePresence>
          {showModal && result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
              >
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎉</div>
                  <h2 className="mb-4 text-3xl font-bold text-gray-800">Congratulations!</h2>
                  <p className="mb-6 text-xl font-semibold text-rose-600">{result.text.replace('\n', ' ')}</p>
                  {result.discount > 0 && !result.freeShipping && (
                    <div className="mb-6 rounded-xl bg-rose-50 p-4">
                      <p className="text-gray-700">Your discount will apply automatically once the minimum order value is met.</p>
                    </div>
                  )}
                  {result.freeShipping && (
                    <div className="mb-6 rounded-xl bg-rose-50 p-4">
                      <p className="text-gray-700">Free shipping is active for this order.</p>
                    </div>
                  )}
                  <button onClick={() => setShowModal(false)} className="w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 py-3 font-bold text-white transition-transform duration-300 hover:scale-105">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
