export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/authenticated:path*"],
};
