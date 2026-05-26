
export type Role = 'STUDENT' | 'TEACHER' | 'ADMIN'
export type Grade = 'X' | 'XI' | 'XII'
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type QuizType = 'PLACEMENT' | 'PRACTICE' | 'POST_TEST' | 'REMEDIAL'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'
export type AuditStatus = 'PENDING' | 'ACCURATE' | 'NEEDS_IMPROVEMENT' | 'INCORRECT'

export interface ApiResponse<T> {
    success: boolean
    message?: string
    data: T
    total?: number
    errors?: { field: string; message: string }[]
}

export interface User {
    id: string
    email: string
    name: string
    role: Role
    avatar?: string
    phone?: string
    isActive: boolean
    isSuspended?: boolean
    createdAt: string
    student?: StudentProfile
    teacher?: TeacherProfile
}

export interface StudentProfile {
    id: string
    grade: Grade
    totalXP: number
    currentLevel: number
    streakDays: number
}

export interface TeacherProfile {
    id: string
    nip?: string
    schoolId: string
}

export interface AuthResponse {
    user: User
    token: string
}

export interface Chapter {
    id: string
    name: string
    description?: string
    grade: Grade
    order: number
    status: ContentStatus
    createdAt: string
}

export interface Material {
    id: string
    title: string
    content: string
    duration?: string
    videoUrl?: string
    pdfUrl?: string
    chapterId: string
    order: number
    status: ContentStatus
    isSystem: boolean
    createdAt: string
    chapter?: { id: string; name: string; grade: Grade }
    createdBy?: { user: { name: string } } | null
}

export interface Quiz {
    id: string
    title: string
    description?: string
    chapterId: string
    type: QuizType
    timeLimit?: number
    passingScore: number
    order: number
    status: ContentStatus
    isSystem: boolean
    createdAt: string
    chapter?: { name: string; grade: Grade }
    questions?: QuizQuestion[]
    _count?: { questions: number }
}

export interface Question {
    id: string
    text: string
    imageUrl?: string
    difficulty: Difficulty
    explanation?: string
    chapterId?: string
    grade?: Grade
    isSystem: boolean
    rating: number
    usageCount: number
    options: QuestionOption[]
    createdAt: string
    chapter?: { id: string; name: string; grade: Grade } | null
    createdBy?: { user: { name: string } } | null
}

export interface QuestionOption {
    id: string
    questionId: string
    label: string
    text: string
    isCorrect?: boolean // hidden for students
}

export interface QuizQuestion {
    id: string
    quizId: string
    questionId: string
    order: number
    question: Question
}

export interface Classroom {
    id: string
    name: string
    description?: string
    grade: Grade
    joinCode: string
    teacherId: string
    schoolId: string
    academicYear: string
    semester: number
    isActive: boolean
    kkmScore: number
    createdAt: string
    teacher?: { user: { name: string } }
    chapters?: any[]
    _count?: { enrollments: number; chapters: number }
}

export interface MaterialProgress {
    materialId: string
    isCompleted: boolean
    progress: number
    timeSpent: number
    completedAt?: string
}

export interface QuizAttempt {
    id: string
    quizId: string
    score: number
    correctCount: number
    totalQuestions: number
    timeSpent: number
    startedAt: string
    submittedAt?: string
    isPassed: boolean
    quiz?: { title: string; type: QuizType; passingScore: number }
    answers?: QuizAttemptAnswer[]
}

export interface QuizAttemptAnswer {
    questionId: string
    selectedOption: string
    isCorrect: boolean
}

export interface ChatSession {
    id: string
    studentId: string
    title?: string
    chapterId?: string
    createdAt: string
    updatedAt: string
    messages?: ChatMessage[]
    _count?: { messages: number }
}

export interface ChatMessage {
    id: string
    sessionId: string
    role: MessageRole
    content: string
    createdAt: string
}

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    requirement: string
    xpReward: number
    earnedAt?: string
}

export interface StudentDashboard {
    user: { name: string; email: string; avatar?: string }
    stats: {
        totalXP: number
        currentLevel: number
        streakDays: number
        rank: number
        completedMaterials: number
        avgScore: number
    }
    recentAttempts: Array<{
        score: number
        isPassed: boolean
        submittedAt: string
        quiz: { title: string }
    }>
    recentBadges: Array<Badge>
}

export interface MonitoringOverview {
    totalClasses: number
    totalStudents: number
    totalAttempts: number
    avgScore: number
    passRate: number
    strugglingCount: number
    classes: Array<{ id: string; name: string; grade: Grade; studentCount: number }>
}

export interface StudentSummary {
    id: string
    name: string
    email: string
    avatar?: string
    grade: Grade
    totalXP: number
    currentLevel: number
    streakDays: number
    avgScore: number
    passRate: number
    totalAttempts: number
    completedMaterials: number
    status: 'struggling' | 'average' | 'good'
}

export interface StudentDetail extends StudentProfile {
    user: {
        name: string
        email: string
        avatar?: string
        createdAt: string
    }
    materialProgress: Array<MaterialProgress & {
        material: {
            title: string
            chapterId: string
            duration?: string
        }
    }>
    quizAttempts: Array<QuizAttempt & {
        quiz: {
            title: string
            type: QuizType
            passingScore: number
        }
    }>
    badges: Array<{
        id: string
        badge: Badge
        earnedAt: string
    }>
    stats: {
        avgScore: number
        totalAttempts: number
        passedAttempts: number
        completedMaterials: number
    }
}