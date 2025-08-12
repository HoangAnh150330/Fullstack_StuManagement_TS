import React, { useEffect, useMemo, useState } from "react";
import {
  Input,
  Select,
  Tag,
  Space,
  Button,
  Empty,
  Skeleton,
  Modal,
  message,
} from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { isAxiosError } from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { RootState } from "../../../redux/store";

import { classAPI } from "../../../services/class_api";
import { subjectAPI } from "../../../services/subject_api";
import {
  enrollClassAPI,
  cancelEnrollAPI,
  getMyScheduleAPI,
  setAuthToken, // gắn token cho axios instance
  type ScheduleItem,
} from "../../../services/enrollment_api";

type TimeSlot = { day: string; slot: string };

type ClassItem = {
  _id: string;
  name: string;
  subject: string;
  teacher: string;
  maxStudents: number;
  timeSlots: TimeSlot[];
  enrolledCount?: number;
};

type SubjectItem = { _id: string; name: string; code: string };

const dayOptions = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

// ===== Helpers =====
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

function getErrorMessage(err: unknown, fallback = "Có lỗi xảy ra"): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// màu mè theo môn
const subjectPalette: Record<
  string,
  { ribbon: string; chip: string; chipText?: string; button: string; ring: string; border: string }
> = {
  English: {
    ribbon: "from-indigo-500 to-blue-500",
    chip: "bg-indigo-50",
    chipText: "text-indigo-700",
    button: "bg-indigo-600 hover:bg-indigo-700",
    ring: "ring-indigo-100",
    border: "from-indigo-400/60 to-blue-400/60",
  },
  Toán: {
    ribbon: "from-emerald-500 to-teal-500",
    chip: "bg-emerald-50",
    chipText: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "ring-emerald-100",
    border: "from-emerald-400/60 to-teal-400/60",
  },
  Văn: {
    ribbon: "from-rose-500 to-pink-500",
    chip: "bg-rose-50",
    chipText: "text-rose-700",
    button: "bg-rose-600 hover:bg-rose-700",
    ring: "ring-rose-100",
    border: "from-rose-400/60 to-pink-400/60",
  },
  Lý: {
    ribbon: "from-cyan-500 to-sky-500",
    chip: "bg-cyan-50",
    chipText: "text-cyan-700",
    button: "bg-cyan-600 hover:bg-cyan-700",
    ring: "ring-cyan-100",
    border: "from-cyan-400/60 to-sky-400/60",
  },
  Hóa: {
    ribbon: "from-amber-500 to-orange-500",
    chip: "bg-amber-50",
    chipText: "text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700",
    ring: "ring-amber-100",
    border: "from-amber-400/60 to-orange-400/60",
  },
};
const fallbackPalette = {
  ribbon: "from-slate-500 to-slate-700",
  chip: "bg-slate-50",
  chipText: "text-slate-700",
  button: "bg-slate-900 hover:bg-black",
  ring: "ring-slate-100",
  border: "from-slate-300/70 to-slate-400/70",
};

const StudentRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useSelector((s: RootState) => s.auth);
  const studentId = auth.user?._id;
  const [modal, contextHolder] = Modal.useModal();
  // gắn token cho axios instance khi token thay đổi
  useEffect(() => {
    setAuthToken(auth.user?.token);
  }, [auth.user?.token]);

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<Set<string>>(new Set());

  // Loading riêng cho từng nút → UX tốt hơn
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>();
  const [dayFilter, setDayFilter] = useState<string | undefined>();

  const fetchData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const [clsS, subS, schS] = await Promise.allSettled([
        classAPI.getAll(),          // không cần token
        subjectAPI.getAll(),        // không cần token
        getMyScheduleAPI(studentId) // cần token
      ]);

      const list = clsS.status === "fulfilled" ? toArray<ClassItem>(clsS.value) : [];
      const subs = subS.status === "fulfilled" ? toArray<SubjectItem>(subS.value) : [];

      // nếu lấy lịch fail (401) thì coi như chưa đăng ký lớp nào
      const mySchedule: ScheduleItem[] =
        schS.status === "fulfilled" ? toArray<ScheduleItem>(schS.value) : [];

      setClasses(list);
      setSubjects(subs);

      const enrolled = new Set<string>();
      const byId = new Set(mySchedule.map(s => s.classId).filter(Boolean) as string[]);
      list.forEach(c => {
        if (byId.has(c._id)) { enrolled.add(c._id); return; }
        const found = mySchedule.find(s => s.className === c.name && s.subject === c.subject && s.teacher === c.teacher);
        if (found) enrolled.add(c._id);
      });
      setEnrolledClassIds(enrolled);

      if (schS.status === "rejected") {
        message.warning("Không tải được lịch đã đăng ký (có thể thiếu token). Bạn vẫn có thể xem & đăng ký lớp.");
      }
    } catch {
      message.error("Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const filtered = useMemo(() => {
    // 1) chỉ lấy lớp CHƯA đăng ký
    const base = (classes || []).filter((c) => !enrolledClassIds.has(c._id));

    // 2) áp các filter còn lại
    const search = q.trim().toLowerCase();

    return base.filter((c) => {
      const passSearch =
        !search ||
        c.name.toLowerCase().includes(search) ||
        c.teacher.toLowerCase().includes(search) ||
        c.subject.toLowerCase().includes(search) ||
        c.timeSlots.some(
          (t) => t.day.toLowerCase().includes(search) || t.slot.toLowerCase().includes(search)
        );

      const passSubject = !subjectFilter || c.subject === subjectFilter;
      const passDay = !dayFilter || c.timeSlots.some((t) => t.day === dayFilter);

      return passSearch && passSubject && passDay;
    });
  }, [classes, enrolledClassIds, q, subjectFilter, dayFilter]);

  // ====== ACTIONS ======

  // Xác nhận + Đăng ký (không dùng optimistic để đỡ phải revert)
// Xác nhận + Đăng ký
const confirmEnroll = (c: ClassItem) => {
  modal.confirm({
    title: "Xác nhận đăng ký lớp?",
    content: (
      <div className="space-y-2">
        <div><b>{c.subject}</b> — {c.name}</div>
        <div>GV: <b>{c.teacher}</b></div>
        <div>
          Khung giờ:
          <Space size={[6, 6]} wrap>
            {c.timeSlots.map((t, i) => (
              <Tag key={`${c._id}-${t.day}-${t.slot}-${i}`}>{t.day} • {t.slot}</Tag>
            ))}
          </Space>
        </div>
      </div>
    ),
    okText: "Đăng ký",
    cancelText: "Hủy",
    onOk: () => doEnroll(c),
    okButtonProps: { loading: enrollingId === c._id },
    zIndex: 2000,            // 👈 phòng khi bị layer khác chèn
    centered: true,
  });
};

