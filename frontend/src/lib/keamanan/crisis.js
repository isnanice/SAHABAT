/**
 * Deteksi krisis — DETERMINISTIK, TANPA AI, TANPA NETWORK.
 *
 * Ini jantung keselamatan sistem. Aturannya:
 *
 *   1. JANGAN pernah menambahkan panggilan network / LLM ke file ini.
 *      Lapisan ini harus tetap jalan justru KETIKA gateway AI mati.
 *   2. JANGAN memindahkannya ke belakang pemanggilan LLM. Urutan
 *      (rate limit -> krisis -> LLM) disengaja: anak yang menulis
 *      indikasi bunuh diri tidak boleh menunggu respons model.
 *   3. Kalau ragu antara false positive dan false negative, PILIH FALSE
 *      POSITIVE. Salah menampilkan panel darurat ke anak yang baik-baik
 *      saja itu canggung. Gagal mendeteksi anak yang tidak baik-baik saja
 *      itu tidak bisa diperbaiki.
 *
 * PERINGATAN UNTUK REVIEWER: daftar pola di bawah BUKAN instrumen skrining
 * klinis yang tervalidasi. Sebelum dipakai ke siswa sungguhan, Guru BK /
 * psikolog sekolah HARUS meninjaunya — lihat `docs/audit-crisis.md` untuk
 * lembar tinjauannya (bisa dikerjakan tanpa membaca kode).
 *
 * DASAR TEMA (bukan daftar kata yang tervalidasi):
 * Suherman, Keliat, Daulima & Besral (2022), "Identifikasi Isyarat Bunuh Diri
 * Verbal dan Non Verbal dalam Upaya Deteksi Risiko Bunuh Diri pada Remaja:
 * Literatur Review", Jurnal Endurance 7(3), 588-598, Fakultas Keperawatan UI.
 * DOI: 10.22216/jen.v7i3.1689
 *
 * Paper itu mengidentifikasi tema isyarat verbal: keputusasaan,
 * ketidakberdayaan, harga diri rendah, merasa terjebak, tidak ada jalan
 * keluar, tidak ada alasan/tujuan hidup, menulis tentang kematian, dan
 * mengancam menyakiti diri. Pola di bawah mencoba menutup tema-tema itu.
 *
 * PENTING: penelitian tersebut tentang MANUSIA yang mengamati remaja, bukan
 * regex. Sebagian tema TIDAK BISA diterjemahkan ke pencocokan teks —
 * "harga diri rendah" dan isyarat non-verbal (menarik diri, perubahan tidur,
 * memberi barang berharga secara diam-diam) hanya terlihat oleh orang yang
 * mengenal anak itu. Lapisan ini menangkap yang tertulis eksplisit; ia TIDAK
 * menggantikan Guru BK yang memperhatikan muridnya.
 */

export const KATEGORI_KRISIS = {
  BUNUH_DIRI: 'bunuh_diri',
  SELF_HARM: 'self_harm',
  KEKERASAN_SEKSUAL: 'kekerasan_seksual',
  // Kategori KEEMPAT, di luar tiga yang spec §1c sebutkan.
  //
  // Ditambahkan setelah uji nyata menemukan celahnya: siswa menulis "aku
  // hampir dibunuh, di kantin, baru saja, sudah 3 kali". AI menandainya
  // KRITIS ("ancaman fisik serius") dan laporannya naik ke puncak antrean —
  // tapi flag_krisis TIDAK menyala, jadi anak itu TIDAK dapat panel darurat.
  // Bot menjawabnya seperti obrolan biasa.
  //
  // Spec §1c cuma menyebut bunuh diri / self-harm / kekerasan seksual. Anak
  // yang baru saja hampir dibunuh sedang dalam bahaya sekarang, dan pesan
  // panel darurat ("temui orang dewasa yang kamu percaya SECEPATNYA") persis
  // yang dia butuhkan. Menahannya karena kategori tidak tertulis di spec itu
  // membaca aturan, bukan membaca anak.
  BAHAYA_FISIK: 'bahaya_fisik',
}

/**
 * Pola sengaja multi-kata.
 *
 * Dalam bahasa Indonesia "mati" muncul di banyak idiom netral — "mati
 * lampu", "mati gaya", "capek setengah mati", "berjuang mati-matian",
 * "hp-ku mati". Mencocokkan kata "mati" sendirian akan memicu panel
 * darurat pada anak yang cuma mengeluh sinyal. Jadi setiap pola di sini
 * menuntut konteks niat di sekitarnya.
 */
