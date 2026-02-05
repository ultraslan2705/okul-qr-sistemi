"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabase";

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

  // 👇 TEK VE NET KAYNAK
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  useEffect(() => {
    void supabase
      .from("teachers")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setTeacher(null);
          return;
        }
        setTeacher(data as Teacher);
      });
  }, [id]);

  const qrValue = useMemo(() => {
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
        ) : (
          <p className="small">Öğretmen yükleniyor...</p>
        )}

        <QRCodeCanvas value={qrValue} size={220} />

        <p className="small" style={{ marginTop: 12 }}>
          QR kodunu okutunca mesaj formu açılır.
        </p>
      </div>
    </div>
  );
}