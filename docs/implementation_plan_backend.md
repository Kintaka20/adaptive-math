# Backend Implementation Plan - Adaptive Learning Matematika SMA

---

## Database Schema Diagram (ERD)

```mermaid
erDiagram
    %% ==================== USERS & AUTH ====================
    User ||--o| Student : "has"
    User ||--o| Teacher : "has"
    User ||--o| Admin : "has"
    User ||--o{ Notification : "receives"
    
    User {
        string id PK
        string email UK
        string password
        enum role "STUDENT|TEACHER|ADMIN"
        string name
        string avatar
        string phone
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    Student {
        string id PK
        string userId FK
        string schoolId FK
        enum grade "X|XI|XII"
        string joinCode
        int currentLevel
        int totalXP
        int streakDays
        datetime lastActiveAt
    }
    
    Teacher {
        string id PK
        string userId FK
        string schoolId FK
        string nip
    }
    
    Admin {
        string id PK
        string userId FK
    }
    
    School {
        string id PK
        string name
        string address
        string city
        string province
        enum type "NEGERI|SWASTA"
        boolean isActive
        datetime createdAt
    }
    
    School ||--o{ Student : "has"
    School ||--o{ Teacher : "has"
    School ||--o{ Classroom : "has"
    
    %% ==================== CURRICULUM ====================
    Chapter {
        string id PK
        string name
        string description
        enum grade "X|XI|XII"
        int order
        enum status "DRAFT|PUBLISHED|ARCHIVED"
        datetime createdAt
        datetime updatedAt
    }
    
    Material {
        string id PK
        string title
        text content
        string duration
        string videoUrl
        string pdfUrl
        string chapterId FK
        int order
        enum status
        boolean isSystem
        string createdById FK
        datetime createdAt
    }
    
    Quiz {
        string id PK
        string title
        string description
        string chapterId FK
        enum type "PLACEMENT|PRACTICE|POST_TEST|REMEDIAL"
        int timeLimit
        int passingScore
        int order
        enum status
        boolean isSystem
        datetime createdAt
    }
    
    Chapter ||--o{ Material : "contains"
    Chapter ||--o{ Quiz : "contains"
    Chapter ||--o{ ClassroomChapter : "assigned to"
    Teacher ||--o{ Material : "creates"
    
    %% ==================== QUESTIONS ====================
    Question {
        string id PK
        text text
        string imageUrl
        enum difficulty "EASY|MEDIUM|HARD"
        text explanation
        string chapterId FK
        enum grade
        boolean isSystem
        float rating
        int usageCount
        string createdById FK
        datetime createdAt
    }
    
    QuestionOption {
        string id PK
        string questionId FK
        string label "A|B|C|D|E"
        string text
        boolean isCorrect
    }
    
    QuizQuestion {
        string id PK
        string quizId FK
        string questionId FK
        int order
    }
    
    Question ||--o{ QuestionOption : "has"
    Question ||--o{ QuizQuestion : "used in"
    Quiz ||--o{ QuizQuestion : "contains"
    Teacher ||--o{ Question : "creates"
    
    %% ==================== CLASS MANAGEMENT ====================
    Classroom {
        string id PK
        string name
        string description
        enum grade
        string joinCode UK
        string teacherId FK
        string schoolId FK
        string academicYear
        int semester
        boolean isActive
        int kkmScore
        datetime createdAt
    }
    
    ClassroomEnrollment {
        string id PK
        string classroomId FK
        string studentId FK
        datetime joinedAt
        boolean isActive
    }
    
    ClassroomChapter {
        string id PK
        string classroomId FK
        string chapterId FK
        int order
        boolean isLocked
    }
    
    Teacher ||--o{ Classroom : "teaches"
    Classroom ||--o{ ClassroomEnrollment : "has"
    Classroom ||--o{ ClassroomChapter : "has"
    Student ||--o{ ClassroomEnrollment : "enrolled in"
    
    %% ==================== PROGRESS & ATTEMPTS ====================
    MaterialProgress {
        string id PK
        string studentId FK
        string materialId FK
        boolean isCompleted
        int progress
        int timeSpent
        datetime completedAt
    }
    
    QuizAttempt {
        string id PK
        string studentId FK
        string quizId FK
        float score
        int correctCount
        int totalQuestions
        int timeSpent
        datetime startedAt
        datetime submittedAt
        boolean isPassed
    }
    
    QuizAttemptAnswer {
        string id PK
        string attemptId FK
        string questionId FK
        string selectedOption
        boolean isCorrect
        int timeSpent
    }
    
    Student ||--o{ MaterialProgress : "has"
    Student ||--o{ QuizAttempt : "attempts"
    Material ||--o{ MaterialProgress : "tracked by"
    Quiz ||--o{ QuizAttempt : "attempted"
    QuizAttempt ||--o{ QuizAttemptAnswer : "contains"
    Question ||--o{ QuizAttemptAnswer : "answered in"
    
    %% ==================== AI & CHAT ====================
    ChatSession {
        string id PK
        string studentId FK
        string title
        string chapterId FK
        datetime createdAt
        datetime updatedAt
    }
    
    ChatMessage {
        string id PK
        string sessionId FK
        enum role "USER|ASSISTANT|SYSTEM"
        text content
        datetime createdAt
        boolean isAudited
    }
    
    AuditLog {
        string id PK
        string messageId FK
        string teacherId FK
        enum status "PENDING|ACCURATE|NEEDS_IMPROVEMENT|INCORRECT"
        string feedback
        datetime auditedAt
        datetime createdAt
    }
    
    Student ||--o{ ChatSession : "has"
    ChatSession ||--o{ ChatMessage : "contains"
    ChatMessage ||--o| AuditLog : "audited by"
    Teacher ||--o{ AuditLog : "reviews"
    
    %% ==================== GAMIFICATION ====================
    Badge {
        string id PK
        string name
        string description
        string icon
        string requirement
        int xpReward
    }
    
    StudentBadge {
        string id PK
        string studentId FK
        string badgeId FK
        datetime earnedAt
    }
    
    Notification {
        string id PK
        string userId FK
        string title
        string message
        enum type "INFO|SUCCESS|WARNING|ERROR|BADGE|REMINDER"
        boolean isRead
        string link
        datetime createdAt
    }
    
    Student ||--o{ StudentBadge : "earns"
    Badge ||--o{ StudentBadge : "awarded to"
```

