import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Button, Space } from "antd";
import type { classData } from "../../types/class";
import { subjectAPI } from "../../services/subject_api";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<classData, "_id">) => void;
  classItem?: classData | null;
}

const teacherOptions = ["Nguyễn Nhật Anh", "Huỳnh Hoa", "Hoàng Vương", "Jony Đặng"];

const dayOfWeekOptions = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"];

const timeSlotOptions = ["07:00-09:00","09:00-11:00","13:00-15:00","15:00-17:00","18:00-20:00"];

const ClassForm: React.FC<Props> = ({ open, onClose, onSubmit, classItem }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectAPI.getAll();
        setSubjects(res.map((subject) => subject.name));
      } catch (err) {
        console.error("Lỗi khi lấy danh sách môn học:", err);
      }
    };
    fetchSubjects();

    if (classItem) {
      form.setFieldsValue({ ...classItem, timeSlots: classItem.timeSlots || [] });
    } else {
      form.resetFields();
    }
  }, [classItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = { ...values, timeSlots: values.timeSlots || [] };
      onSubmit(submitData);
    } catch (err) {
      console.log(err);
    }
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
          <Select placeholder="Chọn môn học" className="w-full">
            {subjects.map((subject) => (
              <Option key={subject} value={subject}>
                {subject}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teacher"
          label="Giáo viên"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
        >
          <Select placeholder="Chọn giáo viên" className="w-full">
            {teacherOptions.map((teacher) => (
              <Option key={teacher} value={teacher}>
                {teacher}
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
                      <Select placeholder="Chọn ngày" className="w-full">
                        {dayOfWeekOptions.map((day) => (
                          <Option key={day} value={day}>
                            {day}
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
                      <Select placeholder="Chọn khung giờ" className="w-full">
                        {timeSlotOptions.map((slot) => (
                          <Option key={slot} value={slot}>
                            {slot}
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
