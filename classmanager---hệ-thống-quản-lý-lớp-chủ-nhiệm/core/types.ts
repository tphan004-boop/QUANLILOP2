
export interface ClassInfo {
  id: string;
  className: string;
  schoolYear: string;
  homeroomTeacher: string;
  note?: string;
  // Các trường bổ sung cho "Tab Lớp"
  goals?: string;          // Mục tiêu lớp học (GV điền)
  contactInfo?: string;    // Thông tin liên lạc nội bộ (GV điền)
  parentCouncil?: string;  // Thông tin Ban đại diện (PH điền)
  classSlogan?: string;    // Khẩu hiệu lớp
}

export interface Student {
  id: string;
  classId: string;
  fullName: string;
  dob: string;
  gender: 'Nam' | 'Nữ';
  address: string;
  parentId: string;
  status: 'Đang học' | 'Nghỉ học' | 'Chuyển trường';
  behaviorScore: number;
  // Các trường bổ sung mới
  ethnicity?: string;           // Dân tộc
  parentName?: string;          // Họ tên cha (mẹ)
  phoneNumber?: string;         // Số điện thoại liên lạc
  familyBackground?: string;    // Hoàn cảnh gia đình
  registryNumber?: string;      // Số sổ đăng bộ
  investigationNumber?: string; // Số phiếu điều tra
}

export interface Parent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  relationship: 'Cha' | 'Mẹ' | 'Giám hộ' | string;
  studentId: string;
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string; // ISO string YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  note?: string;
}

export interface Behavior {
  id: string;
  studentId: string;
  date: string;
  type: 'PRAISE' | 'WARN';
  content: string;
  points: number;
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  target: 'parent' | 'student' | 'all';
  pinned: boolean;
  createdAt: string;
  author: string;
}

export interface Task {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // ISO format
  requireReply: boolean;
  createdAt: string;
}

export interface TaskReply {
  id: string;
  taskId: string;
  studentId: string;
  parentId?: string;
  replyText: string;
  attachmentsJson: string; // Stores an array of links as JSON
  createdAt: string;
}

export interface MessageThread {
  id: string;
  threadKey: string; // classId or studentId
  participantsJson: string; // List of roles/IDs
  lastMessageAt: string;
  lastMessageText?: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromRole: 'TEACHER' | 'PARENT' | 'STUDENT';
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Document {
  id: string;
  classId: string;
  title: string;
  url: string;
  category: string; // Vd: Nội quy, Biểu mẫu, Kế hoạch
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'Weekly' | 'Monthly';
  period: string; // e.g. "Week 12", "Oct 2023"
  summary: string;
  generatedAt: string;
}
