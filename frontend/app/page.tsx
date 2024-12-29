"use client";
import { Button } from "@material-tailwind/react";
import Link from "next/link";
import { BsClockFill, BsCashStack, BsShieldCheck } from "react-icons/bs";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <h1 className="text-6xl font-bold mb-6">PayScale</h1>
      <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl">
        Decentralized attendance tracking and payroll management system powered
        by blockchain technology
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <FeatureCard
          icon={<BsClockFill size={24} />}
          title="Attendance Tracking"
          description="Transparent and immutable attendance records on blockchain"
        />
        <FeatureCard
          icon={<BsCashStack size={24} />}
          title="Automated Payroll"
          description="Smart contract-based salary calculations and payouts"
        />
        <FeatureCard
          icon={<BsShieldCheck size={24} />}
          title="Trustless System"
          description="No central authority, fully transparent operations"
        />
      </div>

      <Button
        size="lg"
        className="bg-white text-black"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Connect wallet to get started!
      </Button>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
    <div className="text-blue-500 mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default Home;
