# Finsight - AI-Powered Personal Finance Tracker

Finsight adalah platform manajemen keuangan pribadi cerdas tingkat lanjut (next-generation) yang dirancang khusus untuk menganalisis, melacak, dan merencanakan keuangan Anda secara profesional. Dibangun dengan memadukan keandalan sistem perbankan (neo-fintech) dan kecerdasan buatan, Finsight membantu Anda mengambil kendali penuh atas uang Anda tanpa pusing.

Proyek ini dibangun secara khusus untuk Hackathon Top 99 Indonesia Next.

---

## Fitur Unggulan

### 1. AI Auto-Categorization (Groq Llama-3.3-70b)
Tidak perlu repot memilih kategori pengeluaran secara manual. Cukup ketik "Beli kopi di Starbucks" atau "Bayar tagihan listrik", dan AI Llama-3 kami akan menganalisis teks tersebut dan memasukkannya ke dalam kategori yang tepat secara otomatis (Zero-shot classification) dalam hitungan milidetik.

### 2. Finsight AI Assistant (Context-Aware)
Asisten pintar layaknya seorang analis keuangan profesional yang standby di dashboard Anda.
- **Memori Konteks (Long-term Memory)**: Mampu mengingat seluruh riwayat percakapan sebelumnya sehingga obrolan terasa natural layaknya manusia.
- **Konteks Personal**: AI ini mengenali total saldo Anda, histori transaksi terbaru, batas anggaran, dan progres tabungan Anda.
- **Streaming Response**: Jawaban diproses secara real-time dengan antarmuka (UI) layar penuh bergaya modern (seperti ChatGPT/Perplexity).
- **AI Insight Mingguan/Bulanan**: Hanya dengan satu klik, AI akan membaca seluruh ringkasan transaksi Anda dan merumuskan analisis tajam (Actionable Insight) serta mendeteksi kebocoran pengeluaran secara otomatis.

### 3. AI Time Machine (Mesin Waktu Finansial)
Fitur interaktif revolusioner yang memproyeksikan nasib keuangan Anda 5 tahun ke depan (Tahun 2031). AI akan membaca *Burn Rate* (Kecepatan bakar uang) harian Anda, lalu memberikan teguran lucu, *savage* (roasting), namun sangat memotivasi agar Anda segera mengubah kebiasaan buruk dalam mengelola uang.

### 4. AI Bulk Text-to-Transaction
Mencatat banyak transaksi sekaligus tidak pernah semudah ini. Cukup buka tab "Dengan AI" di form Tambah Transaksi, ketik kalimat panjang seperti: *"Dapat gaji 2 juta, terus ke Starbucks habis 80 ribu, dan beli bensin 30 ribu"*. AI akan otomatis memecahnya menjadi 3 transaksi berbeda, mencarikannya kategori yang tepat, dan langsung menyimpannya ke database sekaligus (*Bulk Insert*).

### 5. Revolut-Grade UI/UX
Tinggalkan aplikasi pencatat keuangan yang kaku dan membosankan. Finsight dibangun di atas fondasi desain modern dengan estetika Glassmorphism, animasi mulus, dark mode tingkat lanjut, dan interaksi mikro yang memberikan kesan premium. Semuanya dirancang tanpa framework CSS tambahan untuk kendali penuh tingkat piksel.

### 6. Skoring Kesehatan Finansial
Fitur skoring ini mengubah dashboard biasa menjadi area interaktif yang secara psikologis mendorong pengguna untuk lebih hemat. Skor bergerak dinamis dari 0 hingga 100 berdasarkan rasio tabungan, tingkat ketaatan pada anggaran, dan riwayat surplus pengeluaran.

### 7. Keamanan Data Berlapis (Supabase RLS)
Kami sangat menghargai privasi data finansial Anda. Setiap baris data transaksi dilindungi oleh Row Level Security (RLS) di sisi server database PostgreSQL. Tidak ada siapa pun, termasuk pengguna lain, yang bisa melihat transaksi Anda. Data yang dikirim ke AI Llama-3 pun telah diagregasi sehingga identitas personal tetap anonim.

