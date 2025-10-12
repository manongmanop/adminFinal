import React, { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./layouts/Sidebar.jsx";
import Topbar from "./layouts/Topbar.jsx";
import Overview from "./pages/Overview.jsx";
import Programs from "./pages/Programs.jsx";
import Exercises from "./pages/Exercises.jsx";
import Feedback from "./pages/Feedback.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const cls = "is-sidebar-open";
    if (sidebarOpen) {
      document.body.classList.add(cls);
    } else {
      document.body.classList.remove(cls);
    }
    return () => document.body.classList.remove(cls);
  }, [sidebarOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case "programs":
        return <Programs />;
      case "exercises":
        return <Exercises />;
      case "feedback":
        return <Feedback />;
      case "overview":
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app">
      <aside className="app-sidebar">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          active={activeTab}
          setActive={setActiveTab}
        />
      </aside>
      <header className="app-topbar">
        <Topbar setSidebarOpen={setSidebarOpen} />
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}
