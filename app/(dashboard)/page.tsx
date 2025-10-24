"use client";

import { useEffect, useState } from "react";

import { POSInterface } from "@/components/pos-interface";
import { authAPI, menuAPI } from "@/lib/api";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return <POSInterface user={user} onLogout={handleLogout} />;
}
