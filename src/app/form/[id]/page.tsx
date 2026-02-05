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

export default function FormPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`/api/teachers?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTeacher(data);
        setTeacherName(`${data.name} ${data.surname}`);
        setTeacherEmail(data.email);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        teacherName,
        teacherEmail,
        studentName,
        comment,
        to_email: teacherEmail
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    alert("Mesaj gönderildi");
  };

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/">
          Ana Sayfa
        </Link>
      </div>

      <div className="card">
        <h1>Mesaj Formu</h1>

        {teacher ? (
          <p className="small">
            {teacherName} öğretmenine mesaj gönderiyorsunuz.
          </p>
        ) : (
          <p className="small">Öğretmen yükleniyor...</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Öğrenci adı"
            required
          />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Mesaj"
            required
          />

          <button type="submit">Mesaj Gönder</button>
        </form>
      </div>
    </div>
  );
}