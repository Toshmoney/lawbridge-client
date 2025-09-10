"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  console.log("Authenticated user:", user);
  
  return (
    <>
      <h1 className="font-bold mb-6 lg:text-xl text-[18px]">Welcome back, {user?.name || "User"}!</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
              📄 Generate Document
            </button>
            <button className="w-full flex items-center gap-2 p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
              📞 Book Consultation
            </button>
            <button className="w-full flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100">
              ⚖️ Hire a Lawyer
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Templates</h2>
            <Button size="sm">Generate New</Button>
          </div>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-gray-100">Tenancy</div>
            <div className="p-2 rounded-lg bg-gray-100">Freelance</div>
            <div className="p-2 rounded-lg bg-gray-100">Loan</div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Subscription Status</h2>
          <div className="p-2 rounded-lg bg-gray-100">Free</div>
          <Button className="w-full">Upgrade Plan</Button>
        </div>

        {/* Wallet */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Wallet & Payments</h2>
          <p className="text-2xl font-bold">₦0.00</p>
        </div>

        {/* Lawyer Directory */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 md:col-span-2 lg:col-span-1">
          <h2 className="text-lg font-semibold">Consultation & Lawyer Directory</h2>
          <input
            type="text"
            placeholder="Find a lawyer by specialty"
            className="w-full p-2 border rounded-lg text-sm"
          />

          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <Image
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="lawyer"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">James Smith</p>
                  <p className="text-sm text-gray-500">⭐ 4.9 RealEstate</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Book Lawyer
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <Image
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="lawyer"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">Marina Doe</p>
                  <p className="text-sm text-gray-500">⭐ 5.0 Freelance</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Book Lawyer
              </Button>
            </div>
          </div>
        </div>
      </div>

      </>
  );
}
