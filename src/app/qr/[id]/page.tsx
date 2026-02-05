"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type Teacher = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export default function QrPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const isValidEnvUrl =
      envUrl &&
      envUrl.length > 0 &&
      envUrl.toLowerCase() !== "undefined" &&
      envUrl.toLowerCase() !== "null" &&
      envUrl.startsWith("http");

    if (isValidEnvUrl) {
      setBaseUrl(envUrl.replace(/\/+$/, ""));
      return;
    }

    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }
    setError(null);
    void fetch(`/api/teachers/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message =
            body?.error || body?.details || body?.hint || "Ogretmen bilgisi alinamadi.";
          throw new Error(message);
        }
        return response.json();
      })
      .then((payload) => {
        setTeacher((payload?.teacher ?? null) as Teacher | null);
      })
      .catch((err) => {
        console.error(err);
        setTeacher(null);
        setError(err instanceof Error ? err.message : String(err));
      });
  }, [id]);

  const qrValue = useMemo(() => {
    if (!baseUrl) {
      return "";
    }
    return `${baseUrl}/form/${id}`;
  }, [baseUrl, id]);

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/student">
          Geri Dön
        </Link>
      </div>

      <div className="card">
        <h1>QR Kodu</h1>

        {teacher ? (
          <p className="small">
            {teacher.name} {teacher.surname} için QR kodu oluşturuldu.
          </p>
        ) : error ? (
          <p className="small">Ogretmen getirilemedi: {error}</p>
        ) : (
          <p className="small">Öğretmen yükleniyor...</p>
        )}

        {qrValue ? <QRCodeCanvas value={qrValue} size={220} /> : null}
        {!qrValue ? <p className="small">QR kodu olusturulamadi.</p> : null}

        <p className="small" style={{ marginTop: 12 }}>
          QR kodunu okutunca mesaj formu açılır.
        </p>
      </div>
    </div>
  );
}
