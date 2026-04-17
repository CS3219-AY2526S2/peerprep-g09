"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { UserIcon, ChevronDownIcon } from "lucide-react";
import Image from "next/image";

export function PublicHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ displayName: "", photoURL: "", role: "" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          setIsLoggedIn(true);
          try {
            const response = await fetch("http://localhost:5001/api/users/get-profile", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!response.ok) throw new Error("Failed to fetch profile");
            const data = await response.json();
            setUser(data);
          } catch (e) {
            console.error("Failed to fetch profile:", e);
            // If token is invalid, clear it
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      }
    };
    fetchProfile();

    // Listen for storage changes to refetch profile
    window.addEventListener('storage', fetchProfile);
    return () => {
      window.removeEventListener('storage', fetchProfile);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      const uid = localStorage.getItem("uid");

      const response = await fetch("http://localhost:5001/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("uid");
        window.location.href = "/";
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="text-header-font bg-main-beige sticky top-0 flex h-20 justify-between px-6 py-6 text-shadow-md">
      <div className="flex gap-4 items-center">
        <Link href="/" className="text-xl font-bold transition duration-200 hover:opacity-70">
          Peerprep
        </Link>
        {isLoggedIn && user.role === 'Admin' && (
          <Link href="/admin" className="text-sm font-semibold transition duration-200 hover:opacity-70 bg-blue-500 text-white px-3 py-1 rounded-md">
            Admin Console
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <UserIcon className="h-8 w-8 rounded-full bg-gray-300 p-1" />
              )}
              <span className="font-semibold">{user.displayName}</span>
              <ChevronDownIcon className="h-5 w-5" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md px-4 py-2 text-white transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
