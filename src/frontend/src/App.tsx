import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/auth/useCallerProfile';
import { useCallerRole } from './hooks/auth/useCallerRole';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import StorefrontHero from './components/storefront/StorefrontHero';
import ProductGrid from './components/storefront/ProductGrid';
import AdminPanel from './components/admin/AdminPanel';
import VendorPortal from './components/vendor/VendorPortal';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { isAdmin, isVendor } = useCallerRole();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          <StorefrontHero />
          
          {isAdmin && (
            <section className="container mx-auto px-4 py-8">
              <AdminPanel />
            </section>
          )}
          
          {isVendor && !isAdmin && (
            <section className="container mx-auto px-4 py-8">
              <VendorPortal />
            </section>
          )}
          
          <section className="container mx-auto px-4 py-12">
            <ProductGrid />
          </section>
        </main>
        
        <Footer />
        
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
