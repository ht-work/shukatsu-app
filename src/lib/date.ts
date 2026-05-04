import { format, formatDistanceToNowStrict, isAfter, isValid, parseISO } from "date-fns";
import { ja } from "date-fns/locale/ja";
import type { Application, Company, Task } from "@/types";

export function parseDate(value?: string) {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function formatDateTime(value?: string) {
  const date = parseDate(value);
  if (!date) return "未設定";
  return format(date, "yyyy/MM/dd HH:mm", { locale: ja });
}

export function formatDate(value?: string) {
  const date = parseDate(value);
  if (!date) return "未設定";
  return format(date, "yyyy/MM/dd", { locale: ja });
}

export function formatRelativeDue(value?: string) {
  const date = parseDate(value);
  if (!date) return "日時未設定";

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: ja,
  });
}

export function toDateTimeLocalValue(value?: string) {
  const date = parseDate(value);
  if (!date) return "";
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function fromDateTimeLocalValue(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return isValid(date) ? date.toISOString() : undefined;
}

export function isFutureTask(task: Task) {
  const date = parseDate(task.dueAt);
  return Boolean(date && isAfter(date, new Date()));
}

export function getNextTask(tasks: Task[]) {
  return tasks
    .filter((task) => !task.done && isFutureTask(task))
    .sort((a, b) => {
      const aTime = parseDate(a.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = parseDate(b.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })[0];
}

export function getCompanyNextTask(
  company: Company,
  applications: Application[],
  tasks: Task[],
) {
  const appIds = new Set(
    applications
      .filter((application) => application.companyId === company.id)
      .map((application) => application.id),
  );

  return getNextTask(tasks.filter((task) => appIds.has(task.applicationId)));
}
