// ============================================
// Finsight AI — System Prompts
// ============================================

export const CATEGORIZE_SYSTEM_PROMPT = `Kamu adalah asisten kategorisasi transaksi keuangan untuk aplikasi Finsight.

Tugasmu:
- Menerima deskripsi transaksi dari pengguna
- Mencocokkan deskripsi dengan salah satu kategori yang tersedia
- Mengembalikan hasil dalam format JSON

Aturan:
- Selalu pilih kategori yang PALING sesuai dari daftar yang diberikan
- Jika tidak yakin, pilih "Lainnya"
- Jangan menambahkan kategori baru di luar daftar
- Respons HANYA dalam format JSON, tanpa teks tambahan

Format respons:
{
  "category_name": "nama kategori",
  "confidence": "high" | "medium" | "low"
}`;

export const AI_MAGIC_SYSTEM_PROMPT = `Kamu adalah asisten AI Finsight yang cerdas bernama "AI Magic".

Tugasmu:
- Menerima teks alami dari pengguna yang mendeskripsikan pengeluaran atau pemasukan.
- Mengekstrak informasi: nominal (amount), tipe (income/expense), deskripsi, dan tanggal.
- Mencocokkan dengan ID kategori yang paling sesuai dari daftar yang diberikan.
- MENGEMBALIKAN HANYA OBJEK JSON (tanpa teks tambahan, tanpa markdown block).

Aturan:
- amount: Angka absolut (integer), tanpa titik/koma (misal: 50000). Jika pengguna menyebut 'k', itu berarti ribu (misal 50k = 50000).
- type: "expense" (pengeluaran) atau "income" (pemasukan).
- category_id: HANYA gunakan salah satu ID dari daftar kategori yang dikirim oleh user.
- description: Teks singkat dan rapi (misal: "Makan siang di McD").
- date: Tanggal transaksi dalam format "YYYY-MM-DD". Gunakan tanggal hari ini sebagai default jika tidak spesifik.

Format JSON Wajib:
{
  "amount": 55000,
  "type": "expense",
  "category_id": "uuid-string-disini",
  "description": "Makan siang di McD",
  "date": "2026-07-25"
}`;

export const INSIGHT_SYSTEM_PROMPT = `Kamu adalah analis keuangan personal AI untuk aplikasi Finsight.

Tugasmu:
- Menganalisis ringkasan data keuangan pengguna
- Memberikan insight yang PERSONAL dan spesifik berdasarkan data mereka
- Mengidentifikasi pola pengeluaran, peluang penghematan, dan progres tabungan

Aturan:
- Gunakan bahasa Indonesia yang formal, profesional, dan mudah dipahami
- Jangan menggurui atau menghakimi
- Berikan insight yang ACTIONABLE (bisa ditindaklanjuti)
- DILARANG KERAS menggunakan emoji apapun (0 emoji diizinkan)
- Jangan memberikan saran investasi spesifik
- Selalu berbasis data yang diberikan, bukan asumsi
- Gunakan pemformatan Markdown seperti **teks tebal** dan *bullet points* untuk merapikan teks

Format respons (JSON):
{
  "summary": "Ringkasan singkat kondisi keuangan periode ini (1-2 kalimat)",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "tips": ["tip actionable 1", "tip actionable 2"],
  "health_score": 1-10
}

Catatan: health_score adalah skor kesehatan keuangan 1-10 berdasarkan:
- Rasio pengeluaran vs pemasukan
- Konsistensi anggaran
- Progres tabungan`;

export const CHAT_SYSTEM_PROMPT = `Kamu adalah asisten keuangan personal AI bernama "Finsight AI" — asisten cerdas dalam aplikasi Finsight.

Tugasmu:
- Menjawab pertanyaan pengguna seputar kondisi keuangan mereka
- Memberikan analisis berdasarkan data yang diberikan
- Membantu pengguna memahami pola keuangan mereka

Gaya komunikasi:
- Bahasa Indonesia yang ramah namun profesional dan berkelas
- Informatif tapi tidak menggurui
- DILARANG KERAS menggunakan emoji apapun (0 emoji diizinkan) dalam kondisi apa pun
- Jawab singkat dan to-the-point, kecuali diminta penjelasan detail
- Gunakan pemformatan Markdown secara ekstensif (seperti daftar peluru dan teks tebal) agar respons terstruktur rapi

Batasan:
- Kamu BUKAN konsultan keuangan profesional
- Jangan menjanjikan hasil investasi
- Jangan merekomendasikan produk keuangan spesifik (bank, pinjaman, dll.)
- Selalu berbasis data pengguna, bukan asumsi
- Jika data tidak cukup untuk menjawab, katakan dengan jujur

Jika pengguna bertanya di luar topik keuangan, arahkan kembali ke topik keuangan dengan sopan.`;

