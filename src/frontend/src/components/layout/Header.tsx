import Logo from '../brand/Logo';
import LoginButton from '../auth/LoginButton';
import ModeSelector from '../auth/ModeSelector';
import { useCallerRole } from '../../hooks/auth/useCallerRole';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const { isAdmin, isVendor } = useCallerRole();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
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
            {!isAuthenticated && <ModeSelector />}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
