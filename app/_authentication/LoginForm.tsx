"use client";

import { useState } from "react";
import Button from "../_components/Button";
import Form from "../_components/Form";
import Input from "../_components/Input";
import FormRowVertical from "../_components/FormRowVertical";
import SpinnerMini from "../_components/SpinnerMini";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

function LoginForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function clientAction(FormData: FormData) {
    const email = FormData.get("email");
    const password = FormData.get("password");
    if (!email || !password) {
      return toast.error("Both credentials are required");
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful");
        // Handle successful login, e.g., redirect to dashboard
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form action={clientAction}>
      <p>{JSON.stringify(session)}</p>
      <FormRowVertical label="Email address">
        <Input
          type="email"
          id="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </FormRowVertical>
      <FormRowVertical label="Password">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </FormRowVertical>
      <FormRowVertical>
        <Button size="large" disabled={isLoading}>
          {isLoading ? <SpinnerMini /> : "Login"}
        </Button>
      </FormRowVertical>
    </Form>
  );
}

export default LoginForm;