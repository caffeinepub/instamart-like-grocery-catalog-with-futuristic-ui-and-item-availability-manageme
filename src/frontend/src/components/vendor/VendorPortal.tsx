import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VendorProductTable from './VendorProductTable';
import VendorProductForm from './VendorProductForm';
import { Package, Plus } from 'lucide-react';

export default function VendorPortal() {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Vendor Portal
        </CardTitle>
        <CardDescription>
          Manage your product catalog and inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">
              <Package className="w-4 h-4 mr-2" />
              My Products
            </TabsTrigger>
            <TabsTrigger value="add">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="mt-6">
            <VendorProductTable />
          </TabsContent>
          
          <TabsContent value="add" className="mt-6">
            <VendorProductForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
