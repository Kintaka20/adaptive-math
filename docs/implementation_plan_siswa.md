# Implementation Plan - Halaman Siswa (Student Pages)

---

# 🎓 SISWA PAGES

## StudentDashboard (`/siswa`)

### Penjelasan
Dashboard utama siswa yang menampilkan statistik, kelas aktif, progress belajar, kuis mendatang, dan achievements.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Selamat Datang, Ahmad! 👋                                      │
│  Kelas XII-IPA 1 • SMAN 1 Jakarta                               │
├────────────────────────────────────────────────────────────────┤
│  STATS CARDS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  2,650   │ │ Level 11 │ │   #3     │ │  15🔥    │           │
│  │   XP ⭐   │ │    📈    │ │  Rank 🏆 │ │ Streak   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├────────────────────────────────────────────────────────────────┤
│  📚 KELAS SAYA                     [Ganti Kelas] [Gabung Baru]  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ XII-IPA 1 • Matematika Wajib                              │  │
│  │ Guru: Ibu Ani Suryani • 32 siswa • Kode: MTK-XII-001     │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  📖 LANJUTKAN BELAJAR              ⏰ KUIS MENDATANG            │
│  ┌────────────────────────┐        ┌──────────────────────┐    │
│  │ Bab 3: Limit Fungsi    │        │ Post-Test Limit      │    │
│  │ ████████████░░░ 78%    │        │ 📅 Besok, 10:00      │    │
│  │ [Lanjutkan →]          │        │ ⏱️ 15 menit          │    │
│  └────────────────────────┘        └──────────────────────┘    │
├────────────────────────────────────────────────────────────────┤
│  📊 AKTIVITAS TERBARU              🏆 ACHIEVEMENTS              │
│  ┌────────────────────────┐        ┌──────────────────────┐    │
│  │ • Quiz Trigo: 85       │        │ 🥇 First Quiz        │    │
│  │ • Materi Limit: Done   │        │ ⭐ 7 Day Streak      │    │
│  │ • AI Chat: 3 session   │        │ 🎯 Perfect Score     │    │
│  └────────────────────────┘        └──────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| WelcomeHeader | Header dengan nama user dan info kelas |
| StatCard | Card statistik (XP, Level, Rank, Streak) |
| CurrentClassCard | Card kelas aktif dengan kode |
| JoinClassModal | Modal untuk gabung kelas baru |
| ChangeClassModal | Modal untuk ganti kelas |
| LearningProgressCard | Card progress bab yang sedang dipelajari |
| UpcomingQuizCard | Card kuis mendatang |
| RecentActivityList | List aktivitas terbaru |
| AchievementBadge | Badge achievement |

### State
```typescript
interface DashboardState {
  currentClass: Class | null
  showJoinModal: boolean
  showChangeModal: boolean
  classCode: string
  recentActivity: Activity[]
  upcomingQuizzes: Quiz[]
}
```

### Flow Diagram - Join Class
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Click Join  │ --> │ Open Modal  │ --> │ Input Code  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Submit Code │
                                        └─────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
                   │ Code Valid  │      │ Already In  │      │ Code Invalid│
                   │ Join Class  │      │ Show Alert  │      │ Show Error  │
                   └─────────────┘      └─────────────┘      └─────────────┘
