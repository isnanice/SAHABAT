#!/usr/bin/env node
/**
 * Seed data demo: 1 sekolah + akun Guru BK + beberapa laporan dummy.
 *
 * Jalankan:
 *   node scripts/seed.mjs
 *
 * Butuh di environment (jangan taruh di Git):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TICKET_PEPPER
 *
 * Kenapa akun Guru BK harus dibuat di sini, bukan lewat halaman daftar:
 * migrasi 002 memaksa semua pendaftaran mandiri jadi SISWA. Sebelumnya
 * handle_new_user() menyalin `role` dari metadata pendaftar, jadi siapa pun
 * bisa signUp({ data: { role: 'GURU_BK' } }) dan langsung melihat seluruh
 * laporan sekolahnya. Sekarang role staf hanya bisa diberikan lewat
 * service_role — yaitu skrip ini.
 */

import { createClient } from '@supabase/supabase-js'
import { createHmac, randomBytes, randomInt } from 'node:crypto'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PEPPER = process.env.TICKET_PEPPER

for (const [nama, nilai] of [
  ['NEXT_PUBLIC_SUPABASE_URL', URL],
  ['SUPABASE_SERVICE_ROLE_KEY', SERVICE_KEY],
  ['TICKET_PEPPER', PEPPER],
]) {
  if (!nilai) {
    console.error(`✗ ${nama} belum diset.`)
    process.exit(1)
  }
}
if (PEPPER.length < 32) {
  console.error('✗ TICKET_PEPPER harus >= 32 karakter (openssl rand -hex 32)')
  process.exit(1)
}

const db = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const kodeTiket = () =>
  `SAH-${Array.from({ length: 8 }, () => ALFABET[randomInt(ALFABET.length)])
    .join('')
    .replace(/^(.{4})/, '$1-')}`
const hash = (k) =>
  createHmac('sha256', PEPPER).update(k.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex')

const SEKOLAH_DEMO = '00000000-0000-0000-0000-000000000001'
// Sekolah kedua khusus untuk menguji isolasi antar sekolah (spec §8.7).
const SEKOLAH_LAIN = '00000000-0000-0000-0000-000000000002'

async function sekolah() {
  const { error } = await db.from('sekolah').upsert(
    [
      { id: SEKOLAH_DEMO, nama: 'SMA Negeri 1 Demo', npsn: 'DEMO-001' },
      { id: SEKOLAH_LAIN, nama: 'SMA Negeri 2 Pembanding', npsn: 'DEMO-002' },
    ],
    { onConflict: 'id' }
  )
  if (error) throw new Error(`sekolah: ${error.message}`)
  console.log('✓ sekolah')
}

async function akunStaf(email, password, nama, sekolahId, role = 'GURU_BK') {
  const { data: dibuat, error: errAuth } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: nama },
  })

  let userId = dibuat?.user?.id

  if (errAuth) {
    if (!/already/i.test(errAuth.message)) throw new Error(`auth ${email}: ${errAuth.message}`)
    const { data: daftar } = await db.auth.admin.listUsers()
    userId = daftar?.users?.find((u) => u.email === email)?.id
    if (!userId) throw new Error(`tidak bisa menemukan user lama: ${email}`)
  }

  // Trigger handle_new_user() sudah membuat baris profiles dengan role SISWA
  // (sengaja — lihat komentar di atas). Naikkan ke role staf di sini, lewat
  // service_role, satu-satunya jalur yang boleh melakukannya.
  const { error: errProfil } = await db
    .from('profiles')
    .update({ role, school_id: sekolahId, full_name: nama, aktif: true })
    .eq('id', userId)

  if (errProfil) throw new Error(`profil ${email}: ${errProfil.message}`)
  console.log(`✓ ${role}: ${email}`)
  return userId
}

const LAPORAN_DEMO = [
  {
    deskripsi:
      'Setiap istirahat aku selalu diejek soal berat badan sama beberapa kakak kelas ' +
      'di kantin. Sudah hampir tiap hari selama sebulan. Aku jadi males ke kantin dan ' +
      'nunggu di kelas aja.',
    lokasi: 'Kantin',
    ai_urgensi: 'SEDANG',
    ai_jenis: 'VERBAL',
    ai_confidence: 0.82,
    ai_gagal: false,
    flag_krisis: false,
  },
  {
    deskripsi:
      'Ada grup chat kelas yang isinya nyebarin foto aku diedit jadi bahan lelucon. ' +
      'Banyak yang ikut ketawa. Aku sudah minta dihapus tapi malah tambah dijadiin bahan.',
    lokasi: 'Online',
    ai_urgensi: 'TINGGI',
    ai_jenis: 'SIBER',
    ai_confidence: 0.91,
    ai_gagal: false,
    flag_krisis: false,
  },
  {
    deskripsi:
      'Aku didorong sampai jatuh di tangga belakang sama tiga orang. Tas aku dibuang. ' +
      'Ini yang kedua kalinya minggu ini.',
    lokasi: 'Tangga',
    ai_urgensi: 'TINGGI',
    ai_jenis: 'FISIK',
    ai_confidence: 0.88,
    ai_gagal: false,
    flag_krisis: false,
  },
  {
    // Baris ini memvalidasi badge "AI gagal / perlu baca manual" di dashboard.
    deskripsi: 'aku capek banget sama semuanya, gatau harus cerita ke siapa lagi',
    lokasi: null,
    ai_urgensi: null,
    ai_jenis: null,
    ai_confidence: null,
    ai_gagal: true,
    flag_krisis: false,
  },
  {
    // Confidence rendah -> juga harus memunculkan badge "perlu baca manual".
    deskripsi: 'dia gitu terus ke aku, gatau kenapa',
    lokasi: 'Kelas',
    ai_urgensi: 'RENDAH',
    ai_jenis: 'SOSIAL',
    ai_confidence: 0.34,
    ai_gagal: false,
    flag_krisis: false,
  },
]

