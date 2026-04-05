"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ExclamationTriangleIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { PeerprepLogo } from "./peerprep-logo";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!oldPassword || !newPassword) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:5001/api/users/update-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear tokens since they were revoked
      setTimeout(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("uid");
        window.location.href = "/login";
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex justify-center">
        <PeerprepLogo />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update your password</CardTitle>
          <CardDescription>
            Enter your current password and choose a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default">
                  <CheckCircledIcon className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Password updated successfully. Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="old-password">Current Password</FieldLabel>
                <Input
                  id="old-password"
                  type="password"
                  placeholder="Enter your current password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isLoading || success}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || success}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm New Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || success}
                />
              </Field>
              <FieldDescription className="text-xs text-gray-500">
                Password must be 8+ characters with uppercase, lowercase, and a
                number.
              </FieldDescription>
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading || success}
                  className="hover:bg-main-beige bg-main-beige w-full hover:opacity-90"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
