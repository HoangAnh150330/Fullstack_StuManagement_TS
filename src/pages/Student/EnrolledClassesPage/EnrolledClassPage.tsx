import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Popconfirm, Tag, message, Empty } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { getMyScheduleAPI, cancelEnrollAPI } from "../../../services/enrollment_api";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

type TimeSlot = { day: string; slot: string; start?: string; end?: string };

// Dữ liệu từ API (có thể thiếu field)
type ScheduleItemFromAPI = {
  classId?: string;
  className?: string;
  subject?: string;
  teacher?: string;
  timeSlots?: TimeSlot[];
};

// Dữ liệu chuẩn cho UI
type Item = {
  classId: string;
  className: string;
  subject: string;
  teacher: string;
  timeSlots: TimeSlot[];
};

// Row mở rộng (phục vụ hiển thị)
type Row = Item & {
  fs: moment.Moment | null;
  cutoff: moment.Moment | null;
  canCancel: boolean;
};

const dayMap: Record<string, number> = {
  "Chủ nhật": 0, "Thứ 2": 1, "Thứ 3": 2, "Thứ 4": 3, "Thứ 5": 4, "Thứ 6": 5, "Thứ 7": 6,
};
const parseSlot = (slot: string) => {
  const [a] = slot.split("-");
  const [h, m] = a.split(":").map(Number);
  return { h, m };
};

function firstSession(ts: TimeSlot[]): moment.Moment | null {
  const candidates: moment.Moment[] = [];
  ts.forEach((t) => {
    if (!t.day || !t.slot) return;
    const dow = dayMap[t.day];
    if (dow === undefined) return;
    const { h, m } = parseSlot(t.slot);
    if (t.start) {
      let d = moment(t.start).day(dow).hour(h).minute(m).second(0);
      if (d.isBefore(moment(t.start))) d = d.add(7, "days");
      candidates.push(d);
    } else {
      let d = moment().startOf("week").day(dow).hour(h).minute(m).second(0);
      if (d.isBefore(moment())) d = d.add(7, "days");
      candidates.push(d);
    }
  });
  if (!candidates.length) return null;
  return candidates.sort((a, b) => a.valueOf() - b.valueOf())[0];
}

export default function EnrolledClassesPage() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const studentId = user?._id;

  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const cutoffHours = 24;

  const fetchData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const raw: ScheduleItemFromAPI[] = await getMyScheduleAPI(studentId);
      const normalized: Item[] = (raw ?? [])
        .filter((x) => !!x.classId)
        .map((x) => ({
          classId: x.classId!,
          className: x.className ?? "",
          subject: x.subject ?? "",
          teacher: x.teacher ?? "",
          timeSlots: x.timeSlots ?? [],
        }));
      setRows(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [studentId]);

  const data: Row[] = useMemo(
    () =>
      rows.map((r) => {
        const fs = firstSession(r.timeSlots);
        const cutoff = fs ? fs.clone().subtract(cutoffHours, "hours") : null;
        const canCancel = cutoff ? moment().isBefore(cutoff) : true;
        return { ...r, fs, cutoff, canCancel };
      }),
    [rows]
  );

  const handleCancel = async (classId: string) => {
    try {
      await cancelEnrollAPI(classId);
      message.success("Đã hủy đăng ký");
      void fetchData();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg =
        axiosErr.response?.data?.message ||
        (axiosErr as Error).message ||
        "Không hủy được";
      message.error(msg);
    }
  };

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/")}
              icon={<ArrowLeftOutlined />}
              className="rounded-xl"
            >
              Trở về
            </Button>
            <h2 className="text-2xl font-bold text-slate-900 m-0">Lớp đã đăng ký</h2>
          </div>
          <Button onClick={() => void fetchData()} icon={<ReloadOutlined />} className="rounded-xl">
            Tải lại
          </Button>
        </div>

        {/* Card container */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
          <Table<Row>
            rowKey="classId"
            loading={loading}
            dataSource={data}
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
            locale={{
              emptyText: (
                <Empty
                  description="Bạn chưa đăng ký lớp nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            columns={[
              { title: "Môn học", dataIndex: "subject", ellipsis: true },
              { title: "Lớp", dataIndex: "className", ellipsis: true },
              { title: "Giảng viên", dataIndex: "teacher", ellipsis: true },
              {
                title: "Lịch học",
                render: (_: unknown, r: Row) => (
                  <div className="leading-5 text-slate-700">
                    {r.timeSlots.map((t, i) => (
                      <div key={i}>
                        <span className="font-medium">{t.day}</span> • {t.slot}
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: "Buổi đầu",
                width: 210,
                render: (_: unknown, r: Row) =>
                  r.fs ? (
                    <Tag color="blue" className="px-2 py-1 rounded-lg">
                      {r.fs.format("ddd, DD/MM/YYYY HH:mm")}
                    </Tag>
                  ) : (
                    <Tag className="px-2 py-1 rounded-lg">—</Tag>
                  ),
              },
              {
                title: "Hành động",
                fixed: "right",
                width: 120,
                render: (_: unknown, r: Row) => {
                  if (!r.canCancel) return null; // ❌ Ẩn nút khi quá hạn
                  return (
                    <Popconfirm
                      title="Hủy đăng ký?"
                      description="Bạn có chắc muốn hủy lớp này?"
                      onConfirm={() => handleCancel(r.classId)}
                      okText="Hủy"
                      cancelText="Không"
                    >
                      <Button danger ghost className="rounded-xl">
                        Hủy
                      </Button>
                    </Popconfirm>
                  );
                },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
