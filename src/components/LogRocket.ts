"use client";

import { useUser } from "@clerk/nextjs";
import { default as L } from "logrocket";
import { memo } from "react";

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

if (isProduction) L.init("xxxxxxx");

/**
 * NOT BEING USED!
 */
export const LogRocket = memo(function LogRocket() {
  const { user } = useUser();
  if (user && isProduction) {
    L.identify(user.id, {
      name: user.fullName!,
      email: user.primaryEmailAddress?.emailAddress || "",
    });
  }
  return null;
});
