"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { UserIcon, ChevronDownIcon } from "lucide-react";

export function PublicHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = localStorage.getItem("accessToken") != null;

  useEffect(() => {
    // Close dropdown when clicking outside
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
        // Clear tokens from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("uid");

        // Update state and redirect
        // setIsLoggedIn(false);
        setShowDropdown(false);
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
      <div className="flex gap-4">
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Peerprep
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Features
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Learn more
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Dummy
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 transition duration-200 hover:opacity-70"
            >
              <UserIcon className="h-5 w-5" />
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white shadow-lg">
                <Link
                  href="/update-password"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-gray-100"
                >
                  Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="transition duration-200 hover:opacity-70"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="transition duration-200 hover:opacity-70"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
