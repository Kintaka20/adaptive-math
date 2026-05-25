# Kumpulan Sequence Diagram untuk Proposal TA - Adaptive Learning System (Updated)

Berikut adalah seluruh diagram alur kerja (Sequence Diagram) yang telah disesuaikan dengan **implementasi backend terbaru**. Perubahan signifikan terdapat pada logika perhitungan XP yang kini realtime dan logika Auto-Remedial yang membuat kuis baru secara dinamis.

---

## 1. Modul Otentikasi (Authentication)

### 1.1 Sequence Diagram: Registrasi Siswa
**Penjelasan:**
Sistem memastikan pembuatan akun dan set default status `isActive = true`. Password di-hash sebelum disimpan ke tabel `User`, kemudian profil siswa ditambahkan ke tabel `Student`.

```mermaid
sequenceDiagram
    autonumber
    actor Siswa
    participant FE as Frontend
    participant Server as Backend API (AuthRouter)
    participant DB as Database (Prisma)

    Siswa->>FE: Input Nama, Email, Password, Jenjang
    Siswa->>FE: Klik "Daftar Akun"
    FE->>Server: POST /api/auth/register
    
    activate Server
    Server->>DB: Check if Email Exists
    alt Email Sudah Terdaftar
        DB-->>Server: User Found
        Server-->>FE: 400 Error "Email already exists"
        FE->>Siswa: Tampilkan Pesan Error
    else Email Belum Terdaftar
        Server->>Server: Hash Password (Bcrypt)
        Server->>DB: INSERT User & Student Profile
        DB-->>Server: Success
        Server-->>FE: 201 Created (Token + Data User)
        FE->>Siswa: Redirect ke Dashboard
    end
    deactivate Server
```

### 1.2 Sequence Diagram: Login Pengguna
**Penjelasan:**
Sistem memverifikasi email dan password terenkripsi. Jika `isSuspended` bernilai true, akses ditolak. Jika berhasil, JWT Token akan di-generate.

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna
    participant FE as Frontend
    participant Server as Backend API (AuthRouter)
    participant DB as Database (Prisma)

    User->>FE: Input Email & Password
    FE->>Server: POST /api/auth/login
    
    activate Server
    Server->>DB: Find User by Email
    alt User Tidak Ditemukan / Suspended
        DB-->>Server: Null / isSuspended=true
        Server-->>FE: 401 Error "Invalid/Suspended credentials"
    else User Valid
        Server->>Server: Compare Password (Bcrypt)
        alt Password Salah
            Server-->>FE: 401 Error "Invalid credentials"
        else Password Benar
            Server->>Server: Generate JWT Token
            Server-->>FE: 200 OK (Token + Role)
            FE->>User: Redirect ke Halaman Utama
        end
    end
    deactivate Server
```

---

## 2. Modul Manajemen Kelas (Class Management)

### 2.1 Sequence Diagram: Guru Membuat Kelas
**Penjelasan:**
Saat guru membuat kelas, terdapat konfigurasi `autoRemedial` yang akan menentukan apakah siswa yang gagal otomatis dibuatkan kuis remedial.

```mermaid
sequenceDiagram
    autonumber
    actor Guru
    participant FE as Frontend
    participant Server as Backend API (ClassesRouter)
    participant DB as Database (Prisma)

    Guru->>FE: Input Detail Kelas & Set Auto-Remedial
    Guru->>FE: Klik Simpan
    FE->>Server: POST /api/classes
    
    activate Server
    Server->>Server: Generate Unique Join Code
    Server->>DB: INSERT Classroom (Set autoRemedial)
    DB-->>Server: Return Classroom ID
    Server-->>FE: 201 Created (Class Data)
    
    FE->>Guru: Tampilkan Kode Kelas & Notifikasi
    deactivate Server
```

### 2.2 Sequence Diagram: Siswa Bergabung Kelas

```mermaid
sequenceDiagram
    autonumber
    actor Siswa
    participant FE as Frontend
    participant Server as Backend API (ClassesRouter)
    participant DB as Database (Prisma)

    Siswa->>FE: Input "Kode Kelas"
    Siswa->>FE: Klik "Gabung"
    FE->>Server: POST /api/classes/join
    
    activate Server
    Server->>DB: Find Classroom by Code
    alt Kelas Tidak Ditemukan
        Server-->>FE: 404 Error "Class not found"
    else Kelas Ditemukan
        Server->>DB: Check Existing Enrollment
        alt Sudah Terdaftar
            Server-->>FE: 400 Error "Already enrolled"
        else Belum Terdaftar
            Server->>DB: INSERT ClassroomEnrollment
            DB-->>Server: Success
            Server-->>FE: 200 OK
            FE->>Siswa: Redirect ke Ruang Kelas
        end
    end
    deactivate Server
