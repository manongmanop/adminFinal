import React from "react";
import { Menu, Search } from "lucide-react";
import { Input } from "../components/ui.jsx";

export default function Topbar({ setSidebarOpen }) {
  return (
    <div className="sticky top-0 z-30 flex flex-col gap-4 border-b border-gray-700 bg-gray-900/80 backdrop-blur-xl px-6 py-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-400">Fitness Admin</p>
          <h1 className="text-lg font-semibold text-white">ระบบจัดการโปรแกรมออกกำลังกาย</h1>
        </div>
      </div>

      <div className="relative ml-auto w-full max-w-lg">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <Input placeholder="ค้นหาข้อมูลในแดชบอร์ด..." className="pl-10" />
      </div>
    </div>
  );
}
