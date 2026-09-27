"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/login") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center animate-bounce shadow-xl shadow-amber-500/20 mb-4">
          <Sparkles className="w-6 h-6 text-slate-950" />
        </div>
        <div className="text-sm font-semibold tracking-wider text-amber-400 animate-pulse">
          LE MAJESTIC POS
        </div>
        <p className="text-xs text-slate-500 mt-1">Initializing service environment...</p>
      </div>
    );
  }

  return <>{children}</>;
}
