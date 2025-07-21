import React from 'react';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard tổng quan</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card card-blue">
          <div className="card-title">Tổng số học viên</div>
          <div className="card-value">120</div>
        </div>
        <div className="dashboard-card card-green">
          <div className="card-title">Số lớp học</div>
          <div className="card-value">8</div>
        </div>
        <div className="dashboard-card card-purple">
          <div className="card-title">Môn học</div>
          <div className="card-value">15</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Thống kê gần đây</h2>
        <div className="section-content">
          <p>🎯 Bạn đã thêm 4 học viên trong tuần này.</p>
          <p>📅 Có 2 lớp mới được tạo hôm qua.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
