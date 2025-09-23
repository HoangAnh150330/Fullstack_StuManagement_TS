import { useEffect, useMemo, useState } from "react";
import { Card, Select, Table, InputNumber, Input, Button } from "antd";
import { toast } from "react-toastify";
import {
  teacherGetMyClasses,
  teacherGetClassStudents,
  teacherAddGrades,
  teacherGetGradesByType,
  type StudentLite,
  type ClassItem,
  type GradeType,
} from "../../../services/teacher_api";

const GRADE_OPTIONS: { value: GradeType; label: string }[] = [
  { value: "midterm", label: "Giữa kỳ" },
  { value: "final", label: "Cuối kỳ" },
  { value: "quiz", label: "Thường kỳ" },
];

type Row = { _id: string; name: string; score?: number; note?: string };

export default function GradesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [classOptions, setClassOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [classId, setClassId] = useState<string>();
  const [gradeType, setGradeType] = useState<GradeType>("midterm");
  const [rows, setRows] = useState<Row[]>([]);

  // load danh sách lớp
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const classes: ClassItem[] = await teacherGetMyClasses();
        const opts = classes.map((c) => ({ value: String(c._id ?? c.id), label: c.name ?? "Không tên" }));
        setClassOptions(opts);
        if (!classId && opts.length > 0) setClassId(opts[0].value);
      } catch  {
        toast.error("Không tải được danh sách lớp.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // khi chọn lớp/loại điểm → tải HS + prefill điểm đã nhập
useEffect(() => {
  if (!classId) { setRows([]); return; }

  (async () => {
    try {
      setLoading(true);
      const students: StudentLite[] = await teacherGetClassStudents(classId);
      const base: Row[] = students.map((s) => ({ _id: String(s._id), name: s.name }));

      const existing = await teacherGetGradesByType(classId, gradeType);
      const map = new Map(existing.map(g => [String(g.studentId), g]));
      const merged = base.map(r =>
        map.has(r._id) ? { ...r, score: map.get(r._id)!.score, note: map.get(r._id)!.note } : r
      );

      setRows(merged);
      if (existing.length) {
        toast.info(`Đã nạp ${existing.length} bản điểm ${
          GRADE_OPTIONS.find(o => o.value === gradeType)?.label?.toLowerCase()
        }.`);
      }
    } catch {           // <-- đổi từ `catch ()` thành `catch (e)` hoặc `catch {`
      toast.error("Không tải được danh sách/điểm.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  })();
}, [classId, gradeType]);


  const itemsToSave = useMemo(
    () =>
      rows
        .filter((r) => typeof r.score === "number")
        .map((r) => ({ studentId: r._id, score: Number(r.score), note: r.note })),
    [rows]
  );

  const handleSave = async () => {
    if (!classId) return toast.warn("Chọn lớp trước khi lưu.");
    if (itemsToSave.length === 0) return toast.info("Chưa có điểm nào để lưu.");

    try {
      setSaving(true);
      await teacherAddGrades({ classId, type: gradeType, items: itemsToSave });
      toast.success("Đã lưu điểm!");
    } catch {
      toast.error("Lưu điểm thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const gradeLabel = GRADE_OPTIONS.find((o) => o.value === gradeType)?.label ?? "Điểm";

  return (
    <Card className="rounded-2xl" title="Quản lý điểm số">
      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="min-w-[240px]" placeholder="Chọn lớp" value={classId} onChange={setClassId} options={classOptions} />
        <Select className="min-w-[180px]" value={gradeType} onChange={setGradeType} options={GRADE_OPTIONS} />
        <Button type="primary" onClick={handleSave} loading={saving}>Lưu điểm</Button>
      </div>

      <Table<Row>
        loading={loading}
        dataSource={rows}
        rowKey="_id"
        pagination={false}
        columns={[
          { title: "Họ tên", dataIndex: "name" },
          {
            title: gradeLabel,
            dataIndex: "score",
            width: 160,
            render: (_, r, i) => (
              <InputNumber min={0} max={10} value={r.score}
                onChange={(v) => setRows(prev => {
                  const next = [...prev];
                  next[i] = { ...next[i], score: v ?? undefined };
                  return next;
                })}
              />
            ),
          },
          {
            title: "Ghi chú",
            dataIndex: "note",
            render: (_, r, i) => (
              <Input value={r.note}
                onChange={(e) => setRows(prev => {
                  const next = [...prev];
                  next[i] = { ...next[i], note: e.target.value };
                  return next;
                })}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
