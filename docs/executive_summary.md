# Ringkasan Eksekutif (Executive Summary)

**Judul Tugas Akhir:**
**"Rancang Bangun Sistem Pembelajaran Adaptif Matematika SMA Berbasis Web dengan Personalisasi Alur Belajar dan Integrasi Large Language Model (LLM) sebagai Intelligent Tutor"**

*(Judul ini telah disempurnakan untuk mencerminkan aspek "Personalisasi Alur" dan peran AI sebagai "Intelligent Tutor" yang menjadi nilai jual utama proyek Anda).*

---

## 1. Latar Belakang & Permasalahan
Dalam metode pembelajaran konvensional di kelas, materi seringkali disampaikan dengan pendekatan *"one-size-fits-all"* (satu metode untuk semua). Hal ini menimbulkan masalah:
*   **Kesenjangan Pemahaman:** Siswa yang cepat mengerti merasa bosan, sementara siswa yang lambat merasa tertinggal dan putus asa.
*   **Keterbatasan Guru:** Guru matematika di sekolah sulit memberikan bimbingan personal (*one-on-one*) kepada setiap siswa karena keterbatasan waktu dan rasio jumlah siswa yang besar.
*   **Pasifnya Umpan Balik:** Saat belajar mandiri di rumah, siswa seringkali mentok pada satu soal tanpa ada yang bisa menjelaskan *konsep* kesalahannya secara instan.

## 2. Solusi yang Diusulkan
Mengembangkan sebuah **Sistem Pembelajaran Adaptif (Adaptive Learning System)** berbasis web. Sistem ini tidak hanya mendigitalkan materi, tetapi mampu:
*   **Mendeteksi kemampuan siswa** secara real-time melalui kuis evaluasi.
*   **Menyesuaikan konten** yang disajikan (misal: memberikan materi remedial/tambahan otomatis jika nilai kurang, atau materi pengayaan jika nilai sangat baik).
*   **Menyediakan Tutor Cerdas (AI)** yang siap 24/7 untuk menjawab pertanyaan siswa secara kontekstual, bukan sekadar memberikan kunci jawaban.

## 3. Fitur Utama Sistem
1.  **Adaptive Learning Engine:** Algoritma yang mengatur "jalan cerita" belajar siswa. Jika siswa gagal memahami Bab A, sistem akan mengunci Bab B dan menyajikan rute perbaikan (*remedial path*) secara otomatis.
2.  **AI Intelligent Tutor (LLM Integration):** Chatbot berbasis Large Language Model (seperti GPT/Gemini) yang diintegrasikan dengan konteks materi sekolah. AI ini diprogram untuk membimbing (scaffolding), bukan mengerjakan tugas siswa.
3.  **Gamifikasi Terintegrasi:** Sistem XP (Experience Points), Streak Harian, Badges, dan Leaderboard Kelas untuk meningkatkan motivasi intrinsik siswa.
4.  **Real-time Teacher Dashboard:** Guru dapat melihat peta kemampuan siswa di kelas secara visual (misal: siapa saja yang "merah" di bab Trigonometri) sehingga intervensi di kelas nyata menjadi lebih tepat sasaran.

## 4. Spesifikasi Teknis
Solusi ini dibangun menggunakan teknologi web modern (*Modern Tech Stack*) untuk menjamin performa, skalabilitas, dan pengalaman pengguna (UX) setara aplikasi industri:

*   **Frontend:** React.js dengan Vite (Performa tinggi), Tailwind CSS (Desain responsif & modern).
*   **Backend:** Node.js dengan framework Express.js (REST API).
*   **Database:** PostgreSQL (Relational DB) dikelola dengan Prisma ORM (Type-safety).
*   **Kecerdasan Buatan:** Integrasi API OpenAI / Google Gemini untuk pemrosesan bahasa alami (NLP).
*   **Deployment:** Arsitektur berbasis Cloud (Vercel/Railways/Docker).

## 5. Manfaat & Kebaruan (Novelty)
### Manfaat:
*   **Bagi Siswa:** Mendapatkan pengalaman belajar privat yang sesuai kecepatan masing-masing (*self-paced*).
*   **Bagi Guru:** Mendapatkan data analitik mendalam untuk evaluasi kurikulum dan penanganan siswa bermasalah lebih dini.

### Kebaruan (Novelty):
Kebaruan penelitian ini terletak pada **Integrasi LLM (Large Language Model) ke dalam alur Adaptif**. 
Sistem LMS (Learning Management System) pada umumnya hanya adaptif secara *rule-based* (jika nilai X, maka buka Y). Sistem ini menambahkan lapisan kecerdasan baru di mana AI dapat memberikan **umpan balik kualitatif** (penjelasan personal) atas kesalahan siswa, fitur yang sebelumnya sulit diimplementasikan pada aplikasi pembelajaran konvensional.
