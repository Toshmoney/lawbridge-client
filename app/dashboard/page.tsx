"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

type Lawyer = {
  _id: string;
  user: { _id: string; name: string; email: string; profilePic?: string };
  specialization: string[];
  verified: boolean;
  rating?: number;
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch all lawyers
  useEffect(() => {
    if (!token || user?.role !== "client") return;
    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lawyers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLawyers(data);
      } catch (err) {
        console.error("Error fetching lawyers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, [token, user]);

  // Client-side filter
  const filteredLawyers = lawyers.filter((lawyer) => {
    const q = search.toLowerCase();
    return (
      lawyer.user.name.toLowerCase().includes(q) ||
      lawyer.specialization.some((spec) => spec.toLowerCase().includes(q))
    );
  });

  // Limit to 3 lawyers only for dashboard preview
  const previewLawyers = filteredLawyers.slice(0, 3);

  return (
    <>
      <h1 className="font-bold mb-6 lg:text-xl text-[18px]">
        Welcome back, {user?.name || "User"}!
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
              <Link href="/dashboard/document">
              📄 Generate Document
              </Link>
            </button>
            <button className="w-full flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Link href="/dashboard/bookings">
              📞 My Booking Consultations
              </Link>
            </button>
            <button className="w-full flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100">
              ⚖️ Hire a Lawyer (coming soon)
            </button>
          </div>
        </div>

        {/* If Client → Show Lawyer Directory */}
        {user?.role === "client" ? (
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold">Consultation & Lawyer Directory</h2>

            <Input
              type="text"
              placeholder="Find a lawyer by name or specialty"
              className="w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="space-y-3 mt-3">
              {loading ? (
                <p className="text-sm text-gray-500">Loading lawyers...</p>
              ) : previewLawyers.length > 0 ? (
                previewLawyers.map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      {lawyer.user.profilePic ? (
                        <Image
                          src={lawyer.user.profilePic}
                          alt={lawyer.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                          {lawyer.user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {lawyer.user.name}
                          {lawyer.verified && (
                            <CheckCircle className="text-blue-600 w-4 h-4" />
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          ⭐ {lawyer.rating || "New"}{" "}
                          {lawyer.specialization.join(", ")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/dashboard/lawyers/${lawyer._id}`, "_blank")
                      }
                    >
                      View Profile
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No lawyers found</p>
              )}
            </div>

            {/* View All Lawyers Button */}
            <div className="mt-4 text-center">
              <Link href="/dashboard/lawyers">
                <Button variant="link" className="text-blue-600">
                  View All Lawyers →
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // If Lawyer → Show Templates
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Templates</h2>
              <Button size="sm">Generate New</Button>
            </div>
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-gray-100">Tenancy</div>
              <div className="p-2 rounded-lg bg-gray-100">Freelance</div>
              <div className="p-2 rounded-lg bg-gray-100">Loan</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
