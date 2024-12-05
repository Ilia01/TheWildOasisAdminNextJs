"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout as logoutApi } from "../_services/apiAuth";
import { useRouter } from "next/navigation";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: logout, isLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.removeQueries();
      router.replace("/");
    },
  });

  return { logout, isLoading };
}
