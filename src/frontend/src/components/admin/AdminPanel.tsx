import { useState } from 'react';
import ProductForm from './ProductForm';
import AdminProductTable from './AdminProductTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Package } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('manage');

  return (
    <Card className="glass-panel border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle>Admin Panel</CardTitle>
        </div>
        <CardDescription>
          Manage your product catalog and inventory
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="manage">
              <Package className="w-4 h-4 mr-2" />
              Manage Products
            </TabsTrigger>
            <TabsTrigger value="add">Add New Product</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="mt-6">
            <AdminProductTable />
          </TabsContent>
          
          <TabsContent value="add" className="mt-6">
            <ProductForm onSuccess={() => setActiveTab('manage')} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
