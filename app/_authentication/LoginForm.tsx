"use client";

import { useState } from "react";
import Button from "../_components/Button";
import Form from "../_components/Form";
import Input from "../_components/Input";
import FormRowVertical from "../_components/FormRowVertical";
import SpinnerMini from "../_components/SpinnerMini";
import { login } from "../_lib/actions";

function LoginForm() {
  const [email, setEmail] = useState("giorgi.gamertube@gmail.com");
  const [password, setPassword] = useState("giorgi205208");

  async function clientAction(FormData: FormData) {
    const email = FormData.get("email");
    const password = FormData.get("password");
    if (!email || !password) return;
    
    const res = await login(FormData);

    if (res.ok === true) {
      queryClient.setQueryData(["user"], user.user);
      router.replace("/authenticated/dashboard");
    }
  }

  return (
    <Form action={clientAction}>
      <FormRowVertical label="Email address">
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          disabled={isLoading}
        />
      </FormRowVertical>
      <FormRowVertical label="Password">
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          disabled={isLoading}
        />
      </FormRowVertical>
      <FormRowVertical>
        <Button size="large">
          {!isLoading ? `Login in` : <SpinnerMini />}
        </Button>
      </FormRowVertical>
    </Form>
  );
}

export default LoginForm;
