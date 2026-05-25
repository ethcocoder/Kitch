import React, { useEffect, useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Users, DollarSign, Calendar, X, UserCheck, UserMinus } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  status: "active" | "inactive";
  joinedDate: string;
  phone?: string;
  department?: string;
}

export function HRManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    role: "staff",
    salary: 0,
    status: "active",
    joinedDate: new Date().toISOString().split("T")[0],
    phone: "",
    department: "General",
  });

  useEffect(() => {
    setLoading(true);
    const employeesRef = collection(db, "employees");
    
    const unsubscribe = onSnapshot(employeesRef, (snapshot) => {
      const employeesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Employee[];
      setEmployees(employeesList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill in name, email, and role");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "employees", editingId), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success("Employee updated successfully");
      } else {
        await addDoc(collection(db, "employees"), {
          ...formData,
          createdAt: new Date(),
        });
        toast.success("Employee added successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("Failed to save employee");
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData(employee);
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await deleteDoc(doc(db, "employees", id));
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const toggleStatus = async (employee: Employee) => {
    try {
      const newStatus = employee.status === "active" ? "inactive" : "active";
      await updateDoc(doc(db, "employees", employee.id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      toast.success(`Employee marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "staff",
      salary: 0,
      status: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      phone: "",
      department: "General",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    totalPayroll: employees.reduce((sum, e) => sum + (e.status === "active" ? Number(e.salary || 0) : 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-400">HR Management</h2>
          <p className="text-slate-400 text-sm md:text-base">Manage employees, roles, and payroll</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Employee"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Employees</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-cyan-400/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Staff</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <UserCheck className="w-10 h-10 text-green-400/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Monthly Payroll</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.totalPayroll.toLocaleString()} ETB</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-400/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Role *</label>
                  <Input
                    type="text"
                    placeholder="e.g. Manager, Chef, Waiter"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-700 border-2 border-slate-600 text-white rounded-lg py-2 px-4 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service">Service</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Monthly Salary (ETB)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Joined Date</label>
                  <Input
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold">
                  {editingId ? "Update Employee" : "Add Employee"}
                </Button>
                <Button type="button" onClick={resetForm} className="flex-1 bg-slate-700 text-white">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Employees Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-cyan-400">Employee List</CardTitle>
          <CardDescription>View and manage all staff members</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-slate-900/50">
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden sm:table-cell">Role</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold hidden md:table-cell">Salary</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No employees found. Add your first staff member!
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{employee.name}</span>
                          <span className="text-slate-400 text-[10px] md:text-xs">{employee.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-slate-300">{employee.role}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-green-400 font-bold">{Number(employee.salary || 0).toLocaleString()} ETB</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus(employee)}
                          className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold transition-colors ${
                            employee.status === "active"
                              ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                        >
                          {employee.status.toUpperCase()}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-1.5 md:p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            <Edit2 className="w-3 h-3 md:w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="p-1.5 md:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 h-4" />
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
