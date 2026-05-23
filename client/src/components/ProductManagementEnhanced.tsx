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
        // Update existing product
        await updateDoc(doc(db, "products", editingId), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success("Product updated successfully");
      } else {
        // Add new product
        await addDoc(collection(db, "products"), {
          ...formData,
          totalSold: 0,
          totalProfit: 0,
          createdAt: new Date(),
        });
        toast.success("Product added successfully");
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

  // Calculate statistics
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cyan-400">Product Management</h2>
          <p className="text-slate-400">Manage your product catalog and track profits</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Download className="w-5 h-5" />
            PDF
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "Add Product"}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.totalProducts}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Stock</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Sold</p>
            <p className="text-2xl font-bold text-purple-400">{stats.totalSold}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">{stats.totalRevenue.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Profit</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.totalProfit.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              {editingId ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter product name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Kitchen, Bedroom"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Selling Price (ETB) *
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Cost Price (ETB)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.cost || 0}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Profit Margin (%)
                  </label>
                  <div className="text-slate-300 text-sm pt-2">
                    {formData.price && formData.cost
                      ? (((formData.price - formData.cost) / formData.price) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter product description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-white placeholder-slate-500 rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Products ({products.length})</CardTitle>
          <CardDescription>All products in your catalog</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No products yet. Add your first product!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Stock</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Sold</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Profit</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white">{product.name}</td>
                      <td className="py-3 px-4 text-slate-300">{product.category}</td>
                      <td className="py-3 px-4 text-green-400 font-semibold">
                        {product.price.toFixed(2)} ETB
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 0
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-purple-400 font-semibold">
                        {product.totalSold || 0}
                      </td>
                      <td className="py-3 px-4 text-yellow-400 font-semibold">
                        {(product.totalProfit || 0).toFixed(0)} ETB
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
