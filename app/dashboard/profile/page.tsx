"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // ✅ if you have a textarea component
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, token, login, logout } = useAuth();
  const router = useRouter();

  // Profile form state
  const [form, setForm] = useState({
    name: user?.name || "",
    profileDescription: user?.profileDescription || "",
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.profilePicture || "");
  const [saving, setSaving] = useState(false);

  // Password form state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changing, setChanging] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Update profile
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("profileDescription", form.profileDescription);
      if (profilePic) formData.append("profilePicture", profilePic);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, token);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Failed to update profile.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    setChanging(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully. Please login again.");
        logout();
        router.replace("/login?error=password-changed");
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error(err);
    } finally {
      setChanging(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl py-6">
      {/* Left: Profile Overview */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {user.name?.charAt(0)}
            </div>
          )}

          <h2 className="text-xl font-bold mt-4">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          {user.profileDescription && (
            <p className="mt-2 text-sm text-gray-600">{user.profileDescription}</p>
          )}

          <div className="mt-4 space-y-2 w-full text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Role:</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Subscription:</span>
              <span>{user?.subscription ? user?.subscription.plan : "Free"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Joined:</span>
              <span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Edit Profile */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Picture</label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleProfileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile Description</label>
            <Textarea
              name="profileDescription"
              value={form.profileDescription}
              onChange={handleProfileChange}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={user.email} disabled />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Bottom: Change Password */}
      <div className="bg-white shadow-md rounded-2xl p-6 w-full md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <Input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <Input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={changing}>
            {changing ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
