"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
type errorType = {
  response: {
    data: { message: string };
  };
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // const value = authAPI.login(username, password).then(({ user }) => {
      //   console.log("Logged in user:", user);
      //   localStorage.setItem("loggedInUser", JSON.stringify(user));
      //   router.replace("/");
      // });
      try {
        const value = await authAPI.login(username, password);
        if (value.message == "Logged In") {
          console.log(value.role, "role");
          router.replace("/");
        } else {
          throw Error("Invalid credential");
        }
      } catch (error) {
        const err = error as errorType;

        setMessage(err.response.data.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center ">
      <Card className="w-full max-w-md pt-0 backdrop-blur-xl bg-white/70 shadow-2xl rounded-2xl border border-white/40 transition-transform duration-300 hover:scale-[1.01]">
        <CardHeader className=" pb-2 bg-primary text-white rounded-t-lg shadow-md">
          <div className="flex justify-center items-center gap-2 mb-1 mt-3">
            <span className="text-2xl font-bold font-mono">POS</span>
          </div>
          <CardTitle className="text-white text-lg text-center font-semibold font-mono">
            Restaurant Management System
          </CardTitle>
        </CardHeader>

        <CardContent className=" px-6 pb-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-mono text-gray-700">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-mono text-gray-700">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-red-500 mb-3 font-mono text-sm">{message}</div>

            <Button
              type="submit"
              className="w-full mb-2 bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all cursor-pointer duration-300 hover:shadow-lg"
            >
              Sign In
            </Button>
            {/* <p className="text-center text-sm text-gray-600 font-mono">
              {"Don't have an account?"}
              <Link
                href={"/signup"}
                className="text-blue-600 hover:underline ml-1 font-mono "
              >
                Sign Up
              </Link>
            </p> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
