import React, { useState, useEffect } from "react";
import Sidebar from "./layouts/Sidebar.jsx";
import Topbar from "./layouts/Topbar.jsx";
import Overview from "./pages/Overview.jsx";
import Programs from "./pages/Programs.jsx";
import Exercises from "./pages/Exercises.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";
import AdminLogin from "./pages/Login.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("adminToken");
      const userData = localStorage.getItem("adminUser");
      const rememberMe = localStorage.getItem("rememberMe") === "true";

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Check if token is expired (demo: 24 hours for remember me, 8 hours otherwise)
          const tokenExpiry = localStorage.getItem("tokenExpiry");
          const now = new Date().getTime();
          
          if (tokenExpiry && now < parseInt(tokenExpiry)) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token expired
            handleLogout(false);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          handleLogout(false);
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (credentials, rememberMe = false) => {
    // Demo authentication
    if (credentials.username === "admin" && credentials.password === "admin123") {
      const userData = {
        id: "admin",
        username: "admin",
        email: "admin@fitnesspro.com",
        role: "administrator",
        name: "System Administrator",
        avatar: null,
        loginTime: new Date().toISOString()
      };

      const token = `demo-token-${Date.now()}`;
      const expiryTime = new Date().getTime() + (rememberMe ? 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000);

      // Store in localStorage
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(userData));
      localStorage.setItem("tokenExpiry", expiryTime.toString());
      localStorage.setItem("rememberMe", rememberMe.toString());

      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, message: "เข้าสู่ระบบสำเร็จ" };
    } else {
      return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
  };

  const handleLogout = (showConfirm = true) => {
    if (showConfirm) {
      const confirmLogout = window.confirm("คุณต้องการออกจากระบบหรือไม่?");
      if (!confirmLogout) return;
    }

    // Clear localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("rememberMe");

    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab("overview");
    setSidebarOpen(false);

    // Show logout message (optional)
    if (showConfirm) {
      setTimeout(() => {
        alert("ออกจากระบบเรียบร้อยแล้ว");
      }, 100);
    }
  };

  const handleSessionExpired = () => {
    alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
    handleLogout(false);
  };

  // Auto logout on window close/refresh (optional)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem("rememberMe") === "true";
      if (!rememberMe && isAuthenticated) {
        // Clear session if not "remember me"
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("tokenExpiry");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAuthenticated]);

  const renderContent = () => {
    switch (activeTab) {
      case "programs": return <Programs />;
      case "exercises": return <Exercises />;
      case "users": return <Users />;
      case "settings": return <Settings />;
      case "overview":
      default: return <Overview />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="w-screen min-h-dvh bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner"></div>
          <p className="text-gray-400">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        </div>
        <style jsx>{`
          .loading-spinner {
            width: 2rem;
            height: 2rem;
            border: 2px solid transparent;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onLogin={handleLogin}
        onSessionExpired={handleSessionExpired}
      />
    );
  }

  // Show main dashboard if authenticated
  return (
    <div className="w-screen min-h-dvh bg-gray-900 text-gray-100">
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[20rem_1fr]">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          active={activeTab}
          setActive={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
        <div className="min-w-0 flex flex-col">
          <Topbar 
            setSidebarOpen={setSidebarOpen}
            user={user}
            onLogout={handleLogout}
          />
          <main className="flex-1 w-full max-w-none px-4 py-6 md:px-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}