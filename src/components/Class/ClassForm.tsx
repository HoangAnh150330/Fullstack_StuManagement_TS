// src/components/Class/ClassForm.tsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space } from "antd";
import type { classData, ClassFormValues } from "../../types/class";
import { subjectAPI } from "../../services/subject_api";
import { teacherList, type TeacherLite } from "../../services/teacher_api";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<classData, "_id">) => void;
  classItem?: classData | null;
}

const dayOfWeekOptions = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"];
const timeSlotOptions = ["07:00-09:00","09:00-11:00","13:00-15:00","15:00-17:00","18:00-20:00"];

const ClassForm: React.FC<Props> = ({ open, onClose, onSubmit, classItem }) => {
  const [form] = Form.useForm<ClassFormValues>();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<TeacherLite[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const list = await subjectAPI.getAll(); // luôn là SubjectData[]
        setSubjects(list.map((s) => s.name));   // ['English cơ bản', ...]
      } catch (err) {
        console.error("Lỗi khi lấy môn học:", err);
        setSubjects([]);
      }
    };

    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const res = await teacherList();
        setTeachers(res);
      } catch (err) {
        console.error("Lỗi khi lấy giáo viên:", err);
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchSubjects();
    fetchTeachers();
  }, []);


  // Prefill khi mở modal
  useEffect(() => {
    if (!open) return;
    if (classItem) {
      const raw = classItem as any;
      const teacherIdValue =
        typeof raw.teacherId === "string" ? raw.teacherId : raw.teacherId?._id;

      form.setFieldsValue({
        name: classItem.name,
        subject: classItem.subject,
        teacherId: teacherIdValue, // luôn là string
        maxStudents: classItem.maxStudents,
        timeSlots: classItem.timeSlots || [],
      });
    } else {
      form.resetFields();
    }
  }, [open, classItem, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const submitData: Omit<classData, "_id"> = {
      name: values.name,
      subject: values.subject,
      teacherId: values.teacherId, // gửi id
      maxStudents: values.maxStudents,
      timeSlots: values.timeSlots || [],
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      title={classItem ? "Cập nhật lớp học" : "Thêm lớp học"}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên lớp"
          rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Môn học"
          rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
        >
          <Select placeholder="Chọn môn học" showSearch optionFilterProp="children">
            {subjects.map((subject) => (
              <Option key={subject} value={subject}>
                {subject}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teacherId"
          label="Giáo viên"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
        >
          <Select
            placeholder="Chọn giáo viên"
            loading={loadingTeachers}
            showSearch
            optionFilterProp="children"
          >
            {teachers.map((t) => (
              <Option key={t._id} value={t._id}>
                {t.name}
                {t.email ? ` — ${t.email}` : ""}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="maxStudents"
          label="Sĩ số tối đa"
          rules={[{ required: true, message: "Vui lòng nhập sĩ số tối đa" }]}
        >
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item label="Khung giờ" required tooltip="Chọn nhiều ngày và khung giờ">
          <Form.List name="timeSlots">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" className="w-full mb-2">
                    <Form.Item
                      {...field}
                      name={[field.name, "day"]}
                      rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                      className="flex-1"
                    >
                      <Select placeholder="Chọn ngày">
                        {dayOfWeekOptions.map((d) => (
                          <Option key={d} value={d}>
                            {d}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      name={[field.name, "slot"]}
                      rules={[{ required: true, message: "Vui lòng chọn khung giờ" }]}
                      className="flex-1"
                    >
                      <Select placeholder="Chọn khung giờ">
                        {timeSlotOptions.map((s) => (
                          <Option key={s} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Button type="link" danger onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Thêm khung giờ
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClassForm;
