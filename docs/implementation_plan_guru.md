# Implementation Plan - Halaman Guru (Teacher Pages)

---

# 👨‍🏫 GURU PAGES

## TeacherDashboard (`/guru`)

### Penjelasan
Dashboard utama guru menampilkan overview kelas, statistik siswa, dan alerts.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  Selamat Datang, Ibu Ani! 👩‍🏫                                   │
│  SMAN 1 Jakarta                                                │
├────────────────────────────────────────────────────────────────┤
│  STATS CARDS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 3 Kelas  │ │ 87 Siswa │ │ 72% Avg  │ │ 5 Alert  │          │
│  │ Aktif    │ │ Total    │ │ Progress │ │ ⚠️ Perlu │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  📊 KELAS AKTIF                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ XII-IPA 1 │ 32 siswa │ ████████░░ 78% │ [Lihat →]       │   │
│  │ XII-IPA 2 │ 30 siswa │ ██████░░░░ 65% │ [Lihat →]       │   │
│  │ XI-IPA 1  │ 25 siswa │ ████░░░░░░ 45% │ [Lihat →]       │   │
│  └─────────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────────┤
│  ⚠️ SISWA PERLU PERHATIAN                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👤 Siti Nurhaliza - Progress < 50% - XII-IPA 1          │   │
│  │ 👤 Rizky Pratama - Tidak aktif 3 hari - XII-IPA 2       │   │
│  │ [Lihat Semua →]                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| WelcomeHeader | Header dengan nama dan sekolah |
| StatCard | Card statistik |
| ClassList | Daftar kelas aktif |
| ClassItem | Item kelas dengan progress |
| AlertList | Daftar siswa perlu perhatian |
| AlertItem | Item alert per siswa |

---

## KelasPage (`/guru/kelas`)

### Penjelasan
Halaman daftar semua kelas yang diampu guru.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📚 Manajemen Kelas                    [+ Buat Kelas Baru]      │
│  Kelola kelas dan siswa Anda                                    │
├────────────────────────────────────────────────────────────────┤
│  CLASS GRID                                                     │
│  ┌────────────────────┐ ┌────────────────────┐                 │
│  │ ▬▬▬▬▬ blue         │ │ ▬▬▬▬▬ emerald     │                 │
│  │ XII-IPA 1          │ │ XII-IPA 2          │                 │
│  │ Kode: ABC123 [📋]  │ │ Kode: DEF456 [📋]  │                 │
│  │ 32 siswa           │ │ 30 siswa           │                 │
│  │ ████████░░ 72%     │ │ ██████░░░░ 68%     │                 │
│  │ Dibuat: 10 Jan     │ │ Dibuat: 12 Jan     │                 │
│  └────────────────────┘ └────────────────────┘                 │
│                                                                │
│  ┌────────────────────┐                                        │
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ┐ │                                        │
│  │      [+ Buat]     │  Empty state card                      │
│  │   Kelas Baru      │                                        │
│  │ └ ─ ─ ─ ─ ─ ─ ─ ┘ │                                        │
│  └────────────────────┘                                        │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan tombol tambah |
| ClassGrid | Grid container kelas |
| ClassCard | Card per kelas |
| ClassCodeBadge | Badge kode kelas |
| CopyButton | Tombol copy kode |
| ProgressBar | Progress bar siswa |
| EmptyStateCard | Card untuk buat kelas baru |

---

## CreateKelasPage (`/guru/kelas/create`)

### Penjelasan
Form untuk membuat kelas baru.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                   Buat Kelas Baru                    │
├────────────────────────────────────────────────────────────────┤
│  Nama Kelas *                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ XII-IPA 1                                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Mata Pelajaran *                                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Matematika Wajib                                      ▼  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Tingkat Kelas *                                                │
│  [○ Kelas X]  [● Kelas XI]  [○ Kelas XII]                      │
│                                                                │
│  Deskripsi (opsional)                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Kelas matematika untuk jurusan IPA...                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [Batal]                              [💾 Buat Kelas]          │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Tombol kembali |
| NameInput | Input nama kelas |
| SubjectSelect | Dropdown mata pelajaran |
| GradeSelector | Radio button tingkat kelas |
| DescriptionInput | Textarea deskripsi |
| SubmitButton | Tombol buat kelas |

