"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { UserIcon, ChevronDownIcon } from "lucide-react";

export function PublicHeader() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in and extract JWT claims
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setDisplayName(payload.displayName || "User");
          setPhotoURL(payload.photoURL || "");
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

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
        <Link href="/" className="text-xl font-bold transition duration-200 hover:opacity-70">
          Peerprep
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 transition duration-200 hover:opacity-70"
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{displayName}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white shadow-lg">
                <Link
                  href="/settings"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:bg-gray-100"
                >
                  Profile Settings
                </Link>
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
