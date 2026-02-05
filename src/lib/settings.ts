import { supabase } from "./supabase";

type Settings = {
  id?: number;
  schoolName: string;
  adminPassword: string;
};

const defaultSettings: Settings = {
  schoolName: "Örnek Okul",
  adminPassword: "0000"
};

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(error);
    }
    return defaultSettings;
  }

  return {
    id: data.id,
    schoolName: data.schoolName ?? defaultSettings.schoolName,
    adminPassword: data.adminPassword ?? defaultSettings.adminPassword
  };
}

export async function saveSettings(settings: Settings) {
  const payload = {
    id: settings.id ?? 1,
    schoolName: settings.schoolName,
    adminPassword: settings.adminPassword
  };

  const { error } = await supabase.from("settings").upsert(payload);
  if (error) {
    console.error(error);
    return { ok: false };
  }

  return { ok: true };
}
