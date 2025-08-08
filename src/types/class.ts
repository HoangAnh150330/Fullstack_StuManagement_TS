export interface TimeSlot {
  day: string;
  slot: string;
}

export interface classData {
  _id: string;
  name: string;
  subject: string;   
  teacher: string;
  maxStudents: number;
  timeSlots: TimeSlot[]; 
}
