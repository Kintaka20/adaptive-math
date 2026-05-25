import { ApiResponse } from './types'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const getToken = (): string | null => localStorage.getItem('auth_token')
export const setToken = (token: string) => localStorage.setItem('auth_token', token)
export const removeToken = () => localStorage.removeItem('auth_token')

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    auth?: boolean // default: true
}

export class ApiError extends Error {
    status: number
    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = true } = options

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (auth) {
        const token = getToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })

    const json = (await response.json()) as ApiResponse<T>

    if (!response.ok || !json.success) {
        if (response.status === 401) {
            removeToken()
            window.location.href = '/login'
        }
        throw new ApiError(json.message || 'Terjadi kesalahan', response.status)
    }

    return json.data
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

    publicPost: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body, auth: false }),
    publicGet: <T>(path: string) => request<T>(path, { method: 'GET', auth: false }),
}

export const authApi = {
    login: (email: string, password: string) =>
        api.publicPost<{ user: import('./types').User; token: string }>('/auth/login', { email, password }),

    register: (data: {
        name: string
        email: string
        password: string
        role: 'STUDENT' | 'TEACHER'
        schoolId?: string
        grade?: string
        nip?: string
    }) => api.publicPost<{ user: import('./types').User; token: string }>('/auth/register', data),

    me: () => api.get<import('./types').User>('/auth/me'),

    logout: () => api.post<void>('/auth/logout', {}),

    forgotPassword: (email: string) => api.publicPost<void>('/auth/forgot-password', { email }),

    resetPassword: (token: string, password: string) =>
        api.publicPost<void>('/auth/reset-password', { token, password }),

    schools: () => api.publicGet<{ id: string; name: string; city: string; }[]>('/schools'),
}

export const studentApi = {
    dashboard: () => api.get<import('./types').StudentDashboard>('/students/dashboard'),
    learningPath: (classId?: string) => {
        const q = classId ? `?classId=${classId}` : ''
        return api.get<unknown[]>(`/students/learning-path${q}`)
    },
    ranking: (limit = 20) => api.get<unknown[]>(`/students/ranking?limit=${limit}`),
    profile: () => api.get<import('./types').User>('/students/profile'),
    updateProfile: (data: { name?: string; phone?: string; avatar?: string; schoolId?: string }) => api.put('/students/profile', data),
    badges: () => api.get<{ earned: import('./types').Badge[]; locked: import('./types').Badge[] }>('/students/badges'),
}

export const teacherApi = {
    profile: () => api.get<unknown>('/teachers/profile'),
    updateProfile: (data: { name?: string; phone?: string; avatar?: string; nip?: string; schoolId?: string }) =>
        api.put<unknown>('/teachers/profile', data),
}

export const materialApi = {
    list: (params?: { chapterId?: string; status?: string }) => {
        const q = new URLSearchParams(params as Record<string, string>).toString()
        return api.get<import('./types').Material[]>(`/materials${q ? `?${q}` : ''}`)
    },
    get: (id: string) => api.get<import('./types').Material>(`/materials/${id}`),
    create: (data: unknown) => api.post<import('./types').Material>('/materials', data),
    update: (id: string, data: unknown) => api.put<import('./types').Material>(`/materials/${id}`, data),
    delete: (id: string) => api.delete<void>(`/materials/${id}`),
    updateProgress: (id: string, data: { progress: number; timeSpent: number; isCompleted?: boolean }) =>
        api.post(`/materials/${id}/progress`, data),
}

export const quizApi = {
    list: (params?: { chapterId?: string; status?: string }) => {
        const q = new URLSearchParams(params as Record<string, string>).toString()
        return api.get<import('./types').Quiz[]>(`/quizzes${q ? `?${q}` : ''}`)
    },
    get: (id: string) => api.get<import('./types').Quiz>(`/quizzes/${id}`),
    create: (data: unknown) => api.post<import('./types').Quiz>('/quizzes', data),
    update: (id: string, data: unknown) => api.put<import('./types').Quiz>(`/quizzes/${id}`, data),
    delete: (id: string) => api.delete<void>(`/quizzes/${id}`),
    start: (id: string) => api.post<import('./types').QuizAttempt>(`/quizzes/${id}/start`, {}),
    submit: (id: string, data: { timeSpent: number; answers: { questionId: string; selectedOption: string; timeSpent?: number }[] }) =>
        api.post<import('./types').QuizAttempt>(`/quizzes/${id}/submit`, data),
    getResult: (attemptId: string) => api.get<import('./types').QuizAttempt>(`/quizzes/attempts/${attemptId}`),
    myAttempts: (quizId?: string) => {
        const q = quizId ? `?quizId=${quizId}` : ''
        return api.get<import('./types').QuizAttempt[]>(`/quizzes/attempts${q}`)
    },
    getRemedial: (quizId: string) => api.get<unknown>(`/quizzes/${quizId}/remedial`),
}

