"use client";

import { useUser } from "../_authentication/useUser";
import Spinner from "./Spinner";
import React, { useEffect } from "react";
import { redirect } from "next/navigation";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 1. Load the authenticated user
  const { isAuthenticated, isLoading } = useUser();

  // 2. If there is NO authenticated user, redirect to the /login
  useEffect(
    function () {
      if (!isAuthenticated && !isLoading) redirect("/login");
    },
    [isAuthenticated, isLoading],
  );

  // 3. While loading, show a spinner
  if (isLoading)
    return (
      <div className="flex h-[100vh] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner />;
      </div>
    );

  // 4. If there IS a user, render the app

  if (isAuthenticated) return children;
}

export default ProtectedRoute;