```

---

## LearningPathPage (`/siswa/belajar`)

### Penjelasan
Halaman yang menampilkan jalur belajar siswa dengan daftar bab yang tersedia, progress setiap bab, dan status (selesai/berlangsung/terkunci).

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📚 Jalur Belajar                                               │
│  Matematika Kelas XII                                           │
├────────────────────────────────────────────────────────────────┤
│  OVERALL PROGRESS                                               │
│  ████████████████░░░░░░░░ 65% (5/8 bab selesai)                │
├────────────────────────────────────────────────────────────────┤
│  CHAPTER LIST                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✅ Bab 1: Limit Fungsi                                    │  │
│  │    Progress: 100% │ Grade: A │ XP: 150                    │  │
│  │    ├─ ✅ Konsep Limit (Materi)                            │  │
│  │    ├─ ✅ Sifat-sifat Limit (Materi)                       │  │
│  │    ├─ ✅ Latihan Soal (Quiz: 80)                          │  │
│  │    └─ ✅ Post-Test (Score: 85)                            │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ ✅ Bab 2: Turunan                  100% │ A- │ 140 XP     │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ ✅ Bab 3: Aplikasi Turunan         100% │ B+ │ 120 XP     │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 🔄 Bab 4: Trigonometri             65% │ In Progress      │  │
│  │    [Lanjutkan Belajar →]                                  │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 🔒 Bab 5: Logaritma               0% │ Locked             │  │
│  │ 🔒 Bab 6: Integral                0% │ Locked             │  │
│  │ 🔒 Bab 7: Eksponen                0% │ Locked             │  │
│  │ 🔒 Bab 8: Matriks                 0% │ Locked             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| OverallProgressBar | Progress bar keseluruhan |
| ChapterCard | Card per bab (expandable) |
| ChapterStatusIcon | Icon status (✅/🔄/🔒) |
| ChapterProgress | Progress bar per bab |
| GradeBadge | Badge nilai (A, B+, dll) |
| LessonItem | Item lesson dalam bab |
| ContinueButton | Tombol lanjutkan belajar |

### State
```typescript
interface LearningPathState {
  chapters: Chapter[]
  expandedChapter: number | null
  overallProgress: number
}
```

---

## MaterialPage (`/siswa/belajar/:babId`)

### Penjelasan
Halaman view materi pembelajaran dengan video, konten teks, dan AI tutor terintegrasi.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                    Bab 4: Trigonometri              │
├────────────────────────────────────────────────────────────────┤
│  VIDEO PLAYER                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     ▶                                    │  │
│  │              [Video Placeholder]                         │  │
│  │                                                          │  │
│  │  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬○─────────────── 05:23 / 12:35          │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  📖 MATERI                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Pengertian Trigonometri                                   │  │
│  │                                                          │  │
│  │ Trigonometri adalah cabang matematika yang mempelajari   │  │
│  │ hubungan antara sudut dan sisi segitiga.                 │  │
│  │                                                          │  │
│  │ Rumus Dasar:                                             │  │
│  │ sin θ = opposite / hypotenuse                            │  │
│  │ cos θ = adjacent / hypotenuse                            │  │
│  │ tan θ = opposite / adjacent                              │  │
│  │                                                          │  │
│  │ [Rendered LaTeX formulas]                                │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  🤖 AI TUTOR                            [Buka Chat Lengkap →]  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ "Hai! Ada yang ingin kamu tanyakan tentang materi ini?" │  │
│  │                                                          │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ Ketik pertanyaan...                            [↗]  │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [← Materi Sebelumnya]                    [Materi Berikutnya →]│
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Tombol kembali ke LearningPath |
| ChapterTitle | Judul bab |
| VideoPlayer | Player video materi |
| MaterialContent | Konten materi teks/HTML |
| LatexRenderer | Render rumus matematika |
| AITutorMini | Widget AI tutor mini |
| ChatInput | Input pertanyaan |
| NavigationButtons | Tombol navigasi prev/next |

### State
```typescript
interface MaterialState {
  chapter: Chapter
  currentLesson: Lesson
  videoProgress: number
  chatMessages: Message[]
  newMessage: string
}
```

---

## QuizPage (`/siswa/kuis/:kuisId`)

### Penjelasan
Halaman untuk mengerjakan kuis dengan timer, navigasi soal, dan submit jawaban.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Post-Test Trigonometri                    ⏱️ 12:45 tersisa    │
├────────────────────────────────────────────────────────────────┤
│  QUESTION NAVIGATOR                                             │
│  [1●] [2●] [3○] [4○] [5○]    Soal 3 dari 5                     │
├────────────────────────────────────────────────────────────────┤
│  QUESTION CARD                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 3. Nilai dari tan 45° adalah...                          │  │
│  │                                                          │  │
│  │    ○ A. 0                                                │  │
│  │    ○ B. ½                                                │  │
│  │    ● C. 1              ← Selected                        │  │
│  │    ○ D. √3                                               │  │
│  │    ○ E. Tidak terdefinisi                                │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  NAVIGATION                                                     │
│  [← Sebelumnya]                           [Selanjutnya →]      │
│                                                                │
│                    [📤 Kumpulkan Jawaban]                       │
├────────────────────────────────────────────────────────────────┤
│  CONFIRM MODAL (when submit clicked)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Yakin ingin mengumpulkan jawaban?                        │  │
│  │ Terjawab: 4/5 soal                                       │  │
│  │                                                          │  │
│  │ [Kembali ke Soal]              [Ya, Kumpulkan]          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| QuizHeader | Header dengan judul dan timer |
| Timer | Countdown timer |
| QuestionNavigator | Tombol navigasi soal (numbered) |
| QuestionCard | Card pertanyaan |
| QuestionText | Teks soal (with LaTeX) |
| OptionItem | Item pilihan jawaban |
| OptionRadio | Radio button untuk pilihan |
| NavigationButtons | Tombol prev/next |
| SubmitButton | Tombol kumpulkan |
| ConfirmModal | Modal konfirmasi submit |

### State
```typescript
interface QuizState {
  quiz: Quiz
  currentQuestion: number
  answers: Record<number, string>
  timeRemaining: number
  isSubmitting: boolean
  showConfirmModal: boolean
}
```

### Flow Diagram - Quiz Submission
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Click Submit│ --> │ Show Modal  │ --> │ Confirm?    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                           ┌───────────────────┼───────────────────┐
                           ▼                                       ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │ Yes: Submit │                         │ No: Back    │
                    │ to API      │                         │ to Quiz     │
                    └─────────────┘                         └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Redirect to │
                    │ Result Page │
                    └─────────────┘
```