---

## KelasDetailPage (`/guru/kelas/:id`)

### Penjelasan
Detail kelas dengan kurikulum, daftar siswa, dan aksi cepat.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali             XII-IPA 1 • Matematika Wajib            │
│                        32 siswa • SMAN 1 Jakarta               │
├────────────────────────────────────────────────────────────────┤
│  Kode Kelas: MTK-XII-001              [📋 Copy] [🔗 Share]     │
├────────────────────────────────────────────────────────────────┤
│  QUICK STATS                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 32 Siswa │ │ 78% Avg  │ │ 5 Bab    │ │ 2 Perlu  │          │
│  │ Total    │ │ Progress │ │ Aktif    │ │ Atensi   │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                  │
│  [📥 Export Laporan] [📖 Assign Bab] [⚙️ Setting KKM]          │
├────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                 │
│  [Kurikulum & Materi]        [Daftar Siswa]                    │
├────────────────────────────────────────────────────────────────┤
│  TAB: KURIKULUM                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ✅ Bab 1: Limit Fungsi         │ 100% │ KKM: 75         │  │
│  │ ✅ Bab 2: Turunan              │ 100% │ KKM: 75         │  │
│  │ 🔄 Bab 3: Trigonometri         │ 65%  │ KKM: 75         │  │
│  │ ⏹️ Bab 4: Integral             │ 0%   │ Belum dimulai   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  TAB: DAFTAR SISWA                                              │
│  ┌────┬────────────────┬────────┬────────┬───────┬───────────┐ │
│  │ #  │ Nama           │ Ranking│ Progres│ Skor  │ Aksi      │ │
│  ├────┼────────────────┼────────┼────────┼───────┼───────────┤ │
│  │ 1  │ Sarah Amelia   │ 🥇 1   │ 92%    │ 95    │ [👁] [✉️] │ │
│  │ 2  │ Ahmad Pratama  │ 🥉 3   │ 78%    │ 82    │ [👁] [✉️] │ │
│  │ 3  │ Budi Santoso   │ #7     │ 65%    │ 70    │ [👁] [✉️] │ │
│  └────┴────────────────┴────────┴────────┴───────┴───────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ClassHeader | Header dengan info kelas |
| ClassCodeCard | Card kode kelas |
| QuickStats | Grid statistik |
| QuickActions | Tombol aksi cepat |
| TabNavigation | Tab kurikulum/siswa |
| CurriculumList | Daftar bab/kurikulum |
| ChapterItem | Item bab dengan status |
| StudentTable | Tabel siswa |
| StudentRow | Baris per siswa |
| RankBadge | Badge ranking |
| ActionButtons | Tombol view/message |
| ExportModal | Modal export laporan |

---

## AssignBabPage (`/guru/kelas/:id/bab`)

### Penjelasan
Halaman untuk assign/tarik template bab dari master data admin.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                 Assign Bab ke XII-IPA 1             │
├────────────────────────────────────────────────────────────────┤
│  BAB TERSEDIA (dari Master Data Admin)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ☑️ Bab 1: Limit Fungsi         │ 6 materi │ 15 soal     │  │
│  │ ☑️ Bab 2: Turunan              │ 8 materi │ 20 soal     │  │
│  │ ☑️ Bab 3: Trigonometri         │ 7 materi │ 18 soal     │  │
│  │ ☐  Bab 4: Integral             │ 5 materi │ 12 soal     │  │
│  │ ☐  Bab 5: Logaritma            │ 4 materi │ 10 soal     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [Batal]                              [💾 Simpan Perubahan]    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| ChapterCheckbox | Checkbox per bab |
| ChapterInfo | Info materi dan soal |
| SaveButton | Tombol simpan |

---

## KKMSettingsPage (`/guru/kelas/:id/kkm`)

