import { motion } from 'motion/react';
import logo from '../../imports/image.png';

export default function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(233,122,122,0.18),transparent_28%),linear-gradient(180deg,#fff2d7_0%,#fff9f4_55%,#fffdf8_100%)] px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.86, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.img
          src={logo}
          alt="UPHAAR logo"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="mx-auto h-44 w-44 object-contain drop-shadow-[0_18px_40px_rgba(233,122,122,0.18)]"
        />

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.65 }}
          className="mt-6 font-heading text-6xl font-black tracking-tight text-[#7d262e] md:text-7xl"
        >
          UPHAAR
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-3 text-lg font-medium uppercase tracking-[0.35em] text-[#b07878]"
        >
          how far can you go for love?
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.95, duration: 0.75 }}
          className="mx-auto mt-8 h-1 w-64 rounded-full bg-gradient-to-r from-[#e97a7a] via-[#ffd6a5] to-[#f7b7c2]"
        />
      </motion.div>
    </div>
  );
}
