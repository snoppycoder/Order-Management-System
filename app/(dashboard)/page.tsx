"use client";

import { useState } from "react";

import { POSInterface } from "@/components/pos-interface";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // const handleLogin = (username: string, role: string) => {
  //   localStorage.setItem("username", username); // the user here
  //   setUser({ name: username, role });
  //   setIsLoggedIn(true);
  // };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return <POSInterface user={user} onLogout={handleLogout} />;
}
