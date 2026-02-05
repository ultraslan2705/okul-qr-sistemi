"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const settings = await getSettings();
      const adminPassword = settings.adminPassword ?? "0000";

      if (password === adminPassword) {
        sessionStorage.setItem("adminAuthed", "true");
        router.push("/admin/panel");
        return;
      }

      setError("Sifre hatali. Lutfen tekrar deneyin.");
    } catch (error) {
      console.error("ADMIN_LOGIN_SETTINGS_READ_FAILED", error);
      setError("Sifre kontrol edilemedi.");
    }
  }

  return (
    <div className="card">
      <div className="nav">
        <Link className="button secondary" href="/">
          Ana Sayfa
        </Link>
      </div>
      <h1>Admin Girisi</h1>
      <p className="small">Varsayilan sifre: 0000</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Admin Sifre</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="small" style={{ color: "#d92d20" }}>{error}</p> : null}
        <button className="button" type="submit">
          Giris Yap
        </button>
      </form>
    </div>
  );
}
