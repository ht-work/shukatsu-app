"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompanyForm } from "@/components/company-form";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";

export default function NewCompanyPage() {
  const router = useRouter();
  const { addCompany } = useShukatsuStore();

  return (
    <HydrationGate>
      <PageHeader title="企業 新規登録" description="企業マスタを追加します。" />
      <Card>
        <CardHeader title="企業情報" />
        <CardContent>
          <CompanyForm
            submitLabel="企業を登録"
            onSubmit={(input) => {
              const company = addCompany(input);
              router.push(`/companies/${company.id}`);
            }}
          />
        </CardContent>
      </Card>
    </HydrationGate>
  );
}
