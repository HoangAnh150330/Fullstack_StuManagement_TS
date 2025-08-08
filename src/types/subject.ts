export interface SubjectData {
  _id: string;
  name: string;
  code: string;
  credit: number;
  description?: string;
  startDate: Date;
  endDate: Date;
}