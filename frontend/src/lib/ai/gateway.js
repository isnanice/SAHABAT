/**
 * Klien gateway LLM (OpenAI-compatible) — spec §2 & §6.
 *
 * Semua panggilan model lewat sini. Kunci HANYA dibaca di server; file ini
 * tidak boleh pernah diimpor dari komponen client.
 *
 * ===================== CATATAN MODEL REASONING =====================
 * deepseek-v4-flash/pro adalah model REASONING. Responsnya punya bentuk yang
 * mudah menjebak:
 *
 *   - Token "berpikir" masuk ke `message.reasoning_content`, BUKAN `content`.
 *   - Keduanya dihitung terhadap `max_tokens` yang sama.
 *   - Kalau anggaran habis saat masih berpikir, `content` KOSONG dan
 *     `finish_reason` jadi "length" — panggilan sukses HTTP 200 tapi tanpa
 *     jawaban.
 *
 * Diukur sungguhan pada tugas klasifikasi kita: ~148 token reasoning + ~53
 * token jawaban. Dengan max_tokens 500 (nilai lama dari kode Anthropic) itu
 * muat, tapi tipis — laporan yang lebih panjang atau ambigu memicu reasoning
 * lebih panjang, lalu jawabannya terpotong. Hasilnya SETIAP laporan jadi
 * ai_gagal. Fail-safe akan menyelamatkan laporannya, tapi AI-nya tidak pernah
 * berguna. Karena itu anggarannya dilebihkan.
 *
 * `reasoning_content` SENGAJA tidak pernah disimpan atau di-log: isinya
 * penalaran model atas cerita anak, dan tidak ada yang butuh salinan kedua.
 * ===================================================================
 */

const DEFAULT_MODEL = 'deepseek-v4-flash'
const DEFAULT_URL = 'https://chenzk.top/v1/chat/completions'

/** Longgar: reasoning + jawaban harus muat, bukan cuma jawabannya. */
const MAX_TOKENS = 2000

/** Model reasoning berpikir dulu; 20s terlalu ketat. */
const TIMEOUT_MS = 45_000

export function modelAktif() {
  return process.env.LLM_MODEL || DEFAULT_MODEL
}

/**
 * Panggil gateway. TIDAK PERNAH throw — kegagalan dikembalikan sebagai objek.
 *
 * @returns {Promise<{ok: true, teks: string} | {ok: false, alasan: string}>}
 */
export async function panggilLLM({ system, messages, maxTokens = MAX_TOKENS }) {
  const url = process.env.LLM_GATEWAY_URL || DEFAULT_URL
  const key = process.env.LLM_GATEWAY_KEY

  if (!key) return { ok: false, alasan: 'LLM_GATEWAY_KEY belum diset' }

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modelAktif(),
        max_tokens: maxTokens,
        messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
      }),
    })
  } catch (e) {
    return { ok: false, alasan: e?.name === 'TimeoutError' ? 'timeout' : 'jaringan' }
  }

  if (!res.ok) return { ok: false, alasan: `HTTP ${res.status}` }

  let data
  try {
    data = await res.json()
  } catch {
    return { ok: false, alasan: 'respons bukan JSON' }
  }

  const choice = data?.choices?.[0]
  if (!choice) return { ok: false, alasan: 'respons tanpa choices' }

  const teks = choice.message?.content

  // Anggaran habis saat model masih berpikir: HTTP 200, tapi jawabannya
  // tidak pernah ada. Diperlakukan sebagai gagal, bukan sebagai balasan kosong.
  if (choice.finish_reason === 'length' && !teks?.trim()) {
    return { ok: false, alasan: 'anggaran token habis untuk reasoning' }
  }

  if (!teks?.trim()) return { ok: false, alasan: 'respons kosong' }

  return { ok: true, teks }
}
