"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BsSpeedometer2,
  BsCalendarCheck,
  BsCalendar2Week,
  BsCashStack,
} from "react-icons/bs";

const navItems = [
  {
    label: "Dashboard",
    href: "/employee",
    icon: <BsSpeedometer2 className="h-4 w-4" />,
  },
  {
    label: "Attendance",
    href: "/employee/attendance",
    icon: <BsCalendarCheck className="h-4 w-4" />,
  },
  {
    label: "Leave",
    href: "/employee/leave",
    icon: <BsCalendar2Week className="h-4 w-4" />,
  },
  {
    label: "Salary",
    href: "/employee/salary",
    icon: <BsCashStack className="h-4 w-4" />,
  },
];

const EmployeeNav = () => {
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

export default EmployeeNav;