---

## 1. Technology Stack

| Aspek | Teknologi | Alasan |
|-------|-----------|--------|
| **Runtime** | Node.js 20 LTS | Ecosystem luas, TypeScript support |
| **Framework** | Express.js / Fastify | Lightweight, flexible |
| **Language** | TypeScript | Type safety, consistency dengan frontend |
| **Database** | PostgreSQL | Relational, strong consistency, JSONB untuk flexibility |
| **ORM** | Prisma | Type-safe queries, migrations, introspection |
| **Auth** | JWT + bcrypt | Stateless, scalable |
| **Cache** | Redis | Session, rate limiting, leaderboard |
| **AI** | OpenAI API / Gemini | Adaptive recommendations, AI Tutor |
| **File Storage** | Cloudinary / S3 | Image, PDF, video uploads |
| **Validation** | Zod | Runtime type validation |

---

## 2. Database Schema (Prisma)

### 2.1 Core User Entities

```prisma
// ==================== AUTH & USERS ====================

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String   // bcrypt hashed
  role          Role     @default(STUDENT)
  name          String
  avatar        String?
  phone         String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  student       Student?
  teacher       Teacher?
  admin         Admin?
  notifications Notification[]
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

model Student {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  grade       Grade    @default(X)
  joinCode    String?  // Kode untuk join kelas
  
  // Learning Progress
  currentLevel     Int      @default(1)
  totalXP          Int      @default(0)
  streakDays       Int      @default(0)
  lastActiveAt     DateTime?
  
  // Relations
  enrollments      ClassEnrollment[]
  quizAttempts     QuizAttempt[]
  materialProgress MaterialProgress[]
  chatSessions     ChatSession[]
  badges           StudentBadge[]
}

model Teacher {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  nip         String?  // Nomor Induk Pegawai
  
  // Relations
  classes     Class[]
  questions   Question[]      // Teacher-created questions
  materials   Material[]      // Teacher-created materials
  auditLogs   AuditLog[]      // AI audit logs
}

model Admin {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
}

model School {
  id        String   @id @default(cuid())
  name      String
  address   String?
  city      String?
  province  String?
  type      SchoolType @default(NEGERI)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  // Relations
  students  Student[]
  teachers  Teacher[]
  classes   Class[]
}

enum SchoolType {
  NEGERI
  SWASTA
}

enum Grade {
  X
  XI
  XII
}
```

