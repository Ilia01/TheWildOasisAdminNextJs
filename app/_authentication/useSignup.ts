import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

interface OnSettled {
  onSettled: () => void;
}

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function signup(data: SignupData, { onSettled }: OnSettled) {
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Signup successful");
        localStorage.setItem('token', result.token);
        router.push('/authenticated/dashboard');
      } else {
        toast.error(result.message || "Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      onSettled();
    }
  }

  return { signup, isLoading };
}