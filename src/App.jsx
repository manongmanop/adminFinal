import React, { useState } from "react";
import Sidebar from "./layouts/Sidebar.jsx";
import Topbar from "./layouts/Topbar.jsx";
import Overview from "./pages/Overview.jsx";
import Programs from "./pages/Programs.jsx";
import Exercises from "./pages/Exercises.jsx";
import Settings from "./pages/Settings.jsx";
import Feedback from "./pages/Feedback.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "programs":
        return <Programs />;
      case "exercises":
        return <Exercises />;
      case "feedback":
        return <Feedback />;
      case "settings":
        return <Settings />;
      case "overview":
      default:
        return <Overview />;
    }
  };

  return (
    <div className="w-screen min-h-dvh bg-gray-900 text-gray-100">
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[20rem_1fr]">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          active={activeTab}
          setActive={setActiveTab}
        />
        <div className="min-w-0 flex flex-col">
          <Topbar setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 w-full max-w-none px-4 py-6 md:px-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
