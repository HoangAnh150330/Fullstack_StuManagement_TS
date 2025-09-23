import { useEffect, useMemo, useState } from "react";
import { Card, Upload, Button, Table, Select, message, Popconfirm, Modal, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { absolutize } from "../../../utils/url";
import {
  teacherGetMyClasses,
  teacherGetMaterials,
  teacherUploadMaterialMeta,
  teacherDeleteMaterial,
  type ClassItem,
  type MaterialItem,
  teacherUploadRawFile 
} from "../../../services/teacher_api";

type Row = { _id: string; name: string; size?: string; createdAt?: string; url?: string };

export default function MaterialsPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [classId, setClassId] = useState<string>();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [openUrlModal, setOpenUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  /* ===== helpers ===== */
  function humanFileSize(bytes: number) {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  function materialToRow(m: MaterialItem): Row {
    const displayName = m.filename ?? m.name ?? "Tài liệu";
    const sizeNum = typeof m.size === "string" ? parseInt(m.size, 10) : m.size;

    return {
      _id: m._id,
      name: displayName,
      size: typeof sizeNum === "number" ? humanFileSize(sizeNum) : (m.size as string) || "",
      createdAt: m.createdAt ? dayjs(m.createdAt).format("HH:mm DD/MM/YYYY") : "",
      url: m.url,
    };
  }

  async function loadMaterials(cid: string) {
    setLoading(true);
    try {
      const raw = await teacherGetMaterials(cid);
      const list: MaterialItem[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setRows((list || []).map(materialToRow));
    } catch {
      message.error("Không tải được tài liệu");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  /* ===== effects ===== */
  useEffect(() => {
    (async () => {
      try {
        const res = await teacherGetMyClasses();
        setClasses(res || []);
        if (!classId && res?.length) setClassId(res[0]._id);
      } catch {
        message.error("Không tải được danh sách lớp");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!classId) {
      setRows([]);
      setLoading(false);
      return;
    }
    loadMaterials(classId);
  }, [classId]);

  /* ===== upload (2 cách) =====
     A) Upload file lên /api/upload (nếu bạn có) rồi lưu meta bằng teacherUploadMaterialMeta
     B) Thêm bằng URL (đã có sẵn modal bên dưới) */
  const propsUpload = {
    name: "file",
    multiple: false,
    showUploadList: false,
    disabled: !classId,
    customRequest: async (options: any) => {
      if (!classId) return message.warning("Hãy chọn lớp trước khi upload");
      try {
        setUploading(true);

        // 1) Upload file thô để lấy URL
        const { url, size, name } = await teacherUploadRawFile(options.file as File);

        // 2) Lưu meta vào materials
        await teacherUploadMaterialMeta({
          classId,
          name: name || (options.file as File).name,
          url,
          size,
        });

        message.success("Đã upload tài liệu");
        options.onSuccess?.(null, options.file);

        // 3) Reload danh sách
        const raw = await teacherGetMaterials(classId);
        const list: MaterialItem[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
        setRows((list || []).map(materialToRow));
      } catch (err: any) {
        console.error(err);
        message.error(err?.message || "Upload thất bại");
        options.onError?.(err);
      } finally {
        setUploading(false);
      }
    },
  };

  const onAddByUrl = async () => {
    if (!classId) return message.warning("Hãy chọn lớp");
    if (!urlInput) return message.warning("Nhập URL tài liệu");
    try {
      setUploading(true);
      const name = urlInput.split("/").pop() || "Tài liệu";
      await teacherUploadMaterialMeta({ classId, name, url: urlInput });
      message.success("Đã thêm tài liệu");
      setOpenUrlModal(false);
      setUrlInput("");
      await loadMaterials(classId);
    } catch (e: any) {
      message.error(e?.message || "Thêm thất bại");
    } finally {
      setUploading(false);
    }
  };

  const classOptions = useMemo(
    () => classes.map((c) => ({ label: `${c.name} - ${c.subject ?? ""}`, value: c._id })),
    [classes]
  );

  const handleDelete = async (id: string) => {
    try {
      await teacherDeleteMaterial(id);
      message.success("Đã xoá");
      setRows((r) => r.filter((x) => x._id !== id));
    } catch {
      message.error("Xoá thất bại");
    }
  };

  return (
    <Card className="rounded-2xl" title="Tài liệu giảng dạy">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          className="min-w-[260px]"
          placeholder="Chọn lớp"
          value={classId}
          onChange={setClassId}
          options={classOptions}
          loading={!classes.length}
          allowClear
        />

        <Upload {...propsUpload}>
          <Button icon={<UploadOutlined />} loading={uploading} disabled={!classId}>
            Upload tài liệu
          </Button>
        </Upload>

        <Button onClick={() => setOpenUrlModal(true)} disabled={!classId}>
          Thêm bằng URL
        </Button>
      </div>

      <Table
        loading={loading}
        dataSource={rows}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No data" }}
        columns={[
          { title: "Tên tài liệu", dataIndex: "name" },
          { title: "Kích thước", dataIndex: "size", width: 120 },
          { title: "Ngày tạo", dataIndex: "createdAt", width: 180 },
          {
            title: "Thao tác",
            width: 220,
            render: (_, r) => (
              <>
                <Button type="link" href={absolutize(r.url)} target="_blank" rel="noreferrer" disabled={!r.url}>
                  Xem
                </Button>
                <Popconfirm title="Xoá tài liệu này?" onConfirm={() => handleDelete(r._id)}>
                  <Button type="link" danger>
                    XOÁ
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />

      <Modal
        title="Thêm tài liệu bằng URL"
        open={openUrlModal}
        onOk={onAddByUrl}
        onCancel={() => setOpenUrlModal(false)}
        okButtonProps={{ loading: uploading }}
      >
        <Input
          placeholder="Dán URL (Google Drive, Cloudinary, ...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
