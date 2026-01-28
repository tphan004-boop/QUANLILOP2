
import { 
  Student, Parent, Attendance, Behavior, Announcement, 
  Task, TaskReply, Message, MessageThread, Report, ClassInfo, Document 
} from './types';

export interface WeeklyReportData extends Report {
  attendanceRate: number;
  absentCount: number;
  lateCount: number;
  topPraise: { name: string, count: number }[];
  topWarn: { name: string, count: number }[];
  overdueTasksCount: number;
  repliedParentsCount: number;
  totalStudents: number;
}

export interface MonthlyReportData extends Report {
  attendanceRate: number;
  absentCount: number;
  lateCount: number;
  praiseCount: number;
  warnCount: number;
  taskCompletionRate: number;
  topStudents: { name: string, score: number }[];
}

export interface IDataProvider {
  // Classes
  getClasses(): Promise<ClassInfo[]>;
  getClassById(id: string): Promise<ClassInfo | undefined>;
  addClass(cls: Omit<ClassInfo, 'id'>): Promise<ClassInfo>;
  updateClass(id: string, data: Partial<ClassInfo>): Promise<ClassInfo>;
  removeClass(id: string): Promise<void>;

  // Students
  getStudents(classId?: string): Promise<Student[]>;
  getStudentById(id: string): Promise<Student | undefined>;
  addStudent(student: Omit<Student, 'id' | 'behaviorScore'>): Promise<Student>;
  addStudents(students: Omit<Student, 'id' | 'behaviorScore'>[]): Promise<Student[]>;
  updateStudent(id: string, data: Partial<Student>): Promise<Student>;
  removeStudent(id: string): Promise<void>;

  // Parents
  getParents(): Promise<Parent[]>;
  getParentById(id: string): Promise<Parent | undefined>;
  addParent(parent: Omit<Parent, 'id'>): Promise<Parent>;
  updateParent(id: string, data: Partial<Parent>): Promise<Parent>;
  removeParent(id: string): Promise<void>;
  
  // Attendance
  markAttendance(classId: string, date: string, items: { studentId: string, status: Attendance['status'], note?: string }[]): Promise<void>;
  getAttendanceByClassAndDate(classId: string, date: string): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;

  // Behavior
  getBehaviors(studentId?: string): Promise<Behavior[]>;
  addBehavior(data: Omit<Behavior, 'id'>): Promise<Behavior>;
  updateBehavior(id: string, data: Partial<Behavior>): Promise<Behavior>;
  removeBehavior(id: string): Promise<void>;

  // Announcements
  getAnnouncements(classId?: string): Promise<Announcement[]>;
  addAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement>;
  updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement>;
  removeAnnouncement(id: string): Promise<void>;

  // Documents
  getDocuments(classId?: string): Promise<Document[]>;
  addDocument(doc: Omit<Document, 'id'>): Promise<Document>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document>;
  removeDocument(id: string): Promise<void>;

  // Tasks
  getTasks(classId?: string): Promise<Task[]>;
  addTask(task: Omit<Task, 'id'>): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;
  removeTask(id: string): Promise<void>;
  getTaskReplies(taskId: string): Promise<TaskReply[]>;
  replyTask(payload: Omit<TaskReply, 'id' | 'createdAt'>): Promise<TaskReply>;

  // Messages
  getMessageThreads(): Promise<MessageThread[]>;
  getMessages(threadId: string): Promise<Message[]>;
  sendMessage(payload: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;
  getOrCreateThread(threadKey: string): Promise<MessageThread>;
  
  // Reports
  reportsWeekly(classId: string, weekStart: string): Promise<WeeklyReportData>;
  reportsMonthly(classId: string, month: string): Promise<MonthlyReportData>;
}