### Penjelasan
Halaman pengaturan nilai minimum (KKM) per bab.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali              Setting KKM - XII-IPA 1                │
├────────────────────────────────────────────────────────────────┤
│  📊 Kriteria Ketuntasan Minimal (KKM) per Bab                  │
│                                                                │
│  ┌────────────────────────────┬─────────────────────────────┐  │
│  │ Bab                        │ KKM (0-100)                 │  │
│  ├────────────────────────────┼─────────────────────────────┤  │
│  │ Limit Fungsi               │ [75]                        │  │
│  │ Turunan                    │ [75]                        │  │
│  │ Trigonometri               │ [70]                        │  │
│  │ Integral                   │ [75]                        │  │
│  └────────────────────────────┴─────────────────────────────┘  │
│                                                                │
│  💡 Tips: KKM default adalah 75. Siswa yang tidak mencapai     │
│     KKM akan diarahkan ke jalur remedial.                      │
│                                                                │
│  [Batal]                              [💾 Simpan KKM]          │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| KKMTable | Tabel setting KKM |
| KKMInput | Input number per bab |
| TipsCard | Card tips/info |
| SaveButton | Tombol simpan |

---

## BankSoalPage (`/guru/bank-soal`)

### Penjelasan
Bank soal dengan sistem rating berdasarkan penggunaan.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📚 Bank Soal                              [+ Tambah Soal]      │
├────────────────────────────────────────────────────────────────┤
│  TAB FILTER                                                     │
│  [Semua Soal]  [Soal Sistem]  [Soal Saya]                      │
├────────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER                                                │
│  🔍 Cari soal...   [Bab ▼]   [Kesulitan ▼]   [Urutkan ▼]       │
├────────────────────────────────────────────────────────────────┤
│  QUESTION LIST                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📝 Nilai dari sin 30° adalah...          ⭐⭐⭐⭐⭐ (25x)   │  │
│  │    Trigonometri │ 🟢 Easy │ System │ Admin              │  │
│  │    [👁 Preview] [✏️ Edit] [🗑️ Hapus]                     │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📝 Turunan dari f(x) = x³ + 2x...        ⭐⭐⭐⭐ (18x)    │  │
│  │    Turunan │ 🟡 Medium │ Teacher │ Bu Ani               │  │
│  │    [👁 Preview] [✏️ Edit] [🗑️ Hapus]                     │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 📝 Hitung integral ∫x² dx...             ⭐⭐⭐ (8x)      │  │
│  │    Integral │ 🔴 Hard │ System │ Admin                  │  │
│  │    [👁 Preview]                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan tombol tambah |
| TabFilter | Tab filter soal |
| SearchInput | Input pencarian |
| ChapterFilter | Dropdown filter bab |
| DifficultyFilter | Dropdown kesulitan |
| SortDropdown | Dropdown urutan |
| QuestionCard | Card per soal |
| QuestionPreview | Preview soal |
| StarRating | Rating bintang |
| DifficultyBadge | Badge kesulitan (Easy/Med/Hard) |
| SourceBadge | Badge sumber (System/Teacher) |
| ActionButtons | Tombol preview/edit/delete |
| PreviewModal | Modal preview soal |

### Flow Diagram - Rating System
```
┌─────────────┐
│ Soal digunakan│
│   dalam kuis  │
└───────────────┘
        │
        ▼
┌─────────────┐
│ usedCount++ │
└─────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ Calculate Star Rating:             │
│ 1-5 uses   = ⭐                    │
│ 6-10 uses  = ⭐⭐                   │
│ 11-15 uses = ⭐⭐⭐                  │
│ 16-20 uses = ⭐⭐⭐⭐                 │
│ 21+ uses   = ⭐⭐⭐⭐⭐                │
└───────────────────────────────────┘
```

---

## TambahSoalPage (`/guru/bank-soal/tambah`)

