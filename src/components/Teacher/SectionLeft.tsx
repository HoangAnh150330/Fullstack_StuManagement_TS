import React, { type CSSProperties } from "react";
import { Card, List, Tag, Badge, Button } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import type { UpcomingClass, StudentMessage } from "../../types/teacher";

function KPICard({
  gradient,
  icon,
  label,
  value,
  sub,
}: {
  gradient: string;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  // ✅ Dùng CSSProperties thay vì any
  const bodyStyle: CSSProperties = { background: gradient };

  return (
    <Card
      bordered={false}
      className="rounded-2xl text-white shadow-lg"
      styles={{ body: bodyStyle }}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
          {icon}
        </div>
        <div className="text-white/90">{label}</div>
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="text-sm text-white/85">{sub}</div>
    </Card>
  );
}

export default function SectionLeft({
  gradingCount,
  weekSessions,
  newMessages,
  upcoming,
  messages,
  loading,
  onAttendance,
  onGrade,
  onReply,
}: {
  gradingCount: number;
  weekSessions: number;
  newMessages: number;
  upcoming: UpcomingClass[] | undefined;
  messages: StudentMessage[] | undefined;
  loading?: boolean;
  onAttendance: (id: string) => void;
  onGrade: (id: string) => void;
  onReply: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          gradient="linear-gradient(135deg,#2563eb,#4f46e5)"
          icon={<BarChartOutlined style={{ color: "#fff", fontSize: 20 }} />}
          label="Buổi cần chấm"
          value={gradingCount}
          sub="Tổng cần xử lý"
        />
        <KPICard
          gradient="linear-gradient(135deg,#10b981,#059669)"
          icon={<CalendarOutlined style={{ color: "#fff", fontSize: 20 }} />}
          label="Lịch dạy tuần này"
          value={weekSessions}
          sub="Bao gồm học bù"
        />
        <KPICard
          gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)"
          icon={<MessageOutlined style={{ color: "#fff", fontSize: 20 }} />}
          label="Tin nhắn mới"
          value={newMessages}
          sub="Chờ phản hồi"
        />
      </div>

      {/* Upcoming classes */}
      <Card
        className="rounded-2xl"
        title="Lớp sắp dạy hôm nay"
        loading={loading}
      >
        <List
          dataSource={upcoming || []}
          renderItem={(c) => (
            <List.Item
              actions={[
                <Button
                  key="a"
                  type="link"
                  icon={<CalendarOutlined />}
                  onClick={() => onAttendance(c.id)}
                >
                  Điểm danh
                </Button>,
                <Button
                  key="g"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => onGrade(c.id)}
                >
                  Nhập điểm
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.subject}</span>
                    <Tag color="blue">{c.className}</Tag>
                    {c.status === "live" && (
                      <Badge status="processing" text="Đang diễn ra" />
                    )}
                    {c.status === "soon" && (
                      <Badge status="warning" text="Sắp bắt đầu" />
                    )}
                  </div>
                }
                description={`${c.time} • Phòng ${c.room}`}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Messages */}
      <Card
        className="rounded-2xl"
        title="Tin nhắn từ học viên"
        loading={loading}
      >
        <List
          dataSource={messages || []}
          renderItem={(m) => (
            <List.Item
              actions={[
                <Button
                  key="r"
                  type="link"
                  onClick={() => onReply(m.id)}
                >
                  Trả lời
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {m.student.split(" ").pop()?.[0]}
                  </div>
                }
                title={
                  <span className="font-medium">
                    {m.student} <Tag>{m.className}</Tag>
                  </span>
                }
                description={
                  <>
                    {m.content} —{" "}
                    <span className="text-slate-400">{m.time}</span>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