---

## QuizResultPage (`/siswa/kuis/:kuisId/hasil`)

### Penjelasan
Halaman hasil kuis yang menampilkan skor, statistik, review jawaban, dan langkah selanjutnya.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│                        🎉 Selamat!                              │
│                    Kamu Lulus Post-Test!                        │
├────────────────────────────────────────────────────────────────┤
│  SCORE DISPLAY                                                  │
│                    ┌───────────────┐                            │
│                    │     85/100    │                            │
│                    │   Grade: A-   │                            │
│                    │   +120 XP     │                            │
│                    └───────────────┘                            │
├────────────────────────────────────────────────────────────────┤
│  STATISTICS                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │ 4/5 Benar  │ │ 12:30 Waktu│ │ KKM: 75    │                  │
│  │ 80%        │ │ Terpakai   │ │ ✅ Lulus    │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
├────────────────────────────────────────────────────────────────┤
│  📝 REVIEW JAWABAN                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. ✅ Nilai sin 30° adalah...                             │  │
│  │    Jawaban: A. ½ (Benar)                                 │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 2. ✅ Nilai cos 60° adalah...                             │  │
│  │    Jawaban: A. ½ (Benar)                                 │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 3. ✅ Nilai tan 45° adalah...                             │  │
│  │    Jawaban: C. 1 (Benar)                                 │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 4. ❌ sin²θ + cos²θ = ?                                   │  │
│  │    Jawaban kamu: A. 0                                    │  │
│  │    Jawaban benar: B. 1                                   │  │
│  │    [Pelajari Materi Terkait →]                           │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 5. ✅ sin 30° × cos 60° = ?                               │  │
│  │    Jawaban: C. ¼ (Benar)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  🎯 LANGKAH SELANJUTNYA                                         │
│  [Lanjut ke Bab Berikutnya →]                                  │
│                                                                │
│  ─── atau jika tidak lulus ───                                 │
│  📚 Kamu perlu mengikuti Remedial                               │
│  [Mulai Remedial →]                                            │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ResultHeader | Header dengan animasi celebrasi |
| ScoreCard | Card skor besar |
| GradeBadge | Badge nilai |
| XPGained | XP yang didapat |
| StatisticsGrid | Grid statistik |
| ReviewSection | Section review jawaban |
| AnswerReviewItem | Item review per soal |
| CorrectIndicator | Indikator benar (✅) |
| WrongIndicator | Indikator salah (❌) |
| LearnMoreLink | Link pelajari materi |
| NextStepCard | Card langkah selanjutnya |
| RemedialCard | Card remedial (jika gagal) |

---

## AITutorPage (`/siswa/ai-tutor`)

