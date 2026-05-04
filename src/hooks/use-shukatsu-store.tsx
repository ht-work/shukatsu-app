"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createId } from "@/lib/id";
import {
  ensureMeta,
  readApplications,
  readCompanies,
  readTasks,
  writeApplications,
  writeCompanies,
  writeTasks,
} from "@/lib/storage";
import {
  STATUS_OPTIONS_BY_KIND,
  type Application,
  type ApplicationKind,
  type Company,
  type Task,
} from "@/types";

export type CompanyInput = {
  name: string;
  url?: string;
  industry?: string;
  notes?: string;
};

export type ApplicationInput = {
  companyId: string;
  kind: ApplicationKind;
  status: Application["status"];
  source?: Application["source"];
  sourceNote?: string;
  myPageUrl?: string;
  appliedAt?: string;
  notes?: string;
};

export type TaskInput = {
  applicationId: string;
  kind: Task["kind"];
  title: string;
  dueAt: string;
};

type ShukatsuStore = {
  hydrated: boolean;
  companies: Company[];
  applications: Application[];
  tasks: Task[];
  addCompany: (input: CompanyInput) => Company;
  updateCompany: (id: string, input: CompanyInput) => void;
  deleteCompany: (id: string) => void;
  addApplication: (input: ApplicationInput) => Application;
  updateApplication: (id: string, input: Partial<ApplicationInput>) => void;
  deleteApplication: (id: string) => void;
  addTask: (input: TaskInput) => Task;
  updateTask: (id: string, input: Partial<Pick<Task, "kind" | "title" | "dueAt" | "done">>) => void;
  deleteTask: (id: string) => void;
  getCompany: (id: string) => Company | undefined;
  getApplication: (id: string) => Application | undefined;
  getCompanyApplications: (companyId: string) => Application[];
  getApplicationTasks: (applicationId: string) => Task[];
};

const ShukatsuContext = createContext<ShukatsuStore | null>(null);

export function ShukatsuProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    ensureMeta();
    setCompanies(readCompanies());
    setApplications(readApplications());
    setTasks(readTasks());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeCompanies(companies);
  }, [companies, hydrated]);

  useEffect(() => {
    if (hydrated) writeApplications(applications);
  }, [applications, hydrated]);

  useEffect(() => {
    if (hydrated) writeTasks(tasks);
  }, [tasks, hydrated]);

  const addCompany = useCallback((input: CompanyInput) => {
    const now = new Date().toISOString();
    const company: Company = {
      id: createId(),
      name: input.name,
      url: input.url,
      industry: input.industry,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    setCompanies((current) => [company, ...current]);
    return company;
  }, []);

  const updateCompany = useCallback((id: string, input: CompanyInput) => {
    setCompanies((current) =>
      current.map((company) =>
        company.id === id
          ? {
              ...company,
              ...input,
              updatedAt: new Date().toISOString(),
            }
          : company,
      ),
    );
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setCompanies((current) => current.filter((company) => company.id !== id));
    setApplications((current) => current.filter((application) => application.companyId !== id));
    setTasks((currentTasks) => {
      const removedApplicationIds = new Set(
        applications
          .filter((application) => application.companyId === id)
          .map((application) => application.id),
      );
      return currentTasks.filter((task) => !removedApplicationIds.has(task.applicationId));
    });
  }, [applications]);

  const addApplication = useCallback((input: ApplicationInput) => {
    const allowedStatuses = STATUS_OPTIONS_BY_KIND[input.kind];
    const now = new Date().toISOString();
    const application: Application = {
      id: createId(),
      companyId: input.companyId,
      kind: input.kind,
      status: allowedStatuses.includes(input.status) ? input.status : allowedStatuses[0],
      source: input.source,
      sourceNote: input.sourceNote,
      myPageUrl: input.myPageUrl,
      appliedAt: input.appliedAt,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    setApplications((current) => [application, ...current]);
    return application;
  }, []);

  const updateApplication = useCallback((id: string, input: Partial<ApplicationInput>) => {
    setApplications((current) =>
      current.map((application) => {
        if (application.id !== id) return application;
        const kind = input.kind ?? application.kind;
        const allowedStatuses = STATUS_OPTIONS_BY_KIND[kind];
        const requestedStatus = input.status ?? application.status;

        return {
          ...application,
          ...input,
          kind,
          status: allowedStatuses.includes(requestedStatus)
            ? requestedStatus
            : allowedStatuses[0],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications((current) => current.filter((application) => application.id !== id));
    setTasks((current) => current.filter((task) => task.applicationId !== id));
  }, []);

  const addTask = useCallback((input: TaskInput) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId(),
      applicationId: input.applicationId,
      kind: input.kind,
      title: input.title,
      dueAt: input.dueAt,
      done: false,
      createdAt: now,
      updatedAt: now,
    };

    setTasks((current) => [task, ...current]);
    return task;
  }, []);

  const updateTask = useCallback(
    (id: string, input: Partial<Pick<Task, "kind" | "title" | "dueAt" | "done">>) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                ...input,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const getCompany = useCallback(
    (id: string) => companies.find((company) => company.id === id),
    [companies],
  );

  const getApplication = useCallback(
    (id: string) => applications.find((application) => application.id === id),
    [applications],
  );

  const getCompanyApplications = useCallback(
    (companyId: string) =>
      applications.filter((application) => application.companyId === companyId),
    [applications],
  );

  const getApplicationTasks = useCallback(
    (applicationId: string) => tasks.filter((task) => task.applicationId === applicationId),
    [tasks],
  );

  const value = useMemo<ShukatsuStore>(
    () => ({
      hydrated,
      companies,
      applications,
      tasks,
      addCompany,
      updateCompany,
      deleteCompany,
      addApplication,
      updateApplication,
      deleteApplication,
      addTask,
      updateTask,
      deleteTask,
      getCompany,
      getApplication,
      getCompanyApplications,
      getApplicationTasks,
    }),
    [
      hydrated,
      companies,
      applications,
      tasks,
      addCompany,
      updateCompany,
      deleteCompany,
      addApplication,
      updateApplication,
      deleteApplication,
      addTask,
      updateTask,
      deleteTask,
      getCompany,
      getApplication,
      getCompanyApplications,
      getApplicationTasks,
    ],
  );

  return <ShukatsuContext.Provider value={value}>{children}</ShukatsuContext.Provider>;
}

export function useShukatsuStore() {
  const context = useContext(ShukatsuContext);
  if (!context) {
    throw new Error("useShukatsuStore must be used within ShukatsuProvider");
  }
  return context;
}

export function useBackToCompanies() {
  const router = useRouter();
  return useCallback(() => router.push("/companies"), [router]);
}
