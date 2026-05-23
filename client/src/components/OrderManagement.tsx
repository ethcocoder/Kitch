import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "partial";
  orderDate: any;
  completedDate?: any;
  notes?: string;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [formData, setFormData] = useState<Partial<Order>>({
    customerName: "",
    customerEmail: "",
    items: [],
    totalAmount: 0,
    status: "pending",
    paymentStatus: "unpaid",
    notes: "",
  });
  const [newItem, setNewItem] = useState({ productName: "", quantity: 1, unitPrice: 0 });

  useEffect(() => {
    setLoading(true);
    const ordersRef = collection(db, "orders");
    
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
      setOrders(ordersList.sort((a, b) => {
        const dateA = a.orderDate?.toDate?.() || new Date(a.orderDate);
        const dateB = b.orderDate?.toDate?.() || new Date(b.orderDate);
        return dateB.getTime() - dateA.getTime();
      }));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = () => {
    if (!newItem.productName || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast.error("Please fill in all item fields");
      return;
    }

    const item: OrderItem = {
      productId: `prod_${Date.now()}`,
      productName: newItem.productName,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total: newItem.quantity * newItem.unitPrice,
    };

    const currentItems = formData.items || [];
    const updatedItems = [...currentItems, item];
    const totalAmount = updatedItems.reduce((sum, i) => sum + i.total, 0);

    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: totalAmount,
    });

    setNewItem({ productName: "", quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = (formData.items || []).filter((_, i) => i !== index);
    const totalAmount = updatedItems.reduce((sum, i) => sum + i.total, 0);
    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: totalAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.items || formData.items.length === 0) {
      toast.error("Please fill in all required fields and add at least one item");
      return;
    }

    try {
      const orderNumber = `ORD-${Date.now()}`;

      if (editingId) {
        await updateDoc(doc(db, "orders", editingId), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success("Order updated successfully");
      } else {
        await addDoc(collection(db, "orders"), {
          ...formData,
          orderNumber: orderNumber,
          orderDate: new Date(),
        });
        toast.success("Order created successfully");
      }

      setFormData({
        customerName: "",
        customerEmail: "",
        items: [],
        totalAmount: 0,
        status: "pending",
        paymentStatus: "unpaid",
        notes: "",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order");
    }
  };

  const handleEdit = (order: Order) => {
    setFormData(order);
    setEditingId(order.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await deleteDoc(doc(db, "orders", id));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "completed") {
        updateData.completedDate = new Date();
      }
      await updateDoc(doc(db, "orders", id), updateData);
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusChange = async (id: string, newPaymentStatus: Order["paymentStatus"]) => {
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus: newPaymentStatus });
      toast.success("Payment status updated");
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      customerName: "",
      customerEmail: "",
      items: [],
      totalAmount: 0,
      status: "pending",
      paymentStatus: "unpaid",
      notes: "",
    });
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed" && o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0),
    totalItemsSold: orders.reduce((sum, o) => sum + (o.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0),
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
          <h2 className="text-3xl font-bold text-cyan-400">Order Management</h2>
          <p className="text-slate-400">Manage customer orders and track sales</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cancel" : "New Order"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-cyan-400">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completedOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Items Sold</p>
            <p className="text-2xl font-bold text-purple-400">{stats.totalItemsSold}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-green-400">{stats.totalRevenue.toFixed(0)} ETB</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              {editingId ? "Edit Order" : "Create New Order"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Customer Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.customerName || ""}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Customer Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.customerEmail || ""}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {/* Add Items Section */}
              <div className="bg-slate-700 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-white">Add Order Items</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">Product Name</label>
                    <Input
                      type="text"
                      placeholder="e.g., Gas Stove"
                      value={newItem.productName}
                      onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-medium mb-1">Unit Price (ETB)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="bg-slate-600 border-slate-500 text-white text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {formData.items && formData.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm font-medium">Items in Order:</p>
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-600 rounded p-2 flex justify-between items-center">
                        <div className="text-sm text-slate-300">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-xs">
                            {item.quantity} × {item.unitPrice.toFixed(2)} ETB = {item.total.toFixed(2)} ETB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Payment */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Order Status</label>
                  <select
                    value={formData.status || "pending"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Payment Status</label>
                  <select
                    value={formData.paymentStatus || "unpaid"}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Total Amount (ETB)</label>
                <Input
                  type="number"
                  value={formData.totalAmount || 0}
                  disabled
                  className="bg-slate-600 border-slate-500 text-white font-bold"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Notes</label>
                <textarea
                  placeholder="Order notes..."
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-700 border-2 border-slate-600 text-white placeholder-slate-500 rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 rounded-lg"
                >
                  {editingId ? "Update Order" : "Create Order"}
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

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "pending", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`${
              filterStatus === status
                ? "bg-cyan-500 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>All customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Order #</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Items</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Payment</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-white font-semibold">{order.orderNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white">{order.customerName}</p>
                          <p className="text-slate-400 text-sm">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                      </td>
                      <td className="py-3 px-4 text-green-400 font-semibold">
                        {order.totalAmount.toFixed(2)} ETB
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${
                            order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : order.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${
                            order.paymentStatus === "unpaid"
                              ? "bg-red-500/20 text-red-400"
                              : order.paymentStatus === "partial"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="partial">Partial</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(order)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
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