```

---

## 3. Modul Pembelajaran & Kuis

### 3.1 Sequence Diagram: Mengakses Materi
**Penjelasan:**
Sistem melacak progres materi dan memperbarui `MaterialProgress`.

```mermaid
sequenceDiagram
    autonumber
    actor Siswa
    participant FE as Frontend
    participant Server as Backend API (MaterialsRouter)
    participant DB as Database (Prisma)

    Siswa->>FE: Buka Materi
    FE->>Server: GET /api/materials/{id}
    
    activate Server
    Server->>DB: Get Material Content
    DB-->>Server: Material Data
    
    par Background Update Progress
        FE->>Server: POST /api/materials/{id}/progress (started/completed)
        Server->>DB: UPSERT MaterialProgress
    end
    
    Server-->>FE: 200 OK
    FE->>Siswa: Tampilkan Konten Materi
    deactivate Server
```

### 3.2 Sequence Diagram: Mengerjakan Kuis & Perhitungan XP
**Penjelasan:**
Saat disubmit, sistem melakukan perhitungan skor, XP dasar, bonus waktu (Time Bonus), bonus jawaban sempurna, pengali kesulitan (Difficulty Multiplier), dan bonus konsistensi harian (Streak). Semua diproses secara simultan (Realtime) dalam satu `Transaction` database.

```mermaid
sequenceDiagram
    autonumber
    actor Siswa
    participant FE as Frontend
    participant Server as Backend API (QuizzesRouter)
    participant DB as Database (Prisma)

    Siswa->>FE: Klik "Mulai Kuis"
    FE->>Server: POST /api/quizzes/{id}/start
    Server->>DB: Create QuizAttempt (startTime)
    Server-->>FE: Return Data Soal Tanpa Kunci

    Siswa->>FE: Jawab & Klik "Submit"
    FE->>Server: POST /api/quizzes/{id}/submit
    
    activate Server
    Server->>DB: Get Jawaban Benar (Kunci)
    Server->>Server: Kalkulasi Jawaban Benar & Cek KKM
    
    note over Server, DB: Memulai Database Transaction
    Server->>Server: Hitung XP (Base, Time Bonus, Perfect Bonus, Streak, Diff. Multiplier)
    Server->>Server: Tentukan Kenaikan Level
    
    Server->>DB: Update QuizAttempt (Score, isPassed, FinishTime)
    Server->>DB: Update Student (TotalXP, Level, Streak)
    note over Server, DB: Transaksi Selesai
    
    Server-->>FE: Return Score & XP Breakdown
    FE->>Siswa: Tampilkan Nilai & Rincian Bonus XP
    deactivate Server
```

---

## 4. Modul Adaptif (Adaptive Logic) - FITUR UTAMA

### 4.1 Sequence Diagram: Auto-Remedial Logic (Saat Siswa Gagal Kuis)
**Penjelasan:**
Diagram ini dieksekusi **jika skor kuis < KKM** pada saat disubmit. Sistem mengecek pengaturan `autoRemedial` kelas. Jika aktif, sistem melakukan query untuk mencari soal-soal tingkat kesulitan lebih rendah dan men-generate secara otomatis `Quiz` baru dengan tipe `REMEDIAL`. Sistem juga membuat notifikasi untuk Guru.

```mermaid
sequenceDiagram
    autonumber
    participant Server as Backend API (QuizzesRouter)
    participant DB as Database (Prisma)

    note over Server, DB: Triggered from Submit Quiz API
    
    Server->>DB: Cek Setting Kelas (autoRemedial)
    DB-->>Server: autoRemedial = TRUE
    
    rect rgb(255, 240, 240)
        note right of Server: Kondisi: Gagal & Auto-Remedial AKTIF
        Server->>DB: Identifikasi Topik dari Jawaban Salah
        Server->>DB: Find Question (Tingkat Kesulitan Lebih Rendah)
        DB-->>Server: Return 3-5 Soal Mudah
        
        Server->>DB: CREATE Quiz (Type=REMEDIAL, PassingScore Lebih Rendah)
        Server->>DB: Insert QuizQuestions
        
        Server->>DB: Get Uncompleted MaterialProgress
        DB-->>Server: List Materi Rekomendasi
        
        Server->>DB: Create Notification (Peringatan ke Guru)
        
        Server-->>Frontend: Return Remedial Plan (Kuis Baru & Materi Rekomendasi)
    end
