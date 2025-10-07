import React from "react";
import { Menu, Search, LogOut } from "lucide-react";
import { Input, Button } from "../components/ui.jsx";

export default function Topbar({ setSidebarOpen }) {
return (
    <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-xl px-6 py-4">
      <button className="text-gray-400 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>
      
      <div className="relative ml-auto w-full max-w-lg">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <Input placeholder="ค้นหาข้อมูล..." className="pl-10" />
      </div>
      
      <Button variant="ghost" size="sm">
        <LogOut size={16} />
        ออกจากระบบ
      </Button>
    </div>
  );
}
