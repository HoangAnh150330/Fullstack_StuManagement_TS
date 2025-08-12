import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  [
    "block w-full text-left rounded-xl border px-4 py-3 transition",
    isActive
      ? "bg-blue-600 text-white border-blue-600 shadow-md"
      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
  ].join(" ");

export default function ProfileLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-violet-100 p-5">
      <div className="mx-auto max-w-6xl flex gap-8 flex-wrap">
        {/* Left menu */}
        <div className="w-64 space-y-3">
          <NavLink to="/profile" end className={linkCls}>
            <span className="mr-2">👤</span> Thông tin cá nhân
          </NavLink>
          <NavLink to="/profile/change-password" className={linkCls}>
            <span className="mr-2">🔒</span> Đổi mật khẩu
          </NavLink>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-[320px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}