### Penjelasan
Form untuk menambah soal baru ke bank soal.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                    Tambah Soal Baru                 │
├────────────────────────────────────────────────────────────────┤
│  Pilih Bab *                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Trigonometri                                          ▼  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Tingkat Kesulitan *                                            │
│  [🟢 Easy]   [🟡 Medium]   [🔴 Hard]                           │
│                                                                │
│  Pertanyaan * (support LaTeX dengan $...$)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Nilai dari $\sin 45°$ adalah...                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Pilihan Jawaban *                                              │
│  ○ A: ┌─────────────────────────────────────────────────────┐  │
│       │ $\frac{1}{2}$                                       │  │
│       └─────────────────────────────────────────────────────┘  │
│  ○ B: ┌─────────────────────────────────────────────────────┐  │
│       │ $\frac{\sqrt{2}}{2}$                                │  │
│       └─────────────────────────────────────────────────────┘  │
│  ● C: ┌─────────────────────────────────────────────────────┐  │ ← Correct
│       │ $\frac{\sqrt{3}}{2}$                                │  │
│       └─────────────────────────────────────────────────────┘  │
│  ○ D-E: ...                                                    │
│                                                                │
│  Penjelasan Jawaban (opsional)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ sin 45° = √2/2 karena...                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [Batal]                              [💾 Simpan Soal]         │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ChapterSelect | Dropdown pilih bab |
| DifficultySelector | Radio button kesulitan |
| QuestionTextarea | Textarea pertanyaan + LaTeX |
| LatexPreview | Preview render LaTeX |
| OptionInput | Input per opsi jawaban |
| CorrectAnswerRadio | Radio untuk jawaban benar |
| ExplanationTextarea | Textarea penjelasan |
| SaveButton | Tombol simpan |

---

## EditSoalPage (`/guru/bank-soal/:id`)

### Penjelasan
Form edit soal yang sudah ada (hanya untuk soal milik sendiri).

### Komponen
Sama dengan TambahSoalPage, ditambah:
| Komponen | Deskripsi |
|----------|-----------|
| DeleteButton | Tombol hapus soal |
| ConfirmDeleteModal | Modal konfirmasi hapus |

---

## MonitoringPage (`/guru/monitoring`)

### Penjelasan
Halaman monitoring progress seluruh siswa dengan fitur export.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📊 Monitoring Siswa                    [📥 Export Laporan]     │
│  Pantau progres dan performa siswa                              │
├────────────────────────────────────────────────────────────────┤
│  STATS OVERVIEW                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 87 Siswa │ │ 69% Avg  │ │ 75 Skor  │ │ 5 Alert  │          │
│  │ Total    │ │ Progress │ │ Rata-rata│ │ ⚠️ Perlu │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER                                                │
│  🔍 Cari siswa...   [Semua Kelas ▼]   [Urutkan: Nama ▼]        │
├────────────────────────────────────────────────────────────────┤
│  STUDENT GRID                                                   │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐     │
│  │ 👤 Sarah       │ │ 👤 Ahmad       │ │ 👤 Budi        │     │
│  │ XII-IPA 1  ↗  │ │ XII-IPA 1  ↗  │ │ XII-IPA 1  →  │     │
│  │ ██████████ 92%│ │ ████████░░ 78%│ │ ██████░░░░ 65%│     │
│  │ Skor: 95      │ │ Skor: 82      │ │ Skor: 70      │     │
│  │ 🔥 21 hari    │ │ 🔥 15 hari    │ │ 🔥 8 hari     │     │
│  └────────────────┘ └────────────────┘ └────────────────┘     │
└────────────────────────────────────────────────────────────────┘

EXPORT MODAL:
┌───────────────────────────────────────────────────────────────┐
│  📥 Export Laporan Monitoring                            [✕]  │
├───────────────────────────────────────────────────────────────┤
│  Tingkat Kelas:                                               │
│  ☑️ Kelas X   ☑️ Kelas XI   ☑️ Kelas XII   ☑️ Semua           │
│                                                               │
│  Data yang Diekspor:                                          │
│  ☑️ 🏆 Ranking Siswa                                          │
│  ☑️ 📊 Progress Belajar                                       │
│  ☑️ 📝 Nilai Kuis & Post-Test                                 │
│  ☑️ ⚠️ Daftar Siswa Kesulitan                                 │
│                                                               │
│  Format:  [XLSX]  [PDF]  [CSV]                                │
│                                                               │
│  📋 Preview: 87 siswa akan diekspor                           │
│                                                               │
│  [Batal]                              [📥 Export]             │
└───────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan export button |
| StatsCard | Card statistik overview |
| SearchInput | Input pencarian |
| ClassFilter | Dropdown filter kelas |
| SortDropdown | Dropdown urutan |
| StudentGrid | Grid container siswa |
| StudentCard | Card per siswa |
| TrendIndicator | Indikator trend (↗/→/↘) |
| ProgressBar | Progress bar |
| StreakBadge | Badge streak |
| ExportButton | Tombol buka modal export |
| ExportModal | Modal export dengan opsi |
| GradeLevelCheckbox | Checkbox tingkat kelas |
| DataTypeCheckbox | Checkbox data to export |
| FormatSelector | Selector format export |

