import { Outlet, Link, useLocation } from 'react-router';
import { ShoppingCart, Menu, X, Sparkles } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { isAdminEmail } from '../lib/auth';
import { getLocalSession, subscribeAuth } from '../lib/localAuth';
import logo from '../../imports/image.png';
import SitePromos from './SitePromos';

export default function Root() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sessionEmail, setSessionEmail] = useState('');
  const [sessionRole, setSessionRole] = useState<'customer' | 'admin' | ''>('');
  const location = useLocation();
  const { cartItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncSession = () => {
      const session = getLocalSession();
      setSessionEmail(session?.email?.toLowerCase() || '');
      setSessionRole(session?.role || '');
    };

    syncSession();
    const unsubscribe = subscribeAuth((session) => {
      setSessionEmail(session?.email?.toLowerCase() || '');
      setSessionRole(session?.role || '');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = sessionRole === 'admin' && isAdminEmail(sessionEmail);

  return (
    <div className="min-h-screen bg-transparent">
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/60 bg-[rgba(255,249,244,0.84)] shadow-[0_12px_40px_rgba(233,122,122,0.08)] backdrop-blur-2xl'
            : 'border-transparent bg-[rgba(255,253,248,0.6)] backdrop-blur-xl'
        }`}
        initial={{ y: -120 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={logo}
                alt="UPHAAR"
                className="h-12 w-12 rounded-2xl object-contain shadow-[0_12px_30px_rgba(233,122,122,0.14)] transition-transform duration-300 group-hover:scale-110"
              />
              <div>
                <span className="block font-heading text-2xl font-black tracking-tight text-[#7d262e]">
                  UPHAAR
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-[#a06a6f]">
                  how far can you go for love?
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/categories">Shop</NavLink>
              <NavLink to="/lucky-draw">
                <Sparkles className="mr-1 inline h-4 w-4" />
                Lucky Draw
              </NavLink>
              <NavLink to="/reviews">Reviews</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <NavLink to="/account">Account</NavLink>
              {isAdmin && <NavLink to="/admin">Admin</NavLink>}
              <Link
                to="/cart"
                className="relative ml-2 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#e97a7a]/15 bg-white/70 text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.08)] transition-all duration-300 hover:scale-110 hover:bg-white"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e97a7a] px-1 text-[11px] font-bold text-white shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e97a7a]/15 bg-white/70 text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.08)] md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#e97a7a]/10 bg-[rgba(255,249,244,0.95)] md:hidden"
            >
              <div className="mx-auto max-w-[1440px] space-y-2 px-4 py-4">
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/categories">Shop</MobileNavLink>
                <MobileNavLink to="/lucky-draw">Lucky Draw</MobileNavLink>
                <MobileNavLink to="/reviews">Reviews</MobileNavLink>
                <MobileNavLink to="/contact">Contact</MobileNavLink>
                <MobileNavLink to="/account">Account</MobileNavLink>
                {isAdmin && <MobileNavLink to="/admin">Admin</MobileNavLink>}
                <MobileNavLink to="/cart">Cart ({cartItemCount})</MobileNavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="min-h-screen pt-20">
        <Outlet />
      </main>

      <SitePromos />

      <footer className="mt-24 border-t border-[#e97a7a]/12 bg-[linear-gradient(180deg,rgba(255,249,244,0.5),rgba(255,242,215,0.7))]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className="font-heading text-2xl font-black text-[#7d262e]">UPHAAR</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#7c5f5f]">
              Soft, aesthetic accessories for your sweetest everyday moments.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-[#7d262e]">Quick Links</h4>
            <ul className="space-y-2 text-[#7c5f5f]">
              <li><Link to="/categories" className="hover:text-[#e97a7a]">Shop</Link></li>
              <li><Link to="/lucky-draw" className="hover:text-[#e97a7a]">Lucky Draw</Link></li>
              <li><Link to="/reviews" className="hover:text-[#e97a7a]">Reviews</Link></li>
              <li><Link to="/orders" className="hover:text-[#e97a7a]">Order History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-[#7d262e]">Support</h4>
            <ul className="space-y-2 text-[#7c5f5f]">
              <li><Link to="/contact" className="hover:text-[#e97a7a]">Contact Us</Link></li>
              <li><Link to="/support" className="hover:text-[#e97a7a]">Help Center</Link></li>
              <li><a href="#" className="hover:text-[#e97a7a]">Shipping Info</a></li>
              <li><a href="#" className="hover:text-[#e97a7a]">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold text-[#7d262e]">Connect</h4>
            <p className="text-[#7c5f5f]">Follow us for drops, offers, and cute updates.</p>
            <div className="mt-4 flex gap-3 text-xl">
              <a href="#" className="transition-transform hover:scale-110">📱</a>
              <a href="#" className="transition-transform hover:scale-110">💬</a>
              <a href="#" className="transition-transform hover:scale-110">📧</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#e97a7a]/12 py-5 text-center text-sm text-[#8d7373]">
          © 2026 UPHAAR. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
        isActive
          ? 'bg-white/90 text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.1)]'
          : 'text-[#6f5656] hover:bg-white/75 hover:text-[#7d262e]'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block rounded-2xl px-4 py-3 font-medium ${
        isActive
          ? 'bg-white text-[#7d262e] shadow-[0_10px_25px_rgba(233,122,122,0.1)]'
          : 'text-[#6f5656] hover:bg-white/70'
      }`}
    >
      {children}
    </Link>
  );
}
