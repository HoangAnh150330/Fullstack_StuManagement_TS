// src/pages/Teacher/AttendancePage/AttendancePage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card, DatePicker, Select, Table, Switch, Button, message,
  Input, Space, Tag, Statistic, Row, Col, Affix, Divider, Empty, Tooltip
} from "antd";
import { CheckCircleTwoTone, CloseCircleTwoTone, SwapOutlined, SaveOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams } from "react-router-dom";
import {
  teacherGetMyClasses,
  teacherGetClassStudents,
  teacherMarkAttendance,
  teacherGetAttendanceByDate, // ⬅️ nhớ thêm service này
  type StudentLite,
  type ClassItem,
} from "../../../services/teacher_api";

type RowItem = { _id: string; name: string; present: boolean; note?: string };

export default function AttendancePage() {
  const [sp] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [classId, setClassId] = useState<string>();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [rows, setRows] = useState<RowItem[]>([]);
  const [filter, setFilter] = useState("");
  const [dirty, setDirty] = useState(false);

  // Lấy classId từ query (?classId=...)
  useEffect(() => {
    const q = sp.get("classId");
    if (q) setClassId(q);
  }, [sp]);

  // Load danh sách lớp
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await teacherGetMyClasses();
        if (!mounted) return;
        setClasses(list || []);
      } catch (e) {
        console.error(e);
        message.error("Không tải được danh sách lớp");
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load học viên + trạng thái điểm danh theo ngày
  useEffect(() => {
    if (!classId) { setRows([]); setLoading(false); return; }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const iso = date.startOf("day").toISOString();

        const [students, attendance] = await Promise.all([
          teacherGetClassStudents(classId),
          teacherGetAttendanceByDate(classId, iso).catch(() => []),
        ]);

        const attMap = new Map(
          (attendance || []).map(a => [a.studentId, a])
        );

        const mapped: RowItem[] = (students || []).map((s: StudentLite) => {
          const rec = attMap.get(s._id);
          return {
            _id: s._id,
            name: s.name,
            present: rec ? rec.status === "present" : false,
            note: rec?.note || "",
          };
        });

        if (!mounted) return;
        setRows(mapped);
        setDirty(false);
      } catch (e) {
        console.error(e);
        message.error("Không tải được dữ liệu điểm danh");
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [classId, date]);

  const classOptions = useMemo(
    () =>
      (classes || []).map((c) => ({
        value: String(c._id),
        label: c.name ? `${c.name}${c.subject ? ` — ${c.subject}` : ""}` : String(c._id),
      })),
    [classes]
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
  }, [rows, filter]);

  const presentCount = filtered.filter((r) => r.present).length;
  const absentCount = filtered.length - presentCount;

  const setAll = (val: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, present: val })));
    setDirty(true);
  };
  const invertAll = () => {
    setRows((prev) => prev.map((r) => ({ ...r, present: !r.present })));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!classId) {
      message.warning("Hãy chọn lớp trước khi lưu");
      return;
    }
    try {
      setSaving(true);
      await teacherMarkAttendance({
        classId,
        date: date.startOf("day").toISOString(),
        records: rows.map((r) => ({
          studentId: r._id,
          status: r.present ? "present" : "absent",
          note: r.note?.trim() || undefined,
        })),
      });
      setDirty(false);
      message.success("Đã lưu điểm danh!");
    } catch (e) {
      console.error(e);
      message.error("Lưu điểm danh thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl" title="Điểm danh">
      {/* Toolbar */}
      <Space direction="vertical" className="w-full">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Space.Compact className="w-full">
              <Select
                className="w-full"
                placeholder="Chọn lớp"
                value={classId}
                onChange={setClassId}
                options={classOptions}
                showSearch
                optionFilterProp="label"
              />
              <DatePicker value={date} onChange={(d) => d && setDate(d)} />
            </Space.Compact>
          </Col>

          <Col xs={24} md={6}>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tên"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </Col>

          <Col xs={24} md={8}>
            <Space wrap>
              <Button onClick={() => setAll(true)} icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}>
                Tất cả có mặt
              </Button>
              <Button onClick={() => setAll(false)} icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}>
                Tất cả vắng
              </Button>
              <Tooltip title="Đảo trạng thái">
                <Button onClick={invertAll} icon={<SwapOutlined />} />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={8} md={6}>
            <Statistic title="Tổng" value={filtered.length} />
          </Col>
          <Col xs={8} md={6}>
            <Statistic title="Có mặt" value={presentCount} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col xs={8} md={6}>
            <Statistic title="Vắng" value={absentCount} valueStyle={{ color: "#ff4d4f" }} />
          </Col>
        </Row>
      </Space>

      <Divider />

      {/* Table */}
      <Table<RowItem>
        loading={loading}
        dataSource={filtered}
        rowKey="_id"
        sticky
        scroll={{ y: 420 }}
        locale={{ emptyText: <Empty description={classId ? "Không có học viên" : "Chọn lớp để xem"} /> }}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: "Họ tên",
            dataIndex: "name",
            render: (text: string) => (
              <Space>
                <div
                  className="ant-avatar ant-avatar-circle ant-avatar-blue"
                  style={{
                    width: 28,
                    height: 28,
                    lineHeight: "28px",
                    textAlign: "center",
                    color: "#fff",
                    background: "#1677ff",
                  }}
                >
                  {text?.trim()?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span>{text}</span>
              </Space>
            ),
          },
          {
            title: "Ghi chú",
            dataIndex: "note",
            render: (_, r, idx) => (
              <Input
                placeholder="VD: đến trễ 10'"
                value={r.note}
                onChange={(e) => {
                  const next = [...rows];
                  next[idx] = { ...r, note: e.target.value };
                  setRows(next);
                  setDirty(true);
                }}
              />
            ),
          },
          {
            title: "Có mặt",
            dataIndex: "present",
            width: 120,
            render: (_, r, idx) => (
              <Switch
                checked={r.present}
                onChange={(v) => {
                  const next = [...rows];
                  next[idx] = { ...r, present: v };
                  setRows(next);
                  setDirty(true);
                }}
              />
            ),
          },
        ]}
      />

      {/* Bottom bar */}
      <Affix offsetBottom={12}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          <Space>
            <Tag color={dirty ? "orange" : "blue"}>{dirty ? "Chưa lưu" : "Đã đồng bộ"}</Tag>
            <span>
              <b>{presentCount}</b> có mặt • <b>{absentCount}</b> vắng
            </span>
          </Space>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!classId || !rows.length || !dirty}
          >
            Lưu điểm danh
          </Button>
        </div>
      </Affix>
    </Card>
  );
}