---

## StudentDetailPage (`/guru/monitoring/siswa/:id`)

### Penjelasan
Detail lengkap per siswa dengan tabs progress, nilai, chat AI, dan materi.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                                                      │
├────────────────────────────────────────────────────────────────┤
│  STUDENT HEADER                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌─────────┐  Ahmad Pratama                              │  │
│  │  │ [Avatar]│  XII-IPA 1 • SMAN 1 Jakarta                │  │
│  │  └─────────┘  🥉 Rank #3 • Level 11 • 🔥 15 hari        │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                 │
│  [📊 Progres]  [📝 Nilai]  [💬 Chat AI]  [📚 Materi]           │
├────────────────────────────────────────────────────────────────┤
│  TAB: PROGRES                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Bab             │ Progress │ Quiz │ Post-Test │ Status    │ │
│  ├─────────────────┼──────────┼──────┼───────────┼───────────┤ │
│  │ Limit Fungsi    │ 78%      │ 82   │ -         │ 🟡 Ongoing│ │
│  │ Turunan         │ 100%     │ 88   │ 92        │ 🟢 Selesai│ │
│  │ Trigonometri    │ 100%     │ 85   │ 90        │ 🟢 Selesai│ │
│  │ Integral        │ 0%       │ -    │ -         │ ⚪ Belum  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  TAB: CHAT AI                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 💬 Limit Fungsi • 5 menit lalu                            │ │
│  │    "Bagaimana cara menghitung limit x→0..."               │ │
│  │ 💬 Trigonometri • 1 jam lalu                              │ │
│  │    "Jelaskan rumus sin 2θ..."                             │ │
│  └───────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│  ACTIONS                                                        │
│  [✉️ Kirim Pesan]  [📝 Berikan Remedial]  [📥 Export Laporan]  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| StudentHeader | Header info siswa |
| TabNavigation | Tab navigation |
| ProgressTable | Tabel progress per bab |
| ScoreTable | Tabel nilai |
| ChatList | Daftar history chat AI |
| MaterialList | Daftar materi dipelajari |
| MessageModal | Modal kirim pesan |
| RemedialModal | Modal berikan remedial |

---

## StrugglePage (`/guru/monitoring/struggle`)

### Penjelasan
Daftar siswa yang membutuhkan perhatian khusus.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali                   ⚠️ Siswa Perlu Perhatian           │
├────────────────────────────────────────────────────────────────┤
│  FILTER                                                         │
│  [Progress < 50%]  [Tidak Aktif]  [Nilai Rendah]               │
├────────────────────────────────────────────────────────────────┤
│  STUDENT LIST                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 👤 Siti Nurhaliza • XII-IPA 1                            │  │
│  │    ⚠️ Progress: 35% • Tidak aktif 3 hari                 │  │
│  │    [📧 Kirim Pesan] [📝 Remedial] [👁 Detail]            │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 👤 Rizky Pratama • XII-IPA 2                             │  │
│  │    ⚠️ Nilai Post-Test: 55 (< KKM)                        │  │
│  │    [📧 Kirim Pesan] [📝 Remedial] [👁 Detail]            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| FilterTabs | Tab filter tipe masalah |
| StruggleStudentCard | Card per siswa |
| WarningBadge | Badge warning |
| ActionButtons | Tombol aksi |

---

## AuditPage (`/guru/audit`)

