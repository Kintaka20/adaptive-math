# Daftar Halaman Terimplementasi
**Total:** 51 Halaman Fungsional
**Terakhir Diperbarui:** 2026-01-09

## 1. Modul Siswa (9 Halaman)
Fokus pada pembelajaran adaptif dan gamifikasi.
1.  **StudentDashboard** (`StudentDashboard.tsx`): Halaman utama/beranda siswa.
2.  **LearningPathPage** (`LearningPathPage.tsx`): Peta jalur belajar (Chapter/Bab).
3.  **MaterialPage** (`MaterialPage.tsx`): Halaman membaca materi & menonton video.
4.  **QuizPage** (`QuizPage.tsx`): Interface pengerjaan kuis.
5.  **QuizResultPage** (`QuizResultPage.tsx`): Halaman hasil nilai & pembahasan.
6.  **AITutorPage** (`AITutorPage.tsx`): Chatbot AI Tutor.
7.  **ChatHistoryPage** (`ChatHistoryPage.tsx`): Riwayat sesi chat.
8.  **RankingPage** (`RankingPage.tsx`): Leaderboard gamifikasi (XP).
9.  **ProfilePage** (`ProfilePage.tsx`): Profil & statistik siswa.

## 2. Modul Guru (19 Halaman)
Fokus pada manajemen konten, kelas, dan monitoring.
1.  **TeacherDashboard** (`TeacherDashboard.tsx`): Ringkasan aktivitas guru.
2.  **KelasPage** (`KelasPage.tsx`): Daftar kelas yang diajar.
3.  **CreateKelasPage** (`CreateKelasPage.tsx`): Form pembuatan kelas baru.
4.  **KelasDetailPage** (`KelasDetailPage.tsx`): Detail kelas (Daftar Siswa, Bab Aktif).
5.  **AssignBabPage** (`AssignBabPage.tsx`): Mengatur bab untuk kelas tertentu.
6.  **MonitoringPage** (`MonitoringPage.tsx`): Tabel monitoring progress seluruh siswa.
7.  **StudentDetailPage** (`StudentDetailPage.tsx`): Detail performa satu siswa.
8.  **StrugglePage** (`StrugglePage.tsx`): Analisis siswa yang kesulitan (Remedial).
9.  **BankSoalPage** (`BankSoalPage.tsx`): Manajemen bank soal.
10. **TambahSoalPage** (`TambahSoalPage.tsx`): Input soal baru.
11. **EditSoalPage** (`EditSoalPage.tsx`): Edit soal existing.
12. **BankMateriPage** (`BankMateriPage.tsx`): Manajemen bank materi.
13. **TambahMateriPage** (`TambahMateriPage.tsx`): Upload materi baru.
14. **ContentEditorPage** (`ContentEditorPage.tsx`): Rich text editor untuk materi.
15. **ReviewContentPage** (`ReviewContentPage.tsx`): Preview konten.
16. **AuditPage** (`AuditPage.tsx`): Daftar respon AI yang perlu diaudit.
17. **AuditDetailPage** (`AuditDetailPage.tsx`): Validasi respon AI.
18. **KKMSettingsPage** (`KKMSettingsPage.tsx`): Konfigurasi nilai KKM.
19. **TeacherProfilePage** (`TeacherProfilePage.tsx`): Pengaturan akun guru.

## 3. Modul Admin (14 Halaman)
Fokus pada data master dan manajemen sistem.
1.  **AdminDashboard** (`AdminDashboard.tsx`): Statistik global sistem.
2.  **UsersPage** (`UsersPage.tsx`): Manajemen pengguna (User Management).
3.  **SchoolManagementPage** (`SchoolManagementPage.tsx`): Manajemen sekolah.
4.  **CurriculumPage** (`CurriculumPage.tsx`): Manajemen silabus/kurikulum.
5.  **ChapterContentPage** (`ChapterContentPage.tsx`): Detail konten per bab.
6.  **MasterDataPage** (`MasterDataPage.tsx`): Data referensi umum.
7.  **AllMaterialsPage** (`AllMaterialsPage.tsx`): Melihat semua materi di sistem.
8.  **AllQuestionsPage** (`AllQuestionsPage.tsx`): Melihat semua soal di sistem.
9.  **MaterialEditorPage** (`MaterialEditorPage.tsx`): Edit materi (akses admin).
10. **QuizEditorPage** (`QuizEditorPage.tsx`): Edit kuis (akses admin).
11. **ApiLogsPage** (`ApiLogsPage.tsx`): Log aktivitas API.
12. **AdminTambahMateriPage** (`AdminTambahMateriPage.tsx`): Tambah materi via admin.
13. **AdminTambahSoalPage** (`AdminTambahSoalPage.tsx`): Tambah soal via admin.
14. **AdminContentEditorPage** (`AdminContentEditorPage.tsx`): Editor konten admin.

## 4. Auth & Umum (9 Halaman)
1.  **LandingPage** (`LandingPage.tsx`): Halaman muka website (Public).
2.  **LoginPage** (`LoginPage.tsx`): Masuk aplikasi.
3.  **RegisterStudentPage** (`RegisterStudentPage.tsx`): Daftar siswa baru.
4.  **RegisterTeacherPage** (`RegisterTeacherPage.tsx`): Daftar guru baru.
5.  **ForgotPasswordPage** (`ForgotPasswordPage.tsx`): Lupa password.
6.  **ResetPasswordPage** (`ResetPasswordPage.tsx`): Set ulang password.
7.  **NotificationPage** (`NotificationPage.tsx`): Pusat notifikasi user.
8.  **NotFoundPage** (`NotFoundPage.tsx`): Error 404.
9.  **UnauthorizedPage** (`UnauthorizedPage.tsx`): Error 403 (Akses ditolak).
