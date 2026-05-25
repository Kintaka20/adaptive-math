# Implementation Plan - Halaman Admin (Admin Pages)

---

# ⚙️ ADMIN PAGES

## AdminDashboard (`/admin`)

### Penjelasan
Dashboard utama admin menampilkan overview sistem, pending verifikasi guru, dan aktivitas terbaru.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard Admin 🛡️                                             │
│  Kelola pengguna, konten, dan konfigurasi sistem                │
├────────────────────────────────────────────────────────────────┤
│  STATS OVERVIEW                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────┐ │
│  │ 1,250  │ │   45   │ │   52   │ │  856   │ │   3    │ │1500│ │
│  │ Siswa  │ │  Guru  │ │ Kelas  │ │ Aktif  │ │Pending │ │Soal│ │
│  │ Total  │ │ Total  │ │ Total  │ │ Hari Ini││ Verif  │ │Bank│ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────┘ │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐ ┌────────────────────────┐│
│  │ ⏳ GURU MENUNGGU VERIFIKASI (3)  │ │ ⚡ AKSI CEPAT          ││
│  │ ┌───────────────────────────┐   │ │                        ││
│  │ │ Ibu Sari          [✓][✗] │   │ │ ┌────────────────────┐ ││
│  │ │ SMKN 1 Jakarta            │   │ │ │ 👥 Kelola Pengguna │ ││
│  │ ├───────────────────────────┤   │ │ ├────────────────────┤ ││
│  │ │ Pak Budi          [✓][✗] │   │ │ │ 🏫 Kelola Sekolah  │ ││
│  │ │ SMAN 5 Jakarta            │   │ │ ├────────────────────┤ ││
│  │ ├───────────────────────────┤   │ │ │ 📊 Master Data     │ ││
│  │ │ Ibu Dewi          [✓][✗] │   │ │ ├────────────────────┤ ││
│  │ │ SMAN 3 Jakarta            │   │ │ │ 📝 API Logs        │ ││
│  │ └───────────────────────────┘   │ │ └────────────────────┘ ││
│  └─────────────────────────────────┘ └────────────────────────┘│
├────────────────────────────────────────────────────────────────┤
│  📜 AKTIVITAS TERBARU                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✓ Guru "Pak Ahmad" berhasil diverifikasi • 1 jam lalu    │  │
│  │ 📚 Ibu Rina membuat kelas baru "XII-IPA 3" • 2 jam lalu  │  │
│  │ 📝 15 soal baru ditambahkan ke bank soal • 3 jam lalu    │  │
│  │ 👤 25 siswa baru mendaftar • Hari ini                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dashboard |
| StatCard | Card statistik overview |
| PendingTeacherCard | Card guru pending verifikasi |
| TeacherItem | Item guru dengan approve/reject |
| ApproveButton | Tombol approve |
| RejectButton | Tombol reject |
| QuickActionCard | Card aksi cepat |
| QuickActionLink | Link ke halaman lain |
| ActivityList | Daftar aktivitas |
| ActivityItem | Item per aktivitas |
| ActivityIcon | Icon per tipe aktivitas |

### State
```typescript
interface AdminDashboardState {
  stats: DashboardStats
  pendingTeachers: Teacher[]
  recentActivity: Activity[]
  isApprovingTeacher: number | null
}
```

### Flow Diagram - Teacher Verification
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Click ✓    │ --> │ Confirm?    │ --> │ API Approve │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                        ┌──────┴──────┐
                                        ▼             ▼
                                 ┌───────────┐ ┌───────────┐
                                 │ Success   │ │ Error     │
                                 │ Remove    │ │ Show Alert│
                                 │ from list │ │           │
                                 └───────────┘ └───────────┘
