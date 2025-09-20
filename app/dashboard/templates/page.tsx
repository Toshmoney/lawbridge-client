"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Link from "next/link";

type Template = {
  _id: string;
  title: string;
  fields: string[];
  content: string;
  visibility: "private" | "public";
  createdAt: string;
};

export default function TemplatesPage() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // popup state
  const [selected, setSelected] = useState<Template | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    fields: "",
    content: "",
    visibility: "private",
  });
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch templates
  useEffect(() => {
    if (!token) return;
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates/my-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTemplates(data);
        } else {
          addToast({ title: "❌ Error", description: data.message || "Failed to fetch templates" });
        }
      } catch (err) {
        addToast({ title: "❌ Network Error", description: String(err) });
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [token, addToast]);

  // open edit popup
  const handleEdit = (template: Template) => {
    setSelected(template);
    setEditForm({
      title: template.title,
      fields: template.fields.join(", "),
      content: template.content,
      visibility: template.visibility,
    });
    setPreviewMode(false);
  };

  // save edit
  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates/${selected._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          fields: editForm.fields.split(",").map((f) => f.trim()),
          content: editForm.content,
          visibility: editForm.visibility,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t._id === selected._id ? data : t))
        );
        addToast({ title: "✅ Updated", description: "Template updated successfully" });
        setSelected(null);
      } else {
        addToast({ title: "❌ Error", description: data.message || "Failed to update template" });
      }
    } catch (err) {
      addToast({ title: "❌ Network Error", description: String(err) });
    } finally {
      setSaving(false);
    }
  };

  // Delete template
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        addToast({ title: "🗑️ Deleted", description: "Template deleted successfully" });
      } else {
        const data = await res.json();
        addToast({ title: "❌ Error", description: data.message || "Failed to delete template" });
      }
    } catch (err) {
      addToast({ title: "❌ Network Error", description: String(err) });
    }
  };

  // Generate preview by replacing {{field}} with sample values
  const generatePreview = () => {
    const fieldsArr = editForm.fields.split(",").map((f) => f.trim());
    let previewText = editForm.content;
    fieldsArr.forEach((f, i) => {
      const regex = new RegExp(`{{${f}}}`, "g");
      previewText = previewText.replace(regex, `Field${i + 1}`);
    });
    return previewText;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Templates</h1>
        <Link href="/dashboard/templates/create" className="bg-black text-white px-4 py-2 rounded-sm cursor-pointer" >
          Create New
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" /> Loading templates...
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4">
          {templates.map((t) => (
            <div key={t._id} className="p-4 bg-white shadow rounded-lg flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{t.title}</h2>
                <p className="text-sm text-gray-600">Fields: {t.fields.join(", ")}</p>
                <p className="text-xs text-gray-400">
                  {t.visibility === "private" ? "🔒 Private" : "🌍 Public"} •{" "}
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(t)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(t._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No templates found. Start by creating one!</p>
      )}

      {/* Edit Popup */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewMode ? "Preview Template" : "Edit Template"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              {previewMode ? (
                <div className="p-3 border rounded bg-gray-50 text-sm whitespace-pre-wrap">
                  {generatePreview()}
                </div>
              ) : (
                <>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title"
                  />
                  <Input
                    value={editForm.fields}
                    onChange={(e) => setEditForm({ ...editForm, fields: e.target.value })}
                    placeholder="Fields (comma separated)"
                  />
                  <Textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    placeholder="Template content"
                    rows={4}
                  />
                  <Select
                    value={editForm.visibility}
                    onValueChange={(val) => setEditForm({ ...editForm, visibility: val as "private" | "public" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            {previewMode ? (
              <Button onClick={() => setPreviewMode(false)}>Back to Edit</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setPreviewMode(true)}>
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
