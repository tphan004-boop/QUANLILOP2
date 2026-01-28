
import { IDataProvider, WeeklyReportData, MonthlyReportData } from '../core/dataProvider';
import { 
  Student, Parent, Attendance, Behavior, Announcement, 
  Task, TaskReply, Message, MessageThread, Report, ClassInfo, Document 
} from '../core/types';

const STORAGE_KEY = 'CLASS_MANAGER_DATA_V7'; 

interface DB {
  classes: ClassInfo[];
  students: Student[];
  parents: Parent[];
  attendance: Attendance[];
  behaviors: Behavior[];
  announcements: Announcement[];
  tasks: Task[];
  replies: TaskReply[];
  threads: MessageThread[];
  messages: Message[];
  reports: Report[];
  documents: Document[];
}

export class MockProvider implements IDataProvider {
  private db: DB;

  constructor() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      this.db = JSON.parse(data);
    } else {
      this.db = this.seedData();
      this.save();
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  private seedData(): DB {
    return {
      classes: [], // Xóa lớp 12A1 mẫu
      students: [], // Xóa học sinh mẫu
      parents: [],
      attendance: [],
      behaviors: [],
      announcements: [],
      tasks: [],
      replies: [],
      threads: [],
      messages: [],
      reports: [],
      documents: []
    };
  }

  async getClasses() { return this.db.classes; }
  async getClassById(id: string) { return this.db.classes.find(c => c.id === id); }
  async addClass(c: Omit<ClassInfo, 'id'>) {
    const newC = { ...c, id: 'c-' + Math.random().toString(36).substr(2, 5) };
    this.db.classes.push(newC);
    this.save();
    return newC;
  }
  async updateClass(id: string, data: Partial<ClassInfo>) {
    const idx = this.db.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.db.classes[idx] = { ...this.db.classes[idx], ...data };
      this.save();
      return this.db.classes[idx];
    }
    throw new Error("Class not found");
  }
  async removeClass(id: string) {
    this.db.classes = this.db.classes.filter(c => c.id !== id);
    // Xóa các dữ liệu liên quan đến lớp
    this.db.students = this.db.students.filter(s => s.classId !== id);
    this.db.announcements = this.db.announcements.filter(a => a.classId !== id);
    this.db.tasks = this.db.tasks.filter(t => t.classId !== id);
    this.db.documents = this.db.documents.filter(d => d.classId !== id);
    this.save();
  }

  async getStudents(classId?: string) { 
    if (classId) return this.db.students.filter(s => s.classId === classId);
    return this.db.students; 
  }
  async getStudentById(id: string) { return this.db.students.find(s => s.id === id); }
  async addStudent(s: Omit<Student, 'id' | 'behaviorScore'>) {
    const newS: Student = { ...s, id: 's-' + Math.random().toString(36).substr(2, 5), behaviorScore: 100 };
    this.db.students.push(newS);
    this.save();
    return newS;
  }
  async addStudents(students: Omit<Student, 'id' | 'behaviorScore'>[]) {
    const newStudents: Student[] = students.map(s => ({
      ...s,
      id: 's-' + Math.random().toString(36).substr(2, 5),
      behaviorScore: 100
    }));
    this.db.students.push(...newStudents);
    this.save();
    return newStudents;
  }
  async updateStudent(id: string, data: Partial<Student>) {
    const idx = this.db.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.db.students[idx] = { ...this.db.students[idx], ...data };
      this.save();
      return this.db.students[idx];
    }
    throw new Error("Student not found");
  }
  async removeStudent(id: string) {
    this.db.students = this.db.students.filter(s => s.id !== id);
    this.save();
  }

  async getParents() { return this.db.parents; }
  async getParentById(id: string) { return this.db.parents.find(p => p.id === id); }
  async addParent(p: Omit<Parent, 'id'>) {
    const newP = { ...p, id: 'p-' + Math.random().toString(36).substr(2, 5) };
    this.db.parents.push(newP);
    this.save();
    return newP;
  }
  async updateParent(id: string, data: Partial<Parent>) {
    const idx = this.db.parents.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.db.parents[idx] = { ...this.db.parents[idx], ...data };
      this.save();
      return this.db.parents[idx];
    }
    throw new Error("Parent not found");
  }
  async removeParent(id: string) {
    this.db.parents = this.db.parents.filter(p => p.id !== id);
    this.save();
  }

  async markAttendance(classId: string, date: string, items: { studentId: string, status: Attendance['status'], note?: string }[]) {
    this.db.attendance = this.db.attendance.filter(a => !(a.classId === classId && a.date === date));
    const newRecords: Attendance[] = items.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      classId,
      date,
      studentId: item.studentId,
      status: item.status,
      note: item.note
    }));
    this.db.attendance.push(...newRecords);
    this.save();
  }
  async getAttendanceByClassAndDate(classId: string, date: string) {
    return this.db.attendance.filter(a => a.classId === classId && a.date === date);
  }
  async getAttendanceByStudent(studentId: string) {
    return this.db.attendance.filter(a => a.studentId === studentId);
  }

  async getBehaviors(studentId?: string) {
    if (studentId) return this.db.behaviors.filter(b => b.studentId === studentId);
    return this.db.behaviors;
  }
  async addBehavior(b: Omit<Behavior, 'id'>) {
    const newB = { ...b, id: 'bh-' + Math.random().toString(36).substr(2, 5) };
    this.db.behaviors.unshift(newB);
    const sIdx = this.db.students.findIndex(s => s.id === b.studentId);
    if (sIdx !== -1) {
      this.db.students[sIdx].behaviorScore += b.points;
    }
    this.save();
    return newB;
  }
  async updateBehavior(id: string, data: Partial<Behavior>) {
    const idx = this.db.behaviors.findIndex(b => b.id === id);
    if (idx !== -1) {
      const oldPoints = this.db.behaviors[idx].points;
      this.db.behaviors[idx] = { ...this.db.behaviors[idx], ...data };
      if (data.points !== undefined) {
        const studentId = this.db.behaviors[idx].studentId;
        const sIdx = this.db.students.findIndex(s => s.id === studentId);
        if (sIdx !== -1) {
          this.db.students[sIdx].behaviorScore = this.db.students[sIdx].behaviorScore - oldPoints + data.points;
        }
      }
      this.save();
      return this.db.behaviors[idx];
    }
    throw new Error("Behavior not found");
  }
  async removeBehavior(id: string) {
    const b = this.db.behaviors.find(x => x.id === id);
    if (b) {
      const sIdx = this.db.students.findIndex(s => s.id === b.studentId);
      if (sIdx !== -1) {
        this.db.students[sIdx].behaviorScore -= b.points;
      }
    }
    this.db.behaviors = this.db.behaviors.filter(b => b.id !== id);
    this.save();
  }

  async getAnnouncements(classId?: string) { 
    let res = this.db.announcements;
    if (classId) res = res.filter(a => a.classId === classId);
    return [...res].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async addAnnouncement(a: Omit<Announcement, 'id'>) {
    const newA = { ...a, id: 'ann-' + Math.random().toString(36).substr(2, 5) };
    this.db.announcements.unshift(newA);
    this.save();
    return newA;
  }
  async updateAnnouncement(id: string, data: Partial<Announcement>) {
    const idx = this.db.announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.db.announcements[idx] = { ...this.db.announcements[idx], ...data };
      this.save();
      return this.db.announcements[idx];
    }
    throw new Error("Not found");
  }
  async removeAnnouncement(id: string) {
    this.db.announcements = this.db.announcements.filter(a => a.id !== id);
    this.save();
  }

  async getDocuments(classId?: string) { 
    if (classId) return this.db.documents.filter(d => d.classId === classId);
    return this.db.documents; 
  }
  async addDocument(d: Omit<Document, 'id'>) {
    const newD = { ...d, id: 'doc-' + Math.random().toString(36).substr(2, 5) };
    this.db.documents.unshift(newD);
    this.save();
    return newD;
  }
  async updateDocument(id: string, data: Partial<Document>) {
    const idx = this.db.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.db.documents[idx] = { ...this.db.documents[idx], ...data };
      this.save();
      return this.db.documents[idx];
    }
    throw new Error("Not found");
  }
  async removeDocument(id: string) {
    this.db.documents = this.db.documents.filter(d => d.id !== id);
    this.save();
  }

  async getTasks(classId?: string) {
    if (classId) return this.db.tasks.filter(t => t.classId === classId);
    return this.db.tasks;
  }
  async addTask(t: Omit<Task, 'id'>) {
    const newTask = { ...t, id: 'task-' + Math.random().toString(36).substr(2, 5) };
    this.db.tasks.unshift(newTask);
    this.save();
    return newTask;
  }
  async updateTask(id: string, data: Partial<Task>) {
    const idx = this.db.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.db.tasks[idx] = { ...this.db.tasks[idx], ...data };
      this.save();
      return this.db.tasks[idx];
    }
    throw new Error("Task not found");
  }
  async removeTask(id: string) {
    this.db.tasks = this.db.tasks.filter(t => t.id !== id);
    this.db.replies = this.db.replies.filter(r => r.taskId !== id);
    this.save();
  }
  async getTaskReplies(taskId: string) {
    return this.db.replies.filter(r => r.taskId === taskId);
  }
  async replyTask(payload: Omit<TaskReply, 'id' | 'createdAt'>) {
    this.db.replies = this.db.replies.filter(r => !(r.taskId === payload.taskId && r.studentId === payload.studentId));
    const newReply = { ...payload, id: 'r-' + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString() };
    this.db.replies.push(newReply);
    this.save();
    return newReply;
  }

  async getMessageThreads() { return [...this.db.threads].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()); }
  async getMessages(threadId: string) { return this.db.messages.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); }
  async sendMessage(payload: Omit<Message, 'id' | 'createdAt'>) {
    const newMsg = { ...payload, id: 'msg-' + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString() };
    this.db.messages.push(newMsg);
    const tIdx = this.db.threads.findIndex(t => t.id === payload.threadId);
    if (tIdx !== -1) { this.db.threads[tIdx].lastMessageAt = newMsg.createdAt; this.db.threads[tIdx].lastMessageText = newMsg.content; }
    this.save();
    return newMsg;
  }
  async getOrCreateThread(threadKey: string) {
    let thread = this.db.threads.find(t => t.threadKey === threadKey);
    if (!thread) { thread = { id: 'th-' + threadKey, threadKey, participantsJson: JSON.stringify(['TEACHER', 'PARENT']), lastMessageAt: new Date().toISOString() }; this.db.threads.push(thread); this.save(); }
    return thread;
  }

  async reportsWeekly(classId: string, weekStart: string): Promise<WeeklyReportData> {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const classStudents = this.db.students.filter(s => s.classId === classId);
    const studentIds = classStudents.map(s => s.id);
    const periodAttendance = this.db.attendance.filter(a => studentIds.includes(a.studentId) && new Date(a.date) >= start && new Date(a.date) < end);
    const periodBehaviors = this.db.behaviors.filter(b => studentIds.includes(b.studentId) && new Date(b.date) >= start && new Date(b.date) < end);
    const classTasks = this.db.tasks.filter(t => t.classId === classId);
    const absentCount = periodAttendance.filter(a => a.status === 'ABSENT').length;
    const lateCount = periodAttendance.filter(a => a.status === 'LATE').length;
    const totalRecords = periodAttendance.length;
    const attendanceRate = totalRecords > 0 ? ((totalRecords - absentCount) / totalRecords) * 100 : 100;
    const overdueTasks = classTasks.filter(t => new Date(t.dueDate) < new Date() && new Date(t.dueDate) >= start);
    const praiseMap: Record<string, number> = {};
    const warnMap: Record<string, number> = {};
    periodBehaviors.forEach(b => {
      const name = classStudents.find(s => s.id === b.studentId)?.fullName || 'N/A';
      if (b.type === 'PRAISE') praiseMap[name] = (praiseMap[name] || 0) + 1;
      else warnMap[name] = (warnMap[name] || 0) + 1;
    });
    const topPraise = Object.entries(praiseMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 3);
    const topWarn = Object.entries(warnMap).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 3);
    const uniqueRepliedStudents = new Set(this.db.replies.filter(r => studentIds.includes(r.studentId)).map(r => r.studentId));

    return {
      id: 'weekly-' + classId + '-' + weekStart,
      type: 'Weekly',
      period: `Tuần từ ${start.toLocaleDateString()}`,
      summary: `Trong tuần qua, lớp có ${absentCount} lượt vắng and ${lateCount} lượt đi trễ. Tỷ lệ chuyên cần đạt ${attendanceRate.toFixed(1)}%.`,
      generatedAt: new Date().toISOString(),
      attendanceRate,
      absentCount,
      lateCount,
      topPraise,
      topWarn,
      overdueTasksCount: overdueTasks.length,
      repliedParentsCount: uniqueRepliedStudents.size,
      totalStudents: classStudents.length
    };
  }

  async reportsMonthly(classId: string, month: string): Promise<MonthlyReportData> {
    const [year, monthNum] = month.split('-').map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);
    const classStudents = this.db.students.filter(s => s.classId === classId);
    const studentIds = classStudents.map(s => s.id);
    const periodAttendance = this.db.attendance.filter(a => studentIds.includes(a.studentId) && new Date(a.date) >= start && new Date(a.date) < end);
    const periodBehaviors = this.db.behaviors.filter(b => studentIds.includes(b.studentId) && new Date(b.date) >= start && new Date(b.date) < end);
    const absentCount = periodAttendance.filter(a => a.status === 'ABSENT').length;
    const lateCount = periodAttendance.filter(a => a.status === 'LATE').length;
    const totalRecords = periodAttendance.length;
    const attendanceRate = totalRecords > 0 ? ((totalRecords - absentCount) / totalRecords) * 100 : 100;
    const praiseCount = periodBehaviors.filter(b => b.type === 'PRAISE').length;
    const warnCount = periodBehaviors.filter(b => b.type === 'WARN').length;
    const topStudents = classStudents.map(s => ({
      name: s.fullName,
      score: s.behaviorScore
    })).sort((a,b) => b.score - a.score).slice(0, 5);

    return {
      id: 'monthly-' + classId + '-' + month,
      type: 'Monthly',
      period: `Tháng ${monthNum}/${year}`,
      summary: `Tổng kết tháng ${monthNum}, lớp đạt tỷ lệ chuyên cần ${attendanceRate.toFixed(1)}%. Có ${praiseCount} lượt tuyên dương và ${warnCount} lượt nhắc nhở.`,
      generatedAt: new Date().toISOString(),
      attendanceRate,
      absentCount,
      lateCount,
      praiseCount,
      warnCount,
      taskCompletionRate: 85,
      topStudents
    };
  }
}
