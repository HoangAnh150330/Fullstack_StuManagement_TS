import { Card, Timeline, Progress, Calendar } from "antd";
import type { Announcement, ProgressItem } from "../../types/teacher";

export default function SectionRight({
  announcements, progress, loading,
}:{
  announcements:Announcement[]|undefined;
  progress:ProgressItem[]|undefined;
  loading?:boolean;
}) {
  const color = (s?: string) => s==="error" ? "red" : s==="active" ? "orange" : "green";

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl" title="Thông báo / Lịch học bù" loading={loading}>
        <Timeline
          items={(announcements || []).map(a=>({
            color:"blue",
            children: (<div><div className="font-medium">{a.title}</div>
              <div className="text-xs text-slate-400">{a.time}</div></div>)
          }))}
        />
      </Card>

      <Card className="rounded-2xl" title="Tiến độ nhập điểm" loading={loading}>
        <div className="space-y-3">
          {(progress || []).map(i=>(
            <div key={i.id} className="flex items-center justify-between gap-4">
              <div className="font-medium text-slate-700">{i.label}</div>
              <div className="w-2/3"><Progress percent={i.value} size="small" strokeColor={color(i.state)} /></div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl" title="Lịch tháng" loading={loading}>
        <Calendar fullscreen={false}/>
      </Card>
    </div>
  );
}
