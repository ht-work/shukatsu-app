"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { compactText } from "@/lib/utils";
import type { CompanyInput } from "@/hooks/use-shukatsu-store";
import type { Company } from "@/types";

const companySchema = z.object({
  name: z.string().trim().min(1, "企業名を入力してください"),
  url: z
    .string()
    .trim()
    .refine((value) => !value || /^https?:\/\//.test(value), "URLは http(s) から入力してください")
    .optional(),
  industry: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyForm({
  initialValue,
  submitLabel,
  onSubmit,
}: {
  initialValue?: Company;
  submitLabel: string;
  onSubmit: (input: CompanyInput) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialValue?.name ?? "",
      url: initialValue?.url ?? "",
      industry: initialValue?.industry ?? "",
      notes: initialValue?.notes ?? "",
    },
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name.trim(),
          url: compactText(values.url),
          industry: compactText(values.industry),
          notes: compactText(values.notes),
        }),
      )}
    >
      <Field label="企業名" error={errors.name?.message}>
        <Input placeholder="株式会社サンプル" {...register("name")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="URL" error={errors.url?.message}>
          <Input placeholder="https://example.com" {...register("url")} />
        </Field>
        <Field label="業界" error={errors.industry?.message}>
          <Input placeholder="IT / メーカー / 金融" {...register("industry")} />
        </Field>
      </div>
      <Field label="メモ" error={errors.notes?.message}>
        <Textarea placeholder="企業研究メモ、面接で聞かれたことなど" {...register("notes")} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
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
