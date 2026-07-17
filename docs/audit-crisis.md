# Lembar Tinjauan Deteksi Krisis SAHABAT

**Untuk: Guru BK / psikolog sekolah**
**Waktu: sekitar 30 menit**
**Tidak perlu bisa membaca kode.**

---

## Kenapa Bapak/Ibu yang harus meninjau ini

SAHABAT punya satu lapisan yang berjalan sebelum apa pun: kalau siswa menulis
sesuatu yang mengindikasikan keinginan mengakhiri hidup, menyakiti diri, atau
kekerasan seksual, sistem **berhenti** jadi asisten. Ia langsung menampilkan
panel darurat, mengunci kolom chat, dan menaikkan laporannya jadi prioritas
kritis.

Lapisan itu bekerja dengan **mencocokkan kata dan frasa**. Daftar frasanya
disusun oleh AI dari tema-tema di literatur, **bukan** dari instrumen skrining
yang tervalidasi, dan **bukan** oleh orang yang pernah menangani siswa.

Artinya ada dua cara ia bisa gagal:

| Kegagalan | Akibatnya |
|---|---|
| **Kelewat** (false negative) | Anak menulis isyarat dengan kata yang tidak ada di daftar → sistem menjawab seperti obrolan biasa. **Ini yang paling berbahaya.** |
| **Salah picu** (false positive) | Anak menulis hal biasa → panel darurat menyala tanpa perlu. Canggung, dan kalau sering, semua orang belajar mengabaikannya. |

Yang tidak bisa AI ketahui: **bagaimana siswa di sekolah ini benar-benar bicara.**
Itu yang Bapak/Ibu punya dan kami tidak.

---

## Bagian 1 — Apa yang sekarang terdeteksi

Sistem akan menyalakan panel darurat kalau siswa menulis kalimat seperti ini.
Tanda ✓ berarti sudah terdeteksi hari ini.

### Indikasi mengakhiri hidup
- ✓ "aku pengen mati aja" / "pingin mati" / "mau mati aja"
- ✓ "bunuh diri" / "bundir"
- ✓ "mendingan mati" / "lebih baik mati"
- ✓ "aku mau ngakhirin hidup" / "mengakhiri hidup"
- ✓ "udah gak kuat hidup" / "gak mau hidup lagi" / "males hidup"
- ✓ "hidupku gak ada artinya"
- ✓ "gak ada alasan buat hidup"
- ✓ "pengen ilang aja" / "pengen hilang selamanya"
- ✓ "gantung diri" / "terjun dari" / "minum racun"
- ✓ "dunia lebih baik tanpa aku"

### Merasa terjebak / tidak ada jalan keluar
- ✓ "gaada jalan keluar lagi"
- ✓ "semuanya udah buntu"
- ✓ "gak bisa keluar dari ini"

### Keputusasaan
- ✓ "aku capek hidup"
- ✓ "gaada harapan lagi"
- ✓ "percuma hidup"
- ✓ "aku gaada masa depan"

### Memberikan barang berharga (isyarat perpisahan)
- ✓ "barang-barangku buat kamu aja"
- ✓ "aku kasih semua barangku"

### Menyakiti diri
- ✓ "nyilet tangan" / "nyayat" / "sayat tangan"
- ✓ "nyakitin diri sendiri" / "melukai diri"
- ✓ "self-harm"
- ✓ "overdosis obat" / "minum obat banyak"
- ✓ "bakar tangan" / "nyundut tangan"

### Kekerasan seksual
- ✓ "diperkosa" / "perkosa"
- ✓ "dilecehkan" / "pelecehan seksual"
- ✓ "disodomi"
- ✓ "diraba dada/pantat/kemaluan"
- ✓ "dipaksa berhubungan" / "dipaksa bugil"
- ✓ "diancam sebar foto"

### Bahaya fisik langsung — **kategori tambahan, mohon dinilai**
- ✓ "aku hampir dibunuh"
- ✓ "diancam mau dibunuh"
- ✓ "dikeroyok"
- ✓ "ditodong"
- ✓ "dibacok" / "ditusuk"
- ✓ "bawa pisau" + kata ancaman di dekatnya
- ✓ "dipukuli rame-rame"

> **Kenapa kategori ini ditambahkan.** Saat uji coba, seorang penguji menulis
> *"aku hampir dibunuh, di kantin, baru saja, sudah 3 kali"*. Sistem menandainya
> KRITIS dan menaikkannya ke puncak antrean Guru BK — **tapi panel darurat tidak
> muncul**, karena spec asli hanya mendefinisikan krisis sebagai bunuh diri /
> menyakiti diri / kekerasan seksual. Anak yang baru saja hampir dibunuh sedang
> dalam bahaya *sekarang*, jadi kategori ini ditambahkan.
>
> **Ini di luar spec awal — Bapak/Ibu berhak menolaknya.** Kalau menurut Bapak/Ibu
> ancaman fisik lebih tepat ditangani lewat jalur laporan biasa (bukan panel
> darurat), beri tahu dan kami cabut.
>
> Yang SENGAJA tidak dimasukkan, supaya alarm tidak terlalu sering berbunyi:
> - "aku dipukul di kantin" → perundungan fisik biasa, ditangani jalur laporan
> - "gue dibunuh nyokap kalau telat" → idiom, bukan bahaya (sudah diuji, tidak memicu)

Sistem juga sudah menangani variasi ketikan: **HURUF BESAR**, huruf berulang
("matiiii"), dan angka pengganti huruf ("peng3n mati").

---

## Bagian 2 — Pertanyaan untuk Bapak/Ibu

