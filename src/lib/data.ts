import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

const dataDir = path.join(process.cwd(), "data");
const settingsPath = path.join(dataDir, "settings.json");
const teachersPath = path.join(dataDir, "teachers.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf-8");
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readSettings(): Promise<Settings> {
  return readJsonFile<Settings>(settingsPath, {
    schoolName: "Ornek Okul",
    adminPassword: "0000"
  });
}

export async function writeSettings(settings: Settings): Promise<void> {
  await writeJsonFile(settingsPath, settings);
}

export async function readTeachers(): Promise<Teacher[]> {
  const teachers = await readJsonFile<Teacher[]>(teachersPath, []);
  let changed = false;
  const normalized = teachers.map((teacher) => {
    if (!teacher.id) {
      changed = true;
      return { ...teacher, id: randomUUID() };
    }
    return teacher;
  });

  if (changed) {
    await writeJsonFile(teachersPath, normalized);
  }

  return normalized;
}

export async function writeTeachers(teachers: Teacher[]): Promise<void> {
  await writeJsonFile(teachersPath, teachers);
}

export type { Settings, Teacher };
