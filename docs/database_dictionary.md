# Kamus Data (Data Dictionary)
**Sistem Pembelajaran Adaptif Matematika SMA**

Dokumen ini mendeskripsikan struktur tabel basis data (Database Schema) dalam format tabel untuk keperluan Bab Perancangan Data.

---

## 1. Modul Pengguna (Users & Auth)

### Tabel: `User`
Menyimpan data otentikasi utama untuk semua jenis pengguna.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key (Identitas Unik) |
| `email` | String | Unique, Not Null | Alamat email pengguna (Username) |
| `password` | String | Not Null | Password terenkripsi (Bcrypt) |
| `role` | Enum | Not Null | Peran: STUDENT, TEACHER, atau ADMIN |
| `name` | String | Not Null | Nama lengkap pengguna |
| `avatar` | String | Nullable | URL foto profil |
| `phone` | String | Nullable | Nomor telepon |
| `isActive` | Boolean | Default: True | Status akun aktif/nonaktif |
| `createdAt` | DateTime | Default: Now | Waktu pembuatan akun |

### Tabel: `Student`
Menyimpan profil khusus siswa.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `userId` | String | FK (User), Unique | Relasi ke tabel User |
| `schoolId` | String | FK (School) | Relasi ke tabel School |
| `grade` | Enum | Not Null | Jenjang Kelas: X, XI, atau XII |
| `joinCode` | String | Nullable | Kode unik untuk bergabung ke sekolah/kelas |
| `currentLevel`| Int | Default: 1 | Level gamifikasi saat ini |
| `totalXP` | Int | Default: 0 | Total Experience Points yang dikumpulkan |
| `streakDays` | Int | Default: 0 | Jumlah hari berturut-turut belajar |

### Tabel: `Teacher`
Menyimpan profil khusus guru.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `userId` | String | FK (User), Unique | Relasi ke tabel User |
| `schoolId` | String | FK (School) | Relasi ke tabel School |
| `nip` | String | Nullable | Nomor Induk Pegawai |

### Tabel: `School`
Data master sekolah.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `name` | String | Not Null | Nama Sekolah |
| `address` | String | Nullable | Alamat Sekolah |
| `type` | Enum | Default: NEGERI | Jenis: NEGERI atau SWASTA |

---

## 2. Modul Kurikulum (Curriculum)

### Tabel: `Chapter`
Bab pembelajaran (misal: "Eksponen", "Logaritma").
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `name` | String | Not Null | Judul Bab |
| `grade` | Enum | Not Null | Jenjang Kelas (X/XI/XII) |
| `order` | Int | Not Null | Urutan Bab |
| `status` | Enum | Default: DRAFT | Status publikasi |

### Tabel: `Material`
Konten materi pelajaran di dalam Bab.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `chapterId` | String | FK (Chapter) | Relasi ke Bab |
| `title` | String | Not Null | Judul Materi |
| `content` | Text | Not Null | Isi materi (Format Markdown/LaTeX) |
| `videoUrl` | String | Nullable | Link video pembelajaran |
| `pdfUrl` | String | Nullable | Link file PDF |
| `order` | Int | Not Null | Urutan materi dalam bab |
| `isSystem` | Boolean | Default: False | Penanda materi bawaan sistem admin |

---

## 3. Modul Soal & Kuis (Assessment)

### Tabel: `Quiz`
Wadah kuis atau ujian.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `chapterId` | String | FK (Chapter) | Relasi ke Bab |
| `title` | String | Not Null | Judul Kuis |
| `type` | Enum | Default: PRACTICE | Jenis: PLACEMENT, PRACTICE, POST_TEST, REMEDIAL |
| `passingScore`| Int | Default: 70 | Nilai ambang batas kelulusan (KKM) |
| `timeLimit` | Int | Nullable | Batas waktu pengerjaan (menit) |

### Tabel: `Question`
Bank soal.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `text` | Text | Not Null | Teks pertanyaan |
| `imageUrl` | String | Nullable | Gambar soal |
| `difficulty` | Enum | Default: MEDIUM | Tingkat Kesukitan: EASY, MEDIUM, HARD |
| `explanation` | Text | Nullable | Penjelasan/Pembahasan jawaban |

### Tabel: `QuestionOption`
Pilihan jawaban (A/B/C/D/E).
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `questionId` | String | FK (Question) | Relasi ke Soal |
| `label` | String | Not Null | Label opsi (A, B, C, D, E) |
| `text` | String | Not Null | Teks jawaban |
| `isCorrect` | Boolean | Default: False | Penanda jawaban benar |

---

## 4. Modul Manajemen Kelas (Class Management)

### Tabel: `Class` (Classroom)
Kelas virtual yang dikelola guru.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `joinCode` | String | Unique | Kode unik 6-digit untuk join siswa |
| `teacherId` | String | FK (Teacher) | Pemilik kelas |
| `schoolId` | String | FK (School) | Sekolah asal |
| `name` | String | Not Null | Nama Kelas (misal: "X-IPA-1") |
| `kkmScore` | Int | Default: 70 | Setting KKM spesifik kelas |

### Tabel: `ClassEnrollment`
Pendaftaran siswa ke kelas.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `classId` | String | FK (Class) | ID Kelas |
| `studentId` | String | FK (Student) | ID Siswa |
| `joinedAt` | DateTime | Default: Now | Waktu bergabung |

---

## 5. Modul Progress & Hasil Belajar

### Tabel: `MaterialProgress`
Tracking materi yang sudah dipelajari siswa.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `studentId` | String | FK (Student) | ID Siswa |
| `materialId` | String | FK (Material) | ID Materi |
| `isCompleted` | Boolean | Default: False | Status selesai |
| `progress` | Int | Default: 0 | Persentase (0-100) |

### Tabel: `QuizAttempt`
Rekap satu kali percobaan kuis.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `studentId` | String | FK (Student) | ID Siswa |
| `quizId` | String | FK (Quiz) | ID Kuis |
| `score` | Float | Not Null | Nilai akhir (0-100) |
| `isPassed` | Boolean | Default: False | Status kelulusan |
| `startedAt` | DateTime | Default: Now | Waktu mulai |
| `submittedAt` | DateTime | Nullable | Waktu selesai |

---

## 6. Modul AI Tutor

### Tabel: `ChatSession`
Sesi percakapan AI.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `studentId` | String | FK (Student) | ID Siswa |
| `title` | String | Nullable | Judul topik chat |

### Tabel: `ChatMessage`
Riwayat pesan chat.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `sessionId` | String | FK (ChatSession)| ID Sesi |
| `role` | Enum | USER/ASSISTANT | Pengirim pesan |
| `content` | Text | Not Null | Isi pesan |

### Tabel: `AuditLog`
Evaluasi guru terhadap jawaban AI.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `messageId` | String | FK (ChatMessage)| Pesan yang diaudit |
| `status` | Enum | PENDING/... | Status akurasi jawaban AI |
| `feedback` | String | Nullable | Catatan koreksi dari guru |

---

## 7. Modul Gamifikasi

### Tabel: `Badge`
Master data lencana.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `name` | String | Not Null | Nama Badge |
| `requirement`| String | Not Null | Syarat (Code logic) |
| `xpReward` | Int | Default: 0 | Bonus XP |

### Tabel: `StudentBadge`
Lencana milik siswa.
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
|------------|-----------|------------|-----------|
| `id` | String | PK, CUID | Primary Key |
| `studentId` | String | FK (Student) | Pemilik |
| `badgeId` | String | FK (Badge) | Badge yang didapat |
| `earnedAt` | DateTime | Default: Now | Waktu perolehan |
