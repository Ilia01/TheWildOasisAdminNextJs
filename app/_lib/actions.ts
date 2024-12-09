"use server";
import { redirect } from "next/navigation";
import supabase, { supabaseUrl } from "./supabase";
import { signIn } from "./auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function editCabin(formData: FormData) {}
export async function createCabin(formData: FormData) {}

export async function signup(formData: FormData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        avatar: "",
      },
    },
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirectTo: "/authenticated/dashboard",
    });

    if (!res) throw new Error("Authentication failed");

    // revalidatePath("/", "layout");

    // redirect("/authenticated/dashboard");
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);

    return { error: error?.cause?.err?.message };
    // if (
    //   error instanceof Error && error.cause instanceof Error &&
    //   error.cause.err instanceof InvalidLoginError
    // ) {
    //   return { ok: false, error: "Incorrect username or password" };
    // } else {
    //   return { ok: false, error: "Failed to authenticate" };
    // }
  } finally {
  }
}

export async function getCurrentUser() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);

  return data?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function updateCurrentUser({ password, fullName, avatar }) {
  // 1. Update password OR fullName
  let updateData;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };

  const { data, error } = await supabase.auth.updateUser(updateData);

  if (error) throw new Error(error.message);
  if (!avatar) return data;

  // 2. Upload the avatar image
  const fileName = `avatar-${data.user.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (storageError) throw new Error(storageError.message);

  // 3. Upadet avatar in the user
  const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (error2) throw new Error(error2.message);
  return updatedUser;
}