```

---

## UsersPage (`/admin/users`)

### Penjelasan
Halaman manajemen semua pengguna (guru dan siswa).

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  👥 Manajemen Pengguna                     [+ Tambah User]      │
│  Kelola data pengguna sistem                                    │
├────────────────────────────────────────────────────────────────┤
│  TAB FILTER                                                     │
│  [Semua]  [Guru]  [Siswa]  [Pending Verification]              │
├────────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER                                                │
│  🔍 Cari nama/email...       [Sekolah ▼]   [Status ▼]          │
├────────────────────────────────────────────────────────────────┤
│  USER TABLE                                                     │
│  ┌────┬────────────────┬─────────────┬──────────────┬─────────┐│
│  │ #  │ Nama           │ Role        │ Sekolah      │ Status  ││
│  ├────┼────────────────┼─────────────┼──────────────┼─────────┤│
│  │ 1  │ Ahmad Pratama  │ 🎓 Siswa    │ SMAN 1 Jkt   │ 🟢 Aktif││
│  │    │ ahmad@mail.com │ XII-IPA 1   │              │         ││
│  │    │                │             │ [👁][✏️][🗑️] │         ││
│  ├────┼────────────────┼─────────────┼──────────────┼─────────┤│
│  │ 2  │ Bu Ani         │ 👩‍🏫 Guru    │ SMAN 1 Jkt   │ 🟢 Aktif││
│  │    │ ani@sman1.sch  │ 3 kelas     │              │         ││
│  │    │                │             │ [👁][✏️][🗑️] │         ││
│  ├────┼────────────────┼─────────────┼──────────────┼─────────┤│
│  │ 3  │ Ibu Sari       │ 👩‍🏫 Guru    │ SMKN 1 Jkt   │ 🟡 Pending│
│  │    │ sari@smkn1.sch │ -           │              │         ││
│  │    │                │             │ [✓][✗][👁]  │         ││
│  └────┴────────────────┴─────────────┴──────────────┴─────────┘│
│                                                                │
│  PAGINATION                                                     │
│  [< Prev] Halaman 1 dari 50 [Next >]                           │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan tombol tambah |
| TabFilter | Tab filter role |
| SearchInput | Input pencarian |
| SchoolFilter | Dropdown filter sekolah |
| StatusFilter | Dropdown filter status |
| UserTable | Tabel pengguna |
| UserRow | Baris per user |
| RoleBadge | Badge role (Siswa/Guru) |
| StatusBadge | Badge status (Active/Pending) |
| ActionButtons | Tombol view/edit/delete |
| ApproveRejectButtons | Tombol untuk pending |
| Pagination | Navigasi halaman |
| AddUserModal | Modal tambah user |
| EditUserModal | Modal edit user |
| DeleteConfirmModal | Modal konfirmasi hapus |

---

## SchoolManagementPage (`/admin/sekolah`)

### Penjelasan
CRUD management untuk daftar sekolah yang terdaftar di sistem.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🏫 Manajemen Sekolah                    [+ Tambah Sekolah]     │
│  Kelola daftar sekolah yang terdaftar                           │
├────────────────────────────────────────────────────────────────┤
│  STATS                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  5       │ │  5       │ │  45      │ │ 1,250    │          │
│  │ Total    │ │ Aktif    │ │ Total    │ │ Total    │          │
│  │ Sekolah  │ │ Sekolah  │ │ Guru     │ │ Siswa    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  SEARCH                                                         │
│  🔍 Cari sekolah...                                             │
├────────────────────────────────────────────────────────────────┤
│  SCHOOL TABLE                                                   │
│  ┌────┬────────────────────┬──────────┬──────────┬─────┬─────┐ │
│  │ #  │ Nama Sekolah       │ Kode     │ Kota     │ Guru│Siswa│ │
│  ├────┼────────────────────┼──────────┼──────────┼─────┼─────┤ │
│  │ 1  │ 🟢 SMAN 1 Jakarta  │ SMAN1JKT │ Jakarta  │  12 │ 350 │ │
│  │    │                    │          │          │[✏️][🗑️]│  │ │
│  ├────┼────────────────────┼──────────┼──────────┼─────┼─────┤ │
│  │ 2  │ 🟢 SMAN 2 Bandung  │ SMAN2BDG │ Bandung  │  10 │ 280 │ │
│  │    │                    │          │          │[✏️][🗑️]│  │ │
│  ├────┼────────────────────┼──────────┼──────────┼─────┼─────┤ │
│  │ 3  │ 🟢 SMA Labschool   │ LABSJKT  │ Jakarta  │   8 │ 220 │ │
│  │    │                    │          │          │[✏️][🗑️]│  │ │
│  └────┴────────────────────┴──────────┴──────────┴─────┴─────┘ │
└────────────────────────────────────────────────────────────────┘

ADD/EDIT MODAL:
┌───────────────────────────────────────────────────────────────┐
│  🏫 Tambah Sekolah Baru                                  [✕]  │
├───────────────────────────────────────────────────────────────┤
│  Nama Sekolah *                                               │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ SMA Negeri 1 Jakarta                                      ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Kode Sekolah *                          [🔄 Auto-generate]   │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ SMAN1JKT                                                  ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Alamat                                                       │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ Jl. Budi Utomo No. 7                                      ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Kota *                         Provinsi                      │
│  ┌────────────────────────────┐ ┌────────────────────────────┐│
│  │ Jakarta Pusat              │ │ DKI Jakarta                ││
│  └────────────────────────────┘ └────────────────────────────┘│
│                                                               │
│  Status                                                       │
│  ● Aktif    ○ Nonaktif                                        │
│                                                               │
│  [Batal]                               [💾 Simpan Sekolah]    │
└───────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan tombol tambah |
| StatsCard | Card statistik overview |
| SearchInput | Input pencarian |
| SchoolTable | Tabel sekolah |
| SchoolRow | Baris per sekolah |
| StatusIndicator | Indikator status (🟢/🔴) |
| ActionButtons | Tombol edit/delete |
| AddSchoolModal | Modal tambah sekolah |
| EditSchoolModal | Modal edit sekolah |
| SchoolNameInput | Input nama sekolah |
| SchoolCodeInput | Input kode sekolah |
| AutoGenerateButton | Tombol auto-generate kode |
| AddressInput | Input alamat |
| CityInput | Input kota |
| ProvinceInput | Input provinsi |
| StatusRadio | Radio button status |
| DeleteConfirmModal | Modal konfirmasi hapus |

### State
```typescript
interface SchoolManagementState {
  schools: School[]
  searchQuery: string
  showModal: boolean
  editingSchool: School | null
  showDeleteConfirm: boolean
  schoolToDelete: School | null
}

