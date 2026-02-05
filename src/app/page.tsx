import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <div className="hero">
      <div className="hero-content">
        <span className="badge">Okul QR Sistemi</span>
        <h1 className="school-title">
          {settings.schoolName.toLocaleUpperCase("tr-TR")}
        </h1>
        <p className="small hero-lead">
          İstediğiniz rehber öğretmeni seçin, QR kodu okutup mesajınızı iletin.
        </p>
      </div>

      <div className="hero-steps">
        <h2 className="steps-title">Programın Kullanımı</h2>
        <div className="steps-grid">
          <div className="step-card">
            <strong>1. Öğretmen Seç</strong>
            <p className="small">Listeden öğretmeni seçin.</p>
          </div>
          <div className="step-card">
            <strong>2. QR Okut</strong>
            <p className="small">QR kodu telefonla okutun.</p>
          </div>
          <div className="step-card">
            <strong>3. Mesaj Gönder</strong>
            <p className="small">Formu doldurup iletin.</p>
          </div>
        </div>
      </div>

      <div className="card hero-panel">
        <h2>Giriş</h2>
        <p className="small">
          Öğrenciler için hızlı giriş, yöneticiler için ayar paneli.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/student">
            Öğrenci Girişi
          </Link>
          <Link className="admin-link" href="/admin/login">
            Yönetici Girişi
          </Link>
        </div>
      </div>
    </div>
  );
}
