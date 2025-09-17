"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Lawyer = {
  _id: string;
  user: { _id: string; name: string; email: string; profilePic?: string };
  specialization: string[];
  verified: boolean;
};

export default function LawyersPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [specialization, setSpecialization] = useState("");
  const [barCert, setBarCert] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchLawyers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lawyers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setLawyers(data);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [token]);

  // 🔎 Client-side search (name, email, specialization)
  const filteredLawyers = lawyers.filter((lawyer) => {
    const query = search.toLowerCase();
    return (
      lawyer.user.name.toLowerCase().includes(query) ||
      lawyer.user?.email?.toLowerCase().includes(query) ||
      lawyer.specialization.some((spec) =>
        spec.toLowerCase().includes(query)
      )
    );
  });

  const createLawyerAccount = async () => {
    if (!specialization || !barCert) {
      addToast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lawyers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          specialization: specialization.split(",").map((s) => s.trim()),
          barCertificate: barCert,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast({ title: "Lawyer account created ✅" });
        setOpen(false);
        setSpecialization("");
        setBarCert("");
      } else {
        addToast({
          title: data.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      addToast({ title: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lawyers</h1>

        {/* Show "Become a Lawyer" only if user is client */}
        {user?.role === "client" && (
          <Button onClick={() => setOpen(true)}>Become a Lawyer</Button>
        )}
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search by name, email, or specialization..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Lawyers List */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading lawyers...</p>
        ) : filteredLawyers.length > 0 ? (
          filteredLawyers.map((lawyer) => (
            <div
              key={lawyer._id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-4">
                {lawyer.user.profilePic ? (
                  <img
                    src={lawyer.user.profilePic}
                    alt={lawyer.user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                    {lawyer.user.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {lawyer.user.name}
                    {lawyer.verified && (
                      <CheckCircle className="text-blue-600 w-4 h-4" />
                    )}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {lawyer.specialization.join(", ")}
                  </p>
                </div>
              </div>

              <Link href={`/dashboard/lawyers/${lawyer._id}`}>
                <Button>View Profile</Button>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No lawyers found</p>
        )}
      </div>

      {/* Become Lawyer Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Lawyer Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Specializations (comma separated)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
            <Textarea
              placeholder="Bar Certificate ID / File Ref"
              value={barCert}
              onChange={(e) => setBarCert(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={createLawyerAccount}
              disabled={submitting}
              className="bg-blue-600 text-white"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
