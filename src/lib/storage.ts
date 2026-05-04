import type { Application, Company, StorageMeta, Task } from "@/types";

export const STORAGE_KEYS = {
  companies: "shukatsu:companies",
  applications: "shukatsu:applications",
  tasks: "shukatsu:tasks",
  meta: "shukatsu:meta",
} as const;

const DEFAULT_META: StorageMeta = {
  schemaVersion: 1,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const value = safeParse<unknown>(window.localStorage.getItem(key), []);
  return Array.isArray(value) ? (value as T[]) : [];
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readCompanies() {
  return readArray<Company>(STORAGE_KEYS.companies);
}

export function writeCompanies(companies: Company[]) {
  writeJson(STORAGE_KEYS.companies, companies);
}

export function readApplications() {
  return readArray<Application>(STORAGE_KEYS.applications);
}

export function writeApplications(applications: Application[]) {
  writeJson(STORAGE_KEYS.applications, applications);
}

export function readTasks() {
  return readArray<Task>(STORAGE_KEYS.tasks);
}

export function writeTasks(tasks: Task[]) {
  writeJson(STORAGE_KEYS.tasks, tasks);
}

export function readMeta() {
  if (typeof window === "undefined") return DEFAULT_META;
  return safeParse<StorageMeta>(window.localStorage.getItem(STORAGE_KEYS.meta), DEFAULT_META);
}

export function ensureMeta() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(STORAGE_KEYS.meta)) {
    writeJson(STORAGE_KEYS.meta, DEFAULT_META);
  }
}
