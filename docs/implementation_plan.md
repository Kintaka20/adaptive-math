# Frontend Implementation Plan - Adaptive Learning Matematika SMA

---

## 1. Technology Stack

| Aspek | Teknologi |
|-------|-----------|
| **Framework** | React 18 + TypeScript + Vite |
| **CSS** | TailwindCSS 3.x |
| **Routing** | React Router DOM v6 |
| **State** | React useState/useEffect/useRef |
| **Icons** | Material Symbols (Google) |
| **Math** | KaTeX |

---

## 2. Component Library Structure

```
src/
├── components/
│   ├── layouts/
│   │   └── DashboardLayout.tsx      # Layout utama dengan sidebar
│   ├── ui/
│   │   ├── Button.tsx               # [Planned] Reusable button
│   │   ├── Card.tsx                 # [Planned] Card component
│   │   ├── Modal.tsx                # [Planned] Modal dialog
│   │   ├── Input.tsx                # [Planned] Form input
│   │   ├── Select.tsx               # [Planned] Dropdown select
│   │   ├── Table.tsx                # [Planned] Data table
│   │   ├── Badge.tsx                # [Planned] Status badge
│   │   ├── ProgressBar.tsx          # [Planned] Progress indicator
│   │   ├── Tabs.tsx                 # [Planned] Tab navigation
│   │   └── Avatar.tsx               # [Planned] User avatar
│   ├── LatexRenderer.tsx            # [Exists] Render Markdown+LaTeX (H1-H3, lists, bold, italic, code, KaTeX)
│   └── Navbar.tsx                   # [Exists] Navigation bar
│
├── pages/
│   ├── public/
│   │   ├── LandingPage.tsx          # [Exists] Homepage
│   │   ├── NotFoundPage.tsx         # [Exists] 404 page
│   │   └── UnauthorizedPage.tsx     # [Exists] 403 page
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx            # [Exists] Login form
│   │   ├── RegisterStudentPage.tsx  # [Exists] Registrasi siswa
│   │   ├── RegisterTeacherPage.tsx  # [Exists] Registrasi guru
│   │   ├── ForgotPasswordPage.tsx   # [Exists] Lupa password
│   │   └── ResetPasswordPage.tsx    # [Exists] Reset password
│   │
│   ├── student/
│   │   ├── StudentDashboard.tsx     # [Exists] Dashboard siswa
│   │   ├── LearningPathPage.tsx     # [Exists] Jalur belajar
│   │   ├── MaterialPage.tsx         # [Exists] View materi
│   │   ├── QuizPage.tsx             # [Exists] Quiz interface
│   │   ├── QuizResultPage.tsx       # [Exists] Hasil quiz
│   │   ├── AITutorPage.tsx          # [Exists] Chat AI
│   │   ├── ChatHistoryPage.tsx      # [Exists] Riwayat chat
│   │   ├── RankingPage.tsx          # [Exists] Leaderboard
│   │   └── ProfilePage.tsx          # [Exists] Profil siswa
│   │
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx     # [Exists] Dashboard guru
│   │   ├── KelasPage.tsx            # [Exists] Daftar kelas
│   │   ├── CreateKelasPage.tsx      # [Exists] Buat kelas
│   │   ├── KelasDetailPage.tsx      # [Exists] Detail kelas
│   │   ├── AssignBabPage.tsx        # [Exists] Assign bab
│   │   ├── KKMSettingsPage.tsx      # [Exists] Setting KKM
│   │   ├── BankSoalPage.tsx         # [Exists] Bank soal
│   │   ├── TambahSoalPage.tsx       # [Exists] Tambah soal
│   │   ├── EditSoalPage.tsx         # [Exists] Edit soal
│   │   ├── MonitoringPage.tsx       # [Exists] Monitoring
│   │   ├── StudentDetailPage.tsx    # [Exists] Detail siswa
│   │   ├── StrugglePage.tsx         # [Exists] Siswa kesulitan
│   │   ├── AuditPage.tsx            # [Exists] Audit AI
│   │   ├── AuditDetailPage.tsx      # [Exists] Detail audit
│   │   ├── TeacherProfilePage.tsx   # [Exists] Profil guru
│   │   ├── BankMateriPage.tsx       # [Exists] Bank materi (tabs: Semua/Saya)
│   │   └── TambahMateriPage.tsx     # [Exists] Tambah materi baru
│   │
│   └── admin/
│       ├── AdminDashboard.tsx       # [Exists] Dashboard admin
│       ├── UsersPage.tsx            # [Exists] Kelola users
│       ├── SchoolManagementPage.tsx # [Exists] Kelola sekolah
│       ├── MasterDataPage.tsx       # [Exists] Master data (clickable stats)
│       ├── CurriculumPage.tsx       # [Exists] Kurikulum
│       ├── ChapterContentPage.tsx   # [Exists] Konten bab
│       ├── MaterialEditorPage.tsx   # [Exists] Editor materi + LaTeX
│       ├── QuizEditorPage.tsx       # [Exists] Editor quiz + Bank Soal
│       ├── AllMaterialsPage.tsx     # [Exists] Bank Materi (tabs: Semua/Sistem/Guru)
│       ├── AllQuestionsPage.tsx     # [Exists] Bank Soal (tabs: Semua/Sistem/Guru)
│       └── ApiLogsPage.tsx          # [Exists] API logs
│
└── App.tsx                          # [Exists] Route configuration
```

