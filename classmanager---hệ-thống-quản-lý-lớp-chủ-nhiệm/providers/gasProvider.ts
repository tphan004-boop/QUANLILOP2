
import { IDataProvider, WeeklyReportData, MonthlyReportData } from '../core/dataProvider';
import { 
  Student, Parent, Attendance, Behavior, Announcement, 
  Task, TaskReply, Message, MessageThread, ClassInfo, Document 
} from '../core/types';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzv_xCm8amu1aBLP4rwKjEf6X6yB4AFPlNWluTDK2WdzkwG7qZn0y97JvMCDzYbpQhjsQ/exec";

export class GasProvider implements IDataProvider {
  private async callApi(action: string, payload: any = {}) {
    try {
      // Sử dụng text/plain để tránh CORS pre-flight (OPTIONS request) 
      // vì Google Apps Script không hỗ trợ tốt OPTIONS. 
      // Backend GAS vẫn có thể parse JSON từ postData.contents.
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify({ action, payload }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "API Error");
      return result.data;
    } catch (error) {
      console.error(`GAS API Error [${action}]:`, error);
      // Thông báo lỗi thân thiện hơn cho người dùng nếu cần
      throw error;
    }
  }

  // Classes
  async getClasses() { return this.callApi('classes.getAll'); }
  async getClassById(id: string) { return this.callApi('classes.getById', { id }); }
  async addClass(cls: Omit<ClassInfo, 'id'>) { return this.callApi('classes.add', cls); }
  async updateClass(id: string, data: Partial<ClassInfo>) { return this.callApi('classes.update', { id, ...data }); }
  async removeClass(id: string) { return this.callApi('classes.delete', { id }); }

  // Students
  async getStudents(classId?: string) { 
    const all: Student[] = await this.callApi('students.getAll');
    if (classId) return all.filter(s => s.classId === classId);
    return all;
  }
  async getStudentById(id: string) { return this.callApi('students.getById', { id }); }
  async addStudent(student: Omit<Student, 'id' | 'behaviorScore'>) { return this.callApi('students.add', student); }
  async addStudents(students: Omit<Student, 'id' | 'behaviorScore'>[]) {
    const results = [];
    for (const s of students) {
      results.push(await this.callApi('students.add', s));
    }
    return results;
  }
  async updateStudent(id: string, data: Partial<Student>) { return this.callApi('students.update', { id, ...data }); }
  async removeStudent(id: string) { return this.callApi('students.delete', { id }); }

  // Parents
  async getParents() { return this.callApi('parents.getAll'); }
  async getParentById(id: string) { return this.callApi('parents.getById', { id }); }
  async addParent(parent: Omit<Parent, 'id'>) { return this.callApi('parents.add', parent); }
  async updateParent(id: string, data: Partial<Parent>) { return this.callApi('parents.update', { id, ...data }); }
  async removeParent(id: string) { return this.callApi('parents.delete', { id }); }

  // Attendance
  async markAttendance(classId: string, date: string, items: { studentId: string, status: Attendance['status'], note?: string }[]) {
    return this.callApi('attendance.mark', { classId, date, items });
  }
  async getAttendanceByClassAndDate(classId: string, date: string) {
    const all: Attendance[] = await this.callApi('attendance.getAll');
    return all.filter(a => a.classId === classId && a.date === date);
  }
  async getAttendanceByStudent(studentId: string) {
    const all: Attendance[] = await this.callApi('attendance.getAll');
    return all.filter(a => a.studentId === studentId);
  }

  // Behavior
  async getBehaviors(studentId?: string) {
    const all: Behavior[] = await this.callApi('behavior.getAll');
    if (studentId) return all.filter(b => b.studentId === studentId);
    return all;
  }
  async addBehavior(data: Omit<Behavior, 'id'>) { return this.callApi('behavior.add', data); }
  async updateBehavior(id: string, data: Partial<Behavior>) { return this.callApi('behavior.update', { id, ...data }); }
  async removeBehavior(id: string) { return this.callApi('behavior.delete', { id }); }

  // Announcements
  async getAnnouncements(classId?: string) {
    const all: Announcement[] = await this.callApi('announcements.getAll');
    let res = all;
    if (classId) res = res.filter(a => a.classId === classId);
    return res.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async addAnnouncement(announcement: Omit<Announcement, 'id'>) { return this.callApi('announcements.add', announcement); }
  async updateAnnouncement(id: string, data: Partial<Announcement>) { return this.callApi('announcements.update', { id, ...data }); }
  async removeAnnouncement(id: string) { return this.callApi('announcements.delete', { id }); }

  // Documents
  async getDocuments(classId?: string) {
    const all: Document[] = await this.callApi('documents.getAll');
    if (classId) return all.filter(d => d.classId === classId);
    return all;
  }
  async addDocument(doc: Omit<Document, 'id'>) { return this.callApi('documents.add', doc); }
  async updateDocument(id: string, data: Partial<Document>) { return this.callApi('documents.update', { id, ...data }); }
  async removeDocument(id: string) { return this.callApi('documents.delete', { id }); }

  // Tasks
  async getTasks(classId?: string) {
    const all: Task[] = await this.callApi('tasks.getAll');
    if (classId) return all.filter(t => t.classId === classId);
    return all;
  }
  async addTask(task: Omit<Task, 'id'>) { return this.callApi('tasks.add', task); }
  async updateTask(id: string, data: Partial<Task>) { return this.callApi('tasks.update', { id, ...data }); }
  async removeTask(id: string) { return this.callApi('tasks.delete', { id }); }
  async getTaskReplies(taskId: string) {
    const all: TaskReply[] = await this.callApi('taskReplies.getAll');
    return all.filter(r => r.taskId === taskId);
  }
  async replyTask(payload: Omit<TaskReply, 'id' | 'createdAt'>) {
    return this.callApi('taskReplies.add', { ...payload, createdAt: new Date().toISOString() });
  }

  // Messages
  async getMessageThreads() { return this.callApi('messages.getAll'); }
  async getMessages(threadId: string) {
    const all: Message[] = await this.callApi('messages.getAll');
    return all.filter(m => m.threadId === threadId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  async sendMessage(payload: Omit<Message, 'id' | 'createdAt'>) {
    return this.callApi('messages.add', { ...payload, createdAt: new Date().toISOString() });
  }
  async getOrCreateThread(threadKey: string) {
    return { id: 'th-' + threadKey, threadKey, participantsJson: "[]", lastMessageAt: new Date().toISOString() };
  }

  // Reports
  async reportsWeekly(classId: string, weekStart: string): Promise<WeeklyReportData> {
    return this.callApi('reports.weeklySummary', { classId, weekStart });
  }
  async reportsMonthly(classId: string, month: string): Promise<MonthlyReportData> {
    return this.callApi('reports.monthlySummary', { classId, month });
  }
}
