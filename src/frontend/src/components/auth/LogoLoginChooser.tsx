import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthMode } from '../../hooks/auth/useAuthMode';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, LogIn, Loader2, Check } from 'lucide-react';

interface LogoLoginChooserProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export default function LogoLoginChooser({ isOpen, onClose, anchorRef }: LogoLoginChooserProps) {
  const { login, loginStatus } = useInternetIdentity();
  const { mode, setMode } = useAuthMode();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  const handleLogin = async () => {
    try {
      await login();
      onClose();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" />
      <div
        ref={popoverRef}
        className="fixed z-50 glass-panel border rounded-lg shadow-lg p-4 min-w-[280px]"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground">Choose your role</h3>
            <div className="space-y-2">
              <button
                onClick={() => setMode('customer')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  mode === 'customer'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background/50 border-border hover:bg-accent/50'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Customer</span>
                {mode === 'customer' && <Check className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMode('vendor')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  mode === 'vendor'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background/50 border-border hover:bg-accent/50'
                }`}
              >
                <Store className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">Vendor</span>
                {mode === 'vendor' && <Check className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login as {mode === 'vendor' ? 'Vendor' : 'Customer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
