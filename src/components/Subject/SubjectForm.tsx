import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { SubjectData } from "../../types/subject";

interface Props {
  open: boolean;
  onClose: () => void;
  // lưu ý: trong code trang list bạn đang dùng "_id", nên Omit theo "_id"
  onSubmit: (data: Omit<SubjectData, "_id">) => void;
  subject?: SubjectData | null;
}

const DATE_FMT = "YYYY-MM-DD";

const SubjectForm: React.FC<Props> = ({ open, onClose, onSubmit, subject }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (subject) {
      form.setFieldsValue({
        ...subject,
        // chuyển string -> Dayjs cho DatePicker
        startDate: subject.startDate ? dayjs(subject.startDate) : null,
        endDate: subject.endDate ? dayjs(subject.endDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [subject, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // chuyển Dayjs -> string trước khi submit
      const payload: Omit<SubjectData, "_id"> = {
            name: values.name,
            code: values.code,
            credit: values.credit,
            description: values.description,
            startDate: (values.startDate as Dayjs).toDate(),
            endDate: (values.endDate as Dayjs).toDate(),
          };
      onSubmit(payload);
    } catch { /* ignore */ }
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
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item name="description" label="Mô tả ngắn">
          <Input.TextArea />
        </Form.Item>

        <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
          <DatePicker className="w-full" format={DATE_FMT} />
        </Form.Item>

        <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true }]}>
          <DatePicker className="w-full" format={DATE_FMT} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SubjectForm;