> **Ini bagian terpenting dari tinjauan ini.** Silakan tulis jawabannya
> langsung di bawah setiap pertanyaan, atau di kertas terpisah.

### 1. Apa yang kelewat?

Dari pengalaman Bapak/Ibu menangani siswa di sekolah ini — **kalimat atau
istilah apa yang pernah Bapak/Ibu dengar dari siswa yang sedang tidak
baik-baik saja, tapi tidak ada di daftar Bagian 1?**

Termasuk:
- Bahasa gaul sekolah ini yang tidak dipakai di tempat lain
- Bahasa daerah / campuran (Jawa, Sunda, dll.)
- Cara halus/tidak langsung yang biasa dipakai siswa di sini
- Istilah yang sedang tren di kalangan siswa saat ini

```
Tulis di sini:



```

### 2. Mana yang menurut Bapak/Ibu akan salah picu?

Adakah frasa di Bagian 1 yang menurut Bapak/Ibu **sering dipakai siswa dalam
arti biasa** di sekolah ini, sehingga panel darurat akan menyala tanpa perlu?

```
Tulis di sini:



```

### 3. Sudah tahu satu yang bermasalah

Kalimat **"tolong simpen barangku sebentar ya"** saat ini **memicu** panel
darurat, karena mirip isyarat memberikan barang berharga. Padahal siswa bisa
saja cuma menitip tas.

Menurut Bapak/Ibu:
- [ ] Biarkan memicu — lebih baik salah picu daripada kelewat
- [ ] Hapus — terlalu sering dipakai dalam arti biasa di sini
- [ ] Ubah jadi lebih spesifik, misalnya: `________________________`

### 4. Isi panel daruratnya sudah tepat?

Saat terdeteksi, siswa melihat pesan ini:

> **Kamu tidak sendirian, dan ini tidak bisa ditangani sendirian**
>
> Aku berhenti di sini karena kamu berhak dapat bantuan dari **manusia**,
> bukan dari bot. Bercerita tadi bukan hal yang memalukan — itu justru
> langkah yang berani.
>
> **Kalau kamu sedang dalam bahaya sekarang:**
> Temui **Guru BK**, orang tua, atau orang dewasa yang kamu percaya
> **secepatnya**. Kalau ada orang dewasa di dekatmu saat ini, tunjukkan layar
> ini ke mereka.

Apakah kata-katanya tepat untuk siswa di sekolah ini?

- [ ] Sudah tepat
- [ ] Perlu diubah: `________________________________________________`

### 5. Nomor hotline

Panel darurat menampilkan:
- **119 ext. 8** — SEJIWA, Konseling Sehat Jiwa (Kemenkes)
- **129** — SAPA, Kementerian PPPA

**Keduanya belum pernah kami telepon.** Saat ini sistem jujur menuliskan
"nomor ini belum diverifikasi" ke siswa.

- [ ] Sudah saya telepon, tersambung ke manusia — tanggal: `__________`
- [ ] Sudah saya telepon, **tidak** tersambung → **hapus dari sistem**
- [ ] Ganti dengan nomor lain yang lebih tepat: `________________________`
- [ ] Tambahkan nomor Guru BK sekolah / hotline daerah: `________________`

---

## Bagian 3 — Batas yang harus Bapak/Ibu tahu

Supaya tidak ada yang salah paham tentang apa yang sistem ini bisa:

**Sistem hanya membaca yang siswa TULIS.** Isyarat yang paling sering muncul
justru yang tidak tertulis: menarik diri dari teman, perubahan pola tidur,
nilai turun, membagikan barang secara diam-diam, tiba-tiba tenang setelah
lama murung. **Tidak satu pun bisa dilihat sistem ini.** Hanya Bapak/Ibu yang
bisa.

**Sistem tidak bisa menilai konteks.** Ia tidak tahu siswa mana yang sedang
bercanda dan mana yang tidak. Ia mencocokkan kata.

**Sistem ini bukan pengganti kehadiran Bapak/Ibu.** Ia hanya memastikan yang
sudah terang-terangan tertulis tidak terlewat, dan naik ke atas antrean.

**Anak yang paling berisiko sering menulis paling sedikit.** Karena itu sistem
sekarang menerima laporan sesingkat apa pun kalau terdeteksi krisis — bahkan
dua kata.

---

## Setelah selesai

Serahkan lembar ini ke tim teknis. Jawaban Bagian 2 akan langsung dimasukkan
ke sistem.

**Tinjauan ini perlu diulang** setiap kali bahasa gaul siswa berubah — kira-kira
tiap tahun ajaran baru.

---

### Sumber tema

Suherman, Keliat, B.A., Daulima, N.H.C., & Besral (2022). *Identifikasi Isyarat
Bunuh Diri Verbal dan Non Verbal dalam Upaya Deteksi Risiko Bunuh Diri pada
Remaja: Literatur Review.* Jurnal Endurance 7(3), 588–598. Fakultas Keperawatan,
Universitas Indonesia. DOI: 10.22216/jen.v7i3.1689

Paper ini dipakai sebagai dasar **tema** (keputusasaan, ketidakberdayaan,
merasa terjebak, tidak ada jalan keluar, tidak ada alasan hidup, memberikan
barang berharga). Paper ini **tidak** menyediakan daftar frasa bahasa Indonesia
yang tervalidasi — frasa di Bagian 1 disusun oleh AI dari tema tersebut, dan
itulah sebabnya tinjauan Bapak/Ibu diperlukan.

Catatan: penelusuran literatur menemukan bahwa **belum ada leksikon deteksi
krisis berbahasa Indonesia yang tervalidasi dan tersedia publik**. Jadi tidak
ada daftar "resmi" yang bisa kami pakai sebagai pengganti tinjauan ini.
