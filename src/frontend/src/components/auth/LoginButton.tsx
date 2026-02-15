import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAuthMode } from '../../hooks/auth/useAuthMode';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { mode } = useAuthMode();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const getLoginText = () => {
    if (isLoggingIn) return 'Logging in...';
    if (isAuthenticated) return 'Logout';
    return mode === 'vendor' ? 'Login as Vendor' : 'Login as Customer';
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoggingIn}
      variant={isAuthenticated ? 'outline' : 'default'}
      className="gap-2"
    >
      {isLoggingIn ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {getLoginText()}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4" />
          {getLoginText()}
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          {getLoginText()}
        </>
      )}
    </Button>
  );
}
