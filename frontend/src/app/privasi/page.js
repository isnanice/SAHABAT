import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'

export const metadata = {
  title: 'Privasi & Data — SAHABAT',
  description: 'Apa yang SAHABAT simpan, siapa yang bisa melihatnya, dan apa yang tidak bisa kami janjikan.',
  robots: { index: false, follow: false },
}

/**
 * Halaman Privasi & Data.
 *
 * Ditulis untuk dibaca ANAK, bukan pengacara — anak yang sedang menimbang
 * apakah aman menceritakan kekerasan yang dia alami. Karena itu halaman ini
 * menyebut yang TIDAK bisa dijanjikan, bukan cuma yang bisa.
 *
 * Isinya menggambarkan arsitektur yang benar-benar berjalan (migrasi 002-004),
 * bukan aspirasi. Kalau arsitekturnya berubah, halaman ini HARUS ikut berubah.
 *
 * Sengaja TIDAK memakai istilah "end-to-end encryption" — lihat bagian
 * "Yang tidak bisa kami janjikan". Klaim itu tidak benar untuk sistem ini dan
 * dilarang spec §9.
 *
 * CATATAN TIM: ini penjelasan jujur, BUKAN dokumen hukum. Kalau SAHABAT
 * benar-benar dipakai sekolah, kebijakan privasi formal (UU PDP No. 27/2022,
 * termasuk soal data anak di bawah umur dan persetujuan wali) perlu disusun
 * dan ditinjau orang yang berkompeten. Jangan pakai halaman ini sebagai
 * penggantinya.
 */

const YANG_DISIMPAN = [
  'Cerita yang kamu tulis di laporan.',
  'Lokasi dan tanggal kejadian — kalau kamu isi (keduanya opsional).',
  'Hash dari kode tiketmu (bukan kodenya sendiri).',
  'Percakapan RuangAman — hanya kalau kamu sendiri menekan "Jadikan Laporan".',
  'Balasan yang kamu dan Guru BK tulis di thread tiket.',
]

const YANG_TIDAK_DISIMPAN = [
  'Namamu. Kami tidak pernah memintanya, dan tidak ada kolomnya untuk laporan anonim.',
  'Akunmu — kamu tidak perlu login untuk melapor.',
  'Alamat IP-mu. Pembatas anti-spam memakai kode sesi acak, bukan identitasmu.',
  'Kode tiketmu. Yang tersimpan cuma hash-nya, jadi kami sendiri tidak bisa membacanya kembali.',
  'Percakapan RuangAman yang tidak kamu jadikan laporan.',
]

function Daftar({ items, tipe }) {
  const Ikon = tipe === 'ya' ? Check : X
  const warna = tipe === 'ya' ? 'text-sahabat' : 'text-emerald-600'
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <Ikon size={16} className={`mt-1 shrink-0 ${warna}`} aria-hidden="true" />
          <span className="text-sm leading-relaxed text-gray-700">{t}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PrivasiPage() {
  return (
    <main className="min-h-screen bg-sahabat-latar px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali
        </Link>

        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Privasi &amp; Data</h1>
          <p className="mt-2 leading-relaxed text-gray-600">
            Kamu berhak tahu persis apa yang terjadi dengan ceritamu sebelum
            kamu menuliskannya — termasuk hal-hal yang tidak bisa kami janjikan.
          </p>
        </div>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Yang kami simpan</h2>
          <Daftar items={YANG_DISIMPAN} tipe="ya" />
        </section>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Yang TIDAK kami simpan</h2>
          <Daftar items={YANG_TIDAK_DISIMPAN} tipe="tidak" />
        </section>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Siapa yang bisa membaca ceritamu</h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-gray-700">
            <li>
              <strong className="text-gray-900">Guru BK di sekolahmu.</strong> Mereka
              membaca isi laporannya — itu memang gunanya. Yang mereka lihat cuma
              ceritanya, bukan siapa kamu.
            </li>
            <li>
              <strong className="text-gray-900">Guru BK sekolah lain: tidak bisa.</strong>{' '}
              Ini dipaksa di tingkat database, bukan cuma diatur di aplikasi.
            </li>
            <li>
              <strong className="text-gray-900">AI membacanya sekali,</strong> saat
              laporan masuk, untuk menebak seberapa mendesak dan jenisnya apa —
              supaya yang paling berat naik ke atas antrean Guru BK. AI tidak
              ikut dalam percakapanmu dengan Guru BK.
            </li>
            <li>
              <strong className="text-gray-900">Setiap kali Guru BK membuka laporanmu,
              itu tercatat</strong> — siapa, laporan mana, kapan. Catatan itu tidak
              bisa mereka hapus.
            </li>
          </ul>
        </section>

        {/* Bagian ini yang paling penting, dan yang paling sering dihilangkan
            orang. Klaim absolut ("100% anonim", "privasi total", "E2EE") terasa
            meyakinkan — tapi anak yang percaya lalu ketahuan mengalami persis
            kerugian yang sistem ini ada untuk mencegah. */}
        <section className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            Yang TIDAK bisa kami janjikan
          </h2>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-amber-900">
            <li>
              <strong>Kami tidak bisa menjamin ceritamu tidak menunjukkan siapa
              kamu.</strong> Sistem bisa menghilangkan namamu; sistem tidak bisa
              menghapus detail yang cuma cocok untuk satu orang di sekolahmu.
              Kalau kamu ingin tetap sulit dikenali, hindari detail seperti itu.
            </li>
            <li>
              <strong>Ini bukan &ldquo;enkripsi end-to-end&rdquo;.</strong> Laporanmu
              tersimpan terenkripsi di server, tapi server memegang kuncinya —
              karena AI dan Guru BK memang harus bisa membaca teksnya. Siapa pun
              yang bilang sistem seperti ini E2EE, keliru. Yang benar: enkripsi
              saat disimpan, akses dibatasi hanya Guru BK sekolahmu, dan setiap
              akses tercatat.
            </li>
            <li>
              <strong>Kode tiket yang hilang tidak bisa dipulihkan</strong> — bahkan
              oleh kami. Memulihkannya butuh mengetahui siapa kamu, dan itu justru
              yang sedang kami jaga.
            </li>
            <li>
              <strong>Guru BK bisa punya kewajiban melapor</strong> ke pihak lain
              kalau ada bahaya serius, sesuai aturan sekolah dan hukum yang
              berlaku. Kami tidak bisa menjanjikan cerita berhenti di mereka.
            </li>
          </ul>
        </section>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">Kalau kamu berubah pikiran</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Kamu bisa minta laporanmu ditutup lewat balasan di halaman{' '}
            <Link href="/cek-laporan" className="font-medium text-sahabat underline">
              Cek Laporan
            </Link>{' '}
            pakai kode tiketmu. Karena laporannya anonim, kami tidak punya cara
            memastikan itu benar kamu selain lewat kode itu — jadi jaga kodenya.
          </p>
        </section>

        <p className="mt-6 rounded-2xl bg-white p-4 text-center text-xs leading-relaxed text-gray-500">
          Halaman ini menjelaskan cara kerja sistem apa adanya, bukan dokumen
          hukum. Kalau kamu butuh bantuan segera, buka{' '}
          <Link href="/kontak-darurat" className="font-medium text-darurat underline">
            Kontak Darurat
          </Link>
          .
        </p>
      </div>
    </main>
  )
}
