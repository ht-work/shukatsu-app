"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fromDateTimeLocalValue } from "@/lib/date";
import { TASK_KIND_LABELS, type TaskKind } from "@/types";
import type { TaskInput } from "@/hooks/use-shukatsu-store";

const taskSchema = z.object({
  kind: z.enum([
    "es_deadline",
    "web_test",
    "coding_test",
    "group_discussion",
    "interview",
    "other",
  ]),
  title: z.string().trim().min(1, "タイトルを入力してください"),
  dueAt: z.string().min(1, "日時を入力してください"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({
  applicationId,
  onSubmit,
}: {
  applicationId: string;
  onSubmit: (input: TaskInput) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      kind: "es_deadline",
      title: "",
      dueAt: "",
    },
  });

  return (
    <form
      className="grid gap-3 lg:grid-cols-[1fr_1.2fr_1.1fr_auto]"
      onSubmit={handleSubmit((values) => {
        const dueAt = fromDateTimeLocalValue(values.dueAt);
        if (!dueAt) return;
        onSubmit({
          applicationId,
          kind: values.kind as TaskKind,
          title: values.title.trim(),
          dueAt,
        });
        reset();
      })}
    >
      <Select {...register("kind")}>
        {Object.entries(TASK_KIND_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <div>
        <Input placeholder="ES提出締切" {...register("title")} />
        {errors.title ? <p className="mt-1 text-xs text-red-300">{errors.title.message}</p> : null}
      </div>
      <div>
        <Input type="datetime-local" {...register("dueAt")} />
        {errors.dueAt ? <p className="mt-1 text-xs text-red-300">{errors.dueAt.message}</p> : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <Plus className="h-4 w-4" aria-hidden />
        追加
      </Button>
    </form>
  );
}
