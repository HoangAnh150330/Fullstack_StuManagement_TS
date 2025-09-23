// src/pages/Teacher/AnnouncementsPage/AnnouncementsPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  Select,
  Input,
  Button,
  List,
  Empty,
  Typography,
  Space,
  Divider,
} from "antd";
import { SendOutlined, ReloadOutlined, NotificationOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import {
  teacherGetMyClasses,
  teacherSendAnnouncement,
  teacherGetAnnouncements,
  type ClassItem,
} from "../../../services/teacher_api";

const { Text, Paragraph } = Typography;

type Ann = { _id: string; title: string; createdAt: string };

export default function AnnouncementsPage() {
  const [initLoading, setInitLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [sending, setSending] = useState(false);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classId, setClassId] = useState<string>();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<Ann[]>([]);

  // Load danh sách lớp
  useEffect(() => {
    (async () => {
      try {
        const res = await teacherGetMyClasses();
        setClasses(res || []);
        if (!classId && res?.length) setClassId(res[0]._id);
      } catch {
        toast.error("Không tải được danh sách lớp.");
      } finally {
        setInitLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        label: `${c.name}${c.subject ? " - " + c.subject : ""}`,
        value: c._id,
      })),
    [classes]
  );

  // Tải thông báo theo lớp
  const fetchAnnouncements = useCallback(async (cid?: string) => {
    if (!cid) {
      setItems([]);
      return;
    }
    setLoadingList(true);
    try {
      const list = (await teacherGetAnnouncements(cid)) as Ann[];
      setItems((list || []).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
    } catch {
      toast.error("Không tải được thông báo.");
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (!classId) return;
    fetchAnnouncements(classId);
  }, [classId, fetchAnnouncements]);

  // Gửi thông báo
  const handleSend = async () => {
    const content = title.trim();
    if (!classId) return toast.warn("Hãy chọn lớp.");
    if (!content) return toast.warn("Nhập nội dung thông báo.");

    try {
      setSending(true);
      await teacherSendAnnouncement({ classId, title: content });
      toast.success("Đã gửi thông báo!");
      setTitle("");
      // Optimistic update
      setItems((prev) => [
        { _id: Math.random().toString(36).slice(2), title: content, createdAt: new Date().toISOString() },
        ...prev,
      ]);
    } catch {
      toast.error("Gửi thông báo thất bại.");
    } finally {
      setSending(false);
    }
  };

  const onTextKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="rounded-2xl" title="Thông báo cho học viên" loading={initLoading}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Composer */}
        <Space.Compact block>
          <Select
            style={{ minWidth: 260 }}
            placeholder="Chọn lớp"
            value={classId}
            onChange={setClassId}
            options={classOptions}
          />
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 3 }}
            placeholder="Nội dung thông báo... (Ctrl+Enter để gửi)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onTextKeyDown}
            maxLength={300}
            showCount
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={sending}
            disabled={!classId || !title.trim()}
          >
            Gửi
          </Button>
        </Space.Compact>

        <Divider style={{ margin: "8px 0 0" }} />

        {/* Header list */}
        <div className="flex items-center justify-between">
          <Text strong>Danh sách thông báo</Text>
          <Button icon={<ReloadOutlined />} onClick={() => fetchAnnouncements(classId)} loading={loadingList}>
            Tải lại
          </Button>
        </div>

        {/* List */}
        <List
          loading={loadingList}
          dataSource={items}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào." />,
          }}
          renderItem={(a) => (
            <List.Item>
              <List.Item.Meta
                avatar={<NotificationOutlined style={{ fontSize: 20, marginTop: 6 }} />}
                title={<Text>{a.title}</Text>}
                description={
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {dayjs(a.createdAt).format("HH:mm, DD/MM/YYYY")}
                  </Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Card>
  );
}
