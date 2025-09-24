"use client";

import { Home, FileText, Users, Wallet, Book, User, Menu, BookCopy  } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  return (
    <>
      {/* Mobile Toggler */}
      <div className="md:hidden p-4 border-b">
        <div className="text-xl font-bold text-blue-600 hidden md:block">Lawbridge</div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4 w-64">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r p-4 space-y-4">
        <div className="text-2xl font-bold text-blue-600">Lawbridge</div>
        <SidebarNav />
      </aside>
    </>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useAuth();
  

  const handleLogout = () => {
    logout();
  };

  const linkClasses = (href: string) =>
    `flex items-center gap-2 p-2 rounded-lg transition ${
      pathname === href
        ? "bg-blue-50 text-blue-600 font-medium"
        : "hover:bg-gray-100"
    }`;

  return (
    <>
      <nav className="space-y-2">
        <Link href="/dashboard" className={linkClasses("/dashboard")}>
          <Home size={18} /> Dashboard
        </Link>
        <Link
          href="/dashboard/document"
          className={linkClasses("/dashboard/document")}
        >
          <FileText size={18} /> Documents
        </Link>

        {
          user?.role === "client"?
          (<Link
            href="/dashboard/lawyers"
            className={linkClasses("/dashboard/lawyers")}
          >
            <Users size={18} /> Lawyers
          </Link>): (
          <>
              <Link
                href="/dashboard/wallet"
                className={linkClasses("/dashboard/wallet")}
              >
                <Wallet size={18} /> Wallet
              </Link>
          </>
        
      )
        }

        <Link
            href="/dashboard/bookings"
            className={linkClasses("/dashboard/bookings")}
          >
            <Book size={18} /> Bookings
          </Link>

        <Link
          href="/dashboard/templates"
          className={linkClasses("/dashboard/templates")}
        >
          <BookCopy size={18} />{user?.role === "client"? "Buy Templates":"Templates"}
        </Link>
        
        <Link
          href="/dashboard/profile"
          className={linkClasses("/dashboard/profile")}
        >
          <User size={18} /> Profile
        </Link>
      </nav>

      {/* Log out */}
      <div className="">
        <button
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-red-600 font-medium"
          onClick={handleLogout}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </>
  );
}
