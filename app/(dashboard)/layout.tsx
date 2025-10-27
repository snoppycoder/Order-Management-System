"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const systemRoles = ["Waiter", "Cashier", "Chef", "Admin"];
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await authAPI.session();

        if (!session.message) {
          router.replace("/login");
        }
        // else {
        //   setLoading(false);
        // }
        else {
          if (!localStorage.getItem("role")) {
            const user = await authAPI.whoAmI(session.message);
            console.log(session.message, "email");
            localStorage.setItem("email", session.message);
            const roles = user.data.roles;
            if (roles.length > 40) {
              localStorage.setItem("role", "Admin");
              // router.replace("/admin");
              router.replace("/");
            } else {
              for (const item of roles) {
                if (systemRoles.includes(item.role)) {
                  localStorage.setItem("role", item.role);
                  break;
                }
              }
            }
          }
          setLoading(false);
        }
      } catch (error) {
        router.replace("/login");
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    localStorage.clear();
    router.replace("/login");

    setIsLoggedIn(false);
    setUser(null);
    //call back url will be cache inside the localstorage
    // I will use a authGuard to check the role
  };
  return (
    <html lang="en">
      <body className={`antialiased relative`}>
        {loading ? (
          <div className="w-full min-h-screen flex justify-center items-center">
            Loading...
          </div>
        ) : (
          <>
            <div className="flex gap-x-2.5 items-center absolute top-0 right-0 p-4">
              <Suspense fallback={null}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar
                        className={`h-8 w-8 cursor-pointer ${
                          loading ? "hidden" : "block"
                        }`}
                      >
                        <AvatarImage src="/admin-avatar.png" alt="Admin" />
                        <AvatarFallback>WT</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={handleLogout}>
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Suspense>
            </div>
            {children}
          </>
        )}
      </body>
    </html>
  );
}
