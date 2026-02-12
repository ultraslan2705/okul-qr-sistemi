import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type MessagePayload = {
  teacherId?: string;
  studentName?: string;
  studentClass?: string;
  studentPhone?: string;
  message?: string;
};

const classPattern = /^(?:[1-9]|1[0-2])(?:[\s-])?[A-Za-zÇĞİÖŞÜçğıöşü]$/;
const phonePattern = /^05\d{9}$/;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as MessagePayload | null;

  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const teacherId = payload.teacherId?.trim();
  const studentName = payload.studentName?.trim()?.toLocaleUpperCase("tr-TR");
  const studentClass = payload.studentClass?.trim()?.toLocaleUpperCase("tr-TR") ?? "";
  const studentPhoneRaw = payload.studentPhone?.trim() ?? "";
  const message = payload.message?.trim();

  if (!teacherId || !studentName || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (studentClass && !classPattern.test(studentClass)) {
    return NextResponse.json({ error: "Sınıf formatı hatalı. Örn: 10-A" }, { status: 400 });
  }

  const studentPhone = studentPhoneRaw.replace(/\D/g, "");
  if (studentPhone && !phonePattern.test(studentPhone)) {
    return NextResponse.json(
      { error: "Telefon 05 ile başlamalı ve 11 haneli olmalı." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const { data: teacher, error } = await supabase
    .from("teachers")
    .select("id,name,surname,email")
    .eq("id", teacherId)
    .single();

  if (error || !teacher) {
    return NextResponse.json(
      { error: "Teacher not found", details: error?.message },
      { status: 404 }
    );
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "0");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !port || !user || !pass || !from) {
    return NextResponse.json({ error: "SMTP settings missing" }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const subject = `Mesaj - ${teacher.name} ${teacher.surname}`;
  const text = [
    `Öğretmen: ${teacher.name} ${teacher.surname}`,
    `Öğretmen e-posta: ${teacher.email}`,
    "",
    `Öğrenci ad soyad: ${studentName}`,
    `Sınıf: ${studentClass || "-"}`,
    `Telefon: ${studentPhone || "-"}`,
    "",
    "Mesaj:",
    message
  ].join("\n");

  try {
    await transporter.sendMail({
      from,
      to: teacher.email,
      subject,
      text
    });
  } catch (sendError) {
    console.error("SMTP_SEND_ERROR", sendError);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