async function laporan() {
  const kode = []

  for (const l of LAPORAN_DEMO) {
    const k = kodeTiket()
    const urgensiFinal = l.flag_krisis ? 'KRITIS' : l.ai_urgensi ?? 'SEDANG'

    const { error } = await db.from('laporan_bullying').insert({
      kode_tiket_hash: hash(k),
      sekolah_id: SEKOLAH_DEMO,
      pelapor_id: null,
      korban_id: null,
      anonim: true,
      deskripsi: l.deskripsi,
      lokasi: l.lokasi,
      ai_urgensi: l.ai_urgensi,
      ai_jenis: l.ai_jenis,
      ai_confidence: l.ai_confidence,
      ai_gagal: l.ai_gagal,
      ai_klasifikasi: { seed: true },
      urgensi_final: urgensiFinal,
      jenis_final: l.ai_jenis,
      flag_krisis: l.flag_krisis,
      prioritas: urgensiFinal,
      jenis_bullying: l.ai_jenis ?? 'VERBAL',
      status: 'MENUNGGU',
    })

    if (error) throw new Error(`laporan: ${error.message}`)
    kode.push(k)
  }

  // Satu laporan di sekolah LAIN — supaya isolasi antar sekolah bisa diuji:
  // login sebagai BK sekolah demo tidak boleh melihat baris ini.
  const kLain = kodeTiket()
  const { error: errLain } = await db.from('laporan_bullying').insert({
    kode_tiket_hash: hash(kLain),
    sekolah_id: SEKOLAH_LAIN,
    pelapor_id: null,
    korban_id: null,
    anonim: true,
    deskripsi: 'Laporan milik sekolah lain — BK sekolah demo TIDAK boleh melihat ini.',
    lokasi: 'Lapangan',
    ai_urgensi: 'SEDANG',
    ai_jenis: 'VERBAL',
    ai_confidence: 0.7,
    ai_gagal: false,
    urgensi_final: 'SEDANG',
    jenis_final: 'VERBAL',
    flag_krisis: false,
    prioritas: 'SEDANG',
    jenis_bullying: 'VERBAL',
    status: 'MENUNGGU',
  })
  if (errLain) throw new Error(`laporan sekolah lain: ${errLain.message}`)

  console.log(`✓ ${LAPORAN_DEMO.length} laporan (sekolah demo) + 1 (sekolah pembanding)`)
  return kode
}

/**
 * Password dibangkitkan acak, TIDAK ditulis di berkas ini.
 *
 * Versi sebelumnya menaruh password tetap langsung di kode. Repo ini publik —
 * artinya siapa pun yang membacanya bisa login sebagai Guru BK dan membaca
 * laporan siswa. Untuk DB dummy itu tidak berbahaya, tapi skrip seed punya
 * kebiasaan buruk: ia dipakai ulang di lingkungan berikutnya, dan password
 * yang sudah beredar ikut terbawa.
 *
 * Bisa di-override lewat env kalau tim butuh password tetap untuk latihan
 * demo bersama — tapi defaultnya acak dan sekali pakai.
 */
function sandiBaru() {
  return randomBytes(9).toString('base64url') + '#Aa1'
}

async function main() {
  console.log('Seeding SAHABAT...\n')

  const sandi = {
    bk: process.env.SEED_SANDI_BK || sandiBaru(),
    bkLain: process.env.SEED_SANDI_BK_LAIN || sandiBaru(),
    kepsek: process.env.SEED_SANDI_KEPSEK || sandiBaru(),
  }

  await sekolah()
  await akunStaf('bk.demo@sahabat.test', sandi.bk, 'Ibu Rina (Guru BK)', SEKOLAH_DEMO)
  await akunStaf('bk.lain@sahabat.test', sandi.bkLain, 'Pak Andi (BK Sekolah Lain)', SEKOLAH_LAIN)
  await akunStaf(
    'kepsek.demo@sahabat.test',
    sandi.kepsek,
    'Bapak Hadi (Kepala Sekolah)',
    SEKOLAH_DEMO,
    'KEPALA_SEKOLAH'
  )
  const kode = await laporan()

  console.log('\n--- Login demo (CATAT SEKARANG, tidak ditampilkan lagi) ---')
  console.log(`Guru BK        : bk.demo@sahabat.test / ${sandi.bk}`)
  console.log(`BK sekolah lain: bk.lain@sahabat.test / ${sandi.bkLain}  (uji isolasi §8.7)`)
  console.log(`Kepala Sekolah : kepsek.demo@sahabat.test / ${sandi.kepsek}`)

  console.log('\n--- Kode tiket demo (untuk uji "Cek Laporan") ---')
  kode.forEach((k) => console.log(`  ${k}`))
  console.log(
    '\nCatatan: kode tiket di atas hanya tampil SEKARANG. DB cuma menyimpan\n' +
      'hash-nya, jadi kalau hilang tidak bisa dipulihkan — persis seperti tiket\n' +
      'siswa asli.\n\n' +
      'Password di atas acak dan hanya untuk DEMO. Kalau butuh password tetap,\n' +
      'set SEED_SANDI_BK / SEED_SANDI_BK_LAIN / SEED_SANDI_KEPSEK di environment\n' +
      '— jangan tulis balik ke berkas ini.'
  )
}

main().catch((e) => {
  console.error(`\n✗ Seed gagal: ${e.message}`)
  process.exit(1)
})
