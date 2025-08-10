import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select } from "antd";
import type { StudentData } from "../../types/student";
import dayjs from "dayjs";

interface StudentFormProps {
  visible: boolean;            // prop cũ
  onClose: () => void;
  onSubmit: (student: StudentData) => void;
  initialData?: StudentData | null;
}

const { Option } = Select;

const StudentForm: React.FC<StudentFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        dob: initialData.dob ? dayjs(initialData.dob) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleFinish = (values: any) => {
    const formattedStudent: StudentData = {
      ...values,
      dob: values.dob?.format("YYYY-MM-DD"),
      id: initialData?.id ?? crypto.randomUUID(),
    };
    onSubmit(formattedStudent);
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Cập nhật học viên" : "Thêm học viên"}
      open={visible}                // ✅ AntD v5: dùng open thay visible
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="dob" label="Ngày sinh">
          <DatePicker format="DD/MM/YYYY" className="w-full" /> {/* ✅ thay style width */}
        </Form.Item>

        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính" className="w-full">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="province" label="Tỉnh / Thành phố">
          <Input placeholder="VD: Hồ Chí Minh" />
        </Form.Item>

        <Form.Item name="classId" label="Lớp">
          <Select placeholder="Chọn lớp" className="w-full">
            <Option value="A1">A1</Option>
            <Option value="B1">B1</Option>
            <Option value="C1">C1</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentForm;
