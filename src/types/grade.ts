export type GradeType = "quiz" | "midterm" | "final";

export type GradeRecord = {
  studentId: string;
  score: number;
  note?: string;
};

export type AddGradeItem = {
  studentId: string;
  score: number;
  note?: string;
};