const POLA = [
  // --- Bunuh diri ---
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bbunuh diri\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bbundir\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(peng[ei]n|pingin|ingin|mau|kepengen)\s+(mati|mati aja|matii)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(mending|mendingan|lebih baik|mnding)\s+(mati|gak ada|ga ada|ilang|hilang)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(ngakhirin|mengakhiri|akhiri|udahin|sudahi)\s+(hidup|semuanya|hidupku)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(ga|gak|nggak|tidak|males|udah gak)\s+(mau|pengen|pingin|kuat|sanggup)\s+hidup\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bhidupku (gak|ga|nggak|tidak) (ada|punya) (arti|guna|makna)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(pengen|pingin|mau|ingin)\s+(ilang|hilang|lenyap)\s+(aja|selamanya|dari dunia)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gantung diri|terjun dari|loncat dari gedung|minum racun)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bdunia (lebih baik|mending|lebih enak) tanpa (aku|gue|saya)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gak|ga|nggak|tidak) (ada|punya) (alasan|gunanya) (buat|untuk) (hidup|lanjut)\b/ },

  // --- Tambahan dari literatur (lihat sumber di bawah berkas ini) ---
  // Tema "merasa terjebak" & "tidak ada jalan keluar".
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gak|ga|nggak|tidak|gaada|ga ada|gada)\s*(ada)?\s*jalan keluar\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(udah|sudah|semua)\s*(terasa\s*)?buntu\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gak|ga|nggak|tidak) (bisa|akan) keluar dari (ini|semua ini|masalah ini)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(terjebak|terperangkap) (dan|terus|selamanya|gak bisa)\b/ },

  // Tema "keputusasaan" & "ketidakberdayaan".
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bcapek hidup\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gak|ga|nggak|tidak|gaada|ga ada|gada)\s*(ada)?\s*harapan (lagi|sama sekali)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\bpercuma (hidup|aku hidup|semuanya)\b/ },
  // "gaada"/"gada" ditulis menyatu — bentuk yang paling lazim diketik remaja.
  // Pola yang cuma menerima "ga ada" berspasi akan melewatkannya.
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(gaada|gada|(gak|ga|nggak|tidak) (ada|punya)) (masa depan|harapan)\b/ },

  // Tema "memberikan barang berharga" — isyarat perilaku, sering muncul
  // sebagai kalimat perpisahan yang terdengar biasa.
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(barang|barang-barang)(ku|q)?\s*(buat|untuk)\s*(kamu|kalian|lo)\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\baku (kasih|kasihin|wariskan)\s*(semua)?\s*barang(ku)?\b/ },
  { kategori: KATEGORI_KRISIS.BUNUH_DIRI, re: /\b(simpen|simpan|jaga)\s*barang(ku|q)\s*(ya|yaa)?\b/ },

  // --- Self-harm ---
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\b(nyilet|nyayat|menyayat|sayat)\s*(tangan|pergelangan|lengan|diri)?\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\b(silet|cutter|pisau)\s+(tangan|lengan|pergelangan)\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\b(nyakitin|menyakiti|melukai|lukai)\s+(diri|diriku|diri sendiri|badan sendiri)\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\bself\s*-?\s*harm\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\b(overdosis|od)\s+(obat|pil)\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\bminum obat\s+(banyak|sekaligus|banyak banget)\b/ },
  { kategori: KATEGORI_KRISIS.SELF_HARM, re: /\b(bakar|membakar|nyundut|sundut)\s+(tangan|lengan|kulit|diri)\b/ },

  // --- Bahaya fisik langsung ---
  //
  // JANGAN pakai pola telanjang /\bdibunuh\b/. "Dibunuh" adalah idiom
  // sehari-hari yang sangat umum: "gue dibunuh nyokap kalau pulang telat",
  // "aku dibunuh tugas". Pola telanjang akan menyalakan panel darurat ke anak
  // yang cuma takut dimarahi — lalu semua orang belajar mengabaikan panelnya.
  // Setiap pola di bawah menuntut konteks bahaya nyata di sekitarnya.
  //
  // Juga JANGAN masukkan "dipukul" biasa: itu perundungan fisik yang memang
  // ditangani jalur laporan normal, bukan keadaan darurat. Yang masuk sini
  // hanya yang menandakan anak sedang/hampir celaka serius.
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\bhampir (dibunuh|dibacok|ditusuk|mati dipukul)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(diancam|ngancem|mengancam|ngancam)\s+(mau\s+|akan\s+)?(bunuh|dibunuh|bacok|dibacok|tusuk|ditusuk)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(dikeroyok|dikroyok|dikeroyokin)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(ditodong|todongin|ditodongin)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(dibacok|ditusuk|ditusukin)\b/ },
  // "ngancam"/"ngancem" ditulis tanpa spasi setelah "ng" — \bancam\b TIDAK
  // cocok di dalamnya (tidak ada batas kata). Varian imbuhan gaul harus
  // disebut eksplisit, kalau tidak polanya bocor diam-diam.
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(bawa|pakai|pake|megang)\s+(pisau|golok|celurit|senjata|cutter)\b.{0,30}\b(ancam|ngancam|ngancem|mengancam|todong|todongin|nodong|nyerang|serang|takut)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\bdipukuli\s+(rame-rame|beramai|banyak orang|terus)\b/ },
  { kategori: KATEGORI_KRISIS.BAHAYA_FISIK, re: /\b(mau|akan|bakal)\s+dibunuh\s+(sama|ama)\s+(kakak kelas|temen|teman|mereka|geng)\b/ },

  // --- Kekerasan seksual ---
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\b(diperkosa|memperkosa|perkosa|pemerkosaan)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\b(dilecehkan|pelecehan seksual|melecehkan)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\b(disodomi|sodomi)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\b(diraba|meraba|dipegang|megang)\s+(dada|payudara|pantat|kemaluan|bagian (pribadi|sensitif)|selangkangan)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\bdipaksa\s+(berhubungan|bugil|telanjang|buka baju|ciuman|melakukan hal)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\b(foto|video)\s+(bugil|telanjang|tanpa busana)\b/ },
  { kategori: KATEGORI_KRISIS.KEKERASAN_SEKSUAL, re: /\bdiancam\s+(sebar|nyebar)\s+(foto|video)\b/ },
]

