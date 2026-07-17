/**
 * Data artikel edukasi bersama.
 * Digunakan oleh:
 *  - dashboard staf: src/app/(dashboard)/guru-bk/edukasi/page.js
 *  - halaman publik siswa: src/app/edukasi/page.js
 *
 * Ketika staf menyimpan/edit artikel via dashboard, perubahan tercermin
 * di halaman siswa karena keduanya membaca dari sumber yang sama.
 */

export const ARTIKEL_EDUKASI = [
  {
    id: 1,
    judul: "Mengenal Cyberbullying & Cara Menghadapinya",
    kategori: "Cyberbullying",
    sasaran: "Semua Siswa",
    imagePath: "/mengenalcyberbullying.png",
    tayangan: 3204,
    selesai: 85,
    isi: `<h2>Apa Itu Cyberbullying?</h2>
<p>Cyberbullying adalah tindakan perundungan yang dilakukan melalui perangkat digital seperti ponsel, komputer, dan tablet melalui media sosial, pesan teks, platform game, dan aplikasi lainnya.</p>
<h2>Bentuk-Bentuk Cyberbullying</h2>
<p>Cyberbullying dapat terjadi dalam banyak bentuk, antara lain:</p>
<ul>
  <li><strong>Flaming</strong> — Mengirim pesan marah atau kasar kepada seseorang secara online.</li>
  <li><strong>Harassment</strong> — Mengirim pesan yang menyinggung, kasar, atau mengancam secara berulang kali.</li>
  <li><strong>Denigration</strong> — Menyebarkan informasi palsu atau tidak benar tentang seseorang secara online.</li>
  <li><strong>Impersonation</strong> — Berpura-pura menjadi orang lain secara online.</li>
  <li><strong>Outing</strong> — Membagikan rahasia atau foto memalukan seseorang secara online tanpa izin.</li>
</ul>
<h2>Dampak Cyberbullying</h2>
<p>Cyberbullying dapat berdampak serius pada kesehatan mental korban, termasuk:</p>
<ul>
  <li>Kecemasan dan depresi</li>
  <li>Penurunan kepercayaan diri</li>
  <li>Masalah tidur</li>
  <li>Penurunan prestasi akademik</li>
</ul>
<h2>Cara Menghadapi Cyberbullying</h2>
<p>Jika kamu mengalami cyberbullying, ada beberapa langkah yang bisa kamu lakukan:</p>
<ol>
  <li><strong>Jangan membalas</strong> — Membalas pesan bully dapat memperburuk situasi.</li>
  <li><strong>Simpan buktinya</strong> — Ambil screenshot percakapan sebagai bukti.</li>
  <li><strong>Blokir pelaku</strong> — Gunakan fitur blokir di platform yang digunakan.</li>
  <li><strong>Ceritakan kepada orang dewasa</strong> — Orang tua, guru, atau konselor sekolah dapat membantumu.</li>
  <li><strong>Laporkan</strong> — Gunakan fitur laporan di platform, atau laporkan melalui sistem SAHABAT.</li>
</ol>`,
  },
  {
    id: 2,
    judul: "Pentingnya Kesehatan Mental bagi Remaja",
    kategori: "Kesehatan Mental",
    sasaran: "Kelas 10",
    imagePath: "/pentingnyakesehatanmental.png",
    tayangan: 1842,
    selesai: 62,
    isi: `<h2>Mengapa Kesehatan Mental Itu Penting?</h2>
<p>Kesehatan mental mencakup kesejahteraan emosional, psikologis, dan sosial kita. Kesehatan mental memengaruhi cara kita berpikir, merasa, dan bertindak. Ini juga membantu menentukan cara kita menangani stres, berhubungan dengan orang lain, dan membuat pilihan.</p>
<h2>Tanda-Tanda Kesehatan Mental yang Baik</h2>
<ul>
  <li>Merasa positif tentang diri sendiri</li>
  <li>Mampu berhubungan baik dengan orang lain</li>
  <li>Mampu mengelola perasaan dan emosi</li>
  <li>Mampu mengatasi perubahan dan ketidakpastian</li>
</ul>
<h2>Cara Menjaga Kesehatan Mental</h2>
<ol>
  <li><strong>Tidur yang cukup</strong> — Remaja membutuhkan 8-10 jam tidur per malam.</li>
  <li><strong>Olahraga teratur</strong> — Aktivitas fisik dapat meningkatkan suasana hati.</li>
  <li><strong>Makan sehat</strong> — Nutrisi yang baik mendukung kesehatan otak.</li>
  <li><strong>Batasi waktu layar</strong> — Terlalu banyak waktu di depan layar dapat memengaruhi suasana hati.</li>
  <li><strong>Bicaralah dengan seseorang</strong> — Jangan memendam perasaan sendiri.</li>
</ol>
<h2>Kapan Harus Mencari Bantuan?</h2>
<p>Jika kamu merasa sedih, cemas, atau tertekan secara berkelanjutan selama lebih dari dua minggu, pertimbangkan untuk berbicara dengan konselor sekolah atau tenaga profesional kesehatan mental.</p>`,
  },
  {
    id: 3,
    judul: "Cara Mendukung Teman yang Sedang Kesulitan",
    kategori: "Dukungan Sosial",
    sasaran: "Semua Siswa",
    imagePath: "/caramendukungteman.png",
    tayangan: 890,
    selesai: 45,
    isi: `<h2>Mengapa Dukungan Sosial Itu Penting?</h2>
<p>Memiliki teman yang suportif dapat membuat perbedaan besar dalam kehidupan seseorang. Dukungan sosial dapat membantu orang mengatasi stres, merasa lebih baik tentang diri mereka sendiri, dan merasa tidak sendirian.</p>
<h2>Cara Menjadi Pendengar yang Baik</h2>
<ul>
  <li><strong>Berikan perhatian penuh</strong> — Singkirkan ponselmu dan fokus pada temanmu.</li>
  <li><strong>Jangan menghakimi</strong> — Dengarkan tanpa memberikan penilaian atau kritik.</li>
  <li><strong>Validasi perasaannya</strong> — Akui bahwa perasaan mereka itu nyata dan valid.</li>
  <li><strong>Tanyakan apa yang mereka butuhkan</strong> — Apakah mereka ingin nasihat, atau hanya ingin didengar?</li>
</ul>
<h2>Hal yang Harus Dihindari</h2>
<ol>
  <li>Jangan meminimalkan perasaan mereka ("Ah, itu cuma hal kecil")</li>
  <li>Jangan langsung menawarkan solusi tanpa ditanya</li>
  <li>Jangan membandingkan masalah mereka dengan masalah orang lain</li>
  <li>Jangan menyebarkan cerita mereka ke orang lain tanpa izin</li>
</ol>
<h2>Apa yang Bisa Kamu Katakan?</h2>
<p>Beberapa kalimat yang bisa membantumu memulai percakapan:</p>
<ul>
  <li><em>"Aku di sini untukmu, apapun yang kamu butuhkan."</em></li>
  <li><em>"Kamu tidak harus melalui ini sendirian."</em></li>
  <li><em>"Aku mungkin tidak mengerti sepenuhnya, tapi aku ingin mencoba mengerti."</em></li>
</ul>`,
  },
];
