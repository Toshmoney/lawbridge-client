"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const systemTemplates: Record<string, { title: string; fields: string[] }> = {
  tenancy: {
    title: "Tenancy Agreement",
    fields: ["landlord", "tenant", "address", "duration", "startDate", "rent"],
  },
  employment: {
    title: "Employment Contract",
    fields: ["employer", "employee", "position", "startDate", "salary"],
  },
  nda: {
    title: "Non-Disclosure Agreement",
    fields: ["partyA", "partyB", "date"],
  },
};

type PurchasedTemplate = {
  _id: string;
  title: string;
  fields: string[];
  content: string;
};

type Document = {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  templateType: string;
};

type DocumentPayload = {
  title: string;
  fields: Record<string, string>;
  templateMode: "system" | "custom";
  templateType?: string;
  customTemplateId?: string;
};

export default function DocumentsPage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [search, setSearch] = useState(""); // search state now functional
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // new doc state
  const [newTitle, setNewTitle] = useState("");
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [newTemplate, setNewTemplate] = useState("tenancy");
  const [purchasedTemplates, setPurchasedTemplates] = useState<PurchasedTemplate[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<string>("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  // downloads
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // fetch documents
  useEffect(() => {
    const fetchDocs = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setDocuments(data);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [token]);

  // fetch purchased templates
  useEffect(() => {
    if (!token) return;
    const fetchPurchased = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPurchasedTemplates(data);
        }
      } catch (err) {
        console.error("Error fetching purchased templates:", err);
      }
    };
    fetchPurchased();
  }, [token, addToast]);

  // reset fields when template changes
  useEffect(() => {
    if (mode === "system" && systemTemplates[newTemplate]) {
      const init: Record<string, string> = {};
      systemTemplates[newTemplate].fields.forEach((f) => (init[f] = ""));
      setFields(init);
    }
    if (mode === "custom" && selectedCustom) {
      const template = purchasedTemplates.find((t) => t._id === selectedCustom);
      if (template) {
        const init: Record<string, string> = {};
        template.fields.forEach((f) => (init[f] = ""));
        setFields(init);
      }
    }
  }, [mode, newTemplate, selectedCustom, purchasedTemplates]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      return addToast({ title: "Title is required", variant: "destructive" });
    }

    const templateFields =
      mode === "system"
        ? systemTemplates[newTemplate].fields
        : purchasedTemplates.find((t) => t._id === selectedCustom)?.fields || [];

    for (const field of templateFields) {
      if (!fields[field]?.trim()) {
        return addToast({ title: `Field "${field}" is required`, variant: "destructive" });
      }
    }

    setCreating(true);
    try {
      const body: DocumentPayload = {
        title: newTitle,
        fields,
        templateMode: mode,
      };

      if (mode === "system") {
        body.templateType = newTemplate;
      } else {
        body.customTemplateId = selectedCustom;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setDocuments((prev) => [data, ...prev]);
        setNewTitle("");
        setFields({});
        addToast({ title: "Document created successfully" });
      } else {
        addToast({ title: data.message || "Failed to create document", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Network error", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // download file
  const handleDownload = async (docId: string, type: "pdf" | "word") => {
    setDownloadingId(docId + type); // unique state per type
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/download-${type}/${docId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-${docId}.${type === "pdf" ? "pdf" : "docx"}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast({ title: "❌ Error", description: String(err) });
    } finally {
      setDownloadingId(null);
    }
  };

  // 🔍 functional search (title + type + status)
  const filteredDocs = documents.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.templateType || "custom").toLowerCase().includes(q) ||
      doc.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Document</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            {/* ... your new document creation form remains same ... */}
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔎 Search Bar */}
      <div>
        <Input
          placeholder="Search by title, type, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
      </div>

      {/* Document List */}
      <div className="bg-white shadow rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center">
                  <Loader2 className="animate-spin inline" /> Loading...
                </td>
              </tr>
            ) : filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="p-3">{doc.title}</td>
                  <td className="p-3">{doc.templateType || "Custom"}</td>
                  <td className="p-3">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Badge>{doc.status}</Badge>
                  </td>
                  <td className="p-3 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc._id, "pdf")}
                      disabled={downloadingId === doc._id + "pdf"}
                    >
                      {downloadingId === doc._id + "pdf"
                        ? "Downloading..."
                        : "Download PDF"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc._id, "word")}
                      disabled={downloadingId === doc._id + "word"}
                    >
                      {downloadingId === doc._id + "word"
                        ? "Downloading..."
                        : "Download Word"}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
