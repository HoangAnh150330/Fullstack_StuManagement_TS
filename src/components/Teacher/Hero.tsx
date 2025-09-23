import React, { type CSSProperties } from "react";
import { Avatar, Card, Statistic } from "antd";
import { BookOutlined, TeamOutlined } from "@ant-design/icons";

type Props = {
  teacherName: string;
  totalClasses: number;
  totalStudents: number;
  todaySummary: string;
  loading?: boolean;
};

// ✅ style tách riêng, có kiểu rõ ràng
const heroBodyStyle: CSSProperties = {
  background: "linear-gradient(135deg,#0ea5e9,#6366f1 60%,#8b5cf6)",
};

const frostedBodyStyle: CSSProperties = {
  background: "rgba(255,255,255,.15)",
};

export default function Hero({
  teacherName,
  totalClasses,
  totalStudents,
  todaySummary,
  loading,
}: Props) {
  return (
    <Card
      className="overflow-hidden rounded-2xl shadow-xl"
      bodyStyle={{ padding: 24 }}
      loading={loading}
      // ✅ không dùng any
      styles={{ body: heroBodyStyle }}
    >
      <div className="flex flex-col gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size={64} src="https://i.pravatar.cc/120?img=5" />
          <div>
            <div className="text-2xl font-semibold">Xin chào, {teacherName}</div>
            <div className="text-white/80">{todaySummary}</div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <Card bordered={false} styles={{ body: frostedBodyStyle }}>
            <Statistic
              title={<span className="text-white/90">Lớp đang dạy</span>}
              value={totalClasses}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>

          <Card bordered={false} styles={{ body: frostedBodyStyle }}>
            <Statistic
              title={<span className="text-white/90">Học viên</span>}
              value={totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </div>
      </div>
    </Card>
  );
}
