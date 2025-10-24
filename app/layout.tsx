"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Suspense, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogout = async () => {
    const res = await authAPI.logout();
    console.log(res);
    // setTimeout(() => {
    //   router.replace("/login");
    // }, 3000);

    setIsLoggedIn(false);
    setUser(null);
    //call back url will be cache inside the localstorage
  };
  return (
    <html lang="en">
      <body className={`antialiased relative`}>{children}</body>
    </html>
  );
}
