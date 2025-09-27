export type Announcement = {
  _id: string;
  classId: { _id: string; name: string }; // BE trả về object có id + name
  title: string;
  creatorId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};
