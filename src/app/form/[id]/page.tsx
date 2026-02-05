"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Teacher = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

type FormState = {
  studentName: string;
  studentClass: string;
  studentPhone: string;
  message: string;
};

const initialForm: FormState = {
  studentName: "",
  studentClass: "",
  studentPhone: "",
  message: ""
};

export default function FormPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

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
            body?.error || body?.details || body?.hint || "Öğretmen bilgisi alınamadı.";
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!teacher) {
      setStatus("Öğretmen bilgisi yüklenemedi.");
      return;
    }
    if (!form.studentName.trim() || !form.message.trim()) {
      setStatus("Ad soyad ve mesaj zorunludur.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          studentName: form.studentName.trim(),
          studentClass: form.studentClass.trim(),
          studentPhone: form.studentPhone.trim(),
          message: form.message.trim()
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          body?.error || body?.details || body?.hint || "Mesaj gönderilemedi.";
        throw new Error(message);
      }

      setForm(initialForm);
      setStatus("Mesaj gönderildi.");
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error ? err.message : "Mesaj gönderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/student">
          Geri Dön
        </Link>
      </div>

      <div className="card">
        <h1>Mesaj Formu</h1>
        {teacher ? (
          <p className="small">
            {teacher.name} {teacher.surname} ({teacher.email}) için mesaj gönderin.
          </p>
        ) : error ? (
          <p className="small">Öğretmen getirilemedi: {error}</p>
        ) : (
          <p className="small">Öğretmen yükleniyor...</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Ad Soyad</label>
            <input
              className="input"
              value={form.studentName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentName: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label>Sınıf</label>
            <input
              className="input"
              value={form.studentClass}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentClass: event.target.value }))
              }
              placeholder="Örn: 10-A"
            />
          </div>
          <div className="field">
            <label>Telefon (isteğe bağlı)</label>
            <input
              className="input"
              value={form.studentPhone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentPhone: event.target.value }))
              }
              placeholder="05xx xxx xx xx"
            />
          </div>
          <div className="field">
            <label>Mesaj</label>
            <textarea
              className="input"
              rows={5}
              value={form.message}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, message: event.target.value }))
              }
              required
            />
          </div>
          <button className="button" type="submit" disabled={sending}>
            {sending ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>

        {status ? <p className="small">{status}</p> : null}
      </div>
    </div>
  );
}
