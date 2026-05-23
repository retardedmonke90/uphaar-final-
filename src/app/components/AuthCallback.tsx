import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShieldCheck } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Magic links are disabled. Redirecting to account…');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/account', { replace: true });
    }, 1200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-[36px] border border-[#e97a7a]/12 bg-[rgba(255,253,248,0.92)] px-8 py-10 text-center shadow-[0_18px_60px_rgba(233,122,122,0.1)] backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2d7] text-[#e97a7a]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-3xl font-black text-[#7d262e]">Authentication</h1>
        <p className="mt-3 text-[#7c5f5f]">{message}</p>
      </div>
    </div>
  );
}