---

## Tech Stack & Teknologi yang Digunakan

Proyek ini dibangun menggunakan teknologi modern untuk memastikan performa yang cepat dan pengalaman pengguna yang mulus:
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan React 19
- **Styling**: Vanilla CSS (Custom Design System tanpa framework)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **AI Engine**: [Groq](https://groq.com/) dengan model Llama-3.3-70b
- **PDF Generation**: `@react-pdf/renderer` untuk mengekspor e-statement

---

## Cara Menjalankan Proyek (Local Development)

Jika Anda ingin menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

### 1. Clone Repository
```bash
git clone https://github.com/username/finsight.git
cd finsight
```

### 2. Install Dependensi
Karena proyek ini menggunakan pnpm, jalankan:
```bash
pnpm install
```
*(Atau gunakan `npm install` jika menggunakan npm).*

### 3. Setup Environment Variables
Buat file `.env` di direktori utama (root) proyek dan isi dengan variabel berikut. Anda perlu mendapatkan API Key dari Supabase dan Groq.

```env
# Groq AI
GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci..." # Hanya dibutuhkan untuk hapus akun
```
> **Catatan**: Lihat file `SUPABASE_SETUP.md` untuk panduan lengkap mengatur tabel dan Row Level Security di Supabase.

### 4. Jalankan Development Server
```bash
pnpm run dev
```
Aplikasi sekarang dapat diakses di [http://localhost:3000](http://localhost:3000).

---

## Product Requirements Document (PRD) Keseluruhan

### 1. Ringkasan Eksekutif

Visi: Membantu masyarakat, khususnya generasi muda, membangun kebiasaan finansial yang sehat meliputi menyusun anggaran, menabung secara konsisten, dan mengendalikan pengeluaran lewat alat bantu digital yang dipandu kecerdasan buatan.

Masalah: Berdasarkan Survei Nasional Literasi dan Inklusi Keuangan (SNLIK) 2025 oleh OJK dan BPS, indeks literasi keuangan masyarakat Indonesia berada di angka 66,46%, sementara indeks inklusi keuangan (akses terhadap produk atau layanan keuangan) jauh lebih tinggi di 80,51%. Kesenjangan ini menunjukkan pola yang krusial. Jauh lebih banyak orang yang sudah punya akses ke produk keuangan dibanding yang benar-benar paham cara mengelolanya dengan baik. Akibatnya banyak orang kesulitan menyusun anggaran, gagal membentuk kebiasaan menabung, atau kehilangan kendali atas pengeluaran tanpa sadar penyebabnya.

Sumber Data: https://ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Pages/OJK-dan-BPS-Umumkan-Hasil-Survei-Nasional-Literasi-Dan-Inklusi-Keuangan-SNLIK-Tahun-2025.aspx

Solusi: Finsight adalah aplikasi web full-stack yang membantu pengguna mencatat transaksi, menyusun anggaran per kategori, menetapkan target tabungan, dan sebagai pembeda utama mendapatkan insight finansial personal dari AI yang dihasilkan dari pola data keuangan mereka sendiri, bukan sekadar saran umum generik.

Target Rilis: Full-stack MVP yang dideploy ke URL publik, dengan pipeline penuh (frontend terhubung database Supabase terhubung LLM API), riwayat commit GitHub yang mencerminkan proses pengembangan, tanpa data hardcode (seluruh data berasal dari database).

### 2. Tujuan dan Sasaran

Tujuan Produk:
1. Memudahkan pengguna mencatat dan memahami arus keuangan pribadinya (pemasukan dan pengeluaran) tanpa friksi.
2. Mendorong kebiasaan menabung lewat target tabungan yang terukur dan progres yang terlihat jelas.
3. Memberikan insight finansial yang personal berbasis data pengguna sendiri lewat AI, bukan sekadar dashboard angka statis.
4. Membuktikan pipeline full-stack yang utuh meliputi autentikasi, database relasional (Supabase), dan integrasi LLM API yang semuanya berjalan dari data asli.

Non-Tujuan untuk Rilis Ini:
- Integrasi langsung ke rekening bank atau API perbankan. Pencatatan transaksi bersifat manual atau input mandiri.
- Multi-currency atau dukungan investasi tingkat lanjut seperti saham, reksadana, dan kripto.
- Fitur kolaboratif dan anggaran bersama keluarga.
- Notifikasi push atau reminder terjadwal.
- Aplikasi mobile native. Rilis ini fokus pada web responsif.

### 3. Target Pengguna dan Persona

Segmen utama: Individu usia produktif (18 sampai 35 tahun) yang sudah punya penghasilan atau uang saku tetapi belum terbiasa mengelola keuangan secara terstruktur.

Persona:
1. Fresh Graduate yang baru mulai bekerja dan menerima gaji pertama, butuh cara mudah mencatat transaksi harian.
2. Karyawan swasta yang ingin menabung untuk tujuan besar, butuh target tabungan yang jelas progresnya dan pengingat konsistensi.
3. Profesional yang mengatur anggaran lintas kategori, butuh kontrol pengeluaran dan insight kalau ada kategori yang membengkak.

### 4. Kebutuhan Fungsional (Functional Requirements)

1. Sebagai pengguna, saya bisa mendaftar dan login (Supabase Auth) agar data keuangan saya privat dan terikat ke akun saya.
2. Sebagai pengguna, saya bisa menambah transaksi yang mencakup nominal, kategori, tanggal, deskripsi, jenis pemasukan atau pengeluaran yang tersimpan permanen di database.
3. Sebagai pengguna, saya bisa melihat, mengedit, dan menghapus transaksi yang sudah saya catat.
4. Sebagai pengguna, saya bisa menyusun anggaran (budget) per kategori untuk periode tertentu.
5. Sebagai pengguna, saya melihat progres pengeluaran real-time dibanding anggaran yang saya tetapkan.
6. Sebagai pengguna, saya bisa membuat target tabungan dengan nominal tujuan dan tenggat waktu serta mencatat setoran ke target tersebut.
7. Sebagai pengguna, saya melihat dashboard ringkas yang menampilkan total saldo, grafik pengeluaran per kategori, dan progres target tabungan.
8. Sebagai pengguna, saat menambah transaksi, AI otomatis menyarankan kategori berdasarkan deskripsi yang saya ketik yang tetap bisa saya ubah manual.
9. Sebagai pengguna, saya bisa meminta insight finansial personal dari AI yang dihasilkan dari data transaksi saya sendiri.
10. Sebagai pengguna, saya bisa bertanya bebas ke asisten AI seputar kondisi keuangan saya dan mendapat jawaban berbasis data saya.
11. Sebagai pengguna, saya menerima pesan error yang jelas dan bisa mencoba lagi jika permintaan ke AI atau database gagal.

### 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

- Full-stack dan Data Nyata: Seluruh data (transaksi, anggaran, target) berasal dari Supabase dan tidak ada data hardcode di kode produksi.
- Keamanan Data: Row Level Security (RLS) Supabase aktif di semua tabel agar satu pengguna tidak bisa mengakses data pengguna lain.
- Performa: Dashboard dan hasil insight AI tampil di bawah waktu toleransi pada kondisi jaringan normal.
- Responsivitas: Tampilan optimal untuk mobile karena pencatatan transaksi harian besar kemungkinan dilakukan dari perangkat genggam.
- Keandalan: Kegagalan panggilan LLM API tidak boleh mengganggu fungsi inti (pencatatan transaksi tetap jalan meski fitur AI sedang sibuk).
- Modularitas: Pemisahan jelas antara komponen UI, server actions, API routes, query database, dan logika prompt AI.
- Deployment: Aplikasi terdeploy ke URL publik (Vercel) dan dapat diakses kapan saja.

### 6. Arsitektur dan Tech Stack

- Frontend: Next.js (App Router)
- Backend: Next.js API Routes dan Server Actions
- Database dan Autentikasi: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- Integrasi AI: Llama 3 via Groq API
- Deployment: Vercel

Alur Data (Data Flow):
Browser (Next.js UI) mengirim permintaan Login ke Supabase Auth untuk mendapatkan sesi pengguna (JWT). Kemudian terjadi operasi operasi baca tulis transaksi ke Next.js API Route atau Server Action. Ini akan melakukan query ke Supabase Postgres dengan pengamanan RLS. Untuk fitur kecerdasan buatan, Next.js API mengambil data transaksi terkini, menyusun prompt yang menggabungkan system prompt dan ringkasan data, mengirimnya ke LLM API, dan merender hasilnya ke Browser.

### 7. Skema Database (PostgreSQL di Supabase)

- profiles: Terhubung ke auth.users, memegang profil dasar.
- categories: Kategori transaksi, mendukung default bawaan sistem dan kustom per user.
- transactions: Inti pencatatan keuangan dengan tipe, nominal, kategori, dan tanggal.
- budgets: Anggaran per kategori per periode.
- savings_goals: Target tabungan dan progres berjalannya.
- ai_insights: Opsional untuk caching log hasil insight AI agar tidak selalu memanggil ulang LLM.

Setiap tabel memberlakukan Row Level Security dengan policy pencocokan ID autentikasi untuk memastikan isolasi data antar pengguna secara absolut.

### 8. Strategi AI dan LLM Pipeline

- Auto-kategorisasi transaksi: Saat pengguna mengetik deskripsi, backend memanggil LLM dengan daftar kategori pengguna untuk dipetakan secara akurat.
- Insight personal: Backend meringkas data transaksi pengguna dalam format numerik padat untuk diubah menjadi narasi yang mudah dipahami oleh LLM. LLM tidak diberi akses langsung ke tabel database, hanya menerima agregasi aman.
- Asisten chat: Ringkasan data dikirim per request tanpa menyimpan histori jangka panjang secara sembarangan, menjaga respon tetap kontekstual dengan data finansial terbaru.
- System prompt: Terdapat batasan ketat bagi AI untuk berlaku informatif, profesional, dan menolak memberi nasihat investasi spesifik yang berisiko. Tidak ada emoji yang diperbolehkan di dalam balasan AI maupun aplikasi untuk menjaga tampilan tetap bersih.

### 9. Desain Antarmuka dan Prinsip UX

Dashboard menampilkan ringkasan saldo, grafik pie/donut, daftar transaksi cepat, status anggaran, tabungan, dan panel skor kesehatan finansial.
Halaman Transaksi memberikan form mutasi yang cerdas dan tabel riwayat yang bersih.
Asisten AI berada dalam antarmuka obrolan yang elegan namun padat informasi.
Seluruh elemen diformat dengan indikator visual yang kuat untuk keamanan keuangan (hijau untuk aman, kuning untuk peringatan, merah untuk bahaya atau krisis).

### 10. Keamanan dan Privasi Tingkat Lanjut

API key LLM disimpan dengan aman sebagai environment variable pada sisi server dan tidak pernah terekspos ke klien. Data yang dirangkum untuk LLM disensor dari informasi identifikasi pribadi selain nama panggilan dan angka agregat. 

Finsight secara eksklusif membantu pencatatan dan pemahaman kondisi keuangan pribadi namun memberikan disclaimer yang jelas bahwa aplikasi ini bukanlah pengganti konsultan perencana keuangan bersertifikat profesional.

---
Dibuat dan dikembangkan oleh Jaka Perdana khusus untuk Top 99 Indonesia Next Hackathon.
