import { Suspense } from "react";
import EmployerNav from "@/components/EmployerNav";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100%-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <p className="text-gray-400">Manage your workforce and payroll</p>
      </div>

      <EmployerNav />

      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}
