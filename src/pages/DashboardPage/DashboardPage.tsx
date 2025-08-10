import React from "react";

const DashboardPage: React.FC = () => {
  return (
    <div className="w-full max-w-full p-6 box-border">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard tổng quan</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="rounded-xl text-white shadow-lg p-5 bg-blue-600 transition-transform duration-200 hover:-translate-y-1.5">
          <div className="text-sm mb-2 opacity-85">Tổng số học viên</div>
          <div className="text-3xl font-bold">120</div>
        </div>

        <div className="rounded-xl text-white shadow-lg p-5 bg-green-600 transition-transform duration-200 hover:-translate-y-1.5">
          <div className="text-sm mb-2 opacity-85">Số lớp học</div>
          <div className="text-3xl font-bold">8</div>
        </div>

        <div className="rounded-xl text-white shadow-lg p-5 bg-purple-600 transition-transform duration-200 hover:-translate-y-1.5">
          <div className="text-sm mb-2 opacity-85">Môn học</div>
          <div className="text-3xl font-bold">15</div>
        </div>
      </div>

      {/* Section */}
      <div className="mt-10">
        <h2 className="text-xl mb-4">Thống kê gần đây</h2>
        <div className="space-y-1.5 leading-relaxed">
          <p>🎯 Bạn đã thêm 4 học viên trong tuần này.</p>
          <p>📅 Có 2 lớp mới được tạo hôm qua.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