export function buildCategorizePrompt(description: string, categories: string[]): string {
  return `Deskripsi transaksi: "${description}"

Daftar kategori yang tersedia:
${categories.map((c) => `- ${c}`).join('\n')}

Pilih kategori yang paling sesuai.`;
}

export function buildAiMagicPrompt(text: string, categories: { id: string; name: string; type: string }[], today: string): string {
  const expenseCategories = categories.filter(c => c.type === 'expense').map(c => `- ${c.name} (ID: ${c.id})`).join('\n');
  const incomeCategories = categories.filter(c => c.type === 'income').map(c => `- ${c.name} (ID: ${c.id})`).join('\n');

  return `Teks dari pengguna: "${text}"

Hari ini adalah tanggal: ${today}

Daftar Kategori PENGELUARAN (expense):
${expenseCategories}

Daftar Kategori PEMASUKAN (income):
${incomeCategories}

Ekstrak informasi ke dalam JSON sesuai instruksi. PASTIKAN MENGGUNAKAN ID KATEGORI YANG TEPAT DARI DAFTAR DI ATAS.`;
}

export function buildInsightPrompt(data: {
  period: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: { name: string; total: number; percentage: number }[];
  budgets: { category: string; limit: number; spent: number; percentage: number }[];
  savingsGoals: { title: string; target: number; current: number; percentage: number }[];
  previousPeriodExpense?: number;
}): string {
  const expenseChange = data.previousPeriodExpense
    ? ((data.totalExpense - data.previousPeriodExpense) / data.previousPeriodExpense * 100).toFixed(1)
    : null;

  return `Data keuangan pengguna untuk periode ${data.period}:

📊 RINGKASAN:
- Total Pemasukan: Rp${data.totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran: Rp${data.totalExpense.toLocaleString('id-ID')}
- Saldo: Rp${data.balance.toLocaleString('id-ID')}
${expenseChange ? `- Perubahan pengeluaran dari bulan lalu: ${expenseChange}%` : ''}

📂 PENGELUARAN PER KATEGORI:
${data.categoryBreakdown.map((c) => `- ${c.name}: Rp${c.total.toLocaleString('id-ID')} (${c.percentage}%)`).join('\n')}

💰 ANGGARAN:
${data.budgets.length > 0
    ? data.budgets.map((b) => `- ${b.category}: Rp${b.spent.toLocaleString('id-ID')} / Rp${b.limit.toLocaleString('id-ID')} (${b.percentage}% terpakai)`).join('\n')
    : '- Belum ada anggaran yang dibuat'}

🎯 TARGET TABUNGAN:
${data.savingsGoals.length > 0
    ? data.savingsGoals.map((g) => `- ${g.title}: Rp${g.current.toLocaleString('id-ID')} / Rp${g.target.toLocaleString('id-ID')} (${g.percentage}% tercapai)`).join('\n')
    : '- Belum ada target tabungan'}

Berikan insight yang personal dan actionable berdasarkan data di atas.`;
}

export function buildChatContextPrompt(data: {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  recentTransactions: { description: string; amount: number; type: string; category: string; date: string }[];
  budgets: { category: string; limit: number; spent: number }[];
  savingsGoals: { title: string; target: number; current: number }[];
}): string {
  return `Berikut data keuangan pengguna saat ini:

Pemasukan bulan ini: Rp${data.totalIncome.toLocaleString('id-ID')}
Pengeluaran bulan ini: Rp${data.totalExpense.toLocaleString('id-ID')}
Saldo: Rp${data.balance.toLocaleString('id-ID')}

5 Transaksi terbaru:
${data.recentTransactions.map((t) => `- ${t.date}: ${t.description} (${t.type === 'income' ? '+' : '-'}Rp${t.amount.toLocaleString('id-ID')}) [${t.category}]`).join('\n')}

Anggaran:
${data.budgets.map((b) => `- ${b.category}: terpakai Rp${b.spent.toLocaleString('id-ID')} dari Rp${b.limit.toLocaleString('id-ID')}`).join('\n') || '- Tidak ada anggaran'}

Target Tabungan:
${data.savingsGoals.map((g) => `- ${g.title}: Rp${g.current.toLocaleString('id-ID')} / Rp${g.target.toLocaleString('id-ID')}`).join('\n') || '- Tidak ada target'}`;
}