export const questionApi = {
    list: (params?: { chapterId?: string; grade?: string; difficulty?: string; isSystem?: boolean }) => {
        const q = new URLSearchParams(
            Object.fromEntries(Object.entries(params || {}).map(([k, v]) => [k, String(v)]))
        ).toString()
        return api.get<import('./types').Question[]>(`/questions${q ? `?${q}` : ''}`)
    },
    get: (id: string) => api.get<import('./types').Question>(`/questions/${id}`),
    create: (data: unknown) => api.post<import('./types').Question>('/questions', data),
    update: (id: string, data: unknown) => api.put<import('./types').Question>(`/questions/${id}`, data),
    delete: (id: string) => api.delete<void>(`/questions/${id}`),
    importToQuiz: (quizId: string, questionIds: string[]) =>
        api.post<void>('/questions/import', { quizId, questionIds }),
}

export const classApi = {
    list: () => api.get<import('./types').Classroom[]>('/classes'),
    get: (id: string) => api.get<import('./types').Classroom>(`/classes/${id}`),
    create: (data: unknown) => api.post<import('./types').Classroom>('/classes', data),
    update: (id: string, data: unknown) => api.put<import('./types').Classroom>(`/classes/${id}`, data),
    delete: (id: string) => api.delete<void>(`/classes/${id}`),
    join: (joinCode: string) => api.post<void>('/classes/join', { joinCode }),
    students: (id: string) => api.get<unknown[]>(`/classes/${id}/students`),
    assignChapters: (id: string, chapterIds: string[]) => api.post(`/classes/${id}/chapters`, { chapterIds }),
    createCustomChapter: (id: string, data: { name: string; description?: string }) => api.post(`/classes/${id}/custom-chapter`, data),
    deleteChapter: (id: string, chapterId: string) => api.delete(`/classes/${id}/chapters/${chapterId}`),
}

export const monitoringApi = {
    overview: () => api.get<import('./types').MonitoringOverview>('/monitoring/overview'),
    students: (classId?: string) => {
        const q = classId ? `?classId=${classId}` : ''
        return api.get<import('./types').StudentSummary[]>(`/monitoring/students${q}`)
    },
    studentDetail: (id: string, classId?: string) => {
        const q = classId ? `?classId=${classId}` : ''
        return api.get<import('./types').StudentDetail>(`/monitoring/students/${id}${q}`)
    },
    struggle: () => api.get<import('./types').StudentSummary[]>('/monitoring/struggle'),
}

export const auditApi = {
    list: (status?: string) => {
        const q = status ? `?status=${status}` : ''
        return api.get<unknown[]>(`/audit${q}`)
    },
    get: (id: string) => api.get<unknown>(`/audit/${id}`),
    review: (id: string, data: { status: string; feedback?: string }) =>
        api.post(`/audit/${id}/review`, data),
}

export const chatApi = {
    sessions: () => api.get<import('./types').ChatSession[]>('/chat/sessions'),
    createSession: (data?: { title?: string; chapterId?: string }) =>
        api.post<import('./types').ChatSession>('/chat/sessions', data || {}),
    getSession: (id: string) => api.get<import('./types').ChatSession>(`/chat/sessions/${id}`),
    sendMessage: (sessionId: string, content: string) =>
        api.post<{ userMessage: import('./types').ChatMessage; aiMessage: import('./types').ChatMessage }>(
            `/chat/sessions/${sessionId}/messages`,
            { content }
        ),
    evaluateSteps: (sessionId: string, question: string, steps: string[]) =>
        api.post<{ userMessage: import('./types').ChatMessage; aiMessage: import('./types').ChatMessage }>(
            `/chat/sessions/${sessionId}/evaluate-steps`,
            { question, steps }
        ),
    deleteSession: (id: string) => api.delete<void>(`/chat/sessions/${id}`),
}

export const notificationApi = {
    list: () => api.get<any[]>('/notifications'),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`, {}),
    markAllAsRead: () => api.put('/notifications/read-all', {}),
}

export const adminApi = {
    dashboard: () => api.get<unknown>('/admin/dashboard'),
    users: (params?: { role?: string; search?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams(
            Object.fromEntries(Object.entries(params || {}).map(([k, v]) => [k, String(v)]))
        ).toString()
        return api.get<unknown[]>(`/admin/users${q ? `?${q}` : ''}`)
    },
    updateUser: (id: string, data: unknown) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    schools: () => api.get<unknown[]>('/admin/schools'),
    getSchool: (id: string) => api.get<unknown>(`/admin/schools/${id}`),
    createSchool: (data: unknown) => api.post('/admin/schools', data),
    updateSchool: (id: string, data: unknown) => api.put(`/admin/schools/${id}`, data),
    deleteSchool: (id: string) => api.delete(`/admin/schools/${id}`),
    classes: () => api.get<unknown[]>('/admin/classes'),
    deleteClass: (id: string) => api.delete(`/admin/classes/${id}`),
    chapters: (grade?: string) => api.get<import('./types').Chapter[]>(`/admin/chapters${grade ? `?grade=${grade}` : ''}`),
    createChapter: (data: unknown) => api.post('/admin/chapters', data),
    updateChapter: (id: string, data: unknown) => api.put(`/admin/chapters/${id}`, data),
    deleteChapter: (id: string) => api.delete(`/admin/chapters/${id}`),
    apiLogs: (limit = 50) => api.get<unknown[]>(`/admin/api-logs?limit=${limit}`),
}