---

## 3. Route Table

### 3.1 Public Routes
| Route | Page | Status |
|-------|------|--------|
| `/` | LandingPage | ✅ |
| `/404` | NotFoundPage | ✅ |
| `/403` | UnauthorizedPage | ✅ |

### 3.2 Auth Routes
| Route | Page | Status |
|-------|------|--------|
| `/login` | LoginPage | ✅ |
| `/register/siswa` | RegisterStudentPage | ✅ |
| `/register/guru` | RegisterTeacherPage | ✅ |
| `/forgot-password` | ForgotPasswordPage | ✅ |
| `/reset-password` | ResetPasswordPage | ✅ |

### 3.3 Student Routes
| Route | Page | Status |
|-------|------|--------|
| `/siswa` | StudentDashboard | ✅ |
| `/siswa/belajar` | LearningPathPage | ✅ |
| `/siswa/belajar/:babId` | MaterialPage | ✅ |
| `/siswa/kuis/:kuisId` | QuizPage | ✅ |
| `/siswa/kuis/:kuisId/hasil` | QuizResultPage | ✅ |
| `/siswa/ai-tutor` | AITutorPage | ✅ |
| `/siswa/ai-tutor/riwayat` | ChatHistoryPage | ✅ |
| `/siswa/ranking` | RankingPage | ✅ |
| `/siswa/profil` | ProfilePage | ✅ |

### 3.4 Teacher Routes
| Route | Page | Status |
|-------|------|--------|
| `/guru` | TeacherDashboard | ✅ |
| `/guru/kelas` | KelasPage | ✅ |
| `/guru/kelas/create` | CreateKelasPage | ✅ |
| `/guru/kelas/:id` | KelasDetailPage | ✅ |
| `/guru/kelas/:id/bab` | AssignBabPage | ✅ |
| `/guru/kelas/:id/kkm` | KKMSettingsPage | ✅ |
| `/guru/bank-soal` | BankSoalPage | ✅ |
| `/guru/bank-soal/tambah` | TambahSoalPage | ✅ |
| `/guru/bank-soal/:id` | EditSoalPage | ✅ |
| `/guru/monitoring` | MonitoringPage | ✅ |
| `/guru/monitoring/siswa/:id` | StudentDetailPage | ✅ |
| `/guru/monitoring/struggle` | StrugglePage | ✅ |
| `/guru/audit` | AuditPage | ✅ |
| `/guru/audit/:id` | AuditDetailPage | ✅ |
| `/guru/profil` | TeacherProfilePage | ✅ |
| `/guru/bank-materi` | BankMateriPage | ✅ |
| `/guru/bank-materi/create` | TambahMateriPage | ✅ |
| `/guru/kelas/:id/content/create` | ContentEditorPage | ✅ |

