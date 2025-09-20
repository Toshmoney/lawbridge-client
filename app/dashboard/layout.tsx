"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

export default function DashboardProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      // ✅ Wait until AuthContext finishes checking localStorage
      if (token === null) return; 

      if (!token) {
        router.replace("/login?error=unauthorized");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          logout();
          router.replace("/login?error=expired");
        }
      } catch (err) {
        logout();
        router.replace("/login?error=network");
        console.log(err);
        
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [token, logout, router]);

  if (checking || token === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="ml-2">Checking session...</span>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
