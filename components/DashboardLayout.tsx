"use client";

import Sidebar from "@/components/Sidebar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <main className="flex-1 sm:p-6">

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
