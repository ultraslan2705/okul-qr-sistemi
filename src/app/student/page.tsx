import Link from "next/link";
import { getTeachers } from "@/lib/teachers";
import { getSettings } from "@/lib/settings";

export default async function StudentPage() {
  const [settings, teachers] = await Promise.all([getSettings(), getTeachers()]);

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/">
          Ana Sayfa
        </Link>
      </div>
      <div className="card">
        <h1>{settings.schoolName}</h1>
        <p className="small">Mesaj gondermek istediginiz ogretmeni secin.</p>
        <div className="list">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/qr/${teacher.id}`} className="teacher-item">
              <div>
                <strong>
                  {teacher.name} {teacher.surname}
                </strong>
                <div className="small">{teacher.email}</div>
              </div>
              <span className="badge">QR Olustur</span>
            </Link>
          ))}
          {teachers.length === 0 ? <p className="small">Henuz ogretmen yok.</p> : null}
        </div>
      </div>
    </div>
  );
}
