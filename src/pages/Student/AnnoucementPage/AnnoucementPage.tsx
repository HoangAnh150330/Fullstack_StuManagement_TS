import { useEffect, useState } from "react";
import { List, Card, Typography, Spin } from "antd";
import { announceAPI } from "../../../services/annoucement_api";
import type { Announcement } from "../../../types/announcement";

const { Text } = Typography;

export default function StudentAnnouncements() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        // Nếu backend đã có getForStudent thì dùng cái này
        // const data = await announceAPI.getForStudent();

        // Tạm thời lấy theo classId
        const data = await announceAPI.getByClass("66f14c8b4e32f76b4a23b8d7");
        setAnnouncements(data);
      } catch (err) {
        console.error("Lỗi lấy thông báo:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  if (loading) return <Spin tip="Đang tải thông báo..." />;

  return (
    <Card title="Thông báo cho bạn" style={{ maxWidth: 700, margin: "20px auto" }}>
      <List
        dataSource={announcements}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Text strong>{item.className ?? item.classId}</Text>}
              description={
                <>
                  <div>{item.title}</div>
                  <Text type="secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
