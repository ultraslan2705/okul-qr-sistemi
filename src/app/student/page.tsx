import Link from "next/link";
import { getTeachers } from "@/lib/teachers";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const [settings, teachers] = await Promise.all([getSettings(), getTeachers()]);
  const schoolTitle = settings.schoolName
    .normalize("NFC")
    .toLocaleUpperCase("tr-TR");

  return (
    <div className="grid">
      <div className="nav">
        <Link className="button secondary" href="/">
          Ana Sayfa
        </Link>
      </div>
      <div className="card">
        <h1 className="school-title">{schoolTitle}</h1>
        <p className="small">Mesaj göndermek istediğiniz öğretmeni seçin.</p>
        <div className="list">
          {teachers.map((teacher) => (
            <Link key={teacher.id} href={`/qr/${teacher.id}`} className="teacher-item">
              <div>
                <strong>
                  {teacher.name} {teacher.surname}
                </strong>
                <div className="small">{teacher.email}</div>
              </div>
              <span className="badge">QR Oluştur</span>
            </Link>
          ))}
          {teachers.length === 0 ? <p className="small">Henüz öğretmen yok.</p> : null}
        </div>
      </div>
    </div>
  );
}
