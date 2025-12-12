// Base API configuration
const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request Options Interface
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Types and Enums
export type Gender = 'Male' | 'Female' | 'Other';
export type AdmissionStatus = 'Pending' | 'Approved' | 'Rejected';
export type ExamType = 'Unit Test' | 'Mid Term' | 'Final Exam' | 'Annual' | 'Monthly Test';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Audience = 'All' | 'Students' | 'Staff' | 'Parents';
export type Category = 'General' | 'Academic' | 'Event' | 'Holiday' | 'Emergency' | 'Sports';
export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
export type UserRole = 'admin' | 'teacher' | 'student' | 'principal';

// Core Interfaces
export interface User {
  _id: string;
  email: string;
  fullName: string;
  name?: string; // Backend often returns 'name' instead of fullName
  role: UserRole;
  employeeId?: string;
  permissions?: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  success?: boolean;
}

// Student Profile Interface (Fixed the missing interface issue)
export interface StudentProfile {
  _id: string;
  studentId: string;
  fullName: string;
  rollNumber: string;
  class: string;
  section: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Admission Interface
export interface Admission {
  _id?: string;
  studentName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  guardianName: string;
  guardianPhone: string;
  previousSchool?: string;
  class: string;
  status?: AdmissionStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Announcement Interface
export interface Announcement {
  _id?: string;
  title: string;
  content: string;
  category: Category;
  targetAudience: Audience;
  priority?: Priority;
  authorId: string;
  authorName: string;
  publishDate?: string;
  isActive?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimetype: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// Subject Interface
export interface Subject {
  subjectName: string;
  subjectCode: string;
  fullMarks: number;
  obtainedMarks: number;
  grade?: Grade;
  remarks?: string;
}

// Student Result Interface
export interface StudentResult {
  _id?: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  examType: ExamType;
  academicYear: string;
  subjects: Subject[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: Grade;
  rank?: number;
  publishDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

// Staff Interface
export interface Staff {
  _id?: string;
  employeeId: string;
  fullName: string;
  email: string;
  position: 'Teacher' | 'Admin' | 'Principal' | 'Vice Principal' | 'Coordinator';
  department: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Notification Interface
export interface Notification {
  _id?: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: Audience;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Resource Interface
export interface Resource {
  _id: string;
  title: string;
  description: string;
  type: 'policy' | 'form' | 'other';
  filePath: string;
  fileName: string;
  fileSize?: number;
  createdAt?: string;
}

// Calendar Event Interface
export interface CalendarEvent {
  _id?: string;
  title: string;
  date: string | Date;
  type: 'HOLIDAY' | 'EXAM' | 'ACTIVITY' | 'MEETING' | 'TERM';
  description?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Service Class
export interface Routine {
  _id: string;
  className: string;
  section: string;
  weekSchedule: {
    day: string;
    periods: {
      startTime: string;
      endTime: string;
      subject: string;
      teacher: string;
      roomNo?: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || (data as any).error || 'API request failed');
    }

    return data as T;
  }

  // Authentication Methods
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const payload = identifier.includes('@')
      ? { email: identifier, password }
      : { studentId: identifier, password };

    // Backend returns flat object: { token, _id, name, email, role, ... } inside 'data'
    const response = await this.request<{ success: boolean; data: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const { token, ...userData } = response.data;

    // Transform to expected LoginResponse format
    return {
      token,
      user: userData as User
    };
  }

  async register(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    return this.request<ApiResponse>('/auth/logout', { method: 'POST' });
  }

  // Admission Methods
  async getAdmissions(): Promise<Admission[]> {
    return this.request<Admission[]>('/admissions');
  }

  async getAdmissionByAccessCode(accessCode: string): Promise<any> {
    return this.request<any>(`/admissions/status/${accessCode}`);
  }

  async createAdmission(admissionData: Admission): Promise<Admission> {
    return this.request<Admission>('/admissions', {
      method: 'POST',
      body: JSON.stringify(admissionData),
    });
  }

  async updateAdmissionStatus(id: string, status: AdmissionStatus): Promise<Admission> {
    return this.request<Admission>(`/admissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteAdmission(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/admissions/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAdmission(id: string, admissionData: Partial<Admission>): Promise<Admission> {
    return this.request<Admission>(`/admissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(admissionData),
    });
  }

  // Staff Methods
  async getStaff(): Promise<Staff[]> {
    const response = await this.request<{ success: boolean; data: Staff[] }>('/staff');
    return response.data;
  }

  async getPublicStaffDirectory(): Promise<Staff[]> {
    const response = await this.request<{ success: boolean; data: Staff[] }>('/staff/directory');
    return response.data;
  }

  async createStaff(staffData: Staff): Promise<Staff> {
    return this.request<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  }

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    return this.request<Staff>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  }

  async deleteStaff(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Staff Self-Service
  async getMyStaffProfile(): Promise<Staff> {
    const response = await this.request<{ success: boolean; data: Staff }>('/staff/profile');
    return response.data;
  }

  async updateMyStaffProfile(staffData: Partial<Staff>): Promise<Staff> {
    const response = await this.request<{ success: boolean; data: Staff }>('/staff/profile', {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
    return response.data;
  }

  // Announcement Methods
  async getAnnouncements(): Promise<Announcement[]> {
    return this.request<Announcement[]>('/announcements');
  }

  async createAnnouncement(announcementData: Announcement): Promise<Announcement> {
    return this.request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  }

  async updateAnnouncement(id: string, announcementData: Partial<Announcement>): Promise<Announcement> {
    return this.request<Announcement>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  }

  async deleteAnnouncement(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  // Student Methods
  async getStudentProfile(userId: string): Promise<StudentProfile> {
    return this.request<StudentProfile>(`/students/profile/${userId}`);
  }

  async updateStudentProfile(userId: string, profileData: Partial<StudentProfile>): Promise<StudentProfile> {
    return this.request<StudentProfile>(`/students/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Student Results Methods
  async getStudentResults(studentId: string): Promise<StudentResult[]> {
    return this.request<StudentResult[]>(`/student-results/student/${studentId}`);
  }

  async createStudentResult(resultData: StudentResult): Promise<StudentResult> {
    return this.request<StudentResult>('/student-results', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }

  async updateStudentResult(id: string, resultData: Partial<StudentResult>): Promise<StudentResult> {
    return this.request<StudentResult>(`/student-results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resultData),
    });
  }

  async deleteStudentResult(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/student-results/${id}`, {
      method: 'DELETE',
    });
  }

  // Notification Methods
  async getNotifications(studentId: string): Promise<Notification[]> {
    return this.request<Notification[]>(`/notifications/student/${studentId}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(studentId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/notifications/student/${studentId}/read-all`, {
      method: 'PATCH',
    });
  }

  // Utility Methods
  async uploadFile(file: File, folder?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }

    return this.request<{ url: string; filename: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  // Check if email is admin (whitelist)
  async checkAdminWhitelist(email: string): Promise<{ isAdmin: boolean }> {
    return this.request(`/admin/whitelist/${encodeURIComponent(email)}?_t=${Date.now()}`);
  }

  // Admin Permission Management
  async updateUserPermissions(userId: string, permissions: string[]): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/admin/permissions/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    return response.data;
  }

  // Resource Methods
  async getResources(): Promise<{ success: boolean; data: Resource[] }> {
    return this.request<{ success: boolean; data: Resource[] }>('/resources');
  }

  async createResource(formData: FormData): Promise<{ success: boolean; data: Resource }> {
    const url = `${API_BASE_URL}/resources`;
    const token = localStorage.getItem('token');

    // Manual fetch to handle FormData properly (no Content-Type header)
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  }

  async deleteResource(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/resources/${id}`, {
      method: 'DELETE'
    });
  }

  // Calendar Methods
  async getEvents(): Promise<CalendarEvent[]> {
    return this.request<CalendarEvent[]>('/calendar');
  }

  async createEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/calendar/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin login (returns token & user)
  async adminLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<{ success: boolean; token: string; user: User; message?: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response as unknown as LoginResponse; // Casting to match interface
  }

  async updatePassword(passwordData: any): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Exam & Result Methods
  async getExams(filters?: any): Promise<any[]> {
    // Construct query string if filters exist
    const response = await this.request<{ success: boolean; data: any[] }>('/exams');
    return response.data;
  }

  async getStudents(): Promise<User[]> {
    const response = await this.request<{ success: boolean; data: User[] }>('/admin/students');
    return response.data;
  }

  async createExam(examData: any): Promise<any> {
    return this.request<any>('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateMarks(data: { studentId: string; examId: string; marks: any }): Promise<any> {
    return this.request<any>('/results/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExamResults(examId: string): Promise<any[]> {
    return this.request<any[]>(`/results/exam/${examId}`);
  }

  async publishResult(examId: string): Promise<any> {
    return this.request<any>(`/results/publish/${examId}`, {
      method: 'POST'
    });
  }
  // Routine Methods
  async getRoutines(className?: string, section?: string): Promise<Routine[]> {
    const query = new URLSearchParams();
    if (className) query.append('className', className);
    if (section) query.append('section', section);
    const response = await this.request<{ success: boolean; data: Routine[] }>(`/routines?${query.toString()}`);
    return response.data;
  }

  async saveRoutine(data: Partial<Routine>): Promise<Routine> {
    const response = await this.request<{ success: boolean; data: Routine }>('/routines', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  async deleteRoutine(id: string): Promise<any> {
    return this.request<{}>(`/routines/${id}`, {
      method: 'DELETE',
    });
  }

  async getTeacherRoutine(teacherName: string): Promise<Routine[]> {
    const response = await this.request<{ success: boolean; data: Routine[] }>(`/routines/teacher/${encodeURIComponent(teacherName)}`);
    return response.data;
  }

  // Student Bulk Import
  async bulkImportStudents(students: any[]): Promise<{ message: string; results: any }> {
    return this.request<{ message: string; results: any }>('/students/bulk', {
      method: 'POST',
      body: JSON.stringify(students)
    });
  }
  // Attendance Methods
  async markAttendance(data: any): Promise<any> {
    return this.request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getClassAttendance(className: string, section?: string, date?: string): Promise<any[]> {
    const query = new URLSearchParams();
    query.append('className', className);
    if (section) query.append('section', section);
    if (date) query.append('date', date);

    return this.request<any[]>(`/attendance/class?${query.toString()}`);
  }

  async getStudentAttendance(studentId: string): Promise<any[]> {
    return this.request<any[]>(`/attendance/student/${studentId}`);
  }

  // Mid-Day Meal Methods
  async markMidDayMeal(data: any): Promise<any> {
    return this.request<any>('/mid-day-meal', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMealReport(date: string, className?: string): Promise<any[]> {
    const query = new URLSearchParams();
    if (date) query.append('date', date);
    if (className) query.append('class', className);
    return this.request<any[]>(`/mid-day-meal?${query.toString()}`);
  }
}

export default new ApiService();
