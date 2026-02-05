"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Settings = {
  schoolName: string;
  adminPassword: string;
};

type Teacher = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

const settingsStorageKey = "settings";

export default function AdminPanelPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    schoolName: "Ornek Okul",
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
    void loadTeachers();

    try {
      const rawSettings = localStorage.getItem(settingsStorageKey);
      if (rawSettings) {
        const parsedSettings = JSON.parse(rawSettings) as Settings;
        if (parsedSettings?.schoolName && parsedSettings?.adminPassword) {
          setSettings(parsedSettings);
        }
      }
    } catch (error) {
      console.error("LOCAL_STORAGE_SETTINGS_READ_FAILED", error);
    }
  }, []);

  async function loadTeachers() {
    try {
      const response = await fetch("/api/teachers");
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        console.error("LOAD_TEACHERS_FAILED", { status: response.status, body });
        setStatus("Ogretmenler yuklenemedi.");
        setTeachers([]);
        return;
      }
      const data = await response.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD_TEACHERS_ERROR", error);
      setStatus("Ogretmenler yuklenemedi.");
      setTeachers([]);
    }
  }

  function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    try {
      localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
      setStatus("Ayarlar kaydedildi.");
    } catch (error) {
      console.error("SETTINGS_SAVE_FAILED", error);
      setStatus("Ayarlar kaydedilemedi.");
    }
  }

  function handleAddTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("ADD_TEACHER_HANDLER_TRIGGERED", newTeacher);
    setStatus("");

    const name = newTeacher.name.trim();
    const surname = newTeacher.surname.trim();
    const email = newTeacher.email.trim();

    if (!name || !surname || !email) {
      const error = new Error("Ad, soyad ve e-posta zorunludur.");
      console.error("ADD_TEACHER_VALIDATION_FAILED", error);
      setStatus(`Ogretmen eklenemedi: ${error.message}`);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, surname, email })
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          console.error("ADD_TEACHER_FAILED", { status: response.status, body });
          setStatus("Ogretmen eklenemedi.");
          return;
        }
        const createdTeacher = (await response.json()) as Teacher;
        setTeachers((prev) => [...prev, createdTeacher]);
        setNewTeacher({ name: "", surname: "", email: "" });
        setStatus("Ogretmen eklendi.");
      } catch (error) {
        console.error("ADD_TEACHER_ERROR", error);
        setStatus("Ogretmen eklenemedi.");
      }
    })();
  }

  function handleDeleteTeacher(id: string) {
    console.log("DELETE_TEACHER_HANDLER_TRIGGERED", { id });
    setStatus("");
    void (async () => {
      try {
        const response = await fetch(`/api/teachers?id=${encodeURIComponent(id)}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          console.error("DELETE_TEACHER_FAILED", { status: response.status, body });
          setStatus("Ogretmen silinemedi.");
          return;
        }
        setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
        setStatus("Ogretmen silindi.");
      } catch (error) {
        console.error("DELETE_TEACHER_ERROR", error);
        setStatus("Ogretmen silinemedi.");
      }
    })();
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
          Cikis Yap
        </button>
      </div>

      <div className="card">
        <h1>Admin Paneli</h1>
        <p className="small">Okul bilgilerini ve ogretmenleri buradan yonetebilirsiniz.</p>
        <form onSubmit={handleSaveSettings}>
          <div className="field">
            <label>Okul Adi</label>
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
            <label>Admin Sifre</label>
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
            Ayarlari Kaydet
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Ogretmen Ekle</h2>
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
            Ogretmen Ekle
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Ogretmen Listesi</h2>
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
          {teachers.length === 0 ? <p className="small">Henuz ogretmen yok.</p> : null}
        </div>
        {status ? <p className="small">{status}</p> : null}
      </div>
    </div>
  );
}
