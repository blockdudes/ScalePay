"use client";
import OnboardingCard from "@/components/OnboardingCard";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@material-tailwind/react";
import { toast } from "react-hot-toast";

const Onboarding = () => {
  const [selected, setSelected] = useState<"employer" | "employee" | null>(
    null
  );
  const router = useRouter();

  return (
    <>
      <h1 className="text-4xl font-bold mb-2">Onboarding</h1>
      <p className="text-base text-gray-500 mb-8">
        Choose your role to get started with your onboarding process
      </p>
      <div className="h-[calc(100%-250px)] w-full grid grid-cols-3 gap-4">
        <OnboardingCard
          title="Employer"
          description="Manage Your Workforce"
          list={[
            "Set rules and working hours.",
            "Manage employees.",
            "Track attendance.",
            "Track leave.",
            "Distribute fines/bonuses.",
            "Ensure transparency.",
            "Automate payouts.",
          ]}
          isSelected={selected === "employer"}
          onSelect={() => setSelected("employer")}
        />
        <OnboardingCard
          title="Employee"
          description="Manage Your Work"
          list={[
            "Log attendance.",
            "View records.",
            "Apply for leave.",
            "Track approvals.",
            "Check salary details.",
            "Stay transparent.",
          ]}
          isSelected={selected === "employee"}
          onSelect={() => setSelected("employee")}
        />
      </div>
      <Button
        size="lg"
        onClick={() => {
          if (!selected) {
            toast.error("Please select a role");
            return;
          }
          router.push(`/onboarding/${selected}`);
        }}
        disabled={!selected}
        className="mt-4 text-lg normal-case flex justify-center items-center gap-2 w-2/3"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Continue
      </Button>
    </>
  );
};

export default Onboarding;
