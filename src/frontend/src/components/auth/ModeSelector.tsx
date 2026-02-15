import { useAuthMode } from '../../hooks/auth/useAuthMode';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Store } from 'lucide-react';

export default function ModeSelector() {
  const { mode, setMode } = useAuthMode();

  return (
    <Tabs value={mode} onValueChange={(value) => setMode(value as 'customer' | 'vendor')}>
      <TabsList className="glass-panel">
        <TabsTrigger value="customer" className="gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Customer</span>
        </TabsTrigger>
        <TabsTrigger value="vendor" className="gap-2">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Vendor</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
