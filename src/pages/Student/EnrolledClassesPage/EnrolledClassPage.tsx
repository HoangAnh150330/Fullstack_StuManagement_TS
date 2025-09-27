import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Popconfirm, Tag, message, Empty } from "antd";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { getMyScheduleAPI, cancelEnrollAPI } from "../../../services/enrollment_api";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import type { ScheduleItemDTO, ScheduleItem } from "../../../types/schedule";

// Row mở rộng (cho UI)
type Row = ScheduleItem & {
  fs: moment.Moment | null;
  cutoff: moment.Moment | null;
  canCancel: boolean;
};

// Map dữ liệu từ API → FE chuẩn
const mapDTOtoItem = (dto: ScheduleItemDTO, index: number): ScheduleItem => ({
  classId: dto._id || dto.classId || dto.className || `temp-${index}`, // Ưu tiên _id, sau đó classId, className
  className: dto.className ?? "",
  subject: dto.subject ?? "",
  teacher: dto.teacher ?? "",
  timeSlots: dto.timeSlots ?? [],
});

const dayMap: Record<string, number> = {
  "Chủ nhật": 0,
  "Thứ 2": 1,
  "Thứ 3": 2,
  "Thứ 4": 3,
  "Thứ 5": 4,
  "Thứ 6": 5,
  "Thứ 7": 6,
};

const parseSlot = (slot: string) => {
  const [a] = slot.split("-");
  const [h, m] = a.split(":").map(Number);
  return { h, m };
};

function firstSession(ts: ScheduleItemDTO["timeSlots"] = []): moment.Moment | null {
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

  const [rows, setRows] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const cutoffHours = 24;

  const fetchData = async () => {
    if (!studentId) {
      console.log("studentId is undefined, skipping fetch");
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching schedule for studentId:", studentId);
      const response = await getMyScheduleAPI(studentId);
      console.log("Raw response from API:", response);
      const raw: ScheduleItemDTO[] = Array.isArray(response.data) ? response.data : [];
      console.log("Raw data from API:", raw);
      const normalized: ScheduleItem[] = raw
        .filter((x) => !!x.className || !!x.subject)
        .map((dto, index) => mapDTOtoItem(dto, index));
      console.log("Normalized data:", normalized);
      setRows(normalized);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Redux user state:", user);
    if (!studentId) {
      console.log("No studentId, user data:", user);
      return;
    }
    fetchData();
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
    console.log("Attempting to cancel classId:", classId);
    if (!classId || classId.startsWith("temp-")) {
      message.error("ID lớp học không hợp lệ");
      return;
    }
    try {
      const response = await cancelEnrollAPI(classId);
      console.log("Cancel response:", response);
      message.success("Đã hủy đăng ký");
      void fetchData();
    } catch (err) {
      console.error("Cancel error:", err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const msg = axiosErr.response?.data?.message || "Không hủy được";
      message.error(msg);
    }
  };

  return (
    <div className="p-5 bg-slate-50 min-h-screen">
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

        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4">
          <Table<Row>
            rowKey={(record) => record.classId || `temp-${Math.random()}`} // Đảm bảo rowKey duy nhất
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
                  if (!r.canCancel) return null;
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