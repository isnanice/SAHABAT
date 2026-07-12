"use client";

import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.bgOverlay} />
        <div className={styles.leftContent}>
          <h1 className={styles.title}>
            {isRegister 
              ? "Selamat Datang di Sahabat Amanmu!!" 
              : "Selamat Datang Kembali di Sahabat Amanmu!!"}
          </h1>
          <p className={styles.description}>
            Platform dukungan siswa SAHABAT hadir untuk mendengarkan, mendampingi, dan menjaga kerahasiaanmu.
          </p>
        </div>
      </div>
      <div className={styles.rightPanel}>
        {children}
      </div>
    </div>
  );
}
