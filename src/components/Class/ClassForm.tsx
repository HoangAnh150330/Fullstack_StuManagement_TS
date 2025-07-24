import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import type { classData } from "../../types/class";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<classData, "id">) => void;
  classItem?: classData | null;
}

const teacherOptions = [
  "Nguyễn Nhật Anh",
  "Huỳnh Hoa",
  "Hoàng Vương",
  "Jony Đặng",
];

const courseOptions = ["Cơ bản", "Trung cấp"];

const ClassForm: React.FC<Props> = ({ open, onClose, onSubmit, classItem }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (classItem) {
      form.setFieldsValue(classItem);
    } else {
      form.resetFields();
    }
  }, [classItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {
      // Xử lý lỗi validate nếu cần
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
          name="course"
          label="Khóa học"
          rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
        >
          <Select placeholder="Chọn khóa học">
            {courseOptions.map((course) => (
              <Option key={course} value={course}>
                {course}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="teacher"
          label="Giáo viên"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
        >
          <Select placeholder="Chọn giáo viên">
            {teacherOptions.map((teacher) => (
              <Option key={teacher} value={teacher}>
                {teacher}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ClassForm;
