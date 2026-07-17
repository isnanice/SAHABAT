"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayoutClient({ children, profile, peran }) {
  const pathname = usePathname();
  const router = useRouter();
  const [keluar, setKeluar] = useState(false);

  const rolePath = peran === "Kepala Sekolah" ? "/kepala-sekolah" : "/guru-bk";

  const navItems = [
    { name: "Dashboard", href: peran === "Kepala Sekolah" ? "/kepala-sekolah/analitik" : "/guru-bk/dashboard", icon: "/ikon1.svg" },
    { name: "Report", href: peran === "Kepala Sekolah" ? "/kepala-sekolah/laporan" : "/guru-bk/inbox", icon: "/ikon2.svg" },
    { name: "Ruang Dukungan Sebaya", href: `${rolePath}/buddy`, icon: "/ikon3.svg" },
    { name: "Edukasi", href: `${rolePath}/edukasi`, icon: "/ikon4.svg" },
    { name: "Konseling", href: `${rolePath}/konseling`, icon: "/ikon5.svg" },
    { name: "Pengaturan", href: `${rolePath}/pengaturan`, icon: "/ikon6.svg" },
  ];

  async function handleLogout() {
    if (keluar) return;
    setKeluar(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#F8FAFC] border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-6">
          <Link href={rolePath} className="flex items-center gap-2">
            <Image src="/logo1.svg" alt="SAHABAT Logo" width={140} height={40} style={{ height: "auto" }} />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Check if active (we match exactly or if it's the inbox page which is the main report page)
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== rolePath);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#E6EEFF] text-[#3525CD] font-semibold"
                    : "text-gray-500 hover:bg-gray-100 font-medium"
                }`}
              >
                <div className={`flex items-center justify-center w-5 h-5 ${isActive ? "" : "opacity-60"}`}>
                  <Image src={item.icon} alt={item.name} width={20} height={20} />
                </div>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[76px] bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari ID laporan..."
                className="w-full pl-10 pr-4 py-2 border-none bg-[#F1F5F9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD]/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Image src="/h1.svg" alt="Notifications" width={24} height={24} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition">
              <Image src="/h2.svg" alt="Help" width={24} height={24} />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button className="flex items-center gap-2 text-left">
              <Image src="/h3.svg" alt="Profile" width={32} height={32} className="rounded-full" />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition" title="Keluar">
              <Image src="/h4.svg" alt="Sign Out" width={24} height={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
