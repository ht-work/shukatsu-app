export type ApplicationKind = "internship" | "fulltime";

export type ApplicationSource =
  | "rikunabi"
  | "mynavi"
  | "onecareer"
  | "wantedly"
  | "offerbox"
  | "direct"
  | "referral"
  | "career_center"
  | "agent"
  | "other";

export type ApplicationStatus =
  | "interested"
  | "entry_done"
  | "es_submitted"
  | "web_test"
  | "coding_test"
  | "group_discussion"
  | "interview_1"
  | "interview_2"
  | "interview_final"
  | "offered"
  | "rejected"
  | "intern_accepted"
  | "declined";

export type TaskKind =
  | "es_deadline"
  | "web_test"
  | "coding_test"
  | "group_discussion"
  | "interview"
  | "other";

export interface Company {
  id: string;
  name: string;
  url?: string;
  industry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  companyId: string;
  kind: ApplicationKind;
  status: ApplicationStatus;
  source?: ApplicationSource;
  sourceNote?: string;
  myPageUrl?: string;
  appliedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  applicationId: string;
  kind: TaskKind;
  title: string;
  dueAt: string;
  done: boolean;
  notifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type StorageMeta = {
  schemaVersion: number;
};

export const APPLICATION_KIND_LABELS: Record<ApplicationKind, string> = {
  internship: "インターン",
  fulltime: "本選考",
};

export const APPLICATION_SOURCE_LABELS: Record<ApplicationSource, string> = {
  rikunabi: "リクナビ",
  mynavi: "マイナビ",
  onecareer: "ONE CAREER",
  wantedly: "Wantedly",
  offerbox: "OfferBox",
  direct: "企業サイト",
  referral: "紹介・リファラル",
  career_center: "大学キャリアセンター",
  agent: "就活エージェント",
  other: "その他",
};

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  es_deadline: "ES締切",
  web_test: "Webテスト",
  coding_test: "コーディングテスト",
  group_discussion: "グループディスカッション",
  interview: "面接",
  other: "その他",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: "興味あり",
  entry_done: "エントリー済み",
  es_submitted: "ES提出",
  web_test: "Webテスト",
  coding_test: "コーディングテスト",
  group_discussion: "グループディスカッション",
  interview_1: "一次面接",
  interview_2: "二次面接",
  interview_final: "最終面接",
  offered: "内定",
  rejected: "不採用",
  intern_accepted: "参加決定",
  declined: "辞退",
};

export const STATUS_OPTIONS_BY_KIND: Record<ApplicationKind, ApplicationStatus[]> =
  {
    internship: [
      "interested",
      "es_submitted",
      "web_test",
      "coding_test",
      "group_discussion",
      "interview_1",
      "interview_2",
      "interview_final",
      "intern_accepted",
      "rejected",
      "declined",
    ],
    fulltime: [
      "interested",
      "entry_done",
      "es_submitted",
      "web_test",
      "coding_test",
      "group_discussion",
      "interview_1",
      "interview_2",
      "interview_final",
      "offered",
      "rejected",
      "declined",
    ],
  };

export const ACTIVE_STATUSES: ApplicationStatus[] = [
  "interested",
  "entry_done",
  "es_submitted",
  "web_test",
  "coding_test",
  "group_discussion",
  "interview_1",
  "interview_2",
  "interview_final",
];

export const TERMINAL_STATUSES: ApplicationStatus[] = [
  "offered",
  "rejected",
  "intern_accepted",
  "declined",
];
