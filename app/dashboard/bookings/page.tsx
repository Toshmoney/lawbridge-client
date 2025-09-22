"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type Consultation = {
  _id: string;
  lawyer: {
    _id: string;
    user: { _id: string; name: string };
    specialization: string[];
  };
  user: { _id: string; name: string; email?: string };
  topic: string;
  details: string;
  createdAt: string;
};

export default function BookingsPage() {
  const { token, user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // popup state
  const [selected, setSelected] = useState<Consultation | null>(null);

  useEffect(() => {
    if (!token){
        setLoading(false);
        addToast({
            title: "Authentication Error",
            description: "You must be logged in to view your bookings.",
            variant: "destructive",
          });
    };

    const fetchBookings = async () => {
        console.log(user?.role);
        
      const path =
        user?.role == "client"
          ? "consultations"
          : "consultations/lawyer";
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${path}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setConsultations(data);
        } else {
        
          console.log("Failed to fetch bookings:", data.message);
          return;
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token, addToast, user?.role]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" />
          Loading bookings...
        </div>
      ) : consultations.length > 0 ? (
        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                <th className="p-4">Client</th>
                <th className="p-4">Lawyer</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-4 font-medium">
                    {c.user?.name}{" "}
                    {c.user?.name === user?.name ? "(You)" : null}
                  </td>
                  <td className="p-4 font-medium">
                    {c.lawyer?.user?.name}{" "}
                    {c.lawyer?.user?.name === user?.name ? "(You)" : null}
                  </td>
                  <td className="p-4">{c.topic}</td>
                  <td className="p-4">
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4">
                    {
                        c.lawyer?.user?.name ? (<Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(c)}
                    >
                      View
                    </Button>) : "N/A"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No bookings found</p>
      )}

      {/* Popup */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <p>
                <strong>Client:</strong>{" "}
                {selected.user.name === user?.name
                  ? `${selected.user.name} (You)`
                  : selected.user.name}
              </p>
              {selected.user.email && (
                <p>
                  <strong>Client Email:</strong> {selected.user.email}
                </p>
              )}
              <p>
                <strong>Lawyer:</strong>{" "}
                {selected.lawyer.user.name === user?.name
                  ? `${selected.lawyer.user.name} (You)`
                  : selected.lawyer.user.name}
              </p>
              {selected.lawyer.specialization?.length > 0 && (
                <p>
                  <strong>Specialization:</strong>{" "}
                  {selected.lawyer.specialization.join(", ")}
                </p>
              )}
              <p>
                <strong>Topic:</strong> {selected.topic}
              </p>
              <p>
                <strong>Details:</strong> {selected.details}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
