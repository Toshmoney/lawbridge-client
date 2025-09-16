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

const templates: Record<
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

type Document = {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  templateType: string;
};

export default function DocumentsPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // new doc form
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState("tenancy");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

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

  // When template changes, reset fields
  useEffect(() => {
    if (newTemplate && templates[newTemplate]) {
      const init: Record<string, string> = {};
      templates[newTemplate].fields.forEach((f) => (init[f] = ""));
      setFields(init);
    }
  }, [newTemplate]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return addToast({ title: "Title is required", variant: "destructive" });

    // check all fields are filled
    for (const field of templates[newTemplate].fields) {
      if (!fields[field]?.trim()) {
        return addToast({ title: `Field "${field}" is required`, variant: "destructive" });
      }
    }

    if (!token) return addToast({ title: "Authentication required", variant: "destructive" });

    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          templateType: newTemplate,
          fields,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDocuments((prev) => [data, ...prev]);
        setNewTitle("");
        setFields({});
        addToast({ title: "Document created successfully" });
      } else {
        if (res.status === 401) {
            addToast({title:"session expired pls login to continue"})
            return window.location.href = "/login";
        }else{
            return addToast({ title: data.error || "Failed to create document", variant: "destructive" }); 
        }
      }
    } catch (err) {
      console.error(err);
      addToast({ title: "Network error", variant: "destructive" });
    } finally {
      setCreating(false);
    
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
              <Button className="whitespace-nowrap">New Document</Button>
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
                <div>
                  <Label>Template Type</Label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    {Object.keys(templates).map((key) => (
                      <option key={key} value={key}>
                        {templates[key].title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic fields */}
                {templates[newTemplate]?.fields.map((field) => (
                  <div key={field}>
                    <Label className="capitalize">{field}</Label>
                    <Input
                      placeholder={`Enter ${field}`}
                      value={fields[field] || ""}
                      onChange={(e) =>
                        handleFieldChange(field, e.target.value)
                      }
                    />
                  </div>
                ))}

                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full"
                >
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="p-4">{doc.title}</td>
                  <td className="p-4">{doc.templateType.toUpperCase()}</td>
                  <td className="p-4">
                    {new Date(doc.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">{renderStatus(doc.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
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
