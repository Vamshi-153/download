import { SellerProductManagement } from '@/components/seller/seller-product-management';
import { SellerOrderHistory } from '@/components/seller/seller-order-history';
import { SellerTransactionHistory } from '@/components/seller/seller-transaction-history';
import { SellerHomeContentEditor } from '@/components/seller/seller-home-content-editor';
import { SellerCouponManagement } from '@/components/seller/seller-coupon-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DownloadReportButton } from '@/components/seller/download-report-button';
import { downloadOrderReportAction, downloadTransactionReportAction } from '@/lib/actions/seller';
import { 
  Package, 
  FileText, 
  CreditCard, 
  Image, 
  Tag,
  LayoutDashboard
} from 'lucide-react';

export default function SellerDashboardPage() {
  // Null data for orders, transactions, and coupons
  const nullOrdersData = null;
  const nullTransactionsData = null;
  const nullCouponsData = null;

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="dashboard" className="flex flex-col md:flex-row w-full gap-6">
        {/* Enhanced Sidebar Navigation */}
        <div className="md:w-64 w-full shrink-0">
          <div className="sticky top-20">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Dashboard Menu</h2>
              </div>
              <TabsList className="flex flex-col w-full h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="products" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <Package size={18} />
                  <span>Product Management</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="orders" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <FileText size={18} />
                  <span>Order History</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <CreditCard size={18} />
                  <span>Transaction History</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="homepageContent" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <Image size={18} />
                  <span>Homepage Image</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="coupons" 
                  className="flex items-center gap-3 w-full justify-start px-4 py-3 text-left border-l-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 transition-all"
                >
                  <Tag size={18} />
                  <span>Coupon Management</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-left">Seller Dashboard</h1>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>View key metrics and performance indicators for your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Sales Today */}
                  <Card className="bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-x-2">
                        <p className="text-sm font-medium text-muted-foreground">Sales Today</p>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-1">
                        <p className="text-2xl font-bold">₹--,---</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <span>No data available</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Orders */}
                  <Card className="bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-x-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-1">
                        <p className="text-2xl font-bold">--</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <span>No data available</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Products */}
                  <Card className="bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-x-2">
                        <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-1">
                        <p className="text-2xl font-bold">--</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <span>No data available</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Satisfaction */}
                  <Card className="bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between space-x-2">
                        <p className="text-sm font-medium text-muted-foreground">Customer Rating</p>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
                          <path d="M7.5 0.25L9.75 4.75L14.75 5.5L11.125 8.875L12 13.75L7.5 11.5L3 13.75L3.875 8.875L0.25 5.5L5.25 4.75L7.5 0.25Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="mt-1">
                        <p className="text-2xl font-bold">--/5</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <span>No data available</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Order ID</th>
                          <th className="text-left py-3 px-4 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 font-medium">Products</th>
                          <th className="text-left py-3 px-4 font-medium">Total</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>{/* Fix: Remove whitespace between table row tags */}
                        <tr className="border-b hover:bg-muted/50"><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">--</span></td></tr>
                        <tr className="border-b hover:bg-muted/50"><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">--</span></td></tr>
                        <tr className="border-b hover:bg-muted/50"><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">--</span></td></tr>
                        <tr className="border-b hover:bg-muted/50"><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4">--</td><td className="py-3 px-4"><span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">--</span></td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Products</CardTitle>
                <CardDescription>Add, edit, or remove products from your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <SellerProductManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View past orders and download reports.</CardDescription>
                </div>
                <DownloadReportButton
                  reportType="orders"
                  downloadAction={downloadOrderReportAction}
                />
              </CardHeader>
              <CardContent>
                {/* Using null data for orders */}
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <h3 className="text-lg font-medium">No Order History Available</h3>
                  <p className="text-muted-foreground mt-1">Order data is currently unavailable or empty.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Review your sales transactions and payouts.</CardDescription>
                </div>
                <DownloadReportButton
                  reportType="transactions"
                  downloadAction={downloadTransactionReportAction}
                />
              </CardHeader>
              <CardContent>
                {/* Using null data for transactions */}
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <h3 className="text-lg font-medium">No Transaction History Available</h3>
                  <p className="text-muted-foreground mt-1">Transaction data is currently unavailable or empty.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepageContent">
            <Card>
              <CardHeader>
                <CardTitle>Customize Homepage Image</CardTitle>
                <CardDescription>Edit the featured image displayed on your store's homepage.</CardDescription>
              </CardHeader>
              <CardContent>
                <SellerHomeContentEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Manage Coupons</CardTitle>
                <CardDescription>Create, edit, or delete discount coupons for your store.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Using null data for coupons */}
                <div className="text-center py-8">
                  <Tag className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
                  <h3 className="text-lg font-medium">No Coupons Available</h3>
                  <p className="text-muted-foreground mt-1">Coupon data is currently unavailable or empty.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}