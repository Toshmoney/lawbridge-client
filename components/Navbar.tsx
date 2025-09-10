"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";


export default function Navbar() {
  const { user } = useAuth();

  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#testimonials", label: "Testimonials" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold ${
            scrolled ? "text-blue-700" : "text-white"
          }`}
        >
          Lawbridge
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-6 font-medium">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href
                    ? scrolled
                      ? "text-blue-600"
                      : "text-white font-semibold"
                    : scrolled
                    ? "text-gray-700 hover:text-blue-600"
                    : "text-gray-100 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button className="cursor-pointer">Dashboard</Button>
            </Link>
          ) : (
            <><Link href="/login">
            <Button
              variant={scrolled ? "outline" : "secondary"}
              className={scrolled ? "" : "bg-white text-blue-700 cursor-pointer hover:bg-gray-100"}
            >
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              className={scrolled ? "" : "bg-blue-600 text-white cursor-pointer hover:bg-blue-700"}
            >
              Sign Up
            </Button>
          </Link>
          </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu
                  className={`h-6 w-6 ${
                    scrolled ? "text-gray-700" : "text-white"
                  }`}
                />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-6 space-y-6">
              <ul className="flex flex-col gap-4 font-medium text-gray-700">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-blue-600">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link href="/dashboard">
                    <Button className="w-full cursor-pointer">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                  <Link href="/login">
                  <Button variant="outline" className="w-full cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full cursor-pointer">Sign Up</Button>
                </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