### Penjelasan
Halaman chat dengan AI Tutor menggunakan metode Socratic untuk membantu siswa memahami konsep matematika.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🤖 AI Tutor                              [📜 Riwayat Chat]    │
│  Tanya apa saja tentang matematika!                             │
├────────────────────────────────────────────────────────────────┤
│  CHAT AREA                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🤖 Halo Ahmad! Aku AI Tutor matematika-mu.                │  │
│  │    Ada yang ingin kamu tanyakan?                         │  │
│  │                                              10:23 AM    │  │
│  │                                                          │  │
│  │                    👤 Bagaimana cara menghitung limit    │  │
│  │                       x→0 dari sin(x)/x?                │  │
│  │                                              10:24 AM    │  │
│  │                                                          │  │
│  │ 🤖 Pertanyaan bagus! Ini adalah limit penting.           │  │
│  │    Coba pikirkan dulu, apa yang terjadi jika            │  │
│  │    kita substitusi langsung x = 0?                       │  │
│  │                                              10:24 AM    │  │
│  │                                                          │  │
│  │                    👤 Hasilnya 0/0 yang tidak            │  │
│  │                       terdefinisi                        │  │
│  │                                              10:25 AM    │  │
│  │                                                          │  │
│  │ 🤖 Benar! Karena bentuk 0/0 tidak terdefinisi,           │  │
│  │    kita perlu pendekatan khusus. Salah satunya          │  │
│  │    adalah Aturan L'Hôpital:                             │  │
│  │                                                          │  │
│  │    lim(x→0) sin(x)/x = lim(x→0) cos(x)/1 = 1            │  │
│  │                                              10:25 AM    │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  QUICK TOPICS                                                   │
│  [Limit] [Turunan] [Integral] [Trigonometri]                   │
├────────────────────────────────────────────────────────────────┤
│  INPUT AREA                                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Ketik pertanyaan matematika...                     [↗]  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan judul dan link riwayat |
| ChatContainer | Container untuk messages |
| MessageBubble | Bubble pesan (AI/User) |
| AIMessage | Pesan dari AI (kiri, with icon) |
| UserMessage | Pesan dari user (kanan) |
| MessageTimestamp | Timestamp pesan |
| LatexRenderer | Render formula dalam pesan |
| QuickTopicButtons | Tombol topik cepat |
| ChatInput | Input pesan |
| SendButton | Tombol kirim |
| LoadingIndicator | Indicator AI sedang mengetik |

### State
```typescript
interface AITutorState {
  messages: Message[]
  newMessage: string
  isLoading: boolean
  selectedTopic: string | null
}
```

---

## ChatHistoryPage (`/siswa/ai-tutor/riwayat`)

### Penjelasan
Halaman riwayat percakapan dengan AI Tutor.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                     📜 Riwayat Chat                  │
├────────────────────────────────────────────────────────────────┤
│  🔍 Cari percakapan...                                          │
├────────────────────────────────────────────────────────────────┤
│  CHAT HISTORY LIST                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 💬 Limit Fungsi                                           │  │
│  │    "Bagaimana cara menghitung limit x→0..."               │  │
│  │    5 menit lalu • 8 pesan                                 │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 💬 Trigonometri                                           │  │
│  │    "Jelaskan rumus sin 2θ..."                             │  │
│  │    1 jam lalu • 12 pesan                                  │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 💬 Turunan                                                │  │
│  │    "Apa itu turunan fungsi..."                            │  │
│  │    Kemarin • 15 pesan                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Tombol kembali |
| SearchInput | Input pencarian |
| ChatHistoryItem | Item riwayat chat |
| ChatPreview | Preview pesan terakhir |
| ChatTimestamp | Waktu percakapan |
| MessageCount | Jumlah pesan |

---

## RankingPage (`/siswa/ranking`)

