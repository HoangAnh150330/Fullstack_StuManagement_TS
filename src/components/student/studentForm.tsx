import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select } from "antd";
import type { StudentData } from "../../types/student";
import dayjs from "dayjs";

interface StudentFormProps {
  visible: boolean;
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

  // Gán giá trị mặc định khi sửa
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        birthday: initialData.birthday ? dayjs(initialData.birthday) : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const handleFinish = (values: any) => {
    const formattedStudent: StudentData = {
      ...values,
      birthday: values.birthday?.format("YYYY-MM-DD"),
      id: initialData?.id ?? crypto.randomUUID(), // Nếu thêm mới thì tạo id ngẫu nhiên
    };
    onSubmit(formattedStudent);
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Cập nhật học viên" : "Thêm học viên"}
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Nhập tên học viên" }]}>
          <Input placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
          <Input placeholder="abc@email.com" />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Nhập số điện thoại" }]}>
          <Input placeholder="0123456789" />
        </Form.Item>

        <Form.Item name="birthday" label="Ngày sinh">
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="classId" label="Lớp">
          <Select placeholder="Chọn lớp">
            <Option value="A1">A1</Option>
            <Option value="B1">B1</Option>
            <Option value="C1">C1</Option>
            {/* Bạn có thể lấy danh sách lớp từ API sau này */}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentForm;