interface SchoolFormData {
  name: string
  code: string
  address: string
  city: string
  province: string
  status: 'active' | 'inactive'
}
```

---

## MasterDataPage (`/admin/master-data`)

### Penjelasan
Overview master data sistem (kurikulum, bab, soal).

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📊 Master Data                                                 │
│  Kelola kurikulum, bab, dan konten pembelajaran                 │
├────────────────────────────────────────────────────────────────┤
│  STATS OVERVIEW                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  3       │ │  24      │ │  156     │ │  1,500   │          │
│  │ Tingkat  │ │ Bab      │ │ Materi   │ │ Soal     │          │
│  │ Kelas    │ │ Total    │ │ Total    │ │ Total    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  📚 KURIKULUM PER TINGKAT                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📘 Kelas X                                                │  │
│  │    8 Bab • 52 Materi • 500 Soal                          │  │
│  │    [Lihat Detail →]                                       │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📗 Kelas XI                                               │  │
│  │    8 Bab • 52 Materi • 500 Soal                          │  │
│  │    [Lihat Detail →]                                       │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📕 Kelas XII                                              │  │
│  │    8 Bab • 52 Materi • 500 Soal                          │  │
│  │    [Lihat Detail →]                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [📖 Kelola Kurikulum]                                         │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| StatsCard | Card statistik |
| GradeCard | Card per tingkat kelas |
| GradeIcon | Icon per tingkat |
| StatsSummary | Summary bab/materi/soal |
| DetailLink | Link ke CurriculumPage |
| ManageCurriculumButton | Tombol kelola kurikulum |

---

## CurriculumPage (`/admin/master-data/curriculum`)

### Penjelasan
Halaman manajemen kurikulum per tingkat kelas dengan daftar bab.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                  📚 Manajemen Kurikulum             │
├────────────────────────────────────────────────────────────────┤
│  TAB TINGKAT KELAS                                              │
│  [Kelas X]   [Kelas XI]   [Kelas XII]                          │
├────────────────────────────────────────────────────────────────┤
│  KURIKULUM KELAS XII                          [+ Tambah Bab]   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📖 Bab 1: Limit Fungsi                      [✏️][🗑️]     │  │
│  │    Deskripsi: Konsep limit fungsi dan penerapannya       │  │
│  │    6 Materi • 15 Soal • Status: ✅ Aktif                 │  │
│  │    [Kelola Konten →]                                      │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📖 Bab 2: Turunan Fungsi                    [✏️][🗑️]     │  │
│  │    Deskripsi: Konsep turunan dan aturan diferensiasi    │  │
│  │    8 Materi • 20 Soal • Status: ✅ Aktif                 │  │
│  │    [Kelola Konten →]                                      │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📖 Bab 3: Aplikasi Turunan                  [✏️][🗑️]     │  │
│  │    Deskripsi: Penerapan turunan dalam berbagai masalah  │  │
│  │    7 Materi • 18 Soal • Status: ✅ Aktif                 │  │
│  │    [Kelola Konten →]                                      │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📖 Bab 4: Integral                          [✏️][🗑️]     │  │
│  │    Deskripsi: Konsep integral dan teknik pengintegrasian│  │
│  │    5 Materi • 12 Soal • Status: ⚪ Draft                 │  │
│  │    [Kelola Konten →]                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

ADD/EDIT BAB MODAL:
┌───────────────────────────────────────────────────────────────┐
│  📖 Tambah Bab Baru                                      [✕]  │
├───────────────────────────────────────────────────────────────┤
│  Tingkat Kelas                                                │
│  [Kelas X ▼]                                                  │
│                                                               │
│  Urutan Bab *                                                 │
│  [5]                                                          │
│                                                               │
│  Judul Bab *                                                  │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ Trigonometri                                              ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Deskripsi                                                    │
│  ┌───────────────────────────────────────────────────────────┐│
│  │ Konsep trigonometri dan penerapannya...                   ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Status                                                       │
│  ● Aktif    ○ Draft                                           │
│                                                               │
│  [Batal]                                    [💾 Simpan Bab]   │
└───────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Tombol kembali |
| PageHeader | Header halaman |
| GradeTabNavigation | Tab navigasi tingkat kelas |
| AddChapterButton | Tombol tambah bab |
| ChapterList | Daftar bab |
| ChapterCard | Card per bab |
| ChapterTitle | Judul bab |
| ChapterDescription | Deskripsi bab |
| ChapterStats | Summary materi/soal |
| StatusBadge | Badge status (Aktif/Draft) |
| ActionButtons | Tombol edit/delete |
| ManageContentLink | Link ke ChapterContentPage |
| AddChapterModal | Modal tambah bab |
| EditChapterModal | Modal edit bab |
| GradeSelect | Dropdown tingkat kelas |
| OrderInput | Input urutan bab |
| TitleInput | Input judul |
| DescriptionTextarea | Textarea deskripsi |
| StatusRadio | Radio status |
| DeleteConfirmModal | Modal konfirmasi hapus |

### State
```typescript
interface CurriculumState {
  activeGrade: 'X' | 'XI' | 'XII'
  chapters: Chapter[]
  showModal: boolean
  editingChapter: Chapter | null
  showDeleteConfirm: boolean
}
```

---

## ChapterContentPage (`/admin/master-data/bab/:id`)

### Penjelasan
Halaman detail per bab untuk mengelola materi dan soal, termasuk AI Content Generator.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                  Bab 1: Limit Fungsi               │
│                             Kelas XII                          │
├────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                 │
│  [📖 Materi]   [📝 Soal]   [🤖 AI Generator]                   │
├────────────────────────────────────────────────────────────────┤
│  TAB: MATERI                                   [+ Tambah Materi]│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Pengertian Limit Fungsi              [✏️][🗑️][↕]      │  │
│  │    📹 Video: 12:35 • 📄 Teks: 500 kata                   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 2. Sifat-sifat Limit                    [✏️][🗑️][↕]      │  │
│  │    📹 Video: 15:20 • 📄 Teks: 650 kata                   │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 3. Limit Fungsi Aljabar                 [✏️][🗑️][↕]      │  │
│  │    📄 Teks: 800 kata (no video)                          │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 4. Limit Fungsi Trigonometri            [✏️][🗑️][↕]      │  │
│  │    📹 Video: 18:45 • 📄 Teks: 720 kata                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: SOAL                                     [+ Tambah Soal] │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. 🟢 Easy │ Hitung limit x→2 dari x²...     [✏️][🗑️]  │  │
│  │ 2. 🟢 Easy │ Tentukan lim x→0 sin(x)/x...    [✏️][🗑️]  │  │
│  │ 3. 🟡 Med  │ Selesaikan lim x→∞ (3x²+2)...   [✏️][🗑️]  │  │
│  │ 4. 🟡 Med  │ Hitung limit bentuk 0/0...      [✏️][🗑️]  │  │
│  │ 5. 🔴 Hard │ Buktikan teorema squeeze...     [✏️][🗑️]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: AI GENERATOR                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🤖 Generate Konten dengan AI                             │  │
│  │                                                          │  │
│  │ Tipe Konten: [Materi ▼]                                  │  │
│  │                                                          │  │
│  │ Topik:                                                   │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ Limit fungsi trigonometri                          │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │ Tingkat Kesulitan: [Medium ▼]                            │  │
│  │                                                          │  │
│  │ Jumlah Soal (jika generate soal): [5]                    │  │
│  │                                                          │  │
│  │ [🤖 Generate Konten]                                     │  │
│  │                                                          │  │
│  │ ──────────────────────────────────────────────────────  │  │
│  │ 📋 Hasil Generate:                                       │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ [Generated content preview...]                      │   │  │
│  │ │                                                     │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  │ [✅ Gunakan] [✏️ Edit Dulu] [🔄 Generate Ulang]          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Tombol kembali |
| ChapterHeader | Header dengan judul bab |
| TabNavigation | Tab materi/soal/AI |
| AddButton | Tombol tambah (context-aware) |
| MaterialList | Daftar materi |
| MaterialItem | Item per materi |
| MaterialMeta | Info video/teks |
| DragHandle | Handle untuk reorder |
| QuestionList | Daftar soal |
| QuestionItem | Item per soal |
| DifficultyBadge | Badge kesulitan |
| AIGeneratorPanel | Panel AI generator |
| ContentTypeSelect | Dropdown tipe konten |
| TopicInput | Input topik |
| DifficultySelect | Dropdown kesulitan |
| QuestionCountInput | Input jumlah soal |
| GenerateButton | Tombol generate |
| GeneratedPreview | Preview hasil generate |
| UseButton | Tombol gunakan hasil |
| EditButton | Tombol edit dulu |
| RegenerateButton | Tombol generate ulang |
| AddMaterialModal | Modal tambah materi |
| EditMaterialModal | Modal edit materi |
| AddQuestionModal | Modal tambah soal |
| EditQuestionModal | Modal edit soal |

### State
```typescript
interface ChapterContentState {
  chapter: Chapter
  contents: ContentItem[]
  // Modals
  showAddModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  showAIModal: boolean
  // Editing
  newContent: NewContent
  editingContent: ContentItem | null
  deletingContent: ContentItem | null
  // AI Generator
  aiTopic: string
  isGenerating: boolean
  // Save order
  isSaving: boolean
  saveSuccess: boolean
}

