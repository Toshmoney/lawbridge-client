"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function CreateTemplatePage() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<string[]>([]);
  const [fieldInput, setFieldInput] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [loading, setLoading] = useState(false);
  const [templateType, setTemplateType] = useState("");

  const addField = () => {
    if (fieldInput.trim() && !fields.includes(fieldInput.trim())) {
      setFields([...fields, fieldInput.trim()]);
      setFieldInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/custom-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, fields, content, visibility, templateType }),
      });

      const data = await res.json();
      if (res.ok) {
        addToast({ title: "✅ Template Created", description: `Template "${data.title}" created successfully!` });
        setTitle("");
        setFields([]);
        setContent("");
        setVisibility("private");
        return window.location.href = "/dashboard/templates";
      } else {
        addToast({ title: "❌ Error", description: data.message || "Failed to create template" });
      }
    } catch (err) {
      addToast({ title: "❌ Network Error", description: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Create Template</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Loan Agreement"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Fields */}
        <div>
          <Label htmlFor="fields">Dynamic Fields</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="fields"
              placeholder="e.g. partyA"
              value={fieldInput}
              onChange={(e) => setFieldInput(e.target.value)}
            />
            <Button type="button" onClick={addField}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {fields.map((field, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-100 rounded text-sm">
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">Template Content</Label>
          <Textarea
            id="content"
            placeholder="Use {{fieldName}} for dynamic values..."
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        {/* templateType */}
         <div>
          <Label htmlFor="templateType">Template Type</Label>
          <Input
            id="templateType"
            placeholder="e.g. NDA, Contract"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            required
          />
         </div>

        {/* Visibility */}
        <div>
          <Label>Visibility</Label>
          <select
            className="border p-2 rounded w-full"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "private" | "public")}
          >
            <option value="private">Private (only me)</option>
            <option value="public">Public (everyone can use)</option>
          </select>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Template"}
        </Button>
      </form>
    </div>
  );
}
