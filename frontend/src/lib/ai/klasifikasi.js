/**
 * AI Klasifikasi Laporan Bullying
 * Menganalisis laporan dan memberikan:
 * - Tingkat prioritas (RENDAH/SEDANG/TINGGI/KRITIS)
 * - Jenis bullying
 * - Rekomendasi penanganan
 */

const KLASIFIKASI_PROMPT = `Kamu adalah sistem analisis laporan perundungan sekolah. 
Analisis laporan berikut dan berikan output HANYA dalam format JSON valid, tanpa teks lain.

Format output:
{
  "prioritas": "RENDAH|SEDANG|TINGGI|KRITIS",
  "jenis_bullying": "VERBAL|FISIK|SIBER|SOSIAL|SEKSUAL",
  "skor_urgensi": 1-10,
  "kata_kunci": ["array", "kata", "penting"],
  "rekomendasi": "singkat rekomendasi penanganan",
  "perlu_eskalasi": true|false,
  "alasan": "alasan singkat klasifikasi"
}

Kriteria prioritas:
- KRITIS: ancaman fisik serius, kekerasan seksual, risiko self-harm
- TINGGI: bullying berulang, melibatkan banyak pelaku, dampak psikologis berat
- SEDANG: bullying verbal/siber terjadi beberapa kali, ada dampak
- RENDAH: insiden tunggal, dampak minimal`

/**
 * Klasifikasi laporan bullying menggunakan AI
 * @param {string} deskripsi - Deskripsi laporan bullying
 * @param {Object} metadata - Data tambahan (kelas, lokasi, dll)
 * @returns {Promise<Object>} - Hasil klasifikasi
 */
export async function klasifikasiLaporan(deskripsi, metadata = {}) {
  const userMessage = `Laporan: "${deskripsi}"
  
Metadata tambahan: ${JSON.stringify(metadata)}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: KLASIFIKASI_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Klasifikasi AI error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text

  try {
    return JSON.parse(text)
  } catch {
    // Fallback jika parsing gagal
    return {
      prioritas: 'SEDANG',
      jenis_bullying: 'VERBAL',
      skor_urgensi: 5,
      kata_kunci: [],
      rekomendasi: 'Perlu review manual oleh Guru BK',
      perlu_eskalasi: false,
      alasan: 'Gagal parsing otomatis, perlu review manual',
    }
  }
}
