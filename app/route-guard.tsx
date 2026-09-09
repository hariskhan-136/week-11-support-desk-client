"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

const PUBLIC_ROUTES = ["/login", "/register"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { token, isRestoring } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isRestoring) {
      return;
    }

    if (!isPublicRoute && !token) {
      router.replace("/login");
    }
  }, [isRestoring, isPublicRoute, pathname, router, token]);

  if (isRestoring) {
    return null;
  }

  if (!isPublicRoute && !token) {
    return null;
  }

  return children;
}