### Penjelasan
Halaman untuk audit interaksi siswa dengan AI Tutor.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Audit Interaksi AI                                          │
│  Review dan koreksi jawaban AI Tutor                            │
├────────────────────────────────────────────────────────────────┤
│  TAB FILTER                                                     │
│  [Semua]  [Perlu Review]  [Sudah Review]                       │
├────────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER                                                │
│  🔍 Cari siswa/topik...     [Kelas ▼]   [Tanggal ▼]            │
├────────────────────────────────────────────────────────────────┤
│  CHAT LIST                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 💬 Ahmad Pratama • Limit Fungsi • 5 menit lalu          │  │
│  │    "Bagaimana cara menghitung limit x→0..."             │  │
│  │    Status: 🟡 Perlu Review     [Lihat Detail →]         │  │
│  ├──────────────────────────────────────────────────────────│  │
│  │ 💬 Sarah Amelia • Trigonometri • 1 jam lalu             │  │
│  │    "Jelaskan rumus sin 2θ..."                           │  │
│  │    Status: 🟢 Sudah Review     [Lihat Detail →]         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header halaman |
| TabFilter | Tab status review |
| SearchInput | Input pencarian |
| ClassFilter | Dropdown kelas |
| DateFilter | Filter tanggal |
| ChatAuditItem | Item audit per chat |
| StatusBadge | Badge status (🟡/🟢) |

---

## AuditDetailPage (`/guru/audit/:id`)

### Penjelasan
Detail percakapan AI untuk direview dan dikoreksi.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kembali              Ahmad Pratama • Limit Fungsi           │
├────────────────────────────────────────────────────────────────┤
│  CONVERSATION                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 👤 10:24 AM                                               │  │
│  │ Bagaimana cara menghitung limit x→0 dari sin(x)/x?       │  │
│  │                                                          │  │
│  │ 🤖 10:24 AM                                               │  │
│  │ Limit ini adalah limit penting dalam kalkulus...         │  │
│  │ Coba pikirkan, apa yang terjadi jika x = 0?              │  │
│  │ ─────────────────────────────────────────────────────    │  │
│  │ [✅ Benar] [❌ Perlu Koreksi]                              │  │
│  │                                                          │  │
│  │ 👤 10:25 AM                                               │  │
│  │ Hasilnya 0/0 yang tidak terdefinisi                      │  │
│  │                                                          │  │
│  │ 🤖 10:25 AM                                               │  │
│  │ Benar! Karena bentuk 0/0, kita gunakan L'Hôpital:        │  │
│  │ lim(x→0) sin(x)/x = lim(x→0) cos(x)/1 = 1               │  │
│  │ ─────────────────────────────────────────────────────    │  │
│  │ [✅ Benar] [❌ Perlu Koreksi]                              │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  CORRECTION SECTION (jika ada koreksi)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Koreksi untuk jawaban AI:                                │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ Penjelasan lebih akurat: ...                       │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [💾 Simpan Review]                                             │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ChatHeader | Header dengan info siswa/topik |
| ConversationView | View percakapan |
| MessageBubble | Bubble per pesan |
| AuditActions | Tombol benar/koreksi per AI message |
| CorrectionInput | Input koreksi |
| SaveButton | Tombol simpan review |

---

## TeacherProfilePage (`/guru/profil`)

### Penjelasan
Halaman profil guru dengan edit profil dan pengaturan.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  PROFILE HEADER                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌─────────┐  Ibu Ani Suryani, S.Pd                      │  │
│  │  │ [Avatar]│  ani@sman1.sch.id                           │  │
│  │  │   📷    │  SMAN 1 Jakarta                             │  │
│  │  └─────────┘  [✏️ Edit Profil]                            │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  📚 KELAS YANG DIAMPU                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ XII-IPA 1 • 32 siswa │ XII-IPA 2 • 30 siswa              │  │
│  │ XI-IPA 1 • 25 siswa                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  ⚙️ PENGATURAN                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🌙 Mode Gelap                            [Toggle: Off]   │  │
│  │ 🔔 Notifikasi Email                      [Toggle: On]    │  │
│  │ 🔑 Ubah Password                         [Button →]      │  │
│  │ 🚪 Logout                                [Button →]      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ProfileHeader | Header dengan avatar |
| AvatarUpload | Upload foto profil |
| EditProfileButton | Tombol edit profil |
| ClassList | Daftar kelas diampu |
| SettingsSection | Section pengaturan |
| SettingsToggle | Toggle setting |
| ChangePasswordButton | Tombol ubah password |
| LogoutButton | Tombol logout |

