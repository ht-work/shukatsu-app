import { Badge } from "@/components/ui/badge";
import { ACTIVE_STATUSES, STATUS_LABELS, TERMINAL_STATUSES, type ApplicationStatus } from "@/types";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const tone = TERMINAL_STATUSES.includes(status)
    ? status === "offered" || status === "intern_accepted"
      ? "success"
      : status === "rejected"
        ? "danger"
        : "muted"
    : ACTIVE_STATUSES.includes(status)
      ? "default"
      : "muted";

  return <Badge tone={tone}>{STATUS_LABELS[status]}</Badge>;
}