// Implemented Features:
// ✅ Edit content with modal (title, description, duration/questions/pages, status)
// ✅ Delete content with confirmation modal
// ✅ Toggle status (Published/Draft) by clicking status badge
// ✅ Reorder content with up/down arrows
// ✅ Save order with loading/success feedback
// ✅ Add new content with type selection
// ✅ AI Content Generator that adds to list
```

### Flow Diagram - AI Content Generation
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Input Topic │ --> │ Select Type │ --> │ Click       │
│ & Options   │     │ & Difficulty│     │ Generate    │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Call AI API │
                                        │ Loading...  │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ Show Preview│
                                        └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
             ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
             │ Use: Save   │            │ Edit: Open  │            │ Regenerate  │
             │ to Database │            │ Edit Modal  │            │ New Request │
             └─────────────┘            └─────────────┘            └─────────────┘
```

---

## MaterialEditorPage (`/admin/master-data/chapters/:chapterId/material/:contentId`)

### Penjelasan
Halaman untuk admin mengedit isi konten materi dengan dukungan Markdown dan LaTeX. **Default: Preview First** - menampilkan preview terlebih dahulu sebelum edit.

### Fitur
- **Preview First**: Default tab adalah Preview untuk melihat konten sebelum edit
- Edit judul, deskripsi, durasi materi
- Input video URL (YouTube, Vimeo)
- Editor konten dengan Markdown + LaTeX
- Tab Preview/Edit dengan LatexRenderer untuk rendering
- Empty state dengan tombol "Mulai Menulis"
- Simpan sebagai Draft atau Publish
- Panduan format Markdown dan LaTeX

