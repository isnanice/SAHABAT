"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * Header publik — shared di semua halaman publik (beranda, tentang, fitur, edukasi).
 *
 * Kalau user sudah login: tampilkan h3.svg icon dengan dropdown sign out.
 * Kalau belum login: tampilkan tombol Masuk dan Daftar.
 */
export default function HeaderPublic({ navItems, styles }) {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowDropdown(false);
    window.location.reload();
  }

  return (
    <header className={styles.header}>
      <a href="#main-content" className={styles.skipLink}>
        Lewati ke konten utama
      </a>
      <Link href="/" aria-label="SAHABAT home" className={styles.logoLink}>
        <div className={styles.logoImageWrap}>
          <Image
            src="/logo.png"
            alt="Logo SAHABAT"
            width={140}
            height={50}
            className={styles.logoImg}
            priority
          />
        </div>
      </Link>

      <nav aria-label="Navigasi utama" className={styles.navContainer}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navLink} ${item.active ? styles.navLinkActive : styles.navLinkInactive}`}
          >
            {item.label}
            {item.active && <div className={styles.navIndicator} aria-hidden="true" />}
          </Link>
        ))}
      </nav>

      <div className={styles.authButtons}>
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <Image src="/h3.svg" alt="User Profile" width={40} height={40} />
            </button>
            {showDropdown && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: "8px",
                background: "white", borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)", padding: "8px",
                zIndex: 50, border: "1px solid #e5e7eb", minWidth: "150px"
              }}>
                <button
                  onClick={handleSignOut}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#dc2626", fontWeight: 600, padding: "10px 16px",
                    width: "100%", textAlign: "left", whiteSpace: "nowrap",
                    borderRadius: "8px", fontSize: "14px"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fef2f2"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/masuk" className={styles.loginBtn}>
              Masuk
            </Link>
            <Link href="/daftar" className={styles.signInBtn}>
              Daftar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
