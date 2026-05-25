# Analisis Kebutuhan Sistem (System Requirements Analysis)

Dokumen ini memuat analisis kebutuhan perangkat lunak untuk sistem **Adaptive Learning Matematika SMA**.
Bagian ini dapat digunakan untuk **Bab 3: Analisis dan Perancangan Sistem**.

---

## A. Kebutuhan Fungsional (Functional Requirements)
Kebutuhan fungsional mendefinisikan layanan-layanan yang harus disediakan oleh sistem, bagaimana sistem bereaksi terhadap input tertentu, dan perilaku sistem dalam situasi tertentu.

### 1. Aktor: Siswa (Student)
| Kode | Kebutuhan Fungsional | Deskripsi |
|------|----------------------|-----------|
| **KF-S-01** | **Registrasi & Login** | Siswa dapat mendaftar akun baru dan login menggunakan email & password. |
| **KF-S-02** | **Dashboard Siswa** | Siswa dapat melihat ringkasan progress belajar, XP terkini, dan materi terakhir yang diakses. |
| **KF-S-03** | **Akses Materi Belajar** | Siswa dapat membuka materi pelajaran dalam bentuk teks (Markdown/LaTeX) dan video pembelajaran. |
| **KF-S-04** | **Pengerjaan Kuis** | Siswa dapat mengerjakan kuis (Latihan/Ujian) dengan timer dan variasi soal pilihan ganda. |
| **KF-S-05** | **Alur Belajar Adaptif** | Sistem otomatis menentukan apakah siswa lanjut ke bab berikutnya atau harus remedial berdasarkan nilai kuis (KKM). |
| **KF-S-06** | **AI Tutor Chat** | Siswa dapat bertanya materi pelajaran kepada AI Tutor yang memiliki konteks pembelajaran. |
| **KF-S-07** | **Gamifikasi** | Siswa mendapatkan XP dan Badge (Lencana) setelah menyelesaikan materi atau mencapai target tertentu. |
| **KF-S-08** | **Melihat Leaderboard** | Siswa dapat melihat peringkat (ranking) dirinya dibandingkan teman sekelas berdasarkan perolehan XP. |

### 2. Aktor: Guru (Teacher)
| Kode | Kebutuhan Fungsional | Deskripsi |
|------|----------------------|-----------|
| **KF-G-01** | **Manajemen Kelas** | Guru dapat membuat kelas baru, generate kode join kelas, dan melihat daftar siswa di kelasnya. |
| **KF-G-02** | **Manajemen Bank Soal** | Guru dapat membuat, mengedit, dan menghapus soal-soal ujian beserta kunci jawabannya. |
| **KF-G-03** | **Manajemen Materi** | Guru dapat mengunggah materi pelajaran dan menyusun urutan bab pembelajaran. |
| **KF-G-04** | **Monitoring Siswa** | Guru dapat memantau progress belajar siswa, melihat siswa yang remedial (struggling learners). |
| **KF-G-05** | **Audit AI Response** | Guru dapat mereview, memvalidasi, atau mengoreksi jawaban yang diberikan oleh AI Tutor kepada siswa. |
| **KF-G-06** | **Pengaturan KKM** | Guru dapat mengatur ambang batas nilai (KKM) minimum untuk kelulusan kuis per materi. |

### 3. Aktor: Admin
| Kode | Kebutuhan Fungsional | Deskripsi |
|------|----------------------|-----------|
| **KF-A-01** | **Manajemen Pengguna** | Admin dapat mengelola data seluruh user (Guru/Siswa) termasuk reset password jika diperlukan. |
| **KF-A-02** | **Manajemen Sekolah** | Admin dapat menambah dan mengelola data master Sekolah. |
| **KF-A-03** | **Monitoring Sistem** | Admin dapat melihat statistik global penggunaan aplikasi (jumlah user aktif, total materi). |

---

## B. Kebutuhan Non-Fungsional (Non-Functional Requirements)
Kebutuhan non-fungsional adalah batasan-batasan pada pelayanan atau fungsi yang ditawarkan sistem, seperti batasan waktu, batasan proses pengembangan, dan standar.

| Kategori | Deskripsi Kebutuhan |
|----------|---------------------|
| **Performance** | Halaman website harus dapat dimuat (load time) dalam waktu kurang dari 3 detik pada koneksi internet stabil (4G/WiFi). |
| **Scalability** | Sistem mampu menangani minimal 100 pengguna (siswa) yang mengakses kuis secara bersamaan (concurrent) tanpa mengalami *downtime*. |
| **Security** | - Password pengguna harus disimpan dalam bentuk terenkripsi (Hashing bcrypt).<br>- Akses API harus dilindungi menggunakan token otentikasi (JWT).<br>- Komunikasi data menggunakan protokol HTTPS. |
| **Availability** | Sistem dapat diakses 24 jam sehari, 7 hari seminggu, kecuali saat maintenance terjadwal. |
| **Usability** | Antarmuka pengguna (UI) didesain responsif (dapat diakses baik via Desktop maupun Smartphone/Tablet). |
| **Reliability** | Sistem harus melakukan validasi input untuk mencegah data korup atau error sistem. |

---

## C. Spesifikasi Lingkungan Sistem (System Environment)

### 1. Perangkat Keras (Hardware)
**Spesifikasi Server (Deployment):**
*   Processor: Minimal 2 vCPU
*   RAM: Minimal 4 GB
*   Storage: SSD 20 GB
*   Network: Public IP Address

**Spesifikasi Client (Pengguna):**
*   Perangkat: Laptop / PC / Smartphone
*   Koneksi Internet: Minimal 1 Mbps

### 2. Perangkat Lunak (Software)
**Sisi Server (Backend):**
*   Sistem Operasi: Linux (Ubuntu/Debian)
*   Runtime Environment: Node.js v18 LTS atau lebih baru
*   Database Management System: PostgreSQL v14+
*   Cache System: Redis

**Sisi Client (Frontend):**
*   Web Browser: Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari (versi terbaru).

**Tools Pengembangan:**
*   Code Editor: Visual Studio Code
*   API Testing: Postman
*   Version Control: Git & GitHub
