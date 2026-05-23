import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  Home,
  Users,
  BarChart3,
  DollarSign,
  Users2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "🏠 Dashboard", icon: Home },
    { id: "products", label: "📦 Products", icon: ShoppingCart },
    { id: "sales", label: "📅 Daily Sales", icon: Calendar },
    { id: "orders", label: "📋 Orders", icon: ShoppingCart },
    { id: "users", label: "👥 Users", icon: Users },
    { id: "finance", label: "💰 Finance", icon: DollarSign },
    { id: "analytics", label: "📊 Analytics", icon: BarChart3 },
    { id: "hr", label: "🧑 HR", icon: Users2 },
    { id: "logs", label: "📜 Logs", icon: FileText },
    { id: "settings", label: "⚙️ Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 z-40 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-cyan-400">Eyob Store</h1>
          <p className="text-slate-400 text-sm">Admin Panel</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          <p className="text-slate-400 text-xs">Logged in as</p>
          <p className="text-white font-semibold truncate">{user?.displayName}</p>
          <p className="text-slate-500 text-xs truncate">{user?.email}</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                activeTab === item.id
                  ? "bg-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