// Hủy đăng ký
const doCancel = async (classId: string, info: { name: string; subject: string }) => {
  modal.confirm({
    title: "Xác nhận hủy đăng ký?",
    content: `${info.subject} - ${info.name}`,
    okText: "Hủy đăng ký",
    cancelText: "Đóng",
    okButtonProps: { danger: true, loading: cancellingId === classId },
    onOk: async () => {
      setCancellingId(classId);
      try {
        await cancelEnrollAPI(classId);
        setEnrolledClassIds((prev) => {
          const next = new Set(prev);
          next.delete(classId);
          return next;
        });
        message.success("Đã hủy đăng ký");
      } catch (err) {
        message.error(getErrorMessage(err, "Hủy thất bại"));
      } finally {
        setCancellingId(null);
      }
    },
    zIndex: 2000,
    centered: true,
  });
};


  const doEnroll = async (c: ClassItem) => {
    setEnrollingId(c._id);
    try {
      await enrollClassAPI(c._id);
      setEnrolledClassIds((prev) => new Set(prev).add(c._id));
      toast.success(`Đăng ký thành công: ${c.subject} - ${c.name}`, { icon: "✅" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Đăng ký thất bại"));
    } finally {
      setEnrollingId(null);
    }
  };


  const Card: React.FC<{ c: ClassItem; enrolled: boolean }> = ({ c, enrolled }) => {
    const pal = subjectPalette[c.subject] ?? fallbackPalette;
    const isLoading = enrollingId === c._id || cancellingId === c._id;
    const percent =
      typeof c.enrolledCount === "number" && c.maxStudents > 0
        ? Math.min(100, Math.round((c.enrolledCount / c.maxStudents) * 100))
        : null;

    return (
      <div className="group">
        {contextHolder}
        <div className={`p-[1px] rounded-2xl bg-gradient-to-br ${pal.border}`}>
          <div
            className={`relative overflow-hidden rounded-2xl bg-white border border-white shadow-sm group-hover:shadow-2xl group-hover:-translate-y-0.5 transition-all duration-300 ring-1 ${pal.ring}`}
          >
            <div
              className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${pal.ribbon} opacity-15 blur-2xl`}
            />
            <div
              className={`pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br ${pal.ribbon} opacity-10 blur-2xl`}
            />

            {/* Badge góc khi đã đăng ký */}
            {enrolled && (
              <div className="absolute left-0 top-0">
                <div className="rounded-br-2xl rounded-tl-2xl bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1 flex items-center gap-1">
                  <CheckCircleFilled /> Đã đăng ký
                </div>
              </div>
            )}

            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="pr-3">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {c.name}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${pal.chip} ${pal.chipText ?? ""}`}
                    >
                      {c.subject}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    GV: <span className="font-semibold text-slate-800">{c.teacher}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Sĩ số tối đa</div>
                  <div className="text-lg font-bold text-slate-900">{c.maxStudents}</div>
                </div>
              </div>

              <div className="mt-1">
                <Space size={[8, 8]} wrap>
                  {c.timeSlots.map((t, i) => (
                    <Tag
                      key={`${c._id}-${t.day}-${t.slot}-${i}`}
                      className="px-2 py-1 rounded-full border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {t.day} • {t.slot}
                    </Tag>
                  ))}
                </Space>
              </div>

              {percent !== null && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Sĩ số</span>
                    <span className="font-semibold text-slate-800">
                      {c.enrolledCount}/{c.maxStudents}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${pal.ribbon}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span />
                {enrolled ? (
                  <Button
                    danger
                    loading={isLoading}
                    className="rounded-xl px-4 py-2"
                    onClick={() => doCancel(c._id, { name: c.name, subject: c.subject })}
                  >
                    Hủy đăng ký
                  </Button>
                ) : (
                  <Button
                    loading={isLoading}
                    className={`rounded-xl px-4 py-2 text-white ${pal.button}`}
                    onClick={() => confirmEnroll(c)}
                  >
                    Đăng ký
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Top bar */}
      <div className="px-6 sm:px-10 lg:px-16 py-6 sticky top-0 z-10 bg-white/80 backdrop-blur border-b shadow-[0_2px_12px_-6px_rgba(0,0,0,0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate(-1)} className="rounded-xl px-3">
                  ← Trở về
                </Button>
                <h2 className="m-0 text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Đăng ký lớp học
                  </span>
                </h2>
              </div>
              <p className="text-slate-600 mt-1 ml-[72px] lg:ml-0">
                Chọn lớp phù hợp và đăng ký ngay.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="rounded-xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 transition">
                <Input.Search
                  allowClear
                  placeholder="Tìm lớp, môn, GV, khung giờ..."
                  onSearch={setQ}
                  onChange={(e) => setQ(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-violet-400 transition">
                <Select
                  allowClear
                  placeholder="Lọc theo Môn"
                  value={subjectFilter}
                  onChange={setSubjectFilter}
                  options={subjects.map((s) => ({ value: s.name, label: s.name }))}
                  className="w-full rounded-xl [&_.ant-select-selector]:rounded-xl"
                  popupMatchSelectWidth={false}
                />
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-emerald-400 transition">
                <Select
                  allowClear
                  placeholder="Lọc theo Thứ"
                  value={dayFilter}
                  onChange={setDayFilter}
                  options={dayOptions.map((d) => ({ value: d, label: d }))}
                  className="w-full rounded-xl [&_.ant-select-selector]:rounded-xl"
                  popupMatchSelectWidth={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-10 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <Empty description="Không có lớp nào phù hợp" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((c) => (
                <Card key={c._id} c={c} enrolled={enrolledClassIds.has(c._id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationPage;