### State
```typescript
interface MaterialEditorState {
  material: Material
  activeTab: 'edit' | 'preview' // default: 'preview'
  isSaving: boolean
  saveSuccess: boolean
}
```

---

## QuizEditorPage (`/admin/master-data/chapters/:chapterId/quiz/:contentId`)

### Penjelasan
Halaman untuk admin mengelola soal-soal dalam quiz. Menggunakan LatexRenderer untuk render soal dan opsi.

### Fitur
- Edit info quiz (judul, deskripsi, batas waktu, KKM)
- Tambah/edit/hapus soal
- Set pilihan jawaban (A-E) dengan LaTeX support
- **LatexRenderer**: Render soal dan opsi dengan LaTeX di daftar soal
- Pilih jawaban benar dengan klik
- Set tingkat kesulitan (Easy/Medium/Hard)
- Tambah pembahasan/explanation
- Reorder soal dengan drag
- Simpan sebagai Draft atau Publish

### State
```typescript
interface QuizEditorState {
  quiz: Quiz
  editingQuestion: Question | null
  showQuestionModal: boolean
  isSaving: boolean
  saveSuccess: boolean
}
```

---

## ApiLogsPage (`/admin/api-logs`)

### Penjelasan
Halaman monitoring API requests, errors, AI usage, dan system logs.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📊 API & System Logs                                           │
│  Monitor performa dan aktivitas sistem                          │
├────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                 │
│  [API Requests]  [Errors]  [AI Usage]  [System]                │
├────────────────────────────────────────────────────────────────┤
│  📈 STATISTIK HARI INI                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  1,234   │ │   12     │ │  45,000  │ │  99.9%   │          │
│  │ Requests │ │  Errors  │ │  Tokens  │ │  Uptime  │          │
│  │ Total    │ │ (0.97%)  │ │ AI Usage │ │          │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  FILTER                                                         │
│  🔍 Cari endpoint/user...  [Hari Ini ▼]  [Semua Status ▼]      │
├────────────────────────────────────────────────────────────────┤
│  📋 LOG TERBARU                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Time     │ Method │ Endpoint        │ Status│ Time │ User   ││
│  ├──────────┼────────┼─────────────────┼───────┼──────┼────────┤│
│  │ 10:23:45 │ POST   │ /api/chat       │ 🟢200 │ 1.2s │ Ahmad  ││
│  │ 10:23:42 │ GET    │ /api/quiz/1     │ 🟢200 │ 0.3s │ Sarah  ││
│  │ 10:23:40 │ POST   │ /api/chat       │ 🔴500 │ 5.0s │ Budi   ││
│  │ 10:23:38 │ GET    │ /api/ranking    │ 🟢200 │ 0.5s │ Ahmad  ││
│  │ 10:23:35 │ POST   │ /api/submit     │ 🟢201 │ 0.8s │ Dewi   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                │
│  PAGINATION                                                     │
│  [< Prev] 1 2 3 ... 50 [Next >]                                │
├────────────────────────────────────────────────────────────────┤
│  TAB: ERRORS                                                    │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 🔴 10:23:40 │ POST /api/chat │ 500 Internal Server Error   ││
│  │    User: Budi │ Token limit exceeded                       ││
│  │    [View Details]                                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                │
│  TAB: AI USAGE                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ 📊 Token Usage This Month: 1.2M / 5M (24%)                 ││
│  │ ┌──────────────────────────────────────────────────────┐   ││
│  │ │ Day │ Requests │ Tokens │ Avg/Request │ Cost ($)    │   ││
│  │ ├─────┼──────────┼────────┼─────────────┼─────────────┤   ││
│  │ │ 7 Jan │   524  │ 45,000 │    86       │   $0.90     │   ││
│  │ │ 6 Jan │   612  │ 52,000 │    85       │   $1.04     │   ││
│  │ └──────────────────────────────────────────────────────┘   ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| TabNavigation | Tab jenis log |
| StatsCard | Card statistik hari ini |
| SearchInput | Input pencarian |
| DateFilter | Dropdown filter tanggal |
| StatusFilter | Dropdown filter status |
| LogTable | Tabel log |
| LogRow | Baris per log entry |
| MethodBadge | Badge HTTP method |
| StatusCode | Status code dengan warna |
| ResponseTime | Waktu response |
| UserInfo | Info user |
| Pagination | Navigasi halaman |
| ErrorDetailModal | Modal detail error |
| AIUsageChart | Chart penggunaan token |
| AIUsageTable | Tabel usage per hari |
| CostDisplay | Display biaya |