### 2.2 Curriculum & Content

```prisma
// ==================== CURRICULUM ====================

model Chapter {
  id          String   @id @default(cuid())
  name        String
  description String?
  grade       Grade
  order       Int
  status      ContentStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  materials   Material[]
  quizzes     Quiz[]
  classChapters ClassChapter[]
}

model Material {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text  // Markdown + LaTeX
  duration    String?  // "15 menit"
  videoUrl    String?
  pdfUrl      String?
  chapterId   String
  chapter     Chapter  @relation(fields: [chapterId], references: [id])
  order       Int
  status      ContentStatus @default(DRAFT)
  isSystem    Boolean  @default(false)  // Admin-created
  createdById String?
  createdBy   Teacher? @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  progress    MaterialProgress[]
}

model Quiz {
  id          String   @id @default(cuid())
  title       String
  description String?
  chapterId   String
  chapter     Chapter  @relation(fields: [chapterId], references: [id])
  type        QuizType @default(PRACTICE)
  timeLimit   Int?     // minutes
  passingScore Int     @default(70)
  order       Int
  status      ContentStatus @default(DRAFT)
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  questions   QuizQuestion[]
  attempts    QuizAttempt[]
}

enum QuizType {
  PLACEMENT   // Pre-test
  PRACTICE    // Latihan
  POST_TEST   // Post-test
  REMEDIAL    // Remedial
}

enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 2.3 Questions & Answers

```prisma
// ==================== QUESTIONS ====================

model Question {
  id          String   @id @default(cuid())
  text        String   @db.Text  // Support LaTeX
  imageUrl    String?
  difficulty  Difficulty @default(MEDIUM)
  explanation String?  @db.Text
  chapterId   String?
  grade       Grade?
  isSystem    Boolean  @default(false)
  rating      Float?   @default(0)
  usageCount  Int      @default(0)
  createdById String?
  createdBy   Teacher? @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  options     QuestionOption[]
  quizQuestions QuizQuestion[]
  attemptAnswers QuizAttemptAnswer[]
}

model QuestionOption {
  id          String   @id @default(cuid())
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  label       String   // A, B, C, D, E
  text        String   // Support LaTeX
  isCorrect   Boolean  @default(false)
}

