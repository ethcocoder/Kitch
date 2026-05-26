import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, Download } from "lucide-react";
import { exportProductInventoryExcel, exportProductInventoryPDF } from "../lib/exportUtils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  totalSold: number;
  totalProfit: number;
  imageUrl?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: any;
}

export function ProductManagementEnhanced() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    category: "",
    stock: 0,
    totalSold: 0,
    totalProfit: 0,
    imageUrl: "",
  });

  useEffect(() => {
    setLoading(true);
    const productsRef = collection(db, "products");
    
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setProducts([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success("Product updated successfully");
      } else {
        await addDoc(collection(db, "products"), {
          ...formData,
          totalSold: 0,
          totalProfit: 0,
          createdAt: new Date(),
        });
        toast.success("Product added successfully!");
      }

      setFormData({
        name: "",
        description: "",
        price: 0,
        cost: 0,
        category: "",
        stock: 0,
        totalSold: 0,
        totalProfit: 0,
        imageUrl: "",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleApproveProduct = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), {
        status: "approved",
        updatedAt: new Date(),
      });
      toast.success("Product approved!");
    } catch (error) {
      toast.error("Error approving product");
    }
  };

  const handleRejectProduct = async (id: string) => {
    try {
      await updateDoc(doc(db, "products", id), {
        status: "rejected",
        updatedAt: new Date(),
      });
      toast.success("Product rejected!");
    } catch (error) {
      toast.error("Error rejecting product");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      cost: 0,
      category: "",
      stock: 0,
      totalSold: 0,
      totalProfit: 0,
      imageUrl: "",
    });
  };

  const handleExportExcel = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    exportProductInventoryExcel(products);
    toast.success("Exported to Excel");
  };

  const handleExportPDF = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    exportProductInventoryPDF(products);
    toast.success("Exported to PDF");
  };

  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalSold: products.reduce((sum, p) => sum + (p.totalSold || 0), 0),
    totalProfit: products.reduce((sum, p) => sum + (p.totalProfit || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + p.price * (p.totalSold || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const pendingProducts = products.filter(p => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Pending Approvals Card */}
      {pendingProducts.length > 0 && (
        <Card className="bg-slate-800 border-yellow-500/50">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Pending Product Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProducts.map((p) => (
                <div key={p.id} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center border border-slate-600">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate text-sm">{p.name}</p>
                    <p className="text-slate-400 text-xs truncate">{p.category} - {p.price} ETB</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleApproveProduct(p.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-1.5 h-8 rounded-lg transition-colors"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectProduct(p.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 h-8 rounded-lg transition-colors"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">Product Management</h2>
          <p className="text-slate-400 text-sm md:text-base">Manage your product catalog and track profits</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 sm:px-4 rounded-lg flex gap-1 sm:gap-2 items-center justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 sm:px-4 rounded-lg flex gap-1 sm:gap-2 items-center justify-center text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-2 sm:px-4 rounded-lg flex gap-1 sm:gap-2 items-center justify-center text-xs sm:text-sm"
          >
            {showForm ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="hidden sm:inline">{showForm ? "Cancel" : "Add Product"}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 md:pt-6">
            <p className="text-slate-400 text-xs md:text-sm">Total Products</p>
            <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 md:pt-6">
            <p className="text-slate-400 text-xs md:text-sm">Total Stock</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">{stats.totalStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 md:pt-6">
            <p className="text-slate-400 text-xs md:text-sm">Total Sold</p>
            <p className="text-2xl md:text-3xl font-bold text-green-400">{stats.totalSold}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 md:pt-6">
            <p className="text-slate-400 text-xs md:text-sm">Revenue</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400">{stats.totalRevenue.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 col-span-2 md:col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <p className="text-slate-400 text-xs md:text-sm">Total Profit</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-400">{stats.totalProfit.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-cyan-400">{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Category *</label>
                  <Input
                    type="text"
                    placeholder="e.g., Appetizers"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Price (ETB) *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Cost (ETB)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Stock Quantity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                  <Input
                    type="text"
                    placeholder="Product description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                  {editingId ? "Update Product" : "Add Product"}
                </Button>
                <Button type="button" onClick={handleCancel} className="flex-1 bg-slate-700 text-white">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-cyan-400">Product Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-slate-900/50">
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Product</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden md:table-cell">Price</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Stock</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden md:table-cell">Sold</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden lg:table-cell">Profit</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium text-xs md:text-sm">{product.name}</span>
                          <span className="text-slate-400 text-[10px]">{product.description}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-slate-300">{product.category}</td>
                      <td className="py-3 px-4 hidden md:table-cell text-green-400 font-bold">{product.price} ETB</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          product.stock < 5 ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          product.status === "approved" ? "bg-green-500/20 text-green-400" : 
                          product.status === "rejected" ? "bg-red-500/20 text-red-400" : 
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {product.status || "approved"}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-yellow-400 font-bold">{product.totalSold || 0}</td>
                      <td className="py-3 px-4 hidden lg:table-cell text-purple-400 font-bold">{(product.totalProfit || 0).toFixed(0)} ETB</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 md:p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 md:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
