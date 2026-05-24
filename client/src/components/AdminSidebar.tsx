import React, { useState, useEffect } from "react";
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
  ChefHat,
} from "lucide-react";
import { toast } from "sonner";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle responsive sidebar initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: ShoppingCart },
    { id: "sales", label: "Daily Sales", icon: Calendar },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "users", label: "Users", icon: Users },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "hr", label: "HR Management", icon: Users2 },
    { id: "logs", label: "System Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-bold text-cyan-400">Kitch Admin</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-cyan-400 p-2 hover:bg-slate-800 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-[55] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="mb-10 hidden lg:block">
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-cyan-400">Kitch</h1>
            </div>
            <p className="text-slate-400 text-sm">Admin Dashboard</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-white" : "text-cyan-400/70"}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="pt-6 border-t border-slate-800 mt-6">
            <div className="mb-4 px-2">
              <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Administrator</p>
              <p className="text-white font-semibold truncate text-sm">{user?.displayName || user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full flex gap-2 justify-center items-center py-2.5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
