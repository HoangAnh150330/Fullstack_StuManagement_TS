import { useEffect, useMemo, useState } from "react";
import { Card, Select, DatePicker, TimePicker, Button, Input, message, Tag, Space, Spin, Alert } from "antd";
import type { Dayjs } from "dayjs";
import { teacherGetMyClasses, type ClassItem } from "../../../services/teacher_api";
import {
  createChangeRequest,
  listMyChangeRequests,
  type ChangeReq,
} from "../../../services/changeReqest_api"; // ✅ sửa tên file import

type Slot = { day: string; slot: string };
const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

export default function ChangeRequestPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [classId, setClassId] = useState<string>();
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<[Dayjs, Dayjs] | null>(null);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  const [mine, setMine] = useState<ChangeReq[]>([]);
  const [loadingMine, setLoadingMine] = useState<boolean>(false);

  // Load danh sách lớp + đề xuất của tôi
  useEffect(() => {
    (async () => {
      setLoadingClasses(true);
      setLoadError(null);
      try {
        const cs = await teacherGetMyClasses(); // yêu cầu token qua interceptor
        setClasses(Array.isArray(cs) ? cs : []);
      } catch (e) {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (e as Error)?.message ||
          "Không thể tải danh sách lớp của bạn";
        setLoadError(msg);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }

      setLoadingMine(true);
      try {
        const reqs = await listMyChangeRequests();
        setMine(reqs);
      } catch {
        // không chặn UI, chỉ hiển thị trống nếu lỗi
        setMine([]);
      } finally {
        setLoadingMine(false);
      }
    })();
  }, []);

  const currentSlots: Slot[] = useMemo(() => {
    const cls = classes.find((c) => String(c._id ?? c.id) === classId);
    // ClassItem.timeSlots có dạng { day, slot }
    return (cls?.timeSlots ?? []) as Slot[];
  }, [classes, classId]);

  const addSlot = async () => {
    if (!classId) {
      message.warning("Chọn lớp trước khi gửi");
      return;
    }
    if (!date || !time) {
      message.warning("Chọn ngày và khoảng giờ");
      return;
    }
    const day = dayNames[date.day()];
    const fmt = (d: Dayjs) => d.format("HH:mm");
    const slot = `${fmt(time[0])}-${fmt(time[1])}`;
    await submit([{ day, slot }]);
  };

  const submit = async (newSlots: Slot[]) => {
    setSending(true);
    try {
      await createChangeRequest(classId as string, newSlots, reason.trim() || undefined);
      message.success("Đã gửi đề xuất thay đổi lịch");
      setReason("");
      setDate(null);
      setTime(null);
      // reload danh sách đề xuất
      setLoadingMine(true);
      const reqs = await listMyChangeRequests();
      setMine(reqs);
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (e as Error)?.message ||
        "Gửi thất bại";
      message.error(msg);
    } finally {
      setSending(false);
      setLoadingMine(false);
    }
  };

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: String(c._id ?? c.id),
        label: `${c.name ?? "Lớp"}${c.subject ? ` (${c.subject})` : ""}`,
      })),
    [classes]
  );

  return (
    <Card className="rounded-2xl" title="Đề xuất thay đổi lịch">
      {/* Khối chọn & gửi đề xuất */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap mb-4">
        <div className="min-w-[220px]">
          {loadingClasses ? (
            <Spin />
          ) : (
            <Select
              placeholder="Chọn lớp"
              value={classId}
              onChange={setClassId}
              options={classOptions}
              loading={loadingClasses}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 260 }}
            />
          )}
        </div>

        <DatePicker value={date} onChange={(d) => setDate(d)} disabled={!classId || loadingClasses} />

        <TimePicker.RangePicker
          value={time ?? undefined}
          onChange={(v) => setTime((v as [Dayjs, Dayjs]) ?? null)}
          format="HH:mm"
          disabled={!classId || loadingClasses}
        />

        <Input
          placeholder="Lý do..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-w-[260px]"
          disabled={!classId || loadingClasses}
        />

        <Button type="primary" loading={sending} onClick={addSlot} disabled={!classId || loadingClasses}>
          Gửi đề xuất
        </Button>
      </div>

      {loadError && (
        <div className="mb-4">
          <Alert type="error" showIcon message={loadError} />
        </div>
      )}

      {/* Lịch hiện tại của lớp */}
      {classId && !loadingClasses && currentSlots.length > 0 && (
        <div className="mb-4 text-sm">
          <b>Lịch hiện tại:</b>{" "}
          {currentSlots.map((s, i) => (
            <Tag key={i}>
              {s.day} - {s.slot}
            </Tag>
          ))}
        </div>
      )}

      {/* Danh sách đề xuất của tôi */}
      <div className="mt-6">
        <h4 className="mb-2">Đề xuất của tôi</h4>
        {loadingMine ? (
          <Spin />
        ) : mine.length === 0 ? (
          <div className="text-slate-500">Chưa có đề xuất</div>
        ) : (
          mine.map((r) => (
            <Card key={r._id} size="small" className="mb-2">
              <Space wrap>
                <Tag color="blue">Lớp: {typeof r.classId === "object" && r.classId && "name" in r.classId ? (r.classId as any).name : String(r.classId)}</Tag>
                <Tag color="gold">
                  Mới: {r.newSlots.map((s) => `${s.day} ${s.slot}`).join(", ")}
                </Tag>
                <Tag color={r.status === "pending" ? "processing" : r.status === "approved" ? "green" : "red"}>
                  {r.status}
                </Tag>
                {r.reason && <span>• Lý do: {r.reason}</span>}
              </Space>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
