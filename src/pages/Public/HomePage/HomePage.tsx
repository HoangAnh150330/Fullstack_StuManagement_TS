import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import HeaderBar from "../../../components/Home/Headerbar";
import img1 from "../../../assets/bg1.jpg";
import { announceAPI } from "../../../services/annoucement_api";
import type { Announcement } from "../../../types/announcement";
import  { AxiosError } from "axios";
// ✅ Mini Card component
function QuickActionCard({
  title,
  desc,
  to,
  onClick,
  icon,
}: {
  title: string;
  desc: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  const content = (
    <div
      className="group h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 text-2xl" aria-hidden>
          {icon ?? "📌"}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-800 group-hover:text-blue-700">
            {title}
          </div>
          <div className="text-sm text-slate-500 mt-1">{desc}</div>
        </div>
      </div>
    </div>
  );
  return to ? (
    <Link to={to} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

// ✅ Mini info row
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

const HomePage: React.FC = () => {
  const [entered, setEntered] = useState(false);
  const navigate = useNavigate();

  // Mock: data student
  const [nextClass, setNextClass] = useState<
    | { subject: string; room: string; time: string; teacher: string }
    | null
  >(null);
  const [unreadNoti, setUnreadNoti] = useState<number>(0);
  const [tuitionDebt, setTuitionDebt] = useState<number>(0);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setNextClass({
        subject: "Toán rời rạc",
        room: "P.203",
        time: "Thứ 3, 09:00 - 11:00",
        teacher: "Cô Huỳnh Hoa",
      });
      setUnreadNoti(3);
      setTuitionDebt(1200000);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const money = useMemo(
    () =>
      tuitionDebt.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }),
    [tuitionDebt]
  );

  // 🔔 Mở modal thông báo
  const handleOpenNoti = async () => {
    setOpenModal(true);
    setLoading(true);
    try {
      console.log("Starting API call for announcements...");
      const res = await announceAPI.getForStudent();
      console.log("📢 API response:", res);

      if (res.success && Array.isArray(res.data)) {
        const updatedAnnouncements = res.data.map((a) => ({
          ...a,
          classId: a.classId.name, // Trích xuất name từ object classId
        }));
        setAnnouncements(updatedAnnouncements);
      } else {
        console.warn("Unexpected response format or no data:", res);
        setAnnouncements([]);
      }
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;

        console.error("Error fetching announcements:", error);

        if (error.response) {
          console.error("Server response:", error.response.status, error.response.data);
          message.error(`Lỗi: ${error.response.data?.message || "Không thể tải thông báo"}`);
        } else if (error.request) {
          console.error("No response received:", error.request);
          message.error("Không kết nối được với server");
        } else {
          console.error("Request setup error:", error.message);
          message.error("Lỗi hệ thống");
        }

          setAnnouncements([]);
        } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <HeaderBar />

      {/* Hero */}
      <div
        className={[
          "px-6 sm:px-10 lg:px-16 py-10",
          "transition-all duration-700 ease-out",
          entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        ].join(" ")}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-snug">
              Chào mừng bạn đến với hệ thống quản lý học sinh
            </h1>
            <p className="mt-3 text-slate-600">
              Truy cập nhanh thời khoá biểu, điểm số, thông báo và học phí của
              bạn. Tất cả ở một nơi.
            </p>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionCard
                title="Hồ sơ cá nhân"
                desc="Xem & cập nhật thông tin, đổi mật khẩu"
                to="/profile"
                icon={<span>👤</span>}
              />
              <QuickActionCard
                title="Lịch học"
                desc="Xem thời khoá biểu theo tuần/tháng"
                to="/student/schedule"
                icon={<span>📅</span>}
              />
              <QuickActionCard
                title="Đăng ký lớp"
                desc="Chọn/hủy lớp theo học kỳ"
                to="/student/registration"
                icon={<span>📚</span>}
              />
              <QuickActionCard
                title="Hủy lớp đã đăng ký"
                desc="Xem & hủy các lớp đã đăng ký"
                to="/student/enrolled"
                icon={<span>🗑️</span>}
              />
              <QuickActionCard
                title="Điểm số"
                desc="Điểm chuyên cần, giữa kỳ, cuối kỳ"
                to="/student/grades"
                icon={<span>📊</span>}
              />
              <QuickActionCard
                title="Học phí"
                desc="Công nợ & thanh toán trực tuyến"
                to="/student/tuition"
                icon={<span>💳</span>}
              />
            </div>
          </div>
          {/* Image */}
          <img
            src={img1}
            alt="Welcome"
            className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl"
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="px-6 sm:px-10 lg:px-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next class */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⏭️</span>
              <h2 className="font-semibold text-slate-800">Buổi học kế tiếp</h2>
            </div>
            {nextClass ? (
              <div className="space-y-1 text-sm">
                <div className="text-slate-900 font-medium">
                  {nextClass.subject}
                </div>
                <div className="text-slate-600">{nextClass.teacher}</div>
                <InfoRow label="Thời gian" value={nextClass.time} />
                <InfoRow label="Phòng" value={nextClass.room} />
                <button
                  className="mt-3 w-full rounded-xl bg-blue-600 text-white py-2 font-medium hover:bg-blue-700"
                  onClick={() => navigate("/student/schedule")}
                >
                  Xem thời khoá biểu
                </button>
              </div>
            ) : (
              <div className="h-24 animate-pulse bg-slate-100 rounded-xl" />
            )}
          </div>

          {/* Notifications */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🔔</span>
              <h2 className="font-semibold text-slate-800">Thông báo</h2>
            </div>
            <div className="text-sm text-slate-600">
              Bạn có{" "}
              <span className="font-semibold text-slate-900">{unreadNoti}</span>{" "}
              thông báo chưa đọc.
            </div>
            <button
              className="mt-3 w-full rounded-xl bg-slate-900 text-white py-2 font-medium hover:bg-slate-800"
              onClick={handleOpenNoti}
            >
              Xem thông báo
            </button>
          </div>

          {/* Tuition */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💰</span>
              <h2 className="font-semibold text-slate-800">Học phí</h2>
            </div>
            <div className="text-sm text-slate-600">
              Công nợ hiện tại:{" "}
              <span className="font-semibold text-rose-600">{money}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className="rounded-xl bg-green-600 text-white py-2 font-medium hover:bg-green-700"
                onClick={() => navigate("/student/tuition")}
              >
                Thanh toán
              </button>
              <button
                className="rounded-xl bg-slate-100 text-slate-800 py-2 font-medium hover:bg-slate-200 border"
                onClick={() => navigate("/student/tuition/history")}
              >
                Lịch sử
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔔 Modal xem thông báo */}
      <Modal
        title="📢 Thông báo cho học viên"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
        centered
      >
        {loading ? (
          <div>Đang tải...</div>
        ) : announcements.length === 0 ? (
          <div className="text-slate-500 text-center py-6">
            Chưa có thông báo nào.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-800">{a.title}</div>
                <div className="text-sm text-slate-600">
                  Lớp: {typeof a.classId === "object" ? a.classId.name : a.classId || "Không xác định"}
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  {new Date(a.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