```

---

## 5. Modul AI Tutor

### 5.1 Sequence Diagram: Chat dengan AI Terintegrasi Konteks
**Penjelasan:**
Sistem memuat riwayat percakapan dan *konteks materi* (Topik yang sedang dipelajari) untuk memberikan instruksi kepada LLM (OpenAI/Gemini API) agar jawabannya sangat relevan dengan kurikulum.

```mermaid
sequenceDiagram
    autonumber
    actor Siswa
    participant FE as Frontend
    participant Server as Backend API (ChatRouter)
    participant AI as OpenAI/Gemini API
    participant DB as Database (Prisma)

    Siswa->>FE: Kirim Pesan: "Jelaskan rumus kuadrat?"
    FE->>Server: POST /api/chat/message
    
    activate Server
    Server->>DB: INSERT ChatMessage (User)
    Server->>DB: Ambil Konteks Materi & Chapter saat ini
    
    note right of Server: Build Prompt = System Instructions + Chapter Context + History + User Message
    
    Server->>AI: Send Request (Prompt)
    activate AI
    AI-->>Server: Response Stream/Text
    deactivate AI
    
    Server->>DB: INSERT ChatMessage (Assistant)
    Server-->>FE: Return AI Response
    FE->>Siswa: Tampilkan Balasan Tutor AI
    deactivate Server
```

### 5.2 Sequence Diagram: Audit Log Chat AI oleh Guru
**Penjelasan:**
Karena penggunaan AI LLM memiliki risiko halusinasi (memberikan informasi salah), sistem menyediakan fitur Audit. Guru dapat meninjau riwayat percakapan AI dengan siswa, kemudian memberikan status penilaian (misalnya: `ACCURATE` atau `INCORRECT`) beserta *feedback* evaluasi yang disimpan ke dalam tabel `AuditLog`.

```mermaid
sequenceDiagram
    autonumber
    actor Guru
    participant FE as Frontend
    participant Server as Backend API (AuditRouter)
    participant DB as Database (Prisma)

    Guru->>FE: Buka Menu Monitoring / Audit Chat AI
    FE->>Server: GET /api/audit/messages?status=PENDING
    
    activate Server
    Server->>DB: Query ChatMessage (isAudited = false)
    DB-->>Server: List Riwayat Chat
    Server-->>FE: 200 OK (Data Pesan & Konteks Siswa)
    deactivate Server
    
    FE->>Guru: Tampilkan Riwayat Chat Siswa dengan AI
    
    Guru->>FE: Berikan Penilaian (Status: INCORRECT, Feedback: "Rumus salah")
    Guru->>FE: Klik "Simpan Audit"
    
    FE->>Server: POST /api/audit/logs
    activate Server
    
    note over Server, DB: Database Transaction
    Server->>DB: INSERT AuditLog (messageId, teacherId, status, feedback)
    Server->>DB: UPDATE ChatMessage (isAudited = true)
    
    DB-->>Server: Success
    Server-->>FE: 201 Created
    deactivate Server
    
    FE->>Guru: Tampilkan Notifikasi Sukses
```

---

## 6. Modul Manajemen Konten (Guru)

### 6.1 Sequence Diagram: Upload Materi & Kuis
**Penjelasan:**
Alur kerja guru dalam membuat bab, memasukkan materi, dan membuat kuis.

```mermaid
sequenceDiagram
    autonumber
    actor Guru
    participant FE as Frontend
    participant Server as Backend API (Materials & Quizzes)
    participant DB as Database (Prisma)

    Guru->>FE: Input Data Materi Baru
    FE->>Server: POST /api/materials
    activate Server
    Server->>DB: INSERT Material
    DB-->>Server: Success
    Server-->>FE: 201 Created
    deactivate Server
    
    Guru->>FE: Buat Data Kuis
    FE->>Server: POST /api/quizzes
    activate Server
    Server->>DB: INSERT Quiz
    DB-->>Server: Success
    Server-->>FE: 201 Created
    deactivate Server
    
    Guru->>FE: Tambah Soal (Question & Options)
    FE->>Server: POST /api/questions
    activate Server
    Server->>DB: INSERT Question & Options
    DB-->>Server: Success
    Server-->>FE: 201 Created
    deactivate Server
```
