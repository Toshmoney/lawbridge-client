"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";

type Consultation = {
  _id: string;
  scheduledAt: string;
  topic: string;
  details: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

type Lawyer = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    profileDescription?: string;
  };
  specialization: string[];
  barCertificate: string;
  verified: boolean;
  rating: number;
  consultations: Consultation[];
  createdAt: string;
  consultationFee:Number
};

export default function LawyerProfilePage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const params = useParams();
  const id = params?.slug as string;

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // consultation form state
  const [scheduleAt, setScheduleAt] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!id || !token) return;
    console.log(id);
    
    const fetchLawyer = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/lawyers/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) setLawyer(data);
        else console.error("Failed to fetch lawyer:", data.error);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Network error:", err.message);
        } else {
          console.error("Unknown error:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id, token]);

  const startConsultation = async () => {
    if (!token || !lawyer) return;
    setStarting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consultations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lawyerId: lawyer._id,
            scheduledAt: scheduleAt,
            topic,
            details,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        addToast({ title: "Consultation booked ✅" });
        window.location.href = `/dashboard/lawyers/${id}`;
      } else {
        addToast({
          title: data.error || "Failed to book consultation",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        addToast({ title: err.message, variant: "destructive" });
      } else {
        addToast({ title: "An unknown error occurred", variant: "destructive" });
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <p className="p-6">Loading lawyer profile...</p>;
  if (!lawyer) return <p className="p-6">Lawyer not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Profile Picture / Initial */}
      <div className="flex items-center gap-4">
        {lawyer.user.profilePicture ? (
          <Image
            src={lawyer.user.profilePicture}
            alt={lawyer.user.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
            {lawyer.user.name.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {lawyer.user.name}
            {lawyer.verified && (
              <CheckCircle className="text-blue-600 w-5 h-5" />
            )}
          </h1>
          <p className="text-gray-600">{lawyer.user.email}</p>
          {lawyer.user.profileDescription && (
            <p className="text-gray-500 text-sm mt-1">
              {lawyer.user.profileDescription}
            </p>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap gap-2">
        {lawyer.specialization.map((spec, idx) => (
          <Badge key={idx} className="bg-blue-100 text-blue-700">
            {spec}
          </Badge>
        ))}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <p>
          <strong>Bar Certificate:</strong> {lawyer.barCertificate}
        </p>

        <p className="text-black"><strong>Consultation Fee </strong>
          <span className="text-green-600 "> ₦{lawyer.consultationFee?.toLocaleString() || "N/A"}</span>
          </p>
        <p>
          <strong>Rating:</strong> {lawyer.rating} / 5
        </p>
        <p>
          <strong>Joined:</strong>{" "}
          {new Date(lawyer.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Book Consultation Popup */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
            Book Consultation
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Schedule At</Label>
              <Input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
              />
            </div>
            <div>
              <Label>Topic</Label>
              <Input
                type="text"
                placeholder="Enter consultation topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea
                placeholder="Enter details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <Button
              onClick={startConsultation}
              disabled={starting}
              className="w-full"
            >
              {starting ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
