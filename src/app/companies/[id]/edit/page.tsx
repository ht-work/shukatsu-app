"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompanyForm } from "@/components/company-form";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";

export default function EditCompanyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getCompany, updateCompany } = useShukatsuStore();
  const company = getCompany(params.id);

  if (!company) {
    return (
      <HydrationGate>
        <EmptyState title="企業が見つかりません" description="削除済み、またはURLが正しくない可能性があります。" />
      </HydrationGate>
    );
  }

  return (
    <HydrationGate>
      <PageHeader title="企業 編集" description={company.name} />
      <Card>
        <CardHeader title="企業情報" />
        <CardContent>
          <CompanyForm
            initialValue={company}
            submitLabel="変更を保存"
            onSubmit={(input) => {
              updateCompany(company.id, input);
              router.push(`/companies/${company.id}`);
            }}
          />
        </CardContent>
      </Card>
    </HydrationGate>
  );
}
