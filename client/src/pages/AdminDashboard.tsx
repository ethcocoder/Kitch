import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  Plus,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";

type AdminTab = "dashboard" | "products" | "users" | "orders" | "cms" | "settings";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCMSForm, setShowCMSForm] = useState(false);

  const dashboardData = trpc.admin.dashboard.useQuery();
  const products = trpc.products.list.useQuery();
  const features = trpc.features.list.useQuery();
  const testimonials = trpc.testimonials.list.useQuery();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "cms", label: "CMS", icon: ChefHat },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } z-40`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-amber-400" />
              <span className="font-bold text-lg">Kitch Admin</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-amber-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">{user?.name}</span>
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Products", value: dashboardData.data?.totalProducts || 0, icon: Package },
                    { label: "Total Features", value: dashboardData.data?.totalFeatures || 0, icon: BarChart3 },
                    { label: "Testimonials", value: dashboardData.data?.totalTestimonials || 0, icon: Users },
                    { label: "Active Users", value: "0", icon: Users },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">{stat.label}</p>
                          <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        </div>
                        <stat.icon className="w-12 h-12 text-amber-400 opacity-20" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                  <p className="text-slate-400">No recent activity</p>
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Products Management</h2>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => setShowProductForm(!showProductForm)}
                  >
                    <Plus size={20} className="mr-2" />
                    Add Product
                  </Button>
                </div>

                {showProductForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Add New Product</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Product Name"
                        className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                    </div>
                    <textarea
                      placeholder="Description"
                      className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button className="bg-amber-500 hover:bg-amber-600">Save Product</Button>
                      <Button variant="outline" onClick={() => setShowProductForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {products.data?.slice(0, 5).map((product) => (
                        <tr key={product.id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4">{product.name}</td>
                          <td className="px-6 py-4">{product.category}</td>
                          <td className="px-6 py-4">${product.price}</td>
                          <td className="px-6 py-4">{product.stock}</td>
                          <td className="px-6 py-4 flex gap-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <Edit2 size={18} />
                            </button>
                            <button className="text-red-400 hover:text-red-300">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* CMS Tab */}
            {activeTab === "cms" && (
              <motion.div
                key="cms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Content Management System</h2>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => setShowCMSForm(!showCMSForm)}
                  >
                    <Plus size={20} className="mr-2" />
                    Add Content
                  </Button>
                </div>

                {showCMSForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4"
                  >
                    <h3 className="text-lg font-semibold">Add CMS Content</h3>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Content Key (e.g., hero_title)"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Title"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                      />
                      <textarea
                        placeholder="Content"
                        className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button className="bg-amber-500 hover:bg-amber-600">Save Content</Button>
                        <Button variant="outline" onClick={() => setShowCMSForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Features</h3>
                    <div className="space-y-3">
                      {features.data?.map((feature) => (
                        <div key={feature.id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>{feature.title}</span>
                          <div className="flex gap-2">
                            <button className="text-blue-400">
                              <Edit2 size={16} />
                            </button>
                            <button className="text-red-400">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Testimonials</h3>
                    <div className="space-y-3">
                      {testimonials.data?.map((testimonial) => (
                        <div key={testimonial.id} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                          <span>{testimonial.authorName}</span>
                          <div className="flex gap-2">
                            <button className="text-blue-400">
                              <Edit2 size={16} />
                            </button>
                            <button className="text-red-400">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-6">User Management</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <p className="text-slate-400">User management features coming soon</p>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <p className="text-slate-400">Orders management features coming soon</p>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <p className="text-slate-400">Settings features coming soon</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