### 3.5 Admin Routes
| Route | Page | Status |
|-------|------|--------|
| `/admin` | AdminDashboard | ✅ |
| `/admin/users` | UsersPage | ✅ |
| `/admin/sekolah` | SchoolManagementPage | ✅ |
| `/admin/master-data` | MasterDataPage | ✅ |
| `/admin/master-data/kurikulum` | CurriculumPage | ✅ |
| `/admin/master-data/bab/:id` | ChapterContentPage | ✅ |
| `/admin/master-data/materials` | AllMaterialsPage | ✅ |
| `/admin/master-data/materials/create` | AdminTambahMateriPage | ✅ |
| `/admin/master-data/questions` | AllQuestionsPage | ✅ |
| `/admin/master-data/questions/create` | AdminTambahSoalPage | ✅ |
| `/admin/master-data/content/create` | AdminContentEditorPage | ✅ |
| `/admin/api-logs` | ApiLogsPage | ✅ |

---

# 📄 PUBLIC PAGES

## LandingPage (`/`)

### Penjelasan
Halaman utama yang menampilkan informasi tentang platform Adaptive Learning. Menampilkan hero section, fitur utama, dan CTA untuk login/register.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                         │
│  [Logo] AdaptiveMath    Fitur  Tentang   [Login] [Daftar →]    │
├────────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                   │
│  ┌─────────────────────────────┐ ┌───────────────────────────┐ │
│  │ 🚀 Belajar Matematika       │ │                           │ │
│  │    Lebih CERDAS dengan      │ │  [3D Hero Illustration]   │ │
│  │    AI Personal Tutor        │ │  Siswa + AI + Rumus       │ │
│  │                             │ │                           │ │
│  │ [Mulai Belajar] [Demo]      │ └───────────────────────────┘ │
│  └─────────────────────────────┘                                │
├────────────────────────────────────────────────────────────────┤
│  FEATURES SECTION                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ 🎯 Placement│ │ 🤖 AI Tutor │ │ 📊 Progress │               │
│  │    Test     │ │   Socratic  │ │   Tracking  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
├────────────────────────────────────────────────────────────────┤
│  FOR WHO SECTION                                                │
│  [👨‍🎓 Siswa SMA]  [👩‍🏫 Guru]  [🏫 Sekolah]                       │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  Links | Contact | Social Media | Copyright                     │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| Navbar | Navigation bar dengan logo, menu, dan auth buttons |
| HeroSection | Hero dengan headline, subtext, dan CTA buttons |
| FeatureCard | Card untuk menampilkan fitur (icon, title, desc) |
| UserTypeCard | Card untuk target pengguna |
| Footer | Footer dengan links dan info |

---

## NotFoundPage (`/404`)

### Penjelasan
Halaman error 404 yang ditampilkan ketika user mengakses route yang tidak ada.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           404                                   │
│                  Halaman Tidak Ditemukan                        │
│                                                                 │
│         Maaf, halaman yang kamu cari tidak ada.                │
│                                                                 │
│                  [🏠 Kembali ke Beranda]                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ErrorCode | Tampilan angka 404 besar |
| ErrorMessage | Pesan error |
| HomeButton | Link kembali ke homepage |

---

# 🔐 AUTH PAGES

## LoginPage (`/login`)