/**
 * Samakan bentuk teks supaya variasi ketikan remaja tetap tertangkap.
 * Contoh yang harus lolos ke pola: "PENGEN MATIII AJA!!!", "peng3n mati".
 */
function normalisasi(teks) {
  return String(teks)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')      // buang diakritik
    // leetspeak dasar — remaja sering pakai angka pengganti huruf
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/\$/g, 's')
    // "matiii" -> "matii" -> biarkan pola menangani, tapi pangkas ekor panjang
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')   // tanda baca jadi spasi
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Periksa satu potong teks.
 *
 * Murni fungsi lokal: tidak ada I/O, tidak ada await, tidak bisa gagal
 * karena jaringan. Aman dipanggil sebelum apa pun yang lain.
 *
 * @param {string} teks
 * @returns {{krisis: boolean, kategori: string[], pola: string[]}}
 */
export function deteksiKrisis(teks) {
  if (!teks || typeof teks !== 'string') {
    return { krisis: false, kategori: [], pola: [] }
  }

  const bersih = normalisasi(teks)
  const kategori = new Set()
  const pola = []

  for (const { kategori: kat, re } of POLA) {
    if (re.test(bersih)) {
      kategori.add(kat)
      pola.push(re.source)
    }
  }

  return { krisis: kategori.size > 0, kategori: [...kategori], pola }
}

/**
 * Periksa seluruh riwayat chat, bukan cuma pesan terakhir.
 * Hanya pesan siswa yang diperiksa — balasan bot tentu menyebut istilah
 * krisis saat merespons, dan itu tidak boleh memicu ulang.
 */
export function deteksiKrisisRiwayat(messages) {
  if (!Array.isArray(messages)) return { krisis: false, kategori: [], pola: [] }

  const kategori = new Set()
  const pola = []

  for (const m of messages) {
    if (!m || m.role !== 'user') continue
    const hasil = deteksiKrisis(m.content)
    hasil.kategori.forEach((k) => kategori.add(k))
    pola.push(...hasil.pola)
  }

  return { krisis: kategori.size > 0, kategori: [...kategori], pola }
}