### State
```typescript
interface ApiLogsState {
  activeTab: 'requests' | 'errors' | 'ai' | 'system'
  logs: LogEntry[]
  searchQuery: string
  dateFilter: string
  statusFilter: string
  page: number
  totalPages: number
  stats: LogStats
  selectedLog: LogEntry | null
}
```

---

## Data Models

```typescript
interface School {
  id: number
  name: string
  code: string
  address?: string
  city: string
  province?: string
  status: 'active' | 'inactive'
  teacherCount: number
  studentCount: number
  createdAt: Date
}

interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  schoolId: number
  school?: School
  status: 'active' | 'pending' | 'inactive'
  createdAt: Date
}

interface Chapter {
  id: number
  title: string
  description?: string
  gradeLevel: 'X' | 'XI' | 'XII'
  order: number
  status: 'active' | 'draft'
  materialCount: number
  questionCount: number
}

interface Material {
  id: number
  chapterId: number
  title: string
  order: number
  videoUrl?: string
  videoDuration?: number
  content: string
  wordCount: number
}

interface Question {
  id: number
  chapterId: number
  text: string
  options: { id: string; text: string }[]
  correctAnswer: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  source: 'system' | 'teacher'
  authorId?: number
  usedCount: number
}

interface LogEntry {
  id: string
  timestamp: Date
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  statusCode: number
  responseTime: number
  userId?: number
  userName?: string
  error?: string
}
```

