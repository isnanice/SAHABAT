import { redirect } from 'next/navigation'

// /kepala-sekolah/analitik SUDAH menjadi dashboard utama Kepala Sekolah
// (lihat tujuan login di app/(auth)/login/page.js). Rute ini tidak ditautkan
// dari mana pun di sidebar — redirect ke home yang sungguhan alih-alih
// menduplikasi halaman "dashboard" kedua yang membingungkan.
export default function Page() {
  redirect('/kepala-sekolah/analitik')
}