### Penjelasan
Halaman login untuk semua role (siswa, guru, admin). User memasukkan email dan password untuk autentikasi.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────┐  ┌──────────────────────────────┐  │
│  │                        │  │  Selamat Datang Kembali! 👋   │  │
│  │   [Hero Illustration]  │  │                              │  │
│  │                        │  │  Email *                     │  │
│  │   ✓ Belajar adaptif    │  │  ┌──────────────────────────┐│  │
│  │   ✓ AI Tutor           │  │  │ user@email.com           ││  │
│  │   ✓ Progress tracking  │  │  └──────────────────────────┘│  │
│  │                        │  │                              │  │
│  │                        │  │  Password *                  │  │
│  │                        │  │  ┌──────────────────────────┐│  │
│  │                        │  │  │ ••••••••           [👁]  ││  │
│  │                        │  │  └──────────────────────────┘│  │
│  │                        │  │  [Lupa password?]            │  │
│  │                        │  │                              │  │
│  │                        │  │  [🚀 Masuk]                  │  │
│  │                        │  │                              │  │
│  │                        │  │  Belum punya akun?           │  │
│  │                        │  │  [Siswa] atau [Guru]         │  │
│  └────────────────────────┘  └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| HeroPanel | Panel kiri dengan ilustrasi dan benefit list |
| LoginForm | Form login dengan email, password |
| EmailInput | Input email dengan validasi |
| PasswordInput | Input password dengan toggle show/hide |
| ForgotPasswordLink | Link ke halaman lupa password |
| SubmitButton | Tombol submit dengan loading state |
| RegisterLinks | Links ke halaman register siswa/guru |

### State
```typescript
interface LoginState {
  email: string
  password: string
  showPassword: boolean
  errors: { email?: string; password?: string }
  isLoading: boolean
}
```

### Flow Diagram
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Isi Form   │ --> │  Validasi   │ --> │  Submit API │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                    (Error)│             (Error)│
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │ Show Error  │     │ Show Alert  │
                    └─────────────┘     └─────────────┘
                                               │
                                        (Success)
                                               ▼
                                        ┌─────────────┐
                                        │  Redirect   │
                                        │  by Role    │
                                        └─────────────┘