---

## BankMateriPage (`/guru/bank-materi`)

### Penjelasan
Bank materi untuk guru, menampilkan materi dari sistem dan materi buatan sendiri dengan sistem rating.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  📚 Bank Materi                            [+ Tambah Materi]    │
├────────────────────────────────────────────────────────────────┤
│  TAB FILTER                                                     │
│  [Semua Materi]  [Materi Saya]                                 │
├────────────────────────────────────────────────────────────────┤
│  SEARCH & FILTER                                                │
│  🔍 Cari materi...   [Kelas ▼]   [Bab ▼]   [📋/📱]             │
├────────────────────────────────────────────────────────────────┤
│  MATERIAL TABLE VIEW                                            │
│  ┌────┬──────────────────┬──────┬───────┬──────┬─────┬───────┐ │
│  │ #  │ Judul            │Kelas │ Bab   │ ⭐⭐⭐│Pemb.│ Aksi  │ │
│  ├────┼──────────────────┼──────┼───────┼──────┼─────┼───────┤ │
│  │ 1  │ Pengenalan Sin   │ XII  │ Trigo │ ⭐⭐⭐⭐⭐│ 🏛️  │ [👁]  │ │
│  │ 2  │ Turunan Fungsi   │ XI   │ Deriv │ ⭐⭐⭐⭐│ Saya│ [✏️]  │ │
│  └────┴──────────────────┴──────┴───────┴──────┴─────┴───────┘ │
│                                                                │
│  MATERIAL GRID VIEW                                             │
│  ┌────────────────────┐ ┌────────────────────┐                 │
│  │ XII │ Trigo        │ │ XI │ Turunan       │                 │
│  │ Pengenalan Sin     │ │ Aplikasi Turunan  │                 │
│  │ ⏱️ 15 menit        │ │ ⏱️ 25 menit        │                 │
│  │ ⭐⭐⭐⭐⭐ │ 🏛️ Sistem │ │ ⭐⭐⭐⭐ │ 👤 Saya   │                 │
│  │ [Lihat] [Edit*]    │ │ [Lihat] [Edit]    │                 │
│  └────────────────────┘ └────────────────────┘                 │
│  *Edit only visible for own materials                          │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| PageHeader | Header dengan tombol tambah |
| TabFilter | Tab Semua Materi / Materi Saya |
| SearchInput | Input pencarian |
| GradeFilter | Dropdown filter kelas |
| ChapterFilter | Dropdown filter bab |
| ViewToggle | Toggle table/grid view |
| MaterialTable | Tabel view materi |
| MaterialGrid | Grid view materi |
| MaterialCard | Card per materi |
| StarRating | Rating bintang |
| SourceBadge | Badge sumber (Sistem/Saya) |
| PreviewModal | Modal preview materi |
| ActionButtons | Tombol lihat/edit |

---

## TambahMateriPage (`/guru/bank-materi/create`)

### Penjelasan
Form untuk menambah materi pembelajaran baru ke bank materi.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Bank Materi / Tambah Materi Baru                            │
├────────────────────────────────────────────────────────────────┤
│  📦 INFORMASI MATERI                                            │
│                                                                │
│  Judul Materi *                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Pengenalan Trigonometri                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌────────────────────────┐ ┌────────────────────────────┐    │
│  │ Tingkat Kelas *     ▼ │ │ Bab *                    ▼ │    │
│  │ Kelas XII              │ │ Trigonometri              │    │
│  └────────────────────────┘ └────────────────────────────┘    │
│                                                                │
│  ┌────────────────────────┐                                    │
│  │ Estimasi Durasi        │   Status                          │
│  │ 15 menit               │   ○ Draft  ● Published           │
│  └────────────────────────┘                                    │
├────────────────────────────────────────────────────────────────┤
│  📝 KONTEN MATERI                                               │
│  (Mendukung Markdown + LaTeX dengan $rumus$)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ # Judul Materi                                            │  │
│  │                                                           │  │
│  │ ## Sub Judul                                              │  │
│  │                                                           │  │
│  │ Penjelasan materi...                                      │  │
│  │                                                           │  │
│  │ Rumus: $\sin^2 x + \cos^2 x = 1$                          │  │
│  └──────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────┤
│  [Batal]                              [💾 Simpan Materi]       │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| BackButton | Breadcrumb + tombol kembali |
| TitleInput | Input judul materi |
| GradeSelect | Dropdown pilih kelas |
| ChapterSelect | Dropdown pilih bab |
| DurationInput | Input durasi baca |
| StatusRadio | Radio button status |
| ContentTextarea | Textarea konten Markdown+LaTeX |
| SaveButton | Tombol simpan |

