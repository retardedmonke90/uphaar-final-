import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, BadgePercent, Gift, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router';

const PROMO_KEY = 'phulwari-site-promos-seen-at';
const PROMO_COOLDOWN_MS = 1000 * 60 * 60 * 24;

type PromoStep = 0 | 1 | 2;

export default function SitePromos() {
  const navigate = useNavigate();
  const [step, setStep] = useState<PromoStep | null>(null);
  const [visible, setVisible] = useState(false);

  const shouldShow = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(PROMO_KEY);
      if (!raw) return true;
      const seenAt = Number(raw);
      if (!Number.isFinite(seenAt)) return true;
      return Date.now() - seenAt > PROMO_COOLDOWN_MS;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    const timer = window.setTimeout(() => {
      setStep(0);
      setVisible(true);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [shouldShow]);

  const closeAll = () => {
    setVisible(false);
    setStep(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROMO_KEY, String(Date.now()));
    }
  };

  const advance = (next: PromoStep | null) => {
    if (next === null) {
      closeAll();
      return;
    }
    setVisible(false);
    window.setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 250);
  };

  const stepConfig = useMemo(() => {
    if (step === 1) {
      return {
        title: 'Create an account and get 10% off',
        eyebrow: 'Instant welcome offer',
        body: 'Sign up once, keep your shopping info for 30 days on this device, and unlock special offers and order history.',
        icon: <BadgePercent className="h-8 w-8 text-[#e97a7a]" />,
        primary: 'Create Account',
        primaryAction: () => {
          navigate('/account');
          advance(2);
        },
        secondary: 'Not now',
        secondaryAction: () => advance(2),
      };
    }

    if (step === 2) {
      return {
        title: 'Check your luck and spin the wheel',
        eyebrow: 'Crazy discount pop-up',
        body: 'Try the lucky draw once and claim a valid discount or free shipping on eligible orders.',
        icon: <Gift className="h-8 w-8 text-[#e97a7a]" />,
        primary: 'Spin the Wheel',
        primaryAction: () => {
          navigate('/lucky-draw');
          closeAll();
        },
        secondary: 'Close',
        secondaryAction: closeAll,
      };
    }

    return {
      title: 'New arrivals just dropped',
      eyebrow: 'Fresh release',
      body: 'Explore the latest UPHAAR products with a New Arrival tag and shop the freshest picks first.',
      icon: <Sparkles className="h-8 w-8 text-[#e97a7a]" />,
      primary: 'Shop New Arrivals',
      primaryAction: () => {
        navigate('/categories');
        advance(1);
      },
      secondary: 'Skip',
      secondaryAction: () => advance(1),
    };
  }, [advance, navigate, step]);

  if (!visible || step === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/25 px-4 py-4 backdrop-blur-sm sm:items-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.98)] p-6 shadow-[0_24px_90px_rgba(233,122,122,0.22)]"
        >
          <button
            onClick={closeAll}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e97a7a]/12 bg-white/80 text-[#7d262e] transition-transform duration-300 hover:scale-110"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4 inline-flex rounded-full bg-[#fff2d7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#b07878]">
            {stepConfig.eyebrow}
          </div>

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_12px_30px_rgba(233,122,122,0.12)]">
            {stepConfig.icon}
          </div>

          <h2 className="font-heading text-3xl font-black leading-tight text-[#7d262e]">
            {stepConfig.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#7c5f5f]">{stepConfig.body}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={stepConfig.primaryAction}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#e97a7a] px-5 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] active:scale-[0.98]"
            >
              {stepConfig.primary}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={stepConfig.secondaryAction}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-[#e97a7a]/14 bg-white/80 px-5 py-3 font-semibold text-[#7d262e] transition-all duration-300 hover:bg-white active:scale-[0.98]"
            >
              {stepConfig.secondary}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-[#a98282]">
            Popups appear once a day to keep the experience clean.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
