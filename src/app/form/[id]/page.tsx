"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import emailjs from "@emailjs/browser";

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

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";
  const emailReady = Boolean(serviceId && templateId && publicKey);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    if (!teacher) {
      setStatus("Ogretmen bilgisi yuklenemedi.");
      return;
    }
    if (!emailReady) {
      setStatus("E-posta ayarlari eksik. EmailJS bilgilerini kontrol edin.");
      return;
    }
    if (!form.studentName.trim() || !form.message.trim()) {
      setStatus("Ad soyad ve mesaj zorunludur.");
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          teacher_name: `${teacher.name} ${teacher.surname}`,
          teacher_email: teacher.email,
          to_email: teacher.email,
          student_name: form.studentName.trim(),
          student_class: form.studentClass.trim(),
          student_phone: form.studentPhone.trim(),
          message: form.message.trim()
        },
        publicKey
      );
      setForm(initialForm);
      setStatus("Mesaj gonderildi.");
    } catch (err) {
      console.error(err);
      setStatus("Mesaj gonderilemedi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/student">
          Geri Don
        </Link>
      </div>

      <div className="card">
        <h1>Mesaj Formu</h1>
        {teacher ? (
          <p className="small">
            {teacher.name} {teacher.surname} ({teacher.email}) icin mesaj gonderin.
          </p>
        ) : error ? (
          <p className="small">Ogretmen getirilemedi: {error}</p>
        ) : (
          <p className="small">Ogretmen yukleniyor...</p>
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
            <label>Sinif</label>
            <input
              className="input"
              value={form.studentClass}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, studentClass: event.target.value }))
              }
              placeholder="Orn: 10-A"
            />
          </div>
          <div className="field">
            <label>Telefon (istege bagli)</label>
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
          <button className="button" type="submit" disabled={sending || !emailReady}>
            {sending ? "Gonderiliyor..." : "Gonder"}
          </button>
        </form>

        {status ? <p className="small">{status}</p> : null}
        {!emailReady ? (
          <p className="small">
            EmailJS ayarlari eksik. Vercel ortam degiskenlerini kontrol edin.
          </p>
        ) : null}
      </div>
    </div>
  );
}
