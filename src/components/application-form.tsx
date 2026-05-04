"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { compactText } from "@/lib/utils";
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS_BY_KIND,
  type ApplicationKind,
  type ApplicationSource,
  type ApplicationStatus,
} from "@/types";
import type { ApplicationInput } from "@/hooks/use-shukatsu-store";

const sourceValues = Object.keys(APPLICATION_SOURCE_LABELS) as ApplicationSource[];

const applicationSchema = z.object({
  kind: z.enum(["internship", "fulltime"]),
  status: z.string().min(1),
  source: z.string().optional(),
  sourceNote: z.string().trim().optional(),
  myPageUrl: z
    .string()
    .trim()
    .refine((value) => !value || /^https?:\/\//.test(value), "URLは http(s) から入力してください")
    .optional(),
  appliedAt: z.string().optional(),
  notes: z.string().trim().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export function ApplicationForm({
  companyId,
  onSubmit,
}: {
  companyId: string;
  onSubmit: (input: ApplicationInput) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      kind: "fulltime",
      status: "interested",
      source: "",
      sourceNote: "",
      myPageUrl: "",
      appliedAt: "",
      notes: "",
    },
  });

  const kind = watch("kind") as ApplicationKind;
  const status = watch("status") as ApplicationStatus;
  const allowedStatuses = STATUS_OPTIONS_BY_KIND[kind];

  useEffect(() => {
    if (!allowedStatuses.includes(status)) {
      setValue("status", allowedStatuses[0]);
    }
  }, [allowedStatuses, setValue, status]);

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) => {
        const normalizedKind = values.kind as ApplicationKind;
        const status = values.status as ApplicationStatus;
        const allowed = STATUS_OPTIONS_BY_KIND[normalizedKind];

        onSubmit({
          companyId,
          kind: normalizedKind,
          status: allowed.includes(status) ? status : allowed[0],
          source: sourceValues.includes(values.source as ApplicationSource)
            ? (values.source as ApplicationSource)
            : undefined,
          sourceNote: compactText(values.sourceNote),
          myPageUrl: compactText(values.myPageUrl),
          appliedAt: compactText(values.appliedAt),
          notes: compactText(values.notes),
        });
      })}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="選考種別">
          <Select {...register("kind")}>
            {Object.entries(APPLICATION_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="初期ステータス">
          <Select {...register("status")}>
            {allowedStatuses.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="応募経路">
          <Select {...register("source")}>
            <option value="">未設定</option>
            {sourceValues.map((source) => (
              <option key={source} value={source}>
                {APPLICATION_SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="応募日">
          <Input type="date" {...register("appliedAt")} />
        </Field>
      </div>
      <Field label="マイページURL" error={errors.myPageUrl?.message}>
        <Input placeholder="https://example.com/mypage" {...register("myPageUrl")} />
      </Field>
      <Field label="応募経路メモ">
        <Input placeholder="その他の応募経路や補足" {...register("sourceNote")} />
      </Field>
      <Field label="エントリーメモ">
        <Textarea placeholder="選考対策、担当者、準備事項など" {...register("notes")} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          エントリーを追加
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
