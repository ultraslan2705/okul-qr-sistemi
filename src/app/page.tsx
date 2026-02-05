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
          Ogretmen secimi yapin, QR kodu okutun ve mesajinizi kolayca iletin.
        </p>
      </div>

      <div className="hero-steps">
        <h2 className="steps-title">Programin Kullanimi</h2>
        <div className="steps-grid">
          <div className="step-card">
            <strong>1. Ogretmen Sec</strong>
            <p className="small">Listeden ogretmeni secin.</p>
          </div>
          <div className="step-card">
            <strong>2. QR Okut</strong>
            <p className="small">QR kodu telefonla okutun.</p>
          </div>
          <div className="step-card">
            <strong>3. Mesaj Gonder</strong>
            <p className="small">Formu doldurup iletin.</p>
          </div>
        </div>
      </div>

      <div className="card hero-panel">
        <h2>Giris</h2>
        <p className="small">
          Ogrenciler icin hizli giris, yoneticiler icin ayar paneli.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/student">
            Student Login
          </Link>
          <Link className="admin-link" href="/admin/login">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
