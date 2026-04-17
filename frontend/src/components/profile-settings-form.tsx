"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";

export function ProfileSettingsForm() {
  const [displayName, setDisplayName] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Profile picture states
  const [profilePicSuccess, setProfilePicSuccess] = useState("");
  const [profilePicError, setProfilePicError] = useState("");

  // Display name states
  const [displayNameSuccess, setDisplayNameSuccess] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");

  useEffect(() => {
    // Load current display name from JWT custom claims
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.displayName) {
            setDisplayName(payload.displayName);
          }
          if (payload.photoURL) {
            setProfilePicPreview(payload.photoURL);
          }
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }
    }
  }, []);

  const handleDisplayNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setDisplayNameError("Display name cannot be empty.");
      return;
    }

    setIsLoading(true);
    setDisplayNameError("");
    setDisplayNameSuccess("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        "http://localhost:5001/api/users/update-displayName",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ displayName }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update display name.");
      }

      setDisplayNameSuccess("Display name updated successfully!");
      // Update JWT in localStorage
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      // refetch profile to update header
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setDisplayNameSuccess(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDisplayNameError(err.message);
      } else {
        setDisplayNameError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePicUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePic) {
      setProfilePicError("Please select a profile picture.");
      return;
    }

    setIsLoading(true);
    setProfilePicError("");
    setProfilePicSuccess("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("image", profilePic);

      const response = await fetch(
        "http://localhost:5001/api/users/update-profilePic",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload profile picture.");
      }

      setProfilePicSuccess("Profile picture updated successfully!");
      setProfilePic(null);
      // Update preview with the returned URL
      if (data.photoURL) {
        setProfilePicPreview(data.photoURL);
      }
      // Update JWT in localStorage if provided
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      // Clear success message after 3 seconds
      setTimeout(() => setProfilePicSuccess(""), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfilePicError(err.message);
      } else {
        setProfilePicError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Picture Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profilePicPreview && (
              <div className="flex justify-center">
                <img
                  src={profilePicPreview}
                  alt="Profile Preview"
                  className="h-32 w-32 rounded-full object-cover border"
                />
              </div>
            )}
            <form onSubmit={handleProfilePicUpload}>
              <FieldGroup>
                {profilePicError && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{profilePicError}</AlertDescription>
                  </Alert>
                )}
                {profilePicSuccess && (
                  <Alert>
                    <CheckCircledIcon className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{profilePicSuccess}</AlertDescription>
                  </Alert>
                )}
                <Field>
                  <FieldLabel htmlFor="profile-pic">
                    Choose Image
                  </FieldLabel>
                  <Input
                    id="profile-pic"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    disabled={isLoading}
                  />
                </Field>
                <Button
                  type="submit"
                  disabled={isLoading || !profilePic}
                  className="hover:bg-main-beige bg-main-beige hover:opacity-90"
                >
                  {isLoading ? "Uploading..." : "Upload Picture"}
                </Button>
              </FieldGroup>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Display Name Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>Update how your name appears in the app</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDisplayNameChange}>
            <FieldGroup>
              {displayNameError && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{displayNameError}</AlertDescription>
                </Alert>
              )}
              {displayNameSuccess && (
                <Alert>
                  <CheckCircledIcon className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{displayNameSuccess}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                />
              </Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="hover:bg-main-beige bg-main-beige hover:opacity-90"
              >
                {isLoading ? "Updating..." : "Update Display Name"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
