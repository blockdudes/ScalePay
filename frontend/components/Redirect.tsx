"use client";

import { useRouter } from "next/navigation";

export const Redirect = ({ href }: { href: string }) => {
  const router = useRouter();
  router.push(href);
  return null;
};
