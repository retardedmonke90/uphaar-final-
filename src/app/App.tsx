import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import SplashScreen from './components/SplashScreen';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import MouseGlow from './components/ui/mouse-glow';
import FloatingBackground from './components/ui/floating-background';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <CartProvider>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <FloatingBackground />
        <MouseGlow />
        <div className="relative z-10">
          <RouterProvider router={router} />
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 253, 248, 0.96)',
              color: '#4a2a2a',
              border: '1px solid rgba(233, 122, 122, 0.16)',
              borderRadius: '18px',
              boxShadow: '0 16px 45px rgba(233, 122, 122, 0.12)',
            },
          }}
        />
      </div>
    </CartProvider>
  );
}
