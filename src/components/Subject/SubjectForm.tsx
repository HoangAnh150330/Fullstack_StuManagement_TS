// src/components/subject/SubjectForm.tsx
import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber } from "antd";
import type { SubjectData } from "../../types/subject";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SubjectData, "id">) => void;
  subject?: SubjectData | null;
}

const SubjectForm: React.FC<Props> = ({ open, onClose, onSubmit, subject }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (subject) {
      form.setFieldsValue(subject);
    } else {
      form.resetFields();
    }
  }, [subject]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {}
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      title={subject ? "Chỉnh sửa môn học" : "Thêm môn học"}
      okText="Lưu"
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="Tên môn học" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="code" label="Mã môn" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="credit" label="Số tín chỉ" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectForm;
