"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSettings, saveSettings } from "@/lib/settings";

type Settings = {
  id?: number;
  schoolName: string;
  adminPassword: string;
};

type Teacher = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

export default function AdminPanelPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    schoolName: "Örnek Okul",
    adminPassword: "0000"
  });
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({ name: "", surname: "", email: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const authed = sessionStorage.getItem("adminAuthed") === "true";
    if (!authed) {
      router.replace("/admin/login");
      return;
    }
    void loadInitialData();
  }, [router]);

  async function loadInitialData() {
    try {
      const [settingsData, teachersData] = await Promise.all([
        getSettings(),
        supabase.from("teachers").select("*").order("created_at", { ascending: false })
      ]);

      setSettings(settingsData);

      if (teachersData.error) {
        console.error(teachersData.error);
        setTeachers([]);
        return;
      }
      setTeachers((teachersData.data ?? []) as Teacher[]);
    } catch (error) {
      console.error(error);
      setTeachers([]);
    }
  }

  async function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");

    const result = await saveSettings(settings);
    if (result.ok) {
      setStatus("Ayarlar kaydedildi.");
    } else {
      setStatus("Ayarlar kaydedilemedi.");
    }
  }

  async function handleAddTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("ADD_TEACHER_HANDLER_TRIGGERED", newTeacher);
    setStatus("");

    const name = newTeacher.name.trim();
    const surname = newTeacher.surname.trim();
    const email = newTeacher.email.trim();

    if (!name || !surname || !email) {
      const error = new Error("Ad, soyad ve e-posta zorunludur.");
      console.error("ADD_TEACHER_VALIDATION_FAILED", error);
      setStatus(`Öğretmen eklenemedi: ${error.message}`);
      return;
    }

    const { data, error } = await supabase
      .from("teachers")
      .insert({ name, surname, email })
      .select("*")
      .single();

    if (error) {
      console.error(error);
      setStatus("Öğretmen eklenemedi.");
      return;
    }

    setTeachers((prev) => [data as Teacher, ...prev]);
    setNewTeacher({ name: "", surname: "", email: "" });
    setStatus("Öğretmen eklendi.");
  }

  async function handleDeleteTeacher(id: string) {
    console.log("DELETE_TEACHER_HANDLER_TRIGGERED", { id });
    setStatus("");

    try {
      const response = await fetch(`/api/teachers?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        console.error("DELETE_TEACHER_FAILED", { status: response.status, body });
        const serverMessage =
          body?.error || body?.details || body?.hint || "Öğretmen silinemedi.";
        setStatus(`Öğretmen silinemedi: ${serverMessage}`);
        return;
      }
      setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
      setStatus("Öğretmen silindi.");
    } catch (error) {
      console.error("DELETE_TEACHER_ERROR", error);
      setStatus(
        `Öğretmen silinemedi: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/">
          Ana Sayfa
        </Link>
        <button
          className="button secondary"
          onClick={() => {
            sessionStorage.removeItem("adminAuthed");
            router.push("/admin/login");
          }}
        >
          Çıkış Yap
        </button>
      </div>

      <div className="card">
        <h1>Admin Paneli</h1>
        <p className="small">
          Okul bilgilerini ve öğretmenleri buradan yönetebilirsiniz.
        </p>
        <form onSubmit={handleSaveSettings}>
          <div className="field">
            <label>Okul Adı</label>
            <input
              className="input"
              value={settings.schoolName}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, schoolName: event.target.value }))
              }
              required
            />
          </div>
          <div className="field">
            <label>Admin Şifresi</label>
            <input
              className="input"
              type="password"
              value={settings.adminPassword}
              onChange={(event) =>
                setSettings((prev) => ({ ...prev, adminPassword: event.target.value }))
              }
              required
            />
          </div>
          <button className="button" type="submit">
            Ayarları Kaydet
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Öğretmen Ekle</h2>
        <form onSubmit={handleAddTeacher}>
          <div className="grid two">
            <div className="field">
              <label>Ad</label>
              <input
                className="input"
                value={newTeacher.name}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="field">
              <label>Soyad</label>
              <input
                className="input"
                value={newTeacher.surname}
                onChange={(event) =>
                  setNewTeacher((prev) => ({ ...prev, surname: event.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="field">
            <label>E-posta</label>
            <input
              className="input"
              type="email"
              value={newTeacher.email}
              onChange={(event) =>
                setNewTeacher((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </div>
          <button className="button" type="submit">
            Öğretmen Ekle
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Öğretmen Listesi</h2>
        <div className="list">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-item">
              <div>
                <strong>
                  {teacher.name} {teacher.surname}
                </strong>
                <div className="small">{teacher.email}</div>
              </div>
              <button
                className="button danger"
                type="button"
                onClick={() => handleDeleteTeacher(teacher.id)}
              >
                Sil
              </button>
            </div>
          ))}
          {teachers.length === 0 ? <p className="small">Henüz öğretmen yok.</p> : null}
        </div>
        {status ? <p className="small">{status}</p> : null}
      </div>
    </div>
  );
}