---

## ContentEditorPage (`/guru/kelas/:id/content/create`)

### Penjelasan
Halaman full-page untuk menambah konten baru ke kelas. Menggantikan popup modal di KelasDetailPage. Mendukung pemilihan jenis konten (Materi/Kuis) dan fitur lengkap.

### Wireframe
```
┌────────────────────────────────────────────────────────────────┐
│  ← Kelas / Tambah Konten Baru                                  │
├────────────────────────────────────────────────────────────────┤
│  PILIH JENIS KONTEN                                             │
│  ┌────────────────────────────────┐ ┌──────────────────────────┐│
│  │ 📝 MATERI                       │ │ ❓ KUIS                  ││
│  │ Konten pembelajaran dengan     │ │ Soal latihan atau ujian  ││
│  │ teks, video, dan file          │ │ untuk siswa              ││
│  └────────────────────────────────┘ └──────────────────────────┘│
├────────────────────────────────────────────────────────────────┤
│  [MATERIAL FORM - Jika Materi dipilih]                          │
│  • Info: Judul, Bab, Durasi                                    │
│  • Video URL (opsional)                                        │
│  • File Upload (opsional)                                      │
│  • Konten Markdown+LaTeX dengan Preview                        │
├────────────────────────────────────────────────────────────────┤
│  [QUIZ FORM - Jika Kuis dipilih]                                │
│  • Info: Judul, Bab, Kesulitan                                 │
│  • Soal dengan LaTeX toolbar                                   │
│  • Image upload                                                │
│  • Pilihan jawaban A-E                                         │
│  • Pembahasan                                                  │
├────────────────────────────────────────────────────────────────┤
│  [Batal]                    [💾 Simpan Draft] [✓ Publikasi]    │
└────────────────────────────────────────────────────────────────┘
```

### Komponen
| Komponen | Deskripsi |
|----------|-----------|
| ContentTypeSelector | Toggle pilih Materi/Kuis |
| MaterialForm | Form lengkap materi |
| QuizForm | Form lengkap kuis |
| VideoUrlInput | Input URL video |
| FileUpload | Upload file PDF/DOCX |
| LatexEditor | Editor dengan toolbar LaTeX |
| PreviewTab | Toggle editor/preview |
| AnswerOptions | Input jawaban A-E |
| DraftButton | Simpan draft |
| PublishButton | Simpan & publikasi |

### Flow
```
KelasDetailPage
      │
      ▼ (Klik "Tambah Konten")
ContentEditorPage
      │
      ├─> Pilih Materi ──> Material Form
      │
      └─> Pilih Kuis ──> Mode Selector
                              │
                              ├─> Buat Manual ──> Quiz Form
                              │
                              └─> Ambil dari Bank Soal ──> Modal Bank Soal
                                        │                    (Search/Filter)
                                        ▼
                                   Pilih Soal → Import
      │
      ▼ (Simpan)
Kembali ke KelasDetailPage
```

### Fitur Baru: Quiz Import dari Bank Soal
- **Mode Selector**: Tab "Buat Manual" atau "Ambil dari Bank Soal"
- **Bank Soal Modal**: Popup dengan daftar soal dari bank
- **Search & Filter**: Cari berdasarkan teks, filter berdasarkan bab dan kesulitan
- **Question Selection**: Checkbox untuk pilih multiple soal
- **Import**: Soal terpilih ditampilkan di list dengan opsi hapus