---

## AdminTambahSoalPage (`/admin/master-data/questions/create`)

### Penjelasan
Halaman untuk admin menambah Soal Sistem ke bank soal. Fitur lengkap dengan LaTeX editor, image upload, dan preview.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Bank Soal / Tambah Soal Sistem                              │
├────────────────────────────────────────────────────────────────┤
│  📦 INFORMASI SOAL                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐  │
│  │ Kelas  ▼  │ │ Bab    ▼  │ │ Kesulitan: 🟢 🟡 🔴        │  │
│  └────────────┘ └────────────┘ └────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  📝 SOAL (Editor + Preview)                                     │
│  [Σ] [√] [∫] [π] [frac] [x²] [Editor/Preview]                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Tulis soal dengan LaTeX...                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  [📷 Upload Gambar]                                             │
├────────────────────────────────────────────────────────────────┤
│  ✅ PILIHAN JAWABAN                                             │
│  ○ A: [input jawaban]   ○ D: [input jawaban]                   │
│  ● B: [input jawaban]   ○ E: [input jawaban]                   │
│  ○ C: [input jawaban]                                          │
├────────────────────────────────────────────────────────────────┤
│  💡 PEMBAHASAN (Opsional)                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Penjelasan jawaban...                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [Batal]                    [💾 Simpan Draft] [✓ Publikasi]    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| GradeSelect | Dropdown pilih kelas |
| ChapterSelect | Dropdown pilih bab |
| DifficultySelector | Toggle kesulitan |
| LatexEditor | Editor dengan toolbar LaTeX |
| PreviewToggle | Toggle editor/preview |
| ImageUpload | Upload gambar soal |
| AnswerOptions | Input jawaban A-E |
| CorrectAnswerSelector | Selector jawaban benar |
| ExplanationInput | Textarea pembahasan |
| DraftButton | Simpan draft |
| PublishButton | Simpan & publikasi |

