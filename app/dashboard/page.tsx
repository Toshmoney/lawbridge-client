"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

type Lawyer = {
  _id: string;
  user: { _id: string; name: string; email: string; profilePic?: string };
  specialization: string[];
  verified: boolean;
  rating?: number;
};

type Template = {
  _id: string;
  title: string;
  fields: string[];
  content: string;
  visibility: "private" | "public";
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Fetch all lawyers (for clients)
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

  // Fetch lawyer's own templates (for lawyers)
  useEffect(() => {
    if (!token || user?.role !== "lawyer") return;
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/custom-templates/my-templates`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (res.ok) {
          setTemplates(data);
        } else {
          if (res.status !== 404) {
            addToast({
              title: "❌ Error",
              description: data.message || "Failed to fetch templates",
            });
          }
        }
      } catch (err) {
        addToast({ title: "❌ Network Error", description: String(err) });
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [token, user, addToast]);

  // Client-side filter for lawyers
  const filteredLawyers = lawyers.filter((lawyer) => {
    const q = search.toLowerCase();
    return (
      lawyer.user.name.toLowerCase().includes(q) ||
      lawyer.specialization.some((spec) => spec.toLowerCase().includes(q))
    );
  });

  const previewLawyers = filteredLawyers.slice(0, 3);

  return (
    <>
      <h1 className="font-bold mb-6 lg:text-xl text-[18px]">
        Welcome back, {user?.name || "User"}!
      </h1>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <div className="flex w-[80%] flex-col justify-center">

            <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
                <Link href="/dashboard/document">📄 Generate Document</Link>
              </button>
              <button className="w-full flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Link href="/dashboard/bookings">📞 My Booking Consultations</Link>
              </button>
              <button className="w-full flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100">
                ⚖️ Hire a Lawyer (coming soon)
              </button>
            </div>
        </div> 
        </div>

        {/* Client → Lawyer Directory */}
        {user?.role === "client" ? (
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold">
              Consultation & Lawyer Directory
            </h2>

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
          // Lawyer → Templates Table
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-4 md:col-span-2 lg:col-span-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Templates</h2>
              <Link href="/dashboard/templates/create">
                <Button size="sm">+ Create New</Button>
              </Link>
            </div>

            {loadingTemplates ? (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Loading templates...
              </p>
            ) : templates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border">Title</th>
                      <th className="p-2 border">Fields</th>
                      <th className="p-2 border">Visibility</th>
                      <th className="p-2 border">Created</th>
                      <th className="p-2 border">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t._id} className="border-t">
                        <td className="p-2">{t.title}</td>
                        <td className="p-2">{t.fields.join(", ")}</td>
                        <td className="p-2">
                          {t.visibility === "private" ? "🔒 Private" : "🌍 Public"}
                        </td>
                        <td className="p-2">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          {new Date(t.updatedAt).toLocaleDateString()}
                        </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No templates found. Start by creating one!
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
