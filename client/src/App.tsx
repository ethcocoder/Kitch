import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AdminDashboardNew } from "./pages/AdminDashboardNew";
import { AdminDashboardComplete } from "./pages/AdminDashboardComplete";
import { UserDashboardNew } from "./pages/UserDashboardNew";
import { ApprovalWaiting } from "./pages/ApprovalWaiting";
import { AdminPromotion } from "./pages/AdminPromotion";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./_core/hooks/useAuth";

function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <NotFound />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/approval-waiting"} component={ApprovalWaiting} />
      <Route path={"/admin-promotion"} component={AdminPromotion} />
      <Route path={"/admin-dashboard"} component={AdminDashboardComplete} />
      <Route path={"/user-dashboard"} component={UserDashboardNew} />
      <Route path={"/dashboard"} component={() => <ProtectedRoute><UserDashboardNew /></ProtectedRoute>} />
      <Route path={"/admin"} component={() => <ProtectedAdminRoute component={AdminDashboard} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