```

---

## RegisterStudentPage (`/register/siswa`)

### Penjelasan
Halaman registrasi untuk siswa baru. Wajib memilih sekolah yang sudah terdaftar di sistem.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Daftar Sebagai Siswa 🎓                                        │
├────────────────────────────────────────────────────────────────┤
│  Nama Lengkap *                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Ahmad Pratama                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  🏫 Pilih Sekolah *                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 Ketik nama sekolah...                              ▼  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  📍 SMAN 1 Jakarta - Jakarta Pusat                       │  │
│  │  📍 SMAN 2 Bandung - Bandung                              │  │
│  │  📍 SMA Labschool - Jakarta Timur                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ⚠️ Sekolah tidak terdaftar? Hubungi admin.                    │
│                                                                │
│  Email *                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ahmad@email.com                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Password * (min 8 karakter)                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ••••••••                                           [👁]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Kekuatan: ████░░ Cukup                                        │
│                                                                │
│  Konfirmasi Password *                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ••••••••                                           [👁]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ☑️ Saya setuju dengan Syarat & Ketentuan                       │
│                                                                │
│  [🚀 Daftar Sekarang]                                           │
│                                                                │
│  Sudah punya akun? [Login]                                     │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan judul dan ikon |
| NameInput | Input nama lengkap |
| SchoolDropdown | Dropdown searchable untuk pilih sekolah |
| SchoolSearchInput | Input pencarian dalam dropdown |
| SchoolOptionItem | Item sekolah dalam dropdown |
| EmailInput | Input email dengan validasi format |
| PasswordInput | Input password dengan toggle visibility |
| PasswordStrengthIndicator | Indikator kekuatan password |
| ConfirmPasswordInput | Input konfirmasi password |
| TermsCheckbox | Checkbox persetujuan S&K |
| SubmitButton | Tombol daftar dengan loading state |
| LoginLink | Link ke halaman login |

### State
```typescript
interface RegisterStudentState {
  formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    schoolId: string
    agreeTerms: boolean
  }
  errors: FormErrors
  showPassword: boolean
  showConfirmPassword: boolean
  schoolSearch: string
  showSchoolDropdown: boolean
  isLoading: boolean
}
```

### Validation Rules
```typescript
const validation = {
  name: { required: true, minLength: 3 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8 },
  confirmPassword: { required: true, mustMatch: 'password' },
  schoolId: { required: true },
  agreeTerms: { required: true }
}
```

---

## RegisterTeacherPage (`/register/guru`)

### Penjelasan
Halaman registrasi guru. Memerlukan verifikasi admin sebelum akun aktif.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Daftar Sebagai Guru 👩‍🏫                                        │
│  ⚠️ Memerlukan Verifikasi Admin (1-2 hari kerja)                │
├────────────────────────────────────────────────────────────────┤
│  Nama Lengkap *                Email Institusi *               │
│  ┌──────────────────────┐      ┌───────────────────────────┐   │
│  │ Ani Suryani, S.Pd    │      │ ani@sman1.sch.id          │   │
│  └──────────────────────┘      └───────────────────────────┘   │
│                                                                │
│  🏫 Pilih Sekolah *                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 SMAN 1 Jakarta - Jakarta Pusat                     ▼  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ⚠️ Sekolah tidak terdaftar? Hubungi admin.                    │
│                                                                │
│  Nomor WhatsApp *                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 08123456789                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Password * / Konfirmasi Password *                            │
│                                                                │
│  ☑️ Saya setuju dengan S&K                                      │
│                                                                │
│  [📤 Kirim Pendaftaran]                                         │
│                                                                │
│  Sudah punya akun? [Login]                                     │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan judul dan warning badge |
| NameInput | Input nama lengkap |
| EmailInput | Input email institusi |
| SchoolDropdown | Dropdown searchable untuk pilih sekolah |
| WhatsAppInput | Input nomor WhatsApp |
| PasswordInput | Input password |
| ConfirmPasswordInput | Input konfirmasi password |
| TermsCheckbox | Checkbox persetujuan |
| SubmitButton | Tombol kirim pendaftaran |

---

## ForgotPasswordPage (`/forgot-password`)

### Penjelasan
Halaman untuk meminta link reset password. User memasukkan email terdaftar.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🔑 Lupa Password                                               │
│                                                                │
│  Masukkan email terdaftar untuk menerima link reset password.  │
│                                                                │
│  Email *                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ user@email.com                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [📧 Kirim Link Reset]                                          │
│                                                                │
│  [← Kembali ke Login]                                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✅ Link reset password telah dikirim ke email kamu!       │  │
│  │    Cek inbox atau folder spam.                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan ikon dan judul |
| InstructionText | Teks instruksi |
| EmailInput | Input email |
| SubmitButton | Tombol kirim link |
| BackToLoginLink | Link kembali ke login |
| SuccessMessage | Pesan sukses setelah kirim |

---

## ResetPasswordPage (`/reset-password`)

### Penjelasan
Halaman untuk membuat password baru setelah klik link reset dari email.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🔐 Reset Password                                              │
│                                                                │
│  Buat password baru untuk akun kamu.                           │
│                                                                │
│  Password Baru *                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ••••••••                                           [👁]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Kekuatan: ████████ Kuat                                       │
│                                                                │
│  Konfirmasi Password *                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ••••••••                                           [👁]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [💾 Simpan Password Baru]                                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✅ Password berhasil diubah!                              │  │
│  │    [Login Sekarang →]                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan ikon dan judul |
| PasswordInput | Input password baru |
| PasswordStrengthIndicator | Indikator kekuatan |
| ConfirmPasswordInput | Input konfirmasi |
| SubmitButton | Tombol simpan |
| SuccessMessage | Pesan sukses dengan link login |

---

*Dokumen ini dilanjutkan di bagian berikutnya untuk halaman Siswa, Guru, dan Admin.*
