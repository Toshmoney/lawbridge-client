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

const systemTemplates: Record<
  string,
  { title: string; fields: string[] }
> = {
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

type CustomTemplate = {
  _id: string;
  title: string;
  fields: string[];
  content: string;
  visibility: "private" | "public";
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

  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // new doc state
  const [newTitle, setNewTitle] = useState("");
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [newTemplate, setNewTemplate] = useState("tenancy");
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<string>("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  // downloads
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [downloadingWordId, setDownloadingWordId] = useState<string | null>(null);

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

  // fetch custom templates
  useEffect(() => {
    if (!token) return;
    const fetchCustom = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setCustomTemplates(data);
      } catch (err) {
        console.error("Error fetching custom templates:", err);
      }
    };
    fetchCustom();
  }, [token]);

  // reset fields when template changes
  useEffect(() => {
    if (mode === "system" && systemTemplates[newTemplate]) {
      const init: Record<string, string> = {};
      systemTemplates[newTemplate].fields.forEach((f) => (init[f] = ""));
      setFields(init);
    }
    if (mode === "custom" && selectedCustom) {
      const template = customTemplates.find((t) => t._id === selectedCustom);
      if (template) {
        const init: Record<string, string> = {};
        template.fields.forEach((f) => (init[f] = ""));
        setFields(init);
      }
    }
  }, [mode, newTemplate, selectedCustom, customTemplates]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      return addToast({ title: "Title is required", variant: "destructive" });
    }
    if (!token) {
      return addToast({ title: "Authentication required", variant: "destructive" });
    }

    // validate fields
    const templateFields =
      mode === "system"
        ? systemTemplates[newTemplate].fields
        : customTemplates.find((t) => t._id === selectedCustom)?.fields || [];

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
        window.location.href = "/dashboard/document"
      } else {
        if (res.status === 401) {
          addToast({ title: "Session expired. Please log in." });
          window.location.href = "/login";
          return;
        } else {
          return addToast({
            title: data.message || "Failed to create document",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Network error", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // download file
  const handleFileDownload = async (fileType: "pdf" | "word", fileId: string) => {
    if (fileType === "pdf") setDownloadingPdfId(fileId);
    else setDownloadingWordId(fileId);

    const path = fileType === "pdf" ? "download-pdf" : "download-word";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${path}/${fileId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to download");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = `${fileId}.${fileType === "pdf" ? "pdf" : "docx"}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) fileName = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      addToast({ title: "File downloaded successfully!" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        addToast({
          title: "Download Failed ❌",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Download Failed ❌",
          description: "An unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      fileType === "pdf" ? setDownloadingPdfId(null) : setDownloadingWordId(null);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
          />

          {/* New Document Popup */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap cursor-pointer">New Document</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter document title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                {/* Mode Switch */}
                <div>
                  <Label>Choose Template Source</Label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "system" | "custom")}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="system">System Templates</option>
                    <option value="custom">Custom Templates</option>
                  </select>
                </div>

                {/* Template selection */}
                {mode === "system" ? (
                  <div>
                    <Label>System Template</Label>
                    <select
                      value={newTemplate}
                      onChange={(e) => setNewTemplate(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      {Object.keys(systemTemplates).map((key) => (
                        <option key={key} value={key}>
                          {systemTemplates[key].title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <Label>Custom Template</Label>
                    <select
                      value={selectedCustom}
                      onChange={(e) => setSelectedCustom(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">-- Select Custom Template --</option>
                      {customTemplates.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dynamic fields */}
                {mode === "system" &&
                  systemTemplates[newTemplate]?.fields.map((field) => (
                    <div key={field}>
                      <Label className="capitalize">{field}</Label>
                      <Input
                        placeholder={`Enter ${field}`}
                        value={fields[field] || ""}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                      />
                    </div>
                  ))}

                {mode === "custom" &&
                  selectedCustom &&
                  customTemplates
                    .find((t) => t._id === selectedCustom)
                    ?.fields.map((field) => (
                      <div key={field}>
                        <Label className="capitalize">{field}</Label>
                        <Input
                          placeholder={`Enter ${field}`}
                          value={fields[field] || ""}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                        />
                      </div>
                    ))}

                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Creating..." : "Create Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
              <th className="p-4">Title</th>
              <th className="p-4">Document Type</th>
              <th className="p-4">Date created</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="p-4">{doc.title}</td>
                  <td className="p-4">
                    {doc.templateType?.toUpperCase() || "CUSTOM"}
                  </td>
                  <td className="p-4">
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">{renderStatus(doc.status)}</td>
                  <td className="p-4 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload("pdf", doc._id)}
                      disabled={downloadingPdfId === doc._id}
                      className="flex items-center gap-2"
                    >
                      {downloadingPdfId === doc._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
                        </>
                      ) : (
                        "Download PDF"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileDownload("word", doc._id)}
                      disabled={downloadingWordId === doc._id}
                      className="flex items-center gap-2"
                    >
                      {downloadingWordId === doc._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
                        </>
                      ) : (
                        "Download Word"
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
