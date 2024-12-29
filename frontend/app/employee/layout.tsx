import { Suspense } from "react";
import EmployeeNav from "@/components/EmployeeNav";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-gray-400">Manage your attendance and leaves</p>
      </div>

      <EmployeeNav />

      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </div>
  );
}