model QuizQuestion {
  id         String   @id @default(cuid())
  quizId     String
  quiz       Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  order      Int
  
  @@unique([quizId, questionId])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

### 2.4 Class Management

```prisma
// ==================== CLASS ====================

model Class {
  id           String   @id @default(cuid())
  name         String
  description  String?
  grade        Grade
  joinCode     String   @unique  // 6-char unique code
  teacherId    String
  teacher      Teacher  @relation(fields: [teacherId], references: [id])
  schoolId     String
  school       School   @relation(fields: [schoolId], references: [id])
  academicYear String   // "2025/2026"
  semester     Int      // 1 atau 2
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  
  // Settings
  kkmScore     Int      @default(70)
  
  // Relations
  enrollments  ClassEnrollment[]
  chapters     ClassChapter[]
}

model ClassEnrollment {
  id         String   @id @default(cuid())
  classId    String
  class      Class    @relation(fields: [classId], references: [id])
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  joinedAt   DateTime @default(now())
  isActive   Boolean  @default(true)
  
  @@unique([classId, studentId])
}

model ClassChapter {
  id         String   @id @default(cuid())
  classId    String
  class      Class    @relation(fields: [classId], references: [id])
  chapterId  String
  chapter    Chapter  @relation(fields: [chapterId], references: [id])
  order      Int
  isLocked   Boolean  @default(false)
  
  @@unique([classId, chapterId])
}
```

### 2.5 Progress & Attempts

```prisma
// ==================== PROGRESS ====================

model MaterialProgress {
  id          String   @id @default(cuid())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])
  materialId  String
  material    Material @relation(fields: [materialId], references: [id])
  isCompleted Boolean  @default(false)
  progress    Int      @default(0)  // 0-100%
  timeSpent   Int      @default(0)  // seconds
  completedAt DateTime?
  
  @@unique([studentId, materialId])
}

model QuizAttempt {
  id          String   @id @default(cuid())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id])
  score       Float    // 0-100
  correctCount Int
  totalQuestions Int
  timeSpent   Int      // seconds
  startedAt   DateTime @default(now())
  submittedAt DateTime?
  isPassed    Boolean  @default(false)
  
  // Relations
  answers     QuizAttemptAnswer[]
}

model QuizAttemptAnswer {
  id          String   @id @default(cuid())
  attemptId   String
  attempt     QuizAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question @relation(fields: [questionId], references: [id])
  selectedOption String  // A, B, C, D, E
  isCorrect   Boolean
  timeSpent   Int      @default(0)  // seconds per question
}
```

### 2.6 AI & Chat

```prisma
// ==================== AI & CHAT ====================

model ChatSession {
  id          String   @id @default(cuid())
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])
  title       String?
  chapterId   String?  // Context bab
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  messages    ChatMessage[]
}

model ChatMessage {
  id          String   @id @default(cuid())
  sessionId   String
  session     ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role        MessageRole
  content     String   @db.Text
  createdAt   DateTime @default(now())
  
  // AI Audit
  isAudited   Boolean  @default(false)
  auditLog    AuditLog?
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

model AuditLog {
  id          String   @id @default(cuid())
  messageId   String   @unique
  message     ChatMessage @relation(fields: [messageId], references: [id])
  teacherId   String
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  status      AuditStatus @default(PENDING)
  feedback    String?
  auditedAt   DateTime?
  createdAt   DateTime @default(now())
}

enum AuditStatus {
  PENDING
  ACCURATE
  NEEDS_IMPROVEMENT
  INCORRECT
}
```

### 2.7 Gamification

```prisma
// ==================== GAMIFICATION ====================

model Badge {
  id          String   @id @default(cuid())
  name        String
  description String
  icon        String   // emoji or icon name
  requirement String   // "complete_5_quizzes"
  xpReward    Int      @default(0)
  
  // Relations
  students    StudentBadge[]
}

model StudentBadge {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  badgeId    String
  badge      Badge    @relation(fields: [badgeId], references: [id])
  earnedAt   DateTime @default(now())
  
  @@unique([studentId, badgeId])
}

model Notification {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  title      String
  message    String
  type       NotificationType
  isRead     Boolean  @default(false)
  link       String?
  createdAt  DateTime @default(now())
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  BADGE
  REMINDER
}
```

---

## 3. API Endpoints

### 3.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### 3.2 Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/dashboard` | Dashboard data |
| GET | `/api/students/learning-path` | Learning path |
| GET | `/api/students/progress` | All progress |
| GET | `/api/students/profile` | Profile |
| PUT | `/api/students/profile` | Update profile |
| GET | `/api/students/ranking` | Leaderboard |
| GET | `/api/students/badges` | Earned badges |

### 3.3 Materials

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | List materials |
| GET | `/api/materials/:id` | Get material |
| POST | `/api/materials` | Create material |
| PUT | `/api/materials/:id` | Update material |
| DELETE | `/api/materials/:id` | Delete material |
| POST | `/api/materials/:id/progress` | Update progress |

### 3.4 Quizzes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes` | List quizzes |
| GET | `/api/quizzes/:id` | Get quiz |
| POST | `/api/quizzes` | Create quiz |
| PUT | `/api/quizzes/:id` | Update quiz |
| DELETE | `/api/quizzes/:id` | Delete quiz |
| POST | `/api/quizzes/:id/start` | Start attempt |
| POST | `/api/quizzes/:id/submit` | Submit attempt |
| GET | `/api/quizzes/:id/result` | Get result |

### 3.5 Questions (Bank Soal)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | List questions |
| GET | `/api/questions/:id` | Get question |
| POST | `/api/questions` | Create question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| POST | `/api/questions/import` | Import to quiz |

### 3.6 Classes (Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | My classes |
| POST | `/api/classes` | Create class |
| GET | `/api/classes/:id` | Class detail |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |
| POST | `/api/classes/:id/join` | Join by code |
| GET | `/api/classes/:id/students` | List students |
| POST | `/api/classes/:id/chapters` | Assign chapters |
| PUT | `/api/classes/:id/kkm` | Update KKM |

### 3.7 Monitoring (Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monitoring/overview` | Overview stats |
| GET | `/api/monitoring/students` | Students progress |
| GET | `/api/monitoring/students/:id` | Student detail |
| GET | `/api/monitoring/struggle` | Struggling students |

### 3.8 AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/sessions` | List sessions |
| POST | `/api/chat/sessions` | New session |
| GET | `/api/chat/sessions/:id` | Get session |
| POST | `/api/chat/sessions/:id/messages` | Send message |
| DELETE | `/api/chat/sessions/:id` | Delete session |

### 3.9 AI Audit (Teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit` | Audit list |
| GET | `/api/audit/:id` | Audit detail |
| POST | `/api/audit/:id/review` | Submit review |

### 3.10 Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/schools` | List schools |
| POST | `/api/admin/schools` | Create school |
| GET | `/api/admin/chapters` | Curriculum |
| POST | `/api/admin/chapters` | Create chapter |
| GET | `/api/admin/api-logs` | API logs |

---

## 4. Middleware Stack

```typescript
// Order of middleware
app.use(cors())
app.use(helmet())
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('combined'))

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = jwt.verify(token, SECRET)
  req.user = decoded
  next()
}

// Role middleware
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
```

---

## 5. Project Structure

```
apps/
├── api/                      # Backend
│   ├── src/
│   │   ├── config/           # Configuration
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   ├── middleware/       # Middleware
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts
│   │   │   ├── students.ts
│   │   │   ├── teachers.ts
│   │   │   ├── admin.ts
│   │   │   └── index.ts
│   │   ├── services/         # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   ├── ai.service.ts
│   │   │   └── adaptive.service.ts
│   │   ├── utils/            # Utilities
│   │   │   ├── jwt.ts
│   │   │   ├── hash.ts
│   │   │   └── validators.ts
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seed data
│   └── package.json
└── web/                      # Frontend (existing)
```

---

## 6. AI Integration

### 6.1 Adaptive Learning Algorithm

```typescript
interface AdaptiveRecommendation {
  nextContent: 'material' | 'quiz' | 'remedial'
  contentId: string
  difficulty: 'easier' | 'same' | 'harder'
  reason: string
}

async function getNextContent(studentId: string): Promise<AdaptiveRecommendation> {
  // 1. Get student's recent performance
  const recentAttempts = await getRecentAttempts(studentId)
  const masteryLevel = calculateMastery(recentAttempts)
  
  // 2. Determine next step
  if (masteryLevel < 50) {
    return { nextContent: 'remedial', difficulty: 'easier', ... }
  } else if (masteryLevel < 70) {
    return { nextContent: 'material', difficulty: 'same', ... }
  } else {
    return { nextContent: 'quiz', difficulty: 'harder', ... }
  }
}
```

### 6.2 AI Tutor Integration

```typescript
// OpenAI / Gemini integration for AI Tutor
async function generateTutorResponse(
  sessionId: string,
  userMessage: string,
  context: { chapter?: string, topic?: string }
): Promise<string> {
  const history = await getChatHistory(sessionId)
  
  const systemPrompt = `
    Kamu adalah tutor matematika SMA yang ramah dan helpful.
    Jelaskan konsep dengan bahasa sederhana dan berikan contoh.
    Gunakan LaTeX untuk rumus matematika.
    Context: ${context.chapter || 'Umum'}
  `
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ]
  })
  
  return response.choices[0].message.content
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Setup project structure
- [ ] Configure Prisma + PostgreSQL
- [ ] Implement auth (register, login, JWT)
- [ ] Basic middleware stack

### Phase 2: Core Features (Week 3-4)
- [ ] Material CRUD + progress tracking
- [ ] Quiz system + attempt handling
- [ ] Question bank management
- [ ] Class management

### Phase 3: Teacher Features (Week 5-6)
- [ ] Monitoring dashboard
- [ ] Student detail tracking
- [ ] Bank Soal integration
- [ ] AI Audit system

### Phase 4: Student Features (Week 7-8)
- [ ] Learning path
- [ ] AI Tutor chat
- [ ] Gamification (XP, badges)
- [ ] Leaderboard

### Phase 5: Admin & Polish (Week 9-10)
- [ ] Admin dashboard
- [ ] User management
- [ ] School management
- [ ] API logs + monitoring

---

## 8. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/adaptive_learning"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# AI
OPENAI_API_KEY="sk-..."
# or
GEMINI_API_KEY="..."

# File Storage
CLOUDINARY_URL="cloudinary://..."

# App
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

---

## Summary

| Category | Count |
|----------|-------|
| Models | 20+ |
| API Endpoints | 45+ |
| Phases | 5 |
| Estimated Timeline | 10 weeks |
