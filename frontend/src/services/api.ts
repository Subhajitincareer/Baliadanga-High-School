// Base API configuration
const API_BASE_URL: string = 'http://localhost:5000/api';

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
  role: UserRole;
  employeeId?: string;
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
      throw new Error(data.message || 'API request failed');
    }

    return data as T;
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
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

  // Staff Methods
  async getStaff(): Promise<Staff[]> {
    return this.request<Staff[]>('/staff');
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

  async updateAdmission(id: string, admissionData: Partial<Admission>): Promise<Admission> {
    return this.request<Admission>(`/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(admissionData),
    });
  }

  // Check if email is admin (whitelist)
  async checkAdminWhitelist(email: string): Promise<{ isAdmin: boolean }> {
    return this.request(`/admin/whitelist/${encodeURIComponent(email)}`);
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
  async adminLogin(email: string, password: string) {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export default new ApiService();
