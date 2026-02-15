import { useState, useRef } from 'react';
import Logo from '../brand/Logo';
import LoginButton from '../auth/LoginButton';
import LogoLoginChooser from '../auth/LogoLoginChooser';
import CartSheet from '../storefront/CartSheet';
import { useCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCart } from '../../hooks/cart/useCart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  const { isAdmin, isVendor, isCustomer } = useCallerRole();
  const { identity } = useInternetIdentity();
  const { getItemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginChooserOpen, setLoginChooserOpen] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !!identity;
  const itemCount = getItemCount();

  const handleLogoClick = () => {
    if (!isAuthenticated) {
      setLoginChooserOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" ref={logoRef}>
              <Logo 
                onClick={!isAuthenticated ? handleLogoClick : undefined}
              />
              {isAdmin && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  Admin
                </Badge>
              )}
              {isVendor && !isAdmin && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Vendor
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {(isCustomer || !isAuthenticated) && (
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              )}
              {isAuthenticated && <LoginButton />}
            </div>
          </div>
        </div>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
      
      {!isAuthenticated && (
        <LogoLoginChooser
          isOpen={loginChooserOpen}
          onClose={() => setLoginChooserOpen(false)}
          anchorRef={logoRef}
        />
      )}
    </>
  );
}
