import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { LogIn, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_EMAIL, isAdminEmail } from '../lib/auth';
import {
  getLocalSession,
  signInAdmin,
  signInCustomer,
  signOutLocal,
  signUpCustomer,
  subscribeAuth,
  type LocalAuthSession,
} from '../lib/localAuth';

type AuthMode = 'signin' | 'signup';

export default function Account() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<LocalAuthSession | null>(null);

  useEffect(() => {
    setSession(getLocalSession());
    const unsubscribe = subscribeAuth(setSession);
    return () => unsubscribe();
  }, []);

  const adminAccess = useMemo(() => isAdminEmail(session?.email), [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      let nextSession: LocalAuthSession;
      if (mode === 'signup') {
        nextSession = await signUpCustomer(email, password);
        toast.success('Account created successfully');
      } else if (email.trim().toLowerCase() === ADMIN_EMAIL) {
        nextSession = await signInAdmin(email, password);
        toast.success('Admin access granted');
      } else {
        nextSession = await signInCustomer(email, password);
        toast.success('Signed in successfully');
      }

      setSession(nextSession);
      setEmail(nextSession.email);
      setPassword('');
    } catch (error: any) {
      toast.error(error?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    signOutLocal();
    setSession(null);
    setEmail('');
    setPassword('');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.9)] p-8 shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2d7] text-[#e97a7a]">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b07878]">Customer Account</p>
            <h1 className="mt-3 font-heading text-4xl font-black text-[#7d262e]">Email & Password Login</h1>
            <p className="mt-3 text-[#7c5f5f]">
              Create an account for special offers and order history. Owner access stays locked to the admin email.
            </p>
          </div>

          {session?.email ? (
            <div className="rounded-[28px] border border-[#e97a7a]/12 bg-white/80 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)]">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-black text-[#7d262e]">You&apos;re signed in</h2>
                  <p className="mt-2 text-[#7c5f5f]">{session.email}</p>
                  <p className="mt-1 text-sm text-[#b07878]">
                    {session.role === 'admin'
                      ? 'Owner access unlocked. You can manage products and orders.'
                      : `Your welcome offer is ${session.welcomeDiscountPercent}% off.`}
                  </p>
                  {adminAccess && session.role === 'admin' && (
                    <div className="mt-4 rounded-2xl border border-[#e97a7a]/12 bg-[#fff2d7]/60 p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b07878]">Owner Access</p>
                      <p className="mt-2 text-[#7c5f5f]">This email has admin privileges.</p>
                      <Link
                        to="/admin"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e97a7a] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] active:scale-[0.98]"
                      >
                        Open Admin Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-[#e97a7a]/14 bg-white/80 px-6 py-3 font-semibold text-[#7d262e] transition-all duration-300 hover:bg-white active:scale-[0.98]"
                >
                  View Order History
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e97a7a] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] active:scale-[0.98]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 rounded-full bg-white/70 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setPassword('');
                  }}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    mode === 'signin'
                      ? 'bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)]'
                      : 'text-[#7c5f5f]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setPassword('');
                  }}
                  className={`rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    mode === 'signup'
                      ? 'bg-[#e97a7a] text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)]'
                      : 'text-[#7c5f5f]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-[#e97a7a]/14 bg-white/90 px-5 py-4 text-[#7d262e] outline-none focus:border-[#e97a7a]/35"
              />

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
                className="w-full rounded-full border border-[#e97a7a]/14 bg-white/90 px-5 py-4 text-[#7d262e] outline-none focus:border-[#e97a7a]/35"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#e97a7a] px-6 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(233,122,122,0.18)] transition-all duration-300 hover:bg-[#d76c6c] disabled:opacity-60 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                {loading ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              <p className="text-center text-xs text-[#a98282]">
                {mode === 'signin'
                  ? 'Use your account to access order history and special offers.'
                  : `Customers get a 10% welcome offer after account creation. Owner access stays locked to ${ADMIN_EMAIL}.`}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