### Penjelasan
Halaman leaderboard dengan filter berdasarkan kelas, sekolah, atau global.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🏆 Papan Peringkat                                             │
│  Bersaing dengan teman-teman!                                   │
├────────────────────────────────────────────────────────────────┤
│  CURRENT USER POSITION                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Posisi Kamu: #3 • 2,650 XP • SMAN 1 Jakarta              │  │
│  │ ████████████████████░░░ 70 XP lagi untuk #2              │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  FILTER TABS                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [Kelas Saya]   [Sekolah Saya]   [Semua Sekolah]         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  SCHOOL FILTER (when "Semua Sekolah" selected)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 Filter: [Semua Sekolah                            ▼] │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  LEADERBOARD                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🥇 1. Sarah Amelia                                        │  │
│  │       XII-IPA 1 • SMAN 1 Jakarta              2,850 XP   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 🥈 2. Budi Santoso                                        │  │
│  │       XII-IPA 2 • SMAN 2 Bandung              2,720 XP   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 🥉 3. Ahmad Pratama (Kamu)                    ← Highlight │  │
│  │       XII-IPA 1 • SMAN 1 Jakarta              2,650 XP   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ #4  Dewi Lestari                                          │  │
│  │       XII-IPA 1 • SMA Labschool               2,580 XP   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ #5  Rizky Pratama                                         │  │
│  │       XII-IPA 2 • SMAN 2 Bandung              2,450 XP   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| CurrentUserCard | Card posisi user saat ini |
| ProgressToNext | Progress bar ke peringkat atas |
| FilterTabs | Tab filter (class/school/global) |
| SchoolDropdown | Dropdown filter sekolah |
| LeaderboardTable | Tabel leaderboard |
| LeaderboardRow | Baris per user |
| RankBadge | Badge peringkat (🥇/🥈/🥉/#) |
| UserInfo | Info nama, kelas, sekolah |
| XPDisplay | Display XP |
| CurrentUserHighlight | Highlight untuk user saat ini |

### State
```typescript
interface RankingState {
  activeTab: 'class' | 'school' | 'global'
  selectedSchool: number
  leaderboard: LeaderboardUser[]
  currentUserRank: number
}
```

---

## ProfilePage (`/siswa/profil`)

### Penjelasan
Halaman profil siswa dengan tabs untuk profil, notifikasi, achievements, dan pengaturan.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  PROFILE HEADER                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌─────────┐  Ahmad Pratama                               │  │
│  │  │ [Avatar]│  ahmad@email.com                             │  │
│  │  │   📷    │  XII-IPA 1 • SMAN 1 Jakarta                  │  │
│  │  └─────────┘                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                 │
│  [Profil]  [Notifikasi 🔔3]  [Achievements]  [Pengaturan]      │
├────────────────────────────────────────────────────────────────┤
│  TAB: PROFIL                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📊 Statistik Belajar                                      │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐             │  │
│  │ │ 2,650 XP   │ │ Level 11   │ │ 15 Hari    │             │  │
│  │ │ Total XP   │ │ Sekarang   │ │ Streak 🔥  │             │  │
│  │ └────────────┘ └────────────┘ └────────────┘             │  │
│  │                                                          │  │
│  │ 📈 Progress Belajar                                       │  │
│  │ Kuis Selesai: 24 • Akurasi: 85% • Bab Selesai: 5/8       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: NOTIFIKASI                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔔 Post-test Limit tersedia!                  5 min ago  │  │
│  │ 📚 Materi baru: Trigonometri Lanjut          1 hour ago  │  │
│  │ 🏆 Achievement unlocked: 7 Day Streak         Yesterday  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: ACHIEVEMENTS                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │
│  │ │ 🥇 First│ │ ⭐ 7-Day│ │ 🎯 Perf │ │ 🔒 ???  │         │  │
│  │ │   Quiz  │ │ Streak  │ │ Score   │ │         │         │  │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: PENGATURAN (via ?tab=settings)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🌙 Mode Gelap                            [Toggle: Off]   │  │
│  │ 🔔 Notifikasi                            [Toggle: On]    │  │
│  │ 🔑 Ubah Password                         [Button →]      │  │
│  │ 🚪 Logout                                [Button →]      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ProfileHeader | Header dengan avatar dan info |
| AvatarUpload | Component upload foto |
| TabNavigation | Tab navigation |
| TabBadge | Badge count pada tab |
| StatCard | Card statistik |
| ProgressStats | Statistik progress |
| NotificationItem | Item notifikasi |
| NotificationBadge | Badge unread |
| AchievementGrid | Grid achievements |
| AchievementBadge | Badge achievement |
| LockedAchievement | Badge terkunci |
| SettingsToggle | Toggle setting |
| ChangePasswordButton | Tombol ubah password |
| LogoutButton | Tombol logout |

### State
```typescript
interface ProfileState {
  activeTab: 'profile' | 'notifications' | 'achievements' | 'settings'
  isEditing: boolean
  avatarPreview: string | null
  notifications: Notification[]
  achievements: Achievement[]
}
```
