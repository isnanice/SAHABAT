/**
 * AI Chatbot Service untuk SAHABAT
 * Menggunakan Anthropic API untuk pendampingan awal korban bullying
 */

const SYSTEM_PROMPT = `Kamu adalah KAWAN, asisten AI yang hangat dan empatik dari platform SAHABAT — platform pendampingan anti-perundungan untuk siswa sekolah di Indonesia.

Tugasmu:
1. Mendengarkan dengan penuh empati dan tanpa menghakimi
2. Membantu siswa mengungkapkan perasaan dan pengalaman mereka
3. Memberikan dukungan emosional awal
4. Mengarahkan ke bantuan yang tepat (laporan resmi, konseling BK, dll)
5. TIDAK pernah memaksa siswa untuk mengungkap identitas mereka
6. Selalu menjaga kerahasiaan

Panduan respons:
- Gunakan bahasa Indonesia yang hangat, mudah dipahami remaja
- Jangan terlalu formal, tapi tetap sopan
- Validasi perasaan mereka sebelum memberikan saran
- Jika situasi darurat atau kritis, segera sarankan hubungi guru BK
- Panjang respons: 2-4 kalimat, kecuali diperlukan penjelasan lebih

Hal yang TIDAK boleh dilakukan:
- Mendiagnosis kondisi mental
- Memberikan saran medis
- Menyalahkan korban
- Mengungkap atau meminta data pribadi yang tidak perlu`

/**
 * Kirim pesan ke chatbot AI
 * @param {Array<{role: string, content: string}>} messages - Riwayat percakapan
 * @returns {Promise<string>} - Respons AI
 */
export async function sendChatbotMessage(messages) {
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
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}
