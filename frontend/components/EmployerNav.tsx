"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BsSpeedometer2,
  BsPeople,
  BsCalendarCheck,
  BsFileEarmarkText,
  BsGear,
} from "react-icons/bs";

const navItems = [
  {
    label: "Dashboard",
    href: "/employer",
    icon: <BsSpeedometer2 className="h-4 w-4" />,
  },
  {
    label: "Employees",
    href: "/employer/employees",
    icon: <BsPeople className="h-4 w-4" />,
  },
  {
    label: "Attendance",
    href: "/employer/attendance",
    icon: <BsCalendarCheck className="h-4 w-4" />,
  },
  {
    label: "Leaves",
    href: "/employer/leaves",
    icon: <BsFileEarmarkText className="h-4 w-4" />,
  },
  {
    label: "Settings",
    href: "/employer/settings",
    icon: <BsGear className="h-4 w-4" />,
  },
];

const EmployerNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${
              pathname === item.href
                ? "bg-blue-500 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default EmployerNav;
