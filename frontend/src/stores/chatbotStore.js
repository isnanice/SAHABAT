import { create } from 'zustand'

/**
 * State RuangAman.
 *
 * `mode` menentukan apa yang boleh dilakukan UI:
 *   'normal'   -> chat biasa
 *   'gangguan' -> AI down; tampilkan balasan apa adanya, input tetap boleh
 *   'nonaktif' -> input disembunyikan
 *   'krisis'   -> INPUT WAJIB DIKUNCI + panel darurat tampil (spec §4.1B)
 *
 * Sekali masuk 'krisis', state TIDAK kembali ke normal di sesi ini. Anak yang
 * baru menulis indikasi bunuh diri tidak boleh dikembalikan ke chat seolah
 * tidak terjadi apa-apa — yang dia butuhkan sekarang manusia, bukan bot.
 */

const SESI_KEY = 'sahabat_sesi'

/**
 * ID sesi hanya untuk rate limit — bukan identitas, bukan autentikasi.
 * Disimpan di sessionStorage (bukan localStorage) supaya hilang saat tab
 * ditutup: ini komputer sekolah yang dipakai bergantian.
 */
function ambilSesi() {
  if (typeof window === 'undefined') return ''
  let sesi = sessionStorage.getItem(SESI_KEY)
  if (!sesi) {
    sesi = crypto.randomUUID()
    sessionStorage.setItem(SESI_KEY, sesi)
  }
  return sesi
}

const SAPAAN =
  'Halo. Aku asisten SAHABAT — aku di sini buat bantu kamu menyusun ' +
  'ceritamu jadi laporan yang jelas buat Guru BK. Laporanmu tetap anonim.\n\n' +
  'Ceritakan pelan-pelan aja: apa yang terjadi?'

const useChatbotStore = create((set, get) => ({
  messages: [],
  loading: false,
  isOpen: false,
  mode: 'normal',
  hotline: [],
  // Setelah beberapa giliran, tawarkan "Jadikan Laporan" (spec §4.1B).
  bisaJadikanLaporan: false,

  setOpen: (isOpen) => set({ isOpen }),

  initSession: () => {
    if (get().messages.length > 0) return
    ambilSesi()
    set({
      messages: [{ id: '0', role: 'assistant', content: SAPAAN }],
      mode: 'normal',
      hotline: [],
      bisaJadikanLaporan: false,
    })
  },

  sendMessage: async (content) => {
    // Palang keras: kalau sudah krisis, jangan kirim apa pun lagi.
    if (get().mode === 'krisis' || get().loading) return

    const { messages } = get()
    const userMessage = { id: Date.now().toString(), role: 'user', content }
    const riwayat = [...messages, userMessage]

    set({ messages: riwayat, loading: true })

    let data
    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sesi': ambilSesi(),
        },
        body: JSON.stringify({
          messages: riwayat.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      data = await response.json()
    } catch {
      set((s) => ({
        loading: false,
        mode: 'gangguan',
        messages: [
          ...s.messages,
          {
            id: `${Date.now() + 1}`,
            role: 'assistant',
            content:
              'Koneksinya bermasalah jadi aku belum bisa membalas. Kamu tetap bisa ' +
              'mengirim laporan lewat tombol "Lapor Sekarang", dan laporanmu akan ' +
              'tetap sampai ke Guru BK.',
          },
        ],
      }))
      return
    }

    const mode = data?.mode || 'normal'
    const balasan = data?.balasan || data?.error || 'Maaf, terjadi gangguan.'

    set((s) => ({
      loading: false,
      mode,
      hotline: Array.isArray(data?.hotline) ? data.hotline : [],
      messages: [
        ...s.messages,
        { id: `${Date.now() + 1}`, role: 'assistant', content: balasan },
      ],
      // Krisis membatalkan alur pelaporan biasa — panel darurat yang
      // menyediakan tombolnya sendiri ("Buat Laporan Prioritas").
      bisaJadikanLaporan:
        mode === 'normal' && s.messages.filter((m) => m.role === 'user').length >= 2,
    }))
  },

  /** Transkrip untuk dikirim ke /api/laporan saat siswa menekan "Jadikan Laporan". */
  transkrip: () =>
    get()
      .messages.filter((m) => m.id !== '0')
      .map((m) => ({ role: m.role, content: m.content })),

  reset: () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(SESI_KEY)
    set({ messages: [], mode: 'normal', hotline: [], bisaJadikanLaporan: false })
  },
}))

export default useChatbotStore