---

## AdminTambahMateriPage (`/admin/master-data/materials/create`)

### Penjelasan
Halaman untuk admin menambah Materi Sistem ke bank materi. Mendukung video URL, file upload, dan LaTeX content editor.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Bank Materi / Tambah Materi Sistem                          │
├────────────────────────────────────────────────────────────────┤
│  📦 INFORMASI MATERI                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Judul Materi *                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐  │
│  │ Kelas  ▼  │ │ Bab    ▼  │ │ Durasi: [15 menit]         │  │
│  └────────────┘ └────────────┘ └────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  🎬 VIDEO (Opsional)                                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ https://youtube.com/watch?v=...                           │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  📎 FILE PENDUKUNG (Opsional)                                   │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│        📄 Upload PDF, DOCX, PPTX (Max 10MB)                    │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
├────────────────────────────────────────────────────────────────┤
│  📝 KONTEN MATERI                              [Editor|Preview] │
│  [H1] [H2] [B] [I] [Σ] [√] [∫] [frac]                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ # Judul Materi                                            │  │
│  │ ## Sub Judul                                              │  │
│  │ Penjelasan dengan rumus: $\sin^2 x + \cos^2 x = 1$        │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [Batal]                    [💾 Simpan Draft] [✓ Publikasi]    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| TitleInput | Input judul materi |
| GradeSelect | Dropdown pilih kelas |
| ChapterSelect | Dropdown pilih bab |
| DurationInput | Input durasi baca |
| VideoUrlInput | Input URL video |
| FileUpload | Upload file PDF/DOCX |
| LatexEditor | Editor Markdown + LaTeX |
| PreviewTab | Preview dengan LatexRenderer |
| DraftButton | Simpan draft |
| PublishButton | Simpan & publikasi |

---

## AdminContentEditorPage (`/admin/master-data/content/create`) ✅

### Penjelasan
Halaman unified untuk admin membuat konten sistem (materi atau soal) dengan fitur lengkap.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Master Data / Tambah Konten Sistem                          │
│  ➕ Tambah Konten Sistem                                       │
├────────────────────────────────────────────────────────────────┤
│  PILIH JENIS KONTEN                                            │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ 📄 MATERI SISTEM        │  │ ❓ SOAL SISTEM              │  │
│  │ Konten untuk bank materi│  │ Soal untuk bank soal         │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [MATERIAL FORM - jika Materi dipilih]                         │
│  • Info: Judul, Kelas, Bab, Durasi                             │
│  • Video URL (opsional)                                        │
│  • File Upload (opsional)                                      │
│  • Konten dengan LaTeX Toolbar + Preview                       │
├────────────────────────────────────────────────────────────────┤
│  [QUIZ FORM - jika Soal dipilih]                               │
│  SUMBER SOAL:                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ ✏️ BUAT MANUAL          │  │ 📚 AMBIL DARI BANK SOAL     │  │
│  │ Tulis soal sendiri      │  │ Pilih soal yang sudah ada    │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                │
│  [Manual: Form soal dengan LaTeX toolbar]                      │
│  [Import: Modal Bank Soal dengan search/filter]                │
├────────────────────────────────────────────────────────────────┤
│  [Batal]                    [💾 Simpan Draft] [✓ Publikasi]    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ContentTypeSelector | Pilih Materi/Soal Sistem |
| QuizModeSelector | Pilih Buat Manual/Ambil dari Bank |
| MaterialForm | Form lengkap materi dengan LaTeX |
| QuizForm | Form soal dengan jawaban A-E |
| BankSoalModal | Modal pilih soal dari bank |
| SearchFilter | Search + filter bab + kesulitan |
| LatexToolbar | Tombol Σ √ ∫ π frac x² xₙ ≤ ≥ ∞ |
| SelectedQuestionsList | Daftar soal terpilih |

### Link dari ChapterContentPage
Tombol "Tambah Materi" di `/admin/master-data/chapters/:id/content` sekarang langsung link ke halaman ini.


